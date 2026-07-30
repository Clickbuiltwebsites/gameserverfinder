import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { DEMO_LISTINGS, DEMO_USERS } from "../src/lib/demo-listings";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Add it to .env.local, then run this again.");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  for (const user of DEMO_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name },
      create: { id: user.id, email: user.email, name: user.name },
    });
  }

  for (const listing of DEMO_LISTINGS) {
    const { id, ownerName: _ownerName, createdAt, ...rest } = listing;
    void _ownerName;
    await prisma.listing.upsert({
      where: { slug: listing.slug },
      update: rest,
      create: { ...rest, id, createdAt: new Date(createdAt) },
    });
  }

  const total = await prisma.listing.count();
  console.log(`Seeded. ${total} listings, ${DEMO_USERS.length} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
