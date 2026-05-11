import { Activity, Cpu, HardDrive } from "lucide-react";

import { useBackendHealth } from "@shared/hooks/useBackendHealth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";

export function BackendStatus() {
  const { data, isLoading, error } = useBackendHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" /> Estado del backend
        </CardTitle>
        <CardDescription>Handshake mínimo con Rust sin implementar scanner todavía.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/40 p-4 text-sm">
          {isLoading ? (
            <p className="text-muted-foreground">Conectando con Tauri...</p>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : (
            <div className="space-y-2">
              <p className="font-medium">{data?.appName}</p>
              <p className="text-muted-foreground">{data?.message}</p>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border p-3">
            <Cpu className="mb-2 h-4 w-4 text-primary" />
            <p className="font-medium">Lógica pesada</p>
            <p className="text-muted-foreground">Rust</p>
          </div>
          <div className="rounded-lg border p-3">
            <HardDrive className="mb-2 h-4 w-4 text-primary" />
            <p className="font-medium">Filesystem</p>
            <p className="text-muted-foreground">Tauri commands</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
