# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OptimAI Core Node - An Electron desktop application with React and TypeScript that runs a network node for the OptimAI platform. The node performs two primary functions: **uptime tracking** (earning rewards for availability) and **mining tasks** (web scraping assignments). All node logic is implemented directly in TypeScript within the Electron main process—no external binaries.

## Essential Commands

### Development

- `yarn install` - Install dependencies (runs postinstall for injections workspace)
- `yarn dev` - Start Electron app and injection dev server concurrently
- `yarn dev:electron` - Start only the Electron app (without injections)
- `yarn dev:injections` - Start only the injections dev server

### Building & Testing

- `yarn lint` - Run ESLint checks
- `yarn format` - Format code with Prettier
- `yarn typecheck` - Run TypeScript type checking for both node and web
- `yarn typecheck:node` - Type check main process only
- `yarn typecheck:web` - Type check renderer process only
- `yarn build` - Full build with type checking and injections
- `yarn build:injections` - Build injections packages only
- `yarn build:win` - Build Windows installer
- `yarn build:mac` - Build macOS installer (x86_64)
- `yarn build:linux` - Build Linux installer
- `yarn deploy:mac` - Build and publish macOS installer (forces x86_64 arch)

## Architecture

### Process Architecture

The application follows Electron's multi-process architecture:

- **Main Process** (`src/main/`): Manages app lifecycle, hosts the node runtime, handles IPC
- **Preload Scripts** (`src/preload/`): Sandboxed bridges between main and renderer
- **Renderer Process** (`src/renderer/`): React 19 UI application

### Node Runtime (`src/main/node/`)

The `NodeRuntime` class orchestrates all node operations in TypeScript:

**Key Components**:

1. **NodeRuntime** (`node-runtime.ts`): Central coordinator
   - Manages lifecycle: `start()`, `stop()`, `restartMining()`
   - Emits events to renderer via IPC bridge
   - Coordinates UptimeRunner and MiningWorker
   - Handles authentication and device registration

2. **UptimeRunner** (`uptime-runner.ts`): Availability tracking
   - Polls `/api/uptime/online` every 10 seconds
   - Tracks uptime cycles and emits reward events
   - Stores cycle data in encrypted local storage
   - Emits: `reward`, `cycle`, `error`

3. **MiningWorker** (`mining-worker.ts`): Web scraping task executor
   - Fetches assignments from `/api/mining/assignments`
   - Uses Docker + Playwright crawler to scrape websites
   - Processes assignments via PQueue (controlled concurrency)
   - Submits results back to `/api/mining/assignments/:id/submit`
   - Emits: `assignments`, `assignmentStarted`, `assignmentCompleted`, `error`, `statusChanged`

4. **Device Registration** (`register-device.ts`):
   - Registers device with backend before node starts
   - Collects system info: OS, architecture, GPU details
   - Required before uptime/mining can begin

**NodeRuntime Events** (broadcast to renderer):
- `status` - Node status changes (Idle, Starting, Running, Stopping)
- `uptime-reward` - Uptime reward earned
- `uptime-cycle` - Uptime cycle updated
- `mining-assignments` - New assignments fetched
- `mining-assignment-started` - Assignment processing started
- `mining-assignment-completed` - Assignment completed
- `mining-error` - Mining error occurred
- `mining-status-changed` - Mining worker status changed
- `error` - Runtime error occurred

### Mining Task Flow

1. **Assignment Fetch**:
   - `MiningWorker` polls `/api/mining/assignments` every 30s
   - Filters by device_id to get relevant assignments
   - Assignments include: URL, platform, search query, metadata

2. **Docker Initialization**:
   - Checks Docker availability on startup
   - Downloads `crawl4ai` Docker image if needed
   - Initializes crawler service with Playwright

3. **Task Processing**:
   - Assignments queued in PQueue (concurrency control)
   - Each assignment processed by crawler service
   - Browser automation via Playwright in Docker container
   - Extracts content, metadata, tweets (for Twitter)
   - Measures execution time

4. **Result Submission**:
   - `POST /api/mining/assignments/:id/submit` with content/metadata
   - Backend validates and credits rewards
   - If failed: Can abandon with reason (invalid link, site down, etc.)

5. **Status Tracking**:
   - `MiningStatus`: Idle, Initializing, InitializingCrawler, Ready, Polling, Processing, Error, Stopped
   - Status changes emitted to renderer for UI updates

### Services (`src/main/services/`)

