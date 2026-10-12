use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::fs::File;
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::Path;
use std::sync::Arc;
use tokio::sync::{oneshot, Mutex, RwLock};
use tokio_tungstenite::{connect_async, tungstenite::Message};

use crate::db::Database;
use crate::identity::DeviceIdentity;
use crate::protocol::FileEntry;
use crate::security::Security;

pub const CHUNK: u64 = 65536;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemoteDevice {
    pub device_id: String,
    pub device_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FileProtoOp {
    op: String,
    #[serde(default)]
    path: String,
    #[serde(default)]
    offset: u64,
    #[serde(default)]
    len: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct FileProtoResp {
    #[serde(default = "default_true")]
    ok: bool,
    entries: Option<Vec<RelayEntry>>,
    data_b64: Option<String>,
    #[serde(default)]
    total: i64,
    error: Option<String>,
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct RelayEntry {
    name: String,
    entry_type: String,
    size: u64,
    mtime: i64,
}

struct MeshInner {
    sink: Option<futures_util::stream::SplitSink<tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>, Message>>,
    pending: HashMap<String, oneshot::Sender<Value>>,
    running: bool,
}

/// Persistent relay mesh: presence heartbeat + FileProto tunnel.
/// Same protocol as Android RemoteMesh — both sides interoperate.
#[derive(Clone)]
pub struct RelayMesh {
    inner: Arc<Mutex<MeshInner>>,
    worker_url: Arc<RwLock<String>>,
    identity: Arc<RwLock<Option<DeviceIdentity>>>,
    db: Arc<RwLock<Option<Database>>>,
}

impl RelayMesh {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(Mutex::new(MeshInner {
                sink: None,
                pending: HashMap::new(),
                running: false,
            })),
            worker_url: Arc::new(RwLock::new(String::new())),
            identity: Arc::new(RwLock::new(None)),
            db: Arc::new(RwLock::new(None)),
        }
    }

    pub async fn start(&self, worker_https_url: String, identity: DeviceIdentity, db: Database) {
        *self.worker_url.write().await = worker_https_url;
        *self.identity.write().await = Some(identity);
        *self.db.write().await = Some(db);
        {
            let mut inner = self.inner.lock().await;
            if inner.running {
                return;
            }
            inner.running = true;
        }
        let this = self.clone();
        tauri::async_runtime::spawn(async move { this.connect_loop().await });
    }

    pub async fn stop(&self) {
        let mut inner = self.inner.lock().await;
        inner.running = false;
        inner.sink = None;
        for (_, tx) in inner.pending.drain() {
            let _ = tx.send(Value::Null);
        }
    }

    /// Stored worker URL may be wss:// (pairing) — normalize to https://.
    fn https_base(worker_url: &str) -> String {
        let base = worker_url.trim_end_matches('/');
        if let Some(rest) = base.strip_prefix("wss://") {
            format!("https://{}", rest)
        } else if let Some(rest) = base.strip_prefix("ws://") {
            format!("http://{}", rest)
        } else {
            base.to_string()
        }
    }

    fn presence_ws_url(worker_url: &str, device_id: &str) -> Option<String> {
        let base = Self::https_base(worker_url);
        let ws_base = if let Some(rest) = base.strip_prefix("https://") {
            format!("wss://{}", rest)
        } else if let Some(rest) = base.strip_prefix("http://") {
            format!("ws://{}", rest)
        } else {
            return None;
        };
        Some(format!("{}/presence/ws?device={}", ws_base, device_id))
    }

    async fn connect_loop(&self) {
        let mut backoff = std::time::Duration::from_secs(5);
        loop {
            {
                let inner = self.inner.lock().await;
                if !inner.running {
                    break;
                }
            }
            if self.connect_once().await.is_err() {
                let this = self.clone();
                let inner = this.inner.lock().await;
                if !inner.running {
                    break;
                }
                drop(inner);
                tokio::time::sleep(backoff).await;
                backoff = std::cmp::min(backoff * 2, std::time::Duration::from_secs(60));
            } else {
                backoff = std::time::Duration::from_secs(5);
            }
        }
    }

    async fn connect_once(&self) -> Result<(), String> {
        let (worker_url, identity) = {
            let w = self.worker_url.read().await.clone();
            let id = self.identity.read().await.clone().ok_or("No identity")?;
            (w, id)
        };
        let url = Self::presence_ws_url(&worker_url, &identity.device_id)
            .ok_or("Bad worker URL")?;
        let (ws, _) = connect_async(&url)
            .await
            .map_err(|e| format!("Presence connect failed: {}", e))?;
        let (sink, mut stream) = ws.split();

        {
            let mut inner = self.inner.lock().await;
            inner.sink = Some(sink);
        }

        // hello
        self.send_raw(&serde_json::json!({
            "type": "hello",
            "device_id": identity.device_id,
            "device_name": identity.device_name,
        }))
        .await;

        let this = self.clone();
        // ping loop
        tauri::async_runtime::spawn(async move {
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(30)).await;
                if this.send_raw(&serde_json::json!({ "type": "ping" })).await.is_err() {
                    break;
                }
            }
        });

        while let Some(msg) = stream.next().await {
            let text = match msg {
                Ok(Message::Text(t)) => t.to_string(),
                Ok(Message::Close(_)) | Err(_) => break,
                _ => continue,
            };
            self.handle_message(&text).await;
        }

        // connection dropped — fail pending, clear sink
        let mut inner = self.inner.lock().await;
        inner.sink = None;
        for (_, tx) in inner.pending.drain() {
            let _ = tx.send(Value::Null);
        }
        Err("Socket closed".to_string())
    }

    async fn send_raw(&self, v: &Value) -> Result<(), String> {
        let mut inner = self.inner.lock().await;
        match inner.sink.as_mut() {
            Some(sink) => sink
                .send(Message::Text(v.to_string().into()))
                .await
                .map_err(|e| e.to_string()),
            None => Err("No socket".to_string()),
        }
    }

    async fn handle_message(&self, text: &str) {
        let root: Value = match serde_json::from_str(text) {
            Ok(v) => v,
            Err(_) => return,
        };
        let kind = root.get("type").and_then(|v| v.as_str()).unwrap_or("");
        match kind {
            "recv" => {
                let msg_id = root.get("msg_id").and_then(|v| v.as_str()).map(|s| s.to_string());
                // 1) Is it a reply to one of our requests?
                if let Some(id) = msg_id.clone() {
                    let tx = { self.inner.lock().await.pending.remove(&id) };
                    if let Some(tx) = tx {
                        let _ = tx.send(root.clone());
                        return;
                    }
                }
                // 2) Otherwise: incoming fileproto request — answer it.
                let msg_kind = root.get("kind").and_then(|v| v.as_str()).unwrap_or("");
                if msg_kind != "fileproto" {
                    return;
                }
                let from = root.get("from").and_then(|v| v.as_str()).unwrap_or("");
                let my_id = self
                    .identity
                    .read()
                    .await
                    .clone()
                    .map(|i| i.device_id)
                    .unwrap_or_default();
                if from.is_empty() || from == my_id {
                    return;
                }
                let op: FileProtoOp = match root
                    .get("payload")
                    .cloned()
                    .map(serde_json::from_value)
                    .transpose()
                {
                    Ok(Some(op)) => op,
                    _ => return,
                };
                let resp = self.answer_request(&op).await;
                let reply = serde_json::json!({
                    "type": "send",
                    "to": from,
                    "msg_id": msg_id.unwrap_or_else(|| uuid::Uuid::new_v4().to_string()),
                    "kind": "fileproto-resp",
                    "payload": resp,
                });
                let _ = self.send_raw(&reply).await;
            }
            "error" => {
                let msg_id = root
                    .get("payload")
                    .and_then(|p| p.get("msg_id"))
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string());
                if let Some(id) = msg_id {
                    let tx = { self.inner.lock().await.pending.remove(&id) };
                    if let Some(tx) = tx {
                        let _ = tx.send(root.clone());
                    }
                }
            }
            _ => {}
        }
    }

    async fn request(&self, to: &str, op: &FileProtoOp) -> Result<FileProtoResp, String> {
        let msg_id = uuid::Uuid::new_v4().to_string();
        let (tx, rx) = oneshot::channel();
        {
            let mut inner = self.inner.lock().await;
            if inner.sink.is_none() {
                return Err("Relay offline — presence socket not connected".to_string());
            }
            inner.pending.insert(msg_id.clone(), tx);
        }
        let env = serde_json::json!({
            "type": "send",
            "to": to,
            "msg_id": msg_id,
            "kind": "fileproto",
            "payload": op,
        });
        if self.send_raw(&env).await.is_err() {
            self.inner.lock().await.pending.remove(&msg_id);
            return Err("Relay send failed".to_string());
        }
        let raw = tokio::time::timeout(std::time::Duration::from_secs(30), rx)
            .await
            .map_err(|_| "Relay timeout — peer may be offline".to_string())?
            .map_err(|_| "Relay request cancelled".to_string())?;
        if raw.is_null() {
            return Err("Relay disconnected".to_string());
        }
        // Reply arrives as error envelope (PEER_OFFLINE) or recv payload wrapper.
        if raw.get("type").and_then(|v| v.as_str()) == Some("error") {
            let code = raw
                .get("payload")
                .and_then(|p| p.get("code"))
                .and_then(|v| v.as_str())
                .unwrap_or("Relay error");
            return Err(code.to_string());
        }
        // Direct FileProtoResp (responder replies inline in payload of recv? No:
        // our own request's reply comes back as a fresh recv whose payload IS the resp).
        let payload = raw.get("payload").cloned().unwrap_or(Value::Null);
        let resp: FileProtoResp =
            serde_json::from_value(payload).map_err(|e| format!("Bad relay reply: {}", e))?;
        if !resp.ok {
            return Err(resp.error.unwrap_or("Remote failed".to_string()));
        }
        Ok(resp)
    }

    async fn answer_request(&self, op: &FileProtoOp) -> FileProtoResp {
        match op.op.as_str() {
            "list" => match self.local_list(&op.path).await {
                Ok(entries) => FileProtoResp {
                    ok: true,
                    entries: Some(entries),
                    data_b64: None,
                    total: -1,
                    error: None,
                },
                Err(e) => FileProtoResp {
                    ok: false,
                    entries: None,
                    data_b64: None,
                    total: -1,
                    error: Some(e),
                },
            },
            "read" => match self.local_read(&op.path, op.offset).await {
                Ok((b64, total)) => FileProtoResp {
                    ok: true,
                    entries: None,
                    data_b64: Some(b64),
                    total: total as i64,
                    error: None,
                },
                Err(e) => FileProtoResp {
                    ok: false,
                    entries: None,
                    data_b64: None,
                    total: -1,
                    error: Some(e),
                },
            },
            _ => FileProtoResp {
                ok: false,
                entries: None,
                data_b64: None,
                total: -1,
                error: Some("Unknown op".to_string()),
            },
        }
    }

    async fn local_list(&self, path: &str) -> Result<Vec<RelayEntry>, String> {
        let db = self.db.read().await.clone().ok_or("No DB")?;
        let folders = tokio::task::spawn_blocking(move || db.get_shared_folders())
            .await
            .map_err(|e| e.to_string())?
            .map_err(|e| e)?;
        let target = Self::resolve(&folders, path, false)?;
        if !target.exists() || !target.is_dir() {
            return Err("NOT_FOUND".to_string());
        }
        let mut out = Vec::new();
        let rd = std::fs::read_dir(&target).map_err(|_| "BUSY".to_string())?;
        for e in rd.flatten() {
            let meta = match e.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };
            let is_dir = meta.is_dir();
            out.push(RelayEntry {
                name: e.file_name().to_string_lossy().to_string(),
                entry_type: if is_dir { "dir".to_string() } else { "file".to_string() },
                size: if is_dir { 0 } else { meta.len() },
                mtime: meta
                    .modified()
                    .ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_millis() as i64)
                    .unwrap_or(0),
            });
        }
        out.sort_by(|a, b| {
            (a.entry_type == "file")
                .cmp(&(b.entry_type == "file"))
                .then(a.name.cmp(&b.name))
        });
        Ok(out)
    }

    async fn local_read(&self, path: &str, offset: u64) -> Result<(String, u64), String> {
        let db = self.db.read().await.clone().ok_or("No DB")?;
        let folders = tokio::task::spawn_blocking(move || db.get_shared_folders())
            .await
            .map_err(|e| e.to_string())?
            .map_err(|e| e)?;
        let target = Self::resolve(&folders, path, false)?;
        if !target.is_file() {
            return Err("NOT_FOUND".to_string());
        }
        let (b64, total) = tokio::task::spawn_blocking(move || -> Result<(String, u64), String> {
            let mut f = File::open(&target).map_err(|_| "BUSY".to_string())?;
            let total = f.metadata().map(|m| m.len()).unwrap_or(0);
            if offset >= total {
                return Err("DENIED".to_string());
            }
            f.seek(SeekFrom::Start(offset)).map_err(|_| "BUSY".to_string())?;
            let mut buf = vec![0u8; CHUNK as usize];
            let n = f.read(&mut buf).map_err(|_| "BUSY".to_string())?;
            if n == 0 {
                return Err("BUSY".to_string());
            }
            buf.truncate(n);
            Ok((B64.encode(&buf), total))
        })
        .await
        .map_err(|e| e.to_string())??;
        Ok((b64, total))
    }

    fn resolve(
        folders: &[crate::db::SharedFolder],
        requested: &str,
        require_write: bool,
    ) -> Result<std::path::PathBuf, String> {
        for folder in folders.iter().filter(|f| f.enabled) {
            if require_write && folder.acl != "READWRITE" {
                continue;
            }
            if Security::sanitize_path(Path::new(&folder.path), requested).is_ok() {
                return Security::sanitize_path(Path::new(&folder.path), requested);
            }
        }
        Err("DENIED".to_string())
    }

    // -- Outgoing FileProto over relay --

    pub async fn list_remote(&self, device_id: &str, path: &str) -> Result<Vec<FileEntry>, String> {
        let resp = self
            .request(
                device_id,
                &FileProtoOp {
                    op: "list".to_string(),
                    path: path.to_string(),
                    offset: 0,
                    len: 0,
                },
            )
            .await?;
        Ok(resp
            .entries
            .unwrap_or_default()
            .into_iter()
            .map(|e| FileEntry {
                name: e.name,
                entry_type: e.entry_type,
                size: e.size,
                mtime: e.mtime,
                hash: None,
            })
            .collect())
    }

    pub async fn download_remote(
        &self,
        device_id: &str,
        remote_path: &str,
        local_path: &std::path::Path,
    ) -> Result<(), String> {
        if let Some(parent) = local_path.parent() {
            std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
        let mut file = std::fs::File::create(local_path).map_err(|e| e.to_string())?;
        let mut offset: u64 = 0;
        loop {
            let resp = self
                .request(
                    device_id,
                    &FileProtoOp {
                        op: "read".to_string(),
                        path: remote_path.to_string(),
                        offset,
                        len: CHUNK,
                    },
                )
                .await?;
            let b64 = resp.data_b64.ok_or("Missing chunk data")?;
            let bytes = B64.decode(&b64).map_err(|e| e.to_string())?;
            if bytes.is_empty() {
                break;
            }
            file.write_all(&bytes).map_err(|e| e.to_string())?;
            offset += bytes.len() as u64;
            if resp.total >= 0 && offset >= resp.total as u64 {
                break;
            }
        }
        Ok(())
    }

    pub async fn fetch_online(&self) -> Vec<RemoteDevice> {
        let url = {
            let w = self.worker_url.read().await.clone();
            if w.is_empty() {
                return Vec::new();
            }
            format!("{}/api/presence", Self::https_base(&w))
        };
        let body: Value = match reqwest::get(&url).await {
            Ok(r) => match r.json().await {
                Ok(v) => v,
                Err(_) => return Vec::new(),
            },
            Err(_) => return Vec::new(),
        };
        body.get("devices")
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|d| {
                        Some(RemoteDevice {
                            device_id: d.get("device_id")?.as_str()?.to_string(),
                            device_name: d
                                .get("device_name")?
                                .as_str()
                                .unwrap_or("Device")
                                .to_string(),
                        })
                    })
                    .collect()
            })
            .unwrap_or_default()
    }
}
