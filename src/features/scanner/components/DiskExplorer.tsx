import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, DatabaseZap, ShieldCheck } from "lucide-react";

import { DeleteConfirmationModal } from "@features/scanner/components/DeleteConfirmationModal";
import { DriveSelector } from "@features/scanner/components/DriveSelector";
import { FileTable } from "@features/scanner/components/FileTable";
import { ScanControls } from "@features/scanner/components/ScanControls";
import { formatBytes } from "@lib/formatters";
import { useScanStore } from "@features/scanner/store/useScanStore";
import { ThemeToggle } from "@features/settings/components/ThemeToggle";
import type { ScannedFile } from "@shared/types/backend";
import { Badge } from "@shared/ui/badge";
import { Card, CardContent } from "@shared/ui/card";

export function DiskExplorer() {
  const [pendingDelete, setPendingDelete] = useState<ScannedFile | null>(null);
  const {
    drives,
    selectedDrive,
    files,
    scanMeta,
    isLoadingDrives,
    isScanning,
    isRecycling,
    error,
    query,
    sortKey,
    classificationFilter,
    minSizeMb,
    loadDrives,
    selectDrive,
    scanSelectedDrive,
    setQuery,
    setSortKey,
    setClassificationFilter,
    setMinSizeMb,
    recycleFile,
  } = useScanStore();

  useEffect(() => {
    void loadDrives();
  }, [loadDrives]);

  const visibleFiles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const minBytes = minSizeMb * 1024 * 1024;

    return files
      .filter((file) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          file.name.toLowerCase().includes(normalizedQuery) ||
          file.path.toLowerCase().includes(normalizedQuery) ||
          file.extension.toLowerCase().includes(normalizedQuery);
        const matchesClass =
          classificationFilter === "all" || file.recommendation.classification === classificationFilter;
        const matchesSize = file.size >= minBytes;
        return matchesQuery && matchesClass && matchesSize;
      })
      .sort((a, b) => {
        if (sortKey === "date") {
          return Number(b.modified ?? 0) - Number(a.modified ?? 0);
        }
        if (sortKey === "type") {
          return a.extension.localeCompare(b.extension) || b.size - a.size;
        }
        return b.size - a.size;
      });
  }, [classificationFilter, files, minSizeMb, query, sortKey]);

  const totalVisibleBytes = visibleFiles.reduce((total, file) => total + file.size, 0);

  async function confirmRecycle(file: ScannedFile) {
    await recycleFile(file.path);
    setPendingDelete(null);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.22),transparent_32rem),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.16),transparent_28rem)]" />
      <section className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 px-6 py-6">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
              <DatabaseZap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">DiskMind Explorer</p>
              <h1 className="text-2xl font-semibold tracking-tight">Large-file intelligence for your disks</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="gap-1" variant="secondary">
              <BrainCircuit className="h-3.5 w-3.5" /> AI triage
            </Badge>
            <Badge className="gap-1" variant="outline">
              <ShieldCheck className="h-3.5 w-3.5" /> Recycle bin only
            </Badge>
            <ThemeToggle />
          </div>
        </header>

        <DriveSelector
          drives={drives}
          isLoading={isLoadingDrives}
          onRefresh={loadDrives}
          onSelect={selectDrive}
          selectedDrive={selectedDrive}
        />

        <ScanControls
          canScan={Boolean(selectedDrive)}
          classificationFilter={classificationFilter}
          isScanning={isScanning}
          minSizeMb={minSizeMb}
          onClassificationChange={setClassificationFilter}
          onMinSizeChange={setMinSizeMb}
          onQueryChange={setQuery}
          onScan={scanSelectedDrive}
          onSortChange={setSortKey}
          query={query}
          sortKey={sortKey}
        />

        {error ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
          <FileTable files={visibleFiles} isScanning={isScanning} onRequestDelete={setPendingDelete} />

          <aside className="space-y-4">
            <MetricCard label="Visible reclaim candidates" value={formatBytes(totalVisibleBytes)} />
            <MetricCard label="Files scanned" value={scanMeta ? scanMeta.scannedFiles.toLocaleString() : "—"} />
            <MetricCard label="Skipped entries" value={scanMeta ? scanMeta.skippedEntries.toLocaleString() : "—"} />
            <Card className="border-border/70 bg-card/70 backdrop-blur">
              <CardContent className="p-5 text-sm leading-6 text-muted-foreground">
                DiskMind scans recursively in Rust, keeps a bounded largest-file heap, and sends only the top results to
                React. Destructive actions are never automatic and protected system paths are blocked.
              </CardContent>
            </Card>
          </aside>
        </section>
      </section>

      <DeleteConfirmationModal
        file={pendingDelete}
        isRecycling={isRecycling}
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmRecycle}
      />
    </main>
  );
}

function MetricCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <Card className="border-border/70 bg-card/70 backdrop-blur">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}