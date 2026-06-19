"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { 
  ShoppingCart, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Menu, 
  X, 
  Phone, 
  ShieldCheck, 
  Clock, 
  Sun, 
  Moon, 
  MapPin, 
  Heart 
} from "lucide-react";
import CartDrawer from "./CartDrawer";

interface NavbarProps {
  onSearchChange?: (val: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (slug: string) => void;
}

const C_AND_B_MART_CATEGORIES = [
  { name: "Home", slug: "home", query: "", isHome: true },
  { name: "পর্দা (Curtains)", slug: "porda", query: "porda" },
  { name: "দোলনা", slug: "dolna", query: "dolna" },
  { name: "বেডিং (Bedding)", slug: "bedding", query: "bedding" },
  { name: "মশারি", slug: "moshari", query: "moshari" },
  { name: "Offer Zone", slug: "offers", query: "offer" }
];

export const Navbar: React.FC<NavbarProps> = ({ 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange 
}) => {
  const { user, logout, setShowAuthModal } = useAuth();
  const { cartCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/products?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.products) {
            setSuggestions(data.products.slice(0, 5));
            setShowSuggestions(true);
          }
        })
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearchChange) {
      onSearchChange(searchQuery);
    } else {
      window.location.href = `/?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleCategoryClick = (cat: typeof C_AND_B_MART_CATEGORIES[0]) => {
    if (cat.isHome) {
      if (onCategoryChange) {
        onCategoryChange("");
        if (onSearchChange) onSearchChange("");
      } else {
        window.location.href = "/";
      }
      return;
    }
    if (onCategoryChange) {
      if (selectedCategory === cat.slug) {
        onCategoryChange("");
        if (onSearchChange) onSearchChange("");
      } else {
        onCategoryChange(cat.slug);
        if (onSearchChange) onSearchChange(cat.query || "");
      }
    } else {
      window.location.href = `/?category=${cat.slug}`;
    }
  };

  return (
    <>


      <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 transition shadow-xs border-b border-zinc-100 dark:border-zinc-900">
        {/* Main Navbar Row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* C&B Mart Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.jpg" 
              alt="C&B Mart Logo" 
              className="w-11 h-11 object-contain rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 shadow-md group-hover:scale-105 transition-transform duration-300 bg-white"
            />
            <div className="flex flex-col">
              <span className="font-black text-base sm:text-lg leading-none uppercase tracking-tight text-zinc-900 dark:text-white group-hover:text-brand-orange transition-colors">
                C&B Mart
              </span>
              <span className="text-[9px] font-bold text-brand-orange mt-0.5 whitespace-nowrap">
                ঘর সাজাতে আপনার সাথে
              </span>
            </div>
          </Link>

          {/* Centered Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-lg relative mx-4"
            onClick={(e) => e.stopPropagation()} // Prevent document click from closing immediately when clicking inside
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              className="w-full pl-5 pr-12 py-2.5 border border-zinc-205 dark:border-zinc-805 rounded-full bg-zinc-50 dark:bg-zinc-900/60 focus:bg-white focus:ring-2 focus:ring-brand-orange/15 focus:border-brand-orange outline-none text-sm text-zinc-900 dark:text-white transition shadow-inner"
            />
            <button 
              type="submit"
              className="absolute right-0 inset-y-0 pr-4 flex items-center text-zinc-405 hover:text-brand-orange transition"
            >
              <Search size={18} />
            </button>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {suggestions.map(p => (
                  <Link 
                    key={p.id} 
                    href={`/product/${p.slug}`}
                    onClick={() => setShowSuggestions(false)}
                    className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images?.[0]?.imageUrl || "/placeholder.jpg"} className="w-12 h-12 object-cover rounded-lg shrink-0" alt="" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1">{p.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-black text-brand-orange">{p.price} TK</span>
                        {p.compareAtPrice > p.price && (
                          <span className="text-[10px] text-zinc-400 line-through">{p.compareAtPrice} TK</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </form>

          {/* Ghorer Bazar Right Actions (Stacked Layout) */}
          <div className="flex items-center gap-4 sm:gap-6">
            
            {/* Track Order */}
            <Link 
              href="/checkout" 
              className="flex flex-col items-center cursor-pointer text-zinc-650 dark:text-zinc-350 hover:text-brand-orange transition"
              title="Track Order"
            >
              <MapPin size={20} className="stroke-[1.8]" />
              <span className="hidden sm:inline text-[10px] font-bold mt-1 whitespace-nowrap">Track Order</span>
            </Link>

            {/* User Sessions */}
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="flex flex-col items-center cursor-pointer text-zinc-650 dark:text-zinc-355 hover:text-brand-orange transition"
                    title="Admin Dashboard"
                  >
                    <LayoutDashboard size={20} className="stroke-[1.8]" />
                    <span className="hidden sm:inline text-[10px] font-bold mt-1">Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex flex-col items-center cursor-pointer text-zinc-650 dark:text-zinc-355 hover:text-rose-500 transition"
                  title="Sign Out"
                >
                  <LogOut size={20} className="stroke-[1.8]" />
                  <span className="hidden sm:inline text-[10px] font-bold mt-1">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex flex-col items-center cursor-pointer text-zinc-650 dark:text-zinc-355 hover:text-brand-orange transition"
                title="Sign In"
              >
                <User size={20} className="stroke-[1.8]" />
                <span className="hidden sm:inline text-[10px] font-bold mt-1">Sign In</span>
              </button>
            )}



            {/* Shopping Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="flex flex-col items-center cursor-pointer text-zinc-650 dark:text-zinc-350 hover:text-brand-orange transition relative"
              title="Cart"
            >
              <div className="relative">
                <ShoppingCart size={20} className="stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-orange text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-md">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-[10px] font-bold mt-1">Cart</span>
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col items-center cursor-pointer text-zinc-650 dark:text-zinc-350 hover:text-brand-orange transition"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              <span className="text-[10px] font-bold mt-1">More</span>
            </button>

          </div>
        </div>

        {/* Deep Green Category Navigation Bar (Secondary Row) */}
        <div className="w-full bg-[#041f1e] dark:bg-zinc-900 border-t border-brand-orange/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-none scroll-smooth">
              {C_AND_B_MART_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => handleCategoryClick(cat)}
                  className={`text-xs font-extrabold uppercase tracking-wide shrink-0 transition-colors duration-150 ${
                    (cat.isHome && !selectedCategory && searchQuery === "") ||
                    (cat.slug === "all" && !selectedCategory && searchQuery === "") ||
                    (selectedCategory === cat.slug && !cat.isHome && cat.slug !== "all")
                      ? "text-brand-orange"
                      : "text-zinc-205 hover:text-brand-orange"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-150 dark:border-zinc-855 bg-white dark:bg-zinc-950 p-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onSearchChange) onSearchChange(e.target.value);
                }}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full pl-5 pr-12 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-905 outline-none text-sm text-zinc-900 dark:text-white"
              />
              <button 
                type="submit"
                className="absolute right-0 inset-y-0 pr-4 flex items-center text-zinc-400"
              >
                <Search size={16} />
              </button>

              {/* Mobile Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map(p => (
                    <Link 
                      key={p.id} 
                      href={`/product/${p.slug}`}
                      onClick={() => { setShowSuggestions(false); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images?.[0]?.imageUrl || "/placeholder.jpg"} className="w-10 h-10 object-cover rounded-md shrink-0" alt="" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">{p.name}</span>
                        <span className="text-[10px] font-black text-brand-orange mt-0.5">{p.price} TK</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
            <div className="flex flex-col gap-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 hover:bg-zinc-55 dark:hover:bg-zinc-900 rounded-xl transition"
              >
                Products
              </Link>
              <Link
                href="/checkout"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 hover:bg-zinc-55 dark:hover:bg-zinc-900 rounded-xl transition"
              >
                Checkout
              </Link>
              {user && user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-brand-orange hover:bg-zinc-55 dark:hover:bg-zinc-900 rounded-xl transition flex items-center gap-1.5"
                >
                  <LayoutDashboard size={16} />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;
