"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { X, Lock, Mail, Phone, User, Key, MapPin } from "lucide-react";

export interface UserType {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  address: string | null;
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
  const [authMethod, setAuthMethod] = useState<"PASSWORD" | "OTP">("PASSWORD"); // OTP or PASSWORD
  const [authMode, setAuthMode] = useState<"LOGIN" | "REGISTER" | "FORGOT_PASSWORD">("LOGIN"); // LOGIN, REGISTER, FORGOT_PASSWORD
  const [identifier, setIdentifier] = useState(""); // phone
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSent && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpSent, countdown]);

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
      setErrorMsg("Please enter your Phone number.");
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
        setCountdown(120);
        // Show code in UI so user can test without SMS API
        setSuccessMsg(`OTP sent to your mobile. You have 2 minutes to enter it.`);
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

  const handleSendResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) {
      setErrorMsg("Please enter your Phone number.");
      return;
    }
    setErrorMsg("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, purpose: "RESET_PASSWORD" }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCountdown(120);
        setSuccessMsg(`Reset OTP sent to your mobile. You have 2 minutes to enter it.`);
      } else {
        setErrorMsg(data.error || "Failed to send reset OTP.");
      }
    } catch (e) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !otpCode || !password) {
      setErrorMsg("Phone number, OTP, and New Password are required.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otpCode, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Password reset successfully! You can now log in.");
        setTimeout(() => {
          setAuthMode("LOGIN");
          setOtpSent(false);
          setPassword("");
          setOtpCode("");
          setSuccessMsg("");
        }, 2000);
      } else {
        setErrorMsg(data.error || "Failed to reset password.");
      }
    } catch (e) {
      setErrorMsg("Reset error. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setErrorMsg("Phone number and Password are required.");
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
    if (!name || !phone || !password || !address || !confirmPassword) {
      setErrorMsg("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setErrorMsg("");
    setActionLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone_number: phone, password, address }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowAuthModal(false);
        setName("");
        setAddress("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
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
                {authMode === "LOGIN" ? "Welcome Back" : authMode === "REGISTER" ? "Create Account" : "Reset Password"}
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
                      setConfirmPassword("");
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
                      setConfirmPassword("");
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





              {/* Password Login Form */}
              {authMode === "LOGIN" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. 01711111111"
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
                  <div className="flex justify-end mt-1 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("FORGOT_PASSWORD");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/10 active:scale-98"
                  >
                    {actionLoading ? "Logging In..." : "Log In with Password"}
                  </button>

                </form>
              )}

              {/* Forgot Password Form */}
              {authMode === "FORGOT_PASSWORD" && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendResetOTP} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                            <Phone size={16} />
                          </span>
                          <input
                            type="text"
                            placeholder="e.g. 01711111111"
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
                        {actionLoading ? "Sending OTP..." : "Send Reset OTP"}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          6-Digit OTP Code
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                            <Key size={16} />
                          </span>
                          <input
                            type="text"
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition text-center tracking-widest font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                          New Password
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
                        {actionLoading ? "Resetting..." : "Reset Password"}
                      </button>
                    </form>
                  )}
                  <div className="text-center mt-4">
                    <button
                      onClick={() => {
                        setAuthMode("LOGIN");
                        setOtpSent(false);
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 font-semibold"
                    >
                      Back to Login
                    </button>
                  </div>
                </div>
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
                      Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Phone size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="01711111111"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-transparent focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-zinc-900 dark:text-white transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Full Delivery Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <MapPin size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="House No, Road No, Area, City"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
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
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-400">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
