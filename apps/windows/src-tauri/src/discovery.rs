use mdns_sd::{ServiceDaemon, ServiceEvent, ServiceInfo};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredDevice {
    pub device_id: String,
    pub device_name: String,
    pub pubkey: String,
    pub address: String,
    pub connection_type: String,
    pub signal_strength: Option<i32>,
}

#[derive(Clone)]
pub struct MdnsDiscovery {
    daemon: ServiceDaemon,
    discovered: Arc<Mutex<HashMap<String, DiscoveredDevice>>>,
}

impl MdnsDiscovery {
    pub fn new() -> Result<Self, String> {
        let daemon = ServiceDaemon::new().map_err(|e| e.to_string())?;
        Ok(Self {
            daemon,
            discovered: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    pub fn register_service(
        &self,
        port: u16,
        device_id: &str,
        device_name: &str,
    ) -> Result<(), String> {
        let service_type = "_nas-share._tcp.local.";
        let instance_name = format!("NAS-{}", device_name);
        let host_name = format!("{}.local.", device_name);

        let mut properties = HashMap::new();
        properties.insert("device_id".to_string(), device_id.to_string());
        properties.insert("device_name".to_string(), device_name.to_string());
        properties.insert("version".to_string(), "0.1.0".to_string());

        let my_service = ServiceInfo::new(
            service_type,
            &instance_name,
            &host_name,
            "",
            port,
            properties,
        )
        .map_err(|e| e.to_string())?;

        self.daemon.register(my_service).map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn start_browsing(&self) -> Result<(), String> {
        let receiver = self
            .daemon
            .browse("_nas-share._tcp.local.")
            .map_err(|e| e.to_string())?;

        let discovered = self.discovered.clone();

        tokio::spawn(async move {
            while let Ok(event) = receiver.recv_async().await {
                match event {
                    ServiceEvent::ServiceResolved(info) => {
                        let props = info.get_properties();
                        let device_id = props
                            .get_property_val_str("device_id")
                            .unwrap_or(info.get_fullname())
                            .to_string();
                        let device_name = props
                            .get_property_val_str("device_name")
                            .unwrap_or(info.get_fullname())
                            .to_string();

                        if let Some(addr) = info.get_addresses().iter().next() {
                            let ip_str = addr.to_string();
                            let address = format!("{}:{}", ip_str, info.get_port());

                            let device = DiscoveredDevice {
                                device_id: device_id.clone(),
                                device_name,
                                pubkey: String::new(),
                                address,
                                connection_type: "lan".to_string(),
                                signal_strength: Some(100),
                            };

                            if let Ok(mut map) = discovered.lock() {
                                map.insert(device_id, device);
                            }
                        }
                    }
                    ServiceEvent::ServiceRemoved(_, fullname) => {
                        if let Ok(mut map) = discovered.lock() {
                            map.retain(|_, v| !fullname.contains(&v.device_name));
                        }
                    }
                    _ => {}
                }
            }
        });

        Ok(())
    }

    pub fn get_discovered(&self) -> Vec<DiscoveredDevice> {
        if let Ok(map) = self.discovered.lock() {
            map.values().cloned().collect()
        } else {
            Vec::new()
        }
    }
}
