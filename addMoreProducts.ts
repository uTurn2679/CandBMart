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
  if (!pordaCat) throw new Error("Category not found");

  await prisma.product.create({
    data: {
      name: "গোলাপী ফ্লোরাল প্রিমিয়াম পর্দা",
      slug: "pink-floral-premium-curtain",
      description: "আকর্ষণীয় গোলাপী ও মেরুন ফ্লোরাল ডিজাইনের পর্দা।",
      categoryId: pordaCat.id,
      price: 850,
      stockQuantity: 30,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_pink_floral.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 30, priceOverride: 850 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "নিল গোলাপ ডিজাইনের পর্দা",
      slug: "blue-roses-design-curtain",
      description: "সাদা ব্যাকগ্রাউন্ডে চমৎকার নীল রঙের গোলাপ ডিজাইনের পর্দা।",
      categoryId: pordaCat.id,
      price: 900,
      stockQuantity: 25,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_blue_roses.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 25, priceOverride: 900 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "লাল ফ্লোরাল স্টাইলিশ পর্দা",
      slug: "red-floral-stylish-curtain",
      description: "লাল ও মেরুন রঙের মিশেলে স্টাইলিশ ফ্লোরাল ডিজাইনের পর্দা।",
      categoryId: pordaCat.id,
      price: 880,
      stockQuantity: 20,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_red_floral.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 20, priceOverride: 880 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "সবুজ পাতা ডিজাইনের গর্জিয়াস পর্দা",
      slug: "green-leaf-gorgeous-curtain",
      description: "সবুজ রঙের মধ্যে চমৎকার পাতা ডিজাইনের গর্জিয়াস পর্দা।",
      categoryId: pordaCat.id,
      price: 920,
      stockQuantity: 15,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_green_leaf_new.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 15, priceOverride: 920 }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      name: "নীল প্যাটার্ন ডিজাইনের পর্দা",
      slug: "blue-pattern-design-curtain",
      description: "সাদা ও নীল রঙের মিশেলে নান্দনিক প্যাটার্ন ডিজাইনের পর্দা।",
      categoryId: pordaCat.id,
      price: 860,
      stockQuantity: 30,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_blue_patterns.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 30, priceOverride: 860 }
        ]
      }
    }
  });

  console.log("Added 5 new curtain products");
}

main().catch(console.error).finally(() => prisma.$disconnect());
