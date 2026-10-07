// =============================================================================
// NAS Signaling — Durable Object Room
// =============================================================================
// Holds max 2 WebSocket peers (initiator + joiner).
// Relays signaling JSON (offer/answer/ice/join/leave/ping).
// 5-min TTL via alarm. Never logs SDP content.
// =============================================================================

export interface RoomState {
  sockets: Map<string, WebSocket>;
  roles: Map<string, "a" | "b">;
  createdAt: number;
}

interface SignalingMessage {
  type: "offer" | "answer" | "ice" | "join" | "leave" | "ping" | "error";
  payload?: unknown;
}

export class Room implements DurableObject {
  private state: DurableObjectState;
  private socketA: WebSocket | null = null;
  private socketB: WebSocket | null = null;
  private created = false;

  constructor(state: DurableObjectState, _env: unknown) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    // Check capacity — max 2 peers
    if (this.socketA !== null && this.socketB !== null) {
      return new Response(
        JSON.stringify({ type: "error", payload: { code: "ROOM_FULL", message: "Room already has 2 peers" } }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    const pair = new WebSocketPair();
    const [client, server] = [pair[0], pair[1]];

    // Assign role
    let role: "a" | "b";
    if (this.socketA === null) {
      role = "a";
      this.socketA = server;
    } else {
      role = "b";
      this.socketB = server;
    }

    // Set alarm for 5-min TTL on first connection
    if (!this.created) {
      this.created = true;
      await this.state.storage.setAlarm(Date.now() + 5 * 60 * 1000);
    }

    this.state.acceptWebSocket(server, [role]);

    // Send join confirmation to the new peer
    const joinMsg: SignalingMessage = {
      type: "join",
      payload: { role: role === "a" ? "initiator" : "joiner" },
    };
    server.send(JSON.stringify(joinMsg));

    // Notify other peer that someone joined
    const otherSocket = role === "a" ? this.socketB : this.socketA;
    if (otherSocket) {
      try {
        otherSocket.send(
          JSON.stringify({
            type: "join",
            payload: { role: role === "a" ? "initiator" : "joiner" },
          } satisfies SignalingMessage)
        );
      } catch {
        // Other socket may be closed
      }
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    if (typeof data !== "string") {
      // Binary messages not expected for signaling
      return;
    }

    let msg: SignalingMessage;
    try {
      msg = JSON.parse(data) as SignalingMessage;
    } catch {
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { code: "INVALID_JSON", message: "Failed to parse message" },
        })
      );
      return;
    }

    // Validate message type
    const validTypes = new Set(["offer", "answer", "ice", "join", "leave", "ping"]);
    if (!validTypes.has(msg.type)) {
      ws.send(
        JSON.stringify({
          type: "error",
          payload: { code: "INVALID_TYPE", message: `Unknown type: ${msg.type}` },
        })
      );
      return;
    }

    // Handle ping locally
    if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "ping", payload: { ts: Date.now() } }));
      return;
    }

    // Log lifecycle events only (never SDP content)
    if (msg.type === "leave") {
      console.log(`[Room] Peer disconnected via leave message`);
    }

    // Relay to the other peer
    const otherSocket = ws === this.socketA ? this.socketB : this.socketA;
    if (otherSocket) {
      try {
        otherSocket.send(data);
      } catch {
        // Other socket may have closed
      }
    }
  }

  async webSocketClose(ws: WebSocket, code: number, _reason: string, _wasClean: boolean): Promise<void> {
    console.log(`[Room] WebSocket closed with code ${code}`);
    this.handleDisconnect(ws);
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    console.log(`[Room] WebSocket error`);
    this.handleDisconnect(ws);
  }

  private handleDisconnect(ws: WebSocket): void {
    const otherSocket = ws === this.socketA ? this.socketB : this.socketA;

    // Remove the disconnected socket
    if (ws === this.socketA) {
      this.socketA = null;
    } else if (ws === this.socketB) {
      this.socketB = null;
    }

    // Notify the other peer
    if (otherSocket) {
      try {
        otherSocket.send(JSON.stringify({ type: "leave" } satisfies SignalingMessage));
      } catch {
        // Already closed
      }
    }

    // If both gone, clean up
    if (this.socketA === null && this.socketB === null) {
      this.cleanup();
    }
  }

  async alarm(): Promise<void> {
    console.log(`[Room] TTL expired, closing room`);
    this.cleanup();
  }

  private cleanup(): void {
    const expiry: SignalingMessage = {
      type: "error",
      payload: { code: "ROOM_EXPIRED", message: "Room TTL expired" },
    };
    const msg = JSON.stringify(expiry);

    for (const sock of [this.socketA, this.socketB]) {
      if (sock) {
        try {
          sock.send(msg);
          sock.close(1000, "Room expired");
        } catch {
          // Already closed
        }
      }
    }
    this.socketA = null;
    this.socketB = null;
  }
}
