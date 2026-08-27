<div align="center">

<p align="center">
  <img src="https://buildo.moinsheikh.in/assets/logo-Di-aHq8_.svg" alt="Buildo Logo" width="120" />
</p>

# Buildo

### Autonomous AI-Powered Full-Stack Website Builder & Design System Platform


[![Live Platform](https://img.shields.io/badge/Live-buildo.moinsheikh.in-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://buildo.moinsheikh.in)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![TypeScript 6/7](https://img.shields.io/badge/TypeScript-6%20%2F%207-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite 8](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Express 5](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma 7](https://img.shields.io/badge/Prisma-7.9-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech)
[![License MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Instant Async AI Generation Pipeline](#1-instant-async-ai-generation-pipeline)
  - [Studio Workspace & Live Editor](#2-studio-workspace--live-editor)
  - [Publishing & Community Feed](#3-publishing--community-feed)
  - [Credits Economy & Payments](#4-credits-economy--payments)
  - [Platform Operator Admin Panel](#5-platform-operator-admin-panel)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Environment Setup](#3-environment-setup)
  - [4. Database Migration & Initialization](#4-database-migration--initialization)
  - [5. Run Development Servers](#5-run-development-servers)
  - [6. Admin Account Setup](#6-admin-account-setup)
- [Available Scripts](#-available-scripts)
- [Key Technical Implementation Highlights](#-key-technical-implementation-highlights)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Developer](#-developer)

---

## 🌟 Overview

**Buildo** is an enterprise-grade, full-stack AI website builder and design system platform. Instead of relying on rigid drag-and-drop templates, users describe their product, business, or personal brand in natural language. Buildo autonomously analyzes the prompt, assigns a curated, database-backed design system (color palette, typography pairings, component spacing, component rules), and generates production-ready, single-page HTML websites with inline Tailwind CSS and functional interactivity.

Built on a modern micro-frontend/decoupled architecture using **React 19**, **TypeScript**, **Express 5**, **Prisma 7**, and **Neon Serverless PostgreSQL**, Buildo features an **asynchronous generation pipeline** that yields sub-300ms workspace navigation, side-by-side live iframe rendering, conversational AI revisions, full version rollback history, a public community showcase, and an integrated **Cashfree payment gateway**.

A standalone **Admin Operator Panel** (`admin/`) equips platform administrators with realtime analytics, user/project moderation, credit management with audit logging, runtime design system CRUD, system setting configuration, and emergency maintenance controls.

---

## ✨ Key Features

### 1. Instant Async AI Generation Pipeline
* **Sub-300ms Workspace Navigation:** Creating a project initializes the database record instantly (`POST /api/user/project`) and returns `{ projectId }` in under 300ms, immediately transitioning the user to their studio workspace without hanging.
* **Non-Blocking Background Worker:** AI prompt enhancement and double-pass code generation (enhanced prompt + Tailwind CSS single-page HTML) execute asynchronously in background worker functions (`generateProjectCodeInBackground`).
* **Automated Design System Pairing:** Prompts are algorithmically matched with database-backed design systems containing curated color palettes, Google Fonts imports, spacing variables, and component layout guidelines.
* **Contextual Copy & Media:** Generates realistic, contextual copy and dynamic high-resolution imagery using Picsum seed URLs — avoiding generic placeholders and lorem ipsum text.

### 2. Studio Workspace & Live Editor
* **Multi-Device Live Preview:** Sandboxed iframe renderer supporting real-time toggling between Desktop, Tablet, and Mobile viewport modes.
* **Conversational AI Revisions:** In-context chat sidebar (`/api/project/revision/:projectId`) allowing users to request targeted design/content changes using conversational prompts.
* **Immutable Version History & Rollback:** Every AI generation and revision creates an immutable `Version` record in PostgreSQL. Users can view diff descriptions and restore any previous version with a single click.
* **Integrated Code Editor:** Built-in code editor panel displaying raw HTML/CSS alongside the live preview, allowing manual edits and zero-credit saving.

### 3. Publishing & Community Feed
* **Clean Public URLs:** Publish projects with customized SEO-friendly slugs accessible via clean public routes (`/@username/project-slug`).
* **Community Showcase:** Public gallery featuring community-created websites with author metadata, searchable project listings, and admin-pinned featured projects.
* **Public Profiles:** Personalized user profile pages (`/@username`) showcasing published websites. Includes privacy controls to toggle profile visibility between public and private.

### 4. Credits Economy & Payments
* **Configurable Credit System:** New users automatically receive free signup credits (default: 20). Per-generation and per-revision credit costs are configurable at runtime via admin settings.
* **Cashfree Payment Gateway Integration:** Server-side order creation (`cashfree-pg` SDK v6), Cashfree Checkout JS integration, HMAC-SHA256 webhook signature verification with replay protection, and client-side status polling.
* **Flexible Credit Plans:** Basic (₹499 / 100 credits), Pro (₹1,499 / 400 credits), and Enterprise (₹3,999 / 1,000 credits).

### 5. Platform Operator Admin Panel
* **Realtime Analytics Dashboard:** Interactive Recharts visualizers tracking signup trends, revenue growth, active project distribution, design system usage, and daily OpenRouter API request counts.
* **User & Project Oversight:** Paginated user management, project unpublishing/moderation, featuring controls, and session revocation.
* **Credit Adjustments & Audit Logs:** Admin credit adjustments automatically create an immutable `AdminAuditLog` entry and deliver an in-app `UserNotification` to the target user.
* **Runtime Design System & System Settings Editor:** Live CRUD interface for creating/editing design systems and adjusting platform settings (credits costs, active AI model, OpenRouter request caps, email verification requirement).
* **Emergency Maintenance & Freeze Controls:** One-click toggles for system-wide maintenance mode, payment freeze, and automated bulk cleanup of unverified accounts.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Ecosystem                              │
│                                                                         │
│    ┌───────────────────────────┐     ┌───────────────────────────┐      │
│    │     client/ (Port 5173)   │     │      admin/ (Port 5174)   │      │
│    │  (Main User Web Studio)   │     │  (Platform Admin Console) │      │
│    └─────────────┬─────────────┘     └─────────────┬─────────────┘      │
└──────────────────┼─────────────────────────────────┼────────────────────┘
                   │                                 │
                   └────────────────┬────────────────┘
                                    │ HTTP / REST API (Axios + Cookies)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Express 5 Server (Port 3000)                     │
│                                                                         │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │   Better Auth Middleware    │    │  Maintenance Mode Guard      │  │
│  │   (/api/auth/*)              │    │  (Blocks non-admin API)      │  │
│  └──────────────┬───────────────┘    └──────────────┬───────────────┘  │
│                 │                                   │                  │
│  ┌──────────────┴───────────────────────────────────┴───────────────┐  │
│  │                       API Route Routers                          │  │
│  │  - /api/user/*       (User, Credits, OTP, Profiles, Projects)    │  │
│  │  - /api/project/*    (Revisions, Code Save, Versions, Publish)   │  │
│  │  - /api/cashfree/*   (Payment Orders, Webhooks, Verification)    │  │
│  │  - /api/admin/*      (Dashboard, User/Project Mgmt, Audit Log)   │  │
│  └──────────────┬───────────────────────────────────┬───────────────┘  │
│                 │                                   │                  │
│                 │ Instant DB Write                  │ Async Worker     │
│                 ▼                                   ▼                  │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐  │
│  │    Prisma ORM 7 + PG Pool    │    │   Async Generation Worker    │  │
│  └──────────────┬───────────────┘    │   (OpenAI / OpenRouter API)  │  │
└─────────────────┼────────────────────┴──────────────┬───────────────┘
                  │                                   │
                  ▼                                   ▼
┌──────────────────────────────────┐ ┌──────────────────────────────────┐
│     Neon PostgreSQL Database     │ │         External Services        │
│ - User / Session / Account       │ │ - OpenRouter (AI Model API)      │
│ - WebsiteProject / Version       │ │ - Cashfree (Payment Gateway)     │
│ - Conversation / SystemSetting   │ │ - Gmail SMTP / Resend API        │
│ - AdminAuditLog / DesignSystem   │ │ - Vercel Analytics / Insights    │
└──────────────────────────────────┘ └──────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend Client (`client/`)
| Technology | Version | Description |
|---|---|---|
| **React** | 19.2 | Declarative component framework |
| **TypeScript** | 6.0 | Type safety & developer tooling |
| **Vite** | 8.1 | Next-generation frontend build server |
| **Tailwind CSS** | 4.3 | Utility-first styling engine with `@tailwindcss/vite` |
| **React Router DOM** | 7.11 | Client-side routing with parameter hooks |
| **Better Auth (client)** | 1.6 | Session client & bearer token management |
| **`@daveyplate/better-auth-ui`** | 3.4 | Pre-built authentication UI components |
| **Framer Motion** | 13.1 | Micro-animations and page transitions |
| **GSAP** | 3.15 | Timeline animation engine |
| **Axios** | 1.18 | HTTP client configured with credentials & interceptors |
| **Lucide React** | 1.25 | UI iconography library |
| **Sonner** | 2.0 | Toast notification manager |
| **`@cashfreepayments/cashfree-js`** | 1.0 | Cashfree Checkout SDK |
| **Vercel Analytics & Insights** | 2.0 | Web analytics & Core Web Vitals monitoring |

### Admin Console (`admin/`)
| Technology | Version | Description |
|---|---|---|
| **React** | 19.2 | Operator dashboard UI |
| **TypeScript** | 6.0 | Strict type definitions |
| **Vite** | 8.1 | Build tool |
| **Tailwind CSS** | 4.3 | Dashboard layout & styling |
| **Recharts** | 3.10 | Data visualization library (revenue, signups, usage) |
| **Better Auth (client)** | 1.6 | Shared authentication session with main client |
| **Lucide React** | 1.26 | Icon set |
| **Sonner** | 2.0 | Admin operation notifications |

### Backend API Server (`server/`)
| Technology | Version | Description |
|---|---|---|
| **Node.js** | 20+ | Server runtime environment |
| **Express** | 5.2 | HTTP framework with router isolation |
| **TypeScript** | 7.0 | Backend type safety |
| **Prisma ORM** | 7.9 | Database ORM, migrations, and type-safe query builder |
| **`@prisma/adapter-pg`** | 7.9 | Native PostgreSQL adapter with connection pooling |
| **PostgreSQL (Neon)** | Serverless | Cloud serverless relational database |
| **Better Auth (server)** | 1.6 | Server-side authentication engine & session storage |
| **OpenAI Node SDK** | 6.48 | Client SDK connecting to OpenRouter AI models |
| **Cashfree PG SDK** | 6.0 | Order generation & HMAC-SHA256 signature verification |
| **Nodemailer / Resend** | 9.0 / API | Dual-mode email delivery (Gmail SMTP / Ethereal / Resend) |

---

## 📁 Repository Structure

```text
site-builder/
├── client/                         # Main User React Studio App (Port 5173)
│   ├── src/
│   │   ├── assets/                 # Static branding assets & illustrations
│   │   ├── components/             # Reusable UI components & section layouts
│   │   │   ├── sections/           # Landing page hero, CTA, workflow sections
│   │   │   ├── EditorPanel.tsx     # Raw HTML code editor panel
│   │   │   ├── Navbar.tsx          # Top navigation with live credit counters
│   │   │   ├── ProjectPreview.tsx  # Sandboxed iframe wrapper with device modes
│   │   │   ├── Sidebar.tsx         # Studio sidebar (AI chat & version history)
│   │   │   └── SettingsModal.tsx   # Global settings & account overlay
│   │   ├── configs/                # Axios instance configuration
│   │   ├── lib/                    # Better Auth client instance
│   │   ├── pages/                  # Top-level page routes
│   │   │   ├── Home.tsx            # Prompt input & studio landing page
│   │   │   ├── Projects.tsx        # Main Studio Editor (preview + chat + code)
│   │   │   ├── MyProjects.tsx      # User project dashboard
│   │   │   ├── Community.tsx       # Public showcase of published websites
│   │   │   ├── UserProfile.tsx     # Public user profile page (/@username)
│   │   │   ├── View.tsx            # Published website viewer (/@username/slug)
│   │   │   ├── Pricing.tsx         # Credit top-up plan selection
│   │   │   └── PaymentVerify.tsx   # Payment verification page
│   │   ├── types/                  # Shared frontend TypeScript interfaces
│   │   ├── App.tsx                 # Client routing & onboarding gates
│   │   └── main.tsx                # Client entry point
│   ├── vercel.json                 # Vercel deployment & SPA routing rules
│   └── package.json
│
├── admin/                          # Platform Operator Admin Console (Port 5174)
│   ├── src/
│   │   ├── components/             # Admin layout shell, charts, and table UI
│   │   ├── pages/                  # Operator dashboard pages
│   │   │   ├── Dashboard.tsx       # Realtime platform metrics & Recharts
│   │   │   ├── Users.tsx           # User directory & credit manager
│   │   │   ├── UserDetail.tsx      # In-depth user profile, projects, and transactions
│   │   │   ├── Community.tsx       # Moderation suite (unpublish/feature/delete)
│   │   │   ├── Transactions.tsx    # Payment transaction history
│   │   │   ├── DesignSystems.tsx   # Dynamic DB design system CRUD
│   │   │   ├── Settings.tsx        # Runtime system configuration editor
│   │   │   └── DangerZone.tsx      # Maintenance mode & cleanup controls
│   │   ├── App.tsx                 # Admin routes & authentication guard
│   │   └── main.tsx                # Admin entry point
│   ├── vercel.json
│   └── package.json
│
└── server/                         # Express 5 Backend API Server (Port 3000)
    ├── config/                     # OpenRouter client & static design system fallbacks
    ├── controllers/                # Business logic controllers
    │   ├── userController.ts       # Async website generation, user CRUD, credits, OTP
    │   ├── projectController.ts    # AI revisions, version rollbacks, code saves, publish
    │   ├── cashfreeController.ts   # Cashfree order creation & HMAC webhook verification
    │   └── adminController.ts      # Analytics, user/project moderation, settings, audit logs
    ├── email/                      # Email delivery service (Gmail SMTP / Ethereal / Resend)
    ├── lib/                        # Better Auth, Prisma client adapter, mailer, settings
    ├── middlewares/                # Auth verification, requireAdmin, maintenance guard
    ├── prisma/                     # Database schema definition & migration history
    │   └── schema.prisma
    ├── routes/                     # Router definitions (/api/user, /api/project, /api/admin)
    ├── server.ts                   # Express server entry point
    └── package.json
```

---

## 🗄 Database Schema

The relational database schema is managed via **Prisma 7** against PostgreSQL. Below is an overview of the core models:

```mermaid
erDiagram
    User ||--o{ WebsiteProject : owns
    User ||--o{ Transaction : executes
    User ||--o{ AdminAuditLog : triggers
    User ||--o{ UserNotification : receives
    WebsiteProject ||--o{ Conversation : contains
    WebsiteProject ||--o{ Version : captures
    
    User {
        string id PK
        string email
        string username UK
        string name
        int credits
        int totalCreation
        boolean emailVerified
        boolean isAdmin
        boolean profilePublic
    }
    WebsiteProject {
        string id PK
        string name
        string slug
        string initial_prompt
        string current_code
        boolean isPublished
        boolean featured
        string designSystemId
    }
    Conversation {
        string id PK
        enum role
        string content
        datetime timestamp
    }
    Version {
        string id PK
        string code
        string description
        datetime timestamp
    }
    Transaction {
        string id PK
        string gatewayOrderId UK
        string status
        boolean isPaid
        float amount
        int credits
    }
    AdminAuditLog {
        string id PK
        string adminUserId FK
        string action
        string targetType
        json details
    }
    SystemSetting {
        string id PK
        string value
    }
    DesignSystem {
        string id PK
        string name
        json palette
        json typography
        boolean isEnabled
    }
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
* **Node.js** v20.0.0 or higher
* **npm** v10.0.0 or higher
* **PostgreSQL Database** (A free serverless database from [Neon.tech](https://neon.tech) is recommended)
* **OpenRouter API Key** (Obtain a free/paid key from [OpenRouter.ai](https://openrouter.ai/keys))
* **Cashfree Payments Account** (Optional for local payments; sandbox mode supported)

---

### 1. Clone Repository

```bash
git clone https://github.com/moin-dbud/site-builder.git
cd site-builder
```

---

### 2. Install Dependencies

Install dependencies across all three modules (`server`, `client`, and `admin`):

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install

# Install Admin Dependencies
cd ../admin
npm install

cd ..
```

---

### 3. Environment Setup

#### Server Environment (`server/.env`)
Copy the provided `.env.example` file in `server/` to `.env`:

```bash
cp server/.env.example server/.env
```

Configure your parameters safely in `server/.env`:

```env
# ── Database ──────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require"

# ── Better Auth ───────────────────────────────────────────────────────────────
BETTER_AUTH_SECRET=your_at_least_32_char_random_secret_string
BETTER_AUTH_URL=http://localhost:3000

# ── CORS & Trusted Origins ────────────────────────────────────────────────────
TRUSTED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# ── Server Config ─────────────────────────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── AI Integration (OpenRouter) ───────────────────────────────────────────────
AI_API_KEY=sk-or-v1-your_openrouter_api_key_here

# ── Email Delivery (Gmail SMTP or Resend API) ─────────────────────────────────
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM="Buildo AI <noreply@yourdomain.com>"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM="Buildo AI <your_email@gmail.com>"

# ── Cashfree Payments ─────────────────────────────────────────────────────────
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENV=sandbox

# ── Frontend Redirect URL ─────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

#### Client Environment (`client/.env`)
Create or edit `client/.env`:

```env
VITE_BASEURL=http://localhost:3000
VITE_CASHFREE_ENV=sandbox
```

#### Admin Environment (`admin/.env`)
Create or edit `admin/.env`:

```env
VITE_BASEURL=http://localhost:3000
```

---

### 4. Database Migration & Initialization

Run Prisma migrations from the `server/` directory to construct database tables:

```bash
cd server

# Generate Prisma Client
npx prisma generate

# Apply Database Migrations
npx prisma migrate dev --name init
```

---

### 5. Run Development Servers

Launch backend and frontend applications in separate terminal windows:

```bash
# Terminal 1: Express API Backend Server (Port 3000)
cd server
npm run server

# Terminal 2: Client Web Studio (Port 5173)
cd client
npm run dev

# Terminal 3: Platform Admin Panel (Port 5174)
cd admin
npm run dev
```

| Service | Access URL |
|---|---|
| **Client Studio App** | `http://localhost:5173` |
| **Admin Console** | `http://localhost:5174` |
| **Express Backend API** | `http://localhost:3000` |

---

### 6. Admin Account Setup

To grant administrator rights to your user account:
1. Sign up normally through the client app at `http://localhost:5173`.
2. Promote your user in PostgreSQL via direct SQL query or Prisma Studio:
   ```sql
   UPDATE "user" SET "isAdmin" = true WHERE email = 'your-email@domain.com';
   ```
3. Log in at `http://localhost:5174` to access the Admin Console.

---

## 📜 Available Scripts

### Server (`server/`)
| Script | Command | Description |
|---|---|---|
| `npm run server` | `nodemon --exec tsx server.ts` | Runs backend server with live reload |
| `npm start` | `node dist/server.js` | Runs compiled production server |
| `npm run build` | `npx prisma generate && tsc` | Generates Prisma client and compiles TypeScript |

### Client (`client/`) & Admin (`admin/`)
| Script | Command | Description |
|---|---|---|
| `npm run dev` | `vite` | Starts Vite development server |
| `npm run build` | `tsc -b && vite build` | Type-checks project and creates production bundle |
| `npm run lint` | `oxlint` | Runs Oxlint code verification |
| `npm run preview` | `vite preview` | Previews production build locally |

---

## 💡 Key Technical Implementation Highlights

### 1. Sub-300ms Async Generation Pipeline
To eliminate UI blocking during multi-step AI completion tasks, project initialization is decoupled from AI generation:
1. When a user submits a prompt, `createUserProject` creates the database record and returns `{ projectId }` in **< 300ms**.
2. Client router immediately redirects to `/projects/:projectId`.
3. Background task `generateProjectCodeInBackground` executes prompt enhancement and HTML generation asynchronously.
4. Workspace polls `/api/user/project/:projectId` every 3 seconds until `current_code` is populated.

```typescript
// server/controllers/userController.ts
export const createUserProject = async (req: Request, res: Response) => {
    // 1. Instant DB creation
    const project = await prisma.websiteProject.create({ ... });

    // 2. Immediate HTTP response for fast navigation
    res.json({ projectId: project.id, message: "Project created successfully" });

    // 3. Asynchronous background execution
    generateProjectCodeInBackground(project.id, userId, initial_prompt, creditsPerGeneration).catch(console.error);
};
```

### 2. Double-Pass OpenRouter AI Generation
Buildo executes a two-stage LLM generation pipeline:
* **Stage 1 (Prompt Enhancement):** Reinterprets user requests as marketing/presence landing pages, expanding visual direction, component requirements, and semantic layout goals.
* **Stage 2 (Code Generation):** Accepts enhanced specifications and the assigned design system JSON token map, returning standalone HTML5 code with inline Tailwind CSS and working client-side interactivity.

---

## 🌐 Deployment

### Frontend & Admin Deployment (Vercel)
Both `client/` and `admin/` are configured for SPA deployment on [Vercel](https://vercel.com) using `vercel.json` rewrite rules:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend Deployment (Render / Railway / VPS)
For production backend deployment:
1. Set `NODE_ENV=production`.
2. Configure `BETTER_AUTH_URL` and `FRONTEND_URL` to your production domains.
3. Configure `TRUSTED_ORIGINS` with comma-separated production origins.
4. Set up Cashfree Production Webhooks pointing to `https://your-api.com/api/cashfree/webhook`.

---

## 🤝 Contributing

Contributions are welcome! To contribute to Buildo:

1. **Fork** the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push to your branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a **Pull Request**.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more details.

---

## 👨‍💻 Developer

**Moin Sheikh**
* **Portfolio / Website:** [buildo.moinsheikh.in](https://buildo.moinsheikh.in)
* **GitHub:** [@moin-dbud](https://github.com/moin-dbud)
* **LinkedIn:** [Moin Sheikh](https://www.linkedin.com/in/moin-build/)
* **Email:** [hello@moinsheikh.in](mailto:hello@moinsheikh.in)
