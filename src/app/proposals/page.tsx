"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import {
  Heart, Send, Inbox, MessageCircle, Search,
  CheckCircle, X, Clock, CreditCard, Upload,
  UserCircle, ChevronRight, AlertCircle,
} from "lucide-react";

interface ProposalUser {
  id: string; soulvera_id: string; name: string; role: string;
  profile?: { age?: number; city?: string; caste?: string; profession?: string; photo_url?: string; };
}

interface Proposal {
  id: string; sender_id: string; receiver_id: string;
  status: "pending" | "accepted" | "rejected";
  admin_status?: "pending" | "approved" | "rejected";
  message?: string; created_at: string;
  chat_enabled?: boolean; payment_status?: string;
  sender?: ProposalUser; receiver?: ProposalUser;
}

const API = "http://localhost:5000/api";

function Avatar({ profileUser }: { profileUser?: ProposalUser }) {
  if (profileUser?.profile?.photo_url) {
    return <img src={profileUser.profile.photo_url} alt={profileUser.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-rose-100" />;
  }
  return (
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
      <UserCircle size={24} className="text-rose-300" />
    </div>
  );
}

export default function Proposals() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [received, setReceived] = useState<Proposal[]>([]);
  const [sent, setSent] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);
  const [payFormOpenId, setPayFormOpenId] = useState<string | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("soulvera_token") : null;

  const fetchProposals = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    setLoadingProposals(true);
    try {
      const res = await fetch(`${API}/proposals`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) { setReceived(data.received || []); setSent(data.sent || []); }
    } catch (err) { console.error("Failed to fetch proposals:", err); }
    finally { setLoadingProposals(false); }
  }, []);

  useEffect(() => { if (user) fetchProposals(); }, [user, fetchProposals]);

  const handleRespond = async (proposalId: string, status: "accepted" | "rejected") => {
    const token = getToken();
    if (!token) return;
    setActionLoading(proposalId);
    try {
      const res = await fetch(`${API}/proposals/${proposalId}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) { setSuccessMsg(data.message); setTimeout(() => setSuccessMsg(""), 3000); fetchProposals(); }
    } catch (err) { console.error("Respond proposal error:", err); }
    finally { setActionLoading(null); }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setSuccessMsg("Please select a valid image file."); setTimeout(() => setSuccessMsg(""), 3000); return; }
    if (file.size > 5 * 1024 * 1024) { setSuccessMsg("Image must be under 5MB."); setTimeout(() => setSuccessMsg(""), 3000); return; }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePayForChat = async (proposalId: string) => {
    if (!screenshot) { setSuccessMsg("Please upload your payment screenshot first."); setTimeout(() => setSuccessMsg(""), 3000); return; }
    const token = getToken();
    if (!token) return;
    setPaymentLoading(proposalId);
    try {
      const res = await fetch(`${API}/proposals/${proposalId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ screenshot }),
      });
      const data = await res.json();
      setSuccessMsg(data.message || (data.success ? "Payment submitted!" : "Failed."));
      setTimeout(() => setSuccessMsg(""), 4000);
      if (data.success) { setPayFormOpenId(null); setScreenshot(null); setScreenshotName(""); fetchProposals(); }
    } catch { setSuccessMsg("Could not connect to server."); setTimeout(() => setSuccessMsg(""), 3000); }
    finally { setPaymentLoading(null); }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const ProposalCard = ({ prop, direction }: { prop: Proposal; direction: "received" | "sent" }) => {
    const personUser = direction === "received" ? prop.sender : prop.receiver;
    const chatUserId = direction === "received" ? prop.sender_id : prop.receiver_id;
    const isOpen = payFormOpenId === prop.id;

    return (
      <div className="group bg-white border border-stone-100 hover:border-rose-200 rounded-3xl shadow-sm hover:shadow-[0_8px_30px_rgba(225,29,72,0.10)] transition-all duration-300">
        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Person info */}
          <div className="flex items-center gap-4">
            <Avatar profileUser={personUser} />
            <div>
              <div className="font-bold text-sm text-stone-800">
                {direction === "received" ? "Proposal from" : "Proposal to"}{" "}
                <span className="text-rose-600">{personUser?.name || "Unknown"}</span>
              </div>
              <div className="text-xs text-stone-400 mt-0.5">
                {personUser?.soulvera_id} · {personUser?.profile?.age} yrs · {personUser?.profile?.city} · {personUser?.profile?.caste}
              </div>
              {prop.message && (
                <div className="text-[11px] text-stone-400 italic mt-1.5 max-w-xs">
                  &ldquo;{prop.message}&rdquo;
                </div>
              )}
              <div className="text-[10px] text-stone-300 mt-1">{new Date(prop.created_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {prop.status === "pending" && direction === "received" && (
              <div className="flex gap-2">
                <button id={`accept-${prop.id}`}
                  onClick={() => handleRespond(prop.id, "accepted")} disabled={actionLoading === prop.id}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-50">
                  <CheckCircle size={13} />{actionLoading === prop.id ? "..." : "Accept"}
                </button>
                <button id={`decline-${prop.id}`}
                  onClick={() => handleRespond(prop.id, "rejected")} disabled={actionLoading === prop.id}
                  className="flex items-center gap-1.5 border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-semibold px-4 py-2.5 rounded-2xl transition-all disabled:opacity-50">
                  <X size={13} />Decline
                </button>
              </div>
            )}

            {prop.status === "pending" && direction === "sent" && (
              prop.admin_status === "rejected" ? (
                <span className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider">
                  <X size={11} /> Blocked by Admin
                </span>
              ) : (
                <span className="flex items-center gap-1.5 bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider">
                  <Clock size={11} /> Awaiting Response
                </span>
              )
            )}

            {prop.status === "accepted" && (
              <div className="flex flex-col items-end gap-2">
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider">
                  <CheckCircle size={11} /> Accepted
                </span>
                {prop.chat_enabled ? (
                  <Link href={`/messages?chatUserId=${chatUserId}`}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-sm hover:from-rose-600 hover:to-pink-600 transition-all">
                    <MessageCircle size={13} /> Open Chat
                  </Link>
                ) : prop.payment_status === "paid" ? (
                  <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider">
                    <Clock size={11} /> Awaiting Admin Approval
                  </span>
                ) : (
                  <button
                    onClick={() => { setPayFormOpenId(isOpen ? null : prop.id); setScreenshot(null); setScreenshotName(""); }}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold px-4 py-2 rounded-2xl shadow-sm transition-all">
                    <CreditCard size={13} /> Pay to Unlock Chat
                  </button>
                )}
              </div>
            )}

            {prop.status === "rejected" && (
              <span className="flex items-center gap-1 bg-stone-50 text-stone-500 border border-stone-200 px-3 py-1 rounded-xl font-bold text-[10px] uppercase tracking-wider">
                <X size={11} /> Declined
              </span>
            )}
          </div>
        </div>

        {/* Payment form */}
        {isOpen && (
          <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-amber-800 mb-4 flex items-center gap-2">
              <CreditCard size={14} /> Upload your payment screenshot to unlock chat
            </p>
            <input ref={screenshotInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />

            {!screenshot ? (
              <button type="button" onClick={() => screenshotInputRef.current?.click()}
                className="w-full border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl py-8 flex flex-col items-center gap-2 transition-all bg-white">
                <Upload size={24} className="text-amber-400" />
                <span className="text-xs font-bold text-amber-600">Click to Upload Screenshot</span>
                <span className="text-[10px] text-stone-400">JPG, PNG, WEBP · Max 5MB</span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300 mb-3">
                <img src={screenshot} alt="Payment screenshot" className="w-full max-h-48 object-cover" />
                <button type="button"
                  onClick={() => { setScreenshot(null); setScreenshotName(""); if (screenshotInputRef.current) screenshotInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow">
                  <X size={12} />
                </button>
                <div className="bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle size={10} /> {screenshotName}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => handlePayForChat(prop.id)} disabled={paymentLoading === prop.id || !screenshot}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold py-3 rounded-2xl shadow-sm disabled:opacity-50 hover:from-rose-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
                <CreditCard size={13} />{paymentLoading === prop.id ? "Submitting..." : "Submit Payment"}
              </button>
              <button onClick={() => { setPayFormOpenId(null); setScreenshot(null); setScreenshotName(""); }}
                className="px-4 border border-stone-200 text-stone-500 text-xs font-semibold rounded-2xl hover:bg-stone-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 flex-grow">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="heading-section text-2xl text-stone-900 mb-1">My Proposals</h1>
            <p className="text-xs text-stone-400">Send and receive matrimonial proposals securely.</p>
          </div>
          <Link href="/search"
            className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md hover:from-rose-600 hover:to-pink-600 transition-all">
            <Search size={13} /> Find Matches
          </Link>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-700 text-sm font-medium">
            <CheckCircle size={16} className="flex-shrink-0" /> {successMsg}
          </div>
        )}

        {/* Main card */}
        <div className="glass border border-white/60 rounded-3xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-stone-100 p-1.5 gap-1 bg-white/60">
            {(["received", "sent"] as const).map((tab) => (
              <button
                key={tab}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md"
                    : "text-stone-500 hover:text-rose-600 hover:bg-rose-50/60"
                }`}
              >
                {tab === "received" ? <Inbox size={15} /> : <Send size={15} />}
                {tab === "received" ? `Received (${received.length})` : `Sent (${sent.length})`}
              </button>
            ))}
          </div>

          <div className="p-5">
            {loadingProposals ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {activeTab === "received" && (
                  <div className="space-y-4">
                    {received.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                          <Inbox size={28} className="text-rose-300" />
                        </div>
                        <p className="font-bold text-stone-600 mb-1">No proposals received yet</p>
                        <p className="text-xs text-stone-400">Complete your profile to attract more matches!</p>
                      </div>
                    ) : (
                      received.map((prop) => <ProposalCard key={prop.id} prop={prop} direction="received" />)
                    )}
                  </div>
                )}

                {activeTab === "sent" && (
                  <div className="space-y-4">
                    {sent.length === 0 ? (
                      <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
                          <Send size={28} className="text-rose-300" />
                        </div>
                        <p className="font-bold text-stone-600 mb-1">No proposals sent yet</p>
                        <p className="text-xs text-stone-400 mb-4">Browse profiles and send a proposal to start a connection.</p>
                        <Link href="/search"
                          className="inline-flex items-center gap-2 text-xs bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md">
                          <Search size={13} /> Browse Profiles
                        </Link>
                      </div>
                    ) : (
                      sent.map((prop) => <ProposalCard key={prop.id} prop={prop} direction="sent" />)
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
