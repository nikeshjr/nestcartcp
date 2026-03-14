const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Successfully connected to DB!');
    console.log('Usernames in DB:', users.map(u => u.username).join(', '));
    console.log('Emails in DB:', users.map(u => u.email).join(', '));
  } catch (error) {
    console.error('Failed to connect to DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
