use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::fs;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrustedDevice {
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String,
    pub pinned_at: i64,
    pub last_seen: Option<i64>,
    pub is_revoked: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SharedFolder {
    pub id: String,
    pub path: String,
    pub label: String,
    pub acl: String,
    pub enabled: bool,
}

#[derive(Clone)]
pub struct Database {
    conn: Arc<Mutex<Connection>>,
}

impl Database {
    pub fn init() -> Result<Self, String> {        let app_dir = dirs::data_dir()
            .ok_or_else(|| "Cannot find data directory".to_string())?
            .join("nas-share");
        fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;

        let db_path = app_dir.join("nas.db");
        let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS trusted_devices (
                device_id TEXT PRIMARY KEY,
                device_name TEXT NOT NULL,
                pubkey TEXT NOT NULL,
                pinned_at INTEGER NOT NULL,
                last_seen INTEGER,
                is_revoked INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS shared_folders (
                id TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                label TEXT NOT NULL,
                acl TEXT NOT NULL DEFAULT 'READ',
                enabled INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            "#,
        )
        .map_err(|e| e.to_string())?;

        Ok(Database {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    /// In-memory fallback so the UI can still open when the on-disk DB fails.
    pub fn ephemeral() -> Result<Self, String> {
        let conn = Connection::open_in_memory().map_err(|e| e.to_string())?;
        conn.execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS trusted_devices (
                device_id TEXT PRIMARY KEY,
                device_name TEXT NOT NULL,
                pubkey TEXT NOT NULL,
                pinned_at INTEGER NOT NULL,
                last_seen INTEGER,
                is_revoked INTEGER NOT NULL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS shared_folders (
                id TEXT PRIMARY KEY,
                path TEXT NOT NULL,
                label TEXT NOT NULL,
                acl TEXT NOT NULL DEFAULT 'READ',
                enabled INTEGER NOT NULL DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            "#,
        )
        .map_err(|e| e.to_string())?;

        Ok(Database {
            conn: Arc::new(Mutex::new(conn)),
        })
    }

    pub fn get_trusted_devices(&self) -> Result<Vec<TrustedDevice>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT device_id, device_name, pubkey, pinned_at, last_seen, is_revoked FROM trusted_devices WHERE is_revoked = 0 ORDER BY pinned_at DESC")
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| {
                Ok(TrustedDevice {
                    device_id: row.get(0)?,
                    device_name: row.get(1)?,
                    pubkey: row.get(2)?,
                    pinned_at: row.get(3)?,
                    last_seen: row.get(4)?,
                    is_revoked: row.get::<_, i32>(5)? != 0,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut list = Vec::new();
        for r in rows {
            if let Ok(dev) = r {
                list.push(dev);
            }
        }
        Ok(list)
    }

    pub fn add_trusted_device(&self, device: TrustedDevice) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO trusted_devices (device_id, device_name, pubkey, pinned_at, last_seen, is_revoked) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                device.device_id,
                device.device_name,
                device.pubkey,
                device.pinned_at,
                device.last_seen,
                if device.is_revoked { 1 } else { 0 }
            ],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn revoke_device(&self, device_id: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE trusted_devices SET is_revoked = 1 WHERE device_id = ?1",
            params![device_id],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_shared_folders(&self) -> Result<Vec<SharedFolder>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT id, path, label, acl, enabled FROM shared_folders ORDER BY label ASC")
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| {
                Ok(SharedFolder {
                    id: row.get(0)?,
                    path: row.get(1)?,
                    label: row.get(2)?,
                    acl: row.get(3)?,
                    enabled: row.get::<_, i32>(4)? != 0,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut list = Vec::new();
        for r in rows {
            if let Ok(f) = r {
                list.push(f);
            }
        }
        Ok(list)
    }

    pub fn add_shared_folder(&self, folder: SharedFolder) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "INSERT OR REPLACE INTO shared_folders (id, path, label, acl, enabled) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![folder.id, folder.path, folder.label, folder.acl, if folder.enabled { 1 } else { 0 }],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn remove_shared_folder(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM shared_folders WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn toggle_shared_folder(&self, id: &str, enabled: bool) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE shared_folders SET enabled = ?1 WHERE id = ?2",
            params![if enabled { 1 } else { 0 }, id],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }
}
