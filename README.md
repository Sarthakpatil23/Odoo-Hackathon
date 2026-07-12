# AssetFlow

> **Enterprise Asset & Resource Management System**  
> Built for Odoo Hackathon 2026

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://neon.tech)
[![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

AssetFlow replaces manual asset tracking (spreadsheets, paper logs) with a structured, role-aware ERP platform. Any organization with physical assets or shared spaces — offices, schools, hospitals, factories — can use it out of the box.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [User Roles](#4-user-roles)
5. [Pages & Features](#5-pages--features)
6. [API Reference](#6-api-reference)
7. [Database Schema](#7-database-schema)
8. [Business Rules](#8-business-rules)
9. [Design System](#9-design-system)
10. [Project Structure](#10-project-structure)
11. [Getting Started](#11-getting-started)
12. [Demo Credentials](#12-demo-credentials)
13. [Seeded Data](#13-seeded-data)

---

## 1. Overview

### What it does

| Capability | Description |
|---|---|
| Asset Lifecycle | Track assets from registration through allocation, maintenance, and retirement |
| Resource Booking | Google Calendar-style drag/drop/stretch timeline for shared resources |
| Maintenance Kanban | Drag-and-drop board with optimistic UI and silent DB sync |
| Audit Cycles | Assign auditors, mark discrepancies, auto-close with state changes |
| Role-Based Access | 4 roles with scoped views — Admin, Asset Manager, Dept Head, Employee |
| Live Database | PostgreSQL via Prisma with 22 users, 110 assets, 296 bookings seeded |

### What it is not

- Not an accounting or invoicing system (acquisition cost is stored for reports only)
- Not a real-time push notification system (polling + on-action inserts)
- Not a purchasing or procurement module

---

## 2. Tech Stack

### Frontend

| Package | Version | Role |
|---|---|---|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| react-router-dom | 7 | Client-side routing |
| axios | latest | HTTP client with request/response interceptors |
| @dnd-kit/core + sortable | latest | Drag & drop (Kanban board + Bookings timeline) |
| Recharts | latest | Analytics charts and heatmaps |
| Lucide React | latest | Consistent icon library |
| GSAP | latest | Landing page scroll animations |
| Vanilla CSS | — | Design system tokens, animations, utilities |

### Backend

| Package | Version | Role |
|---|---|---|
| Node.js | 24 | Runtime environment |
| Express | 5 | REST API framework |
| Prisma | 7 | ORM & type-safe database client |
| PostgreSQL (Neon) | — | Cloud-hosted relational database |
| jsonwebtoken | latest | JWT signing & verification (8h expiry) |
| bcrypt | latest | Secure password hashing (10 salt rounds) |
| cors | latest | Cross-origin resource sharing |
| nodemon | latest | Dev server auto-reload |

---

## 3. Architecture

```
┌──────────────────────────────────────────────────────┐
│                   REACT CLIENT                        │
│                                                       │
│  Public         Protected (Auth Required)             │
│  ─────────      ──────────────────────────────────   │
│  Landing        Dashboard  │  Assets  │  Allocations  │
│  Login          Bookings   │  Maint.  │  Audits       │
│  Signup         Reports    │  Notifs  │  Org Setup*   │
│                                          *Admin only   │
│  ─────────────────────────────────────────────────   │
│  AuthContext (JWT) · Axios Interceptors · dnd-kit    │
└───────────────────────┬──────────────────────────────┘
                        │ REST (HTTP/JSON)
┌───────────────────────▼──────────────────────────────┐
│                   EXPRESS SERVER                       │
│                                                       │
│  Middleware              Routes                       │
│  ──────────              ────────────────────────    │
│  authenticate()          /api/auth      (public)      │
│  authorize(...roles)     /api/assets                  │
│  CORS + JSON body        /api/allocations             │
│                          /api/bookings                │
│                          /api/maintenance             │
│                          /api/audits                  │
│                          /api/departments             │
│                          /api/employees               │
│                          /api/dashboard               │
│                          /api/activity-logs           │
└───────────────────────┬──────────────────────────────┘
                        │ Prisma ORM
┌───────────────────────▼──────────────────────────────┐
│             POSTGRESQL  (hosted on Neon)               │
│                                                       │
│  User · Department · AssetCategory · Asset            │
│  Allocation · Transfer · Booking                      │
│  MaintenanceRequest · AuditCycle · AuditItem          │
│  Notification · ActivityLog                           │
└──────────────────────────────────────────────────────┘
```

---

## 4. User Roles

### Role Definitions

| Role | Who | Key Capability |
|---|---|---|
| **Admin** | System administrator | Full access; only role that can promote other users |
| **AssetManager** | Asset/facilities manager | Register assets, approve maintenance, approve transfers |
| **DepartmentHead** | Team/dept lead | View dept assets, approve transfers within dept, book resources |
| **Employee** | Regular staff | View own assets, book resources, raise maintenance requests |

> **Security rule:** Signup always creates an `Employee`. Role promotion is exclusively done by Admin via the Organization Setup → Employee Directory tab. No self-elevation exists anywhere in the system.

### Access Matrix

| Feature | Admin | AssetManager | DeptHead | Employee |
|---|:---:|:---:|:---:|:---:|
| Organization Setup | ✅ | ❌ | ❌ | ❌ |
| Promote User Roles | ✅ | ❌ | ❌ | ❌ |
| Register Assets | ✅ | ✅ | ❌ | ❌ |
| View All Assets | ✅ | ✅ | ❌ | ❌ |
| View Dept Assets | ✅ | ✅ | ✅ | ❌ |
| View Own Assets | ✅ | ✅ | ✅ | ✅ |
| Allocate Assets | ✅ | ✅ | ❌ | ❌ |
| Approve Transfers | ✅ | ✅ | ✅ | ❌ |
| Book Resources | ✅ | ✅ | ✅ | ✅ |
| Raise Maintenance | ✅ | ✅ | ✅ | ✅ |
| Approve Maintenance | ✅ | ✅ | ❌ | ❌ |
| Kanban Drag/Drop | ✅ | ✅ | ❌ | ❌ |
| Run Audit Cycles | ✅ | ✅ | ❌ | ❌ |
| Mark Audit Items | ✅ | ✅ | ✅ | ❌ |
| View Reports | ✅ | ✅ | ✅ | ❌ |
| Notifications | ✅ | ✅ | ✅ | ✅ |

---

## 5. Pages & Features

### Landing (`/`)
Premium dark marketing page with:
- GSAP-animated stacked mockup card cluster in the hero
- Feature showcase sections with glassmorphic cards
- Animated SVG logo and navigation
- CTA buttons linking to Signup and Login

---

### Auth Pages

#### Login (`/login`)
- Email + password form → `POST /api/auth/login`
- Quick Login buttons for all 4 roles (no typing required for demos)
- Auto-redirects to `/dashboard` on success
- "Don't have an account?" link to Signup

#### Signup (`/signup`)
- Name, email, password form → `POST /api/auth/signup`
- Always creates an `Employee` account
- Auto-logs in after registration and redirects to dashboard

---

### Dashboard (`/dashboard`)

Fetches live data from the database on every load.

| Card / Section | Data Source | Description |
|---|---|---|
| Assets Available | `/api/dashboard/kpis` | Count of assets with `Available` status |
| Assets Allocated | `/api/dashboard/kpis` | Count of active allocations |
| Maintenance Today | `/api/dashboard/kpis` | Tickets updated today |
| Active Bookings | `/api/dashboard/kpis` | Ongoing and upcoming bookings |
| Pending Transfers | `/api/dashboard/kpis` | Unapproved transfer requests |
| Overdue Returns | `/api/dashboard/overdue-returns` | Allocations past expected return date |
| Recent Activity | `/api/activity-logs` | Latest 5 system-wide actions |

Role-mode switcher (Admin / Asset Mgr / Dept Head / Employee) lets you preview the dashboard perspective for each role without logging out.

---

### Organization Setup (`/organization`) — *Admin only*

Three tabs for managing master data:

#### Tab 1 — Departments
- Create, edit, and deactivate departments
- Assign a Department Head per department
- Optional parent department (supports hierarchy)
- Active / Inactive status toggle

#### Tab 2 — Asset Categories
- Create and edit categories (Electronics, Furniture, Vehicles, etc.)
- Optional category-specific JSON fields (e.g. warranty period)

#### Tab 3 — Employee Directory
- View all users with role, department, and status
- **Promote** Employee → Department Head or Asset Manager
- **Deactivate** / **Reactivate** accounts
- Search and filter by name, email, role, or status

---

### Assets (`/assets`)

#### Registration Fields
`Name` · `Category` · `Auto-Tag (AF-0001)` · `Serial Number` · `Acquisition Date` · `Acquisition Cost` · `Condition` · `Location` · `Photo` · `Bookable Flag`

#### Lifecycle Statuses
```
Available  →  Allocated  →  Available (returned)
Available  →  UnderMaintenance  →  Available (resolved)
Available  →  Reserved (bookable)
Available  →  Lost / Retired / Disposed
```

#### Features
- Full-text search by tag, serial, name
- Filter by category, status, department, location
- Per-asset history: allocation log + maintenance log

---

### Allocations (`/allocations`)

| Workflow | Steps |
|---|---|
| **Allocate** | Select asset + employee → set expected return date → confirm |
| **Double-allocation block** | If asset is taken: shows current holder, offers Transfer Request instead |
| **Transfer** | `Requested → Approved (Asset Mgr/Dept Head) → Re-allocated` |
| **Return** | Mark returned → capture condition notes → asset → `Available` |
| **Overdue flag** | Automatically highlighted when past expected return date |

---

### Bookings (`/bookings`)

Google Calendar-inspired timeline UI.

| Interaction | How it works |
|---|---|
| **Create** | Click and drag on empty hour slots to select a range → confirm in popover |
| **Move** | Drag an existing booking card to a new time slot |
| **Resize** | Drag the bottom handle of a card to extend its duration |
| **Overlap check** | Server returns `409` if times conflict; card snaps back with error |
| **Cancel** | From the right sidebar list → `PATCH /api/bookings/:id/cancel` |

**Booking colors (subtle 5% tints):**
- 🔵 Blue — Ongoing
- 🟡 Amber — Upcoming
- 🟢 Green — Completed

Mobile (< 640px): Automatically falls back to a vertical stacked list.

---

### Maintenance (`/maintenance`)

**Kanban board** with drag-and-drop stage progression.

#### Stages (in order)
```
Pending  →  Approved  →  Technician Assigned  →  In Progress  →  Resolved
```

#### Key Behaviors
| Behavior | Detail |
|---|---|
| **Drag & drop** | Cards draggable between adjacent columns (dnd-kit) |
| **Optimistic UI** | Local state updates instantly on drop; DB syncs silently in background — drag always works |
| **Role guard** | Only Admin and Asset Manager can drag cards |
| **Sequential only** | Cards can only move one stage at a time |
| **Asset sync** | Asset → `UnderMaintenance` on Approve; asset → `Available` on Resolve |
| **Raise request** | Modal with asset selector, issue description, priority (Low/Med/High), photo URL |
| **Table view** | Toggle between board and tabular view; auto-switches on mobile |

---

### Audits (`/audits`)

| Step | Action |
|---|---|
| 1 | Admin/Manager creates an **Audit Cycle** with scope (dept/location) and date range |
| 2 | Assign one or more **auditors** to the cycle |
| 3 | Auditors mark each asset as `Verified`, `Missing`, or `Damaged` |
| 4 | System auto-generates a **discrepancy report** for flagged items |
| 5 | Admin **closes the cycle** → locks audit → confirmed-missing assets → `Lost` |

Audit history is retained per cycle and per asset.

---

### Reports (`/reports`)

| Report | Chart Type | Description |
|---|---|---|
| Asset Utilization | Bar chart | Most-used vs. idle assets |
| Booking Heatmap | Grid heatmap | Peak booking hours by day of week |
| Maintenance Frequency | Bar chart | Request counts by asset/category |
| Department Allocation | Bar chart | Asset counts per department |
| Overdue Returns | Table | Allocations past expected date |

---

### Notifications (`/notifications`)

- In-app notification feed for every user
- Types: `Asset Assigned`, `Maintenance Approved/Rejected`, `Booking Confirmed/Cancelled`, `Transfer Approved`, `Overdue Return Alert`, `Audit Discrepancy`
- Per-notification mark as read
- Bulk "Mark all as read"
- Full activity log timeline with actor, action, and timestamp

---

## 6. API Reference

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register Employee account |
| `POST` | `/api/auth/login` | Public | Login, receive JWT |
| `GET` | `/api/auth/me` | Token | Decode current user from token |

### Dashboard
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/kpis` | Token | Live KPI counts |
| `GET` | `/api/dashboard/overdue-returns` | Token | Overdue allocation list |
| `GET` | `/api/activity-logs` | Token | Recent activity feed |

### Assets
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/assets` | Token | List assets (filterable) |
| `POST` | `/api/assets` | AssetManager+ | Register new asset |
| `PATCH` | `/api/assets/:id` | AssetManager+ | Update asset fields |
| `DELETE` | `/api/assets/:id` | Admin | Remove asset |

### Allocations & Transfers
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/allocations` | Token | List allocations (role-scoped) |
| `POST` | `/api/allocations` | AssetManager+ | Create allocation |
| `PATCH` | `/api/allocations/:id/return` | AssetManager+ | Return asset |
| `GET` | `/api/transfers` | Token | List transfer requests |
| `POST` | `/api/transfers` | Token | Raise transfer request |
| `PATCH` | `/api/transfers/:id/approve` | AssetManager+ | Approve transfer |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/bookings` | Token | List bookings |
| `POST` | `/api/bookings` | Token | Create booking (overlap check) |
| `PATCH` | `/api/bookings/:id` | Token | Reschedule/update booking |
| `PATCH` | `/api/bookings/:id/cancel` | Token | Cancel booking |

### Maintenance
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Token | List tickets (role-scoped) |
| `POST` | `/api/maintenance` | Token | Raise maintenance request |
| `PATCH` | `/api/maintenance/:id/approve` | AssetManager+ | Approve → asset UnderMaintenance |
| `PATCH` | `/api/maintenance/:id/reject` | AssetManager+ | Reject request |
| `PATCH` | `/api/maintenance/:id/assign` | AssetManager+ | Assign technician |
| `PATCH` | `/api/maintenance/:id/start` | AssetManager+ | Mark In Progress |
| `PATCH` | `/api/maintenance/:id/resolve` | AssetManager+ | Resolve → asset Available |

### Organization
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/departments` | Token | List departments |
| `POST` | `/api/departments` | Admin | Create department |
| `PATCH` | `/api/departments/:id` | Admin | Update department |
| `GET` | `/api/employees` | Admin/AssetMgr | List all users |
| `PATCH` | `/api/employees/:id/role` | Admin | Promote user role |
| `PATCH` | `/api/employees/:id/status` | Admin | Activate/deactivate user |
| `GET` | `/api/asset-categories` | Token | List categories |
| `POST` | `/api/asset-categories` | Admin | Create category |

---

## 7. Database Schema

### Core Models

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  password     String                          // bcrypt hash
  role         Role     @default(Employee)
  status       Status   @default(Active)
  departmentId String?
  department   Department? @relation(fields: [departmentId], references: [id])
}

model Asset {
  id              String      @id @default(cuid())
  tag             String      @unique            // e.g. AF-0001
  name            String
  categoryId      String
  serialNumber    String?
  acquisitionDate DateTime?
  acquisitionCost Float?
  condition       String?
  location        String?
  status          AssetStatus @default(Available)
  isBookable      Boolean     @default(false)
}

model Allocation {
  id                   String           @id @default(cuid())
  assetId              String
  employeeId           String
  allocatedAt          DateTime         @default(now())
  expectedReturnDate   DateTime?
  returnedAt           DateTime?
  returnConditionNotes String?
  status               AllocationStatus @default(Active)
}

model Booking {
  id         String        @id @default(cuid())
  assetId    String
  employeeId String
  startTime  DateTime
  endTime    DateTime
  status     BookingStatus @default(Upcoming)
}

model MaintenanceRequest {
  id           String            @id @default(cuid())
  assetId      String
  raisedById   String
  issue        String
  priority     Priority
  photoUrl     String?
  status       MaintenanceStatus @default(Pending)
  technician   String?
  approvedById String?
}

model AuditCycle {
  id        String      @id @default(cuid())
  scope     String
  startDate DateTime
  endDate   DateTime
  status    AuditStatus @default(Open)
  items     AuditItem[]
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
}

model ActivityLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  entityType String
  entityId   String?
  createdAt  DateTime @default(now())
}
```

### Enums

| Enum | Values |
|---|---|
| `Role` | `Admin` `AssetManager` `DepartmentHead` `Employee` |
| `AssetStatus` | `Available` `Allocated` `Reserved` `UnderMaintenance` `Lost` `Retired` `Disposed` |
| `AllocationStatus` | `Active` `Returned` `Overdue` |
| `BookingStatus` | `Upcoming` `Ongoing` `Completed` `Cancelled` |
| `MaintenanceStatus` | `Pending` `Approved` `Rejected` `TechnicianAssigned` `InProgress` `Resolved` |
| `Priority` | `Low` `Medium` `High` |
| `AuditStatus` | `Open` `Closed` |

---

## 8. Business Rules

These rules are enforced at both the **API layer** and **UI layer**:

| # | Rule | Where enforced |
|---|---|---|
| 1 | **No double-allocation** — Asset already in non-Available state cannot be allocated again. System shows current holder and offers Transfer Request. | Server `POST /api/allocations` |
| 2 | **No overlapping bookings** — Check: `existingStart < newEnd AND existingEnd > newStart`. Back-to-back bookings are allowed. | Server `POST /api/bookings` (returns 409) |
| 3 | **Maintenance requires approval** — Asset only becomes `UnderMaintenance` when Asset Manager approves, not when request is raised. | Server `PATCH .../approve` |
| 4 | **Maintenance resolve restores asset** — Asset reverts to `Available` on resolve (skipped if `Retired` or `Disposed`). | Server `PATCH .../resolve` |
| 5 | **Transfer requires approval** — Asset stays with current holder until transfer is explicitly approved. | Server `PATCH .../approve` |
| 6 | **Overdue detection is automatic** — Allocations past `expectedReturnDate` are flagged at query time, not manually marked. | Server queries |
| 7 | **Audit closure changes asset state** — Only at cycle closure do confirmed-missing assets become `Lost`. | Server `PATCH .../close` |
| 8 | **Role assignment is Admin-only** — Signup always creates `Employee`. Only Admin can promote via Employee Directory. | Server auth + RBAC middleware |
| 9 | **Valid lifecycle transitions only** — Invalid transitions (e.g. `Retired → Allocated`) are rejected. | Server route guards |
| 10 | **Sequential Kanban progression** — Tickets can only move one stage at a time on the maintenance board. | Client-side guard in `handleDragEnd` |

---

## 9. Design System

AssetFlow uses a custom premium dark design language defined in [`design.md`](./design.md).

### Color Tokens

| Token | Value | Usage |
|---|---|---|
| `--background` | `#000000` | Pure black canvas |
| `--surface` | `#0a0a0a` | Card backgrounds |
| `--border` | `rgba(255,255,255,0.08)` | Hairline borders throughout |
| `--foreground` | `#f5f5f5` | Primary text |
| `--muted` | `#888888` | Secondary/helper text |
| `--accent` | `#ffffff` | Interactive highlights |

### Design Principles

| Principle | Implementation |
|---|---|
| **Pure black canvas** | `#000000` background — true dark mode, no grey surfaces |
| **Glassmorphism** | `backdrop-blur` + translucent card backgrounds |
| **Hairline borders** | `1px solid rgba(255,255,255,0.08)` everywhere |
| **Micro-animations** | `fade-in`, `slide-up`, hover transitions on every interactive element |
| **5% color accents** | Subtle HSL tints (10% fill, 30% border) for status indicators |
| **Typography** | Inter font — clean, modern, readable at all sizes |
| **Spacing grid** | 4px base grid for all padding and margins |

---

## 10. Project Structure

```
assetflow/
│
├── README.md
├── design.md                        # Full design system specification
├── features.md                      # Feature requirements spec
│
├── client/                          # React frontend (Vite)
│   ├── public/
│   │   └── favicon.svg              # Custom SVG logo favicon (dark/light aware)
│   │
│   └── src/
│       ├── api/
│       │   └── axios.js             # Axios instance + request/response interceptors
│       │
│       ├── components/
│       │   ├── shared/
│       │   │   ├── Logo.jsx         # Geometric SVG logo (dark/light modes)
│       │   │   ├── Card.jsx         # Base card container
│       │   │   ├── StatusDot.jsx    # Colored status indicator dots
│       │   │   ├── Skeleton.jsx     # Loading skeleton blocks
│       │   │   └── EmptyState.jsx   # Empty state placeholder
│       │   ├── ui/
│       │   │   ├── button.jsx       # Reusable button variants
│       │   │   └── CardSwap.jsx     # Animated stacked card component (landing)
│       │   └── ProtectedRoute.jsx   # Auth guard + role-based route protection
│       │
│       ├── context/
│       │   └── AuthContext.jsx      # JWT session state + restore on reload
│       │
│       ├── layouts/
│       │   └── AppLayout.jsx        # Sidebar + workspace shell
│       │
│       ├── pages/
│       │   ├── Landing.jsx          # Marketing landing page
│       │   ├── Login.jsx            # Auth login form
│       │   ├── Signup.jsx           # New account registration
│       │   ├── Dashboard.jsx        # Live KPI overview
│       │   ├── OrganizationSetup.jsx # Departments + Categories + Employees (Admin)
│       │   ├── Assets.jsx           # Asset registry + registration
│       │   ├── Allocations.jsx      # Allocate / transfer / return
│       │   ├── Bookings.jsx         # Calendar drag/drop/resize timeline
│       │   ├── Maintenance.jsx      # Kanban drag-and-drop board
│       │   ├── Audits.jsx           # Audit cycle management
│       │   ├── Reports.jsx          # Charts and analytics
│       │   └── Notifications.jsx    # Notification feed + activity log
│       │
│       ├── App.jsx                  # Route definitions
│       ├── index.css                # Design system CSS tokens + utilities
│       └── main.jsx                 # React DOM entry point
│
└── server/                          # Express backend
    ├── index.js                     # App entry point + route registration
    ├── bulk-seed.js                 # Demo data seeder (110 assets, 296 bookings)
    │
    ├── prisma/
    │   └── schema.prisma            # Full database schema + enums
    │
    └── src/
        ├── prisma.js                # Prisma client singleton
        ├── middleware/
        │   └── auth.js              # authenticate() + authorize(...roles) middleware
        │
        └── routes/
            ├── auth.js              # POST /signup, POST /login, GET /me
            ├── dashboard.js         # GET /kpis, GET /overdue-returns
            ├── assets.js            # CRUD + lifecycle transitions
            ├── allocations.js       # Allocate, return, conflict detection
            ├── transfers.js         # Transfer request + approval flow
            ├── bookings.js          # Create, update, cancel + overlap validation
            ├── maintenance.js       # Kanban workflow: approve/assign/start/resolve
            ├── audits.js            # Audit cycles + item marking + close
            ├── departments.js       # CRUD departments
            ├── employees.js         # List, promote, activate/deactivate
            └── asset-categories.js  # CRUD asset categories
```

---

## 11. Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL database (local or [Neon](https://neon.tech) cloud)

### Step 1 — Clone

```bash
git clone https://github.com/your-org/assetflow.git
cd assetflow
```

### Step 2 — Server Setup

```bash
cd server
npm install
```

Create `server/.env`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-secret-key-minimum-32-characters"
PORT=5000
```

Run database migrations and generate Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

Seed demo data:

```bash
node bulk-seed.js
```

Start the server:

```bash
npm run dev      # Development (nodemon auto-reload)
npm start        # Production
```

### Step 3 — Client Setup

```bash
cd ../client
npm install
```

Optionally create `client/.env` (defaults to localhost if omitted):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

### Step 4 — Open

| Service | URL |
|---|---|
| Frontend | http://localhost:5175 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |

---

## 12. Demo Credentials

All accounts use password: **`password123`**

| Role | Email | Access Level |
|---|---|---|
| 🔴 Admin | `admin@assetflow.com` | Full access including Org Setup |
| 🟡 Asset Manager | `manager@assetflow.com` | Asset registration, allocation, maintenance approval |
| 🟢 Dept Head (Engineering) | `head@assetflow.com` | Dept-scoped assets, bookings, transfer approval |
| 🟢 Dept Head (HR) | `hr1@assetflow.com` | HR department scope |
| 🔵 Employee (Dev) | `dev1@assetflow.com` | Own assets, bookings, maintenance requests |
| 🔵 Employee (QA) | `qa1@assetflow.com` | Own assets, bookings, maintenance requests |
| 🔵 Employee (Facilities) | `fac1@assetflow.com` | Own assets, bookings, maintenance requests |

> **Tip:** The **Quick Login** buttons on the login page let you switch between roles instantly without typing credentials — great for demos.

---

## 13. Seeded Data

Running `bulk-seed.js` populates the database with realistic demo data:

| Entity | Count | Notes |
|---|---|---|
| Departments | 8 | Engineering, HR, Finance, Marketing, Operations, Facilities, IT, Management |
| Users | 22 | Across all 4 roles with department assignments |
| Asset Categories | 6 | Electronics, Furniture, Vehicles, Equipment, Software, Fixtures |
| Assets | 110 | Mix of statuses; tagged `AF-0001` through `AF-0110` |
| Active Allocations | 15 | Various employees with expected return dates |
| Transfer Requests | 10 | Mix of Requested and Approved states |
| Maintenance Requests | 30 | Spread across all Kanban stages |
| Bookings | 296 | Spread over the next 7 days for rich heatmap density |

---

*AssetFlow — Track everything. Lose nothing.*
