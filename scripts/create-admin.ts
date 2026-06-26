import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Creating admin account...");

  const passwordHash = await bcrypt.hash("password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {
      passwordHash,
      role: "GLOBAL_ADMIN",
      isActive: true,
    },
    create: {
      name: "System Admin",
      email: "admin@example.com",
      passwordHash,
      role: "GLOBAL_ADMIN",
      isActive: true,
    },
  });

  console.log(`✅ Admin account ready:`);
  console.log(`   Email:    admin@example.com`);
  console.log(`   Password: password123`);
  console.log(`   Name:     ${admin.name}`);
  console.log(`   Role:     ${admin.role}`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Failed to create admin:", e);
  process.exit(1);
});
