import { AlertTriangle, Trash2 } from "lucide-react";

import { formatBytes } from "@features/scanner/lib/formatters";
import type { ScannedFile } from "@shared/types/backend";
import { Button } from "@shared/ui/button";

interface DeleteConfirmationModalProps {
  readonly file: ScannedFile | null;
  readonly isRecycling: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: (file: ScannedFile) => void;
}

export function DeleteConfirmationModal({ file, isRecycling, onCancel, onConfirm }: DeleteConfirmationModalProps) {
  if (!file) {
    return null;
  }

  const isDangerous = file.recommendation.classification === "dangerous";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-destructive/10 p-3 text-destructive ring-1 ring-destructive/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Move file to recycle bin?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              DiskMind never auto-deletes files. This action uses the OS recycle bin so the file can be restored when
              supported by Windows.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border bg-background/60 p-4">
          <p className="break-all font-medium">{file.name}</p>
          <p className="mt-1 break-all text-xs text-muted-foreground">{file.path}</p>
          <p className="mt-3 text-sm text-muted-foreground">Size: {formatBytes(file.size)}</p>
        </div>

        {isDangerous && (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            DiskMind blocks critical system paths. This file cannot be removed from the app.
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button disabled={isRecycling || isDangerous} onClick={() => onConfirm(file)} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            {isRecycling ? "Moving…" : "Move to recycle bin"}
          </Button>
        </div>
      </div>
    </div>
  );
}