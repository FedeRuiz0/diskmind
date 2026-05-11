# DiskMind

DiskMind es una base desktop moderna para una futura aplicación de análisis inteligente y limpieza segura de discos. El proyecto evita Electron y separa estrictamente responsabilidades: React solo renderiza UI y estado ligero, mientras Rust/Tauri queda reservado para filesystem, seguridad, trabajos pesados y comunicación por comandos/eventos.

## Stack

- React + Vite + TypeScript estricto para UI rápida y mantenible.
- Tauri 2 + Rust para integración nativa, bajo consumo y operaciones seguras.
- TailwindCSS + shadcn/ui para un sistema visual moderno con dark mode.
- Zustand para estado de preferencias y, en futuras fases, estado de sesión desacoplado.

## Arquitectura inicial

```text
.
├── src/
│   ├── app/                 # Composición raíz de la aplicación React
│   ├── features/            # Features verticales: scanner, cleanup, history, assistant
│   ├── lib/                 # Utilidades compartidas sin acoplar a UI
│   ├── shared/
│   │   ├── api/             # Cliente Tauri invoke/event abstractions
│   │   ├── hooks/           # Hooks React finos sobre APIs y stores
│   │   ├── layout/          # Layouts reutilizables futuros
│   │   ├── store/           # Stores Zustand pequeños y por dominio
│   │   ├── types/           # Contratos TypeScript del frontend
│   │   └── ui/              # Componentes shadcn/ui versionados en el repo
│   └── styles/              # Tailwind y tokens visuales
└── src-tauri/
    ├── capabilities/        # Permisos Tauri mínimos por ventana
    └── src/                 # Comandos Rust, módulos de dominio y lógica pesada futura
```

## Setup local

```bash
npm install
npm run tauri:dev
```

Para validar sin abrir la app:

```bash
npm run typecheck
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

> Nota: en este bootstrap aún no se implementa el scanner de discos. Solo existe un comando `get_backend_health` para validar la integración React ↔ Tauri ↔ Rust.

## Reglas de diseño y seguridad

- No usar Electron.
- No mezclar lógica pesada en React.
- No recorrer discos ni calcular árboles de archivos en el frontend.
- Todo acceso a filesystem debe pasar por comandos Rust validados.
- Toda operación destructiva futura debe iniciar con simulación, confirmación explícita, auditoría e integración con papelera.
- El backend debe emitir progreso granular para mantener la UI fluida.
- Los stores Zustand deben ser pequeños, serializables cuando aplique y separados por dominio.

## Roadmap técnico sugerido

1. Definir contratos compartidos para `ScanRequest`, `ScanProgress`, `ScanSummary` y `CleanupPlan`.
2. Implementar scanner Rust incremental con cancelación, límites de concurrencia y eventos Tauri.
3. Persistir historial local con SQLite o un formato append-only auditado.
4. Integrar envío a papelera usando crate nativa y política de fallback segura por Windows.
5. Añadir capa `assistant` desacoplada para IA local futura, sin bloquear la UI ni requerir nube.
