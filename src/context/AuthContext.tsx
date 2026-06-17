"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { X, Lock, Mail, Phone, User, Key } from "lucide-react";

export interface UserType {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  role: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Modal specific state
  const [authMethod, setAuthMethod] = useState<"PASSWORD" | "OTP">("OTP"); // OTP or PASSWORD
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER">("LOGIN"); // LOGIN or REGISTER
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const refreshUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMsg("Please enter your Phone number or Email.");
      return;
    }
    setErrorMsg("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose: "LOGIN" }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        // For local testing convenience, show the code
        setSuccessMsg(`OTP Code generated: ${data.otpCode} (Logged to server console)`);
      } else {
        setErrorMsg(data.error || "Failed to send OTP.");
      }
    } catch (e) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMsg("Please enter the 6-digit OTP code.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowAuthModal(false);
        // Reset modal state
        setIdentifier("");
        setOtpCode("");
        setOtpSent(false);
      } else {
        setErrorMsg(data.error || "Invalid OTP code.");
      }
    } catch (e) {
      setErrorMsg("Verification error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg("Email/Phone and Password are required.");
      return;
    }
    setErrorMsg("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowAuthModal(false);
        setIdentifier("");
        setPassword("");
      } else {
        setErrorMsg(data.error || "Invalid login credentials.");
      }
    } catch (e) {
      setErrorMsg("Login error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!email && !phone) || !password) {
      setErrorMsg("Name, Password, and Email or Phone are required.");
      return;
    }
    setErrorMsg("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone_number: phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowAuthModal(false);
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
      } else {
        setErrorMsg(data.error || "Registration failed.");
      }
    } catch (e) {
      setErrorMsg("Registration error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, showAuthModal, setShowAuthModal, logout, refreshUser }}>
      {children}

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-900 overflow-hidden relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
                {authMode === "LOGIN" ? "Welcome Back" : "Create Account"}
              </h3>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                  setOtpSent(false);
                }}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Container */}
            <div className="p-6">
              {errorMsg && (
                <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-sm p-3 rounded-lg border border-rose-100 dark:border-rose-900/50 mb-4 font-medium">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-sm p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 mb-4 font-medium">
                  {successMsg}
                </div>
              )}

              {/* Mode Toggle (Login/Register) for Password, only if not verifying OTP */}
              {!otpSent && (
                <div className="flex border-b border-zinc-100 dark:border-zinc-900 mb-6">
                  <button
                    onClick={() => {
                      setAuthMode("LOGIN");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition ${
                      authMode === "LOGIN"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode("REGISTER");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition ${
                      authMode === "REGISTER"
                        ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-zinc-400 hover:text-zinc-600"
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* Method Switcher for Login */}
              {authMode === "LOGIN" && !otpSent && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg mb-6 text-xs font-semibold">
                  <button
                    onClick={() => setAuthMethod("OTP")}
                    className={`py-1.5 rounded-md text-center transition ${
                      authMethod === "OTP" ? "bg-white dark:bg-zinc-800 shadow text-indigo-600 dark:text-indigo-400" : "text-zinc-500"
                    }`}
                  >
                    OTP Sign In (SMS/Email)
                  </button>
                  <button
                    onClick={() => setAuthMethod("PASSWORD")}
                    className={`py-1.5 rounded-md text-center transition ${
                      authMethod === "PASSWORD" ? "bg-white dark:bg-zinc-800 shadow text-indigo-600 dark:text-indigo-400" : "text-zinc-500"
                    }`}
                  >
                    Password Login
                  </button>
                </div>
              )}

              {/* OTP Login Form */}
              {authMode === "LOGIN" && authMethod === "OTP" && (
                <div>
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Mobile Number or Email
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                            <Phone size={16} />
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. +88017XXXXXXXX or user@example.com"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 active:scale-98"
                      >
                        {actionLoading ? "Sending OTP..." : "Send OTP Verification Code"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Enter 6-Digit OTP Code
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                            <Key size={16} />
                          </span>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent tracking-widest text-center font-bold text-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-zinc-900 dark:text-white transition"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-600/10 active:scale-98"
                      >
                        {actionLoading ? "Verifying..." : "Verify & Log In"}
                      </button>
                      <div className="flex justify-between items-center text-xs">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          Change Phone/Email
                        </button>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        >
                          Resend Code
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Password Login Form */}
              {authMode === "LOGIN" && authMethod === "PASSWORD" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Email or Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Mail size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. admin@ecommerce.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 active:scale-98"
                  >
                    {actionLoading ? "Logging In..." : "Log In with Password"}
                  </button>
                  <p className="text-zinc-500 text-xs text-center">
                    Hint: Admin is <code className="bg-zinc-100 p-0.5 px-1 rounded">admin@ecommerce.com</code> / <code className="bg-zinc-100 p-0.5 px-1 rounded">admin123</code>
                  </p>
                </form>
              )}

              {/* Password Registration Form */}
              {authMode === "REGISTER" && (
                <form onSubmit={handlePasswordRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Habibur Rahman"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        placeholder="habib@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="+88017XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 active:scale-98"
                  >
                    {actionLoading ? "Registering..." : "Create Account"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
