# Figma Screen Map

Figma file:

```text
https://www.figma.com/design/fZqsJCfpOZAjsXYDGNAfXW/FretLab
```

## Canvases

### Dashboard

Node:

```text
17:2
```

Observed frames include:

- `Kayıt Ol - FretLab`
- `Giriş Yap - FretLab`
- `Kontrol Paneli - FretLab`
- `Bildirimler - FretLab`
- Shared admin layout elements:
  - `SideNavBar`
  - `Header - TopAppBar`
  - Search input
  - User avatar/action area

Backend implications:

- Auth endpoints are already partially implemented.
- Admin authorization is still missing.
- Admin dashboard metrics endpoint is needed.
- Notification management endpoints are needed.
- The visible side navigation should drive the admin route groups.

### Mobile

Node:

```text
0:1
```

Observed frames include:

- `Scale Detail View`
- `Chord Detail View`
- Tuning list/cards such as `DADGAD`, `Open G`
- `Custom Tunings Section`
- `Skill Building Practice`
- Shared mobile layout elements:
  - Header/top navigation
  - Bottom navigation bar
  - Fretboard visualizations

Backend implications:

- Mobile API needs stable chord detail responses with positions.
- Scale endpoints are likely needed.
- Tuning endpoints are needed.
- Practice/routine endpoints can be second phase unless required for MVP.
- Favorites and user-specific saved data should remain under authenticated user routes.

## Backend Route Groups Suggested From Design

### Public / Mobile API

- `GET /api/chords`
- `GET /api/chords/:id`
- `GET /api/tunings`
- `GET /api/tunings/:id`
- `GET /api/scales`
- `GET /api/scales/:id`

### Authenticated User API

- `GET /api/user-favorites`
- `POST /api/user-favorites`
- `DELETE /api/user-favorites/:chordId`
- `GET /api/me`
- `PATCH /api/me`

### Admin API

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/users/:id`
- `GET /api/admin/chords`
- `POST /api/admin/chords`
- `PATCH /api/admin/chords/:id`
- `DELETE /api/admin/chords/:id`
- `GET /api/admin/tunings`
- `POST /api/admin/tunings`
- `PATCH /api/admin/tunings/:id`
- `DELETE /api/admin/tunings/:id`
- `GET /api/admin/notifications`
- `POST /api/admin/notifications`

## Recommended Build Order

1. Add admin role support to `public.profiles`.
2. Add `requireAdmin` middleware.
3. Create admin route skeleton under `routes/admin/`.
4. Implement read-only admin dashboard metrics.
5. Stabilize chord/tuning schema and CRUD endpoints.
6. Add notification tables and admin notification endpoints.
7. Add mobile-specific scale and practice endpoints after core library data is stable.
