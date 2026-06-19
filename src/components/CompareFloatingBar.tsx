"use client";

import React from "react";
import { useCompare } from "@/context/CompareContext";
import { Scale, X } from "lucide-react";

export default function CompareFloatingBar() {
  const { compareItems, clearCompare, setIsCompareModalOpen } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
      <div className="bg-zinc-900 dark:bg-zinc-800 text-white shadow-2xl rounded-full px-4 py-3 flex items-center gap-3 border border-zinc-800 dark:border-zinc-700 pointer-events-auto max-w-full">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            <span className="font-bold text-emerald-400">{compareItems.length}</span> items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCompareModalOpen(true)}
            className="bg-white text-zinc-900 hover:bg-zinc-100 px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap"
          >
            Compare Now
          </button>
          <button
            onClick={clearCompare}
            className="p-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-full text-zinc-400 hover:text-white transition-colors shrink-0"
            title="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
