import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client/client";
import crypto from "crypto";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Seeding database...");

  // 1. Clean existing records
  await prisma.systemSetting.deleteMany();
  await prisma.orderTracking.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  console.log("Cleaned existing database records.");

  // 2. Seed Dynamic Delivery Settings
  await prisma.systemSetting.createMany({
    data: [
      {
        key: "DELIVERY_CHARGE_INSIDE_DHAKA",
        value: "60.00",
        description: "Fixed delivery rate inside Dhaka in BDT",
      },
      {
        key: "DELIVERY_CHARGE_OUTSIDE_DHAKA",
        value: "120.00",
        description: "Fixed delivery rate outside Dhaka in BDT",
      },
      {
        key: "FREE_DELIVERY_THRESHOLD",
        value: "2000.00",
        description: "Cart subtotal limit above which delivery fee is waived",
      },
    ],
  });
  console.log("Seeded system settings.");

  // 3. Seed Users (Admin & regular customer)
  const adminPasswordHash = hashPassword("admin123");
  const userPasswordHash = hashPassword("user123");

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "admin@ecommerce.com",
      phone_number: "+8801711111111",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      name: "Habibur Rahman",
      email: "customer@ecommerce.com",
      phone_number: "+8801822222222",
      passwordHash: userPasswordHash,
      role: "USER",
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });
  console.log("Seeded users.");

  // 4. Seed Coupons
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

  await prisma.coupon.createMany({
    data: [
      {
        code: "EID2026",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minCartAmount: 1000,
        startsAt: new Date(),
        expiresAt: oneYearFromNow,
        usageLimit: 100,
        isActive: true,
      },
      {
        code: "FREE60",
        discountType: "FIXED",
        discountValue: 60,
        minCartAmount: 500,
        startsAt: new Date(),
        expiresAt: oneYearFromNow,
        usageLimit: 500,
        isActive: true,
      },
      {
        code: "SAVE200",
        discountType: "FIXED",
        discountValue: 200,
        minCartAmount: 1500,
        startsAt: new Date(),
        expiresAt: oneYearFromNow,
        usageLimit: 200,
        isActive: true,
      },
    ],
  });
  console.log("Seeded coupons.");

  // 5. Seed Categories
  const curtainCat = await prisma.category.create({
    data: { name: "পর্দা", slug: "porda", isActive: true },
  });

  const furnitureCat = await prisma.category.create({
    data: { name: "ফার্নিচার", slug: "furniture", isActive: true },
  });

  const beddingCat = await prisma.category.create({
    data: { name: "বেডিং", slug: "bedding", isActive: true },
  });

  console.log("Seeded categories.");

  // 6. Seed Products with real uploaded images

  // Product 1: Swing / Hammock Chair
  await prisma.product.create({
    data: {
      categoryId: furnitureCat.id,
      name: "ম্যাক্রামে সুইং হ্যামক চেয়ার",
      slug: "macrame-swing-hammock-chair",
      description:
        "হাতে বোনা ম্যাক্রামে সুইং চেয়ার — বারান্দা বা বাগানের জন্য পারফেক্ট। মজবুত রোপ, আরামদায়ক কুশন সহ।",
      price: 3500,
      compareAtPrice: 4500,
      sku: "SWING-MAC-01",
      isActive: true,
      images: {
        create: [
          { imageUrl: "/products/swing-chair.jpg", isPrimary: true },
        ],
      },
      variants: {
        create: [
          { variantName: "রঙ: নীল-সাদা", sku: "SWING-MAC-BLU", stockQuantity: 15 },
          { variantName: "রঙ: বেইজ", sku: "SWING-MAC-BEI", priceOverride: 3200, stockQuantity: 10 },
        ],
      },
    },
  });

  // Product 2: Wave Print Blue Curtain
  await prisma.product.create({
    data: {
      categoryId: curtainCat.id,
      name: "ওয়েভ প্রিন্ট পর্দা — নীল সাদা",
      slug: "wave-print-curtain-blue-white",
      description:
        "উচ্চমানের সিল্কি কাপড়ে ওয়েভ ডিজাইন পর্দা। রুমের সৌন্দর্য বাড়াবে। আইলেট হেডার সহ।",
      price: 950,
      compareAtPrice: 1400,
      sku: "CUR-WAVE-BLU-01",
      isActive: true,
      images: {
        create: [
          { imageUrl: "/products/curtain-wave-blue.jpg", isPrimary: true },
        ],
      },
      variants: {
        create: [
          { variantName: "সাইজ: ৪x৭ ফুট (১ পিস)", sku: "CUR-WAVE-BLU-4X7", stockQuantity: 60 },
          { variantName: "সাইজ: ৪x৮ ফুট (১ পিস)", sku: "CUR-WAVE-BLU-4X8", priceOverride: 1100, stockQuantity: 45 },
          { variantName: "সেট: ২ পিস (৪x৭ ফুট)", sku: "CUR-WAVE-BLU-SET2", priceOverride: 1800, stockQuantity: 30 },
        ],
      },
    },
  });

  // Product 3: Geometric Grey Curtain
  await prisma.product.create({
    data: {
      categoryId: curtainCat.id,
      name: "জিওমেট্রিক ডিজাইন পর্দা — গ্রে",
      slug: "geometric-design-curtain-grey",
      description:
        "আধুনিক জিওমেট্রিক প্যাটার্নের লাক্সারি পর্দা। গ্রে কালারে অফিস ও বেডরুমের জন্য পারফেক্ট।",
      price: 1100,
      compareAtPrice: 1600,
      sku: "CUR-GEO-GRY-01",
      isActive: true,
      images: {
        create: [
          { imageUrl: "/products/curtain-geometric-grey.jpg", isPrimary: true },
        ],
      },
      variants: {
        create: [
          { variantName: "সাইজ: ৪x৭ ফুট (১ পিস)", sku: "CUR-GEO-GRY-4X7", stockQuantity: 50 },
          { variantName: "সাইজ: ৪x৮ ফুট (১ পিস)", sku: "CUR-GEO-GRY-4X8", priceOverride: 1250, stockQuantity: 35 },
          { variantName: "সেট: ২ পিস (৪x৭ ফুট)", sku: "CUR-GEO-GRY-SET2", priceOverride: 2100, stockQuantity: 25 },
        ],
      },
    },
  });

  // Product 4: Floral Navy Curtain
  await prisma.product.create({
    data: {
      categoryId: curtainCat.id,
      name: "ফ্লোরাল স্ট্রাইপ পর্দা — নেভি ক্রিম",
      slug: "floral-stripe-curtain-navy-cream",
      description:
        "ক্লাসিক ফ্লোরাল ও স্ট্রাইপ মিশেলে নেভি ব্লু ও ক্রিম কালারের এলিগ্যান্ট পর্দা। ড্রইংরুমের জন্য আদর্শ।",
      price: 1200,
      compareAtPrice: 1800,
      sku: "CUR-FLO-NAV-01",
      isActive: true,
      images: {
        create: [
          { imageUrl: "/products/curtain-floral-navy.jpg", isPrimary: true },
        ],
      },
      variants: {
        create: [
          { variantName: "সাইজ: ৪x৭ ফুট (১ পিস)", sku: "CUR-FLO-NAV-4X7", stockQuantity: 40 },
          { variantName: "সাইজ: ৪x৮ ফুট (১ পিস)", sku: "CUR-FLO-NAV-4X8", priceOverride: 1400, stockQuantity: 30 },
          { variantName: "সেট: ২ পিস (৪x৭ ফুট)", sku: "CUR-FLO-NAV-SET2", priceOverride: 2300, stockQuantity: 20 },
        ],
      },
    },
  });

  // Product 5: Royal Gold Curtain
  await prisma.product.create({
    data: {
      categoryId: curtainCat.id,
      name: "রয়্যাল গোল্ড এমব্রয়ডারি পর্দা",
      slug: "royal-gold-embroidery-curtain",
      description:
        "রয়্যাল ব্লু কালারে সোনালী এমব্রয়ডারি কাজের প্রিমিয়াম পর্দা। বিয়েবাড়ি বা পার্লারের জন্য পারফেক্ট।",
      price: 1500,
      compareAtPrice: 2200,
      sku: "CUR-ROY-GLD-01",
      isActive: true,
      images: {
        create: [
          { imageUrl: "/products/curtain-royal-gold.jpg", isPrimary: true },
        ],
      },
      variants: {
        create: [
          { variantName: "সাইজ: ৪x৭ ফুট (১ পিস)", sku: "CUR-ROY-GLD-4X7", stockQuantity: 35 },
          { variantName: "সাইজ: ৪x৮ ফুট (১ পিস)", sku: "CUR-ROY-GLD-4X8", priceOverride: 1750, stockQuantity: 25 },
          { variantName: "সেট: ২ পিস (৪x৭ ফুট)", sku: "CUR-ROY-GLD-SET2", priceOverride: 2900, stockQuantity: 15 },
        ],
      },
    },
  });

  console.log("Seeded 5 real products with uploaded images.");
  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Close adapter database if needed
  });
