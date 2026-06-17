"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, Check, Tag } from "lucide-react";

export interface VariantType {
  id: string;
  variantName: string;
  sku: string | null;
  priceOverride: number | null;
  stockQuantity: number;
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stockQuantity: number;
  category: {
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    imageUrl: string;
    isPrimary: boolean;
  }>;
  variants: VariantType[];
}

interface ProductCardProps {
  product: ProductType;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.length > 0 ? product.variants[0].id : ""
  );
  const [added, setAdded] = useState(false);

  // Get active variant price details
  const activeVariant = product.variants.find((v) => v.id === selectedVariantId);
  const activePrice = activeVariant?.priceOverride !== null && activeVariant?.priceOverride !== undefined
    ? activeVariant.priceOverride
    : product.price;

  const originalPrice = product.compareAtPrice || activePrice;
  const discountPercent = originalPrice > activePrice
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
    const imageVal = primaryImg ? primaryImg.imageUrl : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400";
    
    const itemToAdd = {
      variantId: selectedVariantId || product.id,
      productId: product.id,
      name: product.name,
      variantName: activeVariant ? activeVariant.variantName : "Standard",
      price: activePrice,
      image: imageVal,
    };

    addToCart(itemToAdd, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = activeVariant ? activeVariant.stockQuantity <= 0 : product.stockQuantity <= 0;

  return (
    <div className="group bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-xs hover:shadow-xl dark:hover:shadow-orange-950/10 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-brand-orange text-white font-black text-[10px] tracking-wide px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-md shadow-brand-orange/10 animate-pulse">
          <Tag size={10} />
          {discountPercent}% OFF
        </span>
      )}

      {/* Product Image Cover */}
      <div className="aspect-square bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images.find((img) => img.isPrimary)?.imageUrl || product.images[0]?.imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Category */}
          <span className="text-[9px] font-black text-brand-orange bg-orange-50 dark:bg-orange-950/30 px-2.5 py-0.5 rounded-full inline-block">
            {product.category.name}
          </span>
          {/* Title */}
          <h3 className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 min-h-10">
            {product.name}
          </h3>
          {/* Description Snippet */}
          {product.description && (
            <p className="text-[10px] text-zinc-450 dark:text-zinc-500 line-clamp-1 font-medium">
              {product.description}
            </p>
          )}
        </div>

        {/* Dynamic Variant Picker Dropdown */}
        {product.variants.length > 1 && (
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">Select Options</label>
            <select
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 outline-none focus:border-brand-orange transition"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.variantName} {v.priceOverride ? `(${v.priceOverride} TK)` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Pricing & Add Cart */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex flex-col">
            <span className="text-sm font-black text-zinc-905 dark:text-white">
              {activePrice.toLocaleString()} TK
            </span>
            {originalPrice > activePrice && (
              <span className="text-[10px] text-zinc-400 line-through">
                {originalPrice.toLocaleString()} TK
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl transition-all duration-200 shadow-lg ${
              isOutOfStock
                ? "bg-zinc-100 text-zinc-450 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600 shadow-none"
                : added
                ? "bg-emerald-500 text-white shadow-emerald-500/10"
                : "bg-brand-orange hover:bg-brand-orange/95 text-white shadow-brand-orange/10 hover:shadow-brand-orange/20 active:scale-95"
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : added ? (
              <>
                <Check size={14} />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart size={14} />
                <span>Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
