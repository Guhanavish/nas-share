// =============================================================================
// NAS Signaling — Hono Worker Entry
// =============================================================================
// Routes:
//   GET  /           → health check
//   GET  /ws?room=   → WebSocket upgrade → Durable Object Room
//   GET  /api/turn   → ICE server configuration
// Rate limit: 5 joins per minute per IP via in-memory sliding window.
// =============================================================================

import { Hono } from "hono";
import { Room } from "./room";

export { Room };

interface Env {
  ROOM: DurableObjectNamespace;
  STUN_URL: string;
  TURN_URL?: string;
  TURN_USERNAME?: string;
  TURN_CREDENTIAL?: string;
}

// ---------------------------------------------------------------------------
// Rate limiter — sliding window per IP, 5 joins/min
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let timestamps = rateLimitMap.get(ip) ?? [];
  timestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, timestamps);
    return false;
  }
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

// ---------------------------------------------------------------------------
// Validate room code — Crockford Base32, 8 chars, optional dash
// ---------------------------------------------------------------------------
const CROCKFORD_RE = /^[ABCDEFGHJKMNPQRSTVWXYZ23456789]{4}-?[ABCDEFGHJKMNPQRSTVWXYZ23456789]{4}$/;

function isValidRoomCode(code: string): boolean {
  return CROCKFORD_RE.test(code.toUpperCase());
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = new Hono<{ Bindings: Env }>();

// Health check
app.get("/", (c) => {
  return c.json({
    service: "nas-signaling",
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// WebSocket signaling — upgrade and forward to Room DO
app.get("/ws", async (c) => {
  const upgradeHeader = c.req.header("Upgrade");
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== "websocket") {
    return c.json({ error: "Expected WebSocket upgrade" }, 426);
  }

  const room = c.req.query("room");
  if (!room) {
    return c.json({ error: "Missing room query parameter" }, 400);
  }

  if (!isValidRoomCode(room)) {
    return c.json({ error: "Invalid room code format" }, 400);
  }

  // Rate limit by IP
  const ip = c.req.header("cf-connecting-ip") ?? c.req.raw.headers.get("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "client-ip";
  if (!checkRateLimit(ip)) {
    return c.json(
      { error: "Rate limited. Max 5 joins per minute." },
      429
    );
  }

  // Normalize room code (uppercase, no dash) to derive DO id
  const normalizedRoom = room.toUpperCase().replace("-", "");
  const doId = c.env.ROOM.idFromName(normalizedRoom);
  const stub = c.env.ROOM.get(doId);

  // Forward the request to the Durable Object
  const url = new URL(c.req.url);
  url.pathname = "/ws";
  const doRequest = new Request(url.toString(), {
    headers: c.req.raw.headers,
  });

  return stub.fetch(doRequest);
});

// ICE server configuration
app.get("/api/turn", (c) => {
  const iceServers: Array<{
    urls: string[];
    username?: string;
    credential?: string;
  }> = [];

  // Always include STUN
  if (c.env.STUN_URL) {
    iceServers.push({ urls: [c.env.STUN_URL] });
  } else {
    iceServers.push({ urls: ["stun:stun.l.google.com:19302"] });
  }

  // Include TURN if configured
  if (c.env.TURN_URL && c.env.TURN_USERNAME && c.env.TURN_CREDENTIAL) {
    iceServers.push({
      urls: [c.env.TURN_URL],
      username: c.env.TURN_USERNAME,
      credential: c.env.TURN_CREDENTIAL,
    });
  }

  return c.json({ ice_servers: iceServers });
});

// Catch-all 404
app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error(`[Worker] Error: ${err.message}`);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
