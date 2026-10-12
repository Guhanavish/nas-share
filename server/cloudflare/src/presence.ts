// =============================================================================
// NAS Presence + Relay — Durable Object (singleton: id "global")
// =============================================================================
// Two jobs, one socket per device:
//
//  1. Presence: device opens WS /presence/ws?device=<id>, sends hello + ping
//     every 30s. GET /api/presence lists online device ids so Pool knows who
//     is reachable without LAN.
//
//  2. Relay fallback: {type:"send", to, msg_id, kind, payload} is forwarded to
//     the target's socket as {type:"recv", from, msg_id, kind, payload}.
//     Used for FileProto (list/read) when P2P is unavailable. Payloads are
//     capped at 512KB per message; file reads stream in 64KB round-trips.
//     File bytes are forwarded, never stored.
//
// Rate limit: 60 sends/min per socket. Stale sockets (>90s without ping)
// swept by a 30s alarm.
// =============================================================================

interface PresenceSocket {
  ws: WebSocket;
  deviceId: string;
  deviceName: string;
  lastPing: number;
}

interface SendMessage {
  type: "send";
  to: string;
  msg_id: string;
  kind: string;
  payload?: unknown;
}

const MAX_PAYLOAD_BYTES = 512 * 1024;
const PING_TIMEOUT_MS = 90_000;
const SENDS_PER_MINUTE = 60;

export class Presence implements DurableObject {
  private state: DurableObjectState;
  private sockets = new Map<string, PresenceSocket>();
  private sendTimestamps = new Map<string, number[]>();
  private alarmSet = false;

  constructor(state: DurableObjectState, _env: unknown) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Online device list (called by Pool via Worker /api/presence)
    if (url.pathname === "/online" && request.method === "GET") {
      this.sweep();
      return new Response(
        JSON.stringify({
          devices: [...this.sockets.values()].map((s) => ({
            device_id: s.deviceId,
            device_name: s.deviceName,
          })),
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // WebSocket attach
    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return new Response("Expected WebSocket", { status: 426 });
      }
      const device = url.searchParams.get("device") ?? "";
      if (!/^[A-Za-z0-9_-]{1,64}$/.test(device)) {
        return new Response(
          JSON.stringify({ error: "Invalid device id" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const pair = new WebSocketPair();
      const [client, server] = [pair[0], pair[1]];
      this.state.acceptWebSocket(server, [device]);

      if (!this.alarmSet) {
        this.alarmSet = true;
        await this.state.storage.setAlarm(Date.now() + 30_000);
      }

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response("Not found", { status: 404 });
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    if (typeof data !== "string") return;
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(data) as Record<string, unknown>;
    } catch {
      ws.send(JSON.stringify({ type: "error", payload: { code: "INVALID_JSON" } }));
      return;
    }

    const tags = this.state.getTags(ws);
    const attachId = tags.length > 0 ? tags[0] : "";

    switch (msg.type) {
      case "hello": {
        const deviceId = String(msg.device_id ?? attachId);
        const deviceName = String(msg.device_name ?? deviceId);
        // Replace any stale socket for this device
        const old = this.sockets.get(deviceId);
        if (old && old.ws !== ws) {
          try { old.ws.close(1000, "Replaced"); } catch { /* gone */ }
        }
        this.sockets.set(deviceId, {
          ws,
          deviceId,
          deviceName,
          lastPing: Date.now(),
        });
        ws.send(JSON.stringify({ type: "hello_ack", payload: { ok: true } }));
        break;
      }

      case "ping": {
        const entry = this.sockets.get(attachId);
        if (entry && entry.ws === ws) entry.lastPing = Date.now();
        // Also accept pings arriving before hello (register lazily)
        if (!entry) {
          this.sockets.set(attachId, {
            ws,
            deviceId: attachId,
            deviceName: String(msg.device_name ?? attachId),
            lastPing: Date.now(),
          });
        }
        ws.send(JSON.stringify({ type: "pong", payload: { ts: Date.now() } }));
        break;
      }

      case "send": {
        const from = attachId;
        const to = String(msg.to ?? "");
        const target = this.sockets.get(to);
        if (!target) {
          ws.send(JSON.stringify({
            type: "error",
            payload: { code: "PEER_OFFLINE", msg_id: msg.msg_id ?? null },
          }));
          return;
        }
        // Per-sender rate limit
        const now = Date.now();
        const stamps = (this.sendTimestamps.get(from) ?? []).filter((t) => now - t < 60_000);
        if (stamps.length >= SENDS_PER_MINUTE) {
          ws.send(JSON.stringify({
            type: "error",
            payload: { code: "RATE_LIMITED", msg_id: msg.msg_id ?? null },
          }));
          return;
        }
        stamps.push(now);
        this.sendTimestamps.set(from, stamps);

        const payloadStr = JSON.stringify(msg.payload ?? null);
        if (payloadStr.length > MAX_PAYLOAD_BYTES) {
          ws.send(JSON.stringify({
            type: "error",
            payload: { code: "PAYLOAD_TOO_LARGE", msg_id: msg.msg_id ?? null },
          }));
          return;
        }

        const fwd = {
          type: "recv",
          from,
          msg_id: msg.msg_id ?? null,
          kind: msg.kind ?? "generic",
          payload: msg.payload ?? null,
        } as unknown as SendMessage;
        try {
          target.ws.send(JSON.stringify(fwd));
        } catch {
          this.sockets.delete(to);
          ws.send(JSON.stringify({
            type: "error",
            payload: { code: "PEER_OFFLINE", msg_id: msg.msg_id ?? null },
          }));
        }
        break;
      }

      default:
        ws.send(JSON.stringify({
          type: "error",
          payload: { code: "INVALID_TYPE", message: `Unknown type: ${msg.type}` },
        }));
    }
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    this.removeSocket(ws);
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    this.removeSocket(ws);
  }

  async alarm(): Promise<void> {
    this.sweep();
    // Keep sweeping while anyone is attached
    if (this.sockets.size > 0) {
      await this.state.storage.setAlarm(Date.now() + 30_000);
    } else {
      this.alarmSet = false;
    }
  }

  private removeSocket(ws: WebSocket): void {
    for (const [id, entry] of this.sockets) {
      if (entry.ws === ws) {
        this.sockets.delete(id);
        break;
      }
    }
  }

  private sweep(): void {
    const now = Date.now();
    for (const [id, entry] of this.sockets) {
      if (now - entry.lastPing > PING_TIMEOUT_MS) {
        try { entry.ws.close(1000, "Stale"); } catch { /* gone */ }
        this.sockets.delete(id);
      }
    }
  }
}
