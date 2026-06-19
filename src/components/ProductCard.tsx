"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { ShoppingCart, Check, Tag, Info, X, ChevronLeft, ChevronRight, Scale } from "lucide-react";

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
  additionalInfo?: string | null;
  extraImages?: string[];
}

interface ProductCardProps {
  product: ProductType;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { compareItems, addToCompare, removeFromCompare } = useCompare();
  const router = useRouter();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.length > 0 ? product.variants[0].id : ""
  );
  const [added, setAdded] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Get active variant price details
  const activeVariant = product.variants.find((v) => v.id === selectedVariantId);
  const activePrice =
    activeVariant?.priceOverride !== null && activeVariant?.priceOverride !== undefined
      ? activeVariant.priceOverride
      : product.price;

  const originalPrice = product.compareAtPrice || activePrice;
  const discountPercent =
    originalPrice > activePrice
      ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
      : 0;

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
    const imageVal = primaryImg
      ? primaryImg.imageUrl
      : "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400";

    addToCart(
      {
        variantId: selectedVariantId || product.id,
        productId: product.id,
        name: product.name,
        variantName: activeVariant ? activeVariant.variantName : "Standard",
        price: activePrice,
        image: imageVal,
      },
      1
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const isOutOfStock = activeVariant
    ? activeVariant.stockQuantity <= 0
    : product.stockQuantity <= 0;

  // All images: primary first + extra images
  const allImages = [
    ...product.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((i) => i.imageUrl),
    ...(product.extraImages ?? []),
  ];

  const primaryImageUrl =
    product.images.find((img) => img.isPrimary)?.imageUrl ||
    product.images[0]?.imageUrl ||
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400";

  return (
    <>
      {/* ── Card ── */}
      <div
        className="group bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-xs hover:shadow-xl dark:hover:shadow-orange-950/10 hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 flex flex-col justify-between overflow-hidden relative cursor-pointer"
        onClick={() => router.push(`/product/${product.slug}`)}
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 z-10 bg-brand-orange text-white font-black text-[10px] tracking-wide px-2.5 py-1 rounded-full flex items-center gap-0.5 shadow-md shadow-brand-orange/10 animate-pulse">
            <Tag size={10} />
            {discountPercent}% OFF
          </span>
        )}

        {/* Compare Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const isCompared = compareItems.some(item => item.id === product.id);
            if (isCompared) {
              removeFromCompare(product.id);
            } else {
              addToCompare({
                id: product.id,
                name: product.name,
                price: activePrice,
                compareAtPrice: originalPrice > activePrice ? originalPrice : undefined,
                image: primaryImageUrl,
                category: product.category.name,
                slug: product.slug,
                description: product.description || undefined,
                additionalInfo: product.additionalInfo || undefined,
                stockQuantity: product.stockQuantity,
              });
            }
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all duration-300 ${
            compareItems.some(item => item.id === product.id)
              ? "bg-emerald-500 text-white hover:bg-rose-500"
              : "bg-white/90 text-zinc-500 hover:text-emerald-500 hover:bg-white"
          }`}
          title={compareItems.some(item => item.id === product.id) ? "Remove from Compare" : "Add to Compare"}
        >
          <Scale size={14} className={compareItems.some(item => item.id === product.id) ? "fill-current" : ""} />
        </button>

        {/* Product Image Cover */}
        <div className="aspect-square bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>

        {/* Info Content */}
        <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
          <div className="space-y-0.5 sm:space-y-1">
            <span className="text-[8px] sm:text-[9px] font-black text-brand-orange bg-orange-50 dark:bg-orange-950/30 px-2 sm:px-2.5 py-0.5 rounded-full inline-block">
              {product.category.name}
            </span>
            <h3 className="font-extrabold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 min-h-8 sm:min-h-10">
              {product.name}
            </h3>
            {product.description && (
              <p className="hidden sm:block text-[10px] text-zinc-450 dark:text-zinc-500 line-clamp-1 font-medium">
                {product.description}
              </p>
            )}
          </div>

          {/* Variant Picker */}
          {product.variants.length > 1 && (
            <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
              <label className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                Select Options
              </label>
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

          {/* Pricing & Buttons */}
          <div className="flex justify-between items-center pt-1.5 sm:pt-2 border-t border-zinc-100 dark:border-zinc-900">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">
                {activePrice.toLocaleString()} TK
              </span>
              {originalPrice > activePrice && (
                <span className="text-[9px] sm:text-[10px] text-zinc-400 line-through">
                  {originalPrice.toLocaleString()} TK
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Show More button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIdx(0);
                  setShowDetail(true);
                }}
                className="flex items-center gap-0.5 sm:gap-1 px-2 sm:px-2.5 py-1.5 text-[9px] sm:text-[10px] font-bold rounded-xl transition bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200"
              >
                <Info size={10} />
                <span className="hidden sm:inline">Show More</span>
                <span className="sm:hidden">Info</span>
              </button>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex items-center gap-0.5 sm:gap-1 px-2 sm:px-3 py-1.5 text-[9px] sm:text-xs font-bold rounded-xl transition-all duration-200 shadow-md ${
                  isOutOfStock
                    ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600 shadow-none"
                    : added
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-brand-orange hover:bg-brand-orange/90 text-white shadow-brand-orange/20 active:scale-95"
                }`}
              >
                {isOutOfStock ? (
                  <span>স্টক নেই</span>
                ) : added ? (
                  <>
                    <Check size={13} />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={13} />
                    <span>Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Show More Detail Modal ── */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowDetail(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "fadeScaleIn 0.2s ease" }}
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => setShowDetail(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition"
            >
              <X size={16} />
            </button>

            {/* Image Gallery */}
            {allImages.length > 0 && (
              <div className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-zinc-800 rounded-t-3xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={allImages[activeImgIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
                {/* Discount badge */}
                {discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-brand-orange text-white font-black text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Tag size={11} />
                    {discountPercent}% OFF
                  </span>
                )}
                {/* Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 p-2 rounded-full shadow transition"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() => setActiveImgIdx((i) => (i + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 p-2 rounded-full shadow transition"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
                {/* Thumbnails */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImgIdx(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activeImgIdx ? "bg-brand-orange w-5" : "bg-white/60"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Extra image grid (color variants) */}
            {(product.extraImages ?? []).length > 0 && (
              <div className="px-6 pt-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                  আরো রঙের ছবি
                </p>
                <div className="flex gap-2 flex-wrap">
                  {(product.extraImages ?? []).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIdx(product.images.length + i)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition ${
                        activeImgIdx === product.images.length + i
                          ? "border-brand-orange shadow-md"
                          : "border-zinc-200 dark:border-zinc-700"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`color ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Details */}
            <div className="p-6 space-y-4">
              <div>
                <span className="text-[10px] font-black text-brand-orange bg-orange-50 dark:bg-orange-950/30 px-2.5 py-0.5 rounded-full inline-block mb-2">
                  {product.category.name}
                </span>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white">{product.name}</h2>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-brand-orange">
                  {activePrice.toLocaleString()} TK
                </span>
                {originalPrice > activePrice && (
                  <span className="text-base text-zinc-400 line-through">
                    {originalPrice.toLocaleString()} TK
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-1">বিবরণ</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              {product.additionalInfo && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4">
                  <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
                    অতিরিক্ত তথ্য
                  </p>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                    {product.additionalInfo}
                  </p>
                </div>
              )}

              {/* Variants */}
              {product.variants.length > 0 && (
                <div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                    ভেরিয়েন্ট বেছে নিন
                  </p>
                  <div
                    className="flex flex-wrap gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition ${
                          selectedVariantId === v.id
                            ? "bg-brand-orange text-white border-brand-orange shadow-md shadow-brand-orange/20"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-brand-orange"
                        }`}
                      >
                        {v.variantName}
                        {v.priceOverride ? ` — ${v.priceOverride.toLocaleString()} TK` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3 pt-2">
                <button
                  disabled={isOutOfStock}
                  onClick={() => { handleAddToCart(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-extrabold rounded-2xl transition-all shadow-lg ${
                    isOutOfStock
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
                      : added
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-brand-orange hover:bg-brand-orange/90 text-white shadow-brand-orange/20 active:scale-95"
                  }`}
                >
                  {isOutOfStock ? (
                    "স্টক শেষ"
                  ) : added ? (
                    <>
                      <Check size={16} /> কার্টে যোগ হয়েছে!
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={16} /> কার্টে যোগ করুন
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe for modal animation */}
      <style jsx global>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default ProductCard;
