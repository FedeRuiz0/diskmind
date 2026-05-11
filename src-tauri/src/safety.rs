use crate::ai::is_critical_or_system_path;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecycleRequest {
    pub path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecycleResponse {
    pub path: String,
    pub moved_to_recycle_bin: bool,
}

pub async fn move_file_to_recycle_bin(request: RecycleRequest) -> Result<RecycleResponse, String> {
    tauri::async_runtime::spawn_blocking(move || recycle_file(request.path))
        .await
        .map_err(|error| format!("Recycle task failed: {error}"))?
}

fn recycle_file(path: String) -> Result<RecycleResponse, String> {
    let path_buf = PathBuf::from(&path);
    if !path_buf.exists() || !path_buf.is_file() {
        return Err("Only existing files can be moved to the recycle bin.".into());
    }

    let lower_path = path_buf.to_string_lossy().to_ascii_lowercase();
    if is_critical_or_system_path(&lower_path) {
        return Err("DiskMind blocks recycle-bin operations for critical system paths.".into());
    }

    move_to_recycle_bin(&path_buf)?;

    Ok(RecycleResponse {
        path,
        moved_to_recycle_bin: true,
    })
}

#[cfg(target_os = "windows")]
fn move_to_recycle_bin(path: &PathBuf) -> Result<(), String> {
    use std::os::windows::ffi::OsStrExt;
    use std::ptr::{null, null_mut};
    use windows_sys::Win32::UI::Shell::{
        SHFileOperationW, FOF_ALLOWUNDO, FOF_NOERRORUI, FOF_SILENT, FO_DELETE, SHFILEOPSTRUCTW,
    };

    let mut from: Vec<u16> = path.as_os_str().encode_wide().chain([0, 0]).collect();
    let mut operation = SHFILEOPSTRUCTW {
        hwnd: null_mut(),
        wFunc: FO_DELETE,
        pFrom: from.as_mut_ptr(),
        pTo: null(),
        fFlags: FOF_ALLOWUNDO | FOF_NOERRORUI | FOF_SILENT,
        fAnyOperationsAborted: 0,
        hNameMappings: null_mut(),
        lpszProgressTitle: null(),
    };

    let result = unsafe { SHFileOperationW(&mut operation) };
    if result == 0 && operation.fAnyOperationsAborted == 0 {
        Ok(())
    } else {
        Err(format!(
            "Windows recycle-bin operation failed with code {result}."
        ))
    }
}

#[cfg(not(target_os = "windows"))]
fn move_to_recycle_bin(_path: &PathBuf) -> Result<(), String> {
    Err("Recycle-bin support is currently implemented for Windows builds only.".into())
}