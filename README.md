# NAS Share — Device-as-NAS Ecosystem

> Every device is both **server** (shares folders) and **client** (browses others).
> Like Syncthing + LAN-Share + DropStream combined. No VPS, no accounts, $0 operating cost.

## Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│     Android Phone    │  LAN    │     Windows PC       │
│  ┌────────────────┐  │◄──────►│  ┌────────────────┐  │
│  │ Ktor HTTP :8743│  │ mDNS   │  │ Axum HTTP :8743│  │
│  │ FileProto API  │  │ direct │  │ FileProto API  │  │
│  └────────────────┘  │        │  └────────────────┘  │
│  ┌────────────────┐  │  WAN   │  ┌────────────────┐  │
│  │ WebRTC DC      │◄─┼──────►─┼─►│ WebRTC DC      │  │
│  │ DTLS encrypted │  │signaling│  │ DTLS encrypted │  │
│  └────────────────┘  │  only  │  └────────────────┘  │
└──────────────────────┘   │    └──────────────────────┘
                           │
                    ┌──────┴───────┐
                    │  Cloudflare  │
                    │  Worker+DO   │
                    │  (signaling) │
                    │  zero bytes  │
                    └──────────────┘
```

## Monorepo Structure

| Path | Description |
|------|-------------|
| `packages/protocol/` | Shared FileProto types (TS, Kotlin, Rust) + specification |
| `server/cloudflare/` | Signaling Worker + Durable Object Room |
| `apps/android/` | Android app (Kotlin + Jetpack Compose) |
| `apps/windows/` | Windows app (Tauri v2 + Rust + React) |
| `docs/` | Protocol docs, test checklist |

## Quick Start

### 1. Deploy Signaling Server
```bash
cd server/cloudflare
npm install
npx wrangler deploy
```

### 2. Build Android App
```bash
cd apps/android
./gradlew assembleDebug
# Install APK from app/build/outputs/apk/debug/
```

### 3. Build Windows App
```bash
cd apps/windows
npm install
cargo tauri build
# Installer at src-tauri/target/release/bundle/nsis/
```

## Features (Build Phases)

- [x] **P0** Protocol types + Cloudflare Worker signaling
- [x] **P1** LAN MVP: embedded servers, mDNS discovery, code pairing, browse/download/upload
- [ ] **P2** WAN: WebRTC DataChannel via Worker signaling
- [ ] **P3** Media streaming with seek + thumbnails
- [ ] **P4** Folder sync & backup with resume, conflicts keep-both

## Pairing Flow

1. Device A taps **Share** → generates `K7M2-Q9XD` code → opens WebSocket room
2. Device B enters code → joins room → exchanges ICE via Worker
3. DataChannel opens → exchange Ed25519 identities → save as trusted
4. Future reconnects: automatic via pinned fingerprint, no code needed

## Transport

| Context | Transport | Encryption |
|---------|-----------|------------|
| Same WiFi | Direct HTTP `http://peer:8743/api/...` | TLS optional (LAN) |
| Remote / NAT | WebRTC DataChannel | DTLS (mandatory) |
| Signaling only | WebSocket via Worker | TLS (wss://) |

**Zero file bytes ever touch the server.** Worker sees only room codes + SDP metadata.

## Security

- **Pairing**: Crockford Base32, CSPRNG, single-use, 5-min expiry, SHA256 commit verification
- **Identity**: Ed25519 per-device keypair, pinned on first trust
- **Files**: Path traversal guard, per-share ACL (read/write), filename validation
- **Transport**: DTLS for WAN, never relay file data through Worker

## Tech Stack

| Component | Stack |
|-----------|-------|
| Android | Kotlin, Jetpack Compose, Ktor, Room, OkHttp, ExoPlayer |
| Windows | Rust, Tauri v2, Axum, SQLite (sqlx), React, Tailwind |
| Worker | TypeScript, Hono, Cloudflare Durable Objects |
| Protocol | JSON + binary chunks (16-64KB), HTTP + WebRTC DC |

## License

MIT
