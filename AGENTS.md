# Repository Guidelines

## Project Structure & Module Organization
TypeScript sources sit in `src/`: `src/main` hosts the Electron main process, `src/preload` exposes vetted APIs, and `src/renderer` contains the React 19 UI. Built assets publish to `out/` during development and to `dist/` for packaged installers. The `injections/` workspace provides the companion node agent and is built separately. Shared automation lives in `scripts/`, while distributable artifacts are archived under `applications/`.

## Build, Test, and Development Commands
Install dependencies with `npm install`, which also bootstraps `injections/`. Use `npm run dev` for the full desktop + injection workflow, or `npm run dev:electron` when iterating only on the shell. Build production bundles with `npm run build`; add `npm run build:mac|win|linux` for platform-specific installers. `npm run typecheck` runs both node and renderer TypeScript configs, `npm run lint` applies the ESLint suite, and `npm run format` rewrites files with Prettier. Call `npm run download-binary` whenever you need the packaged agent binary locally.

## Coding Style & Naming Conventions
Prettier (with the Tailwind plugin) and ESLint enforce formatting—run them before committing or rely on editor integrations. Keep two-space indentation, PascalCase React components, camelCase logic, and SCREAMING_SNAKE_CASE bridge constants. File names should remain kebab-case inside `renderer/` and align feature folders between main, preload, and renderer code.

## Testing Guidelines
Automated tests are minimal today, so treat type-checking, linting, and manual QA as blocking gates. When you add coverage, colocate specs beside the source as `<name>.spec.ts` files and execute them with `tsx` to avoid bundler assumptions. Record manual verification steps in your PR—especially API endpoints, WebSocket flows, or installer scenarios touched by the change.

## Commit & Pull Request Guidelines
Match the short, imperative commit messages already in history (e.g., "Add get-port utility..."). Consolidate related edits, reference issue IDs, and keep commits buildable. Pull requests must supply a concise summary, linked tasks, screenshots or recordings for UI changes, and the list of validation commands run. Confirm `npm run build` passes before requesting review, and call out any packaging or updater implications.

## Security & Configuration Tips
Do not commit secrets; use the provided `.example` files and share credentials securely. Verify binaries fetched via `npm run download-binary` and confirm `electron-builder.env` values before publishing. Strip verbose logging from production entries and review preload bridges for least-privilege exposure.
