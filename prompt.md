
I'm building AssetFlow, an Enterprise Asset & Resource Management System, using Node.js + Express + Prisma with PostgreSQL on Neon. The server skeleton with a working health check endpoint is already set up, and DATABASE_URL is already in .env. Now do the following:

1. Design the full Prisma schema in server/prisma/schema.prisma covering these models:
   User

id (uuid, primary key)
name (string)
email (string, unique)
password (string, hashed)
role (enum: Admin, AssetManager, DepartmentHead, Employee — default Employee)
departmentId (optional foreign key to Department)
status (enum: Active, Inactive — default Active)
createdAt, updatedAt timestamps

Department

id (uuid, primary key)
name (string)
headId (optional foreign key to User, the Department Head)
parentId (optional self-relation foreign key to Department, for hierarchy)
status (enum: Active, Inactive — default Active)
createdAt, updatedAt timestamps

AssetCategory

id (uuid, primary key)
name (string)
fields (Json, nullable — for optional category-specific fields like warranty period)
createdAt, updatedAt timestamps

Asset

id (uuid, primary key)
tag (string, unique, auto-generated format like AF-0001)
name (string)
categoryId (foreign key to AssetCategory)
serialNumber (string, nullable)
acquisitionDate (DateTime)
acquisitionCost (Decimal)
condition (string)
location (string)
status (enum: Available, Allocated, Reserved, UnderMaintenance, Lost, Retired, Disposed — default Available)
isBookable (boolean, default false)
createdAt, updatedAt timestamps

Allocation

id (uuid, primary key)
assetId (foreign key to Asset)
employeeId (optional foreign key to User)
departmentId (optional foreign key to Department)
allocatedAt (DateTime, default now)
expectedReturnDate (DateTime, nullable)
returnedAt (DateTime, nullable)
returnConditionNotes (string, nullable)
status (enum: Active, Returned, Overdue — default Active)
createdAt, updatedAt timestamps

Transfer

id (uuid, primary key)
allocationId (foreign key to Allocation)
requestedBy (foreign key to User)
approvedBy (optional foreign key to User)
status (enum: Requested, Approved, Rejected, Reallocated — default Requested)
createdAt, updatedAt timestamps

Booking

id (uuid, primary key)
assetId (foreign key to Asset)
employeeId (foreign key to User)
startTime (DateTime)
endTime (DateTime)
status (enum: Upcoming, Ongoing, Completed, Cancelled — default Upcoming)
createdAt, updatedAt timestamps

MaintenanceRequest

id (uuid, primary key)
assetId (foreign key to Asset)
raisedBy (foreign key to User)
issue (string)
priority (enum: Low, Medium, High)
photoUrl (string, nullable)
status (enum: Pending, Approved, Rejected, TechnicianAssigned, InProgress, Resolved — default Pending)
approvedBy (optional foreign key to User)
createdAt, updatedAt timestamps

AuditCycle

id (uuid, primary key)
scope (string — department/location description)
startDate (DateTime)
endDate (DateTime)
status (enum: Open, Closed — default Open)
createdAt, updatedAt timestamps

AuditItem

id (uuid, primary key)
auditCycleId (foreign key to AuditCycle)
assetId (foreign key to Asset)
auditorId (foreign key to User)
result (enum: Pending, Verified, Missing, Damaged — default Pending)
createdAt, updatedAt timestamps

Notification

id (uuid, primary key)
userId (foreign key to User, the recipient)
type (string — e.g. AssetAssigned, MaintenanceApproved, BookingConfirmed, TransferApproved, OverdueReturn, AuditDiscrepancy)
message (string)
isRead (boolean, default false)
createdAt timestamp

ActivityLog

id (uuid, primary key)
userId (foreign key to User, who performed the action)
action (string — description of what happened)
entityType (string — e.g. "Asset", "Booking")
entityId (string, nullable)
createdAt timestamp

Set up all foreign key relations properly in Prisma (@relation), use uuid() with @default(uuid()) for all ids, and add @@map table names in snake_case if that's the Prisma convention being followed. Use enums (enum) for all status/role/priority/result fields listed above.
2. After the schema is written, run the following and show me the exact commands:

Generate the Prisma client
Run prisma migrate dev with a migration name like init to push this schema to the Neon database
Confirm the migration succeeded and tables exist

3. Build authentication endpoints in server/src/routes/auth.js (or equivalent structure):

POST /api/auth/signup — accepts name, email, password. Hashes the password with bcrypt. Always creates the user with role hardcoded to Employee regardless of any role field sent in the request body — do not let the client set or influence the role at signup. Returns the created user (without password) and a JWT.
POST /api/auth/login — accepts email, password. Verifies password with bcrypt, checks that status is Active (reject login if Inactive), and returns a JWT containing userId and role, plus basic user info.
JWT should be signed with a secret from .env (add JWT_SECRET to .env and generate a placeholder value), with a reasonable expiry like 8 hours.

4. Build RBAC middleware in server/src/middleware/auth.js:

authenticate middleware: reads the Bearer token from the Authorization header, verifies it, and attaches the decoded user (id, role) to req.user. Returns 401 if missing or invalid.
authorize(...allowedRoles) middleware: a function that takes a list of allowed roles and returns a middleware that checks req.user.role is in that list, returning 403 if not. Should be usable like authorize('Admin', 'AssetManager') on any route.

5. Do not build forgot-password, email verification, or refresh tokens — explicitly skip these, they're out of scope for this step.
6. At the end, give me:

The exact .env variables I need to have set (DATABASE_URL, JWT_SECRET, PORT)
A sample curl or Postman request for signup and login so I can test both endpoints manually
Confirmation that a protected test route (e.g. GET /api/me using authenticate middleware, returning req.user) works when I pass a valid token, and fails with 401 without one