**docker-service.ts**: Docker management
- Checks Docker availability and version
- Pulls/manages `crawl4ai` Docker images
- Monitors Docker daemon health

**crawler-service.ts**: Playwright-based web scraping
- Initializes browser in Docker container
- Executes scraping tasks with timeout handling
- Handles Twitter-specific scraping logic
- Returns structured content + metadata

**crawl4ai-service.ts**: Legacy crawler (being phased out)
- Python-based crawler using crawl4ai library
- Still used for fallback scenarios

**download-service.ts**: File download utilities
- Used for Docker installer downloads on Windows/macOS
- Progress tracking with event emitters

### Storage (`src/main/storage/`)

All data encrypted using AES-256-GCM with machine-specific keys:

- **tokenStore**: Access/refresh tokens
- **userStore**: User profile data
- **deviceStore**: Device registration info
- **uptimeStore**: Uptime cycle data
- **rewardStore**: Latest reward notification

Storage location: `app.getPath('userData')/node/`

### IPC Communication

**Pattern**: Three-file structure per feature
1. `events.ts` - Event name constants
2. `index.ts` - Main process handlers (`ipcMain.handle()`)
3. `preload.ts` - Context bridge API exposure

**Node IPC** (`src/main/ipc/node/`):
- `startNode()` - Start node runtime
- `stopNode()` - Stop node runtime
- `restartMining()` - Restart mining worker
- `getNodeStatus()` - Get current status
- `getMiningStatus()` - Get mining worker status
- Event broadcasts for all NodeRuntime events

### Injections Workspace (`injections/`)

A pnpm workspace containing browser injection scripts:

**Packages**:
- `@xagent/scroll` - Auto-scroll functionality for crawling
- `@xagent/terminal` - Terminal UI components
- `@xagent/utils` - Shared utilities
- `@xagent/styles` - Shared styles

**Development**:
- Workspace managed by root yarn with injections/pnpm
- Use `yarn build:injections` to build all packages
- Individual package: `cd injections && pnpm --filter @xagent/scroll build`
- Dev mode: `yarn dev` runs both Electron and injections dev servers with hot reload

**Integration**:
- Built injections bundled with Electron app
- Loaded into web pages by crawler service
- Enable dynamic behavior injection during scraping

### State Management (Renderer)

**Redux Store** (`src/renderer/src/store/`):
- Slices: `auth`, `modals`, `header`, `online`, `checkin`, `node`
- Only `auth` slice persisted to localStorage
- Node slice tracks runtime status and mining assignments

**TanStack Query**:
- Central client in `src/renderer/src/queries/client.ts`
- 10s stale time, 1hr garbage collection time
- Queries organized by domain: `auth/`, `daily-tasks/`, `dashboard/`, `missions/`, `node-avail/`, `proxy/`, `referral/`
- Query cache persisted to localStorage

### Environment Configuration

Two separate env files required:

