"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProductCard, { ProductType } from "@/components/ProductCard";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";
import {
  MessageSquare,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ShieldCheck,
  Truck,
  RotateCcw,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  MapPin,
  Mail,
  Phone,
  Globe,
  Hash,
  MessageCircle,
} from "lucide-react";

interface CategoryType {
  id: string;
  name: string;
  slug: string;
}

// ─── Customer Reviews Data ───────────────────────────────────────────────────
const CUSTOMER_REVIEWS = [
  {
    name: "Shabnur Jahan",
    avatar: "S",
    color: "#f48721",
    product: "বেডশিট",
    productEmoji: "🛏️",
    review: "আলহামদুলিল্লাহ ভাইয়া পার্সেলটা আজ হাতে পেলাম। যেমন চাইছি তেমন পেয়েছি। ধন্যবাদ ভাইয়া!",
    rating: 5,
    tag: "যাচাইকৃত গ্রাহক",
    screenshot: "/reviews/review1.jpg",
  },
  {
    name: "Nusaira Islam Arifa",
    avatar: "N",
    color: "#7c3aed",
    product: "পর্দা",
    productEmoji: "🪟",
    review: "হম আপু অনেক সুন্দর! পর্দাগুলো পছন্দ হয়েছে অনেক।",
    rating: 5,
    tag: "যাচাইকৃত গ্রাহক",
    screenshot: "/reviews/review2.jpg",
  },
  {
    name: "সন্তুষ্ট গ্রাহক",
    avatar: "গ",
    color: "#059669",
    product: "পর্দা",
    productEmoji: "✨",
    review: "পিকচার চেয়ে বাস্তবে অনেক সুন্দর! কালার, কাপড় সব কিছু ওয়াও। ভালো অইসে ধন্যবাদ।",
    rating: 5,
    tag: "যাচাইকৃত গ্রাহক",
    screenshot: "/reviews/review3.jpg",
  },
  {
    name: "Munni Akter",
    avatar: "M",
    color: "#db2777",
    product: "পর্দা",
    productEmoji: "🎀",
    review: "ভালো দেখে দিবেন, রিজেক্ট যাতে না হয়। ওকে!",
    rating: 5,
    tag: "যাচাইকৃত গ্রাহক",
    screenshot: "/reviews/review4.jpg",
  },
  {
    name: "Md Mazharul",
    avatar: "M",
    color: "#0284c7",
    product: "বেড কভার",
    productEmoji: "💙",
    review: "Alhamdulillah Peyachi! প্রোডাক্ট পেয়েছি, খুব সুন্দর হয়েছে!",
    rating: 5,
    tag: "যাচাইকৃত গ্রাহক",
    screenshot: "/reviews/review5.jpg",
  },
];

type ReviewType = (typeof CUSTOMER_REVIEWS)[number];
const ALL_REVIEWS_MARQUEE = [...CUSTOMER_REVIEWS, ...CUSTOMER_REVIEWS];

// ─── Product Banner Slider (Hero) ─────────────────────────────────────────────

