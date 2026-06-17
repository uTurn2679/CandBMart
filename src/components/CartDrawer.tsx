"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartCount } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close drawer on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Disable scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-xs transition-opacity duration-300">
      
      {/* Side Panel */}
      <div
        ref={drawerRef}
        className="w-full max-w-md h-full bg-white dark:bg-zinc-950 shadow-2xl flex flex-col border-l border-zinc-100 dark:border-zinc-900 animate-in slide-in-from-right duration-305"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-orange" />
            <span className="font-extrabold text-zinc-900 dark:text-white">Shopping Cart ({cartCount})</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-205 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
                <ShoppingBag size={28} />
              </div>
              <div>
                <p className="font-extrabold text-zinc-800 dark:text-zinc-200">Your cart is empty</p>
                <p className="text-xs text-zinc-450 mt-1">Add items from the catalog to see them here.</p>
              </div>
              <button
                onClick={onClose}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-3 bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-2xl border border-zinc-100/50 dark:border-zinc-900/50 hover:border-zinc-200/50 dark:hover:border-zinc-800 transition"
              >
                {/* Product Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/30 dark:border-zinc-800/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-805 dark:text-zinc-195 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-zinc-450 mt-0.5 font-medium">{item.variantName}</p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-1 hover:bg-zinc-105 dark:hover:bg-zinc-805 text-zinc-505 transition"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-xs font-bold text-zinc-705 dark:text-zinc-295">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="p-1 hover:bg-zinc-105 dark:hover:bg-zinc-805 text-zinc-505 transition"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-zinc-400 hover:text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                      title="Remove Item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right shrink-0 flex flex-col justify-between items-end">
                  <span className="text-xs font-extrabold text-zinc-905 dark:text-white">
                    {(item.price * item.quantity).toLocaleString()} TK
                  </span>
                  <span className="text-[9px] text-zinc-450 font-semibold">
                    {item.price.toLocaleString()} TK / each
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Billing & Actions */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/30 space-y-4">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-zinc-500">Cart Subtotal</span>
              <span className="font-extrabold text-lg text-zinc-905 dark:text-white">
                {cartSubtotal.toLocaleString()} TK
              </span>
            </div>
            
            <p className="text-[10px] text-zinc-450 leading-tight">
              Shipping fee and coupons are dynamically calculated at the checkout page. 
              Orders exceeding 2,000 TK automatically qualify for **Free Shipping**!
            </p>

            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/10 active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
