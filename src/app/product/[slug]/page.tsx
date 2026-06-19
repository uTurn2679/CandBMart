import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import Navbar from "@/components/Navbar";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
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
    notFound();
  }

  // Convert types to pass to Client Component safely
  const safeProduct = {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
  };

  // Fetch related products (same category, excluding current product, max 4)
  const relatedDbProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: {
      category: true,
      images: true,
      variants: true,
    },
  });

  const safeRelatedProducts = relatedDbProducts.map(p => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <ProductDetailClient product={safeProduct as any} relatedProducts={safeRelatedProducts as any} />
      </div>
    </div>
  );
}
