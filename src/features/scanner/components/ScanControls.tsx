import { Filter, Search, Sparkles } from "lucide-react";

import type { ClassificationFilter, SortKey } from "@features/scanner/store/useScanStore";
import { Button } from "@shared/ui/button";
import { Card, CardContent } from "@shared/ui/card";

interface ScanControlsProps {
  readonly query: string;
  readonly sortKey: SortKey;
  readonly classificationFilter: ClassificationFilter;
  readonly minSizeMb: number;
  readonly isScanning: boolean;
  readonly canScan: boolean;
  readonly onQueryChange: (query: string) => void;
  readonly onSortChange: (sortKey: SortKey) => void;
  readonly onClassificationChange: (filter: ClassificationFilter) => void;
  readonly onMinSizeChange: (value: number) => void;
  readonly onScan: () => void;
}

export function ScanControls(props: ScanControlsProps) {
  return (
    <Card className="border-border/70 bg-card/70 backdrop-blur">
      <CardContent className="grid gap-3 p-4 lg:grid-cols-[1fr_auto_auto_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-xl border bg-background/70 pl-9 pr-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            onChange={(event) => props.onQueryChange(event.target.value)}
            placeholder="Search by name, path, or extension…"
            value={props.query}
          />
        </label>

        <label className="flex h-10 items-center gap-2 rounded-xl border bg-background/70 px-3 text-sm">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-transparent outline-none"
            onChange={(event) => props.onClassificationChange(event.target.value as ClassificationFilter)}
            value={props.classificationFilter}
          >
            <option value="all">All recommendations</option>
            <option value="likelySafe">Likely safe</option>
            <option value="probablySafe">Probably safe</option>
            <option value="caution">Caution</option>
            <option value="dangerous">Dangerous</option>
          </select>
        </label>

        <label className="flex h-10 items-center gap-2 rounded-xl border bg-background/70 px-3 text-sm">
          Sort
          <select
            className="bg-transparent font-medium outline-none"
            onChange={(event) => props.onSortChange(event.target.value as SortKey)}
            value={props.sortKey}
          >
            <option value="size">Size</option>
            <option value="date">Date</option>
            <option value="type">Type</option>
          </select>
        </label>

        <label className="flex h-10 items-center gap-2 rounded-xl border bg-background/70 px-3 text-sm">
          Min MB
          <input
            className="w-20 bg-transparent font-medium outline-none"
            min={0}
            onChange={(event) => props.onMinSizeChange(Number(event.target.value) || 0)}
            type="number"
            value={props.minSizeMb}
          />
        </label>

        <Button disabled={!props.canScan || props.isScanning} onClick={props.onScan}>
          <Sparkles className="mr-2 h-4 w-4" />
          {props.isScanning ? "Scanning…" : "Scan drive"}
        </Button>
      </CardContent>
    </Card>
  );
}