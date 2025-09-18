# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OptimAI Core Node - An Electron desktop application with React and TypeScript that provides a node client for the OptimAI network. The app manages a wrapped CLI binary and provides mining, authentication, and node management functionality.

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

### Utilities
- `npm run download-binary` - Download/refresh the bundled CLI binary

## Architecture

### Process Architecture
The application follows Electron's multi-process architecture:
- **Main Process** (`src/main/`): Manages app lifecycle, spawns CLI process, handles IPC
- **Preload Scripts** (`src/preload/`): Sandboxed bridges between main and renderer
- **Renderer Process** (`src/renderer/`): React 19 UI application

### CLI Integration
The app wraps a CLI binary (`applications/node/bin/node_cli`) that runs as a separate process:
1. **API Server**: Spawned via `node_cli api-server --port <dynamic> --data-dir <userData>/node`
2. **Health Monitoring**: Polls `/health` endpoint until ready
3. **IPC Bridge**: Exposes port to renderer via IPC channels
4. **Auto-restart**: Up to 5 automatic restarts on unexpected CLI exits
5. **WebSocket**: Real-time updates via `ws://127.0.0.1:<port>/ws`

### Key Directories
- `applications/` - Packaged CLI binaries and wrappers
- `injections/` - Monorepo for browser injection scripts (pnpm workspace)
- `tmp/applications/` - Development mirror of application binaries
- `dist/` - Production build outputs
- `out/` - Development build outputs

### Data Storage
- CLI state: `app.getPath('userData')/node/` (encrypted)
- Environment configs: `.env` (app config), `electron-builder.env` (build/publish)

## API Endpoints

The CLI exposes these key endpoints:
- `/auth/login` - Authentication
- `/node/start`, `/node/stop` - Node control
- `/uptime/progress` - Uptime tracking
- `/api/mining/assignments` - Mining operations
- `/health` - Server health check

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

- The CLI binary must be refreshed before packaging using `npm run download-binary`
- In development, binaries are mirrored to `tmp/applications/`
- Never commit `.env` or `electron-builder.env` files
- The WebSocket connection provides real-time updates from the CLI
- Feature folders should align across main, preload, and renderer directories