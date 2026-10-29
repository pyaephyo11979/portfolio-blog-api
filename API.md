# API Reference — Portfolio Blog Backend

Base URL: `https://portfolio-blog-api-6awm.onrender.com` (default; override with `PORT`).

All endpoints are prefixed with `/api`. Request and response bodies are JSON unless noted otherwise.

## Contents

- [Authentication](#authentication)
- [Conventions](#conventions)
- [Auth endpoints](#auth-endpoints)
- [Posts endpoints](#posts-endpoints)
- [Messages endpoints](#messages-endpoints)

## Authentication

The API uses JWT Bearer tokens. There are no sessions or cookies.

1. Log in to obtain an access token (valid 1 hour) and a refresh token (valid 7 days).
2. Send the access token on protected requests:

   ```
   Authorization: Bearer <access token>
   ```

3. When the access token expires, exchange the refresh token for a new one via `POST /api/auth/refresh-token`.

Token payloads and lifetimes:

| Token | Secret env var | Lifetime | Payload |
|---|---|---|---|
| Access | `JWT_SECRET` | 1 hour | `{ id: <user id> }` |
| Refresh | `REFRESH_SECRET` | 7 days | `{ id: <user id> }` |

`authGuard` failure responses (all `401`):

| Condition | Body |
|---|---|
| No `Authorization` header | `{ "message": "Authorization header missing" }` |
| Header present but no token | `{ "message": "Token missing" }` |
| Invalid or expired token | `{ "message": "Invalid or expired token" }` |

> Note: there are no roles or ownership checks. Any authenticated user can update or delete any post or message.

## Conventions

**Success codes:** `200` OK, `201` Created, `204` No Content (empty body).

**Error format:** every error response is:

```json
{ "message": "Human-readable error description" }
```

| Code | Meaning |
|---|---|
| `400` | Validation failure, malformed input, or service error |
| `401` | Missing/invalid credentials |
| `404` | Resource not found |

**Pagination** (used by `GET /api/posts` and `GET /api/messages`):

Query parameters:

| Param | Default | Description |
|---|---|---|
| `page` | `1` | Page number (1-based) |
| `limit` | `20` | Items per page |

Response envelope:

```json
{
  "data": [ /* array of resources */ ],
  "meta": {
    "totalCount": 100,
    "currentPage": 1,
    "totalPages": 5,
    "limit": 20,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## Auth endpoints

Router: `src/features/auth/router.ts`

### `POST /api/auth/register`

Authenticated (`authGuard`). Creates a new user.

**Middleware:** `authGuard` → handler. Requires a valid access token in the `Authorization` header.

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `username` | string | 3–30 characters, unique |
| `email` | string | valid email, unique |
| `password` | string | min 8 chars, must contain lowercase, uppercase, and digit |

**Responses:**

- `201` — the created user object.
- `400` — `{ "message": ... }` — Joi validation error or `"User already exists"`.
- `401` — auth failure (see [authGuard](#authentication)).

> Notes:
> - the `201` response currently includes the hashed `password` field.
> - registration now requires an existing valid access token, so a fresh deployment cannot self-bootstrap: seed the first user directly in the database (see `prisma/seed.ts`) or temporarily bypass `authGuard`.

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access token>" \
  -d '{"username":"jane","email":"jane@example.com","password":"Secret123"}'
```

### `POST /api/auth/login`

Public. Returns tokens.

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `email` | string | valid email |
| `password` | string | min 8 chars |

**Responses:**

- `200` — `{ "token": "<access token>", "refreshToken": "<refresh token>" }`
- `400` — `{ "message": ... }` — `"User not found"`, `"Invalid password"`, or a validation error.

**Example:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secret123"}'
```

### `POST /api/auth/refresh-token`

Public. Exchanges a refresh token for a new access token.

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `token` | string | valid refresh token |

**Responses:**

- `200` — `{ "token": "<new access token>" }`
- `400` — `{ "message": "Invalid refresh token" }` — bad/expired token; also returned when the token is valid but the user no longer exists.

---

## Posts endpoints

Router: `src/features/posts/route.ts`. Images are uploaded to the S3-compatible bucket (Cloudflare R2) with the field name `images`; image URLs are built as `${BUCKET_URL}/${file.key}`.

### `POST /api/posts`

Authenticated. Creates a post, optionally with images.

**Middleware:** `authGuard` → `upload.array('images')` → handler.

**Request:** `multipart/form-data`

| Part | Type | Rules |
|---|---|---|
| `title` | field | 3–100 characters |
| `content` | field | min 10 characters |
| `authorId` | field | integer (see note) |
| `images` | file(s) | optional, multiple allowed |

**Responses:**

- `201` — the created post object.
- `400` — `{ "message": ... }` validation error.
- `401` — auth failure.

> Note: the schema declares `authorId` as an integer, but the database stores it as a string `cuid` from `User.id`. Send your user id as returned by registration/login flows.

### `GET /api/posts`

Public. Lists posts (paginated). Each post includes its `postImages`.

**Query:** `page`, `limit` (see [Pagination](#conventions)).

**Responses:**

- `200` — `{ data: Post[], meta: {...} }`
- `400` — `{ "message": ... }` invalid query values.

### `GET /api/posts/:id`

Public. Fetches a single post with its images.

**Params:** `id` — post cuid.

**Responses:**

- `200` — the post object.
- `400` — `{ "message": "Invalid post ID" }`
- `404` — `{ "message": "Post not found" }`

### `PUT /api/posts/:id`

Authenticated. Updates a post's `title` and/or `content`.

**Middleware:** `upload.array('images')` → `authGuard` → handler. Uploaded files on this route are currently ignored; only JSON fields are applied.

**Params:** `id` — post cuid.

**Request body (all optional):**

| Field | Type |
|---|---|
| `title` | string |
| `content` | string |

**Responses:**

- `200` — the updated post object.
- `400` — `{ "message": ... }` — `"Invalid post ID"`, `"Record to update not found."`, or malformed input.
- `401` — auth failure.

> Note: this route performs no Joi validation on the body.

### `DELETE /api/posts/:id`

Authenticated. Deletes a post and its image records.

**Params:** `id` — post cuid.

**Responses:**

- `204` — empty body.
- `400` — `{ "message": ... }`
- `401` — auth failure.

---

## Messages endpoints

Router: `src/features/messages/router.ts`. Backs the portfolio contact form.

### `POST /api/messages`

Public. Submits a contact message.

**Request body:**

| Field | Type | Rules |
|---|---|---|
| `name` | string | required |
| `email` | string | valid email |
| `message` | string | required |

**Responses:**

- `201` — the created message object.
- `400` — `{ "message": ... }` validation error.

**Example:**

```bash
curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","email":"jane@example.com","message":"Hello!"}'
```

### `GET /api/messages`

Authenticated. Lists contact messages, newest first.

**Query:** `page`, `limit` (see [Pagination](#conventions)).

**Responses:**

- `200` — `{ data: ContactMessage[], meta: {...} }`
- `400` — `{ "message": ... }`
- `401` — auth failure.

### `GET /api/messages/:id`

Authenticated. Fetches one message.

**Params:** `id` — message cuid.

**Responses:**

- `200` — the message object.
- `404` — `{ "message": "Message not found" }`
- `401` — auth failure.

### `DELETE /api/messages/:id`

Authenticated. Deletes a message.

**Params:** `id` — message cuid.

**Responses:**

- `204` — empty body.
- `400` — `{ "message": ... }`
- `401` — auth failure.
