use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BackendHealth {
    app_name: &'static str,
    message: &'static str,
    version: &'static str,
}

#[tauri::command]
pub fn get_backend_health() -> BackendHealth {
    BackendHealth {
        app_name: "DiskMind",
        message: "Backend Rust listo para comandos seguros y trabajos pesados desacoplados.",
        version: env!("CARGO_PKG_VERSION"),
    }
}
