<div align="center">

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🛠️ Tech Stack](#️-tech-stack)
- [👥 User Roles &amp; Access Control](#-user-roles--access-control)
- [📄 Pages &amp; Modules](#-pages--modules)
- [🗃️ Database Schema](#️-database-schema)
- [🔗 API Reference](#-api-reference)
- [⚙️ Getting Started](#️-getting-started)
- [🔐 Default Credentials](#-default-credentials)
- [📐 Design System](#-design-system)
- [📁 Project Structure](#-project-structure)
- [📏 Business Rules](#-business-rules)

---

## 🎯 Project Overview

AssetFlow is a full-stack, production-grade asset management system that replaces manual tracking (spreadsheets, paper logs) with:

- **Structured asset lifecycles** — Available → Allocated → Under Maintenance → Resolved
- **Role-based access control** — 4 distinct roles with scoped views and actions
- **Real-time booking calendar** — Google Calendar-style drag, drop & stretch UI
- **Kanban maintenance board** — drag-and-drop stage progression with DB sync
- **Audit cycles** — assign auditors, mark discrepancies, auto-close with state changes
- **Rich analytics** — heatmaps, utilization charts, department breakdowns
- **Live database integration** — PostgreSQL (Neon) via Prisma ORM

**No industry lock-in** — Works for offices, schools, hospitals, factories, or any organization with physical assets or shared spaces.

---

## ✨ Features

### 🔐 Authentication

| Feature             | Detail                                                        |
| ------------------- | ------------------------------------------------------------- |
| JWT login           | Email + password auth, 8h token expiry                        |
| Secure signup       | Always creates`Employee` role — no self-elevation possible |
| Session restore     | Token validated against`/api/me` on every reload            |
| Role sync           | Fresh role fetched from DB on restore, always up-to-date      |
| Quick login buttons | One-click demo logins for all 4 roles                         |

### 📊 Dashboard (Overview)

| Feature            | Detail                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Live KPI cards     | Assets Available, Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns — fetched from DB |
| Overdue returns    | Real-time list of past-due allocations with days overdue                                                                |
| Recent activity    | Last 5 activity log entries across all entity types                                                                     |
| Role-mode switcher | Preview dashboard in Admin / Asset Mgr / Dept Head / Employee view                                                      |
| Quick actions      | Jump to Register Asset, Book Resource, Raise Maintenance Request                                                        |

### 🏢 Organization Setup *(Admin only)*

| Tab                | Feature                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| Departments        | Create / edit / deactivate departments; assign Department Heads; optional parent-child hierarchy   |
| Asset Categories   | Create categories (Electronics, Furniture, Vehicles…); store custom JSON fields per category      |
| Employee Directory | View all users; promote Employee → Department Head or Asset Manager; activate/deactivate accounts |

### 📦 Asset Registry

| Feature            | Detail                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| Registration       | Name, category, auto-generated tag (`AF-0001`), serial number, acquisition date, cost, condition, location, photo, bookable flag |
| Lifecycle statuses | `Available` `Allocated` `Reserved` `UnderMaintenance` `Lost` `Retired` `Disposed`                                    |
| Search & filter    | By tag, serial, category, status, department, location                                                                             |
| Asset history      | Per-asset allocation history + maintenance history                                                                                 |

### 🔄 Allocations & Transfers

| Feature                 | Detail                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| Allocate asset          | Assign asset to employee or department; set expected return date                                |
| Double-allocation block | System rejects if asset is already taken; shows current holder; offers Transfer Request instead |
| Transfer workflow       | `Requested → Approved → Re-allocated`; approval by Asset Manager / Dept Head                |
| Return flow             | Mark returned; capture condition check-in notes; asset reverts to`Available`                  |
| Overdue auto-flag       | Allocations past expected return date are automatically highlighted                             |

### 📅 Resource Bookings *(Google Calendar style)*

| Feature            | Detail                                                                       |
| ------------------ | ---------------------------------------------------------------------------- |
| Timeline view      | 9 AM – 8 PM CSS-grid hour timeline; color-coded booking slots               |
| Drag to book       | Click-and-drag on empty slots to select time range; confirm in popover       |
| Drag to move       | Drag existing bookings to reschedule (with DB sync)                          |
| Stretch to resize  | Drag bottom handle of booking card to extend duration                        |
| Overlap validation | Server-side`409` rejection for overlapping bookings                        |
| Booking colors     | Blue (Ongoing), Amber (Upcoming), Green (Completed) — subtle 5% color tints |
| Status actions     | Cancel / reschedule from right sidebar list                                  |

### 🔧 Maintenance Management *(Kanban Board)*

| Feature           | Detail                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Raise request     | Select asset, describe issue, set priority (Low/Medium/High), attach photo                          |
| Kanban board      | 5 columns:`Pending` → `Approved` → `Technician Assigned` → `In Progress` → `Resolved` |
| Drag & drop       | Cards draggable between sequential columns (dnd-kit)                                                |
| Optimistic UI     | Local state updates instantly on drop; DB syncs silently in background                              |
| Role guard        | Only Admin / Asset Manager can advance stages                                                       |
| Asset auto-update | Asset flips to`UnderMaintenance` on approval; back to `Available` on resolve                    |
| Table view        | Alternative tabular view; auto-switches on mobile                                                   |
| Reject flow       | Reject from Pending with reason; notifies requester                                                 |

### 🔍 Asset Audits

| Feature            | Detail                                                            |
| ------------------ | ----------------------------------------------------------------- |
| Audit cycles       | Create cycle with scope (department/location) and date range      |
| Assign auditors    | Assign one or more users as auditors                              |
| Audit items        | Auditor marks each asset:`Verified` / `Missing` / `Damaged` |
| Discrepancy report | Auto-generated from flagged items                                 |
| Close cycle        | Locks audit; updates confirmed-missing assets to`Lost` status   |
| History            | Full per-cycle audit history retained                             |

### 📈 Reports & Analytics

| Feature               | Detail                                  |
| --------------------- | --------------------------------------- |
| Asset utilization     | Bar charts of most-used vs. idle assets |
| Maintenance frequency | Breakdown by asset / category           |
| Booking heatmap       | Peak usage windows across the week      |
| Department summary    | Allocation counts per department        |
| Overdue report        | Assets past expected return date        |

### 🔔 Notifications

| Feature       | Detail                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| In-app alerts | Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled, Transfer Approved, Overdue Return, Audit Discrepancy |
| Mark as read  | Per-notification and bulk mark-all-read                                                                                          |
| Activity log  | Full timestamped log of every admin/manager/employee action                                                                      |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                     │
│                                                                   │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │ Landing │  │  Login  │  │  Signup  │  │   App (Routes)  │   │
│  └─────────┘  └─────────┘  └──────────┘  └────────┬────────┘   │
│                                                    │             │
│        ┌───────────────────────────────────────────┤             │
│        │              Protected Routes              │             │
│        ├──────────┬────────────┬──────────┬────────┤             │
│        │Dashboard │  Assets   │Allocations│Bookings│             │
│        ├──────────┼────────────┼──────────┼────────┤             │
│        │Maintenanc│  Audits   │  Reports │ Notifs │             │
│        └──────────┴────────────┴──────────┴────────┘             │
│                                                                   │
│  AuthContext (JWT) │ Axios Interceptors │ dnd-kit │ Recharts     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP (REST)
┌──────────────────────────────▼──────────────────────────────────┐
│                       SERVER (Express)                            │
│                                                                   │
│  ┌──────────┐  ┌───────────┐  ┌──────────────┐                  │
│  │   Auth   │  │Middleware │  │    Routes    │                  │
│  │ /signup  │  │authenticate│  │/assets       │                  │
│  │ /login   │  │authorize  │  │/allocations  │                  │
│  │ /me      │  │  (RBAC)   │  │/bookings     │                  │
│  └──────────┘  └───────────┘  │/maintenance  │                  │
│                                │/audits       │                  │
│                                │/departments  │                  │
│                                │/employees    │                  │
│                                │/dashboard    │                  │
│                                │/activity-logs│                  │
│                                └──────┬───────┘                  │
└───────────────────────────────────────┼─────────────────────────┘
                                        │ Prisma ORM
┌───────────────────────────────────────▼─────────────────────────┐
│                   PostgreSQL (Neon Cloud)                         │
│                                                                   │
│  Users │ Departments │ AssetCategories │ Assets │ Allocations    │
│  Transfers │ Bookings │ MaintenanceRequests │ AuditCycles        │
│  AuditItems │ Notifications │ ActivityLogs                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

| Technology                  | Version | Purpose                           |
| --------------------------- | ------- | --------------------------------- |
| **React**             | 19      | UI framework                      |
| **Vite**              | 8       | Build tool & dev server           |
| **react-router-dom**  | 7       | Client-side routing               |
| **axios**             | —      | HTTP client with interceptors     |
| **@dnd-kit/core**     | —      | Drag & drop (Kanban + Bookings)   |
| **@dnd-kit/sortable** | —      | Sortable lists and Kanban columns |
| **Recharts**          | —      | Analytics charts                  |
| **Lucide React**      | —      | Icon library                      |
| **GSAP**              | —      | Landing page animations           |
| **Vanilla CSS**       | —      | Design system tokens, animations  |

### Backend

| Technology             | Version | Purpose                              |
| ---------------------- | ------- | ------------------------------------ |
| **Node.js**      | 24      | Runtime                              |
| **Express**      | 5       | REST API framework                   |
| **Prisma**       | 7       | ORM & database client                |
| **PostgreSQL**   | —      | Relational database (hosted on Neon) |
| **jsonwebtoken** | —      | JWT signing & verification           |
| **bcrypt**       | —      | Password hashing                     |
| **cors**         | —      | Cross-origin resource sharing        |
| **nodemon**      | —      | Dev server auto-reload               |

---

## 👥 User Roles & Access Control

```
┌──────────────────────────────────────────────────────────────┐
│                        RBAC Matrix                            │
├──────────────────┬─────────┬──────────────┬──────────┬───────┤
│ Module           │  Admin  │ AssetManager │ DeptHead │ Emp   │
├──────────────────┼─────────┼──────────────┼──────────┼───────┤
│ Org Setup        │   ✅    │     ❌       │   ❌     │  ❌   │
│ All Assets       │   ✅    │     ✅       │   ❌     │  ❌   │
│ Own Dept Assets  │   ✅    │     ✅       │   ✅     │  ❌   │
│ Own Assets       │   ✅    │     ✅       │   ✅     │  ✅   │
│ Allocate Assets  │   ✅    │     ✅       │   ❌     │  ❌   │
│ Transfer Approve │   ✅    │     ✅       │   ✅     │  ❌   │
│ Book Resources   │   ✅    │     ✅       │   ✅     │  ✅   │
│ Maint. Approve   │   ✅    │     ✅       │   ❌     │  ❌   │
│ Raise Maint.     │   ✅    │     ✅       │   ✅     │  ✅   │
│ Kanban Drag/Drop │   ✅    │     ✅       │   ❌     │  ❌   │
│ Audit Cycles     │   ✅    │     ✅       │   ❌     │  ❌   │
│ Audit (Mark)     │   ✅    │     ✅       │   ✅     │  ❌   │
│ Reports          │   ✅    │     ✅       │   ✅     │  ❌   │
│ Notifications    │   ✅    │     ✅       │   ✅     │  ✅   │
│ Promote Roles    │   ✅    │     ❌       │   ❌     │  ❌   │
└──────────────────┴─────────┴──────────────┴──────────┴───────┘
```

> **Important:** Signup always creates an `Employee`. Role promotion is Admin-only via the Organization Setup → Employee Directory tab. No self-elevation is possible anywhere in the system.

---

## 📄 Pages & Modules

### 🏠 Landing Page (`/`)

Premium marketing page with animated hero section featuring:

- GSAP-powered stacked mockup card cluster
- Feature showcase sections
- Glassmorphic UI with dark mode design
- CTA buttons linking to signup/login

### 🔑 Login (`/login`)

- Email + password form connected to `/api/auth/login`
- Quick login buttons (Admin / Asset Mgr / Dept Head / Employee)
- "Don't have an account?" link to signup
- Auto-redirects to dashboard on success

### 📝 Signup (`/signup`)

- Full name, email, password form
- Connects to `/api/auth/signup`
- Always creates Employee role
- Auto-logs in and redirects to dashboard

### 📊 Dashboard (`/dashboard`)

- Live KPI grid from `/api/dashboard/kpis`
- Overdue returns from `/api/dashboard/overdue-returns`
- Recent activity from `/api/activity-logs`
- Role-mode switcher for demo preview

### 🏢 Organization Setup (`/organization`) — *Admin only*

Three tabs:

1. **Departments** — CRUD with head assignment and parent hierarchy
2. **Asset Categories** — CRUD with optional JSON field schemas
3. **Employee Directory** — Role promotion, activate/deactivate, search/filter

### 📦 Assets (`/assets`)

- Searchable, filterable asset registry
- Register new assets with auto-tagged IDs
- Per-asset detail with history sidebar
- Status badge with lifecycle transitions

### 🔄 Allocations (`/allocations`)

- Allocate / transfer / return workflow
- Conflict detection with current holder display
- Overdue return highlighting
- Transfer request flow with approval chain

### 📅 Bookings (`/bookings`)

- **Google Calendar-style timeline** (9 AM – 8 PM)
- Drag-to-create new bookings
- Drag-to-move existing bookings
- Drag-handle to resize (stretch) booking duration
- Color-coded status slots with glassmorphic cards
- Overlap validation (server-side `409`)
- Resource selector + date picker
- Mobile: falls back to clean stacked list

### 🔧 Maintenance (`/maintenance`)

- **Kanban board** with 5 sequential columns
- Drag & drop with optimistic local-first UI
- Raise new request modal (asset select, issue, priority, photo)
- Role-guarded drag (Admin/AssetManager only)
- Table view toggle
- Mobile: auto-switches to table view

### 🔍 Audits (`/audits`)

- Create audit cycles with scope and date range
- Assign auditors
- Mark audit items (Verified / Missing / Damaged)
- Auto-generated discrepancy reports
- Close cycle → auto-updates asset states

### 📈 Reports (`/reports`)

- Asset utilization bar charts
- Booking heatmap by day/hour
- Maintenance frequency breakdown
- Department allocation summary
- Overdue return tables

### 🔔 Notifications (`/notifications`)

- In-app notification feed
- Mark as read / mark all as read
- Activity log timeline

---

## 🗃️ Database Schema

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  password     String
  role         Role     @default(Employee)
  status       Status   @default(Active)
  departmentId String?
}

model Asset {
  id              String      @id @default(cuid())
  tag             String      @unique   // AF-0001
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
  id                  String   @id @default(cuid())
  assetId             String
  employeeId          String
  allocatedAt         DateTime @default(now())
  expectedReturnDate  DateTime?
  returnedAt          DateTime?
  returnConditionNotes String?
  status              AllocationStatus @default(Active)
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
```

**Enums:**

- `Role`: `Admin` `AssetManager` `DepartmentHead` `Employee`
- `AssetStatus`: `Available` `Allocated` `Reserved` `UnderMaintenance` `Lost` `Retired` `Disposed`
- `AllocationStatus`: `Active` `Returned` `Overdue`
- `BookingStatus`: `Upcoming` `Ongoing` `Completed` `Cancelled`
- `MaintenanceStatus`: `Pending` `Approved` `Rejected` `TechnicianAssigned` `InProgress` `Resolved`
- `Priority`: `Low` `Medium` `High`
- `AuditStatus`: `Open` `Closed`

---

## 🔗 API Reference

### Auth

| Method   | Endpoint             | Access | Description                 |
| -------- | -------------------- | ------ | --------------------------- |
| `POST` | `/api/auth/signup` | Public | Create Employee account     |
| `POST` | `/api/auth/login`  | Public | Login, get JWT              |
| `GET`  | `/api/auth/me`     | Auth   | Get current user from token |

### Dashboard

| Method  | Endpoint                           | Access | Description          |
| ------- | ---------------------------------- | ------ | -------------------- |
| `GET` | `/api/dashboard/kpis`            | Auth   | Live KPI counts      |
| `GET` | `/api/dashboard/overdue-returns` | Auth   | Overdue allocations  |
| `GET` | `/api/activity-logs`             | Auth   | Recent activity feed |

### Assets

| Method     | Endpoint            | Access        | Description                |
| ---------- | ------------------- | ------------- | -------------------------- |
| `GET`    | `/api/assets`     | Auth          | List all assets (filtered) |
| `POST`   | `/api/assets`     | AssetManager+ | Register new asset         |
| `PATCH`  | `/api/assets/:id` | AssetManager+ | Update asset               |
| `DELETE` | `/api/assets/:id` | Admin         | Delete asset               |

### Allocations

| Method    | Endpoint                        | Access        | Description                       |
| --------- | ------------------------------- | ------------- | --------------------------------- |
| `GET`   | `/api/allocations`            | Auth          | List allocations (scoped by role) |
| `POST`  | `/api/allocations`            | AssetManager+ | Create allocation                 |
| `PATCH` | `/api/allocations/:id/return` | AssetManager+ | Return asset                      |

### Bookings

| Method    | Endpoint                     | Access | Description                    |
| --------- | ---------------------------- | ------ | ------------------------------ |
| `GET`   | `/api/bookings`            | Auth   | List bookings                  |
| `POST`  | `/api/bookings`            | Auth   | Create booking (overlap check) |
| `PATCH` | `/api/bookings/:id`        | Auth   | Update/reschedule booking      |
| `PATCH` | `/api/bookings/:id/cancel` | Auth   | Cancel booking                 |

### Maintenance

| Method    | Endpoint                         | Access        | Description                   |
| --------- | -------------------------------- | ------------- | ----------------------------- |
| `GET`   | `/api/maintenance`             | Auth          | List tickets (scoped by role) |
| `POST`  | `/api/maintenance`             | Auth          | Raise maintenance request     |
| `PATCH` | `/api/maintenance/:id/approve` | AssetManager+ | Approve ticket                |
| `PATCH` | `/api/maintenance/:id/reject`  | AssetManager+ | Reject ticket                 |
| `PATCH` | `/api/maintenance/:id/assign`  | AssetManager+ | Assign technician             |
| `PATCH` | `/api/maintenance/:id/start`   | AssetManager+ | Mark In Progress              |
| `PATCH` | `/api/maintenance/:id/resolve` | AssetManager+ | Resolve ticket                |

### Organization

| Method    | Endpoint                      | Access         | Description         |
| --------- | ----------------------------- | -------------- | ------------------- |
| `GET`   | `/api/departments`          | Auth           | List departments    |
| `POST`  | `/api/departments`          | Admin          | Create department   |
| `GET`   | `/api/employees`            | Admin/AssetMgr | List employees      |
| `PATCH` | `/api/employees/:id/role`   | Admin          | Promote role        |
| `PATCH` | `/api/employees/:id/status` | Admin          | Activate/deactivate |
| `GET`   | `/api/asset-categories`     | Auth           | List categories     |
| `POST`  | `/api/asset-categories`     | Admin          | Create category     |

---

## ⚙️ Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- PostgreSQL database (or Neon account)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/assetflow.git
cd assetflow
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file in `/server`:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
PORT=5000
```

Run Prisma migrations:

```bash
npx prisma migrate deploy
npx prisma generate
```

Seed the database with demo data:

```bash
node bulk-seed.js
```

Start the server:

```bash
npm run dev      # development (nodemon)
npm start        # production
```

### 3. Setup the Client

```bash
cd ../client
npm install
```

Create a `.env` file in `/client` (optional — defaults to localhost):

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

### 4. Open in browser

```
Frontend:  http://localhost:5175
Backend:   http://localhost:5000
```

---

## 🔐 Default Credentials

After running `bulk-seed.js`, the following accounts are available:

| Role                        | Email                     | Password        |
| --------------------------- | ------------------------- | --------------- |
| 🔴**Admin**           | `admin@assetflow.com`   | `password123` |
| 🟡**Asset Manager**   | `manager@assetflow.com` | `password123` |
| 🟢**Department Head** | `head@assetflow.com`    | `password123` |
| 🔵**Employee**        | `dev1@assetflow.com`    | `password123` |
| 🔵**Employee**        | `qa1@assetflow.com`     | `password123` |
| 🔵**Employee**        | `fac1@assetflow.com`    | `password123` |
| 🟢**Dept Head (HR)**  | `hr1@assetflow.com`     | `password123` |

> **Tip:** Use the **Quick Login** buttons on the login page to instantly switch between role perspectives without typing credentials.

---

## 📐 Design System

AssetFlow uses a custom premium dark design system defined in `design.md`:

```
Background:    #000000  (pure black canvas)
Surface:       #0a0a0a  (card backgrounds)
Border:        rgba(255,255,255,0.08)  (hairline borders)
Foreground:    #f5f5f5  (primary text)
Muted:         #888888  (secondary text)
Accent:        #ffffff  (interactive highlights)
```

**Key design principles:**

- 🖤 **Pure black canvas** — no grey backgrounds, true dark mode
- 🪟 **Glassmorphism** — translucent cards with backdrop blur
- ✂️ **Hairline borders** — `1px` `rgba(255,255,255,0.08)` throughout
- ⚡ **Micro-animations** — `fade-in`, `slide-up`, hover transitions
- 🔤 **Inter font** — clean, modern, readable at all sizes
- 🎨 **5% color accents** — subtle HSL tints for status indicators
- 📐 **Consistent spacing** — 4px grid system

---

## 📁 Project Structure

```
assetflow/
├── client/                          # React frontend
│   ├── public/
│   │   ├── favicon.svg              # Custom SVG logo favicon
│   │   └── ...
│   └── src/
│       ├── api/
│       │   └── axios.js             # Axios instance + interceptors
│       ├── components/
│       │   ├── shared/
│       │   │   ├── Logo.jsx         # SVG logo component
│       │   │   ├── Card.jsx
│       │   │   ├── StatusDot.jsx
│       │   │   ├── Skeleton.jsx
│       │   │   └── EmptyState.jsx
│       │   ├── ui/
│       │   │   ├── button.jsx
│       │   │   └── CardSwap.jsx     # Animated landing card stack
│       │   └── ProtectedRoute.jsx   # Auth + role guards
│       ├── context/
│       │   └── AuthContext.jsx      # JWT session management
│       ├── layouts/
│       │   └── AppLayout.jsx        # Sidebar + workspace shell
│       ├── pages/
│       │   ├── Landing.jsx          # Marketing landing page
│       │   ├── Login.jsx
│       │   ├── Signup.jsx
│       │   ├── Dashboard.jsx
│       │   ├── OrganizationSetup.jsx
│       │   ├── Assets.jsx
│       │   ├── Allocations.jsx
│       │   ├── Bookings.jsx         # Calendar drag/drop/resize
│       │   ├── Maintenance.jsx      # Kanban board
│       │   ├── Audits.jsx
│       │   ├── Reports.jsx
│       │   └── Notifications.jsx
│       ├── App.jsx                  # Route definitions
│       └── index.css                # Design system tokens
│
└── server/                          # Express backend
    ├── index.js                     # App entry point
    ├── bulk-seed.js                 # Demo data seeder
    ├── prisma/
    │   └── schema.prisma            # Database schema
    └── src/
        ├── middleware/
        │   └── auth.js              # authenticate + authorize RBAC
        ├── prisma.js                # Prisma client singleton
        └── routes/
            ├── auth.js              # /signup /login /me
            ├── dashboard.js         # /kpis /overdue-returns
            ├── assets.js
            ├── allocations.js
            ├── transfers.js
            ├── bookings.js
            ├── maintenance.js
            ├── audits.js
            ├── departments.js
            ├── employees.js
            └── asset-categories.js
```

---

## 📏 Business Rules

These rules are enforced at both the API and UI level:

1. **No double-allocation** — Asset in non-Available state cannot be allocated; system shows current holder and offers Transfer Request
2. **No overlapping bookings** — Overlap check: `existingStart < newEnd AND existingEnd > newStart`; back-to-back bookings are allowed
3. **Maintenance requires approval** — Asset only becomes `UnderMaintenance` on Asset Manager approval, not on request raise
4. **Maintenance resolution restores availability** — Asset reverts to `Available` on resolve (unless `Retired` or `Disposed`)
5. **Transfer requires approval** — Asset stays with current holder until transfer is approved
6. **Overdue detection is automatic** — Allocations past `expectedReturnDate` are flagged at query time, not manually
7. **Audit closure changes asset state** — Closing a cycle marks confirmed-missing assets as `Lost`
8. **Role assignment is Admin-only** — Signup always creates `Employee`; only Admin can promote via Employee Directory
9. **Valid lifecycle transitions only** — Invalid transitions (e.g. `Retired → Allocated`) are rejected by the API
10. **Sequential Kanban progression** — Maintenance tickets can only move one stage at a time (enforced client-side)

---

## 🚀 Seeded Demo Data

Running `bulk-seed.js` populates the database with:

| Entity                  | Count |
| ----------------------- | ----- |
| Departments             | 8     |
| Users                   | 22    |
| Asset Categories        | 6     |
| Assets                  | 110   |
| Active Allocations      | 15    |
| Transfers               | 10    |
| Maintenance Requests    | 30    |
| Bookings (7-day spread) | 296   |

---

<div align="center">
