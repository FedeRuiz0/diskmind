import { Bot, DatabaseZap, History, ScanSearch, ShieldCheck, Sparkles } from "lucide-react";

import { BackendStatus } from "@features/scanner/components/BackendStatus";
import { ThemeToggle } from "@features/settings/components/ThemeToggle";
import { Badge } from "@shared/ui/badge";
import { Button } from "@shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@shared/ui/card";

const roadmap = [
  {
    title: "Scanner modular en Rust",
    description: "Recorrido incremental de discos y carpetas con eventos de progreso hacia React.",
    icon: ScanSearch,
  },
  {
    title: "Limpieza segura",
    description: "Simulación obligatoria, auditoría e integración con papelera antes de borrar nada.",
    icon: ShieldCheck,
  },
  {
    title: "Historial verificable",
    description: "Registro local de análisis, simulaciones y operaciones para revertibilidad y trazabilidad.",
    icon: History,
  },
  {
    title: "IA local futura",
    description: "Capa desacoplada preparada para recomendaciones sin bloquear la UI ni depender de nube.",
    icon: Bot,
  },
];

export function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6">
        <header className="flex items-center justify-between border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
              <DatabaseZap className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">DiskMind</p>
              <h1 className="text-2xl font-semibold tracking-tight">Base desktop profesional</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Tauri + Rust</Badge>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-8 lg:grid-cols-[1.35fr_0.65fr]">
          <Card className="overflow-hidden border-border/70 bg-card/80 shadow-2xl shadow-black/10">
            <CardHeader className="space-y-4">
              <Badge className="w-fit gap-1" variant="outline">
                <Sparkles className="h-3.5 w-3.5" /> Arquitectura lista para crecer
              </Badge>
              <div className="space-y-3">
                <CardTitle className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
                  Análisis inteligente y limpieza segura, sin Electron.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  React renderiza una UI ligera y desacoplada; Rust/Tauri queda reservado para filesystem,
                  operaciones costosas, seguridad y eventos de progreso en tiempo real.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button disabled>Iniciar análisis (próxima fase)</Button>
                <Button variant="outline" disabled>
                  Simular limpieza
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {roadmap.map((item) => (
                  <article key={item.title} className="rounded-xl border bg-background/60 p-4">
                    <item.icon className="mb-4 h-6 w-6 text-primary" />
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <BackendStatus />
            <Card>
              <CardHeader>
                <CardTitle>Principios de seguridad</CardTitle>
                <CardDescription>Reglas base para las futuras operaciones de disco.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Nunca borrar directamente: usar papelera y confirmaciones explícitas.</li>
                  <li>• Toda limpieza comienza como simulación auditable.</li>
                  <li>• React no escanea discos ni calcula árboles pesados.</li>
                  <li>• Los comandos Tauri validan entradas y emiten progreso granular.</li>
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
