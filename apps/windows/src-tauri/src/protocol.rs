use reqwest::header::RANGE;
use serde::{Deserialize, Serialize};
use std::fs::{File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub entry_type: String, // "file" or "dir"
    pub size: u64,
    pub mtime: i64,
    pub hash: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMeta {
    pub name: String,
    pub entry_type: String,
    pub size: u64,
    pub mtime: i64,
    pub hash: Option<String>,
    pub mime_type: Option<String>,
}

#[allow(dead_code)]
#[derive(Deserialize)]
struct ListResponse {
    pub ok: bool,
    pub entries: Vec<FileEntry>,
}

#[allow(dead_code)]
#[derive(Deserialize)]
struct StatResponse {
    pub ok: bool,
    pub meta: FileMeta,
}

pub struct FileProtoClient;

impl FileProtoClient {
    pub async fn list_files(address: &str, path: &str) -> Result<Vec<FileEntry>, String> {
        let client = reqwest::Client::new();
        let encoded_path = urlencoding::encode(path);
        let url = format!("http://{}/api/list?path={}", address, encoded_path);

        let resp = client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        if !resp.status().is_success() {
            return Err(format!("Server returned HTTP {}", resp.status()));
        }

        let body = resp
            .json::<ListResponse>()
            .await
            .map_err(|e| format!("Failed to parse JSON: {}", e))?;

        Ok(body.entries)
    }

    pub async fn stat_file(address: &str, path: &str) -> Result<FileMeta, String> {
        let client = reqwest::Client::new();
        let encoded_path = urlencoding::encode(path);
        let url = format!("http://{}/api/stat?path={}", address, encoded_path);

        let resp = client
            .get(&url)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let body = resp
            .json::<StatResponse>()
            .await
            .map_err(|e| format!("Failed to parse JSON: {}", e))?;

        Ok(body.meta)
    }

    pub async fn download_file(
        address: &str,
        remote_path: &str,
        local_path: &Path,
    ) -> Result<(), String> {
        let client = reqwest::Client::new();
        let encoded_path = urlencoding::encode(remote_path);

        // Check if destination file exists to resume
        let initial_offset = if local_path.exists() {
            local_path.metadata().map(|m| m.len()).unwrap_or(0)
        } else {
            0
        };

        let url = format!(
            "http://{}/api/read?path={}&offset={}",
            address, encoded_path, initial_offset
        );

        let mut req = client.get(&url);
        if initial_offset > 0 {
            req = req.header(RANGE, format!("bytes={}-", initial_offset));
        }

        let mut resp = req
            .send()
            .await
            .map_err(|e| format!("Failed to download: {}", e))?;

        if !resp.status().is_success() && resp.status() != reqwest::StatusCode::PARTIAL_CONTENT {
            return Err(format!("Server error HTTP {}", resp.status()));
        }

        if let Some(parent) = local_path.parent() {
            let _ = std::fs::create_dir_all(parent);
        }

        let mut file = OpenOptions::new()
            .create(true)
            .write(true)
            .open(local_path)
            .map_err(|e| format!("Failed to open local destination: {}", e))?;

        file.seek(SeekFrom::Start(initial_offset))
            .map_err(|e| format!("Failed to seek local file: {}", e))?;

        while let Some(chunk) = resp
            .chunk()
            .await
            .map_err(|e| format!("Chunk stream error: {}", e))?
        {
            file.write_all(&chunk)
                .map_err(|e| format!("Disk write error: {}", e))?;
        }

        Ok(())
    }

    pub async fn upload_file(
        address: &str,
        local_path: &Path,
        remote_path: &str,
    ) -> Result<(), String> {
        let client = reqwest::Client::new();
        let encoded_remote = urlencoding::encode(remote_path);

        let mut file =
            File::open(local_path).map_err(|e| format!("Failed to open file: {}", e))?;
        let total_size = file.metadata().map(|m| m.len()).unwrap_or(0);

        let chunk_size = 64 * 1024; // 64KB chunks
        let mut buffer = vec![0u8; chunk_size];
        let mut current_offset = 0u64;

        while current_offset < total_size {
            let to_read = std::cmp::min(chunk_size as u64, total_size - current_offset) as usize;
            let read_bytes = file
                .read(&mut buffer[..to_read])
                .map_err(|e| format!("Disk read error: {}", e))?;

            if read_bytes == 0 {
                break;
            }

            let url = format!(
                "http://{}/api/write?path={}&offset={}",
                address, encoded_remote, current_offset
            );

            let resp = client
                .post(&url)
                .body(buffer[..read_bytes].to_vec())
                .send()
                .await
                .map_err(|e| format!("Upload chunk failed: {}", e))?;

            if !resp.status().is_success() {
                return Err(format!("Server error writing chunk: HTTP {}", resp.status()));
            }

            current_offset += read_bytes as u64;
        }

        Ok(())
    }
}
