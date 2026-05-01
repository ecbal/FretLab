# Admin Dashboard Plan

This plan maps the Figma dashboard screens to backend capabilities.

## Goal

Build an admin backend that supports FretLab content and user operations without mixing admin-only behavior into the public mobile API.

## Required Authorization Model

Current login JWT contains:

```json
{
  "id": "user-id"
}
```

Recommended addition:

- Add `role` to `public.profiles`.
- Initial values:
  - `user`
  - `admin`
  - `owner`

Recommended middleware:

- `authenticateToken`
- `requireAdmin`
- Later: `requireOwner` if owner-only settings are needed.

## Admin Pages And Backend Needs

### Admin Login

Uses existing:

- `POST /login`

Needs:

- Role check after login or on first admin API request.

### Dashboard Overview

Suggested endpoint:

```text
GET /api/admin/dashboard
```

Response should include:

- Total users
- Total chords
- Total tunings
- Total favorites
- Recent users
- Recent chords
- Recent admin actions or notification history

### Users

Suggested endpoints:

```text
GET /api/admin/users
GET /api/admin/users/:id
PATCH /api/admin/users/:id
```

Capabilities:

- Search users by email/username
- View profile data
- View favorite count
- Change role
- Disable/enable user if status column is added

### Chords

Suggested endpoints:

```text
GET /api/admin/chords
GET /api/admin/chords/:id
POST /api/admin/chords
PATCH /api/admin/chords/:id
DELETE /api/admin/chords/:id
```

Capabilities:

- Manage `root`, `suffix`, `difficulty_level`
- Manage multiple positions per chord
- Validate fret/finger arrays
- Keep public `GET /api/chords` optimized for mobile consumption

### Tunings

Suggested endpoints:

```text
GET /api/admin/tunings
POST /api/admin/tunings
PATCH /api/admin/tunings/:id
DELETE /api/admin/tunings/:id
```

Capabilities:

- Manage tuning name
- Manage instrument
- Manage string count
- Manage notes per string
- Mark active/default tunings

### Notifications

Suggested endpoints:

```text
GET /api/admin/notifications
POST /api/admin/notifications
```

Capabilities:

- Send to all users
- Send to one user
- Store notification history
- Track status: draft, scheduled, sent, failed

## Minimum Database Additions

Likely required before admin implementation:

- `public.profiles.role`
- `public.profiles.status`
- `public.tunings`
- `public.notifications`
- `public.notification_recipients`
- Optional: `public.admin_activity_log`

## MVP Admin Backend Scope

Build this first:

1. `role` column and `requireAdmin` middleware. Done.
2. `GET /api/admin/dashboard`. Done.
3. `GET /api/admin/users`. Done.
4. Admin chord CRUD using the final chord schema.
5. Admin tuning CRUD.

Notifications can follow after the content-management path is stable.

## Backend Structure Decision

New admin work should use the established lightweight MVC structure:

- `routes/`: URL bindings and middleware.
- `controllers/`: Express request/response handling.
- `services/`: business logic and transactions.
- `repositories/`: SQL queries.
