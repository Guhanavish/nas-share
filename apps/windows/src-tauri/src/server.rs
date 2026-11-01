use axum::{
    body::Body,
    extract::{Query, State},
    http::{header, HeaderMap, StatusCode},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs::{self, File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::db::Database;
use crate::identity::DeviceIdentity;
use crate::security::Security;

#[derive(Clone)]
pub struct ServerState {
    pub db: Database,
    pub identity: DeviceIdentity,
}

#[derive(Deserialize)]
pub struct ListQuery {
    pub path: Option<String>,
}

#[derive(Deserialize)]
pub struct ReadQuery {
    pub path: String,
    pub offset: Option<u64>,
    pub len: Option<u64>,
}

#[derive(Deserialize)]
pub struct WriteQuery {
    pub path: String,
    pub offset: Option<u64>,
}

#[derive(Serialize)]
pub struct FileEntryJson {
    pub name: String,
    pub entry_type: String, // "file" or "dir"
    pub size: u64,
    pub mtime: i64,
}

#[derive(Serialize)]
pub struct SyncManifestItem {
    pub path: String,
    pub size: u64,
    pub mtime: i64,
    pub sha256: String,
}

pub struct EmbeddedServer;

impl EmbeddedServer {
    pub async fn run(port: u16, db: Database, identity: DeviceIdentity) -> Result<(), String> {
        let state = Arc::new(ServerState { db, identity });

        let cors = CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any);

        let app = Router::new()
            .route("/api/info", get(handle_info))
            .route("/api/list", get(handle_list))
            .route("/api/stat", get(handle_stat))
            .route("/api/read", get(handle_read))
            .route("/api/write", post(handle_write))
            .route("/api/thumb", get(handle_thumb))
            .route("/api/sync_manifest", get(handle_sync_manifest))
            .route("/api/pair", post(handle_pair))
            .layer(cors)
            .with_state(state);

        let addr = SocketAddr::from(([0, 0, 0, 0], port));
        let listener = tokio::net::TcpListener::bind(addr)
            .await
            .map_err(|e| format!("Failed to bind port {}: {}", port, e))?;

        crate::log_line(&format!("embedded server listening on :{}", port));

        axum::serve(listener, app)
            .await
            .map_err(|e| format!("Axum server error: {}", e))
    }
}

// -----------------------------------------------------------------------------
// Route Handlers
// -----------------------------------------------------------------------------

async fn handle_info(State(state): State<Arc<ServerState>>) -> impl IntoResponse {
    Json(serde_json::json!({
        "device_id": state.identity.device_id,
        "device_name": state.identity.device_name,
        "version": "0.1.0"
    }))
}

async fn handle_list(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let req_path = query.path.unwrap_or_else(|| "/".to_string());
    let cleaned = req_path.trim_matches(|c| c == '/' || c == '\\');

    let folders = state.db.get_shared_folders().unwrap_or_default();
    let enabled_folders: Vec<_> = folders.into_iter().filter(|f| f.enabled).collect();

    // Virtual root: list enabled shared folders
    if cleaned.is_empty() || req_path == "/" {
        let mut entries = Vec::new();
        for f in enabled_folders {
            let mtime = fs::metadata(&f.path)
                .ok()
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_millis() as i64)
                .unwrap_or(0);
            entries.push(FileEntryJson {
                name: f.label,
                entry_type: "dir".to_string(),
                size: 0,
                mtime,
            });
        }
        return Ok(Json(serde_json::json!({
            "ok": true,
            "entries": entries
        })));
    }

    let target = resolve_safe_path(&state.db, &req_path, false)?;

    if !target.exists() || !target.is_dir() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"ok": false, "code": "NOT_FOUND"})),
        ));
    }

    let mut entries = Vec::new();
    if let Ok(read_dir) = fs::read_dir(&target) {
        for entry in read_dir.flatten() {
            let meta = match entry.metadata() {
                Ok(m) => m,
                Err(_) => continue,
            };
            let is_dir = meta.is_dir();
            let size = if is_dir { 0 } else { meta.len() };
            let mtime = meta
                .modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_millis() as i64)
                .unwrap_or(0);

            entries.push(FileEntryJson {
                name: entry.file_name().to_string_lossy().to_string(),
                entry_type: if is_dir { "dir".to_string() } else { "file".to_string() },
                size,
                mtime,
            });
        }
    }

    // Sort folders first, then alphabetically
    entries.sort_by(|a, b| {
        let a_is_file = a.entry_type == "file";
        let b_is_file = b.entry_type == "file";
        a_is_file.cmp(&b_is_file).then(a.name.cmp(&b.name))
    });

    Ok(Json(serde_json::json!({
        "ok": true,
        "entries": entries
    })))
}

