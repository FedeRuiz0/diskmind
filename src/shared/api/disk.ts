import { invoke } from "@tauri-apps/api/core";

import type { DriveInfo, RecycleResponse, ScanResponse } from "@shared/types/backend";

export async function listDrives(): Promise<DriveInfo[]> {
  return invoke<DriveInfo[]>("list_drives");
}

export async function scanDrive(rootPath: string, limit = 2_000): Promise<ScanResponse> {
  return invoke<ScanResponse>("scan_drive", { request: { rootPath, limit } });
}

export async function moveFileToRecycleBin(path: string): Promise<RecycleResponse> {
  return invoke<RecycleResponse>("move_file_to_recycle_bin", { request: { path } });
}