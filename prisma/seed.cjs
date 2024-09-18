const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  // Create contractor role
  await prisma.userRole.upsert({
    where: { name: 'contractor' },
    update: {},
    create: { name: 'contractor' },
  });





  const adminEmail = 'admin@example.com';
  const adminPassword = 'adminpassword'; // Use a strong password in production

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    // Create admin role if it doesn't exist
    const adminRole = await prisma.userRole.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin' },
    });


    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        roles: {
          connect: { id: adminRole.id },
        },
      },
    });

    console.log(`Admin user created with email: ${adminUser.email}`);
  } else {
    console.log('Admin user already exists');
  }

  // Add more seed data here if needed
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
