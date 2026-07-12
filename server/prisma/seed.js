const { PrismaClient } = require('../src/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive database seeding...');

  // Clean old entries in correct relational order
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

  console.log('All database tables cleared.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Seed Departments (Engineering hierarchy + HR + Finance + Operations + Marketing)
  const engDept = await prisma.department.create({
    data: { name: 'Engineering', status: 'Active' }
  });

  const qaDept = await prisma.department.create({
    data: { name: 'Quality Assurance', parentId: engDept.id, status: 'Active' }
  });

  const opsDept = await prisma.department.create({
    data: { name: 'Operations', status: 'Active' }
  });

  const facDept = await prisma.department.create({
    data: { name: 'Facilities', status: 'Active' }
  });

  const finDept = await prisma.department.create({
    data: { name: 'Finance', status: 'Active' }
  });

  const hrDept = await prisma.department.create({
    data: { name: 'Human Resources', status: 'Active' }
  });

  const mktDept = await prisma.department.create({
    data: { name: 'Marketing', status: 'Active' }
  });

  console.log('Departments seeded successfully.');

  // 2. Seed Users across all departments and roles
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

  // Promote Charlie Head as actual head of Engineering
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

  const emp3 = await prisma.user.create({
    data: {
      email: 'fac1@assetflow.com',
      password: hashedPassword,
      name: 'Frank Facilities',
      role: 'Employee',
      departmentId: facDept.id,
      status: 'Active',
    }
  });

  const emp4 = await prisma.user.create({
    data: {
      email: 'fin1@assetflow.com',
      password: hashedPassword,
      name: 'Fiona Finance',
      role: 'Employee',
      departmentId: finDept.id,
      status: 'Active',
    }
  });

  const hrHead = await prisma.user.create({
    data: {
      email: 'hr1@assetflow.com',
      password: hashedPassword,
      name: 'Grace HR',
      role: 'DepartmentHead',
      departmentId: hrDept.id,
      status: 'Active',
    }
  });

  const emp5 = await prisma.user.create({
    data: {
      email: 'mkt1@assetflow.com',
      password: hashedPassword,
      name: 'Henry Marketing',
      role: 'Employee',
      departmentId: mktDept.id,
      status: 'Active',
    }
  });

  console.log('Users seeded successfully.');

  // 3. Seed Asset Categories with distinct metadata schemas
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

  const softwareCat = await prisma.assetCategory.create({
    data: {
      name: 'Software Licenses',
      fields: [
        { name: 'license_key', type: 'text', required: true },
        { name: 'expiration_date', type: 'date', required: false }
      ]
    }
  });

  const vehiclesCat = await prisma.assetCategory.create({
    data: {
      name: 'Vehicles',
      fields: [
        { name: 'license_plate', type: 'text', required: true },
        { name: 'vin', type: 'text', required: true }
      ]
    }
  });

  const officeCat = await prisma.assetCategory.create({
    data: {
      name: 'Office Equipment',
      fields: []
    }
  });

  console.log('Asset Categories seeded successfully.');

  // 4. Seed 15 detailed Assets across all categories and statuses
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

  const asset7 = await prisma.asset.create({
    data: {
      tag: 'AF-0007',
      name: 'Conference Room B2',
      categoryId: furnitureCat.id,
      acquisitionDate: new Date('2025-08-10'),
      acquisitionCost: 1500.00,
      condition: 'Good',
      location: 'Main HQ Floor 2',
      isBookable: true,
      status: 'Available',
    }
  });

  const asset8 = await prisma.asset.create({
    data: {
      tag: 'AF-0008',
      name: 'Ergonomic Standup Desk',
      categoryId: furnitureCat.id,
      acquisitionDate: new Date('2026-02-10'),
      acquisitionCost: 650.00,
      condition: 'New',
      location: 'HQ Floor 3',
      isBookable: false,
      status: 'Available',
    }
  });

  const asset9 = await prisma.asset.create({
    data: {
      tag: 'AF-0009',
      name: 'Ford Transit Delivery Van',
      categoryId: vehiclesCat.id,
      serialNumber: 'SN-FORD-9942',
      acquisitionDate: new Date('2025-11-05'),
      acquisitionCost: 32000.00,
      condition: 'Fair',
      location: 'HQ Parking Lot B',
      isBookable: false,
      status: 'UnderMaintenance',
    }
  });

  const asset10 = await prisma.asset.create({
    data: {
      tag: 'AF-0010',
      name: 'Figma Design Pro Seat',
      categoryId: softwareCat.id,
      serialNumber: 'SN-FIGMA-0021',
      acquisitionDate: new Date('2026-01-01'),
      acquisitionCost: 540.00,
      condition: 'New',
      location: 'Cloud Services',
      isBookable: false,
      status: 'Allocated',
    }
  });

  const asset11 = await prisma.asset.create({
    data: {
      tag: 'AF-0011',
      name: 'Meeting Room A',
      categoryId: furnitureCat.id,
      acquisitionDate: new Date('2025-06-15'),
      acquisitionCost: 1200.00,
      condition: 'Good',
      location: 'Main HQ Floor 1',
      isBookable: true,
      status: 'Available',
    }
  });

  const asset12 = await prisma.asset.create({
    data: {
      tag: 'AF-0012',
      name: 'iPad Pro 12.9',
      categoryId: electronicsCat.id,
      serialNumber: 'SN-IPAD-0112',
      acquisitionDate: new Date('2026-02-20'),
      acquisitionCost: 1100.00,
      condition: 'Good',
      location: 'Main HQ Room 102',
      isBookable: true,
      status: 'Available',
    }
  });

  const asset13 = await prisma.asset.create({
    data: {
      tag: 'AF-0013',
      name: 'Standing Desk Converter',
      categoryId: furnitureCat.id,
      acquisitionDate: new Date('2026-03-10'),
      acquisitionCost: 300.00,
      condition: 'Good',
      location: 'HQ Floor 2',
      isBookable: false,
      status: 'Available',
    }
  });

  const asset14 = await prisma.asset.create({
    data: {
      tag: 'AF-0014',
      name: 'Adobe Creative Cloud License',
      categoryId: softwareCat.id,
      serialNumber: 'SN-ADOBE-7341',
      acquisitionDate: new Date('2026-01-15'),
      acquisitionCost: 960.00,
      condition: 'New',
      location: 'Cloud Licenses',
      isBookable: false,
      status: 'Allocated',
    }
  });

  const asset15 = await prisma.asset.create({
    data: {
      tag: 'AF-0015',
      name: 'Xerox Altalink C8100 Printer',
      categoryId: officeCat.id,
      serialNumber: 'SN-XEROX-0822',
      acquisitionDate: new Date('2025-10-05'),
      acquisitionCost: 5200.00,
      condition: 'Good',
      location: 'HQ Hallway East',
      isBookable: false,
      status: 'Available',
    }
  });

  console.log('15 Assets seeded successfully.');

  // 5. Seed Allocations (Active and Overdue records)
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

  await prisma.allocation.create({
    data: {
      assetId: asset10.id,
      employeeId: emp1.id,
      status: 'Active',
      allocatedAt: new Date('2026-01-02'),
    }
  });

  await prisma.allocation.create({
    data: {
      assetId: asset14.id,
      employeeId: emp5.id,
      status: 'Active',
      allocatedAt: new Date('2026-01-18'),
    }
  });

  await prisma.allocation.create({
    data: {
      assetId: asset5.id,
      employeeId: deptHead.id,
      status: 'Active',
      allocatedAt: new Date('2026-01-25'),
    }
  });

  console.log('Allocations seeded successfully.');

  // 6. Seed Transfer requests
  await prisma.transfer.create({
    data: {
      allocationId: alloc2.id,
      requestedById: emp1.id,
      status: 'Requested',
    }
  });

  console.log('Transfer requests seeded successfully.');

  // 7. Seed Dynamic Bookings for Today and Tomorrow
  const today = new Date();
  
  const today10 = new Date(today);
  today10.setHours(10, 0, 0, 0);
  const today12 = new Date(today);
  today12.setHours(12, 0, 0, 0);

  const today13 = new Date(today);
  today13.setHours(13, 0, 0, 0);
  const today14 = new Date(today);
  today14.setHours(14, 0, 0, 0);

  const today14_30 = new Date(today);
  today14_30.setHours(14, 30, 0, 0);
  const today15_30 = new Date(today);
  today15_30.setHours(15, 30, 0, 0);

  const today16 = new Date(today);
  today16.setHours(16, 0, 0, 0);
  const today17 = new Date(today);
  today17.setHours(17, 0, 0, 0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrow9 = new Date(tomorrow);
  tomorrow9.setHours(9, 0, 0, 0);
  const tomorrow10 = new Date(tomorrow);
  tomorrow10.setHours(10, 0, 0, 0);

  const tomorrow10_30 = new Date(tomorrow);
  tomorrow10_30.setHours(10, 30, 0, 0);
  const tomorrow12 = new Date(tomorrow);
  tomorrow12.setHours(12, 0, 0, 0);

  const tomorrow13 = new Date(tomorrow);
  tomorrow13.setHours(13, 0, 0, 0);
  const tomorrow16 = new Date(tomorrow);
  tomorrow16.setHours(16, 0, 0, 0);

  const tomorrow15 = new Date(tomorrow);
  tomorrow15.setHours(15, 0, 0, 0);
  const tomorrow16_30 = new Date(tomorrow);
  tomorrow16_30.setHours(16, 30, 0, 0);

  // Today booking 1 (Room B2)
  await prisma.booking.create({
    data: {
      assetId: asset7.id,
      employeeId: emp1.id,
      startTime: today10,
      endTime: today12,
      status: 'Upcoming',
    }
  });

  // Today booking 2 (Meeting Room A)
  await prisma.booking.create({
    data: {
      assetId: asset11.id,
      employeeId: emp4.id,
      startTime: today13,
      endTime: today14,
      status: 'Upcoming',
    }
  });

  // Today booking 3 (iPhone 15 Testbed)
  await prisma.booking.create({
    data: {
      assetId: asset4.id,
      employeeId: emp2.id,
      startTime: today14_30,
      endTime: today15_30,
      status: 'Upcoming',
    }
  });

  // Today booking 4 (iPad Pro)
  await prisma.booking.create({
    data: {
      assetId: asset12.id,
      employeeId: emp3.id,
      startTime: today16,
      endTime: today17,
      status: 'Upcoming',
    }
  });

  // Tomorrow booking 1 (iPhone 15 Testbed)
  await prisma.booking.create({
    data: {
      assetId: asset4.id,
      employeeId: emp1.id,
      startTime: tomorrow9,
      endTime: tomorrow10,
      status: 'Upcoming',
    }
  });

  // Tomorrow booking 2 (Room B2)
  await prisma.booking.create({
    data: {
      assetId: asset7.id,
      employeeId: deptHead.id,
      startTime: tomorrow10_30,
      endTime: tomorrow12,
      status: 'Upcoming',
    }
  });

  // Tomorrow booking 3 (Boardroom Table)
  await prisma.booking.create({
    data: {
      assetId: asset3.id,
      employeeId: manager.id,
      startTime: tomorrow13,
      endTime: tomorrow16,
      status: 'Upcoming',
    }
  });

  // Tomorrow booking 4 (Meeting Room A)
  await prisma.booking.create({
    data: {
      assetId: asset11.id,
      employeeId: hrHead.id,
      startTime: tomorrow15,
      endTime: tomorrow16_30,
      status: 'Upcoming',
    }
  });

  console.log('8 Bookings seeded successfully.');

  // 8. Seed Maintenance requests (Pending & In Progress)
  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset6.id,
      raisedById: emp1.id,
      issue: 'Battery swelling and charging port connection issues.',
      priority: 'High',
      status: 'Pending',
    }
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset9.id,
      raisedById: emp3.id,
      issue: 'Brake pads worn out, squeaking sound when stopping.',
      priority: 'Medium',
      status: 'Pending',
    }
  });

  await prisma.maintenanceRequest.create({
    data: {
      assetId: asset15.id,
      raisedById: emp4.id,
      issue: 'Paper jam / drum replacement required.',
      priority: 'Low',
      status: 'InProgress',
    }
  });

  console.log('Maintenance Requests seeded successfully.');

  // 9. Seed Notifications and Activity Logs
  const allUsers = [admin, manager, deptHead, emp1, emp2, emp3, emp4, hrHead, emp5];
  const now = new Date();
  
  console.log('Seeding notifications and activity logs...');
  for (const u of allUsers) {
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
          action: 'Confirmed booking: Room B2, 2:00–3:00 PM.',
          entityType: 'Booking',
          entityId: asset3.id,
          createdAt: new Date(now.getTime() - 60 * 60 * 1000), // 1h ago
        },
        {
          userId: u.id,
          action: 'Approved transfer of AF-0033.',
          entityType: 'Transfer',
          entityId: asset4.id,
          createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3h ago
        },
      ]
    });
  }

  console.log('Notifications and activity logs seeded successfully.');
  console.log('===================================================');
  console.log('DATABASE SEED COMPLETE. Use these demo credentials:');
  console.log('---------------------------------------------------');
  console.log('1. Admin:            admin@assetflow.com    / password123');
  console.log('2. Asset Manager:     manager@assetflow.com  / password123');
  console.log('3. Department Head:   head@assetflow.com     / password123');
  console.log('4. Engineer:          dev1@assetflow.com     / password123');
  console.log('5. QA Tester:         qa1@assetflow.com      / password123');
  console.log('6. Facilities:        fac1@assetflow.com     / password123');
  console.log('7. Finance:           fin1@assetflow.com     / password123');
  console.log('8. HR Head:           hr1@assetflow.com      / password123');
  console.log('9. Marketing:         mkt1@assetflow.com     / password123');
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
