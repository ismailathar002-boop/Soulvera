"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  Heart, Bell, ChevronDown, User, MessageCircle,
  LogOut, Shield, Menu, X, Sparkles, Search, CheckCircle,
} from "lucide-react";

const API = "http://localhost:5000/api";

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [mounted, setMounted] = useState(false);

  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close profile dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // fetch notifications
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("soulvera_token");
    if (!token) return;
    fetch(`${API}/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUnread(d.unreadCount || 0);
          setNotifications(d.notifications || []);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/register");
  };

  // Mark a notification as read and navigate
  const handleNotifClick = (n: Notification) => {
    // Mark as read locally
    setNotifications((prev) =>
      prev.map((item) => item.id === n.id ? { ...item, read: true } : item)
    );
    setUnread((prev) => (n.read ? prev : Math.max(0, prev - 1)));

    // Best-effort API call to mark as read
    const token = localStorage.getItem("soulvera_token");
    if (token) {
      fetch(`${API}/notifications/${n.id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }

    // Navigate based on message content
    const msg = n.message.toLowerCase();
    let dest = "/dashboard";
    if (msg.includes("proposal") || msg.includes("accept") || msg.includes("reject") || msg.includes("declined")) {
      dest = "/proposals";
    } else if (msg.includes("message") || msg.includes("chat")) {
      dest = "/messages";
    } else if (msg.includes("match") || msg.includes("profile")) {
      dest = "/search";
    }

    setNotifOpen(false);
    router.push(dest);
  };

  const isActive = (href: string) => pathname === href;
  const isAdmin = user?.role === "admin";

  const navLinks = user
    ? isAdmin
      ? [{ href: "/admin", label: "Admin Panel" }]
      : [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/search", label: "Search" },
          { href: "/proposals", label: "Proposals" },
          { href: "/messages", label: "Messages" },
        ]
    : [
        { href: "/", label: "Home" },
        { href: "/pricing", label: "Pricing" },
      ];

  const profileLinks = isAdmin
    ? [{ icon: Shield, label: "Admin Panel", href: "/admin" }]
    : [
        { icon: User, label: "My Profile", href: `/profile/${user?.id}` },
        { icon: Search, label: "Find Matches", href: "/search" },
        { icon: MessageCircle, label: "Messages", href: "/messages" },
      ];

  // Notification portal — renders directly into document.body,
  // bypassing any stacking context from parent elements.
  const notifPortal = mounted && notifOpen && user
    ? createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setNotifOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 9998 }}
          />
          {/* Panel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 72,
              right: 20,
              width: 320,
              zIndex: 9999,
              background: "white",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              border: "1px solid #fce7f3",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "linear-gradient(to right,#fff1f2,#fce7f3)", borderBottom: "1px solid #fce7f3" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Bell size={14} color="#e11d48" />
                <span style={{ fontWeight: 700, fontSize: 14, color: "#1c1917" }}>Notifications</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {unread > 0 && (
                  <span style={{ background: "#e11d48", color: "white", borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                    {unread} new
                  </span>
                )}
                <button type="button" onClick={() => setNotifOpen(false)} style={{ color: "#9ca3af", cursor: "pointer", background: "none", border: "none", padding: 0, lineHeight: 0 }}>
                  <X size={14} />
                </button>
              </div>
            </div>
            <div style={{ maxHeight: 288, overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center" }}>
                  <CheckCircle size={28} color="#e5e7eb" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500 }}>You&apos;re all caught up!</p>
                  <p style={{ fontSize: 10, color: "#d1d5db", marginTop: 4 }}>No new notifications</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotifClick(n)}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #fafafa",
                      background: n.read ? "white" : "#fff8f8",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#fff1f2"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.read ? "white" : "#fff8f8"; }}
                  >
                    <div style={{ display: "flex", gap: 8 }}>
                      {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e11d48", flexShrink: 0, marginTop: 5 }} />}
                      <div>
                        <p style={{ fontSize: 12, color: "#374151", fontWeight: 500, lineHeight: 1.5 }}>{n.message}</p>
                        {n.created_at && (
                          <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 4 }}>
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>,
        document.body
      )
    : null;

  return (
    <>
      {notifPortal}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(225,29,72,0.08)] border-b border-rose-100/50"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[70px]">

            {/* Logo */}
            <Link href={user ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-200 group-hover:shadow-rose-300 transition-all">
                  <Heart size={17} className="text-white fill-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full border-2 border-white" />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                <span className="gradient-text">Soul</span>
                <span className="text-stone-800">vera</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.href)
                      ? "text-rose-600 bg-rose-50"
                      : "text-stone-600 hover:text-rose-600 hover:bg-rose-50/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Right */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {/* Bell button — stopPropagation prevents outside-click race */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotifOpen((prev) => !prev);
                      setProfileOpen(false);
                    }}
                    className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-50 transition-colors"
                  >
                    <Bell size={17} className="text-stone-500" />
                    {unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-gradient-to-br from-rose-500 to-pink-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center pointer-events-none">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </button>

                  {/* Profile dropdown */}
                  <div className="relative" ref={dropRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen((prev) => !prev);
                        setNotifOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border border-rose-100 bg-white hover:bg-rose-50 hover:border-rose-200 transition-all"
                    >
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs font-bold leading-none">
                          {user.name?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-stone-700 max-w-[90px] truncate">{user.name}</span>
                      <ChevronDown size={13} className={`text-stone-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                    </button>

                    {profileOpen && (
                      <div className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-2xl shadow-[0_20px_60px_rgba(225,29,72,0.14)] border border-rose-100 overflow-hidden z-50">
                        <div className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 border-b border-rose-100">
                          <p className="font-bold text-sm text-stone-800 truncate">{user.name}</p>
                          <p className="text-xs text-stone-500 truncate mt-0.5">{user.email}</p>
                          <span className="mt-2 inline-block badge-primary">{user.role}</span>
                        </div>
                        <div className="p-2">
                          {profileLinks.map(({ icon: Icon, label, href }) => (
                            <Link
                              key={href}
                              href={href}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              <Icon size={15} className="text-rose-400 flex-shrink-0" />
                              {label}
                            </Link>
                          ))}
                          <hr className="my-1.5 border-rose-50" />
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <LogOut size={15} className="flex-shrink-0" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/register?tab=login" className="px-4 py-2 text-sm font-semibold text-stone-600 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50">
                    Sign In
                  </Link>
                  <Link href="/register" className="btn-primary flex items-center gap-1.5 text-sm py-2 px-5">
                    <Sparkles size={14} />
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-rose-50 transition-colors"
            >
              {menuOpen ? <X size={18} className="text-rose-600" /> : <Menu size={18} className="text-stone-600" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-rose-100 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    isActive(link.href) ? "bg-rose-50 text-rose-600" : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-rose-100 my-2" />
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">{user.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-stone-800">{user.name}</p>
                      <p className="text-xs text-stone-400 capitalize">{user.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/register" onClick={() => setMenuOpen(false)} className="block btn-primary text-center text-sm py-3 mx-0">
                  Get Started Free
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
