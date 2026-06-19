import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client/client";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const pordaCat = await prisma.category.findFirst({ where: { slug: 'porda' } });
  const beddingCat = await prisma.category.findFirst({ where: { slug: 'bedding' } });
  const furnitureCat = await prisma.category.findFirst({ where: { slug: 'furniture' } });

  if (!pordaCat || !beddingCat || !furnitureCat) throw new Error("Categories not found");

  await prisma.product.create({
    data: {
      name: "সানফ্লাওয়ার বেডশিট",
      slug: "sunflower-bedsheet",
      description: "আকর্ষণীয় সূর্যমুখী ফুলের ডিজাইনের আরামদায়ক বেডশিট।",
      categoryId: beddingCat.id,
      price: 1250,
      stockQuantity: 20,
      isActive: true,
      images: { create: [{ imageUrl: "/products/bedsheet_sunflower.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "King Size", stockQuantity: 20, priceOverride: 1250 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "সাদা-গোলাপী ফ্লোরাল পর্দা",
      slug: "white-pink-floral-curtain",
      description: "সাদা জমিনের ওপর সুন্দর গোলাপী ফুলের ডিজাইনের পর্দা।",
      categoryId: pordaCat.id,
      price: 800,
      stockQuantity: 40,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_white_pink.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 40, priceOverride: 800 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "সবুজ পাতার ডিজাইনের পর্দা",
      slug: "green-leaf-design-curtain",
      description: "গাঢ় সবুজ রঙের মাঝে পাতার মনোরম ডিজাইনের পর্দা।",
      categoryId: pordaCat.id,
      price: 780,
      stockQuantity: 35,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_green_leaf.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 35, priceOverride: 780 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "রিলাক্সিং ম্যাক্রামে হ্যামক (নীল)",
      slug: "relaxing-macrame-hammock-blue",
      description: "বারান্দা বা বাগানে বিশ্রামের জন্য চমৎকার নীল রঙের হ্যামক।",
      categoryId: furnitureCat.id,
      price: 1500,
      stockQuantity: 15,
      isActive: true,
      images: { create: [{ imageUrl: "/products/hammock_man.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 15, priceOverride: 1500 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "রিলাক্সিং ম্যাক্রামে হ্যামক (সাদা-নীল)",
      slug: "relaxing-macrame-hammock-white-blue",
      description: "বাচ্চা থেকে বয়স্ক সবার জন্য আরামদায়ক সাদা ও নীল রঙের ম্যাক্রামে হ্যামক।",
      categoryId: furnitureCat.id,
      price: 1600,
      stockQuantity: 10,
      isActive: true,
      images: { create: [{ imageUrl: "/products/hammock_girl.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 10, priceOverride: 1600 }
        ]
      }
    }
  });

  console.log("Added 5 new products");
}

main().catch(console.error).finally(() => prisma.$disconnect());
