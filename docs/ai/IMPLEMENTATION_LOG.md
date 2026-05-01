# Implementation Log

## 2026-05-01

### Documentation Foundation Initialized

Created AI-facing documentation under `docs/ai/`:

- `PROJECT_STATUS.md`
- `DATABASE_SCHEMA.md`
- `API_REFERENCE.md`
- `IMPLEMENTATION_LOG.md`

No application code was changed as part of this documentation step.

### Repository Context Reviewed

Reviewed:

- `doc/CONTEXT.md`
- `server.js`
- `db/connection.js`
- `middleware/auth.js`
- `routes/auth.js`
- `routes/chords.js`
- `routes/user_favorites.js`
- `package.json`

### Current Findings

- Actual backend is CommonJS JavaScript, while the blueprint points toward a future TypeScript architecture.
- Auth register/login is functional based on recent manual Postman testing.
- Database schema is not yet codified in repo migrations.
- Chord GET routes and chord POST route likely target different schema versions.
- Favorites routes depend on `user_favorites(user_id, chord_id)` unique conflict handling.

### Recommended Next Coding Step

Add a migration or schema initialization layer before expanding functionality. Start by making the chord model consistent across database schema and `routes/chords.js`, because the current GET and POST chord endpoints appear to disagree about column names and storage shape.

### Figma Mapping Added

Reviewed the provided Figma file pages:

- Dashboard canvas: `17:2`
- Mobile canvas: `0:1`

Added:

- `docs/ai/FIGMA_SCREEN_MAP.md`
- `docs/ai/ADMIN_DASHBOARD_PLAN.md`

No application code was changed.

### Admin Security Skeleton Implemented

Implemented the first admin backend step:

- Added `public.profiles.role`.
- Added `public.profiles.status`.
- Added `middleware/requireAdmin.js`.
- Added `routes/admin.js`.
- Mounted admin routes under `/api/admin`.
- Added read-only `GET /api/admin/dashboard`.
- Added read-only `GET /api/admin/users`.
- Extended auth user responses with `role` and `status`.

Notes:

- `public.user_favorites` and `public.tunings` were not present in the database during inspection, so dashboard metrics treat missing optional tables as `0`.
- A user must be promoted to `admin` or `owner` before using admin endpoints.

### MVC Refactor Started

Refactored auth and admin dashboard/user flows into a lightweight MVC-style backend structure.

Added:

- `controllers/authController.js`
- `controllers/admin/adminDashboardController.js`
- `controllers/admin/adminUserController.js`
- `services/authService.js`
- `services/admin/adminDashboardService.js`
- `services/admin/adminUserService.js`
- `repositories/userRepository.js`
- `repositories/profileRepository.js`
- `repositories/adminRepository.js`
- `utils/httpError.js`

Updated:

- `routes/auth.js` now only binds auth endpoints to controller methods.
- `routes/admin.js` now only applies auth/admin middleware and binds admin endpoints.
- `server.js` global error handler now respects `err.statusCode`.

Verification:

- `node --check` passed for all new and modified JavaScript files.

Next recommended implementation:

- Build admin chord CRUD in the new structure, starting with `adminChordController`, `adminChordService`, and `chordRepository`.

### Admin Chord CRUD And Dashboard App Added

Implemented admin chord CRUD in the MVC structure:

- `controllers/admin/adminChordController.js`
- `services/admin/adminChordService.js`
- `repositories/chordRepository.js`

Added admin endpoints:

- `GET /api/admin/chords`
- `GET /api/admin/chords/:id`
- `POST /api/admin/chords`
- `PATCH /api/admin/chords/:id`
- `DELETE /api/admin/chords/:id`

Created sibling dashboard project:

- `../fretlab-dashboard`

Dashboard files:

- `index.html`
- `styles.css`
- `app.js`
- `server.js`
- `package.json`
- `README.md`

Dashboard capabilities:

- Admin login
- Dashboard metrics
- User list
- Chord list
- Add chord with fret/finger positions

Verification:

- `node --check` passed for the new backend CRUD files.
- `node --check` passed for dashboard `app.js` and `server.js`.

### Dashboard Routing And Feature Structure

Date: 2026-05-01

Files changed:

