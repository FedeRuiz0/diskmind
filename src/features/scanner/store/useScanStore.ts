import { create } from "zustand";

import { listDrives, moveFileToRecycleBin, scanDrive } from "@shared/api/disk";
import type { DriveInfo, ScannedFile, ScanResponse } from "@shared/types/backend";

export type SortKey = "size" | "date" | "type";
export type ClassificationFilter = "all" | "likelySafe" | "probablySafe" | "caution" | "dangerous";

interface ScanState {
  readonly drives: DriveInfo[];
  readonly selectedDrive: DriveInfo | null;
  readonly files: ScannedFile[];
  readonly scanMeta: Omit<ScanResponse, "files"> | null;
  readonly isLoadingDrives: boolean;
  readonly isScanning: boolean;
  readonly isRecycling: boolean;
  readonly error: string | null;
  readonly query: string;
  readonly sortKey: SortKey;
  readonly classificationFilter: ClassificationFilter;
  readonly minSizeMb: number;
  loadDrives: () => Promise<void>;
  selectDrive: (drive: DriveInfo) => void;
  scanSelectedDrive: () => Promise<void>;
  setQuery: (query: string) => void;
  setSortKey: (sortKey: SortKey) => void;
  setClassificationFilter: (classificationFilter: ClassificationFilter) => void;
  setMinSizeMb: (minSizeMb: number) => void;
  recycleFile: (path: string) => Promise<void>;
}

export const useScanStore = create<ScanState>((set, get) => ({
  drives: [],
  selectedDrive: null,
  files: [],
  scanMeta: null,
  isLoadingDrives: false,
  isScanning: false,
  isRecycling: false,
  error: null,
  query: "",
  sortKey: "size",
  classificationFilter: "all",
  minSizeMb: 0,

  async loadDrives() {
    set({ isLoadingDrives: true, error: null });
    try {
      const drives = await listDrives();
      set((state) => ({
        drives,
        selectedDrive: state.selectedDrive ?? drives[0] ?? null,
        isLoadingDrives: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), isLoadingDrives: false });
    }
  },

  selectDrive(drive) {
    set({ selectedDrive: drive, files: [], scanMeta: null, error: null });
  },

  async scanSelectedDrive() {
    const drive = get().selectedDrive;
    if (!drive) {
      set({ error: "Select a drive before scanning." });
      return;
    }

    set({ isScanning: true, error: null, files: [], scanMeta: null });
    try {
      const response = await scanDrive(drive.mountPath);
      const { files, ...scanMeta } = response;
      set({ files, scanMeta, isScanning: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), isScanning: false });
    }
  },

  setQuery(query) {
    set({ query });
  },

  setSortKey(sortKey) {
    set({ sortKey });
  },

  setClassificationFilter(classificationFilter) {
    set({ classificationFilter });
  },

  setMinSizeMb(minSizeMb) {
    set({ minSizeMb });
  },

  async recycleFile(path) {
    set({ isRecycling: true, error: null });
    try {
      await moveFileToRecycleBin(path);
      set((state) => ({
        files: state.files.filter((file) => file.path !== path),
        isRecycling: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : String(error), isRecycling: false });
    }
  },
}));