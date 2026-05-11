export interface BackendHealth {
  readonly appName: string;
  readonly message: string;
  readonly version: string;
}

export type SafetyClass = "likelySafe" | "probablySafe" | "caution" | "dangerous";

export interface FileRecommendation {
  readonly classification: SafetyClass;
  readonly label: string;
  readonly explanation: string;
}

export interface DriveInfo {
  readonly letter: string;
  readonly mountPath: string;
  readonly totalSpace: number;
  readonly freeSpace: number;
  readonly usedSpace: number;
  readonly usagePercent: number;
}

export interface ScannedFile {
  readonly name: string;
  readonly path: string;
  readonly size: number;
  readonly extension: string;
  readonly modified: string | null;
  readonly recommendation: FileRecommendation;
}

export interface ScanResponse {
  readonly rootPath: string;
  readonly files: ScannedFile[];
  readonly scannedFiles: number;
  readonly skippedEntries: number;
  readonly limitedTo: number;
}

export interface RecycleResponse {
  readonly path: string;
  readonly movedToRecycleBin: boolean;
}