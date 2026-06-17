"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Truck, Percent, Gift, MapPin, Phone, CreditCard, ChevronLeft } from "lucide-react";

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart();
  const { user, setShowAuthModal } = useAuth();
  const router = useRouter();

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryZone, setDeliveryZone] = useState("INSIDE_DHAKA");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [transactionId, setTransactionId] = useState("");
  const [lastThreeDigits, setLastThreeDigits] = useState("");

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Dynamic delivery calculations
  const [deliveryCharge, setDeliveryCharge] = useState(60);
  const [freeThreshold, setFreeThreshold] = useState(2000);
  const [insideRate, setInsideRate] = useState(60);
  const [outsideRate, setOutsideRate] = useState(120);

  // General state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load name/phone from auth session if available
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setCustomerPhone(user.phone_number || "");
    }
  }, [user]);

  // Fetch Delivery configurations from Settings API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          const rates = {
            inside: parseFloat(data.settings.DELIVERY_CHARGE_INSIDE_DHAKA || "60"),
            outside: parseFloat(data.settings.DELIVERY_CHARGE_OUTSIDE_DHAKA || "120"),
            threshold: parseFloat(data.settings.FREE_DELIVERY_THRESHOLD || "2000"),
          };
          setInsideRate(rates.inside);
          setOutsideRate(rates.outside);
          setFreeThreshold(rates.threshold);
        }
      } catch (error) {
        console.error("Failed to load delivery settings:", error);
      }
    }
    loadSettings();
  }, []);

  // Recalculate shipping dynamically
  useEffect(() => {
    if (cartSubtotal >= freeThreshold) {
      setDeliveryCharge(0);
    } else {
      setDeliveryCharge(deliveryZone === "INSIDE_DHAKA" ? insideRate : outsideRate);
    }
  }, [cartSubtotal, deliveryZone, freeThreshold, insideRate, outsideRate]);

  // Apply Coupon code
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponError("");
    setCouponSuccess("");
    setCouponLoading(true);

    try {
      const res = await fetch(
        `/api/coupons?code=${encodeURIComponent(couponCode.trim())}&subtotal=${cartSubtotal}`
      );
      const data = await res.json();

      if (data.isValid) {
        setAppliedCoupon(data.coupon);
        setCouponDiscount(data.discountAmount);
        setCouponSuccess(`Coupon "${data.coupon.code}" applied! Save ${data.discountAmount} TK`);
        setCouponError("");
      } else {
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err) {
      setCouponError("Failed to validate coupon.");
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponSuccess("");
    setCouponError("");
  };

  // Submit Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setSubmitError("Your shopping cart is empty.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const orderItems = cart.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    const payload = {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryZone,
      paymentMethod,
      transactionId: paymentMethod !== "COD" ? transactionId : undefined,
      lastThreeDigits: paymentMethod !== "COD" ? lastThreeDigits : undefined,
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      items: orderItems,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        clearCart();
        router.push(`/order/${data.orderNumber}`);
      } else {
        setSubmitError(data.error || "Failed to place order. Please review your checkout details.");
      }
    } catch (err) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPayable = Math.max(0, cartSubtotal + deliveryCharge - couponDiscount);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
        >
          <ChevronLeft size={16} />
          <span>Back to Products Catalog</span>
        </Link>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side Checkout Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-6">
              
              <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-zinc-900 dark:text-white">Fast One-Page Checkout</h2>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">Complete your order in less than a minute</p>
                </div>
                {!user && (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="text-xs font-bold text-brand-orange hover:underline"
                  >
                    Login for saved info
                  </button>
                )}
              </div>

              {submitError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs p-3.5 rounded-xl font-semibold">
                  {submitError}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                
                {/* 1. Delivery Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MapPin size={14} className="text-brand-orange" />
                    <span>1. Delivery Information</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Habibur Rahman"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-brand-orange transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 017XXXXXXXX"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-brand-orange transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                      Full Delivery Address
                    </label>
                    <textarea
                      placeholder="House No, Road No, Area, City/District"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      required
                      rows={3}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-brand-orange transition resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                      Delivery Location / Zone
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 text-xs font-semibold outline-none focus:border-brand-orange transition"
                    >
                      <option value="INSIDE_DHAKA">Inside Dhaka (Rates: {insideRate} TK)</option>
                      <option value="OUTSIDE_DHAKA">Outside Dhaka (Rates: {outsideRate} TK)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Payment Method */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <CreditCard size={14} className="text-brand-orange" />
                    <span>2. Payment Option</span>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* COD */}
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition text-center ${
                        paymentMethod === "COD"
                          ? "border-brand-orange bg-orange-50/20 dark:bg-orange-950/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="sr-only"
                      />
                      <span className="text-xs font-bold text-zinc-805 dark:text-zinc-200">COD</span>
                      <span className="text-[9px] text-zinc-400 mt-1 font-medium">Cash On Delivery</span>
                    </label>

                    {/* bKash */}
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition text-center ${
                        paymentMethod === "BKASH_MANUAL"
                          ? "border-brand-orange bg-orange-50/20 dark:bg-orange-950/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="BKASH_MANUAL"
                        checked={paymentMethod === "BKASH_MANUAL"}
                        onChange={() => setPaymentMethod("BKASH_MANUAL")}
                        className="sr-only"
                      />
                      <span className="text-xs font-extrabold text-pink-600">bKash</span>
                      <span className="text-[9px] text-zinc-400 mt-1 font-medium">Manual Transfer</span>
                    </label>

                    {/* Nagad */}
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition text-center ${
                        paymentMethod === "NAGAD_MANUAL"
                          ? "border-brand-orange bg-orange-50/20 dark:bg-orange-950/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="NAGAD_MANUAL"
                        checked={paymentMethod === "NAGAD_MANUAL"}
                        onChange={() => setPaymentMethod("NAGAD_MANUAL")}
                        className="sr-only"
                      />
                      <span className="text-xs font-extrabold text-orange-500">Nagad</span>
                      <span className="text-[9px] text-zinc-400 mt-1 font-medium">Manual Transfer</span>
                    </label>

                    {/* Rocket */}
                    <label
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer transition text-center ${
                        paymentMethod === "ROCKET_MANUAL"
                          ? "border-brand-orange bg-orange-50/20 dark:bg-orange-950/20"
                          : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="ROCKET_MANUAL"
                        checked={paymentMethod === "ROCKET_MANUAL"}
                        onChange={() => setPaymentMethod("ROCKET_MANUAL")}
                        className="sr-only"
                      />
                      <span className="text-xs font-extrabold text-purple-650">Rocket</span>
                      <span className="text-[9px] text-zinc-400 mt-1 font-medium">Manual Transfer</span>
                    </label>
                  </div>

                  {/* Manual MFS details input */}
                  {paymentMethod !== "COD" && (
                    <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-2xl space-y-4 animate-in fade-in duration-200">
                      <div className="text-[10px] text-zinc-500 leading-normal font-semibold">
                        <p className="font-bold text-zinc-700 dark:text-zinc-300 mb-1">How to pay:</p>
                        Send Money of <span className="font-extrabold text-zinc-800 dark:text-white">{totalPayable.toLocaleString()} TK</span> to our merchant number: <span className="font-extrabold text-brand-orange">+8801711111111</span>. Then input either your Transaction ID or the last 3 digits of your mobile number below.
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            Transaction ID (TxnID)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. K9F2E7D1L"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none focus:border-brand-orange transition"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">
                            Or last 3 digits of phone number
                          </label>
                          <input
                            type="text"
                            maxLength={3}
                            placeholder="e.g. 524"
                            value={lastThreeDigits}
                            onChange={(e) => setLastThreeDigits(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none focus:border-brand-orange transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full bg-brand-orange hover:bg-brand-orange/95 disabled:bg-orange-300 text-white font-extrabold py-3 px-4 rounded-2xl text-sm transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-orange/10 active:scale-98"
                >
                  {submitting ? "Processing checkout..." : `Confirm Order • ${totalPayable.toLocaleString()} TK`}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side Order Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Summary details */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-900 pb-3">
                Order Summary ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h3>

              {cart.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400 font-medium">
                  Your cart is empty. Please add items before checking out.
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900 pr-1 space-y-3">
                  {cart.map((item) => (
                    <div key={item.variantId} className="flex gap-3 pt-3 first:pt-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200/30 dark:border-zinc-800/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <h4 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.name}</h4>
                        <p className="text-[9px] text-zinc-450 mt-0.5">{item.variantName} x {item.quantity}</p>
                      </div>
                      <div className="text-right shrink-0 flex flex-col justify-center">
                        <span className="text-xs font-bold text-zinc-805 dark:text-zinc-200">
                          {(item.price * item.quantity).toLocaleString()} TK
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coupon Code Input */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-black text-zinc-400 uppercase tracking-widest">
                <Gift size={14} className="text-brand-orange" />
                <span>Apply Campaign Coupon</span>
              </div>

              {couponError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-[10px] p-2.5 rounded-lg font-bold">
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-[10px] p-2.5 rounded-lg font-bold">
                  {couponSuccess}
                </div>
              )}

              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. EID2026"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold outline-none uppercase tracking-wide focus:border-brand-orange transition"
                  />
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-brand-dark hover:bg-zinc-900 disabled:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:disabled:bg-zinc-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-orange-55/30 dark:bg-orange-955/30 border border-orange-105/30 dark:border-orange-905/30 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-orange">
                    <Percent size={14} />
                    <span>Coupon Applied: {appliedCoupon.code}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-zinc-400 hover:text-rose-500 transition"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Total Billing Math */}
            <div className="bg-brand-dark text-white p-6 rounded-3xl shadow-lg border border-orange-900/10 space-y-4">
              <h3 className="font-extrabold text-xs uppercase tracking-widest text-zinc-450">Cost Breakdown</h3>
              
              <div className="space-y-2.5 text-xs font-bold border-b border-zinc-800 pb-3">
                <div className="flex justify-between items-center text-zinc-300">
                  <span>Cart Subtotal</span>
                  <span>{cartSubtotal.toLocaleString()} TK</span>
                </div>

                <div className="flex justify-between items-center text-zinc-300">
                  <span>Delivery Charge</span>
                  <span>
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `${deliveryCharge.toLocaleString()} TK`
                    )}
                  </span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-brand-orange">
                    <span>Coupon Discount</span>
                    <span>-{couponDiscount.toLocaleString()} TK</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest">Total Payable</span>
                <span className="text-2xl font-black text-brand-orange">
                  {totalPayable.toLocaleString()} TK
                </span>
              </div>

              {cartSubtotal < freeThreshold && (
                <div className="bg-orange-950/30 border border-orange-900/20 p-2.5 rounded-xl flex items-center gap-2 text-[9px] text-orange-200">
                  <Truck size={14} className="shrink-0 text-brand-orange" />
                  <span>Add {(freeThreshold - cartSubtotal).toLocaleString()} TK more to qualify for **Free Shipping**!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-450 font-bold text-center mt-4">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Double-checked dynamic rates and details. SSL secured.</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
