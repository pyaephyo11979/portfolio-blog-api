# Blog API for Portfolio

Backend REST API for a portfolio blog: user auth, blog posts with S3-compatible image uploads, and contact messages.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript |
| Runtime | Bun (dev) / Node (prod) |
| Web framework | Express 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL (Neon serverless driver) |
| Validation | Joi |
| Auth | JWT (`jsonwebtoken`) + bcryptjs |
| Uploads | multer + multer-s3 (Cloudflare R2 / S3) |

## Features

- **Auth** — register, login, access/refresh JWT tokens
- **Posts** — CRUD with paginated listing and multi-image uploads to R2
- **Messages** — public contact form submission; authenticated listing/retrieval/deletion

Full endpoint reference: [API.md](./API.md)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- A PostgreSQL database (e.g. [Neon](https://neon.tech))

### Installation

```bash
bun install
```

### Configuration

Create a `.env` in the project root:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Auth
JWT_SECRET=your-access-token-secret
REFRESH_SECRET=your-refresh-token-secret

# Server
PORT=3000

# S3-compatible storage (Cloudflare R2)
BUCKET_REGION=auto
BUCKET_ENDPOINT=https://<account>.r2.cloudflarestorage.com
BUCKET_NAME=portfolioblogs
BUCKET_ACCESS_KEY_ID=<access-key-id>
BUCKET_SECRET_ACCESS_KEY=<secret-access-key>
BUCKET_URL=https://pub-<hash>.r2.dev
```

> Keep `.env` out of version control (already listed in `.gitignore`). Never commit real credentials.

### Database setup

```bash
# Apply migrations
npx prisma migrate deploy

# Or, while developing (creates a migration from schema changes)
npx prisma migrate dev

# Seed an admin user
bun prisma/seed.ts
```

Seeded user (change after first login):

- Username: `admin`
- Email: `pyarephyoehlaing16@gmail.com`
- Password: `password`

## Usage

```bash
# Development (auto-reload)
bun run dev

# Production build
bun run build

# Start built server
bun run start

# Format code
bun run format
```

Server starts at `http://localhost:3000` (or `$PORT`).

## Project Structure

```
prisma/
├── schema.prisma        # Data models: User, Post, PostImage, ContactMessage
├── seed.ts              # Seeds admin user
└── migrations/
src/
├── server.ts            # Express app, CORS, mounts /api/*
├── middlewares/
│   ├── auth-guard.ts    # Bearer JWT verification
│   └── upload-middleware.ts  # multer-s3 upload (field: images)
├── utils/
│   ├── prisma.ts        # PrismaClient + Neon adapter
│   └── s3.ts            # S3Client
└── features/
    ├── auth/            # register / login / refresh-token
    ├── posts/           # post CRUD + image uploads
    ├── messages/        # contact messages
    └── generated/prisma/
```

Pattern: **Router → Controller** (Joi validation, status codes) **→ Service** (Prisma queries).

Path aliases: `@/*`, `@features/*`, `@utils/*`, `@middlewares/*` → `./src/*`.

## API Overview

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| POST | `/api/auth/refresh-token` | public |
| POST | `/api/posts` | Bearer |
| GET | `/api/posts` | public |
| GET | `/api/posts/:id` | public |
| PUT | `/api/posts/:id` | Bearer |
| DELETE | `/api/posts/:id` | Bearer |
| POST | `/api/messages` | public |
| GET | `/api/messages` | Bearer |
| GET | `/api/messages/:id` | Bearer |
| DELETE | `/api/messages/:id` | Bearer |

Details, request/response shapes, and error formats: [API.md](./API.md)

## License

ISC
