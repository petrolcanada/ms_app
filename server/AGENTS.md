# Repository Guidelines

## Project Structure & Module Organization
- `server.js` is the Express entry point and registers routes and middleware.
- `controllers/` holds request handlers (for example `fundController.js`).
- `routes/` defines API routes (for example `funds.js`, `categories.js`).
- `middleware/` contains shared middleware such as error handling and validation.
- `db/` includes database config (`db/config/db.js`), SQL assets (`db/sql/`), and docs (`db/docs/`).
- `tests/` stores Jest tests (current pattern: `*.test.js`).
- `tools/` contains local scripts for schema inspection/export and deployment helpers.
- `utils/` contains shared helpers.

## Build, Test, and Development Commands
- `npm start` runs the dev server with nodemon.
- `npm run start:prod` runs the server with Node (no watcher).
- `npm test` runs the Jest suite.
- `npm run inspect-table` inspects a database table via `tools/inspectTable.js`.
- `npm run scan-schema` scans MS schema via `tools/scanMsSchema.js`.
- `npm run export-schema` (or `npm run docs:schema`) exports schema metadata.
- `npm run deploy-functions` runs `tools/deploy-functions.js`.

## Coding Style & Naming Conventions
- Use CommonJS (`require`/`module.exports`) as in `server.js`.
- Indentation is 2 spaces with trailing semicolons.
- Filenames are lower camelCase (`fundController.js`) and routes are plural (`funds.js`).
- No project-wide formatter is configured; keep style consistent with existing files.

## Testing Guidelines
- Frameworks: Jest + Supertest, with property-based tests via `fast-check`.
- Tests live in `tests/` and use the `*.test.js` naming pattern.
- Prefer testing API behavior through Express handlers, as in `tests/pagination.property.test.js`.

## Commit & Pull Request Guidelines
- Recent commits use short, lowercase, present-tense summaries (for example `fund detail`).
- Keep commit messages concise and action-oriented; avoid prefixes unless necessary.
- PRs should include a brief description, any related issue IDs, and notes on DB changes or new scripts.

## Security & Configuration Tips
- Local configuration is loaded from `.env` (see `server.js` and `db/config/db.js`).
- Required DB settings: `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DATABASE`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- Do not commit secrets; keep `.env` local and update `.gitignore` if new sensitive files are added.
