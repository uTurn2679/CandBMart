import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        children: true,
      },
    });

    // Filter to top-level categories (parent is null) to build hierarchical tree
    const rootCategories = categories.filter((cat) => !cat.parentId);

    return NextResponse.json({ success: true, categories: rootCategories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