function ProductBannerSlider({ onSearchChange, bannerProducts = [] }: { onSearchChange?: (q: string) => void, bannerProducts?: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();

  const slides = React.useMemo(() => {
    return bannerProducts.map((p, idx) => {
      const colors = [
        { badge: "#f48721", accent: "#1d4ed8", bg: "TOP SELLER" },
        { badge: "#059669", accent: "#475569", bg: "NEW COLLECTION" },
        { badge: "#db2777", accent: "#1e3a8a", bg: "POPULAR" },
        { badge: "#7c3aed", accent: "#7c3aed", bg: "TRENDING" }
      ];
      const color = colors[idx % colors.length];
      return {
        name: p.name,
        subtitle: p.description?.slice(0, 60) || "Discover our amazing collection.",
        image: p.images?.find((img: any) => img.isPrimary)?.imageUrl || p.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600",
        price: `৳${p.price.toLocaleString()}`,
        oldPrice: p.compareAtPrice ? `৳${p.compareAtPrice.toLocaleString()}` : "",
        badge: color.bg,
        badgeColor: color.badge,
        slug: p.slug,
        accent: color.accent,
      };
    });
  }, [bannerProducts]);

  const goTo = useCallback((idx: number) => {
    setVisible(false);
    setTimeout(() => {
      setActiveIndex(idx);
      setVisible(true);
    }, 300);
  }, []);

  const handleOrder = async (e: React.MouseEvent, slide: any) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      const res = await fetch(`/api/products/${slide.slug}`);
      if (!res.ok) {
        alert("Product not found in database. Please create a product with this slug.");
        setIsAdding(false);
        return;
      }
      const data = await res.json();
      const product = data.product;
      const variant = product.variants?.[0];
      if (!product || !variant) {
        alert("Product or variant missing in DB.");
        setIsAdding(false);
        return;
      }
      
      const primaryImg = product.images?.find((img: any) => img.isPrimary) || product.images?.[0];
      const imageVal = primaryImg ? primaryImg.imageUrl : slide.image;
      
      addToCart({
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        variantName: variant.variantName || "Standard",
        price: variant.priceOverride ?? product.price,
        image: imageVal,
      }, 1);
      
      router.push("/checkout");
    } catch (err) {
      console.error(err);
      alert("Error adding to cart.");
      setIsAdding(false);
    }
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        goTo(next);
        return prev;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [slides.length, goTo]);

  if (slides.length === 0) {
    return (
      <div className="w-full h-full min-h-[220px] md:min-h-0 rounded-3xl overflow-hidden shadow border border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <span className="text-zinc-400 font-bold text-sm">No banner products selected</span>
      </div>
    );
  }

  const slide = slides[activeIndex] || slides[0];
  if (!slide) return null;

  return (
    <div
      className="relative w-full h-full min-h-[220px] md:min-h-0 rounded-3xl overflow-hidden shadow-xl border border-zinc-200/50 dark:border-zinc-800/80 group cursor-pointer"
      onClick={() => router.push(`/product/${slide.slug}`)}
    >
      {/* Background image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={slide.image}
        alt={slide.name}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(1.04)",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* Slide content */}
      <div
        className="absolute inset-y-0 left-0 flex flex-col justify-center px-6 sm:px-10 py-6 max-w-lg"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0)" : "translateX(-20px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        {/* Badge */}
        <span
          className="inline-flex items-center text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-max mb-3"
          style={{ background: slide.badgeColor }}
        >
          {slide.badge}
        </span>

        {/* Product name */}
        <h2 className="text-lg sm:text-2xl md:text-3xl font-black leading-tight text-white mb-1 drop-shadow-lg">
          {slide.name}
        </h2>
        <p className="text-zinc-300 text-[11px] sm:text-sm font-semibold mb-4 hidden sm:block">
          {slide.subtitle}
        </p>

        {/* Price row */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xl sm:text-2xl font-black text-amber-300">{slide.price}</span>
          <span className="text-sm text-zinc-400 line-through">{slide.oldPrice}</span>
        </div>

        {/* CTA button */}
        <button
          onClick={(e) => handleOrder(e, slide)}
          disabled={isAdding}
          className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold text-[11px] sm:text-sm px-6 py-3 rounded-2xl transition active:scale-95 shadow-lg shadow-brand-orange/30 min-w-[140px] uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : (
            <>
              <ShoppingBag size={15} />
              অর্ডার করুন
            </>
          )}
        </button>
      </div>

      {/* Prev arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goTo((activeIndex - 1 + slides.length) % slides.length);
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full shadow transition opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronLeft size={18} className="text-white" />
      </button>

      {/* Next arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goTo((activeIndex + 1) % slides.length);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full shadow transition opacity-0 group-hover:opacity-100 z-10"
      >
        <ChevronRight size={18} className="text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              goTo(idx);
            }}
            className="rounded-full transition-all duration-300"
            style={{
              width: idx === activeIndex ? "22px" : "6px",
              height: "6px",
              background: idx === activeIndex ? slide.badgeColor : "rgba(255,255,255,0.5)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`text-sm ${i <= count ? "text-amber-400" : "text-zinc-300 dark:text-zinc-700"}`}>
          ★
        </span>
      ))}
    </div>
  );
}

// ─── Review Modal (Screenshot Lightbox) ─────────────────────────────────────
function ReviewModal({ review, onClose }: { review: ReviewType | null; onClose: () => void }) {
  useEffect(() => {
    if (!review) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [review, onClose]);

  if (!review) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      {/* Blurred backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      {/* Modal card */}
      <div
        className="relative z-10 flex flex-col items-center gap-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modalIn 0.22s cubic-bezier(.34,1.56,.64,1) both" }}
      >
        {/* Customer header chip */}
        <div
          className="w-full flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl"
          style={{ background: review.color }}
        >
          <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center font-black text-white text-base shadow-inner shrink-0">
            {review.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-white text-sm leading-tight truncate">{review.name}</p>
            <p className="text-white/75 text-[11px] font-semibold">
              {review.productEmoji} {review.product} কিনেছেন
            </p>
          </div>
          <div className="flex gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className="text-amber-300 text-sm">
                ★
              </span>
            ))}
          </div>
        </div>

        {/* Phone mockup screenshot */}
        <div className="relative w-full max-w-[320px] rounded-[36px] overflow-hidden border-[7px] border-zinc-900 shadow-[0_0_60px_rgba(0,0,0,0.6)] bg-zinc-900">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-b-2xl z-10" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={review.screenshot}
            alt={`${review.name} review screenshot`}
            className="w-full object-contain"
            style={{ maxHeight: "68vh" }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold text-sm px-8 py-3 rounded-2xl shadow-2xl hover:bg-zinc-100 dark:hover:bg-zinc-700 transition active:scale-95"
        >
          <X size={16} /> বন্ধ করুন
        </button>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Review Slider ────────────────────────────────────────────────────────────
function ReviewSlider({ onReviewClick }: { onReviewClick: (r: ReviewType) => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right">("right");
  const [visible, setVisible] = useState(true);

  const goTo = useCallback((idx: number, dir: "left" | "right") => {
    setVisible(false);
    setAnimDir(dir);
    setTimeout(() => {
      setActiveIndex(idx);
      setVisible(true);
    }, 280);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % CUSTOMER_REVIEWS.length;
        goTo(next, "right");
        return prev; // actual update happens inside goTo via setTimeout
      });
    }, 4200);
    return () => clearInterval(interval);
  }, [goTo]);

  const review = CUSTOMER_REVIEWS[activeIndex];

  return (
    <div
      className="relative w-full h-full min-h-[220px] md:min-h-0 rounded-3xl overflow-hidden shadow-xl border border-zinc-200/50 dark:border-zinc-800/80 group cursor-pointer transition-colors duration-500"
      style={{ background: `linear-gradient(135deg, ${review.color}18 0%, ${review.color}07 50%, transparent 100%)` }}
      onClick={() => onReviewClick(review)}
    >
      {/* Glow blob */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: review.color }}
      />

      {/* Big decorative quote */}
      <div
        className="absolute top-2 right-5 text-8xl sm:text-[120px] font-serif leading-none select-none pointer-events-none font-black"
        style={{ color: review.color, opacity: 0.09 }}
      >
        "
      </div>

      {/* Slide content */}
      <div
        className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 py-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateX(0px)" : animDir === "right" ? "translateX(-36px)" : "translateX(36px)",
          transition: "opacity 0.28s ease, transform 0.28s ease",
        }}
      >
        {/* Verified tag */}
        <span
          className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full w-max mb-4"
          style={{ background: `${review.color}22`, color: review.color }}
        >
          <ShieldCheck size={11} />
          {review.tag}
        </span>

        {/* Chat bubble */}
        <div className="relative bg-white dark:bg-zinc-900/90 rounded-2xl rounded-tl-none px-5 py-4 shadow-lg border border-zinc-100 dark:border-zinc-800 max-w-md mb-5">
          <div
            className="absolute top-0 left-0 w-0 h-0"
            style={{ borderRight: "14px solid transparent", borderBottom: "14px solid white" }}
          />
          <div
            className="absolute top-0 left-0 w-0 h-0 hidden dark:block"
            style={{
              borderRight: "14px solid transparent",
              borderBottom: "14px solid rgb(24 24 27 / 0.9)",
            }}
          />
          <p className="text-zinc-800 dark:text-zinc-100 text-sm sm:text-base font-semibold leading-relaxed">
            &ldquo;{review.review}&rdquo;
          </p>
        </div>

        {/* Avatar row */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-base shadow-lg shrink-0 ring-2 ring-white dark:ring-zinc-800"
            style={{ background: review.color }}
          >
            {review.avatar}
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">{review.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating count={review.rating} />
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {review.productEmoji} {review.product} কিনেছেন
              </span>
            </div>
          </div>
          {/* Screenshot hint badge */}
          <div
            className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-xl border animate-pulse"
            style={{ color: review.color, borderColor: `${review.color}40`, background: `${review.color}12` }}
          >
            📸 Screenshot
          </div>
        </div>
      </div>

      {/* Prev arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goTo((activeIndex - 1 + CUSTOMER_REVIEWS.length) % CUSTOMER_REVIEWS.length, "left");
        }}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md p-2 rounded-full shadow transition opacity-0 group-hover:opacity-100 z-10 border border-zinc-100 dark:border-zinc-800"
      >
        <ChevronLeft size={16} className="text-zinc-600 dark:text-zinc-400" />
      </button>

      {/* Next arrow */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          goTo((activeIndex + 1) % CUSTOMER_REVIEWS.length, "right");
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-md p-2 rounded-full shadow transition opacity-0 group-hover:opacity-100 z-10 border border-zinc-100 dark:border-zinc-800"
      >
        <ChevronRight size={16} className="text-zinc-600 dark:text-zinc-400" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {CUSTOMER_REVIEWS.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              goTo(idx, idx > activeIndex ? "right" : "left");
            }}
            className="rounded-full transition-all duration-300"
            style={{
              width: idx === activeIndex ? "20px" : "6px",
              height: "6px",
              background: idx === activeIndex ? review.color : "#d4d4d8",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Review Marquee ───────────────────────────────────────────────────────────
function ReviewMarquee({ onReviewClick }: { onReviewClick: (r: ReviewType) => void }) {
  return (
    <section className="w-full py-4 overflow-hidden border-y border-zinc-100 dark:border-zinc-900 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm" style={{ maxWidth: '100vw' }}>
      <div className="flex items-center gap-4 mb-3 max-w-7xl mx-auto px-4">
        <span className="text-[11px] font-extrabold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest shrink-0 flex items-center gap-1.5">
          <span className="text-amber-400 text-base">★</span> সন্তুষ্ট গ্রাহকদের কথা
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 dark:from-zinc-800 to-transparent" />
        <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-semibold shrink-0 flex items-center gap-1">
          📸 ক্লিক করুন দেখতে
        </span>
      </div>

      <div className="review-marquee-wrapper">
        <div className="flex gap-4 review-marquee">
          {ALL_REVIEWS_MARQUEE.map((r, idx) => (
            <div
              key={idx}
              onClick={() => onReviewClick(r)}
              className="shrink-0 flex items-start gap-3 bg-white dark:bg-zinc-900 border rounded-2xl px-5 py-3.5 shadow-sm w-[260px] md:w-[310px] cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              style={{ borderColor: `${r.color}35` }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0 shadow"
                style={{ background: r.color }}
              >
                {r.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-zinc-800 dark:text-zinc-200 truncate max-w-[110px]">
                      {r.name}
                    </span>
                    <span className="text-[10px] shrink-0">{r.productEmoji}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 shrink-0">📸</span>
                </div>
                <div className="flex gap-0.5 my-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-[10px] text-amber-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium leading-snug line-clamp-2">
                  &ldquo;{r.review}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [bannerProducts, setBannerProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const { cartCount, cartSubtotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewType | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) {
        setSelectedCategory(cat);
        // Clear the URL so it doesn't stay there forever when clicking other things
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }

    const loadBannerProducts = async () => {
      try {
        const res = await fetch("/api/products?isBanner=true", { cache: "no-store" });
        const data = await res.json();
        if (data.success) setBannerProducts(data.products);
      } catch (error) {
        console.error("Failed to load banner products:", error);
      }
    };

    loadCategories();
    loadBannerProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (selectedCategory) params.append("category", selectedCategory);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      params.append("sort", sortBy);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortBy]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    loadProducts();
    setShowFilters(false);
  };

  const handleReviewClick = useCallback((r: ReviewType) => {
    setSelectedReview(r);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      {/* Header Navigation */}
      <Navbar
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Review Slider + Trust Card */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-2 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
          {/* Product Banner Slider — 2 cols */}
          <div className="lg:col-span-2 w-full" style={{ aspectRatio: 'auto', minHeight: '220px' }}>
            <div className="w-full h-[220px] sm:h-[280px] md:h-[320px] lg:h-full lg:min-h-[300px]">
              <ProductBannerSlider 
                onSearchChange={setSearchQuery} 
                bannerProducts={bannerProducts}
              />
            </div>
          </div>

          {/* Trust & Promise card — 1 col */}
          <div className="lg:col-span-1 relative rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/80 shadow-xl min-h-[160px] lg:min-h-0 bg-gradient-to-br from-brand-orange/10 via-amber-50/80 to-white dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 flex flex-col justify-center p-5 sm:p-7">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand-orange/10 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
                <ShieldCheck size={11} /> আমাদের প্রতিশ্রুতি
              </span>
              <h3 className="text-lg sm:text-xl font-black text-zinc-800 dark:text-zinc-100 leading-tight mb-1">
                ঘর সাজাতে <span className="text-brand-orange">আপনার সাথে</span>
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mb-5">
                C&amp;B Mart — বিশ্বস্ত পণ্য, দ্রুত ডেলিভারি
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: <ShieldCheck size={15} />, label: "১০০% অরিজিনাল পণ্য" },
                  { icon: <Truck size={15} />, label: "দ্রুত হোম ডেলিভারি" },
                  { icon: <RotateCcw size={15} />, label: "সহজ রিটার্ন পলিসি" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-orange/15 flex items-center justify-center text-brand-orange shrink-0">
                      {item.icon}
                    </div>
                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Customer Reviews Marquee */}
      <ReviewMarquee onReviewClick={handleReviewClick} />

      {/* Main Product Catalog */}
      <div id="catalog" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 flex flex-col gap-4 sm:gap-6">

        {/* Category Pills */}
        <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-4 overflow-x-auto gap-4 scrollbar-none">
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setSelectedCategory("")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedCategory === ""
                  ? "bg-brand-orange text-white"
                  : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                  selectedCategory === cat.slug
                    ? "bg-brand-orange text-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-1.5 border rounded-xl text-xs font-bold transition ${
                showFilters || minPrice || maxPrice
                  ? "border-brand-orange text-brand-orange bg-orange-50/20 dark:bg-orange-950/20"
                  : "border-zinc-200 dark:border-zinc-805 text-zinc-655 dark:text-zinc-345 bg-white dark:bg-zinc-900"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </button>
            <div className="relative flex items-center border border-zinc-200 dark:border-zinc-805 bg-white dark:bg-zinc-900 rounded-xl px-2.5">
              <ArrowUpDown size={14} className="text-zinc-400 mr-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-zinc-655 dark:text-zinc-345 outline-none py-1.5 pr-2"
              >
                <option value="latest">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Form */}
        {showFilters && (
          <form
            onSubmit={handleApplyFilters}
            className="bg-white dark:bg-zinc-900/60 backdrop-blur-md p-6 rounded-2xl border border-brand-orange/10 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-in fade-in duration-200"
          >
            <div>
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5">
                Min Price (TK)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none text-zinc-900 dark:text-white focus:border-brand-orange"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase mb-1.5">
                Max Price (TK)
              </label>
              <input
                type="number"
                placeholder="e.g. 3000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none text-zinc-900 dark:text-white focus:border-brand-orange"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold py-2 rounded-xl text-xs transition"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1"
              >
                <X size={12} />
                <span>Reset</span>
              </button>
            </div>
          </form>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square bg-zinc-105 dark:bg-zinc-805 rounded-2xl" />
                <div className="h-4 bg-zinc-105 dark:bg-zinc-805 w-2/3 rounded-md" />
                <div className="h-3 bg-zinc-105 dark:bg-zinc-805 w-1/2 rounded-md" />
                <div className="h-8 bg-zinc-105 dark:bg-zinc-805 rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 bg-white dark:bg-zinc-900/20 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800/80">
            <p className="font-bold text-zinc-805 dark:text-zinc-195 text-lg">No Products Found</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              We couldn&apos;t find any items matching your filters. Try resetting the filters or modifying your search
              query.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
                handleResetFilters();
              }}
              className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold text-xs px-4 py-2 mt-4 rounded-xl transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/8809642922922?text=Hello%20C%26B%20Mart!%20I'm%20interested%20in%20your%20products."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3 sm:p-4 rounded-full shadow-2xl flex items-center justify-center transition hover:-translate-y-1 active:translate-y-0 duration-300 group"
        title="Chat on WhatsApp"
      >
        <MessageSquare className="animate-wiggle" size={22} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-bold text-xs whitespace-nowrap transition-all duration-300">
          WhatsApp Order
        </span>
      </a>

      {/* Ask a Question Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-8 sm:mt-12 mb-6 w-full">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl flex flex-col md:flex-row items-center gap-6 sm:gap-8">
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-800 dark:text-zinc-100">কোনো প্রশ্ন আছে?</h2>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto md:mx-0">
              পণ্য সম্পর্কে বিস্তারিত জানতে বা অর্ডার করতে কোনো সহায়তা লাগলে আমাদের সাথে যোগাযোগ করুন। আমাদের টিম দ্রুত আপনার প্রশ্নের উত্তর দেবে।
            </p>
          </div>
          <div className="flex-1 w-full max-w-md">
            <form className="flex flex-col gap-3" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const name = (form.elements[0] as HTMLInputElement).value;
              const phone = (form.elements[1] as HTMLInputElement).value;
              const message = (form.elements[2] as HTMLTextAreaElement).value;
              const btn = form.querySelector("button");
              if (btn) btn.innerText = "পাঠানো হচ্ছে...";
              try {
                await fetch("/api/contact", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ name, phone, message }),
                });
                form.reset();
                alert("আপনার মেসেজ পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করবো।");
              } catch (err) {
                alert("মেসেজ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
              } finally {
                if (btn) btn.innerText = "মেসেজ পাঠান";
              }
            }}>
              <input type="text" placeholder="আপনার নাম" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-brand-orange text-zinc-900 dark:text-zinc-100" required />
              <input type="tel" placeholder="ফোন নাম্বার" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-brand-orange text-zinc-900 dark:text-zinc-100" required />
              <textarea placeholder="আপনার প্রশ্ন..." rows={3} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-sm font-semibold outline-none focus:border-brand-orange text-zinc-900 dark:text-zinc-100 resize-none" required></textarea>
              <button type="submit" className="bg-brand-orange hover:bg-brand-orange/90 text-white font-extrabold py-3 rounded-xl transition shadow-lg shadow-brand-orange/20">
                মেসেজ পাঠান
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 mt-12 pt-12 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Shop Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="text-2xl font-black text-brand-orange mb-4">C&B Mart</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-4">
              ঘর সাজাতে আপনার সাথে। প্রিমিয়াম পর্দা, বেডিং এবং ফার্নিচারের বিশ্বস্ত প্রতিষ্ঠান। ১০০% অরিজিনাল পণ্য ও দ্রুত হোম ডেলিভারি।
            </p>
            <div className="bg-orange-50 dark:bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3 inline-block text-left shadow-sm">
              <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed">
                অর্ডার সংক্রান্ত যেকোনো বিষয়ে হোয়াটসঅ্যাপে মেসেজ বা কল করুন | <span className="text-brand-orange whitespace-nowrap">সকাল ৮টা থেকে রাত ১০টা পর্যন্ত</span>
              </p>
            </div>
          </div>
          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 mb-4">Contact & Support</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-brand-orange shrink-0 mt-0.5" />
                <span>Mirpur 11, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-brand-orange shrink-0" />
                <span>01804-914606</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-brand-orange shrink-0" />
                <span>curtain&bedsheetmart@gmail.com</span>
              </li>
            </ul>
          </div>
          {/* Social Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 mb-4">Follow Us</h3>
            <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <li>
                <a href="https://www.facebook.com/profile.php?id=61587776247110" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand-orange transition">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="shrink-0 text-[#1877F2]" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook Page</span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/8801804914606" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-brand-orange transition">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="shrink-0 text-[#25D366]" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  <span>WhatsApp Support</span>
                </a>
              </li>
            </ul>
          </div>
          {/* Quick Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-100 mb-4">Quick Links</h3>
            <ul className="space-y-3 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <li><Link href="/" className="hover:text-brand-orange transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand-orange transition">Terms and Conditions</Link></li>
              <li><Link href="/checkout" className="hover:text-brand-orange transition">Checkout Page</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
          <p className="text-center text-xs font-bold text-zinc-400 dark:text-zinc-600">
            © 2026 C&B Mart. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Floating Cart Widget */}
      <div
        onClick={() => setCartOpen(true)}
        className="fixed right-0 top-[40%] z-[45] bg-brand-orange text-white py-2.5 sm:py-3.5 px-2 sm:px-3 rounded-l-2xl shadow-2xl flex flex-col items-center gap-1 sm:gap-1.5 cursor-pointer hover:bg-brand-orange/95 active:scale-95 transition-all group border-y border-l border-white/20 select-none"
      >
        <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl group-hover:scale-110 transition-transform">
          <ShoppingBag size={18} className="text-white" />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-100">
            {cartCount} Items
          </span>
          <span className="text-[10px] sm:text-xs font-black mt-0.5 whitespace-nowrap">
            ৳{cartSubtotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Review Screenshot Modal */}
      <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />
    </div>
  );
}
