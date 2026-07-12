const { PrismaClient } = require('./src/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting bulk database seeding (100+ Assets, 50+ Bookings, 20+ Users)...');

  // Clean old entries to prevent duplicates/foreign key conflicts
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

  console.log('Existing data cleared.');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Departments (8 distinct)
  const departmentsList = [
    { name: 'Engineering', status: 'Active' },
    { name: 'Quality Assurance', status: 'Active' },
    { name: 'Operations', status: 'Active' },
    { name: 'Facilities', status: 'Active' },
    { name: 'Finance', status: 'Active' },
    { name: 'Human Resources', status: 'Active' },
    { name: 'Marketing', status: 'Active' },
    { name: 'Legal & Compliance', status: 'Active' }
  ];

  const depts = [];
  for (const d of departmentsList) {
    const created = await prisma.department.create({ data: d });
    depts.push(created);
  }
  console.log(`Seeded ${depts.length} departments.`);

  // 2. Create Users (22 distinct users)
  const roles = ['Employee', 'DepartmentHead', 'AssetManager', 'Admin'];
  const userNames = [
    'Alice Admin', 'Bob Manager', 'Charlie Head', 'David Dev', 'Emily Tester',
    'Frank Facilities', 'Fiona Finance', 'Grace HR', 'Henry Marketing', 'Iris Legal',
    'Jack Dev', 'Karen QA', 'Leo Ops', 'Mona Finance', 'Nick HR',
    'Olivia Marketing', 'Peter Engineering', 'Quinn QA', 'Rachel Ops', 'Sam Facilities',
    'Tina HR', 'Victor Legal'
  ];

  const seededUsers = [];
  for (let i = 0; i < userNames.length; i++) {
    const name = userNames[i];
    const email = `${name.toLowerCase().replace(' ', '')}@assetflow.com`;
    let role = 'Employee';
    if (i === 0) role = 'Admin';
    else if (i === 1) role = 'AssetManager';
    else if (i === 2 || i === 7 || i === 9) role = 'DepartmentHead';

    // Assign department ID round-robin
    const departmentId = depts[i % depts.length].id;

    const u = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        departmentId,
        status: 'Active'
      }
    });
    seededUsers.push(u);
  }
  console.log(`Seeded ${seededUsers.length} users.`);

  // Set Charlie Head as the manager/head of the Engineering department
  await prisma.department.update({
    where: { id: depts[0].id },
    data: { headId: seededUsers[2].id }
  });

  // 3. Create Categories (5 distinct)
  const catNames = ['Electronics', 'Furniture', 'Software Licenses', 'Vehicles', 'Office Equipment'];
  const seededCats = [];
  for (const name of catNames) {
    const fields = name === 'Electronics' 
      ? [{ name: 'warranty_months', type: 'number', required: true }, { name: 'brand', type: 'text', required: true }]
      : name === 'Software Licenses'
      ? [{ name: 'license_key', type: 'text', required: true }, { name: 'expiration_date', type: 'date', required: false }]
      : [];

    const c = await prisma.assetCategory.create({
      data: { name, fields }
    });
    seededCats.push(c);
  }
  console.log(`Seeded ${seededCats.length} categories.`);

  // 4. Bulk Seed 110 Assets
  const assetTemplates = [
    { name: 'MacBook Pro 16 M3', catIndex: 0, cost: 3500, condition: 'New', location: 'HQ Room 301', isBookable: false },
    { name: 'Dell UltraSharp 32 Monitor', catIndex: 0, cost: 800, condition: 'Good', location: 'HQ Room 301', isBookable: false },
    { name: 'Conference Boardroom Table', catIndex: 1, cost: 2400, condition: 'Good', location: 'Conference Hall A', isBookable: true },
    { name: 'iPhone 15 Pro Testbed', catIndex: 0, cost: 1200, condition: 'Good', location: 'Mobile Lab Room 102', isBookable: true },
    { name: 'Ergonomic Desk Chair', catIndex: 1, cost: 450, condition: 'Good', location: 'HQ Floor 2', isBookable: false },
    { name: 'Lenovo ThinkPad P16', catIndex: 0, cost: 2800, condition: 'New', location: 'HQ Floor 1', isBookable: false },
    { name: 'Conference Room B2', catIndex: 1, cost: 1500, condition: 'Good', location: 'Main HQ Floor 2', isBookable: true },
    { name: 'Ergonomic Standup Desk', catIndex: 1, cost: 650, condition: 'New', location: 'HQ Floor 3', isBookable: false },
    { name: 'Ford Transit Delivery Van', catIndex: 3, cost: 34000, condition: 'Fair', location: 'HQ Parking Lot B', isBookable: false },
    { name: 'Figma Design Pro Seat', catIndex: 2, cost: 540, condition: 'New', location: 'Cloud License', isBookable: false },
    { name: 'Meeting Room A', catIndex: 1, cost: 1000, condition: 'Good', location: 'Main HQ Floor 1', isBookable: true },
    { name: 'Xerox Altalink Printer', catIndex: 4, cost: 5200, condition: 'Good', location: 'HQ Hallway East', isBookable: false },
    { name: 'iPad Pro 12.9 Testbed', catIndex: 0, cost: 1100, condition: 'Good', location: 'Mobile Lab Room 102', isBookable: true },
    { name: 'Standing Desk Converter', catIndex: 1, cost: 300, condition: 'Good', location: 'HQ Floor 2', isBookable: false },
    { name: 'Adobe Creative Cloud', catIndex: 2, cost: 960, condition: 'New', location: 'Cloud License', isBookable: false }
  ];

  const seededAssets = [];
  const conditions = ['New', 'Good', 'Fair', 'Poor'];
  const statuses = ['Available', 'Allocated', 'UnderMaintenance'];

  for (let i = 1; i <= 110; i++) {
    const template = assetTemplates[(i - 1) % assetTemplates.length];
    const tag = `AF-${String(i).padStart(4, '0')}`;
    
    // Randomize status and condition deterministically
    let status = statuses[i % statuses.length];
    // Bookables should mostly be Available
    if (template.isBookable) status = 'Available';

    const cond = conditions[i % conditions.length];

    const ast = await prisma.asset.create({
      data: {
        tag,
        name: `${template.name} #${i}`,
        categoryId: seededCats[template.catIndex].id,
        serialNumber: i % 2 === 0 ? `SN-${tag}-${Date.now().toString().slice(-6)}` : null,
        acquisitionDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000 * 5)), // incremental history
        acquisitionCost: template.cost + (i % 20) * 15,
        condition: cond,
        location: template.location,
        isBookable: template.isBookable,
        status: status
      }
    });
    seededAssets.push(ast);
  }
  console.log(`Seeded ${seededAssets.length} bulk assets.`);

  // 5. Seed Allocations (40 allocations)
  const seededAllocations = [];
  for (let i = 0; i < 40; i++) {
    // Find allocated assets
    const allocatedAsset = seededAssets.find(a => a.status === 'Allocated' && !seededAllocations.some(x => x.assetId === a.id));
    if (!allocatedAsset) break;

    const user = seededUsers[i % seededUsers.length];
    const isOverdue = i % 5 === 0;
    const allocatedAt = new Date(Date.now() - (15 * 24 * 60 * 60 * 1000));
    
    let expectedReturnDate = new Date(Date.now() + (15 * 24 * 60 * 60 * 1000));
    if (isOverdue) {
      expectedReturnDate = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)); // due 3 days ago
    }

    const alloc = await prisma.allocation.create({
      data: {
        assetId: allocatedAsset.id,
        employeeId: user.id,
        status: 'Active',
        allocatedAt,
        expectedReturnDate
      }
    });
    seededAllocations.push(alloc);
  }
  console.log(`Seeded ${seededAllocations.length} active allocations.`);

  // 6. Seed Transfer requests (10 transfers)
  for (let i = 0; i < 10; i++) {
    const allocation = seededAllocations[i % seededAllocations.length];
    const requester = seededUsers[(i + 5) % seededUsers.length];
    await prisma.transfer.create({
      data: {
        allocationId: allocation.id,
        requestedById: requester.id,
        status: i % 3 === 0 ? 'Approved' : 'Requested'
      }
    });
  }
  console.log('Seeded 10 transfer requests.');

  // 7. Seed Bookings (55 bookings to show beautiful heatmap + timeline density)
  const bookableAssets = seededAssets.filter(a => a.isBookable);
  console.log(`Found ${bookableAssets.length} bookable resources for timeline.`);
  
  let bookingCount = 0;
  // Seed bookings across today and next 7 days
  for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() + dayOffset);

    // Seed multiple bookings per day to make timeline and dashboard list look alive
    for (let index = 0; index < bookableAssets.length; index++) {
      const asset = bookableAssets[index];
      const hourStart = 8 + (index * 2 + dayOffset) % 10; // offset slots between 8 AM and 6 PM
      const duration = 1 + (index % 3);

      const startTime = new Date(bookingDate);
      startTime.setHours(hourStart, 0, 0, 0);

      const endTime = new Date(bookingDate);
      endTime.setHours(hourStart + duration, 0, 0, 0);

      const booker = seededUsers[(dayOffset + index) % seededUsers.length];

      await prisma.booking.create({
        data: {
          assetId: asset.id,
          employeeId: booker.id,
          startTime,
          endTime,
          status: 'Upcoming'
        }
      });
      bookingCount++;
    }
  }
  console.log(`Seeded ${bookingCount} schedule bookings.`);

  // 8. Seed Maintenance requests (30 tickets)
  const mrAssets = seededAssets.filter(a => a.status === 'UnderMaintenance' || a.id % 4 === 0);
  let mrCount = 0;
  const priorities = ['Low', 'Medium', 'High'];
  const mrStatuses = ['Pending', 'InProgress', 'Resolved'];
  const issuesList = [
    'Screen flickering and turning black randomly.',
    'Battery draining completely within 30 minutes of use.',
    'Brake pad wear-out warning active on dashboard.',
    'Left drawer lock jammed, keys missing.',
    'Paper tray 2 feeding roller failing to pull sheets.',
    'Wi-Fi adapter disconnecting intermittently.',
    'Gas cylinder squeaking and height sinking.',
    'Software activation key returning invalid error.',
    'Camera calibration out of alignment.',
    'Air filter replacement required.'
  ];

  for (let i = 0; i < mrAssets.length; i++) {
    const asset = mrAssets[i];
    const raisedBy = seededUsers[i % seededUsers.length];
    const issue = issuesList[i % issuesList.length];
    const priority = priorities[i % priorities.length];
    const status = mrStatuses[i % mrStatuses.length];

    await prisma.maintenanceRequest.create({
      data: {
        assetId: asset.id,
        raisedById: raisedBy.id,
        issue,
        priority,
        status
      }
    });
    mrCount++;
  }
  console.log(`Seeded ${mrCount} maintenance tickets.`);

  // 9. Seed dense notifications and activity logs (180+ entries)
  const now = new Date();
  let logCount = 0;
  
  console.log('Seeding bulk notifications and activity logs...');
  for (const u of seededUsers) {
    await prisma.notification.createMany({
      data: [
        {
          userId: u.id,
          type: 'info',
          message: 'Laptop AF-0012 assigned to dev team.',
          isRead: false,
          createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2m ago
        },
        {
          userId: u.id,
          type: 'success',
          message: 'Maintenance ticket resolved for printer.',
          isRead: false,
          createdAt: new Date(now.getTime() - 15 * 60 * 1000), // 15m ago
        },
        {
          userId: u.id,
          type: 'info',
          message: 'Room B2 reservation confirmed for 2:00 PM.',
          isRead: true,
          createdAt: new Date(now.getTime() - 45 * 60 * 1000), // 45m ago
        },
        {
          userId: u.id,
          type: 'danger',
          message: 'Missing check-in warning for allocated tablet.',
          isRead: false,
          createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1d ago
        }
      ]
    });

    await prisma.activityLog.createMany({
      data: [
        {
          userId: u.id,
          action: 'Assigned mobile testbed iPad Pro to QA.',
          entityType: 'Asset',
          entityId: seededAssets[12].id,
          createdAt: new Date(now.getTime() - 5 * 60 * 1000), // 5m ago
        },
        {
          userId: u.id,
          action: 'Requested maintenance ticket for delivery van.',
          entityType: 'MaintenanceRequest',
          entityId: seededAssets[8].id,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2h ago
        },
        {
          userId: u.id,
          action: 'Created booking slot for Meeting Room A.',
          entityType: 'Booking',
          entityId: seededAssets[10].id,
          createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12h ago
        }
      ]
    });
    logCount += 3;
  }

  console.log(`Seeded ${logCount} bulk activity logs.`);
  console.log('===================================================');
  console.log('BULK DATABASE SEED COMPLETE!');
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