async fn handle_stat(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let req_path = query.path.unwrap_or_else(|| "/".to_string());
    let target = resolve_safe_path(&state.db, &req_path, false)?;

    if !target.exists() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"ok": false, "code": "NOT_FOUND"})),
        ));
    }

    let meta = fs::metadata(&target).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "BUSY"})),
        )
    })?;

    let is_dir = meta.is_dir();
    let name = target
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();

    Ok(Json(serde_json::json!({
        "ok": true,
        "meta": {
            "name": name,
            "entry_type": if is_dir { "dir" } else { "file" },
            "size": if is_dir { 0 } else { meta.len() },
            "mtime": meta.modified().ok().and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok()).map(|d| d.as_millis() as i64).unwrap_or(0)
        }
    })))
}

async fn handle_read(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<ReadQuery>,
    headers: HeaderMap,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let target = resolve_safe_path(&state.db, &query.path, false)?;

    if !target.is_file() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"ok": false, "code": "NOT_FOUND"})),
        ));
    }

    let mut file = File::open(&target).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "BUSY"})),
        )
    })?;

    let total_size = file.metadata().map(|m| m.len()).unwrap_or(0);
    let mut offset = query.offset.unwrap_or(0);
    let mut len = query.len.unwrap_or(total_size.saturating_sub(offset));

    // Also support standard Range header: bytes=start-end
    if let Some(range_val) = headers.get(header::RANGE).and_then(|v| v.to_str().ok()) {
        if let Some(stripped) = range_val.strip_prefix("bytes=") {
            let parts: Vec<&str> = stripped.split('-').collect();
            if let Ok(start) = parts[0].parse::<u64>() {
                offset = start;
                if parts.len() > 1 && !parts[1].is_empty() {
                    if let Ok(end) = parts[1].parse::<u64>() {
                        len = end.saturating_sub(start) + 1;
                    }
                }
            }
        }
    }

    if offset >= total_size {
        return Err((
            StatusCode::RANGE_NOT_SATISFIABLE,
            Json(serde_json::json!({"ok": false, "code": "DENIED"})),
        ));
    }

    file.seek(SeekFrom::Start(offset)).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "BUSY"})),
        )
    })?;

    let actual_len = std::cmp::min(len, total_size - offset);
    let mut buffer = vec![0u8; actual_len as usize];
    file.read_exact(&mut buffer).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "BUSY"})),
        )
    })?;

    let content_range = format!("bytes {}-{}/{}", offset, offset + actual_len - 1, total_size);

    let mut response = Response::new(Body::from(buffer));
    let status = if offset > 0 || actual_len < total_size {
        StatusCode::PARTIAL_CONTENT
    } else {
        StatusCode::OK
    };
    *response.status_mut() = status;

    let headers_mut = response.headers_mut();
    headers_mut.insert(header::ACCEPT_RANGES, "bytes".parse().unwrap());
    headers_mut.insert(header::CONTENT_LENGTH, actual_len.to_string().parse().unwrap());
    headers_mut.insert(header::CONTENT_RANGE, content_range.parse().unwrap());
    headers_mut.insert(
        header::CONTENT_TYPE,
        "application/octet-stream".parse().unwrap(),
    );

    Ok(response)
}

async fn handle_write(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<WriteQuery>,
    body: axum::body::Bytes,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let target = resolve_safe_path(&state.db, &query.path, true)?;

    if let Some(parent) = target.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let offset = query.offset.unwrap_or(0);
    let mut file = OpenOptions::new()
        .create(true)
        .write(true)
        .open(&target)
        .map_err(|_| {
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(serde_json::json!({"ok": false, "code": "BUSY"})),
            )
        })?;

    file.seek(SeekFrom::Start(offset)).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "BUSY"})),
        )
    })?;

    file.write_all(&body).map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "BUSY"})),
        )
    })?;

    Ok(Json(serde_json::json!({
        "type": "write_ack",
        "ok": true,
        "bytes_written": body.len()
    })))
}

