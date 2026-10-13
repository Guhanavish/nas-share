pub mod db;
pub mod discovery;
pub mod identity;
pub mod pairing;
pub mod protocol;
pub mod relay;
pub mod security;
pub mod server;
pub mod tray;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::{Manager, State};

use crate::db::{Database, SharedFolder, TrustedDevice};
use crate::discovery::{DiscoveredDevice, MdnsDiscovery};
use crate::identity::DeviceIdentity;
use crate::pairing::PairingManager;
use crate::protocol::{FileEntry, FileProtoClient};
use crate::relay::{RelayMesh, RemoteDevice};
use crate::server::EmbeddedServer;
use crate::tray::TrayManager;

pub struct AppState {
    pub db: Database,
    pub identity: DeviceIdentity,
    pub discovery: Option<MdnsDiscovery>,
    pub worker_url: String,
    pub relay: RelayMesh,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub port: u16,
    pub autostart: bool,
    pub bandwidth_limit: u64,
    pub worker_url: String,
}

// -----------------------------------------------------------------------------
// Tauri Commands
// -----------------------------------------------------------------------------

#[tauri::command]
async fn get_device_info(state: State<'_, AppState>) -> Result<DeviceIdentity, String> {
    Ok(state.identity.clone())
}

#[tauri::command]
async fn get_discovered_devices(
    state: State<'_, AppState>,
) -> Result<Vec<DiscoveredDevice>, String> {
    match &state.discovery {
        Some(d) => Ok(d.get_discovered()),
        None => Ok(Vec::new()),
    }
}

#[tauri::command]
async fn get_trusted_devices(
    state: State<'_, AppState>,
) -> Result<Vec<TrustedDevice>, String> {
    state.db.get_trusted_devices()
}

#[tauri::command]
async fn list_files(address: String, path: String) -> Result<Vec<FileEntry>, String> {
    FileProtoClient::list_files(&address, &path).await
}

#[tauri::command]
async fn download_file(
    address: String,
    remote_path: String,
    local_path: String,
) -> Result<(), String> {
    let dest = PathBuf::from(local_path);
    FileProtoClient::download_file(&address, &remote_path, &dest).await
}

#[tauri::command]
async fn upload_file(
    address: String,
    local_path: String,
    remote_path: String,
) -> Result<(), String> {
    let src = PathBuf::from(local_path);
    FileProtoClient::upload_file(&address, &src, &remote_path).await
}

#[tauri::command]
async fn get_shared_folders(state: State<'_, AppState>) -> Result<Vec<SharedFolder>, String> {
    state.db.get_shared_folders()
}

#[tauri::command]
async fn add_shared_folder(
    state: State<'_, AppState>,
    path: String,
    label: String,
    acl: String,
) -> Result<SharedFolder, String> {
    let folder = SharedFolder {
        id: uuid::Uuid::new_v4().to_string(),
        path,
        label,
        acl,
        enabled: true,
    };
    state.db.add_shared_folder(folder.clone())?;
    Ok(folder)
}

#[tauri::command]
async fn remove_shared_folder(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    state.db.remove_shared_folder(&id)
}

#[tauri::command]
async fn toggle_shared_folder(
    state: State<'_, AppState>,
    id: String,
    enabled: bool,
) -> Result<(), String> {
    state.db.toggle_shared_folder(&id, enabled)
}

#[tauri::command]
async fn generate_pairing_code() -> Result<String, String> {
    Ok(PairingManager::generate_code())
}

#[tauri::command]
async fn join_pairing(
    state: State<'_, AppState>,
    code: String,
) -> Result<String, String> {
    PairingManager::join_and_pair(&state.worker_url, &code, &state.identity, &state.db).await
}

#[tauri::command]
async fn revoke_device(
    state: State<'_, AppState>,
    device_id: String,
) -> Result<(), String> {
    state.db.revoke_device(&device_id)
}

#[tauri::command]
async fn get_settings(state: State<'_, AppState>) -> Result<Settings, String> {
    Ok(Settings {
        port: 8743,
        autostart: true,
        bandwidth_limit: 0,
        worker_url: state.worker_url.clone(),
    })
}

#[tauri::command]
async fn update_settings(_settings: Settings) -> Result<(), String> {
    Ok(())
}

// -----------------------------------------------------------------------------
// Remote Pool (no LAN): presence + relay FileProto
// -----------------------------------------------------------------------------

#[tauri::command]
async fn get_remote_online(state: State<'_, AppState>) -> Result<Vec<RemoteDevice>, String> {
    Ok(state.relay.fetch_online().await)
}

#[tauri::command]
async fn list_files_remote(
    state: State<'_, AppState>,
    device_id: String,
) -> Result<Vec<FileEntry>, String> {
    state.relay.list_remote(&device_id, "/").await
}

