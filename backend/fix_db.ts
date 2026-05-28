const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const textDates = await p.$queryRaw`SELECT id, createdAt FROM orders WHERE typeof(createdAt) = 'text'`;
  console.log("Found text dates:", textDates.length);
  
  for (const row of textDates) {
    const timestamp = new Date(row.createdAt).getTime();
    await p.$executeRaw`UPDATE orders SET createdAt = ${timestamp} WHERE id = ${row.id}`;
    console.log(`Updated ${row.id} to ${timestamp}`);
  }
}

main().catch(console.error).finally(() => p.$disconnect());
