use crate::ai::{analyze_file, FileRecommendation};
use serde::{Deserialize, Serialize};
use std::cmp::{Ordering, Reverse};
use std::collections::{BinaryHeap, VecDeque};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

const DEFAULT_SCAN_LIMIT: usize = 2_000;
const MAX_SCAN_LIMIT: usize = 10_000;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DriveInfo {
    pub letter: String,
    pub mount_path: String,
    pub total_space: u64,
    pub free_space: u64,
    pub used_space: u64,
    pub usage_percent: f64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanRequest {
    pub root_path: String,
    pub limit: Option<usize>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScanResponse {
    pub root_path: String,
    pub files: Vec<ScannedFile>,
    pub scanned_files: u64,
    pub skipped_entries: u64,
    pub limited_to: usize,
}

#[derive(Debug, Clone, Serialize, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct ScannedFile {
    pub name: String,
    pub path: String,
    pub size: u64,
    pub extension: String,
    pub modified: Option<String>,
    pub recommendation: FileRecommendation,
}

impl Ord for ScannedFile {
    fn cmp(&self, other: &Self) -> Ordering {
        self.size
            .cmp(&other.size)
            .then_with(|| self.path.cmp(&other.path))
    }
}

impl PartialOrd for ScannedFile {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub async fn list_drives() -> Result<Vec<DriveInfo>, String> {
    tauri::async_runtime::spawn_blocking(detect_drives)
        .await
        .map_err(|error| format!("Drive detection task failed: {error}"))?
}

pub async fn scan_drive(request: ScanRequest) -> Result<ScanResponse, String> {
    let limit = request
        .limit
        .unwrap_or(DEFAULT_SCAN_LIMIT)
        .clamp(1, MAX_SCAN_LIMIT);
    let root_path = request.root_path;

    tauri::async_runtime::spawn_blocking(move || scan_largest_files(root_path, limit))
        .await
        .map_err(|error| format!("Scanner task failed: {error}"))?
}

fn scan_largest_files(root_path: String, limit: usize) -> Result<ScanResponse, String> {
    let root = PathBuf::from(&root_path);
    if !root.exists() {
        return Err(format!("Scan root does not exist: {root_path}"));
    }

    let mut directories = VecDeque::from([root]);
    let mut largest_files: BinaryHeap<Reverse<ScannedFile>> = BinaryHeap::with_capacity(limit + 1);
    let mut scanned_files = 0_u64;
    let mut skipped_entries = 0_u64;

    while let Some(directory) = directories.pop_front() {
        let entries = match fs::read_dir(&directory) {
            Ok(entries) => entries,
            Err(_) => {
                skipped_entries += 1;
                continue;
            }
        };

        for entry in entries.flatten() {
            let path = entry.path();
            let metadata = match entry.metadata() {
                Ok(metadata) => metadata,
                Err(_) => {
                    skipped_entries += 1;
                    continue;
                }
            };

            if metadata.is_dir() {
                directories.push_back(path);
                continue;
            }

            if !metadata.is_file() {
                skipped_entries += 1;
                continue;
            }

            scanned_files += 1;
            let file = scanned_file_from_path(&path, &metadata);
            largest_files.push(Reverse(file));
            if largest_files.len() > limit {
                largest_files.pop();
            }
        }
    }

    let mut files: Vec<ScannedFile> = largest_files
        .into_iter()
        .map(|Reverse(file)| file)
        .collect();
    files.sort_by(|a, b| b.size.cmp(&a.size).then_with(|| a.path.cmp(&b.path)));

    Ok(ScanResponse {
        root_path,
        files,
        scanned_files,
        skipped_entries,
        limited_to: limit,
    })
}

fn scanned_file_from_path(path: &Path, metadata: &fs::Metadata) -> ScannedFile {
    let name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("Unknown file")
        .to_string();
    let extension = path
        .extension()
        .and_then(|extension| extension.to_str())
        .unwrap_or("")
        .to_string();
    let size = metadata.len();

    ScannedFile {
        name,
        path: path.to_string_lossy().to_string(),
        size,
        extension: extension.clone(),
        modified: metadata.modified().ok().map(format_system_time),
        recommendation: analyze_file(path, &extension, size),
    }
}

fn format_system_time(time: SystemTime) -> String {
    time.duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis().to_string())
        .unwrap_or_default()
}

#[cfg(target_os = "windows")]
fn detect_drives() -> Result<Vec<DriveInfo>, String> {
    use windows_sys::Win32::Storage::FileSystem::{
        GetDiskFreeSpaceExW, GetDriveTypeW, DRIVE_FIXED, DRIVE_RAMDISK, DRIVE_REMOVABLE,
    };

    let mut drives = Vec::new();

    for letter in b'A'..=b'Z' {
        let drive_letter = format!("{}:", letter as char);
        let mount_path = format!("{}\\", drive_letter);
        let wide_path: Vec<u16> = mount_path
            .encode_utf16()
            .chain(std::iter::once(0))
            .collect();
        let drive_type = unsafe { GetDriveTypeW(wide_path.as_ptr()) };

        if !matches!(drive_type, DRIVE_FIXED | DRIVE_REMOVABLE | DRIVE_RAMDISK) {
            continue;
        }

        let mut free_available = 0_u64;
        let mut total_space = 0_u64;
        let mut total_free = 0_u64;
        let ok = unsafe {
            GetDiskFreeSpaceExW(
                wide_path.as_ptr(),
                &mut free_available,
                &mut total_space,
                &mut total_free,
            )
        };

        if ok == 0 || total_space == 0 {
            continue;
        }

        let free_space = total_free;
        let used_space = total_space.saturating_sub(free_space);
        let usage_percent = (used_space as f64 / total_space as f64) * 100.0;

        drives.push(DriveInfo {
            letter: drive_letter,
            mount_path,
            total_space,
            free_space,
            used_space,
            usage_percent,
        });
    }

    Ok(drives)
}

#[cfg(not(target_os = "windows"))]
fn detect_drives() -> Result<Vec<DriveInfo>, String> {
    Ok(vec![DriveInfo {
        letter: "/".into(),
        mount_path: "/".into(),
        total_space: 0,
        free_space: 0,
        used_space: 0,
        usage_percent: 0.0,
    }])
}