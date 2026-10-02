# Campus Ledger — Student Management System

A production-minded full-stack CRUD project for department staff to safely manage student records. It combines a responsive React interface, Express REST API, persistent SQLite storage, field validation, soft-delete Undo, activity history, and live data insights.

## Highlights

- Add and edit students in a keyboard-friendly slide-over panel.
- Search, filter, and sort records together; the active view persists in the URL.
- Duplicate-safe enrollment numbers with client feedback and database-enforced uniqueness.
- Immediate soft deletion with a seven-second Undo action; audit events for create, update, delete, and restore.
- Insights dashboard for cohort totals, marks, branch counts, and distributions.
- Useful loading, empty, error, and success states across the primary views.

## Stack and architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| `client/` | React, TypeScript, Vite, React Router, Recharts | Responsive records, Insights, activity UI |
| `server/` | Node.js, Express, SQLite | REST API, validation, persistence, audit log |
| Shared rules | `server/src/config/rules.js` (mirrored in client) | Branches, semester/marks bounds, enrollment format |

The backend is the source of truth: it sanitizes data, validates payload and query parameters, and relies on SQLite parameterized statements plus a unique database constraint. The client repeats key rules only for immediate form feedback.

## Run locally

Prerequisite: Node.js 20+.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The API runs on `http://localhost:3001`. A SQLite database is created automatically in `server/data/students.sqlite` on first API start.

To load safe demonstration records after starting once:

```bash
npm run seed --workspace server
```

Copy `.env.example` to `.env` at the project root, or `server/.env.example` to `server/.env`, to customize `PORT`, `DATABASE_PATH`, and `CLIENT_ORIGIN`.

## Quality checks

```bash
npm test
npm run build
```

Tests cover API creation, validation, collisions, update, delete/restore, search/filter/sort, insights, missing records, and important client form behavior.

## REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| GET | `/api/students` | List records; accepts `search`, `branch`, `semester`, `minMarks`, `maxMarks`, `sort`, `order` |
| GET/PUT/DELETE | `/api/students/:id` | Read, update, soft-delete one student |
| POST | `/api/students` | Create student |
| POST | `/api/students/:id/restore` | Restore a soft-deleted student |
| GET | `/api/insights` | Aggregate dashboard metrics |
| GET | `/api/activity?action=created` | Recent audit activity; optional action filter |

Responses use `{ "data": ... }`; errors use `{ "error": { "message": "…", "details": {} } }`. Validation failures are `400`, uniqueness collisions are `409`, and unknown resources are `404`.

## Design notes

The interface is deliberately calm and information-dense: a compact desktop table becomes horizontally usable on narrow screens, controls have visible focus styles, `Escape` closes the panel, and `/` focuses search. Deletion avoids an interruptive confirmation dialog, letting users recover with Undo instead.

## Deployment

The production server serves the compiled React app and `/api` from one Node service. A ready-to-use `render.yaml` blueprint is included for Render: connect this repository, create the Blueprint, and keep the attached persistent disk so SQLite data survives restarts. The build command is `npm install && npm run build`, the start command is `npm start`, and `/api/health` is the health check. **Live deployment:** add URL here.

## Intentional scope limits / future work

- Authentication and role-based access control
- Per-subject marks, attendance, fees/payments, and timetables
- Multi-college tenancy
- SQLite-to-hosted-PostgreSQL migration and migrations for production teams
- Server-side pagination for very large cohorts
