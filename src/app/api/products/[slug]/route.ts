import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
