use serde::Serialize;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum SafetyClass {
    LikelySafe,
    ProbablySafe,
    Caution,
    Dangerous,
}

#[derive(Debug, Clone, Serialize, Eq, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FileRecommendation {
    pub classification: SafetyClass,
    pub label: String,
    pub explanation: String,
}

const LARGE_FILE_BYTES: u64 = 100 * 1024 * 1024;

pub fn analyze_file(path: &Path, extension: &str, size: u64) -> FileRecommendation {
    let lower_path = path.to_string_lossy().to_ascii_lowercase();
    let ext = extension.to_ascii_lowercase();

    if is_critical_or_system_path(&lower_path) {
        return FileRecommendation {
            classification: SafetyClass::Dangerous,
            label: "System-related file".into(),
            explanation: "This file is inside a protected Windows or application system area. Do not remove it unless you fully understand the impact.".into(),
        };
    }

    if is_temp_cache_path(&lower_path) {
        return FileRecommendation {
            classification: SafetyClass::LikelySafe,
            label: "Temporary cache file".into(),
            explanation: "This appears to be temporary or cache data. It is usually safe to remove after closing related apps, but DiskMind will still ask for confirmation.".into(),
        };
    }

    if matches!(ext.as_str(), "iso" | "dmg" | "msi" | "exe" | "pkg") {
        return FileRecommendation {
            classification: SafetyClass::ProbablySafe,
            label: "Old installer package".into(),
            explanation: "Installer images and setup packages are often leftover downloads. Verify you no longer need this installer before moving it to the recycle bin.".into(),
        };
    }

    if matches!(
        ext.as_str(),
        "pak" | "vpk" | "bundle" | "uasset" | "ucas" | "obb"
    ) || lower_path.contains("steamapps")
        || lower_path.contains("epic games")
    {
        return FileRecommendation {
            classification: SafetyClass::Caution,
            label: "Likely game asset".into(),
            explanation: "Large bundled game files are usually required by installed games. Removing them can break or force a repair of the game installation.".into(),
        };
    }

    if matches!(ext.as_str(), "zip" | "7z" | "rar" | "tar" | "gz") {
        return FileRecommendation {
            classification: SafetyClass::ProbablySafe,
            label: "Large archive".into(),
            explanation: "Archives can usually be removed if they are backups or duplicates. Open the folder first if you are unsure what it contains.".into(),
        };
    }

    if matches!(
        ext.as_str(),
        "mp4" | "mov" | "mkv" | "avi" | "wav" | "psd" | "ai"
    ) {
        return FileRecommendation {
            classification: SafetyClass::ProbablySafe,
            label: "Personal media or creative asset".into(),
            explanation: "Large media files are common space consumers. They are not system files, but may be personally important.".into(),
        };
    }

    let classification = if size >= LARGE_FILE_BYTES {
        SafetyClass::Caution
    } else {
        SafetyClass::ProbablySafe
    };

    FileRecommendation {
        classification,
        label: "Unclassified large file".into(),
        explanation: "DiskMind did not match a known cleanup pattern. Review the path and owning app before taking action.".into(),
    }
}

pub fn is_critical_or_system_path(lower_path: &str) -> bool {
    let normalized = lower_path.replace('/', "\\");
    normalized.starts_with("c:\\windows")
        || normalized.starts_with("c:\\program files")
        || normalized.starts_with("c:\\program files (x86)")
        || normalized.starts_with("c:\\programdata\\microsoft")
        || normalized.contains("\\appdata\\local\\microsoft\\windows")
        || normalized.contains("\\system volume information")
        || normalized.contains("\\$recycle.bin")
        || normalized.ends_with("\\pagefile.sys")
        || normalized.ends_with("\\hiberfil.sys")
        || normalized.ends_with("\\swapfile.sys")
}

fn is_temp_cache_path(lower_path: &str) -> bool {
    lower_path.contains("\\temp\\")
        || lower_path.contains("/temp/")
        || lower_path.contains("\\cache\\")
        || lower_path.contains("/cache/")
        || lower_path.contains("\\logs\\")
        || lower_path.contains("/logs/")
}