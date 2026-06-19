"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  category: string;
  slug: string;
  description?: string;
  additionalInfo?: string;
  stockQuantity: number;
}

interface CompareContextType {
  compareItems: CompareProduct[];
  addToCompare: (product: CompareProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (isOpen: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<CompareProduct[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("candbmart_compare");
    if (saved) {
      try {
        setCompareItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse compare items", e);
      }
    }
  }, []);

  // Save to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("candbmart_compare", JSON.stringify(compareItems));
  }, [compareItems]);

  const addToCompare = (product: CompareProduct) => {
    setCompareItems((prev) => {
      // Prevent duplicates
      if (prev.find((p) => p.id === product.id)) {
        return prev;
      }
      // Maximum 4 products
      if (prev.length >= 4) {
        alert("আপনি একসাথে সর্বোচ্চ ৪টি প্রোডাক্ট কম্পেয়ার করতে পারবেন।");
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromCompare = (productId: string) => {
    setCompareItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setCompareItems([]);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompareModalOpen,
        setIsCompareModalOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
