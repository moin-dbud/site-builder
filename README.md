<div align="center">

<p align="center">
  <img src="https://buildo.moinsheikh.in/assets/logo-Di-aHq8_.svg" alt="Buildo Logo" width="120" />
</p>

<h1 align="center">Buildo</h1>

### AI-Powered Website Generator — describe it, and watch it build.

[![Live](https://img.shields.io/badge/Live-buildo.moinsheikh.in-6366f1?style=flat-square&logo=vercel&logoColor=white)](https://buildo.moinsheikh.in)

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6%20/%207-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Overview

Buildo is a full-stack AI website builder. Users describe the site they need — a bakery landing page, a SaaS pricing section, a personal portfolio — and the AI generates complete, standalone HTML/CSS/JavaScript powered by Tailwind CSS and curated design system presets. No templates, no drag-and-drop; just a prompt and a production-ready page.

After generation, users work inside a project editor with a live iframe preview, a sidebar chat for conversational revisions, a code editor for manual tweaks, and full version history with one-click rollback. Projects can be published to public URLs (`/@username/project-slug`) and browsed by anyone in the community feed.

The platform is monetized through a credits system (configurable per-generation and per-revision costs) with Cashfree payment integration. Account management covers email verification via OTP, unique username enforcement, profile privacy controls, billing history, and security settings.

A separate **admin panel** provides platform operators with a management dashboard, user/project/transaction oversight, runtime-configurable system settings, design system CRUD, maintenance mode, payment freeze controls, and a full audit log.

---

## Features

### Website Generation
- **AI-powered generation** — describe any website and receive complete, standalone HTML with Tailwind CSS, Google Fonts, semantic markup, schema.org structured data, and realistic copy
- **Prompt enhancement** — the AI automatically expands raw prompts into detailed specifications before generating code
- **Design system variation** — each project is assigned a curated design system (palette, typography, spacing, component patterns) from a library managed in the database
- **Live preview** — generated sites render in a sandboxed iframe immediately
- **Conversational revision** — refine specific elements through a sidebar chat; the AI applies changes in context
- **Full version history** — every AI-generated version is saved; roll back to any previous version with one click
- **Code editor panel** — view and manually edit raw HTML alongside the live preview
- **Manual save** — save hand-edited code directly without consuming credits

### Publishing & Community
- **Public URLs** — publish projects at `/@username/slug`
- **Community feed** — public gallery of all published projects with author badges, featured projects sorted first
- **Public user profiles** — each user has a profile page at `/@username` listing their published work
- **Profile privacy** — users can toggle their profile between public and private
- **Featured projects** — admins can pin noteworthy projects to the top of the community feed

### Account & Payments
- **Credits system** — generation and revision costs are configurable via admin settings (default: 5 credits each); new accounts start with 20 free credits
- **Cashfree payment integration** — order creation, Cashfree Checkout SDK, HMAC-SHA256 webhook verification with replay-attack protection, and a polling-based payment verification page
- **Credit plans** — Basic (₹499 / 100 credits), Pro (₹1,499 / 400 credits), Enterprise (₹3,999 / 1,000 credits)
- **Email verification via OTP** — 4-digit code sent via Gmail SMTP (Nodemailer); expires after 5 minutes
- **Unique username enforcement** — 3–20 chars, lowercase + numbers + hyphens/underscores; reserved system words blocked
- **User notifications** — in-app toast notifications triggered by admin actions (e.g., credit adjustments)
- **Account settings** — profile details, email verification status, billing & transaction history, password management, account deletion

### Admin Panel (`admin/`)
- **Dashboard** — aggregate stats: users (total/verified), projects (total/published), transactions (total/revenue), signups over time, revenue over time, design system usage breakdown, OpenRouter daily request counter
- **User management** — search, paginated listing, detail view with projects & transactions, credit adjustment (with audit + user notification), session revocation / suspend, delete
- **Project management** — search, filter (all/published/featured), unpublish, feature/unfeature, delete
- **Transaction management** — paginated listing with status filter, revenue aggregate
- **Design system CRUD** — create, edit, enable/disable design systems at runtime (DB-backed; falls back to static presets if DB is empty)
- **System settings** — key-value store for runtime config: credits per generation/revision, free signup credits, active AI model, OpenRouter daily cap, email verification toggle
- **Danger zone** — maintenance mode toggle, Cashfree transaction freeze, email verification toggle, bulk cleanup of unverified accounts (>30 days)
- **Audit log** — immutable, paginated log of every admin action with actor, target, and details

---

## Tech Stack

### Frontend — `client/`

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | ~6 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router DOM | 7 | Client-side routing |
| Better Auth (client) | 1.6 | Authentication & session management |
| `@daveyplate/better-auth-ui` | 3.4 | Pre-built auth UI (sign-in, settings, delete) |
| Axios | 1.18 | HTTP client |
| Lucide React | 1.25 | Icon library |
| Sonner | 2 | Toast notifications |
| `@cashfreepayments/cashfree-js` | 1.0 | Cashfree Checkout SDK |
| shadcn/ui + Base UI | — | UI component primitives |
| `@vercel/analytics` | 2 | Production analytics |
| `@vercel/speed-insights` | 2 | Core Web Vitals monitoring |
| `@fontsource-variable/geist` | 5.3 | Geist variable font |

### Admin Panel — `admin/`

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | ~6 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Styling |
| React Router DOM | 7 | Client-side routing |
| Recharts | 3.10 | Dashboard charts (signups, revenue) |
| Better Auth (client) | 1.6 | Shared auth session with main client |
| Lucide React | 1.26 | Icons |
| Sonner | 2 | Toast notifications |

### Backend — `server/`

| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5 | HTTP server & routing |
| TypeScript | 7 | Type safety |
| Prisma | 7 | ORM, migrations, type-safe queries |
| `@prisma/adapter-pg` | 7.9 | Native PostgreSQL driver adapter (connection pooling) |
| PostgreSQL (Neon) | — | Primary database |
| Better Auth (server) | 1.6 | Authentication, sessions, account management |
| Nodemailer | 9 | Transactional email (OTP via Gmail SMTP, Ethereal fallback) |
| `cashfree-pg` | 6 | Payment order creation & webhook verification |
| `openai` SDK | 6.48 | OpenRouter API client for AI completions |
| `tsx` + `nodemon` | — | Dev server with hot reload |

### AI

- **Provider:** [OpenRouter](https://openrouter.ai) (`https://openrouter.ai/api/v1`)
- **Model:** Configurable via admin settings — default `cohere/north-mini-code:free`
- **Usage:** Two API calls per generation/revision (prompt enhancement + code generation), tracked with a daily request counter and configurable cap

### Payments

- **Gateway:** [Cashfree](https://cashfree.com)
- **Flow:** Order creation → Cashfree Checkout (JS SDK) → Webhook confirmation (HMAC-SHA256 + replay guard) → Polling-based client verification fallback
- **Admin controls:** Transaction freeze toggle, per-plan pricing defined server-side

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   client/    │  │   admin/     │    (React + Vite)        │
│  │  :5173       │  │  :5174       │                          │
│  └──────┬───────┘  └──────┬───────┘                         │
│         │                 │                                  │
│         ▼                 ▼                                  │
│  ┌──────────────────────────────────┐                       │
│  │        server/ (Express :3000)   │                       │
│  │  ┌────────────────────────────┐  │                       │
│  │  │ Better Auth (/api/auth/*)  │  │  Session management   │
│  │  ├────────────────────────────┤  │                       │
│  │  │ User Routes (/api/user/*)  │  │  Projects, credits,   │
│  │  │ Project Routes             │  │  OTP, profiles         │
│  │  │ Cashfree Routes            │  │  Payments              │
│  │  ├────────────────────────────┤  │                       │
│  │  │ Admin Routes (/api/admin/*)│  │  Dashboard, CRUD,     │
│  │  │   (requireAdmin guard)     │  │  settings, audit log  │
│  │  ├────────────────────────────┤  │                       │
│  │  │ Maintenance Mode Middleware│  │  Blocks non-admin API │
│  │  └────────────────────────────┘  │  when enabled          │
│  └──────────────┬───────────────────┘                       │
│                 │                                            │
│    ┌────────────┼───────────────┐                            │
│    ▼            ▼               ▼                            │
│  Neon DB     OpenRouter     Cashfree                         │
│ (Postgres)    (AI API)     (Payments)                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
buildo/
├── client/                         # React frontend (user-facing)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Prompt input & project creation
│   │   │   ├── Projects.tsx        # Project editor (preview + chat + versions)
│   │   │   ├── MyProjects.tsx      # User's project dashboard
│   │   │   ├── Community.tsx       # Public feed of published projects
│   │   │   ├── UserProfile.tsx     # Public profile (/@username)
│   │   │   ├── View.tsx            # Public project view (/@username/slug)
│   │   │   ├── Preview.tsx         # Full-screen preview iframe
│   │   │   ├── Pricing.tsx         # Credit plan purchase page
│   │   │   ├── PaymentVerify.tsx   # Post-payment status polling
│   │   │   ├── Setting.tsx         # Account settings (profile, billing, security)
│   │   │   └── auth/               # Sign-in / sign-up pages
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Top nav with credits badge
│   │   │   ├── Sidebar.tsx         # Editor sidebar (chat + version history)
│   │   │   ├── EditorPanel.tsx     # Code editor panel
│   │   │   ├── ProjectPreview.tsx  # Iframe preview wrapper
│   │   │   ├── LoaderSteps.tsx     # Generation progress animation
│   │   │   ├── EmailVerificationModal.tsx
│   │   │   ├── SetUsernameModal.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ui/                 # shadcn/ui primitives
│   │   ├── configs/axios.ts        # Axios instance (base URL + credentials)
│   │   ├── lib/auth-client.ts      # Better Auth client + bearer token
│   │   ├── providers.tsx           # Context providers
│   │   ├── types/                  # Shared TypeScript types
│   │   ├── assets/                 # Static assets (logo, images)
│   │   ├── App.tsx                 # Root router + onboarding gates
│   │   └── main.tsx                # React entry point
│   ├── vercel.json                 # SPA rewrite rules
│   └── package.json
│
├── admin/                          # React admin panel (separate app)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Aggregate platform stats + charts
│   │   │   ├── Users.tsx           # User listing with search
│   │   │   ├── UserDetail.tsx      # User detail (projects, transactions, credits)
│   │   │   ├── Community.tsx       # Project moderation (unpublish, feature, delete)
│   │   │   ├── Transactions.tsx    # Transaction listing with status filter
│   │   │   ├── DesignSystems.tsx   # Design system CRUD
│   │   │   ├── Settings.tsx        # Runtime system settings editor
│   │   │   ├── DangerZone.tsx      # Maintenance, freeze, cleanup controls
│   │   │   └── Login.tsx           # Admin sign-in
│   │   ├── components/
│   │   │   ├── Layout/             # AppShell (sidebar nav + header)
│   │   │   ├── charts/             # Recharts dashboard visualizations
│   │   │   └── ui/                 # Shared UI primitives
│   │   └── lib/auth-client.ts      # Shared Better Auth session
│   ├── vercel.json
│   └── package.json
│
└── server/                         # Express backend
    ├── controllers/
    │   ├── userController.ts       # User CRUD, credits, OTP, username, generation
    │   ├── projectController.ts    # Revisions, versions, publish, community
    │   ├── cashfreeController.ts   # Payment orders, webhook, status polling
    │   └── adminController.ts      # Dashboard stats, user/project/txn mgmt,
    │                               #   design systems, settings, audit log,
    │                               #   maintenance, freeze, cleanup
    ├── routes/
    │   ├── userRoutes.ts           # /api/user/*
    │   ├── projectRoutes.ts        # /api/project/*
    │   ├── cashfreeRoutes.ts       # /api/cashfree/*
    │   └── adminRoutes.ts          # /api/admin/* (requireAdmin guard)
    ├── middlewares/
    │   └── auth.ts                 # protect, requireAdmin, maintenanceMode
    ├── lib/
    │   ├── auth.ts                 # Better Auth server config
    │   ├── prisma.ts               # Prisma client (pg pool adapter for Neon)
    │   ├── mailer.ts               # Nodemailer (Gmail SMTP / Ethereal fallback)
    │   └── settings.ts             # SystemSetting reader + OpenRouter counter
    ├── config/
    │   ├── openai.ts               # OpenRouter client instance
    │   └── designSystems.ts        # Static design system fallback presets
    ├── prisma/
    │   ├── schema.prisma           # Database schema
    │   └── migrations/             # Migration history
    ├── prisma.config.ts            # Prisma datasource configuration
    ├── server.ts                   # Express entry point
    └── package.json
```

---

## Database Schema

Key models managed by Prisma:

| Model | Purpose |
|---|---|
| `User` | Account data, credits, email verification, admin flag, profile privacy |
| `WebsiteProject` | Generated sites with prompt, code, slug, publish status, featured flag, design system reference |
| `Conversation` | Chat history (user/assistant messages per project) |
| `Version` | Immutable snapshots of generated code per project |
| `Transaction` | Payment records (gateway ID, status, plan, amount, credits) |
| `Session` / `Account` / `Verification` | Better Auth internals |
| `AdminAuditLog` | Immutable log of admin actions (actor, action, target, details) |
| `SystemSetting` | Runtime key-value config (credits costs, active model, feature flags) |
| `DesignSystem` | Design presets (palette, typography, spacing, component patterns) |
| `UserNotification` | In-app notification queue (admin→user credit adjustments, etc.) |

---

## Getting Started

### Prerequisites

- **Node.js** v20+
- **npm** v10+
- **PostgreSQL** — [Neon](https://neon.tech) (free serverless Postgres) is recommended
- **Gmail** account with an [App Password](https://support.google.com/accounts/answer/185833) for OTP emails (or leave unconfigured to use Ethereal test emails)
- **OpenRouter** API key — [free tier](https://openrouter.ai/keys) is sufficient
- **Cashfree** merchant account — sandbox credentials work for local testing

### 1. Clone the repository

```bash
git clone https://github.com/moin-dbud/site-builder.git
cd site-builder
```

### 2. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install

# Admin (optional — only needed for platform management)
cd ../admin
npm install
```

### 3. Configure environment variables

#### Server (`server/.env`)

Copy the example and fill in your values:

```bash
cp server/.env.example server/.env
```

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# ── Better Auth ───────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=your-random-secret-string-at-least-32-chars
BETTER_AUTH_URL=http://localhost:3000

# ── CORS & Trusted Origins ────────────────────────────────────────────────────
TRUSTED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# ── Server ────────────────────────────────────────────────────────────────────
NODE_ENV=development

# ── AI (OpenRouter) ───────────────────────────────────────────────────────────
AI_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Email (Gmail SMTP via Nodemailer) ─────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
SMTP_PASS=xxxx-xxxx-xxxx-xxxx
SMTP_FROM="Buildo AI" <your-gmail-address@gmail.com>

# ── Cashfree Payments ─────────────────────────────────────────────────────────
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_ENV=sandbox

# ── Frontend URL ──────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

#### Client (`client/.env`)

```env
VITE_BASEURL=http://localhost:3000
```

#### Admin (`admin/.env`)

```env
VITE_BASEURL=http://localhost:3000
```

### 4. Set up the database

```bash
cd server

# Generate the Prisma client
npx prisma generate

# Run migrations to create all tables
npx prisma migrate dev --name init
```

### 5. Run in development mode

Open separate terminal windows:

```bash
# Terminal 1 — Backend (hot reload)
cd server
npm run server

# Terminal 2 — Frontend
cd client
npm run dev

# Terminal 3 — Admin panel (optional)
cd admin
npm run dev
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:5173` |
| Admin Panel | `http://localhost:5174` |
| Backend API | `http://localhost:3000` |

### 6. Create the first admin user

After signing up through the client, promote your account to admin via a direct database query:

```sql
UPDATE "user" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

Then sign in at `http://localhost:5174`. The admin panel verifies `isAdmin` before granting access.

---

## Available Scripts

### Server

| Script | Command | Description |
|---|---|---|
| `npm run server` | `nodemon --exec tsx server.ts` | Start dev server with hot reload |
| `npm start` | `node dist/server.js` | Start production server |
| `npm run build` | `npx prisma generate && tsc` | Generate Prisma client + compile TypeScript |

### Client / Admin

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Start dev server |
| `npm run build` | `tsc -b && vite build` | Type-check + production build |
| `npm run lint` | `oxlint` | Run linter |
| `npm run preview` | `vite preview` | Preview production build locally |

---

## Deployment

The frontend is deployed on **Vercel** at [buildo.moinsheikh.in](https://buildo.moinsheikh.in). Both `client/` and `admin/` include `vercel.json` with SPA rewrite rules.

Before deploying to production, update these environment variables:

| Variable | Production Value |
|---|---|
| `NODE_ENV` | `production` |
| `CASHFREE_ENV` | `production` |
| `BETTER_AUTH_URL` | `https://your-server.com` |
| `TRUSTED_ORIGINS` | Your production frontend + admin domains |
| `FRONTEND_URL` | `https://your-frontend.com` |

Additionally:
- Register the production webhook URL (`https://your-server.com/api/cashfree/webhook`) in the Cashfree dashboard under **Developers → Webhooks**
- Set `VITE_BASEURL` to the production server URL in both `client/.env` and `admin/.env`

---

## Roadmap

- **Richer community filters** — filtering by category, tag, or design style
- **Export options** — download generated sites as standalone HTML/ZIP
- **Custom domain mapping** — allow users to map custom domains to published projects
- **Template library** — pre-built starting points users can customize via AI
- **Collaborative editing** — real-time multi-user project editing

---

## Contributing

Contributions are welcome. If you'd like to improve Buildo:

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes.** Keep commits focused and descriptive.

3. **Test your changes** — make sure client, admin, and server all start cleanly and affected flows work as expected.

4. **Open a Pull Request** against `main` with a clear description of what you changed and why.

5. **For large changes or new features**, [open an issue](../../issues) first to discuss the idea.

**Branch naming:**
- `feature/feature-name` — new features
- `fix/bug-description` — bug fixes
- `chore/task-description` — refactoring, tooling, or docs

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## Developer

Built by **Moin Sheikh**

- GitHub: [@moin-dbud](https://github.com/moin-dbud)
- LinkedIn: [@moin-sheikh](https://www.linkedin.com/in/moin-build/)
- Email: hello@moinsheikh.in
