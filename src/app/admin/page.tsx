"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import {
  ListOrdered,
  Percent,
  Settings,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle,
  Plus,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  ClipboardList,
  Tags,
  Bell
} from "lucide-react";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Tab navigation: "ORDERS" | "COUPONS" | "SETTINGS" | "PRODUCTS" | "OFFER_ZONE"
  const [activeTab, setActiveTab] = useState<"ORDERS" | "COUPONS" | "SETTINGS" | "PRODUCTS" | "OFFER_ZONE">("ORDERS");

  // General Category reference list
  const [categories, setCategories] = useState<any[]>([]);

  // Orders Tab states
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [sendingToSteadfast, setSendingToSteadfast] = useState(false);

  // Coupon Tab states
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minCartAmount, setMinCartAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Settings Tab states
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [insideDhaka, setInsideDhaka] = useState("");
  const [outsideDhaka, setOutsideDhaka] = useState("");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [steadfastApiKey, setSteadfastApiKey] = useState("");
  const [steadfastSecretKey, setSteadfastSecretKey] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Products Tab states
  const [adminProducts, setAdminProducts] = useState<any[]>([]);
  const [adminProductLoading, setAdminProductLoading] = useState(false);
  
  // Add product form states
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [pName, setPName] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pPrice, setPPrice] = useState("");
  const [pComparePrice, setPComparePrice] = useState("");
  const [pSku, setPSku] = useState("");
  const [pCategoryId, setPCategoryId] = useState("");
  const [pImageUrl, setPImageUrl] = useState("");
  const [pVariantName, setPVariantName] = useState("Standard");
  const [pStock, setPStock] = useState("");
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState("");

  // Helper to read image file and convert to Base64 for database storage
  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Quick size validation (> 5MB warn)
    if (file.size > 5 * 1024 * 1024) {
      alert("ছবি ৫ মেগাবাইটের থেকে ছোট হতে হবে।");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const MAX_DIM = 1000;

        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress and convert to Base64 string
        const base64String = canvas.toDataURL("image/webp", 0.8);
        setter(base64String);
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  // Edit product form states
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Initial redirect if not authorized
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  // Load Data
  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadOrders();
      loadCoupons();
      loadSettings();
      loadAdminProducts();
      loadCategories();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Failed to load categories");
    }
  };

  const loadOrders = async () => {
    setOrderLoading(true);
    try {
      const url = orderStatusFilter ? `/api/orders?status=${orderStatusFilter}` : "/api/orders";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        if (!orderStatusFilter) {
          // Hide DELIVERED and CANCELLED orders from the default view to keep it clean
          setOrders(data.orders.filter((o: any) => o.orderStatus !== "DELIVERED" && o.orderStatus !== "CANCELLED"));
        } else {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.error("Failed to load orders");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this order? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
        loadOrders();
      } else {
        alert("Failed to delete order");
      }
    } catch (e) {
      console.error("Failed to delete order", e);
    }
  };

  const loadCoupons = async () => {
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/manage");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (e) {
      console.error("Failed to load coupons");
    } finally {
      setCouponLoading(false);
    }
  };

  const loadSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setInsideDhaka(data.settings.DELIVERY_CHARGE_INSIDE_DHAKA || "");
        setOutsideDhaka(data.settings.DELIVERY_CHARGE_OUTSIDE_DHAKA || "");
        setFreeThreshold(data.settings.FREE_DELIVERY_THRESHOLD || "");
        setSteadfastApiKey(data.settings.STEADFAST_API_KEY || "");
        setSteadfastSecretKey(data.settings.STEADFAST_SECRET_KEY || "");
      }
    } catch (e) {
      console.error("Failed to load settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadAdminProducts = async () => {
    setAdminProductLoading(true);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setAdminProducts(data.products);
      }
    } catch (e) {
      console.error("Failed to load products list");
    } finally {
      setAdminProductLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      loadOrders();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderStatusFilter]);

  // Update order status or payment status
  const handleUpdateOrder = async (orderId: string, statusPayload: { orderStatus?: string; paymentStatus?: string }) => {
    setStatusUpdateLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...statusPayload, notes: statusNotes }),
      });
      const data = await res.json();
      if (data.success) {
        loadOrders();
        setSelectedOrder(data.order);
        setStatusNotes("");
      } else {
        alert(data.error || "Failed to update order");
      }
    } catch (error) {
      alert("Error occurred while updating order");
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleSendToSteadfast = async (orderId: string) => {
    setSendingToSteadfast(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/steadfast`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(`Order successfully sent to Steadfast Courier!\nTracking Code: ${data.trackingCode}`);
        loadOrders();
        // optionally update the selected order context if needed, or close modal
      } else {
        alert(data.error || "Failed to send to Steadfast");
      }
    } catch (error) {
      alert("Error occurred while sending to Steadfast");
    } finally {
      setSendingToSteadfast(false);
    }
  };

  // Create coupon code
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/coupons/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          discountType,
          discountValue,
          minCartAmount,
          maxDiscountAmount,
          startsAt,
          expiresAt,
          usageLimit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponSuccess("Coupon created successfully!");
        setCouponCode("");
        setDiscountValue("");
        setMinCartAmount("");
        setMaxDiscountAmount("");
        setStartsAt("");
        setExpiresAt("");
        setUsageLimit("");
        loadCoupons();
      } else {
        setCouponError(data.error || "Failed to create coupon.");
      }
    } catch (err) {
      setCouponError("Network error. Please try again.");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/coupons/manage?id=${couponId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadCoupons();
      } else {
        alert("Failed to delete coupon");
      }
    } catch (e) {
      console.error("Failed to delete coupon", e);
      alert("Error deleting coupon");
    }
  };

  // Update System settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          DELIVERY_CHARGE_INSIDE_DHAKA: insideDhaka,
          DELIVERY_CHARGE_OUTSIDE_DHAKA: outsideDhaka,
          FREE_DELIVERY_THRESHOLD: freeThreshold,
          STEADFAST_API_KEY: steadfastApiKey,
          STEADFAST_SECRET_KEY: steadfastSecretKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSuccess("Delivery settings saved successfully.");
        loadSettings();
      } else {
        setSettingsError(data.error || "Failed to update settings.");
      }
    } catch (err) {
      setSettingsError("Failed to update settings.");
    }
  };

  // Upload Product form submission
  const handleUploadProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError("");
    setProductSuccess("");

    const payload = {
      name: pName,
      description: pDescription,
      price: pPrice,
      compareAtPrice: pComparePrice || undefined,
      sku: pSku || undefined,
      categoryId: pCategoryId,
      imageUrl: pImageUrl,
      variantName: pVariantName,
      stockQuantity: pStock,
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProductSuccess("Product uploaded successfully!");
        setPName("");
        setPDescription("");
        setPPrice("");
        setPComparePrice("");
        setPSku("");
        setPCategoryId("");
        setPImageUrl("");
        setPVariantName("Standard");
        setPStock("");
        setShowAddProductForm(false);
        loadAdminProducts();
      } else {
        setProductError(data.error || "Failed to create product.");
      }
    } catch (err) {
      setProductError("Failed to connect to API.");
    }
  };

  // Toggle Product active status
  const handleToggleProductActive = async (prodId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        loadAdminProducts();
      }
    } catch (e) {
      console.error("Failed to toggle active status");
    }
  };

  // Toggle Banner status
  const handleToggleBanner = async (prodId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      // Trying to add to banner, check limit
      const bannerCount = adminProducts.filter((p) => p.isBanner).length;
      if (bannerCount >= 4) {
        alert("আপনি সর্বোচ্চ ৪টি প্রোডাক্ট ব্যানারে রাখতে পারবেন। নতুনটি যোগ করার আগে একটি রিমুভ করুন।");
        return;
      }
    }

    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBanner: !currentStatus }),
      });
      if (res.ok) {
        loadAdminProducts();
      }
    } catch (e) {
      console.error("Failed to toggle banner status");
    }
  };

  // Save edited product
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProductError("");

    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          compareAtPrice: editingProduct.compareAtPrice || null,
          sku: editingProduct.sku,
          categoryId: editingProduct.categoryId,
          stockQuantity: editingProduct.stockQuantity,
          additionalInfo: editingProduct.additionalInfo || null,
          extraImages: editingProduct.extraImages || [],
        }),
      });

      if (res.ok) {
        setEditingProduct(null);
        loadAdminProducts();
      } else {
        const data = await res.json();
        setProductError(data.error || "Failed to update product.");
      }
    } catch (err) {
      setProductError("Failed to save changes.");
    }
  };

  // Delete product completely
  const handleDeleteProduct = async (prodId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/products/${prodId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadAdminProducts();
        if (editingProduct?.id === prodId) setEditingProduct(null);
      }
    } catch (e) {
      console.error("Failed to delete product");
    }
  };

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-zinc-500">Authenticating admin session...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col gap-6">
        
        {/* Dashboard Title banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-150 dark:border-zinc-850 pb-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-905 dark:text-white flex items-center gap-3">
              Admin Operations Console
              
              {/* Notification Bell */}
              <button 
                onClick={() => setActiveTab("ORDERS")}
                className="relative p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition shadow-sm"
                title="New Orders"
              >
                <Bell size={18} className="text-zinc-600 dark:text-zinc-300" />
                {orders.filter(o => o.orderStatus === "PENDING").length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse shadow-sm">
                    {orders.filter(o => o.orderStatus === "PENDING").length}
                  </span>
                )}
              </button>
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-semibold">Manage orders, catalog uploads, coupons, and shipping settings</p>
          </div>
          
          {/* Quick Stats overview */}
          <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
            <span>Total Orders: <strong className="text-zinc-905 dark:text-white">{orders.length}</strong></span>
            <span>Active Products: <strong className="text-zinc-905 dark:text-white">{adminProducts.filter(p => p.isActive).length}</strong></span>
            <span>Active Coupons: <strong className="text-zinc-905 dark:text-white">{coupons.filter(c => c.isActive).length}</strong></span>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="flex gap-4 border-b border-zinc-150 dark:border-zinc-850 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setActiveTab("ORDERS")}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === "ORDERS"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <ListOrdered size={16} />
            <span>Orders Listings</span>
          </button>
          
          <button
            onClick={() => setActiveTab("PRODUCTS")}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === "PRODUCTS"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <ClipboardList size={16} />
            <span>Products Manager</span>
          </button>

          <button
            onClick={() => setActiveTab("COUPONS")}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === "COUPONS"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <Percent size={16} />
            <span>Coupon Manager</span>
          </button>
          
          <button
            onClick={() => setActiveTab("SETTINGS")}
            className={`pb-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
              activeTab === "SETTINGS"
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-zinc-400 hover:text-zinc-600"
            }`}
          >
            <Settings size={16} />
            <span>Shipping Settings</span>
          </button>
          
        </div>

        {/* ================================== TAB 1: ORDERS LISTINGS ================================== */}
        {activeTab === "ORDERS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Orders Table */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-extrabold text-zinc-805 dark:text-zinc-200">Customer Orders</h2>
                <div className="flex gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold rounded-xl p-1.5 outline-none text-zinc-600 dark:text-zinc-300"
                  >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  <button
                    onClick={loadOrders}
                    className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-xl transition"
                  >
                    <RefreshCw size={14} className={orderLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {orderLoading ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-bold animate-pulse">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-medium border border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                  No orders found matching the filter.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-zinc-600 dark:text-zinc-300 border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Order Info</th>
                        <th className="pb-3 pr-2">Customer</th>
                        <th className="pb-3 pr-2">Total</th>
                        <th className="pb-3 pr-2">Delivery Status</th>
                        <th className="pb-3 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition">
                          <td className="py-3 max-w-[200px]">
                            <p className="font-bold text-zinc-808 dark:text-zinc-200">{o.orderNumber}</p>
                            <div className="mt-1 space-y-0.5">
                              {o.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5" title={`${item.productName} ${item.variantName ? `(${item.variantName})` : ''} (x${item.quantity})`}>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={item.product?.images?.[0]?.imageUrl || "https://placehold.co/100x100?text=No+Image"} alt="" className="w-5 h-5 rounded object-cover shrink-0" />
                                  <p className="text-[10px] text-zinc-500 truncate">
                                    {item.productName} {item.variantName && <span className="text-zinc-400">({item.variantName})</span>} {item.product?.sku && <span className="text-brand-orange font-black">[{item.product.sku}]</span>} <span className="font-medium text-zinc-600 dark:text-zinc-400">x{item.quantity}</span>
                                  </p>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 max-w-[120px] truncate">
                            <p className="font-bold text-zinc-805 dark:text-zinc-200">{o.customerName}</p>
                            <p className="text-[10px] text-zinc-400 font-medium">{o.customerPhone}</p>
                          </td>
                          <td className="py-3">
                            <p className="font-extrabold text-zinc-905 dark:text-white">{o.totalAmount} TK</p>
                            {o.payment?.paymentMethod !== "COD" && (
                              <div className="mt-1 text-[9px] text-zinc-500 font-medium">
                                <p>Txn: <span className="font-bold text-zinc-700 dark:text-zinc-300">{o.payment?.transactionId || "N/A"}</span></p>
                                <p>Last 3: <span className="font-bold text-zinc-700 dark:text-zinc-300">{o.payment?.lastThreeDigits || "N/A"}</span></p>
                              </div>
                            )}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              o.orderStatus === "DELIVERED"
                                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                                : o.orderStatus === "CANCELLED"
                                ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                                : "bg-orange-50 text-brand-orange dark:bg-orange-950/20"
                            }`}>
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrder(o);
                                setStatusNotes("");
                              }}
                              className="inline-flex items-center gap-1 bg-brand-dark hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white p-1.5 px-3 rounded-lg text-[10px] font-bold transition"
                            >
                              <Eye size={12} />
                              <span>Manage</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="inline-flex items-center gap-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 p-1.5 px-3 rounded-lg text-[10px] font-bold transition"
                              title="Delete Order"
                            >
                              <Trash2 size={12} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Selected Order details */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-6 shadow-xs space-y-6">
              <h2 className="text-sm font-extrabold text-zinc-805 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                Order Manager
              </h2>

              {!selectedOrder ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-medium flex flex-col items-center gap-2">
                  <ClipboardList size={24} />
                  <span>Select an order from the list to view its details and perform actions.</span>
                </div>
              ) : (
                <div className="space-y-6 text-xs font-bold">
                  
                  {/* Summary */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-zinc-905 dark:text-white">Order: {selectedOrder.orderNumber}</span>
                      <a
                        href={`/order/${selectedOrder.id}`}
                        target="_blank"
                        className="text-[10px] text-brand-orange hover:underline font-bold"
                        rel="noreferrer"
                      >
                        Public Track Page
                      </a>
                    </div>
                    <div className="text-[10px] text-zinc-500 space-y-1 font-semibold">
                      <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                      <p><strong>Customer:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
                      <p><strong>Zone:</strong> {selectedOrder.deliveryZone}</p>
                      <p><strong>Address:</strong> {selectedOrder.deliveryAddress}</p>
                      {selectedOrder.trackingHistory?.find((t: any) => t.status === "NOTE") && (
                        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 rounded border border-amber-200 dark:border-amber-900/50">
                          <strong>Order Notes:</strong> {selectedOrder.trackingHistory.find((t: any) => t.status === "NOTE").notes.replace("Customer Note: ", "")}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Verification */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Payment Verification</h3>
                    
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 space-y-3">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span>Method: {selectedOrder.payment?.paymentMethod}</span>
                        <span className={`font-black ${selectedOrder.paymentStatus === "PAID" ? "text-emerald-500" : "text-amber-500"}`}>
                          Status: {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      
                      {selectedOrder.payment?.paymentMethod !== "COD" && (
                        <div className="text-[10px] bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-900 space-y-1 font-medium">
                          {selectedOrder.payment?.transactionId && <p><strong>Txn ID:</strong> {selectedOrder.payment.transactionId}</p>}
                          {selectedOrder.payment?.lastThreeDigits && <p><strong>Last 3 digits:</strong> {selectedOrder.payment.lastThreeDigits}</p>}
                        </div>
                      )}

                      {/* Payment verify CTA */}
                      {selectedOrder.paymentStatus !== "PAID" && (
                        <button
                          onClick={() => handleUpdateOrder(selectedOrder.id, { paymentStatus: "PAID" })}
                          disabled={statusUpdateLoading}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/10"
                        >
                          <CheckCircle size={12} />
                          <span>Verify Payment & Approve</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status updates */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Order Status Update</h3>
                    
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateOrder(selectedOrder.id, { orderStatus: "PROCESSING" })}
                          disabled={statusUpdateLoading || selectedOrder.orderStatus === "PROCESSING"}
                          className="flex-1 bg-orange-50 hover:bg-orange-100 text-brand-orange border border-orange-200 p-2 rounded-xl text-[10px] font-bold transition"
                        >
                          Prep Items
                        </button>
                        <button
                          onClick={() => handleUpdateOrder(selectedOrder.id, { orderStatus: "SHIPPED" })}
                          disabled={statusUpdateLoading || selectedOrder.orderStatus === "SHIPPED"}
                          className="flex-1 bg-brand-orange hover:bg-brand-orange/95 text-white p-2 rounded-xl text-[10px] font-bold transition shadow-lg shadow-brand-orange/10"
                        >
                          Dispatch
                        </button>
                        <button
                          onClick={() => handleUpdateOrder(selectedOrder.id, { orderStatus: "DELIVERED" })}
                          disabled={statusUpdateLoading || selectedOrder.orderStatus === "DELIVERED"}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-[10px] font-bold transition shadow-lg shadow-emerald-600/10"
                        >
                          Deliver
                        </button>
                      </div>
                      
                      {/* Steadfast Courier Button */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        <button
                          onClick={() => handleSendToSteadfast(selectedOrder.id)}
                          disabled={sendingToSteadfast}
                          className="w-full bg-[#1da086] hover:bg-[#16856f] text-white p-2 rounded-xl text-[10px] font-bold transition shadow-lg shadow-[#1da086]/20 flex items-center justify-center gap-2"
                        >
                          {sendingToSteadfast ? "Sending..." : "Send to Steadfast Courier"}
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">Audit Notes (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. Dispatched via Pathao Courier"
                          value={statusNotes}
                          onChange={(e) => setStatusNotes(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 text-xs font-semibold outline-none focus:border-brand-orange transition"
                        />
                      </div>

                      <button
                        onClick={() => handleUpdateOrder(selectedOrder.id, { orderStatus: "CANCELLED" })}
                        disabled={statusUpdateLoading || selectedOrder.orderStatus === "CANCELLED"}
                        className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 py-2 rounded-xl text-[10px] font-bold transition"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-900">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Ordered items</p>
                    <div className="space-y-1.5 font-medium text-zinc-550">
                      {selectedOrder.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-[10px]">
                          <span className="truncate max-w-[180px]">{item.productName} ({item.variantName})</span>
                          <span>{item.quantity} x {item.unitPrice} TK</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

          </div>
        )}

        {/* ================================== TAB 2: PRODUCTS MANAGER (NEW) ================================== */}
        {activeTab === "PRODUCTS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Products Table (8 cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <h2 className="text-sm font-extrabold text-zinc-805 dark:text-zinc-200">System Product Catalog</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setShowAddProductForm(!showAddProductForm);
                      setProductError("");
                      setProductSuccess("");
                    }}
                    className="flex items-center gap-1 bg-brand-orange hover:bg-brand-orange/95 text-white py-1.5 px-3 rounded-xl text-[10px] font-extrabold transition shadow-md shadow-brand-orange/10"
                  >
                    <Plus size={12} />
                    <span>Add Product</span>
                  </button>
                  <button
                    onClick={loadAdminProducts}
                    className="p-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-400 rounded-xl transition"
                    title="Refresh product list"
                  >
                    <RefreshCw size={14} className={adminProductLoading ? "animate-spin" : ""} />
                  </button>
                </div>
              </div>

              {adminProductLoading ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-bold animate-pulse">Loading products...</div>
              ) : adminProducts.length === 0 ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-medium border border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                  No products registered in database.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-zinc-655 dark:text-zinc-345 border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Product</th>
                        <th className="pb-3 pr-2">Category</th>
                        <th className="pb-3 pr-2">Price</th>
                        <th className="pb-3 pr-2">Stock</th>
                        <th className="pb-3 pr-2">Banner</th>
                        <th className="pb-3 pr-2">Active</th>
                        <th className="pb-3 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      {adminProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition">
                          <td className="py-3 pr-2 flex items-center gap-2">
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-zinc-100 dark:border-zinc-800 bg-zinc-50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=100"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="truncate max-w-[130px]">
                              <p className="font-bold text-zinc-808 dark:text-zinc-200 truncate">{p.name}</p>
                              <p className="text-[9px] text-zinc-400 truncate">{p.sku}</p>
                            </div>
                          </td>
                          <td className="py-3 pr-2 font-bold">{p.category?.name}</td>
                          <td className="py-3 pr-2 font-extrabold text-zinc-905 dark:text-white">{p.price} TK</td>
                          <td className="py-3 pr-2">{p.stockQuantity}</td>
                          <td className="py-3 pr-2">
                            <button
                              onClick={() => handleToggleBanner(p.id, p.isBanner)}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                p.isBanner
                                  ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"
                              }`}
                            >
                              {p.isBanner ? "YES" : "NO"}
                            </button>
                          </td>
                          <td className="py-3 pr-2">
                            <button
                              onClick={() => handleToggleProductActive(p.id, p.isActive)}
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                                p.isActive
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20"
                                  : "bg-rose-50 text-rose-600 dark:bg-rose-950/20"
                              }`}
                            >
                              {p.isActive ? "ACTIVE" : "DISABLED"}
                            </button>
                          </td>
                          <td className="py-3 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setShowAddProductForm(false);
                                setEditingProduct(p);
                                setProductError("");
                                setProductSuccess("");
                              }}
                              className="inline-flex items-center gap-0.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-750 dark:text-zinc-250 p-1 px-2.5 rounded-lg text-[9px] font-extrabold transition"
                            >
                              <Edit size={10} />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="inline-flex items-center gap-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 p-1 px-2.5 rounded-lg text-[9px] font-extrabold transition"
                              title="Delete Product"
                            >
                              <Trash2 size={10} />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Left/Right Action Editor Panels (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Form A: Add Product */}
              {showAddProductForm && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Upload New Product</h3>
                    <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Register a new product in the public catalog</p>
                  </div>

                  {productError && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-[10px] p-2.5 rounded-lg font-bold">
                      {productError}
                    </div>
                  )}

                  <form onSubmit={handleUploadProduct} className="space-y-3.5 text-xs font-bold">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Product Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Organic Wild Honey"
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Category</label>
                      <select
                        value={pCategoryId}
                        onChange={(e) => setPCategoryId(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                      >
                        <option value="">Select a Category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Price (TK)</label>
                        <input
                          type="number"
                          placeholder="e.g. 750"
                          value={pPrice}
                          onChange={(e) => setPPrice(e.target.value)}
                          required
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Compare At Price</label>
                        <input
                          type="number"
                          placeholder="e.g. 950"
                          value={pComparePrice}
                          onChange={(e) => setPComparePrice(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Initial Stock</label>
                        <input
                          type="number"
                          placeholder="e.g. 50"
                          value={pStock}
                          onChange={(e) => setPStock(e.target.value)}
                          required
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Product Image (Upload or URL)</label>
                      <div className="flex gap-2 items-center">
                        <label className="shrink-0 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer p-2 rounded-xl text-xs font-bold transition">
                          Upload Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageFileSelect(e, setPImageUrl)}
                          />
                        </label>
                        <input
                          type="text"
                          placeholder="Or paste image URL"
                          value={pImageUrl}
                          onChange={(e) => setPImageUrl(e.target.value)}
                          required
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange text-[10px] transition"
                        />
                      </div>
                      {pImageUrl && pImageUrl.startsWith("data:image") && (
                        <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓ Image loaded from memory</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Default Variant Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Size: Medium or Bottle: 250g"
                        value={pVariantName}
                        onChange={(e) => setPVariantName(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Product Description</label>
                      <textarea
                        placeholder="Detail details, extraction process, ingredients..."
                        value={pDescription}
                        onChange={(e) => setPDescription(e.target.value)}
                        rows={2}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white font-extrabold py-2.5 rounded-xl transition shadow-md shadow-brand-orange/10 active:scale-98 text-xs"
                    >
                      Upload Product & Variants
                    </button>
                  </form>
                </div>
              )}

              {/* Form B: Edit Product */}
              {editingProduct && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 p-6 rounded-3xl shadow-xs space-y-4 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                    <div>
                      <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white">Edit Product</h3>
                      <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">Modify parameters for active item</p>
                    </div>
                    <button
                      onClick={() => setEditingProduct(null)}
                      className="text-xs text-zinc-400 hover:text-zinc-600 font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  {productError && (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-[10px] p-2.5 rounded-lg font-bold">
                      {productError}
                    </div>
                  )}

                  <form onSubmit={handleSaveEditProduct} className="space-y-3.5 text-xs font-bold">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Product Name</label>
                      <input
                        type="text"
                        value={editingProduct.name}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Category</label>
                      <select
                        value={editingProduct.categoryId}
                        onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Price (TK)</label>
                        <input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                          required
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Compare At Price</label>
                        <input
                          type="number"
                          value={editingProduct.compareAtPrice || ""}
                          onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Product Code (SKU)</label>
                        <input
                          type="text"
                          value={editingProduct.sku || ""}
                          disabled
                          className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none text-zinc-500 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Stock Level</label>
                        <input
                          type="number"
                          value={editingProduct.stockQuantity}
                          onChange={(e) => setEditingProduct({ ...editingProduct, stockQuantity: e.target.value })}
                          required
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Product Description</label>
                      <textarea
                        value={editingProduct.description || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                        rows={3}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition resize-none"
                      />
                    </div>

                    {/* Additional Info for Show More */}
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wider">Show More – অতিরিক্ত তথ্য</label>
                      <textarea
                        value={editingProduct.additionalInfo || ""}
                        onChange={(e) => setEditingProduct({ ...editingProduct, additionalInfo: e.target.value })}
                        rows={3}
                        placeholder="যেমন: উপাদান, সাইজ চার্ট, যত্নের নির্দেশনা..."
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition resize-none text-xs"
                      />
                    </div>

                    {/* Extra Color Images for Show More */}
                    <div>
                      <div className="flex justify-between items-end mb-1">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Show More – অন্য কালারের ছবি (Upload or URL)</label>
                          <p className="text-[9px] text-zinc-400 mt-0.5">প্রতিটি URL আলাদা লাইনে লিখুন, অথবা সরাসরি আপলোড করুন</p>
                        </div>
                        <label className="shrink-0 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 cursor-pointer px-2 py-1 rounded-lg text-[9px] font-bold transition">
                          + Upload Image
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageFileSelect(e, (base64) => {
                              const current = editingProduct.extraImages || [];
                              setEditingProduct({ ...editingProduct, extraImages: [...current, base64] });
                            })}
                          />
                        </label>
                      </div>
                      <textarea
                        value={(editingProduct.extraImages || []).join("\n")}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            extraImages: e.target.value
                              .split("\n")
                              .map((u: string) => u.trim())
                              .filter((u: string) => u.length > 0),
                          })
                        }
                        rows={4}
                        placeholder={"https://example.com/red.jpg\nhttps://example.com/blue.jpg"}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition resize-none text-[10px] font-mono leading-tight whitespace-pre"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-white text-black border border-black hover:bg-zinc-100 font-extrabold py-2.5 rounded-xl transition active:scale-98 text-xs"
                    >
                      Save Catalog Updates
                    </button>
                  </form>
                </div>
              )}

              {/* Inactive Selector fallback panel */}
              {!showAddProductForm && !editingProduct && (
                <div className="py-20 text-center text-xs text-zinc-400 font-medium flex flex-col items-center gap-2 border border-dashed border-zinc-150 dark:border-zinc-850 rounded-3xl p-6 bg-white dark:bg-zinc-900/40">
                  <ClipboardList size={24} />
                  <span>Click **Add Product** at the top or **Edit** on a row to modify the catalog.</span>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ================================== TAB 3: COUPON MANAGER ================================== */}
        {activeTab === "COUPONS" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Generate Coupon Form */}
            <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-6 shadow-xs space-y-6">
              <div>
                <h2 className="text-sm font-extrabold text-zinc-805 dark:text-zinc-200">Create Discount Coupon</h2>
                <p className="text-[10px] text-zinc-400 mt-1 font-semibold">Define promotional campaign discount parameters</p>
              </div>

              {couponError && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-lg font-bold">
                  {couponError}
                </div>
              )}
              {couponSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-lg font-bold">
                  {couponSuccess}
                </div>
              )}

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. SPECIAL20"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none uppercase tracking-wide focus:border-brand-orange transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Discount Type</label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none focus:border-brand-orange transition"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (TK)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase">Value</label>
                    <input
                      type="number"
                      placeholder="e.g. 15"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase">Min Order</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={minCartAmount}
                      onChange={(e) => setMinCartAmount(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-zinc-500 mb-1.5 uppercase">Max Cap</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 outline-none focus:border-brand-orange transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Starts At</label>
                    <input
                      type="date"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:border-brand-orange transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Expires At</label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 focus:border-brand-orange transition outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Usage Limit (Max Uses)</label>
                  <input
                    type="number"
                    placeholder="e.g. 200 (Empty for unlimited)"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl p-2.5 outline-none focus:border-brand-orange transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white font-extrabold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1 shadow-lg shadow-brand-orange/10 active:scale-98"
                >
                  <Plus size={14} />
                  <span>Generate Code</span>
                </button>
              </form>
            </div>

            {/* Coupons List */}
            <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-extrabold text-zinc-805 dark:text-zinc-200">Active Campaign Coupons</h2>
                <button
                  onClick={loadCoupons}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 rounded-xl transition"
                >
                  <RefreshCw size={14} className={couponLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {couponLoading ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-bold animate-pulse">Loading coupons...</div>
              ) : coupons.length === 0 ? (
                <div className="py-20 text-center text-xs text-zinc-400 font-medium border border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                  No coupons registered in database yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-zinc-655 dark:text-zinc-345 border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-900 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="pb-3 pr-2">Code</th>
                        <th className="pb-3 pr-2">Discount</th>
                        <th className="pb-3 pr-2">Min Spend</th>
                        <th className="pb-3 pr-2">Usage</th>
                        <th className="pb-3 pr-2">Expires</th>
                        <th className="pb-3 pr-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                      {coupons.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 font-bold text-zinc-808 dark:text-zinc-200">{c.code}</td>
                          <td className="py-3">
                            {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `${c.discountValue} TK`}
                          </td>
                          <td className="py-3">{c.minCartAmount} TK</td>
                          <td className="py-3">
                            {c.usedCount} / {c.usageLimit || "∞"}
                          </td>
                          <td className="py-3 text-[10px] text-zinc-400">{new Date(c.expiresAt).toLocaleDateString()}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteCoupon(c.id)}
                              className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1.5 rounded-lg transition"
                              title="Delete Coupon"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================================== TAB 4: SYSTEM SETTINGS ================================== */}
        {activeTab === "SETTINGS" && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-900 rounded-3xl p-6 shadow-xs max-w-2xl">
            <div className="border-b border-zinc-155 dark:border-zinc-845 pb-4 mb-6">
              <h2 className="text-sm font-extrabold text-zinc-805 dark:text-zinc-200">Reconfigure Shipping Variables</h2>
              <p className="text-[10px] text-zinc-400 mt-1 font-semibold">Set rates inside/outside Dhaka and configure free shipping caps</p>
            </div>

            {settingsError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs p-3 rounded-xl font-bold mb-6">
                {settingsError}
              </div>
            )}
            {settingsSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl font-bold mb-6">
                {settingsSuccess}
              </div>
            )}

            {settingsLoading ? (
              <div className="py-20 text-center text-xs text-zinc-400 font-bold animate-pulse">Loading settings...</div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs font-bold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <Truck size={12} className="text-brand-orange" />
                      <span>Inside Dhaka Shipping Charge (TK)</span>
                    </label>
                    <input
                      type="number"
                      value={insideDhaka}
                      onChange={(e) => setInsideDhaka(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none focus:border-brand-orange transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <Truck size={12} className="text-brand-orange" />
                      <span>Outside Dhaka Shipping Charge (TK)</span>
                    </label>
                    <input
                      type="number"
                      value={outsideDhaka}
                      onChange={(e) => setOutsideDhaka(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none focus:border-brand-orange transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle size={12} className="text-brand-orange" />
                    <span>Free Shipping Cart Threshold (TK)</span>
                  </label>
                  <input
                    type="number"
                    value={freeThreshold}
                    onChange={(e) => setFreeThreshold(e.target.value)}
                    required
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl p-2.5 outline-none focus:border-brand-orange transition"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1 font-semibold leading-normal">Orders with subtotal values higher or equal to this amount will automatically receive 0 TK shipping fees.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} className="text-brand-orange" />
                      <span>Steadfast API Key</span>
                    </label>
                    <input
                      type="text"
                      value={steadfastApiKey}
                      onChange={(e) => setSteadfastApiKey(e.target.value)}
                      placeholder="e.g. qczyor8sv4rlo..."
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none focus:border-brand-orange transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={12} className="text-brand-orange" />
                      <span>Steadfast Secret Key</span>
                    </label>
                    <input
                      type="password"
                      value={steadfastSecretKey}
                      onChange={(e) => setSteadfastSecretKey(e.target.value)}
                      placeholder="e.g. mxmaz9jl3dn..."
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-2.5 outline-none focus:border-brand-orange transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-brand-orange hover:bg-brand-orange/95 text-white font-extrabold py-2.5 px-6 rounded-xl transition shadow-lg shadow-brand-orange/10 active:scale-98"
                >
                  Save Configuration
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
