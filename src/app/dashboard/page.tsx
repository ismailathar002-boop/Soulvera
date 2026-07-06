"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, User } from "../../context/AuthContext";
import Header from "../../components/Header";
import {
  Heart, Search, MessageCircle, Star, ChevronRight,
  Users, Crown, Sparkles, Send, Inbox, CheckCircle,
  UserCircle, Edit3, X,
} from "lucide-react";

function StatCard({ icon: Icon, value, label, color }: { icon: React.ElementType; value: number | string; label: string; color: string }) {
  return (
    <div className="glass border border-white/60 rounded-3xl p-5 flex flex-col gap-2 hover:shadow-lg hover:-translate-y-1 transition-all">
      <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      <div className="text-2xl font-black text-stone-800" style={{ fontFamily: "var(--font-display)" }}>{value}</div>
      <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">{label}</div>
    </div>
  );
}

function QuickLink({ href, icon: Icon, label, badge }: { href: string; icon: React.ElementType; label: string; badge?: string | number }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between p-4 bg-white/70 hover:bg-rose-50 border border-stone-100 hover:border-rose-200 rounded-2xl transition-all hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-50 group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-pink-500 flex items-center justify-center transition-all">
          <Icon size={16} className="text-rose-500 group-hover:text-white transition-colors" />
        </div>
        <span className="text-sm font-bold text-stone-700 group-hover:text-rose-700 transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge !== undefined && Number(badge) > 0 && (
          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">{badge}</span>
        )}
        <ChevronRight size={15} className="text-stone-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { user, allProfiles, logout, respondProposal, loading: authLoading } = useAuth();
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientRole, setNewClientRole] = useState<"individual" | "family">("individual");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    else if (user && !user.profileCreated && user.role !== "matchmaker") router.push("/profile-wizard");
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Loading session...</p>
        </div>
      </div>
    );
  }

  const proposalsReceived = user.proposals ? user.proposals.filter((p) => p.targetUserId === user.id) : [];
  const proposalsSent = user.proposals ? user.proposals.filter((p) => p.senderId === user.id) : [];
  const pendingReceived = proposalsReceived.filter((p) => p.status === "pending");
  const acceptedMatches = user.proposals ? user.proposals.filter((p) => p.status === "accepted") : [];

  const myGender = user.profileData?.gender || "Male";
  const partnerGender = myGender === "Male" ? "Female" : "Male";
  const recommendedMatches = allProfiles.filter(
    (p) => p.profileCreated && p.profileData?.gender === partnerGender && p.id !== user.id
  ).slice(0, 3);

  const matchmakerClients = allProfiles.filter((p) => p.id !== user.id && p.role !== "matchmaker").slice(0, 4);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;
    setSuccessMsg(`Client ${newClientName} successfully registered! Reference ID: SV-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewClientName(""); setNewClientEmail(""); setNewClientPhone("");
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

        {/* ── Welcome Banner ─────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 p-7 sm:p-9 mb-8 shadow-xl shadow-rose-200">
          {/* Decorative */}
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full" />
          <div className="absolute -right-4 top-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-white/5 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-white/70" />
                <span className="text-white/70 text-xs font-bold uppercase tracking-widest">Your Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Salaam, {user.name} 🌹
              </h1>
              <p className="text-white/75 text-sm max-w-xl leading-relaxed">
                Welcome to your matchmaking hub. Your perfect match could be just one proposal away.
              </p>
              <div className="mt-3 inline-block bg-white/20 text-white/90 text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20">
                Profile ID: {user.id}
              </div>
            </div>
            <Link
              href="/profile-wizard"
              className="flex-shrink-0 flex items-center gap-2 bg-white text-rose-600 font-bold text-sm px-5 py-3 rounded-2xl hover:bg-rose-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Edit3 size={14} />
              Edit Profile
            </Link>
          </div>
        </div>

        {user.role === "matchmaker" ? (
          /* ═══════════════════════════════════════════════
             MATCHMAKER LAYOUT
             ═══════════════════════════════════════════════ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Users, value: 12, label: "Total Clients", color: "from-rose-500 to-pink-500" },
                  { icon: Heart, value: 5, label: "Introductions", color: "from-violet-500 to-purple-500" },
                  { icon: CheckCircle, value: 2, label: "Matches Married", color: "from-emerald-500 to-teal-500" },
                ].map((s) => <StatCard key={s.label} {...s} />)}
              </div>

              {/* Client roster */}
              <div className="glass border border-white/60 rounded-3xl p-6">
                <h3 className="heading-section text-lg text-stone-900 mb-5 flex items-center gap-2">
                  <Users size={18} className="text-rose-500" /> Client Directory
                </h3>
                <div className="divide-y divide-stone-100">
                  {matchmakerClients.map((client) => (
                    <div key={client.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                          <UserCircle size={20} className="text-rose-400" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-stone-800">{client.name}</div>
                          <div className="text-xs text-stone-400 mt-0.5">
                            ID: {client.id} · {client.profileData?.age} yrs · {client.profileData?.city}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/profile/${client.id}`}
                          className="px-4 py-2 border border-stone-200 hover:border-rose-300 hover:bg-rose-50 rounded-xl text-xs font-bold transition-all">
                          View File
                        </Link>
                        <button className="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-xs font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm">
                          Propose Match
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Register client form */}
            <div>
              <div className="glass border border-white/60 rounded-3xl p-6">
                <h3 className="heading-section text-lg text-stone-900 mb-5 flex items-center gap-2">
                  <Sparkles size={18} className="text-rose-500" /> Register New Client
                </h3>
                {successMsg && (
                  <div className="mb-4 flex items-start gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-emerald-700 text-xs font-medium">
                    <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />{successMsg}
                  </div>
                )}
                <form onSubmit={handleAddClient} className="space-y-4">
                  {[
                    { label: "Client Full Name", type: "text", value: newClientName, onChange: setNewClientName, placeholder: "e.g. Zayn Malik", required: true },
                    { label: "Client Email", type: "email", value: newClientEmail, onChange: setNewClientEmail, placeholder: "client@gmail.com", required: true },
                    { label: "Client Phone", type: "tel", value: newClientPhone, onChange: setNewClientPhone, placeholder: "+92 300 0000000", required: false },
                  ].map(({ label, type, value, onChange, placeholder, required }) => (
                    <div key={label}>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">{label}</label>
                      <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                        className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 focus:outline-none transition-all placeholder:text-stone-300" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">Account Type</label>
                    <select value={newClientRole} onChange={(e) => setNewClientRole(e.target.value as any)}
                      className="w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 focus:outline-none transition-all">
                      <option value="individual">Client Managed (Individual)</option>
                      <option value="family">Family Managed (Parents/Guardian)</option>
                    </select>
                  </div>
                  <button type="submit"
                    className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-xl transition-all shadow-md">
                    Add Client to Directory
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════
             INDIVIDUAL / FAMILY LAYOUT
             ═══════════════════════════════════════════════ */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard icon={Inbox} value={proposalsReceived.length} label="Received" color="from-rose-500 to-pink-500" />
                <StatCard icon={Send} value={proposalsSent.length} label="Sent" color="from-violet-500 to-purple-500" />
                <StatCard icon={Heart} value={acceptedMatches.length} label="Matches" color="from-emerald-500 to-teal-500" />
              </div>

              {/* Profile callout */}
              <div className="glass border border-white/60 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <UserCircle size={22} className="text-rose-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-800">Matrimonial Profile Settings</h4>
                    <p className="text-xs text-stone-500 mt-0.5">Your profile is live. Keep your details up to date for better matches.</p>
                  </div>
                </div>
                <Link href="/profile-wizard"
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-2 border-rose-400 text-rose-600 hover:bg-rose-500 hover:text-white rounded-2xl text-xs font-bold transition-all">
                  <Edit3 size={13} /> Edit Profile
                </Link>
              </div>

              {/* Recommended profiles */}
              <div className="glass border border-white/60 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="heading-section text-lg text-stone-900 flex items-center gap-2">
                    <Sparkles size={17} className="text-rose-500" /> Recommended Profiles
                  </h3>
                  <Link href="/search" className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1">
                    View All <ChevronRight size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {recommendedMatches.length > 0 ? (
                    recommendedMatches.map((profile) => (
                      <div key={profile.id}
                        className="bg-gradient-to-b from-white to-rose-50/40 border border-rose-100 rounded-2xl p-4 text-center hover:border-rose-300 hover:shadow-md hover:-translate-y-1 transition-all">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                          {profile.profileData?.photoUrl ? (
                            <img src={profile.profileData.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle size={28} className="text-rose-300" />
                          )}
                        </div>
                        <div className="text-xs font-bold text-stone-800 truncate">{profile.name}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5 mb-3">
                          {profile.profileData?.age} yrs · {profile.profileData?.city}
                        </div>
                        <Link href={`/profile/${profile.id}`}
                          className="block w-full py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-[10px] font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-sm">
                          View Profile
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-8 text-stone-400 text-sm">
                      <Search size={32} className="mx-auto mb-2 text-stone-200" />
                      No suggestions found. <Link href="/search" className="text-rose-500 font-bold hover:underline">Browse profiles</Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending proposals */}
              <div className="glass border border-white/60 rounded-3xl p-6">
                <h3 className="heading-section text-lg text-stone-900 mb-5 flex items-center gap-2">
                  <Heart size={17} className="text-rose-500" /> Recent Proposals
                  {pendingReceived.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-black rounded-full">{pendingReceived.length}</span>
                  )}
                </h3>

                <div className="divide-y divide-stone-100">
                  {pendingReceived.length > 0 ? (
                    pendingReceived.map((prop) => (
                      <div key={prop.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-sm">
                            <Heart size={14} className="text-white fill-white" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-stone-800">Proposal from {prop.senderName}</div>
                            <div className="text-xs text-stone-400 mt-0.5">
                              {new Date(prop.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => respondProposal(prop.id, "accepted")}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:from-rose-600 hover:to-pink-600 transition-all">
                            <CheckCircle size={12} /> Accept
                          </button>
                          <button onClick={() => respondProposal(prop.id, "rejected")}
                            className="flex items-center gap-1.5 border border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50 px-4 py-2 rounded-xl text-xs font-semibold transition-all">
                            <X size={12} /> Ignore
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-stone-400 text-sm">
                      <Heart size={32} className="mx-auto mb-2 text-stone-200" />
                      No pending proposals. Make sure your profile is fully complete!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right sidebar ───────────────────────────── */}
            <div className="space-y-5">
              {/* Quick links */}
              <div className="glass border border-white/60 rounded-3xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">Quick Navigation</h3>
                <div className="space-y-2">
                  <QuickLink href="/search" icon={Search} label="Search & Browse" />
                  <QuickLink href="/proposals" icon={Heart} label="My Proposals" badge={proposalsReceived.length + proposalsSent.length} />
                  <QuickLink href="/messages" icon={MessageCircle} label="Messages" />
                  <QuickLink href="/pricing" icon={Crown} label="Premium Membership" />
                </div>
              </div>

              {/* Shortlist */}
              <div className="glass border border-white/60 rounded-3xl p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
                  My Shortlist
                </h3>
                <div className="space-y-3">
                  {user.shortlist && user.shortlist.length > 0 ? (
                    user.shortlist.map((shortId) => {
                      const shortProfile = allProfiles.find((p) => p.id === shortId);
                      if (!shortProfile) return null;
                      return (
                        <div key={shortId} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {shortProfile.profileData?.photoUrl ? (
                                <img src={shortProfile.profileData.photoUrl} alt={shortProfile.name} className="w-full h-full object-cover" />
                              ) : (
                                <Heart size={14} className="text-rose-400 fill-rose-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-stone-800">{shortProfile.name}</div>
                              <div className="text-[10px] text-stone-400">{shortProfile.profileData?.city}</div>
                            </div>
                          </div>
                          <Link href={`/profile/${shortId}`}
                            className="text-[10px] font-bold text-rose-500 hover:underline flex-shrink-0">
                            View
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-5 text-stone-400 text-xs">
                      <Star size={24} className="mx-auto mb-2 text-stone-200" />
                      Shortlisted profiles will appear here.
                    </div>
                  )}
                </div>
              </div>

              {/* Premium CTA */}
              <div className="rounded-3xl bg-gradient-to-br from-rose-600 to-pink-600 p-5 relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                <Crown size={24} className="text-white/80 mb-3 relative z-10" />
                <h4 className="text-white font-bold text-sm mb-1 relative z-10">Upgrade to Premium</h4>
                <p className="text-white/70 text-xs mb-4 relative z-10">Get verified badge, priority matches & unlimited proposals.</p>
                <Link href="/pricing"
                  className="relative z-10 block text-center bg-white text-rose-600 text-xs font-bold py-2.5 rounded-xl hover:bg-rose-50 transition-colors shadow-md">
                  See Plans
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
