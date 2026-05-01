# Project Status

Last updated: 2026-05-01

## Current Repository Shape

Fretlab backend is currently a Node.js + Express + PostgreSQL API using CommonJS modules.

The project now follows a lightweight MVC-style structure for new work:

- Routes define URL bindings and middleware only.
- Controllers handle `req`/`res`.
- Services hold business logic and transactions.
- Repositories hold SQL queries.

Implemented top-level files and folders:

- `server.js`: Express app bootstrap, route mounting, health endpoint, global 404 and error handlers.
- `db/connection.js`: PostgreSQL `Pool` using `DATABASE_URL`, plus startup connection test logging.
- `middleware/auth.js`: JWT bearer-token middleware.
- `middleware/requireAdmin.js`: Admin role/status guard.
- `routes/auth.js`: Register and login endpoints.
- `routes/admin.js`: Admin dashboard and user list endpoints.
- `routes/chords.js`: Chord listing/detail routes with `chords` to `chord_positions` join.
- `routes/user_favorites.js`: Authenticated user favorites routes.
- `controllers/`: Request/response handlers for auth and admin.
- `services/`: Business logic for auth and admin.
- `repositories/`: SQL access helpers for users, profiles, and admin metrics.
- `utils/httpError.js`: Reusable HTTP error type.
- `doc/CONTEXT.md`: Product and technical blueprint. Note: the requested path was `docs/CONTEXT.md`, but the repo currently has `doc/CONTEXT.md`.

## Current Runtime Stack

- Node.js
- Express
- PostgreSQL via `pg`
- JWT via `jsonwebtoken`
- Password hashing via `bcrypt`
- Environment config via `dotenv`
- CORS via `cors`

## Implemented API Areas

- Authentication:
  - `POST /register`
  - `POST /login`
  - Also mounted under `/api/auth/*`
- Chords:
  - `GET /api/chords`
  - `GET /api/chords/:id`
  - `POST /api/chords`
- Favorites:
  - `GET /api/user-favorites`
  - `POST /api/user-favorites`
  - `DELETE /api/user-favorites/:chordId`
- Health:
  - `GET /health`
- Admin:
  - `GET /api/admin/dashboard`
  - `GET /api/admin/users`
  - `GET /api/admin/chords`
  - `GET /api/admin/chords/:id`
  - `POST /api/admin/chords`
  - `PATCH /api/admin/chords/:id`
  - `DELETE /api/admin/chords/:id`

## Dashboard App

A sibling static dashboard project now exists at:

```text
../fretlab-dashboard
```

It provides admin login, dashboard metrics, user list, chord list, and chord creation.

## Known Gaps And Risks

- Database schema is not represented by migrations in the repo.
- `doc/CONTEXT.md` describes a future TypeScript/Zod/Prisma architecture, but the actual code is plain CommonJS JavaScript.
- Auth SQL and database schema have already drifted during development; this should be stabilized with migrations before adding more features.
- `routes/chords.js` still has a `POST /api/chords` implementation that appears based on an older chord schema (`name`, `root_note`, `quality`, `tuning`, `positions`, `created_by`) while the GET routes expect `root`, `suffix`, `difficulty_level` and `chord_positions`.
- Admin route access requires a profile with `role` of `admin` or `owner`; existing users default to `user` until promoted.
- There are no automated tests yet.
- `.env` exists locally and should not be treated as a portable or production-safe config source.

## Recommended Next Coding Step

Create a database migration/schema setup for the current tables before adding more route behavior. The highest-value next code task is to define and apply a single canonical PostgreSQL schema for:

- `auth.users`
- `public.profiles`
- `public.chords`
- `public.chord_positions`
- `public.user_favorites`

Then update public `routes/chords.js` so all public chord endpoints use the same canonical schema behavior as the new admin chord CRUD.
