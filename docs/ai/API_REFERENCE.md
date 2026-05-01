# API Reference

Base URL during local development:

```text
http://localhost:3000
```

## Health

### `GET /health`

Returns service status.

Example response:

```json
{
  "status": "ok",
  "service": "fretlab-backend"
}
```

## Auth

Auth routes are mounted both at root and under `/api/auth`.

### `POST /register`

Also available as:

```text
POST /api/auth/register
```

Request body:

```json
{
  "username": "ecbal",
  "email": "enes@can.com",
  "password": "123456"
}
```

Behavior:

- Hashes password with bcrypt using 10 salt rounds.
- Inserts `email` and `password_hash` into `auth.users`.
- Inserts returned user `id` and `username` into `public.profiles`.
- Uses a transaction so both inserts succeed or both are rolled back.

Success response:

```json
{
  "user": {
    "id": "uuid",
    "email": "enes@can.com",
    "username": "ecbal",
    "role": "user",
    "status": "active"
  }
}
```

Common errors:

- `400`: Missing email, username, or password.
- `409`: Email or username already exists.
- `500`: Unexpected server/database error.

### `POST /login`

Also available as:

```text
POST /api/auth/login
```

Request body:

```json
{
  "email": "enes@can.com",
  "password": "123456"
}
```

Behavior:

- Loads user from `auth.users`.
- Joins `public.profiles` for username.
- Verifies password with `bcrypt.compare`.
- Returns a JWT signed with `JWT_SECRET`.
- Token payload currently contains only `id`.
- Token expiry is `1d`.

Success response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "enes@can.com",
    "username": "ecbal",
    "role": "user",
    "status": "active"
  }
}
```

Common errors:

- `400`: Missing email or password.
- `401`: Invalid email or password.
- `500`: Unexpected server/database error.

## Chords

### `GET /api/chords`

Returns chords with nested position arrays.

Response shape:

```json
{
  "chords": [
    {
      "id": "uuid",
      "root": "C",
      "suffix": "maj",
      "difficulty_level": "easy",
      "positions": []
    }
  ]
}
```

### `GET /api/chords/:id`

Returns one chord with nested positions.

Success response:

```json
{
  "chord": {
    "id": "uuid",
    "root": "C",
    "suffix": "maj",
    "difficulty_level": "easy",
    "positions": []
  }
}
```

Common errors:

- `404`: Chord not found.
- `500`: Unexpected server/database error.

### `POST /api/chords`

Current request body expected by code:

```json
{
  "name": "C Major",
  "rootNote": "C",
  "quality": "major",
  "tuning": "standard",
  "positions": []
}
```

Important: this endpoint appears inconsistent with the GET chord schema and should be revisited after schema stabilization.

## User Favorites

All user favorite routes require:

```text
Authorization: Bearer <token>
```

Missing token returns `401`; invalid or expired token returns `403`.

### `GET /api/user-favorites`

Returns the authenticated user's favorite chords.

Response shape:

```json
{
  "favorites": [
    {
      "id": "favorite-id",
      "user_id": "user-id",
      "chord_id": "chord-id",
      "created_at": "timestamp",
      "root": "C",
      "suffix": "maj",
      "difficulty_level": "easy"
    }
  ]
}
```

### `POST /api/user-favorites`

Request body:

```json
{
  "chordId": "chord-id"
}
```

Common errors:

- `400`: Missing `chordId`.
- `401`: Missing token.
- `403`: Invalid or expired token.
- `409`: Chord is already in favorites.

### `DELETE /api/user-favorites/:chordId`

Deletes a favorite for the authenticated user.

Common errors:

- `401`: Missing token.
- `403`: Invalid or expired token.
- `404`: Favorite not found.

## Admin

All admin routes require:

```text
Authorization: Bearer <token>
```

The authenticated profile must have `status = active` and `role = admin` or `role = owner`.

### `GET /api/admin/dashboard`

Returns read-only dashboard metrics and recent records.

Response shape:

```json
{
  "metrics": {
    "totalUsers": 1,
    "totalChords": 0,
    "totalTunings": 0,
    "totalFavorites": 0
  },
  "recentUsers": [],
  "recentChords": []
}
```

### `GET /api/admin/users`

Query params:

- `search`: optional email/username search.
- `limit`: optional page size, max `100`, default `25`.
- `offset`: optional offset, default `0`.

Response shape:

```json
{
  "users": [
    {
      "id": "uuid",
      "email": "enes@can.com",
      "username": "ecbal",
      "full_name": null,
      "avatar_url": null,
      "role": "owner",
      "status": "active",
      "updated_at": null,
      "favorite_count": 0
    }
  ],
  "pagination": {
    "limit": 25,
    "offset": 0
  }
}
```
