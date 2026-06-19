"use client";

import React, { useEffect } from "react";
import { useCompare } from "@/context/CompareContext";
import { X, Check } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CompareModal() {
  const { compareItems, isCompareModalOpen, setIsCompareModalOpen, removeFromCompare } = useCompare();
  const { addToCart } = useCart();

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsCompareModalOpen(false);
    };
    if (isCompareModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isCompareModalOpen, setIsCompareModalOpen]);

  if (!isCompareModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-zinc-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-6xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Product Comparison
          </h2>
          <button
            onClick={() => setIsCompareModalOpen(false)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar">
          {compareItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <X className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">No products selected for comparison.</p>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="mt-6 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left min-w-[800px] border-collapse">
                <tbody>
                  {/* Basic Info & Remove */}
                  <tr>
                    <td className="p-4 w-48 font-bold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 align-top">Product</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="p-4 min-w-[250px] border-b border-zinc-100 dark:border-zinc-800 align-top relative group">
                        <button
                          onClick={() => removeFromCompare(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden mb-4 border border-zinc-200 dark:border-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <Link href={`/product/${item.slug}`} className="font-bold text-lg text-zinc-900 dark:text-zinc-100 hover:text-emerald-500 transition-colors line-clamp-2 mb-2">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl font-black text-zinc-900 dark:text-white">৳{item.price}</span>
                          {item.compareAtPrice && (
                            <span className="text-sm font-medium text-zinc-400 line-through">৳{item.compareAtPrice}</span>
                          )}
                        </div>
                        <Link
                          href={`/product/${item.slug}`}
                          className="w-full inline-block text-center py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-sm transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    ))}
                  </tr>

                  {/* Category */}
                  <tr>
                    <td className="p-4 font-bold text-sm text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">Category</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                        <span className="inline-block px-3 py-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full text-xs font-semibold">
                          {item.category}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Availability */}
                  <tr>
                    <td className="p-4 font-bold text-sm text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">Availability</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                        {item.stockQuantity > 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
                            <Check className="w-4 h-4" /> In Stock
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-500 text-sm font-bold">
                            <X className="w-4 h-4" /> Out of Stock
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Description */}
                  <tr>
                    <td className="p-4 font-bold text-sm text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 align-top">Description</td>
                    {compareItems.map((item) => (
                      <td key={item.id} className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 align-top">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-4 leading-relaxed">
                          {item.description || "No description available."}
                        </p>
                      </td>
                    ))}
                  </tr>
                  
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