#[tauri::command]
async fn download_file_remote(
    state: State<'_, AppState>,
    device_id: String,
    remote_path: String,
    local_path: String,
) -> Result<(), String> {
    let dest = PathBuf::from(local_path);
    state
        .relay
        .download_remote(&device_id, &remote_path, &dest)
        .await
}

// -----------------------------------------------------------------------------
// App Initialization — never panic: log + degrade so the window always opens
// -----------------------------------------------------------------------------

fn log_path() -> std::path::PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("nas-share")
        .join("nas.log")
}

fn log_line(msg: &str) {
    try_log_line(msg);
}

fn try_log_line(msg: &str) {
    use std::io::Write;
    let path = log_path();
    if let Some(parent) = path.parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    if let Ok(mut f) = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
    {
        let _ = writeln!(
            f,
            "[{}] {}",
            chrono_stamp(),
            msg
        );
    }
    eprintln!("[nas-share] {}", msg);
}

fn chrono_stamp() -> String {
    // No chrono dep: seconds since epoch is enough for crash triage.
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs().to_string())
        .unwrap_or_else(|_| "-".to_string())
}

fn ephemeral_identity() -> DeviceIdentity {
    DeviceIdentity {
        device_id: format!("ephemeral-{}", uuid::Uuid::new_v4()),
        device_name: std::env::var("COMPUTERNAME").unwrap_or_else(|_| "Windows-NAS".to_string()),
        pubkey: String::new(),
    }
}

pub fn run() {
    // Capture panics to a log file — release builds have no console.
    let prev_hook = std::panic::take_hook();
    std::panic::set_hook(Box::new(move |info| {
        try_log_line(&format!("PANIC: {}", info));
        prev_hook(info);
    }));

    let _ = tracing_subscriber::fmt()
        .with_env_filter("nas_share_desktop_lib=info,info")
        .try_init();
    log_line("starting Nasend");

    // --- Fallible init: every step degrades instead of .expect()-crashing ---
    let db = match Database::init() {
        Ok(d) => d,
        Err(e) => {
            log_line(&format!("Database::init failed ({}), using in-memory fallback", e));
            match Database::ephemeral() {
                Ok(d) => d,
                Err(e2) => {
                    log_line(&format!("Ephemeral DB also failed ({}), aborting", e2));
                    return;
                }
            }
        }
    };

    let identity = match DeviceIdentity::get_or_create() {
        Ok(id) => id,
        Err(e) => {
            log_line(&format!("Identity load failed ({}), using ephemeral identity", e));
            ephemeral_identity()
        }
    };

    let discovery: Option<MdnsDiscovery> = match MdnsDiscovery::new() {
        Ok(d) => Some(d),
        Err(e) => {
            log_line(&format!("mDNS daemon failed ({}), continuing without LAN discovery", e));
            None
        }
    };

    let port: u16 = 8743;
    if let Some(d) = discovery.as_ref() {
        if let Err(e) = d.register_service(port, &identity.device_id, &identity.device_name) {
            log_line(&format!("mDNS register failed ({}), continuing", e));
        }
    }

    let app_state = AppState {
        db,
        identity,
        discovery,
        worker_url: "wss://nas-signaling.ssgginfotech.workers.dev".to_string(),
        relay: RelayMesh::new(),
    };

    let result = tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .manage(app_state)
        .setup(|app| {
            let _ = TrayManager::setup(app.handle());
            let port = port; // copy for the 'static spawn below

            // Start mDNS browsing + embedded file server INSIDE the Tauri
            // async runtime (tokio::spawn before this point panics: no reactor).
            let handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let state = handle.state::<AppState>();
                // Remote mesh: presence heartbeat + answer relay file
                // requests so this PC is poolable without LAN.
                state
                    .relay
                    .start(
                        state.worker_url.clone(),
                        state.identity.clone(),
                        state.db.clone(),
                    )
                    .await;
                if let Some(d) = state.discovery.as_ref() {
                    if let Err(e) = d.start_browsing() {
                        log_line(&format!("mDNS browse failed ({}), continuing", e));
                    }
                }
                let server_db = state.db.clone();
                let server_identity = state.identity.clone();
                match EmbeddedServer::run(port, server_db, server_identity).await {
                    Ok(()) => log_line(&format!("embedded server listening on :{}", port)),
                    Err(e) => log_line(&format!(
                        "embedded server failed ({}). UI still usable; check port {} in use.",
                        e, port
                    )),
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_device_info,
            get_discovered_devices,
            get_trusted_devices,
            list_files,
            download_file,
            upload_file,
            get_shared_folders,
            add_shared_folder,
            remove_shared_folder,
            toggle_shared_folder,
            generate_pairing_code,
            join_pairing,
            revoke_device,
            get_settings,
            update_settings,
            get_remote_online,
            list_files_remote,
            download_file_remote,
        ])
        .run(tauri::generate_context!());
    if let Err(e) = result {
        log_line(&format!("Tauri runtime error: {}", e));
    }
}
