use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::db::Database;
use crate::protocol::FileProtoClient;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SyncStats {
    pub downloaded: usize,
    pub uploaded: usize,
    pub conflicts: usize,
    pub bytes_transferred: u64,
}

pub struct SyncEngine;

impl SyncEngine {
    pub async fn sync_with_peer(
        peer_address: &str,
        db: &Database,
    ) -> Result<SyncStats, String> {
        let folders = db
            .get_shared_folders()
            .map_err(|e| format!("Failed to read shared folders: {}", e))?;
        let enabled_folders: Vec<_> = folders.into_iter().filter(|f| f.enabled).collect();
        if enabled_folders.is_empty() {
            return Err("No active shared folders configured".to_string());
        }

        // 1. Scan local files
        let mut local_manifest: HashMap<String, (PathBuf, u64, i64, String, bool)> = HashMap::new();
        for folder in &enabled_folders {
            let base = PathBuf::from(&folder.path);
            if !base.is_dir() {
                continue;
            }
            let is_writable = folder.acl == "READWRITE";
            scan_dir(&folder.label, &base, &base, is_writable, &mut local_manifest);
        }

        // 2. Fetch remote manifest
        let remote_entries = FileProtoClient::get_sync_manifest(peer_address, "/").await?;
        let remote_manifest: HashMap<String, (u64, i64, String)> = remote_entries
            .into_iter()
            .map(|e| (e.path, (e.size, e.mtime, e.sha256)))
            .collect();

        let mut downloaded = 0;
        let mut uploaded = 0;
        let mut conflicts = 0;
        let mut bytes_transferred = 0u64;

        let mut all_keys: Vec<String> = local_manifest.keys().cloned().collect();
        for k in remote_manifest.keys() {
            if !local_manifest.contains_key(k) {
                all_keys.push(k.clone());
            }
        }

        for path in all_keys {
            let local = local_manifest.get(&path);
            let remote = remote_manifest.get(&path);

            match (local, remote) {
                (None, Some((r_size, _r_mtime, _r_hash))) => {
                    // Remote only -> Download
                    let dest = resolve_local_dest(&path, &enabled_folders)?;
                    if let Err(e) = FileProtoClient::download_file(peer_address, &path, &dest).await {
                        tracing::error!("Sync download failed for {}: {}", path, e);
                    } else {
                        downloaded += 1;
                        bytes_transferred += *r_size;
                    }
                }
                (Some((l_path, l_size, _l_mtime, _l_hash, _)), None) => {
                    // Local only -> Upload
                    if let Err(e) = FileProtoClient::upload_file(peer_address, l_path, &path).await {
                        tracing::error!("Sync upload failed for {}: {}", path, e);
                    } else {
                        uploaded += 1;
                        bytes_transferred += *l_size;
                    }
                }
                (Some((l_path, l_size, l_mtime, l_hash, _)), Some((r_size, r_mtime, r_hash))) => {
                    // Both exist
                    if l_hash.eq_ignore_ascii_case(r_hash) {
                        // Identical -> Up to date
                        continue;
                    }

                    // Content differs -> Keep-Both conflict resolution
                    conflicts += 1;
                    if *r_mtime > *l_mtime {
                        // Remote is newer: rename local with conflict tag, then download remote
                        let conflict_path = make_conflict_path(l_path, "local");
                        let _ = fs::rename(l_path, conflict_path);
                        if let Err(e) = FileProtoClient::download_file(peer_address, &path, l_path).await {
                            tracing::error!("Sync conflict download failed for {}: {}", path, e);
                        } else {
                            downloaded += 1;
                            bytes_transferred += *r_size;
                        }
                    } else {
                        // Local is newer: upload local to remote
                        if let Err(e) = FileProtoClient::upload_file(peer_address, l_path, &path).await {
                            tracing::error!("Sync conflict upload failed for {}: {}", path, e);
                        } else {
                            uploaded += 1;
                            bytes_transferred += *l_size;
                        }
                    }
                }
                (None, None) => {}
            }
        }

        Ok(SyncStats {
            downloaded,
            uploaded,
            conflicts,
            bytes_transferred,
        })
    }
}

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

fn scan_dir(
    prefix: &str,
    base: &Path,
    dir: &Path,
    is_writable: bool,
    manifest: &mut HashMap<String, (PathBuf, u64, i64, String, bool)>,
) {
    if let Ok(read_dir) = fs::read_dir(dir) {
        for entry in read_dir.flatten() {
            let path = entry.path();
            let file_name = entry.file_name().to_string_lossy().to_string();
            if path.is_dir() {
                if is_ignored_dir(&file_name) {
                    continue;
                }
                scan_dir(prefix, base, &path, is_writable, manifest);
            } else if path.is_file() {
                if is_ignored_file(&file_name) {
                    continue;
                }
                if let Ok(meta) = path.metadata() {
                    let size = meta.len();
                    let mtime = meta
                        .modified()
                        .ok()
                        .and_then(|t| t.duration_since(UNIX_EPOCH).ok())
                        .map(|d| d.as_millis() as i64)
                        .unwrap_or(0);

                    if let Ok(hash) = calculate_sha256(&path) {
                        if let Ok(rel) = path.strip_prefix(base) {
                            let rel_str = rel.to_string_lossy().replace('\\', "/");
                            let virtual_path = format!("{}/{}", prefix, rel_str);
                            manifest.insert(virtual_path, (path.clone(), size, mtime, hash, is_writable));
                        }
                    }
                }
            }
        }
    }
}

fn resolve_local_dest(
    virtual_path: &str,
    folders: &[crate::db::SharedFolder],
) -> Result<PathBuf, String> {
    let cleaned = virtual_path.trim_matches(|c| c == '/' || c == '\\');
    let (top, sub) = match cleaned.find(['/', '\\']) {
        Some(idx) => (&cleaned[..idx], &cleaned[idx + 1..]),
        None => (cleaned, cleaned),
    };

    let matched = folders
        .iter()
        .find(|f| f.label.eq_ignore_ascii_case(top))
        .or_else(|| folders.iter().find(|f| f.acl == "READWRITE"))
        .or_else(|| folders.first())
        .ok_or_else(|| "No shared folders available for download target".to_string())?;

    let base = PathBuf::from(&matched.path);
    let target = base.join(sub);
    if let Some(parent) = target.parent() {
        let _ = fs::create_dir_all(parent);
    }
    Ok(target)
}

fn make_conflict_path(path: &Path, tag: &str) -> PathBuf {
    let stem = path.file_stem().map(|s| s.to_string_lossy().to_string()).unwrap_or_else(|| "file".to_string());
    let ext = path.extension().map(|e| format!(".{}", e.to_string_lossy())).unwrap_or_default();
    let now = SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_secs() % 100000).unwrap_or(0);
    let new_name = format!("{} ({} conflict {}){}", stem, tag, now, ext);
    path.with_file_name(new_name)
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
