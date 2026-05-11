import { HardDrive } from "lucide-react";

import { formatBytes, formatPercent } from "@lib/formatters";
import { cn } from "@lib/utils";
import type { DriveInfo } from "@shared/types/backend";

interface DriveCardProps {
  readonly drive: DriveInfo;
  readonly isSelected: boolean;
  readonly onSelect: (drive: DriveInfo) => void;
}

export function DriveCard({ drive, isSelected, onSelect }: DriveCardProps) {
  return (
    <button
      className={cn(
        "group rounded-2xl border bg-card/70 p-4 text-left shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-card/95 hover:shadow-xl",
        isSelected && "border-primary/70 bg-primary/10 shadow-primary/10",
      )}
      onClick={() => onSelect(drive)}
      type="button"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2.5 text-primary ring-1 ring-primary/20">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Drive</p>
            <h3 className="text-xl font-semibold tracking-tight">{drive.letter}</h3>
          </div>
        </div>
        <span className="rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium">
          {formatPercent(drive.usagePercent)} used
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500"
          style={{ width: `${Math.min(Math.max(drive.usagePercent, 0), 100)}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Used</dt>
          <dd className="font-medium">{formatBytes(drive.usedSpace)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Free</dt>
          <dd className="font-medium">{formatBytes(drive.freeSpace)}</dd>
        </div>
      </dl>
    </button>
  );
}