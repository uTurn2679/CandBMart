"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Check, Clock, Truck, ShieldAlert, ArrowLeft, ClipboardList, Wallet } from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setError("");
      } else {
        setError(data.error || "Order not found.");
      }
    } catch (err) {
      setError("Failed to fetch order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-zinc-500">Loading tracking details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-200">Tracking Error</h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto font-semibold">
              {error || "We couldn't locate any order matching the tracking ID you provided."}
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition"
          >
            <ArrowLeft size={14} />
            <span>Return to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate current progress step (Pending, Processing, Shipped, Delivered)
  const steps = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "CANCELLED";

  const getStepStatus = (index: number) => {
    if (isCancelled) return "cancelled";
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "active";
    return "upcoming";
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "COD":
        return "Cash on Delivery (COD)";
      case "BKASH_MANUAL":
        return "Manual bKash Transfer";
      case "NAGAD_MANUAL":
        return "Manual Nagad Transfer";
      case "ROCKET_MANUAL":
        return "Manual Rocket Transfer";
      default:
        return method;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Header summary */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-brand-orange bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Order Registered
            </span>
            <h1 className="text-xl font-black text-zinc-900 dark:text-white mt-2">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="flex flex-wrap gap-2 md:text-right shrink-0">
            <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wide ${
              order.orderStatus === "DELIVERED"
                ? "bg-emerald-500/10 text-emerald-605 dark:text-emerald-405 border border-emerald-500/20"
                : order.orderStatus === "CANCELLED"
                ? "bg-rose-500/10 text-rose-605 dark:text-rose-405 border border-rose-500/20"
                : "bg-orange-500/10 text-brand-orange border border-brand-orange/20 animate-pulse"
            }`}>
              Order Status: {order.orderStatus}
            </span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wide ${
              order.paymentStatus === "PAID"
                ? "bg-emerald-500/10 text-emerald-650 dark:text-emerald-450 border border-emerald-500/20"
                : "bg-amber-500/10 text-amber-650 dark:text-amber-450 border border-amber-500/20"
            }`}>
              Payment: {order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Stepper Timeline Tracker */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs">
          <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">
            Delivery Progress
          </h2>

          {isCancelled ? (
            <div className="flex items-center justify-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl text-rose-650 dark:text-rose-450 text-xs font-bold">
              <ShieldAlert size={18} />
              <span>This order has been cancelled. Please contact customer support for further information.</span>
            </div>
          ) : (
            <div className="relative flex flex-col md:flex-row md:justify-between gap-6 md:gap-0 items-start md:items-center">
              {/* Stepper Line (desktop) */}
              <div className="hidden md:block absolute left-8 right-8 top-5.5 h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-0">
                <div
                  className="h-full bg-brand-orange transition-all duration-500"
                  style={{ width: `${(Math.max(0, currentStepIndex) / (steps.length - 1)) * 100}%` }}
                />
              </div>

              {steps.map((step, idx) => {
                const status = getStepStatus(idx);
                return (
                  <div
                    key={step}
                    className="flex md:flex-col items-center gap-3 md:gap-2 text-center md:flex-1 relative z-10"
                  >
                    {/* Circle Node */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition ${
                        status === "completed"
                          ? "bg-brand-orange border-brand-orange text-white shadow-md shadow-brand-orange/10"
                          : status === "active"
                          ? "bg-white dark:bg-zinc-900 border-brand-orange text-brand-orange animate-pulse"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {status === "completed" ? (
                        <Check size={18} />
                      ) : idx === 2 ? (
                        <Truck size={18} />
                      ) : (
                        <Clock size={18} />
                      )}
                    </div>

                    {/* Label */}
                    <div className="text-left md:text-center">
                      <p className={`text-xs font-extrabold ${status === "active" ? "text-brand-orange" : "text-zinc-805 dark:text-zinc-200"}`}>
                        {step.charAt(0) + step.slice(1).toLowerCase()}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-semibold">
                        {idx === 0 && "Verification"}
                        {idx === 1 && "Item Prep"}
                        {idx === 2 && "In Transit"}
                        {idx === 3 && "Arrival"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Order Details & Items (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Items */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-4">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <ClipboardList size={14} className="text-brand-orange" />
                <span>Items Ordered</span>
              </h2>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-900 space-y-3">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 pt-3 first:pt-0">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product?.images?.[0]?.imageUrl ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-zinc-100 dark:bg-zinc-800">
                          <Image 
                            src={item.product.images[0].imageUrl}  
                            alt={item.productName} 
                            width={40} 
                            height={40} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg shrink-0 bg-zinc-100 dark:bg-zinc-800" />
                      )}
                      <div className="min-w-0">
                        <Link href={`/product/${item.product?.slug || '#'}`} className="hover:underline">
                          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{item.productName}</h4>
                        </Link>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">{item.variantName} x {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-zinc-905 dark:text-white shrink-0">
                      {item.totalPrice.toLocaleString()} TK
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing Math */}
              <div className="border-t border-zinc-100 dark:border-zinc-900 pt-3 text-xs font-bold space-y-1.5 text-zinc-500 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{order.subtotalAmount.toLocaleString()} TK</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{order.deliveryCharge === 0 ? "FREE" : `${order.deliveryCharge} TK`}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-brand-orange font-bold">
                    <span>Discount Coupon</span>
                    <span>-{order.discountAmount} TK</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-zinc-905 dark:text-white pt-1.5 border-t border-zinc-100 dark:border-zinc-900">
                  <span>Total Paid/Payable</span>
                  <span className="text-brand-orange">{order.totalAmount.toLocaleString()} TK</span>
                </div>
              </div>
            </div>

            {/* Customer Shipping & Payment Snapshot */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-4">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <Wallet size={14} className="text-brand-orange" />
                <span>Shipping & Payment Info</span>
              </h2>

              <div className="space-y-3 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">Recipient</p>
                  <p>{order.customerName} ({order.customerPhone})</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">Shipping Address</p>
                  <p className="leading-relaxed">{order.deliveryAddress}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">Payment Method</p>
                  <p>{getPaymentMethodLabel(order.payment?.paymentMethod)}</p>
                  {order.payment?.paymentMethod !== "COD" && (
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 mt-1.5 text-[10px]">
                      {order.payment?.transactionId && (
                        <p><strong>Transaction ID:</strong> {order.payment.transactionId}</p>
                      )}
                      {order.payment?.lastThreeDigits && (
                        <p><strong>Last 3 digits:</strong> {order.payment.lastThreeDigits}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Status Timeline (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-4">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                Status History Logs
              </h2>
              
              <div className="relative border-l border-zinc-100 dark:border-zinc-900 pl-4 space-y-6 py-2">
                {order.trackingHistory.map((log: any, index: number) => (
                  <div key={log.id} className="relative">
                    {/* Stepper Dot */}
                    <div className={`absolute -left-6.5 top-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-zinc-900 flex items-center justify-center ${
                      index === 0 ? "bg-brand-orange scale-110" : "bg-zinc-200 dark:bg-zinc-800"
                    }`} />
                    
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 uppercase">
                          {log.status}
                        </span>
                        <span className="text-[9px] text-zinc-400 font-bold">
                          {new Date(log.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal font-semibold">
                        {log.notes}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