async fn handle_thumb(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<ListQuery>,
) -> Result<Response, (StatusCode, Json<serde_json::Value>)> {
    let req_path = query.path.unwrap_or_default();
    let target = resolve_safe_path(&state.db, &req_path, false)?;

    if !target.is_file() {
        return Err((
            StatusCode::NOT_FOUND,
            Json(serde_json::json!({"ok": false, "code": "NOT_FOUND"})),
        ));
    }

    // Return dummy 1x1 JPEG for thumbs when image decoder not active
    let jpeg_bytes = [
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00,
        0x60, 0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0xFF, 0xD9,
    ];

    let mut response = Response::new(Body::from(jpeg_bytes.to_vec()));
    response
        .headers_mut()
        .insert(header::CONTENT_TYPE, "image/jpeg".parse().unwrap());
    Ok(response)
}

#[derive(Deserialize)]
pub struct DirectPairRequest {
    pub code: String,
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String,
}

async fn handle_pair(
    State(state): State<Arc<ServerState>>,
    Json(payload): Json<DirectPairRequest>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as i64;

    let trusted = crate::db::TrustedDevice {
        device_id: payload.device_id.clone(),
        device_name: payload.device_name.clone(),
        pubkey: payload.pubkey.clone(),
        pinned_at: now,
        last_seen: Some(now),
        is_revoked: false,
    };

    if let Err(e) = state.db.add_trusted_device(trusted) {
        return Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "DB_ERROR", "message": e})),
        ));
    }

    crate::log_line(&format!("Direct LAN paired with device: {} ({})", payload.device_name, payload.device_id));

    Ok(Json(serde_json::json!({
        "ok": true,
        "device_id": state.identity.device_id,
        "device_name": state.identity.device_name,
        "pubkey": state.identity.pubkey
    })))
}

// -----------------------------------------------------------------------------
// Path Resolution Helper
// -----------------------------------------------------------------------------
fn resolve_safe_path(
    db: &Database,
    requested: &str,
    require_write: bool,
) -> Result<PathBuf, (StatusCode, Json<serde_json::Value>)> {
    let folders = db.get_shared_folders().map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(serde_json::json!({"ok": false, "code": "BUSY"})),
        )
    })?;

    let enabled_folders: Vec<_> = folders.into_iter().filter(|f| f.enabled).collect();
    if enabled_folders.is_empty() {
        return Err((
            StatusCode::FORBIDDEN,
            Json(serde_json::json!({"ok": false, "code": "DENIED", "message": "No shared folders active"})),
        ));
    }

    let cleaned = requested.trim_matches(|c| c == '/' || c == '\\');
    if cleaned.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(serde_json::json!({"ok": false, "code": "DENIED", "message": "Empty path"})),
        ));
    }

    let (top_segment, sub_path) = match cleaned.find(['/', '\\']) {
        Some(idx) => (&cleaned[..idx], &cleaned[idx + 1..]),
        None => (cleaned, ""),
    };

    // 1. Try matching top_segment with folder.label
    for folder in &enabled_folders {
        if folder.label.eq_ignore_ascii_case(top_segment) {
            if require_write && folder.acl != "READWRITE" {
                return Err((
                    StatusCode::FORBIDDEN,
                    Json(serde_json::json!({"ok": false, "code": "DENIED", "message": "Read-only folder"})),
                ));
            }
            let base = Path::new(&folder.path);
            let target = if sub_path.is_empty() {
                base.to_path_buf()
            } else {
                Security::sanitize_path(base, sub_path).map_err(|_| {
                    (
                        StatusCode::FORBIDDEN,
                        Json(serde_json::json!({"ok": false, "code": "DENIED", "message": "Path traversal blocked"})),
                    )
                })?
            };
            return Ok(target);
        }
    }

    // 2. Direct relative match against each folder
    for folder in &enabled_folders {
        if require_write && folder.acl != "READWRITE" {
            continue;
        }
        let base = Path::new(&folder.path);
        if let Ok(safe) = Security::sanitize_path(base, cleaned) {
            return Ok(safe);
        }
    }

    // 3. Fallback for write: single file without folder prefix writes to first READWRITE folder
    if require_write && !cleaned.contains(['/', '\\']) {
        if let Some(folder) = enabled_folders.iter().find(|f| f.acl == "READWRITE") {
            let base = Path::new(&folder.path);
            if let Ok(safe) = Security::sanitize_path(base, cleaned) {
                return Ok(safe);
            }
        }
    }

    Err((
        StatusCode::FORBIDDEN,
        Json(serde_json::json!({"ok": false, "code": "DENIED", "message": "Path traversal blocked or share not accessible"})),
    ))
}

