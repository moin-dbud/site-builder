import prisma from '../lib/prisma.js';

async function testDelete() {
  const userId = '3OAoKnmGo2fDi3Y5PIZQnq3kvVoo6dnL';
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      console.log(`User ${userId} does not exist in database.`);
      return;
    }
    console.log(`Deleting user ${user.email} (${userId})...`);
    await prisma.user.delete({ where: { id: userId } });
    console.log(`SUCCESS: User ${user.email} deleted cleanly!`);
  } catch (err: any) {
    console.error('DELETE ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();
