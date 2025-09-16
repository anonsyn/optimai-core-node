# Repository Guidelines

## Project Layout & Runtime
Electron sources live in `src/main` (process lifecycle and IPC), `src/preload` (sandboxed bridges), and `src/renderer` (React 19 UI). Packaged binaries, including the CLI wrapper, reside under `applications/`; in dev we mirror them into `tmp/applications` so the Electron shell can spawn them. The wrapped CLI (`applications/node/bin/node_cli`) stores encrypted state in `app.getPath('userData')/node` via its `--data-dir` flag. Auxiliary scripts sit in `scripts/`, while build outputs drop into `out/` for dev and `dist/` for installers.

## Build & Development Commands
Run `npm install` once; the postinstall step installs and builds the `injections/` workspace. `npm run dev` launches Electron and the injection dev server, while `npm run dev:electron` targets only the desktop shell. Ship builds with `npm run build`, or `npm run build:mac|win|linux` for platform installers. Lint and format with `npm run lint` and `npm run format`; type safety comes from `npm run typecheck`. Use `npm run download-binary` to refresh the bundled CLI before packaging.

## CLI API & Integration Flow
`src/main/node/api-server.ts` spawns the CLI with `node_cli api-server --port <dynamic> --no-reload --data-dir <appData>/node`, polls `/health`, then exposes the chosen port to renderers through IPC. All auth, node control, uptime, and mining actions flow through `apiClient` hitting endpoints such as `/auth/login`, `/node/start`, `/uptime/progress`, and `/api/mining/assignments`. Real-time updates arrive over `ws://127.0.0.1:<port>/ws` via `websocketClient`, and unexpected CLI exits trigger up to five automated restarts.

## Coding Style & Naming
Follow Prettier (with Tailwind plugin) and ESLint defaults; keep two-space indentation. Use PascalCase for React components, camelCase for functions and variables, and SCREAMING_SNAKE_CASE only for preload constants. Align feature folders between `main`, `preload`, and `renderer`, and keep filenames kebab-case in the renderer.

## Testing & Verification
Automated coverage is sparse; enforce lint, format, and typecheck at minimum. When adding tests, co-locate `<name>.spec.ts` files and run them with `tsx`. For CLI changes, document manual runs (`node_cli node start`, API server smoke tests, WebSocket verification) in PRs.

## Commit, PR, & Security Notes
Write short imperative commits (`Add API server health check`). PRs need a summary, linked issues, UI evidence, and the commands you ran. Highlight changes that affect packaging, updater config, or CLI binaries. Never commit secrets; rely on `.example` files, verify binaries fetched by helper scripts, and confirm `electron-builder.env` values before publishing.
