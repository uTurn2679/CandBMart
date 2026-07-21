"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCompare } from "@/context/CompareContext";
import { ShoppingCart, Check, Tag, ChevronLeft, ChevronRight, ArrowLeft, Scale } from "lucide-react";
import ProductCard, { ProductType } from "@/components/ProductCard";

export default function ProductDetailClient({ 
  product,
  relatedProducts = []
}: { 
  product: ProductType;
  relatedProducts?: ProductType[];
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { compareItems, addToCompare, removeFromCompare } = useCompare();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants.length > 0 ? product.variants[0].id : ""
  );
  const [added, setAdded] = useState(false);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

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

  const handleAddToCart = () => {
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

  const handleBuyNow = () => {
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

  const allImages = [
    ...product.images.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0)).map((i) => i.imageUrl),
    ...(product.extraImages ?? []),
  ];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft size={16} /> ফিরে যান
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-10">
        {/* Left: Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/80">
            {allImages.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={allImages[activeImgIdx]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
            )}

            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 bg-brand-orange text-white font-black text-xs tracking-wide px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                <Tag size={12} />
                {discountPercent}% ছাড়
              </span>
            )}

            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImgIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white p-2 rounded-full shadow transition"
                >
                  <ChevronLeft size={18} className="text-zinc-800 dark:text-zinc-200" />
                </button>
                <button
                  onClick={() => setActiveImgIdx((i) => (i + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white p-2 rounded-full shadow transition"
                >
                  <ChevronRight size={18} className="text-zinc-800 dark:text-zinc-200" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIdx(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImgIdx === i ? "border-brand-orange opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-[10px] font-black text-brand-orange bg-orange-50 dark:bg-orange-950/30 px-3 py-1 rounded-full inline-block mb-3 uppercase tracking-widest">
              {product.category.name}
            </span>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white leading-tight mb-2">
              {product.name}
            </h1>
            {product.sku && (
              <p className="text-xs text-zinc-400 font-semibold mb-4">SKU: {product.sku}</p>
            )}

            <div className="flex items-center gap-4 mt-4">
              <span className="text-3xl md:text-4xl font-black text-brand-orange">
                {activePrice.toLocaleString()} TK
              </span>
              {originalPrice > activePrice && (
                <span className="text-lg md:text-xl text-zinc-400 line-through font-bold">
                  {originalPrice.toLocaleString()} TK
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {product.description && (
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-2">
                বিবরণ
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {product.additionalInfo && (
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-5">
              <h3 className="text-sm font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-2">
                অতিরিক্ত তথ্য
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-line">
                {product.additionalInfo}
              </p>
            </div>
          )}



          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm md:text-base font-extrabold rounded-2xl transition-all shadow-md ${
                isOutOfStock
                  ? "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"
                  : added
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white active:scale-95"
              }`}
            >
              {isOutOfStock ? (
                "স্টক শেষ"
              ) : added ? (
                <>
                  <Check size={20} /> কার্টে যোগ হয়েছে!
                </>
              ) : (
                <>
                  <ShoppingCart size={20} /> Add to Cart
                </>
              )}
            </button>

            <button
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm md:text-base font-extrabold rounded-2xl transition-all shadow-xl ${
                isOutOfStock
                  ? "hidden"
                  : "bg-brand-orange hover:bg-brand-orange/90 text-white shadow-brand-orange/30 hover:shadow-brand-orange/40 active:scale-95"
              }`}
            >
              Buy Now
            </button>

            <button
              onClick={() => {
                const isCompared = compareItems.some((item) => item.id === product.id);
                if (isCompared) {
                  removeFromCompare(product.id);
                } else {
                  addToCompare({
                    id: product.id,
                    name: product.name,
                    price: activePrice,
                    compareAtPrice: originalPrice > activePrice ? originalPrice : undefined,
                    image: product.images[0]?.imageUrl || "",
                    category: product.category.name,
                    slug: product.slug,
                    description: product.description || undefined,
                    additionalInfo: product.additionalInfo || undefined,
                    stockQuantity: product.stockQuantity,
                  });
                }
              }}
              className={`flex items-center justify-center p-4 rounded-2xl transition-all border-2 shrink-0 ${
                compareItems.some((item) => item.id === product.id)
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-700"
                  : "bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
              title={compareItems.some((item) => item.id === product.id) ? "Remove from Compare" : "Compare"}
            >
              <Scale size={20} className={compareItems.some((item) => item.id === product.id) ? "fill-current" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-10">
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <Tag className="text-brand-orange" /> একই ক্যাটাগরির অন্যান্য প্রোডাক্ট
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
