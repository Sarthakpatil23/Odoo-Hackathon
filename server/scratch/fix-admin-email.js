const { PrismaClient } = require('../src/prisma');
const prisma = new PrismaClient();

async function main() {
  console.log('Fixing Admin and Manager emails in the database...');

  // Update Alice Admin's email to admin@assetflow.com
  const alice = await prisma.user.findFirst({
    where: { name: 'Alice Admin' }
  });

  if (alice) {
    await prisma.user.update({
      where: { id: alice.id },
      data: { email: 'admin@assetflow.com' }
    });
    console.log('Alice Admin email updated to admin@assetflow.com');
  }

  // Update Bob Manager's email to manager@assetflow.com
  const bob = await prisma.user.findFirst({
    where: { name: 'Bob Manager' }
  });

  if (bob) {
    await prisma.user.update({
      where: { id: bob.id },
      data: { email: 'manager@assetflow.com' }
    });
    console.log('Bob Manager email updated to manager@assetflow.com');
  }

  // Update Charlie Head's email to head@assetflow.com
  const charlie = await prisma.user.findFirst({
    where: { name: 'Charlie Head' }
  });

  if (charlie) {
    await prisma.user.update({
      where: { id: charlie.id },
      data: { email: 'head@assetflow.com' }
    });
    console.log('Charlie Head email updated to head@assetflow.com');
  }

  // Update David Dev's email to dev1@assetflow.com
  const david = await prisma.user.findFirst({
    where: { name: 'David Dev' }
  });

  if (david) {
    await prisma.user.update({
      where: { id: david.id },
      data: { email: 'dev1@assetflow.com' }
    });
    console.log('David Dev email updated to dev1@assetflow.com');
  }

  console.log('Credentials update complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
