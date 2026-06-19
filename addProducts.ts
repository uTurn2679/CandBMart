import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client/client";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const category = await prisma.category.findFirst({ where: { slug: 'porda' } });
  if (!category) throw new Error("Category not found");

  const p1 = await prisma.product.create({
    data: {
      name: "প্রিমিয়াম মেরুন-হোয়াইট পর্দা (P-39)",
      slug: "premium-maroon-white-curtain-p39",
      description: "Size: Height 82\" Width 45\". সুন্দর ডিজাইন করা মেরুন এবং হোয়াইট কালারের পর্দা।",
      categoryId: category.id,
      price: 850,
      stockQuantity: 50,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_1.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 50, priceOverride: 850 }
        ]
      }
    }
  });

  const p2 = await prisma.product.create({
    data: {
      name: "পিংক ফ্লোরাল ডিজাইন পর্দা",
      slug: "pink-floral-design-curtain",
      description: "সুন্দর ফুল ডিজাইন করা পিংক কালারের পর্দা। ঘরের সৌন্দর্য বাড়াতে চমৎকার।",
      categoryId: category.id,
      price: 900,
      stockQuantity: 30,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_2.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 30, priceOverride: 900 }
        ]
      }
    }
  });

  const p3 = await prisma.product.create({
    data: {
      name: "গ্রিন ব্যাম্বু লিফ পর্দা",
      slug: "green-bamboo-leaf-curtain",
      description: "সবুজ বাঁশ পাতা ডিজাইনের নজরকাড়া পর্দা। সতেজ একটি ফিল দেবে।",
      categoryId: category.id,
      price: 750,
      stockQuantity: 40,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_3.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 40, priceOverride: 750 }
        ]
      }
    }
  });

  const p4 = await prisma.product.create({
    data: {
      name: "ব্রাউন ফ্লোরাল ক্লাসিক পর্দা",
      slug: "brown-floral-classic-curtain",
      description: "ক্ল্যাসিক ব্রাউন ও ক্রিম কালারের ফ্লোরাল ডিজাইনের পর্দা।",
      categoryId: category.id,
      price: 950,
      stockQuantity: 25,
      isActive: true,
      images: { create: [{ imageUrl: "/products/curtain_4.jpg", isPrimary: true }] },
      variants: {
        create: [
          { variantName: "Standard Size", stockQuantity: 25, priceOverride: 950 }
        ]
      }
    }
  });

  console.log("Added 4 new products");
}

main().catch(console.error).finally(() => prisma.$disconnect());
