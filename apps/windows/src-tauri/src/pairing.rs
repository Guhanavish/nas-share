use futures_util::{SinkExt, StreamExt};
use rand::Rng;
use serde_json::json;
use sha2::{Digest, Sha256};
use std::time::{SystemTime, UNIX_EPOCH};
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

use crate::db::{Database, TrustedDevice};
use crate::identity::DeviceIdentity;

pub const CROCKFORD_ALPHABET: &[u8] = b"ABCDEFGHJKMNPQRSTVWXYZ23456789";

pub struct PairingManager;

impl PairingManager {
    /// Generates a CSPRNG 8-character Crockford Base32 pairing code formatted as XXXX-XXXX
    pub fn generate_code() -> String {
        let mut rng = rand::thread_rng();
        let mut chars = Vec::with_capacity(8);
        for _ in 0..8 {
            let idx = rng.gen_range(0..CROCKFORD_ALPHABET.len());
            chars.push(CROCKFORD_ALPHABET[idx] as char);
        }
        format!(
            "{}-{}",
            chars[0..4].iter().collect::<String>(),
            chars[4..8].iter().collect::<String>()
        )
    }

    /// Computes SHA-256 hex digest of the pairing code
    pub fn hash_code(code: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(code.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    /// Joins signaling room via Cloudflare worker and exchanges verified identities
    pub async fn join_and_pair(
        worker_base: &str,
        code: &str,
        identity: &DeviceIdentity,
        db: &Database,
    ) -> Result<String, String> {
        let normalized = code.replace('-', "").to_uppercase();
        let ws_url = format!("{}/ws?room={}", worker_base, normalized);

        let (ws_stream, _) = connect_async(&ws_url)
            .await
            .map_err(|e| format!("Signaling connection failed: {}", e))?;

        let (mut write, mut read) = ws_stream.split();

        let my_commit = Self::hash_code(code);
        let my_payload = json!({
            "type": "identity_exchange",
            "commit": my_commit,
            "device_id": identity.device_id,
            "device_name": identity.device_name,
            "pubkey": identity.pubkey
        });

        // Send identity packet
        write
            .send(Message::Text(my_payload.to_string()))
            .await
            .map_err(|e| format!("Failed to send signaling message: {}", e))?;

        // Wait for peer identity
        while let Some(msg) = read.next().await {
            let msg = msg.map_err(|e| format!("WS error: {}", e))?;
            if let Message::Text(text) = msg {
                if let Ok(val) = serde_json::from_str::<serde_json::Value>(&text) {
                    if val.get("type").and_then(|t| t.as_str()) == Some("identity_exchange") {
                        let peer_commit = val.get("commit").and_then(|c| c.as_str()).unwrap_or("");
                        let expected = Self::hash_code(code);

                        if peer_commit != expected {
                            return Err("Cryptographic commit verification failed!".to_string());
                        }

                        let peer_id = val.get("device_id").and_then(|i| i.as_str()).unwrap_or("");
                        let peer_name = val
                            .get("device_name")
                            .and_then(|n| n.as_str())
                            .unwrap_or("Remote Peer");
                        let peer_pubkey = val.get("pubkey").and_then(|p| p.as_str()).unwrap_or("");

                        let now = SystemTime::now()
                            .duration_since(UNIX_EPOCH)
                            .unwrap()
                            .as_millis() as i64;

                        db.add_trusted_device(TrustedDevice {
                            device_id: peer_id.to_string(),
                            device_name: peer_name.to_string(),
                            pubkey: peer_pubkey.to_string(),
                            pinned_at: now,
                            last_seen: Some(now),
                            is_revoked: false,
                        })?;

                        // Close gracefully
                        let _ = write.send(Message::Close(None)).await;
                        return Ok(peer_name.to_string());
                    }
                }
            }
        }

        Err("Signaling stream ended before pairing completed".to_string())
    }
}
