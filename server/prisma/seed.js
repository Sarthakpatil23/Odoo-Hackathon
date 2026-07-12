const { PrismaClient } = require('../src/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clean old entries
  await prisma.activityLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.transfer.deleteMany({});
  await prisma.allocation.deleteMany({});
  await prisma.maintenanceRequest.deleteMany({});
  await prisma.auditItem.deleteMany({});
  await prisma.auditCycle.deleteMany({});
  await prisma.asset.deleteMany({});
  await prisma.assetCategory.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('Database tables cleared.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Departments (one parent-child)
  const engDept = await prisma.department.create({
    data: {
      name: 'Engineering',
      status: 'Active',
    }
  });

  const qaDept = await prisma.department.create({
    data: {
      name: 'Quality Assurance',
      parentId: engDept.id,
      status: 'Active',
    }
  });

  const opsDept = await prisma.department.create({
    data: {
      name: 'Operations',
      status: 'Active',
    }
  });

  console.log('Departments seeded.');

  // 2. Create Users (Admin, Manager, DeptHead, Employees)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@assetflow.com',
      password: hashedPassword,
      name: 'Alice Admin',
      role: 'Admin',
      status: 'Active',
    }
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@assetflow.com',
      password: hashedPassword,
      name: 'Bob Manager',
      role: 'AssetManager',
      status: 'Active',
    }
  });

  const deptHead = await prisma.user.create({
    data: {
      email: 'head@assetflow.com',
      password: hashedPassword,
      name: 'Charlie Head',
      role: 'DepartmentHead',
      departmentId: engDept.id,
      status: 'Active',
    }
  });

  // Promote department head to actual head of Department in DB
  await prisma.department.update({
    where: { id: engDept.id },
    data: { headId: deptHead.id }
  });

  const emp1 = await prisma.user.create({
    data: {
      email: 'dev1@assetflow.com',
      password: hashedPassword,
      name: 'David Dev',
      role: 'Employee',
      departmentId: engDept.id,
      status: 'Active',
    }
  });

  const emp2 = await prisma.user.create({
    data: {
      email: 'qa1@assetflow.com',
      password: hashedPassword,
      name: 'Emily Tester',
      role: 'Employee',
      departmentId: qaDept.id,
      status: 'Active',
    }
  });

  console.log('Users seeded.');

  // 3. Create Asset Categories
  const electronicsCat = await prisma.assetCategory.create({
    data: {
      name: 'Electronics',
      fields: [
        { name: 'warranty_months', type: 'number', required: true },
        { name: 'brand', type: 'text', required: true }
      ]
    }
  });

  const furnitureCat = await prisma.assetCategory.create({
    data: {
      name: 'Furniture',
      fields: []
    }
  });

  console.log('Asset Categories seeded.');

  // 4. Create Assets across categories and statuses (6-8 Assets)
  // AF-0001
  const asset1 = await prisma.asset.create({
    data: {
      tag: 'AF-0001',
      name: 'MacBook Pro 16 M3',
      categoryId: electronicsCat.id,
      serialNumber: 'SN-MP16-9921',
      acquisitionDate: new Date('2026-01-10'),
      acquisitionCost: 3500.00,
      condition: 'New',
      location: 'Main HQ Room 301',
      isBookable: false,
      status: 'Allocated',
    }
  });

  // AF-0002
  const asset2 = await prisma.asset.create({
    data: {
      tag: 'AF-0002',
      name: 'Dell UltraSharp 32 Monitor',
      categoryId: electronicsCat.id,
      serialNumber: 'SN-DEL32-0012',
      acquisitionDate: new Date('2026-02-15'),
      acquisitionCost: 800.00,
      condition: 'Good',
      location: 'Main HQ Room 301',
      isBookable: false,
      status: 'Allocated',
    }
  });

  // AF-0003
  const asset3 = await prisma.asset.create({
    data: {
      tag: 'AF-0003',
      name: 'Conference Room Boardroom Table',
      categoryId: furnitureCat.id,
      acquisitionDate: new Date('2025-05-20'),
      acquisitionCost: 2100.00,
      condition: 'Good',
      location: 'Conference Hall A',
      isBookable: true,
      status: 'Available',
    }
  });

  // AF-0004
  const asset4 = await prisma.asset.create({
    data: {
      tag: 'AF-0004',
      name: 'iPhone 15 Pro Testbed',
      categoryId: electronicsCat.id,
      serialNumber: 'SN-IP15-7734',
      acquisitionDate: new Date('2026-03-01'),
      acquisitionCost: 1200.00,
      condition: 'Good',
      location: 'Mobile Lab Room 102',
      isBookable: true,
      status: 'Available',
    }
  });

  // AF-0005
  const asset5 = await prisma.asset.create({
    data: {
      tag: 'AF-0005',
      name: 'Ergonomic Desk Chair',
      categoryId: furnitureCat.id,
      acquisitionDate: new Date('2026-01-20'),
      acquisitionCost: 450.00,
      condition: 'Good',
      location: 'HQ Floor 2',
      isBookable: false,
      status: 'Available',
    }
  });

  // AF-0006
  const asset6 = await prisma.asset.create({
    data: {
      tag: 'AF-0006',
      name: 'Lenovo ThinkPad P16 Gen 2',
      categoryId: electronicsCat.id,
      serialNumber: 'SN-THINK-4288',
      acquisitionDate: new Date('2026-04-12'),
      acquisitionCost: 2800.00,
      condition: 'New',
      location: 'HQ Floor 1',
      isBookable: false,
      status: 'UnderMaintenance',
    }
  });

  console.log('Assets seeded.');

  // 5. Create Allocation with expectedReturnDate in the past and still Active (Overdue)
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - 5); // 5 days ago

  const alloc1 = await prisma.allocation.create({
    data: {
      assetId: asset1.id,
      employeeId: emp1.id,
      status: 'Active',
      allocatedAt: new Date('2026-01-11'),
      expectedReturnDate: overdueDate
    }
  });

  // Create normal active allocation for asset2
  const activeDate = new Date();
  activeDate.setDate(activeDate.getDate() + 15); // 15 days in future

  const alloc2 = await prisma.allocation.create({
    data: {
      assetId: asset2.id,
      employeeId: emp2.id,
      status: 'Active',
      allocatedAt: new Date('2026-02-16'),
      expectedReturnDate: activeDate
    }
  });

  console.log('Allocations seeded.');

  // 6. Create Transfer request with status Requested
  await prisma.transfer.create({
    data: {
      allocationId: alloc2.id,
      requestedById: emp1.id,
      status: 'Requested',
    }
  });

  console.log('Transfer requests seeded.');

  // 7. Create Existing Booking for tomorrow 9:00 - 10:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(10, 0, 0, 0);

  await prisma.booking.create({
    data: {
      assetId: asset4.id, // iPhone 15 Pro Testbed (bookable)
      employeeId: emp2.id,
      startTime: tomorrow,
      endTime: tomorrowEnd,
      status: 'Upcoming',
    }
  });

  console.log('Bookings seeded.');

  // 8. Create Maintenance request in Pending status
  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset6.id,
      raisedById: emp1.id,
      issue: 'Battery swelling and charging port connection issues.',
      priority: 'High',
      status: 'Pending',
    }
  });

  console.log('Maintenance Requests seeded.');

  // 9. Seed notifications and activity logs
  const users = [admin, manager, deptHead, emp1, emp2];
  const now = new Date();
  
  console.log('Seeding notifications and activity logs...');
  for (const u of users) {
    await prisma.notification.createMany({
      data: [
        {
          userId: u.id,
          type: 'info',
          message: 'Laptop AF-0014 assigned to Priya Shah.',
          isRead: false,
          createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2m ago
        },
        {
          userId: u.id,
          type: 'success',
          message: 'Maintenance request AF-0055 approved.',
          isRead: false,
          createdAt: new Date(now.getTime() - 18 * 60 * 1000), // 18m ago
        },
        {
          userId: u.id,
          type: 'info',
          message: 'Booking confirmed: Room B2, 2:00–3:00 PM.',
          isRead: false,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1h ago
        },
        {
          userId: u.id,
          type: 'success',
          message: 'Transfer approved: AF-0033 to Facilities dept.',
          isRead: false,
          createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3h ago
        },
        {
          userId: u.id,
          type: 'danger',
          message: 'Overdue return: AF-0021 was due 3 days ago.',
          isRead: false,
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1d ago
        },
        {
          userId: u.id,
          type: 'damaged',
          message: 'Audit discrepancy flagged: AF-0088 damaged.',
          isRead: false,
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2d ago
        },
      ]
    });

    await prisma.activityLog.createMany({
      data: [
        {
          userId: u.id,
          action: 'Assigned laptop AF-0014 to Priya Shah.',
          entityType: 'Asset',
          entityId: asset1.id,
          createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2m ago
        },
        {
          userId: u.id,
          action: 'Approved maintenance request AF-0055.',
          entityType: 'MaintenanceRequest',
          entityId: asset2.id,
          createdAt: new Date(now.getTime() - 18 * 60 * 1000), // 18m ago
        },
        {
          userId: u.id,
          action: 'Confirmed booking for Room B2, 2:00–3:00 PM.',
          entityType: 'Booking',
          entityId: asset4.id,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1h ago
        },
        {
          userId: u.id,
          action: 'Approved transfer of asset AF-0033 to Facilities dept.',
          entityType: 'Transfer',
          entityId: asset3.id,
          createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3h ago
        },
        {
          userId: u.id,
          action: 'Flagged return as overdue: AF-0021 was due 3 days ago.',
          entityType: 'Asset',
          entityId: asset2.id,
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1d ago
        },
        {
          userId: u.id,
          action: 'Flagged audit discrepancy: AF-0088 marked as damaged.',
          entityType: 'AuditItem',
          entityId: asset5.id,
          createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2d ago
        },
      ]
    });
  }
  console.log('Notifications and activity logs seeded.');

  console.log('===================================================');
  console.log('DATABASE SEED COMPLETE. Use these demo credentials:');
  console.log('---------------------------------------------------');
  console.log('1. Admin:            admin@assetflow.com    / password123');
  console.log('2. Asset Manager:     manager@assetflow.com  / password123');
  console.log('3. Department Head:   head@assetflow.com     / password123');
  console.log('4. Engineer:          dev1@assetflow.com     / password123');
  console.log('5. QA Tester:         qa1@assetflow.com      / password123');
  console.log('===================================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
