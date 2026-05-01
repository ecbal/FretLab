# Database Schema

This document records the schema expected by the current backend code and highlights places where the implementation and blueprint may differ.

## Source Of Truth Status

There are no migrations or schema files in the repository yet. The schema below is inferred from:

- `doc/CONTEXT.md`
- Current route SQL
- Recent runtime behavior observed while testing auth

This file should be replaced or backed by real migrations as soon as possible.

## `auth.users`

Purpose: identity and credential storage.

Current backend expectation:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. Returned during register/login. |
| `email` | `text` | Must be unique for login. |
| `password_hash` | `text` | Stores bcrypt hash. Added because bcrypt login requires a persisted hash. |

Current auth code does not rely on `created_at`.

## `public.profiles`

Purpose: user-facing profile data separated from credentials.

Known/expected columns:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | References `auth.users(id)`. |
| `username` | `text` | Must be unique if username uniqueness is required. |
| `full_name` | `text` | Optional profile field. |
| `avatar_url` | `text` | Optional profile field. |
| `updated_at` | `timestamp with time zone` | Optional maintenance timestamp. |

Register currently inserts only `id` and `username`.

## `public.chords`

Purpose: canonical chord records.

Current GET route expectation:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` or integer | Used as join key. |
| `root` | `text` | Required by API response. |
| `suffix` | `text` | Required by API response. |
| `difficulty_level` | `text` or integer | Required by API response. |

Potential mismatch: `POST /api/chords` currently references older columns: `name`, `root_note`, `quality`, `tuning`, `positions`, `created_by`, `created_at`.

## `public.chord_positions`

Purpose: one-to-many positions for each chord.

Current GET route expectation:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` or integer | Position id. |
| `chord_id` | same as `chords.id` | Foreign key to `chords(id)`. |
| other columns | varies | Returned dynamically in `positions` via `to_jsonb(cp) - 'chord_id'`. |

Blueprint expectation:

| Column | Type |
| --- | --- |
| `frets` | `int[6]` |
| `fingers` | `int[6]` |

## `public.user_favorites`

Purpose: user-specific saved chords.

Current backend expectation:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` or integer | Favorite row id. |
| `user_id` | `uuid` | Compared with JWT payload `req.user.id`. |
| `chord_id` | same as `chords.id` | Referenced chord. |
| `created_at` | timestamp | Used for ordering favorites. |

Expected constraint:

- Unique pair on `(user_id, chord_id)` because `POST /api/user-favorites` uses `ON CONFLICT (user_id, chord_id) DO NOTHING`.

## Recommended Schema Stabilization

Before adding new features, create migrations that explicitly define:

- Primary keys
- Foreign keys
- Unique constraints for `auth.users.email`, `public.profiles.username`, and `user_favorites(user_id, chord_id)`
- `created_at` and `updated_at` timestamp policy
- Final chord column names used consistently by all chord routes
