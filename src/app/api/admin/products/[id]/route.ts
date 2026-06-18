import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// 1. PATCH: Update product fields, including variants
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
      isActive,
      stockQuantity,
      additionalInfo,
      extraImages,
      isBanner,
    } = body;

    // Build update payload
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description === "" ? null : description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (compareAtPrice !== undefined) {
      updateData.compareAtPrice = compareAtPrice ? parseFloat(compareAtPrice) : null;
    }
    if (sku !== undefined) updateData.sku = sku === "" ? null : sku;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (stockQuantity !== undefined) updateData.stockQuantity = parseInt(stockQuantity);
    if (additionalInfo !== undefined) updateData.additionalInfo = additionalInfo === "" ? null : additionalInfo;
    if (extraImages !== undefined) updateData.extraImages = Array.isArray(extraImages) ? extraImages : [];
    if (isBanner !== undefined) updateData.isBanner = isBanner;

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Update main product
      const product = await tx.product.update({
        where: { id },
        data: updateData,
      });

      // If stockQuantity updated, sync it with the default variant
      if (stockQuantity !== undefined) {
        const variants = await tx.productVariant.findMany({
          where: { productId: id },
        });
        
        if (variants.length > 0) {
          // Update the first variant (usually standard)
          await tx.productVariant.update({
            where: { id: variants[0].id },
            data: { stockQuantity: parseInt(stockQuantity) },
          });
        }
      }

      return product;
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 2. DELETE: Remove product from database completely
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
