import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client/client";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Rename Furniture to দোলনা
  const furnitureCat = await prisma.category.findFirst({
    where: { OR: [{ slug: 'furniture' }, { name: 'Furniture' }, { name: 'ফার্নিচার' }] }
  });

  if (furnitureCat) {
    await prisma.category.update({
      where: { id: furnitureCat.id },
      data: { name: "দোলনা", slug: "dolna" }
    });
    console.log("Renamed Furniture to দোলনা (slug: dolna)");
  } else {
    // create if not exists
    await prisma.category.create({
      data: { name: "দোলনা", slug: "dolna", description: "আরামদায়ক দোলনা" }
    });
    console.log("Created category দোলনা");
  }

  // 2. Create মশারি category
  const moshariCat = await prisma.category.findFirst({
    where: { slug: 'moshari' }
  });

  if (!moshariCat) {
    await prisma.category.create({
      data: { name: "মশারি", slug: "moshari", description: "উন্নত মানের মশারি" }
    });
    console.log("Created category মশারি");
  } else {
    console.log("Category মশারি already exists");
  }

  console.log("Category updates finished.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
