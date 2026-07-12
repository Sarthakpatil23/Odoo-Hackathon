
# AssetFlow — Enterprise Asset & Resource Management System

## Project Overview

AssetFlow is a centralized ERP-style platform to digitize how organizations track, allocate, and maintain physical assets and shared resources. It is **not tied to any single industry** — any organization with equipment, furniture, vehicles, or shared spaces (offices, schools, hospitals, factories, agencies) can use it.

The platform replaces manual tracking (spreadsheets, paper logs) with structured asset lifecycles, centralized resource booking, and real-time visibility into who holds what, where it is, and its condition.

**Scope boundary:** AssetFlow focuses on core ERP functionality — clean architecture, role-based workflows, scalable module design. It explicitly does **not** touch purchasing, invoicing, or accounting concerns. Acquisition Cost is stored only for reporting/ranking purposes, not linked to any accounting system.

## Mission

Build a user-centric, responsive application that simplifies asset and resource management, giving staff intuitive tools to:

- Set up departments, asset categories, and the employee directory
- Register and track assets through their full lifecycle
- Allocate assets to employees/departments with conflict handling
- Book shared resources (rooms, vehicles, equipment) without overlaps
- Run a structured maintenance approval workflow
- Run structured audit cycles to catch discrepancies
- Get notified of overdue returns, bookings, and maintenance events

## Problem Statement

Organizations must be able to:

- Maintain departments, asset categories, and an employee directory
- Track assets through a flexible lifecycle with states: **Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed**, with valid transitions between states (e.g., Available ↔ Under Maintenance, Allocated → Available)
- Allocate assets to employees/departments, with the system **preventing double-allocation** of a single asset
- Book shared/limited resources by time slot, with **overlap validation**
- Route maintenance requests through an **approval workflow** before repair work starts
- Run scheduled **audit cycles** with assigned auditors and auto-generated discrepancy reports
- Surface overdue returns, bookings, and maintenance activity through notifications and a KPI dashboard
  The system must demonstrate proper ERP architecture, reusable modules, secure role-based workflows (with **realistic account creation — no self-assigned admin roles**), and intuitive UI/UX while handling relationships between departments, employees, assets, bookings, maintenance requests, and audits.

---

## User Roles

### Admin

- Manages departments, asset categories, audit cycles, and employee/role assignment (Organization Setup)
- Views organization-wide analytics
- **Only Admin can promote an Employee to Department Head or Asset Manager** — this is the only place in the system roles are assigned. No self-elevation is possible anywhere else.

### Asset Manager

- Registers and allocates assets
- Approves transfers, maintenance requests, and audit discrepancy resolution
- Approves asset returns and condition check-in notes

### Department Head

- Views assets allocated to their department
- Approves allocation/transfer requests within their department
- Books shared resources on behalf of the department

### Employee

- Views assets allocated to them
- Books shared resources
- Raises maintenance requests
- Initiates return/transfer requests
  **Important account rule:** Signup only ever creates an Employee account. There is no role selection at signup. Role elevation happens exclusively via the Admin's Employee Directory screen.

---

## Screens & Features (Detailed)

### 1. Login / Signup Screen

**Purpose:** Authenticate users with realistic, non-self-elevating account creation.

- Signup creates an Employee account only — no role selection at signup
- Admin creates/promotes Department Heads and Asset Managers from the Employee Directory (see Screen 3)
- Email & password login
- Forgot password
- Session validation (restore session from token on reload)

### 2. Dashboard / Home Screen

**Purpose:** Give every role a real-time operational snapshot.

- KPI cards: **Assets Available, Assets Allocated, Maintenance Today, Active Bookings, Pending Transfers, Upcoming Returns**
- Overdue returns (past Expected Return Date) highlighted **separately** from upcoming ones (visually distinct, e.g. warning color)
- Quick actions: Register Asset, Book Resource, Raise Maintenance Request
- Content/visibility may differ per role (e.g. Department Head sees department-scoped data, Employee sees only their own allocations/bookings)

### 3. Organization Setup Screen (Admin only — 3 tabs)

**Purpose:** Maintain the master data everything else depends on.

**Tab A — Department Management**

- Create/edit/deactivate department
- Assign Department Head
- Optional Parent Department (for hierarchy)
- Status: Active / Inactive
  **Tab B — Asset Category Management**
- Create/edit categories (Electronics, Furniture, Vehicles, etc.)
- Optional category-specific fields (e.g. warranty period for Electronics) — stored flexibly (e.g. JSON)
  **Tab C — Employee Directory**
