import { invoke } from "@tauri-apps/api/core";

import type { BackendHealth } from "@shared/types/backend";

export async function getBackendHealth(): Promise<BackendHealth> {
  return invoke<BackendHealth>("get_backend_health");
}
