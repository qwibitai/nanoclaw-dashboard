# @qwibitai/nanoclaw-dashboard

Dashboard for [NanoClaw](https://github.com/qwibitai/nanoclaw) — receives JSON snapshots and serves a monitoring UI.

## Architecture

The dashboard is a standalone HTTP server with zero NanoClaw dependencies. It receives periodic JSON snapshots via `POST /api/ingest` and serves a dark-themed monitoring UI.

```
NanoClaw (pusher)              Dashboard (this package)
┌──────────┐    POST JSON      ┌──────────────┐
│ collects │ ────────────────→ │ /api/ingest  │
│ DB data  │   every 60s       │ in-memory    │
│          │                   │ data store   │
└──────────┘                   │ serves UI    │
                               └──────────────┘
```

## Install

```bash
npm install @qwibitai/nanoclaw-dashboard
```

## Usage

### As a CLI

```bash
DASHBOARD_SECRET=my-secret npx nanoclaw-dashboard
```

### As a library

```ts
import { startDashboard } from '@qwibitai/nanoclaw-dashboard';

startDashboard({ port: 3100, secret: 'my-secret' });
```

### With NanoClaw

Use the `/add-dashboard` skill in your NanoClaw installation:
- Installs this package
- Adds a pusher module that collects data and sends JSON snapshots
- Starts the dashboard as part of the NanoClaw process

## Pages

- **Overview** — agent groups, sessions, channels, token usage, context windows, activity chart
- **Agent Groups** — detail with sessions, wirings, destinations, members
- **Sessions** — status, container state, context window usage
- **Channels** — live/offline status, messaging groups, sender policies
- **Messages** — per-session inbound/outbound message viewer
- **Users** — privilege hierarchy (owner → admin → member), group memberships
- **Logs** — real-time log viewer (requires log push or SSE source)

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ingest` | POST | Receive JSON snapshot from NanoClaw |
| `/api/overview` | GET | Summary stats |
| `/api/agent-groups` | GET | All agent groups |
| `/api/sessions` | GET | All sessions |
| `/api/channels` | GET | Channel status |
| `/api/users` | GET | Users and roles |
| `/api/tokens/summary` | GET | Token usage |
| `/api/context` | GET | Context window usage |
| `/api/activity` | GET | Message activity (24h) |
| `/api/status` | GET | Health check |

## License

MIT
