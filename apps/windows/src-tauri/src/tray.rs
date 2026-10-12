use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

pub struct TrayManager;

impl TrayManager {
    pub fn setup(app: &AppHandle) -> Result<(), String> {
        let show_i = MenuItem::with_id(app, "show", "Show Nasend", true, None::<&str>)
            .map_err(|e| e.to_string())?;
        let hide_i = MenuItem::with_id(app, "hide", "Hide", true, None::<&str>)
            .map_err(|e| e.to_string())?;
        let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)
            .map_err(|e| e.to_string())?;

        let menu = Menu::with_items(app, &[&show_i, &hide_i, &quit_i])
            .map_err(|e| e.to_string())?;

        let _tray = TrayIconBuilder::new()
            .menu(&menu)
            .tooltip("Nasend — Serving files on LAN")
            .on_menu_event(|app, event| match event.id.as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "hide" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            })
            .on_tray_icon_event(|tray, event| {
                if let TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } = event
                {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
            })
            .build(app)
            .map_err(|e| e.to_string())?;

        Ok(())
    }
}