- `../fretlab-dashboard/index.html`
- `../fretlab-dashboard/server.js`
- `../fretlab-dashboard/package.json`
- `../fretlab-dashboard/build.js`
- `../fretlab-dashboard/src/app.ts`
- `../fretlab-dashboard/src/shared/api.ts`
- `../fretlab-dashboard/src/shared/state.ts`
- `../fretlab-dashboard/src/shared/feature-loader.ts`
- `../fretlab-dashboard/src/shared/toast.ts`
- `../fretlab-dashboard/src/shared/table.ts`
- `../fretlab-dashboard/src/styles/tokens.css`
- `../fretlab-dashboard/src/styles/shell.css`
- `../fretlab-dashboard/src/features/*`
- `docs/ai/PROJECT_STATUS.md`
- `docs/ai/IMPLEMENTATION_LOG.md`

What was done:

- Reworked the dashboard into a feature-based frontend structure where each page has its own HTML, CSS, and TS file.
- Added hash/path routing for dashboard, chords, users, chord creation, and login screens.
- Updated the static server to serve direct dashboard paths through the app shell.
- Made chord list API failures visible in the table area instead of leaving the page blank.

Important decisions:

- Kept the dashboard as a lightweight static app for now instead of introducing a framework before the MVP admin workflow is stable.
- Used hash routes as the primary navigation path because they are simple and reliable for this static dashboard setup.

Follow-up tasks:

- Confirm the logged-in admin user has `public.profiles.role = 'admin'` or `owner`.
- Add edit/delete chord UI actions on top of the existing admin chord CRUD API.

### Dashboard Routing/API Separation Fix

Date: 2026-05-01

Files changed:

- `../fretlab-dashboard/index.html`
- `../fretlab-dashboard/server.js`
- `../fretlab-dashboard/src/shared/api.ts`
- `../fretlab-dashboard/src/shared/state.ts`
- `../fretlab-dashboard/src/shared/endpoints.ts`
- `../fretlab-dashboard/src/features/login/login.ts`
- `../fretlab-dashboard/src/features/dashboard/dashboard.ts`
- `../fretlab-dashboard/src/features/users/users.ts`
- `../fretlab-dashboard/src/features/chords/chords.ts`
- `../fretlab-dashboard/src/features/chord-create/chord-create.ts`
- `docs/ai/PROJECT_STATUS.md`
- `docs/ai/IMPLEMENTATION_LOG.md`

What was done:

- Separated frontend route names from backend endpoint paths.
- Added a central endpoint map for auth/admin API paths.
- Normalized the saved API base URL to an origin so stale localStorage values such as `/api/admin` cannot corrupt endpoint paths.
- Switched API URL construction to `new URL(...)`.
- Added cache-busting query parameters to the dashboard shell assets.
- Updated the static dashboard server to return no-store headers and avoid serving `index.html` for missing asset files.

Verification:

- `node --check` passed for dashboard app, API client, state, and server files.
- `npm run build` completed successfully for `../fretlab-dashboard`.

Follow-up tasks:

- If the browser still shows old requests, clear the old dashboard localStorage entry `fretlab.apiBaseUrl` or use the normalized API URL field value.

### Dashboard Source Dev Server And Page Content API

Date: 2026-05-01

Files changed:

- `../fretlab-dashboard/package.json`
- `../fretlab-dashboard/index.html`
- `../fretlab-dashboard/server.js`
- `../fretlab-dashboard/README.md`
- `../fretlab-dashboard/src/app.ts`
- `../fretlab-dashboard/src/shared/feature-loader.ts`
- `routes/admin.js`
- `controllers/admin/adminPageController.js`
- `services/admin/adminPageService.js`
- `docs/ai/API_REFERENCE.md`
- `docs/ai/PROJECT_STATUS.md`
- `docs/ai/IMPLEMENTATION_LOG.md`

What was done:

- Changed dashboard `npm start` to serve `src` directly instead of rebuilding and serving `dist`.
- Added dashboard dev-server mapping from browser `.js` module requests to matching `.ts` source files.
- Added server-sent-event hot reload for dashboard source changes.
- Changed feature HTML/CSS loading from `/dist/features/...` to `/src/features/...`.
- Added backend `GET /api/admin/pages/:feature` for controlled dashboard feature HTML responses.
- Added feature-loader fallback to fetch page HTML from the backend endpoint when local source HTML is unavailable.

Important decisions:

- Kept `npm run build` and added `npm run preview` for explicit `dist` previews.
- Kept normal local development source-first so Network no longer fills with `dist` requests during `npm start`.
- Did not change the database schema.

Follow-up tasks:

- Consider adding a tiny browser overlay for hot reload connection errors if the dashboard dev server grows beyond this lightweight setup.
