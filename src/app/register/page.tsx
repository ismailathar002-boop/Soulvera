"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, UserRole } from "../../context/AuthContext";
import {
  Heart, Mail, Lock, Phone, User, Users, Sparkles,
  Camera, X, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle,
} from "lucide-react";

type AuthTab = "register" | "login";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, login } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("register");

  useEffect(() => {
    if (searchParams.get("tab") === "login") setActiveTab("login");
  }, [searchParams]);

  // ─── Register fields ───────────────────────────────────────
  const [role, setRole] = useState<UserRole>("individual");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [aboutMe, setAboutMe] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoName, setProfilePhotoName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Login fields ──────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ─── Forgot password ──────────────────────────────────────
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // ─── Shared ────────────────────────────────────────────────
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val.trim());

  // ─── Photo ─────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please select a valid image file (JPG, PNG, WEBP)."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image size must be under 5MB."); return; }
    setError("");
    setProfilePhotoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setProfilePhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setProfilePhotoName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Register submit ───────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) { setError("Please fill in all required fields."); return; }
    if (!isValidEmail(email)) { setEmailError("Please enter a valid email address (e.g. name@example.com)."); return; }
    setError(""); setLoading(true);
    try {
      await register(name, email, phone, role, password, aboutMe || undefined, profilePhoto || undefined);
      router.push("/profile-wizard");
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally { setLoading(false); }
  };

  // ─── Login submit ──────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) { setError("Please enter your email and password."); return; }
    setError(""); setLoading(true);
    try {
      const loggedUser = await login(loginEmail, loginPassword);
      router.push(loggedUser.role === "admin" ? "/admin" : "/dashboard");
    } catch (err: any) {
      const msg = err.message || "";
      if (msg === "Failed to fetch" || msg.includes("NetworkError") || msg.includes("fetch")) {
        setError("Could not connect to server. Please make sure the backend is running.");
      } else {
        setError(msg || "Login failed. Please check your credentials.");
      }
    } finally { setLoading(false); }
  };

  // ─── Forgot password submit ────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true); setForgotMsg(null);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setForgotMsg({ text: data.message || "Reset email sent!", ok: data.success });
    } catch {
      setForgotMsg({ text: "Could not connect to server. Is the backend running?", ok: false });
    } finally { setForgotLoading(false); }
  };

  const showPersonalFields = role === "individual" || role === "family";

  const InputBase = "w-full bg-white/80 border border-stone-200 rounded-2xl px-4 py-3 pl-11 text-sm font-medium focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-none transition-all placeholder:text-stone-300";

  return (
    <div className="min-h-screen bg-mesh flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-200/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gradient-to-br from-rose-50/30 to-pink-50/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200 group-hover:shadow-rose-300 transition-all group-hover:-translate-y-0.5">
              <Heart size={18} className="text-white fill-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-2 border-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            <span className="gradient-text">Soul</span>
            <span className="text-stone-800">vera</span>
          </span>
        </Link>
        <p className="mt-3 text-stone-500 text-sm font-medium">
          {activeTab === "register" ? "Start your journey to forever" : "Welcome back, your match awaits"}
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        {/* ── Tabs ──────────────────────────────────────────── */}
        <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 mb-5 border border-white/80 shadow-sm">
          {(["register", "login"] as AuthTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => { setActiveTab(tab); setError(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-200"
                  : "text-stone-500 hover:text-rose-600 hover:bg-rose-50/60"
              }`}
            >
              {tab === "register" ? <Sparkles size={15} /> : <Heart size={15} />}
              {tab === "register" ? "Create Account" : "Sign In"}
            </button>
          ))}
        </div>

        {/* ── Card ──────────────────────────────────────────── */}
        <div className="glass border border-white/60 py-8 px-5 sm:px-8 rounded-3xl shadow-[0_24px_80px_rgba(225,29,72,0.12)]">

          {/* Error banner */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-rose-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              REGISTER TAB
              ═══════════════════════════════════════════════ */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="text-center mb-1">
                <h2 className="heading-section text-2xl text-stone-900 mb-1">Create your account</h2>
                <p className="text-sm text-stone-500">Join thousands of verified profiles</p>
              </div>

              {/* Role cards */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 block">
                  Registering As
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "individual", icon: User, label: "Individual", sub: "My own search" },
                    { value: "family",     icon: Users, label: "Family",     sub: "For child/sibling" },
                    { value: "matchmaker", icon: Heart, label: "Matchmaker", sub: "Manage clients" },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value as UserRole)}
                      className={`flex flex-col items-center gap-1.5 p-3 border rounded-2xl text-center transition-all ${
                        role === r.value
                          ? "border-rose-400 bg-gradient-to-b from-rose-50 to-pink-50 ring-2 ring-rose-300/50 shadow-md"
                          : "border-stone-200 bg-white/60 hover:border-rose-200 hover:bg-rose-50/40"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${role === r.value ? "bg-gradient-to-br from-rose-500 to-pink-500" : "bg-stone-100"}`}>
                        <r.icon size={14} className={role === r.value ? "text-white" : "text-stone-400"} />
                      </div>
                      <span className={`font-bold text-xs ${role === r.value ? "text-rose-700" : "text-stone-700"}`}>{r.label}</span>
                      <span className="text-[10px] text-stone-400 leading-tight">{r.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo upload */}
              {showPersonalFields && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 block">
                    Profile Photo <span className="text-stone-300 font-normal normal-case">(Optional)</span>
                  </label>
                  {!profilePhoto ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center transition-colors">
                        <Camera size={20} className="text-rose-500" />
                      </div>
                      <p className="text-sm font-bold text-rose-600">Click to upload photo</p>
                      <p className="text-xs text-stone-400">JPG, PNG, WEBP · Max 5MB</p>
                    </button>
                  ) : (
                    <div className="flex items-center gap-4 p-4 bg-white/80 border border-rose-100 rounded-2xl">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-rose-200 shadow-md flex-shrink-0">
                        <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-stone-800 truncate">{profilePhotoName}</p>
                        <p className="text-xs text-emerald-600 font-medium mt-0.5 flex items-center gap-1"><CheckCircle size={12} /> Photo uploaded</p>
                      </div>
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-rose-500 hover:underline">Change</button>
                        <button type="button" onClick={handleRemovePhoto} className="text-xs font-semibold text-stone-400 hover:text-red-500">Remove</button>
                      </div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
              )}

              {/* Full Name */}
              <div>
                <label htmlFor="reg-name" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                  {role === "matchmaker" ? "Company / Matchmaker Name" : "Full Name"}
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input id="reg-name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ayesha Khan" className={InputBase} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input
                    id="reg-email" type="email" autoComplete="email" required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                    onBlur={(e) => {
                      if (e.target.value && !isValidEmail(e.target.value))
                        setEmailError("Please enter a valid email address (e.g. name@example.com).");
                      else setEmailError("");
                    }}
                    placeholder="name@example.com"
                    className={`${InputBase} ${emailError ? "border-rose-400 focus:ring-rose-400" : ""}`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle size={11} /> {emailError}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="reg-phone" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">Phone Number</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input id="reg-phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567" className={InputBase} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="reg-password" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                  <input id="reg-password" type={showPassword ? "text" : "password"} required
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" className={`${InputBase} pr-11`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-rose-400 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* About Me */}
              {showPersonalFields && (
                <div>
                  <label htmlFor="reg-aboutMe" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">
                    About Me <span className="text-stone-300 font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    id="reg-aboutMe" rows={3} value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}
                    placeholder={role === "family"
                      ? "Describe your family member — background, values, and what you're looking for..."
                      : "Describe yourself — personality, hobbies, values, and what you're looking for in a life partner..."}
                    className="w-full bg-white/80 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-none transition-all placeholder:text-stone-300 resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-stone-400 mt-1.5">{aboutMe.length}/500 characters</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-200">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating Account...</>
                ) : (
                  <><Sparkles size={16} />Create Account & Continue</>
                )}
              </button>

              <p className="text-center text-sm text-stone-500">
                Already have an account?{" "}
                <button type="button" onClick={() => { setActiveTab("login"); setError(""); }}
                  className="font-bold text-rose-600 hover:underline">Sign in here</button>
              </p>
            </form>
          )}

          {/* ═══════════════════════════════════════════════
              LOGIN TAB
              ═══════════════════════════════════════════════ */}
          {activeTab === "login" && (
            <>
              {showForgot ? (
                <div className="space-y-5">
                  <div>
                    <button
                      type="button"
                      onClick={() => { setShowForgot(false); setForgotMsg(null); setForgotEmail(""); }}
                      className="text-xs text-stone-400 hover:text-rose-500 flex items-center gap-1.5 mb-4 font-semibold transition-colors"
                    >
                      <ArrowLeft size={13} /> Back to Sign In
                    </button>
                    <h2 className="heading-section text-2xl text-stone-900 mb-1">Forgot Password?</h2>
                    <p className="text-sm text-stone-500">Enter your email and we&apos;ll send a reset link.</p>
                  </div>

                  {forgotMsg && (
                    <div className={`flex items-start gap-3 p-4 rounded-2xl border text-sm font-medium ${
                      forgotMsg.ok
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-rose-50 border-rose-200 text-rose-700"
                    }`}>
                      {forgotMsg.ok ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5" /> : <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />}
                      {forgotMsg.text}
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                      <input
                        id="forgot-email" type="email" required value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="name@example.com" className={InputBase}
                      />
                    </div>
                    <button type="submit" disabled={forgotLoading}
                      className="w-full bg-gradient-to-r from-rose-600 to-pink-500 text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-60">
                      {forgotLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</> : "Send Reset Link"}
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="text-center mb-1">
                    <h2 className="heading-section text-2xl text-stone-900 mb-1">Welcome back</h2>
                    <p className="text-sm text-stone-500">Sign in to continue your journey</p>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 block">Email Address</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                      <input id="login-email" type="email" autoComplete="email" required
                        value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="name@example.com" className={InputBase} />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-stone-400">Password</label>
                      <button type="button"
                        onClick={() => { setShowForgot(true); setError(""); setForgotEmail(loginEmail); }}
                        className="text-xs font-bold text-rose-500 hover:underline">
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                      <input id="login-password" type={showLoginPassword ? "text" : "password"} required
                        value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••" className={`${InputBase} pr-11`} />
                      <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-rose-400 transition-colors">
                        {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-rose-200">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</>
                    ) : (
                      <><Heart size={15} className="fill-white" />Sign In</>
                    )}
                  </button>

                  <p className="text-center text-sm text-stone-500">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => { setActiveTab("register"); setError(""); }}
                      className="font-bold text-rose-600 hover:underline">Create one here</button>
                  </p>

                  <div className="text-center">
                    <Link href="/" className="text-xs text-stone-400 hover:text-rose-500 transition-colors inline-flex items-center gap-1 font-medium">
                      <ArrowLeft size={11} /> Back to home
                    </Link>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
