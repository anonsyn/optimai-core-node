# Repository Guidelines

## Project Layout & Runtime

Electron sources live in `src/main` (process lifecycle and IPC), `src/preload` (sandboxed bridges), and `src/renderer` (React 19 UI). Node execution logic now lives fully inside `src/main/node`, where the runtime manages uptime tracking, mining, and OptimAI API calls without spawning an external binary. Auxiliary scripts sit in `scripts/`, while build outputs drop into `out/` for dev and `dist/` for installers.

## Build & Development Commands

Run `npm install` once; the postinstall step installs and builds the `injections/` workspace. `npm run dev` launches Electron and the injection dev server, while `npm run dev:electron` targets only the desktop shell. Ship builds with `npm run build`, or `npm run build:mac|win|linux` for platform installers. Lint and format with `npm run lint` and `npm run format`; type safety comes from `npm run typecheck`.

## Node Runtime & Integration Flow

`src/main/node/node-runtime.ts` owns the node lifecycle directly: it ensures the authenticated user, registers the device, and then coordinates the uptime runner and mining worker. Renderer requests travel through IPC handlers in `src/main/ipc/node`, which proxy to the runtime for operations like starting/stopping the node, tracking mining assignments, and emitting status events. Networking now goes straight to OptimAI endpoints via the shared Axios client, and event emitters surface real-time updates to the renderer without a WebSocket bridge.

## Coding Style & Naming

Follow Prettier (with Tailwind plugin) and ESLint defaults; keep two-space indentation. Use PascalCase for React components, camelCase for functions and variables, and SCREAMING_SNAKE_CASE only for preload constants. Align feature folders between `main`, `preload`, and `renderer`, and keep filenames kebab-case in the renderer.

## Testing & Verification

Automated coverage is sparse; enforce lint, format, and typecheck at minimum. When adding tests, co-locate `<name>.spec.ts` files and run them with `tsx`. For runtime changes, document manual node start/stop flows, uptime tracking checks, and mining assignment handling in PRs.

## Commit, PR, & Security Notes

Write short imperative commits (`Add API server health check`). PRs need a summary, linked issues, UI evidence, and the commands you ran. Highlight changes that affect packaging, updater config, or node runtime behavior. Never commit secrets; rely on `.example` files and confirm `electron-builder.env` values before publishing.
