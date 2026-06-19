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
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (product.stockQuantity <= 0) return;
    
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
    router.push("/checkout");
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
        className="group bg-white dark:bg-zinc-950 rounded-xl sm:rounded-3xl border border-zinc-100 dark:border-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative cursor-pointer w-full"
        onClick={() => router.push(`/product/${product.slug}`)}
      >
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 left-2 z-10 bg-brand-orange text-white font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Tag size={8} />
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
          className={`absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full shadow-sm hover:shadow-md transition-all duration-300 ${
            compareItems.some(item => item.id === product.id)
              ? "bg-emerald-500 text-white"
              : "bg-white/90 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800"
          }`}
        >
          <Scale size={11} />
          <span className="text-[9px] font-bold tracking-wide">
            {compareItems.some(item => item.id === product.id) ? "Added" : "Add to Compare"}
          </span>
        </button>

        {/* Product Image — fixed height on mobile */}
        <div className="w-full h-[130px] sm:aspect-square sm:h-auto bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden relative flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryImageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Info Content */}
        <div className="p-2 sm:p-4 flex flex-col gap-1 sm:gap-3 flex-1">

          {/* Category + Name */}
          <div>
            <span className="text-[8px] font-black text-brand-orange bg-orange-50 dark:bg-orange-950/30 px-1.5 py-0.5 rounded-full inline-block mb-0.5">
              {product.category.name}
            </span>
            <h3 className="font-bold text-[10px] sm:text-sm text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
              {product.name}
            </h3>
            {product.sku && (
              <span className="text-[8px] sm:text-[9px] text-zinc-500 font-medium mt-0.5 block">
                Code: {product.sku}
              </span>
            )}
          </div>

          {/* Variant Picker — desktop only */}
          {product.variants.length > 1 && (
            <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 text-xs font-semibold outline-none focus:border-brand-orange transition"
              >
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.variantName} {v.priceOverride ? `(${v.priceOverride} TK)` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Price + Buttons */}
          <div className="flex flex-col gap-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-900 mt-auto">
            <div className="flex items-center justify-between gap-1">
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[11px] sm:text-sm font-black text-zinc-900 dark:text-white truncate">
                  {activePrice.toLocaleString()} TK
                </span>
                {originalPrice > activePrice && (
                  <span className="text-[9px] text-zinc-400 line-through">
                    {originalPrice.toLocaleString()} TK
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Info icon */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setActiveImgIdx(0); setShowDetail(true); }}
                  className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
                >
                  <Info size={12} />
                </button>

                {/* Add to Cart button (Icon only) */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`p-1.5 rounded-md transition-all flex items-center justify-center ${
                    isOutOfStock
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800"
                      : added
                      ? "bg-emerald-500 text-white"
                      : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600 active:scale-95"
                  }`}
                  title="Add to Cart"
                >
                  {added ? <Check size={12} /> : <ShoppingCart size={12} />}
                </button>
              </div>
            </div>

            {/* Buy Now Full Width Button */}
            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`w-full py-1.5 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-md transition-all shadow-sm ${
                isOutOfStock
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed dark:bg-zinc-800 shadow-none"
                  : "bg-brand-orange text-white hover:bg-brand-orange/90 hover:shadow-md active:scale-95 shadow-brand-orange/20"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : "Buy Now"}
            </button>
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
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  disabled={isOutOfStock}
                  onClick={() => { handleAddToCart(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-extrabold rounded-xl transition-all shadow-md ${
                    isOutOfStock
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
                      : added
                      ? "bg-emerald-500 text-white shadow-emerald-500/20"
                      : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white active:scale-95"
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
                      <ShoppingCart size={16} /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  disabled={isOutOfStock}
                  onClick={() => { handleBuyNow(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-extrabold rounded-xl transition-all shadow-md ${
                    isOutOfStock
                      ? "hidden"
                      : "bg-brand-orange hover:bg-brand-orange/90 text-white active:scale-95 shadow-brand-orange/20 hover:shadow-brand-orange/40"
                  }`}
                >
                  Buy Now
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