**`.env`** (Application config):
- `VITE_API_URL` - Backend API endpoint (default: https://api.optimai.network)
- `VITE_DASHBOARD_URL` - Web dashboard URL
- `VITE_CLIENT_APP_ID` - OAuth client ID
- `VITE_TELEGRAM_CLIENT_SECRET` - Telegram integration secret
- `VITE_DEVICE_SECRET` - Device authentication key
- `VITE_ENV` - Environment mode (development/production)
- Duration settings for node uptime tracking
- Copy from `.env.example` and fill in required values

**`electron-builder.env`** (Build/signing only):
- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` for code signing
- Only needed when publishing releases
- Copy from `electron-builder.env.example`

### Path Aliases

Configured in `electron.vite.config.ts`:
- `@/` → `src/renderer/src/` (renderer code)
- `@assets/` → `src/renderer/src/assets/` (images, animations)
- `@main/` → `src/main/` (main process utilities)

Always use aliases instead of relative paths like `../../../`.

## Key Implementation Details

### Mining Requirements

**Docker Dependency**:
- Docker Desktop must be installed and running
- Mining worker checks Docker on startup
- If Docker unavailable: mining status set to Error
- Downloads: https://docker.com

**Crawler Image**:
- Uses `crawl4ai` Docker image from Docker Hub
- Auto-downloaded on first mining start
- Contains Playwright + Chromium for web scraping

### Window Management

- Custom frameless window with transparent background (`src/main/window/window.ts`)
- Constrained size: 420x700px (or screen size if smaller)
- WindowManager singleton tracks all windows by name
- System tray integration (production only)

### Auto-Updates

- Uses `electron-updater` with custom update feed
- IPC handlers in `src/main/ipc/updater/`
- Update feed URL configured via `VITE_FEED_URL` env var
- Publishes to S3/R2 bucket (Cloudflare R2)

### Logging

- `electron-log` configured in `src/main/configs/logger.ts`
- Logs location: `app.getPath('logs')` (printed on startup)
- Main process logs to file, renderer uses `console.*`
- Mining/uptime operations heavily logged for debugging

### Platform-Specific Handling

- macOS builds require x86_64 architecture (use `npm run deploy:mac`)
- Windows: Docker Desktop installer download offered in UI
- Linux: Docker must be pre-installed
- Tray icon disabled in development mode

## Development Workflow

### Working with Node Runtime

**Adding New Features**:
1. Add service methods in `src/main/api/{feature}/`
2. Update `NodeRuntime` or create new worker class
3. Add event emitters for renderer updates
4. Create IPC handlers in `src/main/ipc/`
5. Add preload bridge exports
6. Update renderer components to consume events

**Testing Mining Locally**:
1. Ensure Docker Desktop is running
2. Start app: `yarn dev:electron`
3. Monitor logs: `app.getPath('logs')`
4. Check mining status in UI
5. View crawler output in console

### Working with Injections

**Development Flow**:
1. Make changes in `injections/packages/{package}/`
2. Run `yarn dev` (hot reload enabled)
3. Test in Electron app's web views
4. Build: `yarn build:injections`

**Adding New Injection**:
1. Create package in `injections/packages/{name}/`
2. Add to pnpm workspace in root `package.json`
3. Export from injection packages
4. Import in crawler service

### Code Style

- Prettier with Tailwind plugin (2-space indentation)
- ESLint with TypeScript + React rules
- PascalCase for React components and classes
- camelCase for functions, variables, methods
- kebab-case for renderer filenames
- SCREAMING_SNAKE_CASE for constants and preload exports
- Imports sorted: external → `@/` aliases → relative

## Important Notes

### Security

- All tokens encrypted with AES-256-GCM
- Machine-specific encryption keys (derived from hardware)
- Never commit `.env` or `electron-builder.env` files
- Sandbox disabled in webPreferences for IPC access (required)

### Known Patterns

**Event-Driven Architecture**:
- NodeRuntime extends EventEmitter
- All status changes emit events
- Renderer subscribes via IPC event listeners
- Redux actions dispatched from IPC handlers

**Error Handling**:
- All async operations wrapped in try-catch
- Errors emitted via EventEmitter
- Status transitions include error state
- UI displays error modals for critical failures

**Retry Logic**:
- Mining assignments retry on failure (with backoff)
- Uptime polling retries indefinitely
- Docker checks retry with exponential backoff
- SSE reconnections use progressive backoff

### Common Issues

**Mining Won't Start**:
1. Check Docker is running: `docker ps`
2. Check Docker service availability
3. View logs for specific error
4. Restart Docker Desktop

**Uptime Not Tracking**:
1. Verify network connection
2. Check token validity (may need re-login)
3. View uptime runner logs
4. Check device registration status

**Build Failures**:
1. Clean: `rm -rf out dist`
2. Rebuild injections: `yarn build:injections`
3. Check TypeScript errors: `yarn typecheck`
4. Clear node_modules and reinstall: `yarn install`

## API Endpoints

The runtime calls OptimAI backend services:

**Authentication**:
- `POST /auth/login` - Login with email/password
- `GET /auth/me` - Get current user profile
- `POST /auth/refresh` - Refresh access token

**Node Control** (deprecated - now handled internally):
- Endpoints existed in older versions
- Now all control is local via NodeRuntime

**Uptime**:
- `POST /api/uptime/online` - Report online status
- `GET /api/uptime/progress` - Get uptime progress
- `GET /api/uptime/rewards` - Get uptime reward history

**Mining**:
- `GET /api/mining/assignments` - Fetch available assignments
- `POST /api/mining/assignments/:id/start` - Mark assignment started
- `POST /api/mining/assignments/:id/submit` - Submit assignment result
- `POST /api/mining/assignments/:id/abandon` - Abandon assignment with reason
- `GET /api/mining/stats` - Get mining statistics

**Device**:
- `POST /devices` - Register device
- `GET /devices/me` - Get current device info
