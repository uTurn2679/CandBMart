import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

// 1. GET: Fetch all products (both active & inactive) for admin catalog manager
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. POST: Upload/Create a new product with default variant & primary image
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      price,
      compareAtPrice,
      sku,
      categoryId,
      imageUrl,
      variantName,
      stockQuantity,
    } = body;

    // Validate parameters
    if (!name || price === undefined || !categoryId || !imageUrl || !variantName || stockQuantity === undefined) {
      return NextResponse.json({ error: "Missing required product fields." }, { status: 400 });
    }

    // Generate unique slug
    const cleanSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug: cleanSlug } });
    const slug = existing ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

    // Execute product creation transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      // Fetch category to determine SKU prefix
      const category = await tx.category.findUnique({ where: { id: categoryId } });
      let prefix = "PR";
      if (category) {
        if (category.slug === "porda") prefix = "PO";
        else if (category.slug === "bedding") prefix = "BE";
        else if (category.slug === "dolna") prefix = "DO";
        else if (category.slug === "moshari") prefix = "MO";
        else prefix = category.slug.substring(0, 2).toUpperCase();
      }

      // Find highest existing SKU for this prefix
      const lastProduct = await tx.product.findFirst({
        where: { sku: { startsWith: `${prefix}-` } },
        orderBy: { sku: "desc" },
      });

      let nextNum = 1;
      if (lastProduct && lastProduct.sku) {
        const parts = lastProduct.sku.split('-');
        if (parts.length === 2) {
          const parsed = parseInt(parts[1], 10);
          if (!isNaN(parsed)) nextNum = parsed + 1;
        }
      }
      const generatedSku = `${prefix}-${nextNum.toString().padStart(5, '0')}`;

      // Create product
      const product = await tx.product.create({
        data: {
          categoryId,
          name,
          slug,
          description: description || null,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          sku: generatedSku,
          stockQuantity: parseInt(stockQuantity),
          isActive: true,
        },
      });

      // Create primary image
      await tx.productImage.create({
        data: {
          productId: product.id,
          imageUrl,
          isPrimary: true,
          displayOrder: 0,
        },
      });

      // Create default variant
      await tx.productVariant.create({
        data: {
          productId: product.id,
          variantName,
          sku: `${generatedSku}-VAR`,
          priceOverride: null,
          stockQuantity: parseInt(stockQuantity),
        },
      });

      return product;
    });

    return NextResponse.json({
      success: true,
      message: "Product uploaded successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
