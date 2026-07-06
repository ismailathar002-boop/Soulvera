"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import {
  Shield, Users, BarChart3, MessageCircle, CheckCircle,
  X, CreditCard, Clock, UserCircle,
  Lock, Send, AlertCircle,
} from "lucide-react";

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const API = "/api";

  const [activeSubTab, setActiveSubTab] = useState<"approvals" | "stats" | "chat" | "proposals">("approvals");

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyMsg, setVerifyMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatApprovingId, setChatApprovingId] = useState<string | null>(null);
  const [chatMsg, setChatMsg] = useState("");

  // Proposal approval state
  const [pendingProposals, setPendingProposals] = useState<any[]>([]);
  const [proposalLoading, setProposalLoading] = useState(false);
  const [proposalActionId, setProposalActionId] = useState<string | null>(null);
  const [proposalMsg, setProposalMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("soulvera_token") : null;

  const fetchAdminUsers = async () => {
    const token = getToken();
    if (!token) return;
    setUsersLoading(true);
    try {
      const res = await fetch(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setAdminUsers(data.users || []);
    } catch (err) { console.error("Failed to fetch admin users:", err); }
    finally { setUsersLoading(false); }
  };

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    const token = getToken();
    if (!token) return;
    setVerifyingId(userId);
    try {
      const res = await fetch(`${API}/admin/users/${userId}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });
      const data = await res.json();
      const ok = data.success === true;
      setVerifyMsg({ text: data.message || (ok ? "Done!" : "Failed."), ok });
      setTimeout(() => setVerifyMsg(null), 3000);
      if (ok) fetchAdminUsers();
    } catch {
      setVerifyMsg({ text: "Server error.", ok: false });
      setTimeout(() => setVerifyMsg(null), 3000);
    } finally { setVerifyingId(null); }
  };

  const fetchPendingPayments = async () => {
    const token = getToken();
    if (!token) return;
    setChatLoading(true);
    try {
      const res = await fetch(`${API}/proposals/admin/payments`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setPendingPayments(data.proposals || []);
    } catch (err) { console.error("Failed to fetch pending payments:", err); }
    finally { setChatLoading(false); }
  };

  const handleApproveChat = async (proposalId: string) => {
    const token = getToken();
    if (!token) return;
    setChatApprovingId(proposalId);
    try {
      const res = await fetch(`${API}/proposals/${proposalId}/approve-chat`, {
        method: "PUT", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChatMsg(data.message || (data.success ? "Chat approved!" : "Failed."));
      setTimeout(() => setChatMsg(""), 3000);
      if (data.success) fetchPendingPayments();
    } catch { setChatMsg("Server error."); setTimeout(() => setChatMsg(""), 3000); }
    finally { setChatApprovingId(null); }
  };

  useEffect(() => {
    if (activeSubTab === "chat" && user) fetchPendingPayments();
  }, [activeSubTab, user]);

  useEffect(() => {
    if (activeSubTab === "approvals" && user) fetchAdminUsers();
  }, [activeSubTab, user]);

  const fetchPendingProposals = async () => {
    const token = getToken();
    if (!token) return;
    setProposalLoading(true);
    try {
      const res = await fetch(`${API}/admin/proposals/all`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setPendingProposals(data.proposals || []);
    } catch (err) { console.error("Failed to fetch proposals:", err); }
    finally { setProposalLoading(false); }
  };

  const handleReviewProposal = async (proposalId: string, admin_status: "approved" | "rejected") => {
    const token = getToken();
    if (!token) return;
    setProposalActionId(proposalId + admin_status);
    try {
      const res = await fetch(`${API}/admin/proposals/${proposalId}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ admin_status }),
      });
      const data = await res.json();
      const ok = data.success === true;
      setProposalMsg({ text: data.message || (ok ? "Done!" : "Failed."), ok });
      setTimeout(() => setProposalMsg(null), 3500);
      if (ok) fetchPendingProposals();
    } catch {
      setProposalMsg({ text: "Server error.", ok: false });
      setTimeout(() => setProposalMsg(null), 3500);
    }
    finally { setProposalActionId(null); }
  };

  useEffect(() => {
    if (activeSubTab === "proposals" && user) fetchPendingProposals();
  }, [activeSubTab, user]);

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

  const TABS: { key: "approvals" | "stats" | "chat" | "proposals"; icon: React.ElementType; label: string; badge?: number }[] = [
    { key: "approvals",  icon: Shield,        label: `Profile Verification (${adminUsers.length})` },
    { key: "proposals",  icon: Send,          label: "Proposals", badge: pendingProposals.length },
    { key: "stats",      icon: BarChart3,     label: "Platform Stats" },
    { key: "chat",       icon: MessageCircle, label: "Chat Approvals", badge: pendingPayments.length },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 flex-grow">

        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="heading-section text-2xl text-stone-900 flex items-center gap-2 mb-1">
              <Shield size={22} className="text-rose-500" /> Admin Panel
            </h1>
            <p className="text-xs text-stone-400">Manage profiles, approvals, and platform settings.</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Users, value: adminUsers.length, label: "Registered", sub: "Total accounts", color: "from-rose-500 to-pink-500" },
            { icon: CheckCircle, value: adminUsers.filter((u) => u.profile?.profile_complete).length, label: "Profiles", sub: "Fully complete", color: "from-emerald-500 to-teal-500" },
            { icon: Send, value: pendingProposals.length, label: "Proposals", sub: "Pending review", color: "from-violet-500 to-purple-500" },
            { icon: Lock, value: "SSL", label: "Security", sub: "Active shield", color: "from-amber-500 to-orange-500" },
          ].map((s) => (
            <div key={s.label} className="glass border border-white/60 rounded-3xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div className="text-2xl font-black text-stone-800" style={{ fontFamily: "var(--font-display)" }}>{s.value}</div>
              <div className="text-xs font-bold text-stone-700">{s.label}</div>
              <div className="text-[10px] text-stone-400 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Main workspace */}
        <div className="glass border border-white/60 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row" style={{ minHeight: "450px" }}>
          {/* Sidebar tabs */}
          <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-stone-100 flex-shrink-0">
            <div className="p-4 border-b border-stone-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Admin Controls</p>
            </div>
            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible p-2 gap-1">
              {TABS.map(({ key, icon: Icon, label, badge }) => (
                <button key={key} onClick={() => setActiveSubTab(key as typeof activeSubTab)}
                  className={`flex items-center gap-2.5 text-left px-3 py-3 rounded-2xl text-xs font-bold transition-all flex-shrink-0 md:flex-shrink ${
                    activeSubTab === key
                      ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                      : "text-stone-500 hover:bg-rose-50 hover:text-rose-700"
                  }`}>
                  <Icon size={14} className="flex-shrink-0" />
                  <span className="truncate">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className={`ml-auto flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-full ${activeSubTab === key ? "bg-white/30 text-white" : "bg-rose-500 text-white"}`}>
                      {badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 p-6 sm:p-8 overflow-auto">

            {/* Profile Verification */}
            {activeSubTab === "approvals" && (
              <div className="space-y-5">
                <div>
                  <h3 className="heading-section text-lg text-stone-900 mb-1">Profile Verification Panel</h3>
                  <p className="text-xs text-stone-400">Tamam registered users â€” profile dekhein aur verify karein.</p>
                </div>

                {verifyMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-medium border ${
                    verifyMsg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}>
                    {verifyMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {verifyMsg.text}
                  </div>
                )}

                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[560px]">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pr-4">User</th>
                          <th className="pb-3 pr-4">Soulvera ID</th>
                          <th className="pb-3 pr-4">Role</th>
                          <th className="pb-3 pr-4">Profile</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {adminUsers.map((u: any) => (
                          <tr key={u.id} className="hover:bg-rose-50/40 transition-colors group">

                            {/* User â€” click to view profile */}
                            <td className="py-3.5 pr-4">
                              <Link href={`/profile/${u.id}`} className="flex items-center gap-2.5 group/link">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-sm group-hover/link:border-rose-200 transition-all">
                                  {u.profile?.photo_url ? (
                                    <img src={u.profile.photo_url} className="w-full h-full object-cover" alt="" />
                                  ) : <UserCircle size={16} className="text-rose-300" />}
                                </div>
                                <div>
                                  <span className="font-bold text-stone-800 group-hover/link:text-rose-600 transition-colors">{u.name}</span>
                                  <p className="text-[10px] text-stone-400">{u.email}</p>
                                </div>
                              </Link>
                            </td>

                            <td className="py-3.5 pr-4 text-stone-400 font-mono text-[10px]">{u.soulvera_id || "â€”"}</td>
                            <td className="py-3.5 pr-4 text-stone-500 capitalize">{u.role}</td>

                            <td className="py-3.5 pr-4">
                              <span className={`px-2 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider border ${
                                u.profile?.profile_complete
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-stone-50 text-stone-500 border-stone-200"
                              }`}>
                                {u.profile?.profile_complete ? "Complete" : "Incomplete"}
                              </span>
                            </td>

                            <td className="py-3.5 pr-4">
                              <span className={`px-2 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider border ${
                                u.is_verified
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {u.is_verified ? "Verified" : "Pending"}
                              </span>
                            </td>

                            <td className="py-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/profile/${u.id}`}
                                  className="px-3 py-1.5 rounded-xl text-[10px] font-bold border border-rose-200 text-rose-500 hover:bg-rose-50 transition-all">
                                  View
                                </Link>
                                <button
                                  onClick={() => handleToggleVerify(u.id, u.is_verified)}
                                  disabled={verifyingId === u.id}
                                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all disabled:opacity-60 ${
                                    u.is_verified
                                      ? "border border-stone-200 text-stone-500 hover:border-rose-300 hover:text-rose-600"
                                      : "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm hover:from-rose-600 hover:to-pink-600"
                                  }`}>
                                  {verifyingId === u.id ? "..." : u.is_verified ? "Revoke" : "Approve"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {adminUsers.length === 0 && (
                          <tr><td colSpan={6} className="py-10 text-center text-stone-400 text-xs">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Stats */}
            {activeSubTab === "stats" && (
              <div className="space-y-5">
                <div>
                  <h3 className="heading-section text-lg text-stone-900 mb-1">Platform Activity</h3>
                  <p className="text-xs text-stone-400">Database metrics and activity overview.</p>
                </div>
                <div className="space-y-5 max-w-lg">
                  {[
                    { label: "Proposals Accepted", pct: 85, color: "from-rose-500 to-pink-500" },
                    { label: "Premium Subscription Conversion", pct: 30, color: "from-violet-500 to-purple-500" },
                    { label: "Verification Completion Rate", pct: 95, color: "from-emerald-500 to-teal-500" },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center text-xs font-bold text-stone-500 mb-2">
                        <span>{label}</span>
                        <span className="gradient-text">{pct}%</span>
                      </div>
                      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Proposals Monitor */}
            {activeSubTab === "proposals" && (
              <div className="space-y-5">
                <div>
                  <h3 className="heading-section text-lg text-stone-900 mb-1">Proposals Monitor</h3>
                  <p className="text-xs text-stone-400">Tamam proposals â€” kisne kisko bheja.</p>
                </div>

                {proposalMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-medium border ${
                    proposalMsg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-rose-50 border-rose-200 text-rose-700"
                  }`}>
                    {proposalMsg.ok ? <CheckCircle size={14} /> : <AlertCircle size={14} />} {proposalMsg.text}
                  </div>
                )}

                {proposalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingProposals.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                      <Send size={28} className="text-rose-300" />
                    </div>
                    <p className="font-bold text-stone-600 mb-1">Koi proposal nahi</p>
                    <p className="text-xs text-stone-400">Abhi tak koi proposal send nahi hua.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                      <thead>
                        <tr className="border-b border-stone-100 text-stone-400 font-bold uppercase tracking-wider text-[10px]">
                          <th className="pb-3 pr-4">Sender</th>
                          <th className="pb-3 pr-4 text-center">â†’</th>
                          <th className="pb-3 pr-4">Receiver</th>
                          <th className="pb-3 pr-4 text-center">Status</th>
                          <th className="pb-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-50">
                        {pendingProposals.map((p: any) => {
                          const statusMap: Record<string, { label: string; cls: string }> = {
                            pending:  { label: "Pending",  cls: "bg-sky-50 text-sky-700 border-sky-200" },
                            accepted: { label: "Accepted", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                            rejected: { label: "Rejected", cls: "bg-rose-50 text-rose-600 border-rose-200" },
                          };
                          const s = statusMap[p.admin_status === "rejected" ? "rejected" : p.status] || statusMap.pending;
                          return (
                            <tr key={p.id} className="hover:bg-rose-50/30 transition-colors">
                              {/* Sender */}
                              <td className="py-3 pr-4">
                                <Link href={`/profile/${p.sender?.id}`} className="flex items-center gap-2 group/s">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white shadow-sm">
                                    {p.sender?.profile?.photo_url
                                      ? <img src={p.sender.profile.photo_url} className="w-full h-full object-cover" alt="" />
                                      : <UserCircle size={14} className="text-rose-300" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-stone-800 group-hover/s:text-rose-600 transition-colors">{p.sender?.name || "â€”"}</p>
                                    <p className="text-[10px] text-stone-400">{p.sender?.profile?.city || "â€”"}</p>
                                  </div>
                                </Link>
                              </td>

                              <td className="py-3 pr-4 text-center text-stone-300">
                                <Send size={11} className="inline" />
                              </td>

                              {/* Receiver */}
                              <td className="py-3 pr-4">
                                <Link href={`/profile/${p.receiver?.id}`} className="flex items-center gap-2 group/r">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white shadow-sm">
                                    {p.receiver?.profile?.photo_url
                                      ? <img src={p.receiver.profile.photo_url} className="w-full h-full object-cover" alt="" />
                                      : <UserCircle size={14} className="text-sky-300" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-stone-800 group-hover/r:text-sky-600 transition-colors">{p.receiver?.name || "â€”"}</p>
                                    <p className="text-[10px] text-stone-400">{p.receiver?.profile?.city || "â€”"}</p>
                                  </div>
                                </Link>
                              </td>

                              {/* Status */}
                              <td className="py-3 pr-4 text-center">
                                <span className={`px-2 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider border ${s.cls}`}>
                                  {p.admin_status === "rejected" ? "Blocked" : s.label}
                                </span>
                              </td>

                              {/* Date + block */}
                              <td className="py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <span className="text-[10px] text-stone-400">{new Date(p.created_at).toLocaleDateString()}</span>
                                  {p.admin_status !== "rejected" && (
                                    <button
                                      onClick={() => handleReviewProposal(p.id, "rejected")}
                                      disabled={!!proposalActionId}
                                      title="Block this proposal"
                                      className="text-stone-300 hover:text-rose-500 transition-colors disabled:opacity-40">
                                      <X size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Chat Approvals */}
            {activeSubTab === "chat" && (
              <div className="space-y-5">
                <div>
                  <h3 className="heading-section text-lg text-stone-900 mb-1">Chat Payment Approvals</h3>
                  <p className="text-xs text-stone-400">Review payment screenshots and unlock chats for approved users.</p>
                </div>

                {chatMsg && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-emerald-700 text-xs font-medium">
                    <CheckCircle size={14} /> {chatMsg}
                  </div>
                )}

                {chatLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : pendingPayments.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={28} className="text-emerald-400" />
                    </div>
                    <p className="font-bold text-stone-600 mb-1">All caught up!</p>
                    <p className="text-xs text-stone-400">No pending payment approvals.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPayments.map((payment: any) => (
                      <div key={payment.id}
                        className="bg-white border border-stone-100 hover:border-rose-200 rounded-3xl p-5 transition-all">

                        {/* Top row: info + approve button */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard size={14} className="text-amber-500" />
                              <span className="text-xs font-bold text-stone-800">Proposal #{payment.id?.slice(0,8)}</span>
                              <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-xl">
                                <Clock size={10} /> Awaiting Approval
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 space-y-0.5">
                              <div>Sender: <strong>{payment.sender?.name}</strong> ({payment.sender?.soulvera_id})</div>
                              <div>Receiver: <strong>{payment.receiver?.name}</strong> ({payment.receiver?.soulvera_id})</div>
                            </div>
                          </div>

                          <button onClick={() => handleApproveChat(payment.id)} disabled={chatApprovingId === payment.id}
                            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60 flex-shrink-0">
                            <CheckCircle size={13} />{chatApprovingId === payment.id ? "Approving..." : "Approve Chat"}
                          </button>
                        </div>

                        {/* Screenshot â€” show image directly */}
                        {payment.payment_screenshot ? (
                          <div className="mt-4">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">Payment Screenshot</p>
                            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-amber-50">
                              <img
                                src={payment.payment_screenshot}
                                alt="Payment screenshot"
                                className="w-full max-h-72 object-contain bg-white"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                              {/* Fallback if image fails to load */}
                              <div className="hidden items-center justify-center py-8 text-stone-400 text-xs font-medium">
                                Could not display image
                              </div>
                              {/* Open in new tab button */}
                              <a
                                href={payment.payment_screenshot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-xl border border-rose-200 shadow-sm hover:bg-rose-50 transition-colors"
                              >
                                Full Size â†—
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center gap-2 bg-stone-50 border border-stone-100 rounded-2xl px-4 py-3">
                            <Clock size={13} className="text-stone-300" />
                            <span className="text-xs text-stone-400 font-medium">No screenshot uploaded yet</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

