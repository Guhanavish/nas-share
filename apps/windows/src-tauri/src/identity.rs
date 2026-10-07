use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceIdentity {
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String,
}

impl DeviceIdentity {
    pub fn get_or_create() -> Result<Self, String> {
        let app_dir = dirs::data_dir()
            .ok_or_else(|| "Failed to get data directory".to_string())?
            .join("nas-share");
        
        fs::create_dir_all(&app_dir).map_err(|e| e.to_string())?;
        let identity_file = app_dir.join("identity.json");

        if identity_file.exists() {
            let data = fs::read_to_string(&identity_file).map_err(|e| e.to_string())?;
            if let Ok(identity) = serde_json::from_str::<DeviceIdentity>(&data) {
                return Ok(identity);
            }
        }

        // Generate new identity
        let device_id = Uuid::new_v4().to_string();
        let device_name = match hostname::get() {
            Ok(h) => h.to_string_lossy().to_string(),
            Err(_) => "Windows-NAS".to_string(),
        };

        // 32-byte cryptographic entropy
        use rand::RngCore;
        let mut key_bytes = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut key_bytes);
        let pubkey = hex::encode(key_bytes);

        let identity = DeviceIdentity {
            device_id,
            device_name,
            pubkey,
        };

        let json = serde_json::to_string_pretty(&identity).map_err(|e| e.to_string())?;
        fs::write(&identity_file, json).map_err(|e| e.to_string())?;

        Ok(identity)
    }
}

// Minimal hex encoder
mod hex {
    pub fn encode(bytes: [u8; 32]) -> String {
        bytes.iter().map(|b| format!("{:02x}", b)).collect()
    }
}

// Fallback hostname provider
mod hostname {
    pub fn get() -> Result<std::ffi::OsString, std::io::Error> {
        std::env::var_os("COMPUTERNAME")
            .ok_or_else(|| std::io::Error::new(std::io::ErrorKind::NotFound, "No computer name"))
    }
}
