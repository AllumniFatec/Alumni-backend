# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Alumni-backend is a REST API for a social networking platform connecting students and alumni of FATEC Sorocaba. It features authentication, social posts, real-time chat, job postings, events, notifications, and an admin approval workflow.

## Commands

```bash
# Development
npm run dev           # Start with nodemon (auto-reload)
npm start             # Start in production mode

# Database
npx prisma generate   # Regenerate Prisma client (run after schema changes)
npx prisma db push    # Push schema changes to MongoDB
npx prisma studio     # Open Prisma Studio GUI

# Docker (starts API + Redis)
docker-compose up
docker-compose down
```

No test suite is currently implemented.

## Architecture

**Pattern:** Routes → Controllers → Services → Prisma (MongoDB)

Each domain (user, post, job, event, chat, admin, etc.) has its own route, controller, and service file. Controllers handle HTTP request/response; services contain all business logic, validation, and database queries.

**Entry point:** [server.js](server.js) sets up Express, Socket.IO, global middleware (helmet, cors, cookie-parser, json), mounts all routes, and initializes BullMQ workers.

### Key Layers

**Authentication** ([src/middlewares/authMiddleware.js](src/middlewares/authMiddleware.js))
- JWT stored in HttpOnly cookies (`access_token`)
- Token revocation tracked in Redis (immediate logout support)
- `authId` middleware ensures URL `:id` matches the authenticated user
- `adminOnly` middleware checks the `admin` flag in the JWT payload

**Rate Limiting** ([src/middlewares/rateLimitMiddleware.js](src/middlewares/rateLimitMiddleware.js))
- Redis-based sliding window per endpoint
- Each route call passes `createRateLimit({ windowMs, max, identifier })`
- Can be disabled globally via `RATE_LIMIT_ENABLED=false`

**Real-time Chat** ([src/config/socket.js](src/config/socket.js))
- Socket.IO authenticates via JWT on connection
- Redis pub/sub for cross-instance message delivery
- Messages stored in MongoDB, read status tracked per user

**Background Jobs** ([src/queues/](src/queues/), [src/workers/](src/workers/))
- BullMQ on Redis for email sending and notification dispatch
- Two-stage notification pipeline: dispatcher (fans out to users in batches of 500) → delivery (sends to connected sockets or stores)
- Deduplication via SHA-256 hash to avoid duplicate notifications

**Skill Deduplication**
- Uses Levenshtein distance (`fast-levenshtein`) to find similar existing skills before creating new ones
- Fuzzy match threshold prevents near-duplicate skill entries

### Data Models (MongoDB via Prisma)

Core models: `User`, `Post`, `PostComments`, `PostLikes`, `Job`, `Event`, `Chat`, `ChatParticipant`, `Message`, `Notification`, `Course`, `Workplace`, `WorkplaceUser`, `Skill`, `UserSkill`

User lifecycle: `InAnalysis` → `Active` (admin approves) or `Refused`. Active users can be `Suspended` or `Banned`.

User types: `Student`, `Alumni`, `Teacher`, `Admin` (stored in JWT payload for quick checks).

### Configuration

All environment variables are exported from [src/config/env.js](src/config/env.js). Copy `.env.example` to `.env` and fill:

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET` | Token signing secret |
| `REDIS_HOST` / `REDIS_PORT` | Redis for queues and rate limiting |
| `CLOUDINARY_NAME/KEY/SECRET` | Image storage |
| `EMAIL_*` | SMTP credentials (Gmail app password) |
| `HOST` | Frontend origin for CORS and email links |
| `PORT` | Server port (default 3001) |

### API Documentation

Interactive Swagger docs available at `/docs` when the server is running. The spec lives in [src/config/swaggerDoc.js](src/config/swaggerDoc.js).

### Pagination Convention

All list endpoints use `page` + `limit` query params (defaults vary per endpoint, typically 10–20). Message pagination uses cursor-based (`before` timestamp) for real-time correctness.

### Custom Error Handling

Throw `new CustomError(message, statusCode)` ([src/utils/CustomError.js](src/utils/CustomError.js)) from services. Controllers catch and forward to Express error handler.

### Image Uploads

Multer ([src/config/multer.js](src/config/multer.js)) handles multipart uploads in-memory, then [src/services/imageService.js](src/services/imageService.js) streams to Cloudinary. Profile photos go through [src/routes/userRoutes.js](src/routes/userRoutes.js) → `imageController` → Cloudinary.
