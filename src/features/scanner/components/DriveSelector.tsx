import { RefreshCcw } from "lucide-react";

import { DriveCard } from "@features/scanner/components/DriveCard";
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";
import type { DriveInfo } from "@shared/types/backend";

interface DriveSelectorProps {
  readonly drives: DriveInfo[];
  readonly selectedDrive: DriveInfo | null;
  readonly isLoading: boolean;
  readonly onRefresh: () => void;
  readonly onSelect: (drive: DriveInfo) => void;
}

export function DriveSelector({ drives, selectedDrive, isLoading, onRefresh, onSelect }: DriveSelectorProps) {
  return (
    <Card className="border-border/70 bg-card/70 shadow-2xl shadow-black/10 backdrop-blur">
      <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Available drives</CardTitle>
          <CardDescription>Select a Windows drive and scan for the largest files.</CardDescription>
        </div>
        <Button disabled={isLoading} onClick={onRefresh} size="sm" variant="outline">
          <RefreshCcw className="mr-2 h-3.5 w-3.5" />
          {isLoading ? "Detecting" : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {drives.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {drives.map((drive) => (
              <DriveCard
                drive={drive}
                isSelected={selectedDrive?.mountPath === drive.mountPath}
                key={drive.mountPath}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed bg-background/40 p-8 text-center text-sm text-muted-foreground">
            {isLoading ? "Detecting local drives…" : "No drives detected yet. Refresh to try again."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}