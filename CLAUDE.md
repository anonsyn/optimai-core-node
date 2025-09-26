# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OptimAI Core Node - An Electron desktop application with React and TypeScript that provides a node client for the OptimAI network. The app embeds the full node runtime (uptime tracker, mining worker, auth flows) within the Electron main process.

## Essential Commands

### Development

- `npm install` - Install dependencies (runs postinstall for injections workspace)
- `npm run dev` - Start Electron app and injection dev server concurrently
- `npm run dev:electron` - Start only the Electron app (without injections)
- `npm run dev:injections` - Start only the injections dev server

### Building & Testing

- `npm run lint` - Run ESLint checks
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking for both node and web
- `npm run build` - Full build with type checking and injections
- `npm run build:win` - Build Windows installer
- `npm run build:mac` - Build macOS installer
- `npm run build:linux` - Build Linux installer

## Architecture

### Process Architecture

The application follows Electron's multi-process architecture:

- **Main Process** (`src/main/`): Manages app lifecycle, hosts the node runtime, handles IPC
- **Preload Scripts** (`src/preload/`): Sandboxed bridges between main and renderer
- **Renderer Process** (`src/renderer/`): React 19 UI application

### Node Runtime

The node runtime in `src/main/node` coordinates the OptimAI workflow directly:

1. **Authentication & Device**: Ensures valid tokens and registers the device before starting
2. **Uptime Tracking**: `UptimeRunner` records availability and emits reward cycles
3. **Mining Worker**: `MiningWorker` polls assignments and reports completion/status updates
4. **IPC Bridge**: `src/main/ipc/node` exposes start/stop/status handlers and event broadcasts
5. **Error Handling**: Centralized logging and status transitions keep the renderer informed

### Key Directories

- `src/main/node/` - Node runtime (uptime runner, mining worker, device registration)
- `injections/` - Monorepo for browser injection scripts (pnpm workspace)
- `dist/` - Production build outputs
- `out/` - Development build outputs

### Data Storage

- Node state: `app.getPath('userData')/node/` (encrypted)
- Environment configs: `.env` (app config), `electron-builder.env` (build/publish)

## API Endpoints

The runtime now calls OptimAI services directly through the shared Axios client:

- `/auth/login` and `/auth/me` - Authentication flows
- `/node/start`, `/node/stop`, `/node/status` - Node control
- `/uptime/progress` - Uptime tracking
- `/api/mining/assignments` - Mining operations

## Development Workflow

### Environment Setup

1. Copy `.env.example` to `.env` and configure required variables
2. For publishing: Copy `electron-builder.env.example` to `electron-builder.env`

### Code Style

- Prettier with Tailwind plugin (2-space indentation)
- ESLint with TypeScript configuration
- PascalCase for React components
- camelCase for functions/variables
- kebab-case for renderer filenames
- SCREAMING_SNAKE_CASE only for preload constants

### Working with Injections

The `injections/` directory is a pnpm workspace containing browser injection scripts:

- Run `cd injections && pnpm install` to set up
- Use `pnpm build` to build all packages
- Individual packages: `pnpm --filter @xagent/injection-x build`

## Important Notes

- Never commit `.env` or `electron-builder.env` files
- Feature folders should align across main, preload, and renderer directories
- The renderer consumes runtime updates via IPC events dispatched from `nodeRuntime`
