import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "9999999");
    const sort = searchParams.get("sort") || "latest"; // latest, price_asc, price_desc
    const isBanner = searchParams.get("isBanner") === "true";

    // Build Prisma query filters
    const whereClause: any = {
      isActive: true,
      price: {
        gte: minPrice,
        lte: maxPrice,
      },
    };

    if (isBanner) {
      whereClause.isBanner = true;
    }

    // Filter by keyword query
    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { description: { contains: query } },
        { sku: { contains: query } },
      ];
    }

    // Filter by category slug or special "offers" tag
    if (categorySlug) {
      if (categorySlug === "offers") {
        whereClause.compareAtPrice = { gt: 0 };
      } else {
        whereClause.category = {
          slug: categorySlug,
        };
      }
    }

    // Define Sorting
    let orderByClause: any = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderByClause = { price: "asc" };
    } else if (sort === "price_desc") {
      orderByClause = { price: "desc" };
    }

    // Fetch Products with primary images and variants
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        variants: true,
        category: {
          select: { name: true, slug: true },
        },
      },
      orderBy: orderByClause,
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
