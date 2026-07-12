const { PrismaClient } = require('../src/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('Promoting users and cleaning up credentials...');

  // 1. Promote admin@assetflow.com to Admin role
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@assetflow.com' }
  });

  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role: 'Admin' }
    });
    console.log('Promoted admin@assetflow.com to Admin.');
  } else {
    // If not exists, update Alice Admin to admin@assetflow.com
    const alice = await prisma.user.findFirst({
      where: { name: 'Alice Admin' }
    });
    if (alice) {
      // First delete any potential conflicting user
      await prisma.user.deleteMany({ where: { email: 'admin@assetflow.com' } });
      await prisma.user.update({
        where: { id: alice.id },
        data: { email: 'admin@assetflow.com', role: 'Admin' }
      });
      console.log('Updated Alice Admin to admin@assetflow.com (Admin).');
    }
  }

  // 2. Promote manager@assetflow.com to AssetManager role
  const managerUser = await prisma.user.findUnique({
    where: { email: 'manager@assetflow.com' }
  });

  if (managerUser) {
    await prisma.user.update({
      where: { id: managerUser.id },
      data: { role: 'AssetManager' }
    });
    console.log('Promoted manager@assetflow.com to AssetManager.');
  } else {
    const bob = await prisma.user.findFirst({
      where: { name: 'Bob Manager' }
    });
    if (bob) {
      await prisma.user.deleteMany({ where: { email: 'manager@assetflow.com' } });
      await prisma.user.update({
        where: { id: bob.id },
        data: { email: 'manager@assetflow.com', role: 'AssetManager' }
      });
      console.log('Updated Bob Manager to manager@assetflow.com (AssetManager).');
    }
  }

  // 3. Promote head@assetflow.com to DepartmentHead
  const headUser = await prisma.user.findUnique({
    where: { email: 'head@assetflow.com' }
  });

  if (headUser) {
    await prisma.user.update({
      where: { id: headUser.id },
      data: { role: 'DepartmentHead' }
    });
    console.log('Promoted head@assetflow.com to DepartmentHead.');
  } else {
    const charlie = await prisma.user.findFirst({
      where: { name: 'Charlie Head' }
    });
    if (charlie) {
      await prisma.user.deleteMany({ where: { email: 'head@assetflow.com' } });
      await prisma.user.update({
        where: { id: charlie.id },
        data: { email: 'head@assetflow.com', role: 'DepartmentHead' }
      });
      console.log('Updated Charlie Head to head@assetflow.com (DepartmentHead).');
    }
  }

  // 4. Promote dev1@assetflow.com to Employee
  const devUser = await prisma.user.findUnique({
    where: { email: 'dev1@assetflow.com' }
  });

  if (devUser) {
    await prisma.user.update({
      where: { id: devUser.id },
      data: { role: 'Employee' }
    });
    console.log('Promoted dev1@assetflow.com to Employee.');
  } else {
    const david = await prisma.user.findFirst({
      where: { name: 'David Dev' }
    });
    if (david) {
      await prisma.user.deleteMany({ where: { email: 'dev1@assetflow.com' } });
      await prisma.user.update({
        where: { id: david.id },
        data: { email: 'dev1@assetflow.com', role: 'Employee' }
      });
      console.log('Updated David Dev to dev1@assetflow.com (Employee).');
    }
  }

  console.log('Promotion script complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
