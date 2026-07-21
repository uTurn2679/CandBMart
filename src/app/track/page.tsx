"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, MapPin, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    
    // Redirect to the order details page
    router.push(`/order/${orderNumber.trim()}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-12 md:py-24">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm text-center">
          
          <div className="flex justify-center mb-6">
            <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-full text-brand-orange">
              <Package size={40} strokeWidth={1.5} />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mb-2 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mb-8">
            Enter your order number or mobile number below to check its current status and delivery progress.
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. BD-123456 or 017XXXXXX"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold text-zinc-800 dark:text-zinc-200 outline-none focus:border-brand-orange transition shadow-inner placeholder:font-medium placeholder:text-zinc-400"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={!orderNumber.trim()}
              className="w-full bg-brand-orange hover:bg-brand-orange/95 disabled:bg-orange-300 text-white font-extrabold py-3.5 px-4 rounded-2xl text-sm transition shadow-lg shadow-brand-orange/10 active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Track Now</span>
            </button>
          </form>
          
          {/* Decorative steps */}
          <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-center gap-6 sm:gap-10 text-zinc-300 dark:text-zinc-700">
            <div className="flex flex-col items-center gap-2">
              <Package size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Ordered</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Shipped</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <MapPin size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Delivered</span>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