- Fields: Name, Email, Department, Role, Status (Active/Inactive)
- Admin promotes an Employee to Department Head or Asset Manager here — **this is the only place roles are assigned in the entire system**

### 4. Asset Registration & Directory Screen

**Purpose:** Register assets and search/track them centrally.

- Register fields: Name, Category (from Screen 3), auto-generated **Asset Tag** (e.g. `AF-0001`), Serial Number, Acquisition Date, Acquisition Cost (kept for ranking/reports only — **not linked to accounting**), Condition, Location, photo/documents, "shared/bookable" flag
- Search/filter by: Asset Tag, Serial Number, QR code, category, status, department, or location
- Lifecycle status shown per asset: **Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed**
- Per-asset history: allocation history + maintenance history

### 5. Asset Allocation & Transfer Screen

**Purpose:** Manage who holds what, with explicit conflict rules.

- Allocate asset to employee/department with optional Expected Return Date
- **Conflict rule:** You can't allocate an asset that's already taken.
  - Example: Priya has Laptop AF-0114. If Raj tries to allocate it too, the system blocks it, shows him "currently held by Priya," and offers a **Transfer Request** button instead.
- Transfer workflow: **Requested → Approved (by Asset Manager/Department Head) → Re-allocated** (history updated automatically)
- Return flow: mark returned, capture condition check-in notes, asset status reverts to Available
- Overdue allocations (past Expected Return Date) are auto-flagged and feed the Dashboard + Notifications

### 6. Resource Booking Screen

**Purpose:** Time-slot booking of shared resources with no overlaps.

- Calendar view of a resource's existing bookings
- **Overlap validation:** Two people can't book the same room at overlapping times.
  - Example: Room B2 is booked 9:00–10:00. A request for 9:30–10:30 gets rejected since it overlaps; a request for 10:00–11:00 is fine since it starts right after.
- Booking status: **Upcoming, Ongoing, Completed, Cancelled**
- Cancel/reschedule
- Reminder notification before the slot starts

### 7. Maintenance Management Screen

**Purpose:** Route repairs through approval before work starts.

- Raise request: select asset, describe issue, set priority, attach photo
- Workflow: **Pending → Approved / Rejected (by Asset Manager) → Technician Assigned → In Progress → Resolved**
- Asset status auto-updates to **Under Maintenance** on approval and back to **Available** on resolution
- Maintenance history retained per asset

### 8. Asset Audit Screen

**Purpose:** Run structured verification cycles instead of a single form.

- Create an Audit Cycle (scope: department/location, date range)
- Assign one or more auditors to the cycle
- Auditor marks each asset: **Verified / Missing / Damaged**
- System auto-generates a discrepancy report for flagged items
- **Close Audit Cycle** — locks the cycle and updates affected asset statuses (e.g. Lost for confirmed-missing items)
- Audit history retained per cycle

### 9. Reports & Analytics Screen

**Purpose:** Give managers actionable operational insight.

- Asset utilization trends; most-used vs. idle assets
- Maintenance frequency by asset/category
- Assets due for maintenance or nearing retirement
- Department-wise allocation summary
- Resource booking heatmap (peak usage windows)
- Exportable reports

### 10. Activity Logs & Notifications Screen

**Purpose:** Keep every role informed without digging for updates.

- Notification examples: **Asset Assigned, Maintenance Approved/Rejected, Booking Confirmed/Cancelled/Reminder, Transfer Approved, Overdue Return Alert, Audit Discrepancy Flagged**
- Full audit log of admin/manager/employee actions (who did what, when)

---

## Basic Workflow (End-to-End Story)

1. Admin sets up departments, asset categories, and promotes select employees to Department Head / Asset Manager.
2. Asset Manager registers a new asset, which enters the system as **Available**.
3. Asset is allocated to an employee/department (blocked if already allocated — a transfer request is required instead) or marked as a shared bookable resource.
4. Employees book shared resources by time slot; overlapping requests are rejected automatically.
5. If an asset needs repair, the holder raises a maintenance request, which must be **approved before work begins** and before the asset flips to Under Maintenance.
6. Assets are transferred or returned as needs change; overdue returns are flagged automatically.
7. Periodic audit cycles assign auditors, verify assets, and auto-generate discrepancy reports before closing.
8. All activity is tracked through notifications, logs, and reports.

---

## Mandatory Business Rules (Critical — must be enforced correctly)

