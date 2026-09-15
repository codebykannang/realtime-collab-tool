# FlowBoard — Real-Time Collaborative Project Dashboard

Trello + Slack, combined, with a live shared whiteboard. Built to demonstrate
production-grade **WebSocket architecture** and **system design**: multi-user
live editing, a horizontally-scalable real-time layer via **Redis pub/sub**,
and a push-based notification engine.

## Architecture

```
┌─────────────┐        WebSocket (Socket.IO)        ┌──────────────┐
│   React     │ ───────────────────────────────────▶│  Node.js /   │
│  Redux Tk   │◀─────────────────────────────────────│  Express     │
│  Framer     │              REST (JWT)              │  Socket.io   │
└─────────────┘ ───────────────────────────────────▶ └──────┬───────┘
                                                              │
                                    ┌─────────────────────────┼─────────────────────────┐
                                    ▼                         ▼                         ▼
                              ┌───────────┐            ┌────────────┐            ┌────────────┐
                              │ MongoDB   │            │   Redis    │            │   Redis     │
                              │ (data)    │            │ pub/sub    │            │  cache      │
                              │           │            │ (Socket.io │            │ (hot board  │
                              │           │            │  adapter)  │            │  reads)     │
                              └───────────┘            └────────────┘            └────────────┘
```

**Why Redis pub/sub matters here:** Socket.io by default only broadcasts to
clients connected to the *same* server process. The moment you run more than
one backend instance behind a load balancer (which any "big company" scale
target implies), a message from a client on server A never reaches a client
on server B. The `@socket.io/redis-adapter` in `backend/sockets/index.js`
fixes this — every `io.emit` / `io.to(room).emit` is published to a Redis
channel, and every server instance subscribes and re-broadcasts to its own
local sockets. This is the standard pattern used to scale WebSockets
horizontally. A second Redis client (`cacheClient`) also caches hot board
reads with a short TTL to cut down repeated MongoDB queries.

## Features implemented

- **Live collaboration** — multiple users see list/card creation, drag-and-drop
  card moves, and title edits instantly, with a per-card "someone is editing"
  soft-lock to avoid conflicting edits, plus live cursor + presence avatars.
- **Interactive whiteboard** — shared HTML canvas; strokes stream over
  WebSockets to everyone viewing the board and persist to MongoDB so the
  board survives a refresh. Includes undo/clear.
- **Slack-style chat** — per-board channel with typing indicators and
  @mention-based notifications.
- **Notification engine** — every authenticated socket joins a private
  `user:<id>` room; the server pushes `notification:new` events to that room
  the moment something relevant happens (mention, assignment, etc.), and the
  bell icon updates without a page refresh.
- **JWT auth** end-to-end, both for REST calls and the Socket.io handshake.

## Stack

| Layer      | Tech                                                          |
|------------|----------------------------------------------------------------|
| Frontend   | React 18, Redux Toolkit, React Router, Framer Motion, Tailwind |
| Realtime   | Socket.io (client + server)                                    |
| Backend    | Node.js, Express                                                |
| Database   | MongoDB (Mongoose)                                              |
| Scaling    | Redis pub/sub (`@socket.io/redis-adapter`) + Redis cache        |

> The brief also allowed Go for the backend — this implementation uses
> Node.js because it lets one runtime own both the REST API and the
> Socket.io server without a second language/toolchain, which keeps the
> project runnable end-to-end. The same Redis pub/sub pattern applies
> identically if you port the socket layer to Go (`gorilla/websocket` +
> `go-redis`) later — the room/event design in `backend/sockets/` maps over
> directly.

## Project structure

```
realtime-collab-tool/
├── backend/
│   ├── config/          # MongoDB + Redis connections
│   ├── models/          # User, Board, List, Card, Notification
│   ├── middleware/      # JWT auth (REST + socket handshake)
│   ├── controllers/     # REST handlers
│   ├── routes/          # REST routes
│   ├── sockets/         # All real-time logic (board, whiteboard, chat, notifications)
│   └── server.js
├── frontend/
│   └── src/
│       ├── app/store.js         # Redux store
│       ├── features/            # auth / boards / notifications slices
│       ├── services/            # api.js (axios), socket.js (socket.io client)
│       ├── components/          # Board, Whiteboard, Chat, Notifications, Layout
│       └── pages/                # Login, Register, Dashboard, BoardPage
└── docker-compose.yml    # MongoDB + Redis for local dev
```

## Running it locally

**1. Start MongoDB + Redis** (or point at your own instances):
```bash
docker compose up -d
```

**2. Backend**
```bash
cd backend
cp .env.example .env
npm install
npm run dev        # nodemon, http://localhost:5000
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
```

Open the app in two different browser windows (or one normal + one
incognito), log in as two different users, and open the same board to see
live cursors, drag-and-drop sync, chat, and the whiteboard all update in
real time across both.

## Scaling this further

- Run multiple `backend` instances behind an Nginx/HAProxy load balancer with
  **sticky sessions** (or Socket.io's stateless reconnection) — the Redis
  adapter already handles cross-instance broadcast.
- Move whiteboard stroke persistence to a write-behind queue if stroke volume
  gets very high, instead of writing on every `stroke:end`.
- Add a message broker (Kafka/RabbitMQ) in front of the notification engine
  if notification volume needs to be decoupled from the request path.
