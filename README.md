<div align="center">

# 🏗️ Buildo

### AI-Powered Website Generator — describe it, and watch it build.

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Overview

**Buildo** is a full-stack AI-powered website builder that lets users go from a plain-English prompt to a fully functional, styled, production-ready website in seconds. Users type a description of the website they want — a bakery landing page, a SaaS pricing page, a personal portfolio — and the AI generates complete, standalone HTML/CSS/JavaScript code backed by Tailwind CSS and real image content.

Once a site is generated, users land directly in the project editor. From there they can preview the website in a live iframe, ask for revisions via a conversational sidebar chat, roll back to any prior version from a tracked history, and optionally publish the site to a unique public URL in the format `/@username/project-slug`. Every change — initial generation and each revision — is versioned so nothing is ever lost.

Buildo also features a community feed where all published projects are visible publicly, complete with clickable author badges that link to individual user profiles. Users manage their account through a settings page covering profile details, email verification status, billing credit history, and security/password management. Credits are used as the in-app currency: 5 credits per generation or revision. Credits can be purchased through Cashfree payment integration, with real-time webhook confirmation and payment status verification.

---

## Features

- **AI website generation** — describe any website and receive complete, standalone HTML with Tailwind CSS, Google Fonts, semantic markup, and realistic copy (no lorem ipsum)
- **Prompt enhancement** — before generating, the AI automatically expands and enriches the user's raw prompt into a detailed specification using `cohere/north-mini-code` on OpenRouter
- **Design system variation** — each project is assigned a curated design system at creation time, influencing the color palette, typography, and layout style of the generated output
- **Live preview** — generated websites are rendered in a sandboxed iframe immediately after generation
- **Conversational revision** — users send follow-up requests in a sidebar chat to refine specific elements; the AI applies changes in context of the current site
- **Full version history** — every AI-generated version is saved; users can roll back to any previous version with one click
- **Code editor panel** — users can view and manually edit the raw HTML code alongside the live preview
- **Publish to public URL** — projects can be toggled between draft and published; published projects are accessible at `/@username/slug`
- **Community feed** — a public gallery of all published projects with author badges and real-time published-project browsing
- **Public user profiles** — each user has a public profile page at `/@username` listing all their published work
- **Credits system** — every generation or revision costs 5 credits; new accounts start with 20 free credits
- **Cashfree payment integration** — users can purchase credit packs; payment flow includes order creation, Cashfree Checkout SDK, webhook-based confirmation, and a polling-based payment verification page
- **Email verification via OTP** — new users must verify their email before creating projects; OTP is sent via Gmail SMTP (Nodemailer) and expires after 10 minutes
- **Unique username requirement** — signup enforces a validated, unique username (3–20 chars, lowercase + numbers + hyphens/underscores); reserved system words are blocked
- **Account settings** — profile details, username display, email verification badge, billing & credit transaction history, password management, and account deletion

---

## Tech Stack

### Frontend (`client/`)

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool & dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router DOM | 7 | Client-side routing |
| Better Auth (client) | 1.6 | Authentication UI & session management |
| `@daveyplate/better-auth-ui` | 3.4 | Pre-built auth UI cards (account settings, password change, delete) |
| Axios | 1.18 | HTTP client |
| Lucide React | 1.25 | Icon library |
| Sonner | 2 | Toast notifications |
| `@cashfreepayments/cashfree-js` | 1.0 | Cashfree Checkout SDK |
| `@fontsource-variable/geist` | 5.3 | Geist variable font |
| shadcn/ui | 4 | UI component primitives |

### Backend (`server/`)

| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5 | HTTP server & routing |
| TypeScript | 7 | Type safety |
| Prisma | 7 | ORM & database migrations |
| PostgreSQL (via Neon) | — | Primary database |
| Better Auth (server) | 1.6 | Authentication, session, and account management |
| Nodemailer | 9 | Transactional email (OTP delivery via Gmail SMTP) |
| `cashfree-pg` | 6 | Cashfree server-side order creation & webhook verification |
| `openai` (SDK) | 6.48 | OpenRouter API client for AI completions |
| tsx + nodemon | — | Dev server with hot reload |

### AI