1. **No double-allocation:** An asset already allocated (status ≠ Available) cannot be allocated again. The blocking response must identify the current holder and offer a Transfer Request instead of a hard failure.
2. **No overlapping bookings:** Two bookings for the same resource cannot have overlapping time ranges. Overlap check: `existingStart < newEnd AND existingEnd > newStart`. A booking starting exactly when another ends is allowed (not an overlap).
3. **Maintenance requires approval before status change:** Asset status only becomes Under Maintenance upon Asset Manager approval — not at the moment the request is raised.
4. **Maintenance resolution restores availability:** Asset status reverts to Available when maintenance is marked Resolved.
5. **Transfer requires approval:** A transfer only re-allocates the asset once approved by Asset Manager/Department Head; until then it stays with the current holder.
6. **Overdue detection is automatic:** Allocations past Expected Return Date and bookings/maintenance past their expected timelines must be auto-flagged (via scheduled check or query-time comparison) — not manually marked.
7. **Audit closure changes asset state:** Closing an audit cycle updates statuses of confirmed-missing assets to Lost; this happens only at cycle closure, not at the moment an auditor marks an item Missing.
8. **Role assignment is Admin-only and centralized:** No user can self-assign or self-elevate a role. Signup always produces an Employee. Only the Admin's Employee Directory tab can promote to Department Head or Asset Manager.
9. **Asset lifecycle transitions must be valid**, e.g. Available ↔ Under Maintenance, Allocated → Available — invalid/nonsensical transitions (e.g. Retired → Allocated) should not be permitted by the system.

---

## Core Entities / Data Model

| Entity                       | Key Fields                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User**               | id, name, email, password, role (Admin/AssetManager/DepartmentHead/Employee), departmentId, status (Active/Inactive)                                                                                                           |
| **Department**         | id, name, headId, parentId (self-relation, optional), status (Active/Inactive)                                                                                                                                                 |
| **AssetCategory**      | id, name, fields (optional category-specific fields, e.g. warranty period)                                                                                                                                                     |
| **Asset**              | id, tag (unique, auto-generated e.g. AF-0001), name, categoryId, serialNumber, acquisitionDate, acquisitionCost, condition, location, status (Available/Allocated/Reserved/UnderMaintenance/Lost/Retired/Disposed), isBookable |
| **Allocation**         | id, assetId, employeeId or departmentId, allocatedAt, expectedReturnDate, returnedAt, returnConditionNotes, status (Active/Returned/Overdue)                                                                                   |
| **Transfer**           | id, allocationId, requestedBy, approvedBy, status (Requested/Approved/Rejected/Reallocated)                                                                                                                                    |
| **Booking**            | id, assetId, employeeId, startTime, endTime, status (Upcoming/Ongoing/Completed/Cancelled)                                                                                                                                     |
| **MaintenanceRequest** | id, assetId, raisedBy, issue, priority (Low/Medium/High), photoUrl, status (Pending/Approved/Rejected/TechnicianAssigned/InProgress/Resolved), approvedBy                                                                      |
| **AuditCycle**         | id, scope (department/location), startDate, endDate, status (Open/Closed)                                                                                                                                                      |
| **AuditItem**          | id, auditCycleId, assetId, auditorId, result (Pending/Verified/Missing/Damaged)                                                                                                                                                |
| **Notification**       | id, userId, type, message, isRead, createdAt                                                                                                                                                                                   |
| **ActivityLog**        | id, userId, action, entityType, entityId, createdAt                                                                                                                                                                            |

---

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + react-router-dom + axios + Recharts (charts)
- **Backend:** Node.js + Express
- **ORM:** Prisma
- **Database:** PostgreSQL (hosted on Neon)
- **Auth:** JWT-based, bcrypt for password hashing, custom RBAC middleware (`authenticate` + `authorize(...roles)`)
- **State management (frontend):** React Context for auth/session; local component state elsewhere (no Redux needed at this scope)

## Explicitly Out of Scope / Deprioritized (for hackathon time constraints)

- Forgot password / email verification / refresh tokens
- Real-time push notifications (polling or on-action inserts are sufficient)
- PDF export (CSV/basic export is enough if exports are attempted at all)
- QR code generation/scanning (mentioned as a nice-to-have search filter, not core)
- Category-specific dynamic field rendering beyond storing them as JSON
- Booking heatmap visualization (only build if time remains)
- Purchasing, invoicing, or accounting integration — never in scope

## Mockup Reference

POC mockup: https://app.excalidraw.com/l/65VNwvy7c4X/5ceOBMjbDby
