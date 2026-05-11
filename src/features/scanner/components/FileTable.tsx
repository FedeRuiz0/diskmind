import { Trash2 } from "lucide-react";

import { formatBytes, formatDate } from "@features/scanner/lib/formatters";
import type { ScannedFile, SafetyClass } from "@shared/types/backend";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";

const classificationStyles: Record<SafetyClass, string> = {
  likelySafe: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  probablySafe: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  caution: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  dangerous: "border-red-400/30 bg-red-400/10 text-red-300",
};

const classificationLabel: Record<SafetyClass, string> = {
  likelySafe: "Likely safe",
  probablySafe: "Probably safe",
  caution: "Caution",
  dangerous: "Dangerous",
};

interface FileTableProps {
  readonly files: ScannedFile[];
  readonly isScanning: boolean;
  readonly onRequestDelete: (file: ScannedFile) => void;
}

export function FileTable({ files, isScanning, onRequestDelete }: FileTableProps) {
  return (
    <Card className="overflow-hidden border-border/70 bg-card/70 shadow-2xl shadow-black/10 backdrop-blur">
      <CardHeader className="flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Large files</CardTitle>
          <CardDescription>Virtualization-ready rows sorted and filtered on the client.</CardDescription>
        </div>
        <Badge variant="secondary">{files.length.toLocaleString()} shown</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-[minmax(320px,1fr)_120px_110px_minmax(240px,0.8fr)_90px] border-y bg-muted/40 px-5 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>File</span>
          <span>Size</span>
          <span>Modified</span>
          <span>AI recommendation</span>
          <span className="text-right">Action</span>
        </div>

        <div className="max-h-[520px] overflow-auto" data-virtualized-list="ready" role="list">
          {isScanning ? <LoadingRows /> : null}
          {!isScanning && files.length === 0 ? <EmptyState /> : null}
          {!isScanning
            ? files.map((file) => (
                <article
                  className="grid grid-cols-[minmax(320px,1fr)_120px_110px_minmax(240px,0.8fr)_90px] items-center gap-4 border-b px-5 py-4 text-sm transition hover:bg-muted/30"
                  key={file.path}
                  role="listitem"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{file.path}</p>
                  </div>
                  <div className="font-semibold tabular-nums">{formatBytes(file.size)}</div>
                  <div className="text-muted-foreground">{formatDate(file.modified)}</div>
                  <div className="min-w-0">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${classificationStyles[file.recommendation.classification]}`}
                    >
                      {classificationLabel[file.recommendation.classification]}
                    </span>
                    <p className="mt-2 truncate text-xs text-muted-foreground" title={file.recommendation.explanation}>
                      {file.recommendation.label} · {file.recommendation.explanation}
                    </p>
                  </div>
                  <div className="text-right">
                    <Button
                      disabled={file.recommendation.classification === "dangerous"}
                      onClick={() => onRequestDelete(file)}
                      size="icon"
                      title="Move to recycle bin"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))
            : null}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingRows() {
  return Array.from({ length: 8 }).map((_, index) => (
    <div
      className="grid grid-cols-[minmax(320px,1fr)_120px_110px_minmax(240px,0.8fr)_90px] items-center gap-4 border-b px-5 py-4"
      key={index}
    >
      <div className="space-y-2">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted/70" />
      </div>
      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      <div className="h-8 w-full animate-pulse rounded bg-muted" />
      <div className="h-8 w-8 animate-pulse rounded bg-muted" />
    </div>
  ));
}

function EmptyState() {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="max-w-sm">
        <p className="text-lg font-semibold">No files to show</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Scan a drive or adjust search and filters. DiskMind keeps only the largest results in memory during backend
          scanning.
        </p>
      </div>
    </div>
  );
}