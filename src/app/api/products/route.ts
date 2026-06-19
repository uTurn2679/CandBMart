import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      const qLower = query.toLowerCase();
      const searchTerms = [query];
      
      // Synonym mappings (English to Bangla, Banglish, etc.)
      const synonyms: Record<string, string[]> = {
        "curtain": ["পর্দা", "porda", "parda"],
        "porda": ["পর্দা", "curtain"],
        "parda": ["পর্দা", "curtain"],
        "bedsheet": ["বেডশিট", "bed sheet", "chador", "চাদর", "bed cover"],
        "bed sheet": ["বেডশিট", "bedsheet"],
        "bed": ["বেড", "বেডশিট", "bedsheet"],
        "mosari": ["মশারি", "mosquito", "net"],
        "moshari": ["মশারি", "mosquito net"],
        "mosquito": ["মশারি", "mosari"],
        "dolna": ["দোলনা", "hammock", "swing"],
        "hammock": ["দোলনা", "dolna"],
        "swing": ["দোলনা", "dolna"],
        "furniture": ["ফার্নিচার", "আসবাবপত্র"],
        "পর্দা": ["curtain", "porda"],
        "বেডশিট": ["bedsheet", "bed sheet"],
        "মশারি": ["mosari", "mosquito", "moshari"],
        "দোলনা": ["hammock", "swing", "dolna"],
      };

      for (const [key, related] of Object.entries(synonyms)) {
        if (qLower.includes(key)) {
          searchTerms.push(...related);
        }
      }

      whereClause.OR = searchTerms.flatMap((term) => [
        { name: { contains: term, mode: "insensitive" } },
        { description: { contains: term, mode: "insensitive" } },
        { sku: { contains: term, mode: "insensitive" } },
      ]);
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