- **Provider:** [OpenRouter](https://openrouter.ai) (`https://openrouter.ai/api/v1`)
- **Model:** `cohere/north-mini-code` (free tier) — used for both prompt enhancement and full HTML website generation

### Payments

- **Gateway:** [Cashfree](https://cashfree.com)
- **Flow:** Order creation → Cashfree Checkout (JS SDK) → Webhook confirmation → Payment status polling

---

## Project Structure

```
full-stack/
├── client/                       # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx          # Main prompt input & project creation
│   │   │   ├── Projects.tsx      # Project editor (preview + revision chat + versions)
│   │   │   ├── MyProjects.tsx    # User's project dashboard/grid
│   │   │   ├── Community.tsx     # Public feed of all published projects
│   │   │   ├── UserProfile.tsx   # Public user profile page (/@username)
│   │   │   ├── View.tsx          # Public project view (/@username/slug)
│   │   │   ├── Preview.tsx       # Full-screen preview iframe
│   │   │   ├── Pricing.tsx       # Credit plan purchase page
│   │   │   ├── PaymentVerify.tsx # Post-payment status polling & confirmation
│   │   │   ├── Setting.tsx       # Account settings (profile, billing, security)
│   │   │   └── auth/             # Auth pages (sign in, sign up, etc.)
│   │   ├── components/
│   │   │   ├── Navbar.tsx            # Top navigation with credits badge
│   │   │   ├── Sidebar.tsx           # Project editor sidebar (chat + versions)
│   │   │   ├── EditorPanel.tsx       # Code editor panel
│   │   │   ├── ProjectPreview.tsx    # iframe preview wrapper
│   │   │   ├── LoaderSteps.tsx       # Animated generation progress steps
│   │   │   ├── EmailVerificationModal.tsx  # OTP email verification gate
│   │   │   ├── SetUsernameModal.tsx  # Username setup gate (post-signup)
│   │   │   └── ui/                   # shadcn/ui primitives
│   │   ├── configs/
│   │   │   └── axios.ts          # Axios instance with base URL + credentials
│   │   ├── lib/
│   │   │   └── auth-client.ts    # Better Auth client instance
│   │   ├── types/                # Shared TypeScript types
│   │   ├── assets/               # Static assets (logo, images)
│   │   ├── App.tsx               # Root router with route definitions
│   │   └── main.tsx              # React entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
└── server/                       # Express backend
    ├── controllers/
    │   ├── userController.ts     # User CRUD, credits, OTP, username, project creation
    │   ├── projectController.ts  # AI generation, revisions, versions, publish, community
    │   └── cashfreeController.ts # Payment order creation, status, webhook
    ├── routes/
    │   ├── userRoutes.ts         # /api/user/* routes
    │   ├── projectRoutes.ts      # /api/project/* routes
    │   └── cashfreeRoutes.ts     # /api/cashfree/* routes
    ├── middlewares/
    │   └── auth.ts               # Session-based protect middleware
    ├── lib/
    │   ├── auth.ts               # Better Auth server configuration
    │   ├── prisma.ts             # Prisma client singleton
    │   └── mailer.ts             # Nodemailer transporter (Gmail SMTP)
    ├── config/
    │   ├── openai.ts             # OpenRouter client instance
    │   └── designSystems.ts      # Curated design system presets
    ├── prisma/
    │   ├── schema.prisma         # Database schema (User, WebsiteProject, Version, etc.)
    │   └── migrations/           # Prisma migration history
    ├── types/                    # Express type augmentation (req.userId)
    ├── server.ts                 # Express app entry point
    └── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** v20 or later
- **npm** v10 or later
- A **PostgreSQL** database — [Neon](https://neon.tech) (serverless Postgres) is recommended and free to get started
- A **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) generated (for OTP emails)
- An **OpenRouter** account and API key (free tier is sufficient — the project uses `cohere/north-mini-code:free`)
- A **Cashfree** merchant account (sandbox credentials work for local testing)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-github-handle/buildo.git
cd buildo
```

### 2. Install dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `server/` directory:

```bash
cp server/.env.example server/.env  # if an example exists, otherwise create manually
```

Add the following variables to `server/.env`:

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
# Your PostgreSQL connection string. Get a free serverless Postgres DB at https://neon.tech

# ── Better Auth ───────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=your-random-secret-string-at-least-32-chars
# A long random string used to sign session tokens. Generate with: openssl rand -base64 32

BETTER_AUTH_URL=http://localhost:3000
# The URL your backend server runs at (used for cookie settings and auth callbacks)

# ── CORS & Trusted Origins ────────────────────────────────────────────────────
TRUSTED_ORIGINS=http://localhost:5173,http://localhost:3000
# Comma-separated list of allowed frontend origins for CORS

# ── Server ────────────────────────────────────────────────────────────────────
PORT=3000
# The port the Express server listens on (defaults to 3000 if not set)

NODE_ENV=development
# Set to "production" when deploying (affects cookie security settings)

# ── AI (OpenRouter) ───────────────────────────────────────────────────────────
AI_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Your OpenRouter API key. Get one at https://openrouter.ai/keys

# ── Email (Gmail SMTP via Nodemailer) ─────────────────────────────────────────
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail-address@gmail.com
# The Gmail account used to send OTP verification emails

SMTP_PASS=xxxx-xxxx-xxxx-xxxx
# Your Gmail App Password (16 chars, with or without hyphens — both work)
# Generate at: https://myaccount.google.com/apppasswords

SMTP_FROM="Buildo AI" <your-gmail-address@gmail.com>
# The display name and address shown in the From field of sent emails

# ── Cashfree Payments ─────────────────────────────────────────────────────────
CASHFREE_APP_ID=your-cashfree-app-id
# Found in Cashfree dashboard → Developers → API Keys

CASHFREE_SECRET_KEY=your-cashfree-secret-key
# Found in Cashfree dashboard → Developers → API Keys

CASHFREE_ENV=sandbox
# Use "sandbox" for local testing, "production" for live payments

# ── Frontend URL (used in Cashfree redirect URLs) ────────────────────────────
FRONTEND_URL=http://localhost:5173
# The URL your frontend runs at — used to build payment redirect/notify URLs
```

The client also needs a `.env` file in `client/`:

```env
VITE_SERVER_URL=http://localhost:3000
# The URL your backend server runs at — used as the Axios base URL
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

Open two terminal windows:

```bash
# Terminal 1 — start the backend server (with hot reload)
cd server
npm run server

# Terminal 2 — start the frontend dev server
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

---

## Deployment

Deployment instructions will be added once the project goes live. Key things to update before deploying:

- Set `NODE_ENV=production` and `CASHFREE_ENV=production` in server environment variables
- Register the production webhook URL (`https://your-server.com/api/cashfree/webhook`) in the Cashfree dashboard under Developers → Webhooks
- Update `TRUSTED_ORIGINS` and `FRONTEND_URL` to point to your production domain
- Update `BETTER_AUTH_URL` to your production server URL

---

## Roadmap

Based on the current state of the codebase, the following features are in progress or planned:

- **`purchaseCredits` controller** — the route and stub exist (`POST /api/user/purchase-credits`) but the handler body is not yet implemented; payment currently flows directly through the Cashfree controller
- **Production deployment pipeline** — deployment-related comments (webhook URL, environment switching) are present throughout the codebase but no CI/CD config exists yet
- **Richer community filters** — the community feed currently shows all published projects; filtering by category, tag, or design style is a natural next step

---

## Contributing

Contributions are welcome! If you'd like to improve Buildo, here's how:

1. **Fork** the repository and create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or for bug fixes:
   git checkout -b fix/short-description
   ```

2. **Make your changes.** Keep commits focused and descriptive.

3. **Test your changes** — make sure both the client and server start cleanly and the affected flows work as expected.

4. **Open a Pull Request** against `main` with a clear description of what you changed and why.

5. **For large changes or new features**, please [open an issue](../../issues) first to discuss the idea before investing time in implementation. This avoids wasted effort and keeps the project direction aligned.

**Branch naming suggestions:**
- `feature/feature-name` for new features
- `fix/bug-description` for bug fixes
- `chore/task-description` for refactoring, tooling, or docs

Please be respectful and constructive in all interactions. This is a personal project, and reviews may take some time.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

## Developer

Built by **Moin Sheikh**

- 🐙 GitHub: [@your-github-handle](https://github.com/your-github-handle) ← *replace with your actual handle*
- 💼 LinkedIn: [Your Name](https://linkedin.com/in/your-handle) ← *replace with your actual profile URL*
- 📬 Email: your-email@example.com ← *replace with your actual email*
