# 🎸 FretLab — Full Technical & Product Blueprint

---

# 1. 🚀 Vision & Product Philosophy

FretLab is not just a guitar utility app — it is a **high-performance, extensible music intelligence platform** designed for modern musicians.

## Core Principles

* **Precision over simplicity** → Accurate music theory representation
* **Dynamic over static** → Everything is computed, not hardcoded
* **Scalable by design** → Clean separation of concerns
* **Educational depth** → Not just showing chords, but teaching them

## Long-Term Vision

FretLab evolves into:

* A **real-time practice assistant**
* A **music theory visualization engine**
* A **cross-platform musician ecosystem**

---

# 2. 🧠 System Architecture Overview

## Architecture Style: Decoupled / Client-Server

```
[ React Native App ]
        ↓
   REST API (Node.js)
        ↓
   PostgreSQL DB
```

### Key Characteristics

* Stateless backend
* Token-based authentication
* Data-driven UI rendering
* Future-ready for microservices

---

# 3. 🧱 Technology Stack

## Frontend

* React Native (Expo)
* TypeScript (strict mode)
* React Navigation
* Zustand / Context API (state)

## Backend

* Node.js
* Express.js
* TypeScript
* Zod (validation)

## Database

* PostgreSQL
* Prisma ORM (optional but recommended)

## Auth

* JWT (Access + Refresh tokens)

## Dev Tools

* DataGrip (DB)
* Postman (API testing)
* Docker (future containerization)

---

# 4. 🗄️ Database Design (Deep Dive)

## Schema Strategy

### 1. `auth` schema

Handles identity

#### users

| field         | type      |
| ------------- | --------- |
| id            | UUID      |
| email         | TEXT      |
| password_hash | TEXT      |
| created_at    | TIMESTAMP |

---

### 2. `public` schema

#### profiles

| field      | type                 |
| ---------- | -------------------- |
| id         | UUID (FK → users.id) |
| username   | TEXT                 |
| created_at | TIMESTAMP            |

---

### chords

| field | type |
| ----- | ---- |
| id    | UUID |
| name  | TEXT |
| root  | TEXT |
| type  | TEXT |

---

### chord_positions

| field    | type   |
| -------- | ------ |
| id       | UUID   |
| chord_id | UUID   |
| frets    | INT[6] |
| fingers  | INT[6] |

---

## 🎯 Data Modeling Insight

```
frets:   [0, 3, 2, 0, 1, 0]
fingers: [0, 3, 2, 0, 1, 0]
```

* Index = string (E A D G B E)
* `0` → open string
* `-1` → muted
* `>0` → fret number

---

## Indexing Strategy

```sql
CREATE INDEX idx_chords_name ON chords(name);
CREATE INDEX idx_positions_chord_id ON chord_positions(chord_id);
CREATE INDEX idx_profiles_user_id ON profiles(id);
```

---

# 5. 🔐 Authentication System

## JWT Flow

1. User logs in
2. Server generates:

   * accessToken (short-lived)
   * refreshToken (long-lived)
3. Stored in SecureStore

---

## Token Structure

```ts
{
  userId: string
  email: string
}
```

---

## Middleware Example

```ts
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401)

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(403)
  }
}
```

---

# 6. ⚙️ Backend Architecture

## Folder Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middlewares/
│   ├── validators/
│   ├── db/
│   ├── utils/
│   └── app.ts
```

---

## API Design

### Auth

```
POST /auth/register
POST /auth/login
```

### Chords

```
GET /chords
GET /chords/:id
```

### Favorites

```
POST /favorites
GET /favorites
DELETE /favorites/:id
```

---

## Example Response

```json
{
  "id": "uuid",
  "name": "C Major",
  "positions": [
    {
      "frets": [0,3,2,0,1,0],
      "fingers": [0,3,2,0,1,0]
    }
  ]
}
```

---

# 7. 📱 Frontend Architecture

## Folder Structure

```
frontend/
├── src/
│   ├── components/
│   ├── screens/
│   ├── navigation/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   └── utils/
```

---

## Key Components

### 🎸 Fretboard Component

Responsibilities:

* Render 6 strings
* Map frets array → dots
* Show finger positions

---

## Rendering Strategy

* SVG or Canvas
* No static images
* Fully dynamic

---

## State Management

* Auth → Context
* App Data → Zustand / React Query

---

# 8. ⚡ Performance Strategy

## Backend

* Use JOIN instead of multiple queries
* Cache frequent chords (Redis future)
* Pagination for chord list

---

## Frontend

* Memoization (React.memo)
* Lazy loading screens
* Debounced search

---

# 9. 🧪 Testing Strategy

## Backend

* Unit Tests → Services
* Integration Tests → API endpoints

## Frontend

* Component testing (React Native Testing Library)

---

# 10. 📦 DevOps & Deployment (Future)

## Docker Setup

```
frontend
backend
postgres
```

## Deployment Plan

* Frontend → Expo / App Store
* Backend → DigitalOcean / Railway
* DB → Managed PostgreSQL

---

# 11. 🎯 Feature Roadmap

## Phase 1 — Foundation

* Auth system
* Basic chords
* API structure

## Phase 2 — MVP

* Mobile UI
* Chord visualization
* Search

## Phase 3 — Personalization

* Favorites
* Profiles

## Phase 4 — Advanced

* Scales
* Practice tracking
* Audio tuner

---

# 12. 🧩 Future Expansion Ideas

* AI-powered chord suggestions
* Real-time pitch detection
* Jam mode (multi-user sync)
* Guitar learning paths

---

# 13. 🛡️ Engineering Rules

## Naming

* JS/TS → camelCase
* DB → snake_case

## Security

* Never expose secrets
* Use `.env`

## Validation

* Always validate inputs (Zod)

---

# 14. 📌 Final Notes

FretLab is designed to be:

* **Scalable**
* **Maintainable**
* **Expandable**

This is not just a project — it is a **platform foundation**.

---
