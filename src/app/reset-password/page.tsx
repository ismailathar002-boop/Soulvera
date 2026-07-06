"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Heart, Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const uid = searchParams.get("uid") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !uid) setError("Invalid or missing reset link. Please request a new one.");
  }, [token, uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, uid, password }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => router.push("/register?tab=login"), 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch { setError("Could not connect to server. Please try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-200/15 rounded-full blur-3xl -z-10" />

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200">
              <Heart size={18} className="text-white fill-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            <span className="gradient-text">Soul</span><span className="text-stone-800">vera</span>
          </span>
        </Link>
        <p className="mt-3 text-stone-500 text-sm">Secure password reset</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass border border-white/60 py-8 px-5 sm:px-8 rounded-3xl shadow-[0_24px_80px_rgba(225,29,72,0.12)]">
          {success ? (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle size={36} className="text-white" />
              </div>
              <h2 className="heading-section text-2xl text-stone-900">Password Reset!</h2>
              <p className="text-sm text-stone-500 max-w-xs mx-auto">
                Your password has been updated successfully. Redirecting to sign in...
              </p>
              <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <Link href="/register?tab=login" className="inline-block text-xs font-bold text-rose-600 hover:underline">
                Click here if not redirected
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                  <Lock size={24} className="text-rose-500" />
                </div>
                <h2 className="heading-section text-2xl text-stone-900 mb-1">Set New Password</h2>
                <p className="text-sm text-stone-500">Choose a strong new password for your account.</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                  <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="text-rose-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input id="new-password" type={showPw ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-white/80 border border-stone-200 rounded-2xl px-4 py-3 pl-11 pr-11 text-sm font-medium focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-none transition-all" />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-rose-400 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input id="confirm-password" type={showCpw ? "text" : "password"} required
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full bg-white/80 border border-stone-200 rounded-2xl px-4 py-3 pl-11 pr-11 text-sm font-medium focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-none transition-all" />
                  <button type="button" onClick={() => setShowCpw(!showCpw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-rose-400 transition-colors">
                    {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading || !token || !uid}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-60 hover:-translate-y-0.5">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting...</>
                ) : (
                  <><CheckCircle size={16} />Reset Password</>
                )}
              </button>

              <div className="text-center">
                <Link href="/register?tab=login" className="text-xs text-stone-400 hover:text-rose-500 transition-colors inline-flex items-center gap-1 font-medium">
                  <ArrowLeft size={11} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

