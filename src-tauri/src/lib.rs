mod ai;
mod safety;
mod scanner;
mod system;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            system::get_backend_health,
            scanner::list_drives,
            scanner::scan_drive,
            safety::move_file_to_recycle_bin
        ])
        .run(tauri::generate_context!())
        .expect("failed to run DiskMind Tauri application");
}