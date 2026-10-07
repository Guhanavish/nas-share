pub mod db;
pub mod discovery;
pub mod identity;
pub mod pairing;
pub mod protocol;
pub mod security;
pub mod server;
pub mod tray;

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

use crate::db::{Database, SharedFolder, TrustedDevice};
use crate::discovery::{DiscoveredDevice, MdnsDiscovery};
use crate::identity::DeviceIdentity;
use crate::pairing::PairingManager;
use crate::protocol::{FileEntry, FileProtoClient};
use crate::server::EmbeddedServer;
use crate::tray::TrayManager;

pub struct AppState {
    pub db: Database,
    pub identity: DeviceIdentity,
    pub discovery: MdnsDiscovery,
    pub worker_url: String,
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
pub async fn get_device_info(state: State<'_, AppState>) -> Result<DeviceIdentity, String> {
    Ok(state.identity.clone())
}

#[tauri::command]
pub async fn get_discovered_devices(
    state: State<'_, AppState>,
) -> Result<Vec<DiscoveredDevice>, String> {
    Ok(state.discovery.get_discovered())
}

#[tauri::command]
pub async fn get_trusted_devices(
    state: State<'_, AppState>,
) -> Result<Vec<TrustedDevice>, String> {
    state.db.get_trusted_devices()
}

#[tauri::command]
pub async fn list_files(address: String, path: String) -> Result<Vec<FileEntry>, String> {
    FileProtoClient::list_files(&address, &path).await
}

#[tauri::command]
pub async fn download_file(
    address: String,
    remote_path: String,
    local_path: String,
) -> Result<(), String> {
    let dest = PathBuf::from(local_path);
    FileProtoClient::download_file(&address, &remote_path, &dest).await
}

#[tauri::command]
pub async fn upload_file(
    address: String,
    local_path: String,
    remote_path: String,
) -> Result<(), String> {
    let src = PathBuf::from(local_path);
    FileProtoClient::upload_file(&address, &src, &remote_path).await
}

#[tauri::command]
pub async fn get_shared_folders(state: State<'_, AppState>) -> Result<Vec<SharedFolder>, String> {
    state.db.get_shared_folders()
}

#[tauri::command]
pub async fn add_shared_folder(
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
pub async fn remove_shared_folder(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    state.db.remove_shared_folder(&id)
}

#[tauri::command]
pub async fn toggle_shared_folder(
    state: State<'_, AppState>,
    id: String,
    enabled: bool,
) -> Result<(), String> {
    state.db.toggle_shared_folder(&id, enabled)
}

#[tauri::command]
pub async fn generate_pairing_code() -> Result<String, String> {
    Ok(PairingManager::generate_code())
}

#[tauri::command]
pub async fn join_pairing(
    state: State<'_, AppState>,
    code: String,
) -> Result<String, String> {
    PairingManager::join_and_pair(&state.worker_url, &code, &state.identity, &state.db).await
}

#[tauri::command]
pub async fn revoke_device(
    state: State<'_, AppState>,
    device_id: String,
) -> Result<(), String> {
    state.db.revoke_device(&device_id)
}

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> Result<Settings, String> {
    Ok(Settings {
        port: 8743,
        autostart: true,
        bandwidth_limit: 0,
        worker_url: state.worker_url.clone(),
    })
}

#[tauri::command]
pub async fn update_settings(_settings: Settings) -> Result<(), String> {
    Ok(())
}

// -----------------------------------------------------------------------------
// App Initialization
// -----------------------------------------------------------------------------

pub fn run() {
    let db = Database::init().expect("Failed to initialize database");
    let identity = DeviceIdentity::get_or_create().expect("Failed to get device identity");
    let discovery = MdnsDiscovery::new().expect("Failed to start mDNS daemon");

    let port = 8743;
    // Register mDNS
    let _ = discovery.register_service(port, &identity.device_id, &identity.device_name);
    let _ = discovery.start_browsing();

    // Start embedded Axum server
    let server_db = db.clone();
    let server_identity = identity.clone();
    tokio::spawn(async move {
        let _ = EmbeddedServer::run(port, server_db, server_identity).await;
    });

    let app_state = AppState {
        db,
        identity,
        discovery,
        worker_url: "wss://nas-signaling.YOUR_SUBDOMAIN.workers.dev".to_string(),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_notification::init())
        .manage(app_state)
        .setup(|app| {
            let _ = TrayManager::setup(app.handle());
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
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