async fn handle_sync_manifest(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<ListQuery>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    let req_path = query.path.unwrap_or_else(|| "/".to_string());
    let cleaned = req_path.trim_matches(|c| c == '/' || c == '\\');

    let folders = state.db.get_shared_folders().unwrap_or_default();
    let enabled_folders: Vec<_> = folders.into_iter().filter(|f| f.enabled).collect();

    let mut target_dirs: Vec<(String, PathBuf)> = Vec::new();

    if cleaned.is_empty() || req_path == "/" {
        for f in enabled_folders {
            let p = PathBuf::from(&f.path);
            if p.is_dir() {
                target_dirs.push((f.label, p));
            }
        }
    } else {
        let target = resolve_safe_path(&state.db, &req_path, false)?;
        if target.is_dir() {
            target_dirs.push((cleaned.to_string(), target));
        }
    }

    let mut entries = Vec::new();

const IGNORED_DIRS: &[&str] = &[
    ".git",
    "node_modules",
    "build",
    "target",
    ".gradle",
    ".idea",
    ".vscode",
    "dist",
    "__pycache__",
    ".cache",
    ".thumbnails",
    ".Trash",
    "$RECYCLE.BIN",
    ".vercel",
];

const IGNORED_FILES: &[&str] = &[
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
];

fn is_ignored_dir(name: &str) -> bool {
    IGNORED_DIRS.iter().any(|d| d.eq_ignore_ascii_case(name))
}

fn is_ignored_file(name: &str) -> bool {
    if IGNORED_FILES.iter().any(|f| f.eq_ignore_ascii_case(name)) {
        return true;
    }
    name.ends_with(".tmp") || name.ends_with(".part")
}

    fn scan_dir(prefix: &str, dir: &Path, entries: &mut Vec<SyncManifestItem>) {
        if let Ok(read_dir) = fs::read_dir(dir) {
            for entry in read_dir.flatten() {
                let path = entry.path();
                let file_name = entry.file_name().to_string_lossy().to_string();

                if path.is_dir() {
                    if is_ignored_dir(&file_name) {
                        continue;
                    }
                    let rel_path = if prefix.is_empty() {
                        file_name
                    } else {
                        format!("{}/{}", prefix, file_name)
                    };
                    scan_dir(&rel_path, &path, entries);
                } else if path.is_file() {
                    if is_ignored_file(&file_name) {
                        continue;
                    }
                    let rel_path = if prefix.is_empty() {
                        file_name
                    } else {
                        format!("{}/{}", prefix, file_name)
                    };
                    if let Ok(meta) = path.metadata() {
                        let size = meta.len();
                        let mtime = meta
                            .modified()
                            .ok()
                            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                            .map(|d| d.as_millis() as i64)
                            .unwrap_or(0);

                        if let Ok(hash) = calculate_sha256(&path) {
                            entries.push(SyncManifestItem {
                                path: rel_path,
                                size,
                                mtime,
                                sha256: hash,
                            });
                        }
                    }
                }
            }
        }
    }

    for (pfx, dir) in target_dirs {
        scan_dir(&pfx, &dir, &mut entries);
    }

    Ok(Json(serde_json::json!({
        "ok": true,
        "entries": entries
    })))
}

fn calculate_sha256(path: &Path) -> Result<String, std::io::Error> {
    let mut file = File::open(path)?;
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 65536];
    loop {
        let n = file.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        hasher.update(&buffer[..n]);
    }
    Ok(format!("{:x}", hasher.finalize()))
}
