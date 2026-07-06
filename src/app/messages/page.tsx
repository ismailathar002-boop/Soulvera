"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import {
  MessageCircle, Lock, Send, Search, CheckCircle,
  Clock, Upload, X, UserCircle, CreditCard,
} from "lucide-react";

interface ChatMessage { id: string; senderId: string; text: string; timestamp: string; }
interface BackendProposal { id: string; sender_id: string; receiver_id: string; status: string; chat_enabled: boolean; payment_status: string; }

const API = "http://localhost:5000/api";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const initialChatUserId = searchParams.get("chatUserId") || "";
  const [selectedUserId, setSelectedUserId] = useState(initialChatUserId);
  const [chatHistories, setChatHistories] = useState<{ [userId: string]: ChatMessage[] }>({});
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [backendProposals, setBackendProposals] = useState<BackendProposal[]>([]);
  const [chatPartners, setChatPartners] = useState<{ id: string; name: string; soulvera_id: string; profile: any }[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(true);

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState("");
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const fetchBackendProposals = async () => {
    const token = localStorage.getItem("soulvera_token");
    if (!token || !user) return;
    try {
      const res = await fetch(`${API}/proposals`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) return;

      const accepted: BackendProposal[] = [];
      const partners: typeof chatPartners = [];

      (data.sent || []).forEach((p: any) => {
        if (p.status === "accepted") {
          accepted.push({ id: p.id, sender_id: p.sender_id, receiver_id: p.receiver_id, status: p.status, chat_enabled: !!p.chat_enabled, payment_status: p.payment_status || "unpaid" });
          if (p.receiver) partners.push({ id: p.receiver_id, name: p.receiver.name, soulvera_id: p.receiver.soulvera_id, profile: p.receiver.profile || null });
        }
      });

      (data.received || []).forEach((p: any) => {
        if (p.status === "accepted" && !accepted.find((a) => a.id === p.id)) {
          accepted.push({ id: p.id, sender_id: p.sender_id, receiver_id: p.receiver_id, status: p.status, chat_enabled: !!p.chat_enabled, payment_status: p.payment_status || "unpaid" });
          if (p.sender) partners.push({ id: p.sender_id, name: p.sender.name, soulvera_id: p.sender.soulvera_id, profile: p.sender.profile || null });
        }
      });

      setBackendProposals(accepted);
      setChatPartners(partners);
      if (!selectedUserId && partners.length > 0) setSelectedUserId(partners[0].id);
    } catch (err) { console.error("Failed to fetch proposals:", err); }
    finally { setProposalsLoading(false); }
  };

  useEffect(() => { if (user) fetchBackendProposals(); }, [user]);

  const selectedProposal = backendProposals.find((p) => p.sender_id === selectedUserId || p.receiver_id === selectedUserId);
  const chatEnabled = selectedProposal?.chat_enabled === true;
  const paymentStatus = selectedProposal?.payment_status || "unpaid";

  const fetchMessages = async () => {
    if (!selectedUserId || !chatEnabled) return;
    try {
      const token = localStorage.getItem("soulvera_token");
      const res = await fetch(`${API}/messages/${selectedUserId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.messages || []).map((m: any) => ({ id: m.id, senderId: m.sender_id, text: m.content, timestamp: m.created_at || new Date().toISOString() }));
        setChatHistories((prev) => ({ ...prev, [selectedUserId]: mapped }));
      }
    } catch (err) { console.error("Failed to load messages:", err); }
  };

  useEffect(() => {
    if (!selectedUserId || !chatEnabled) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [selectedUserId, chatEnabled]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistories, selectedUserId]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setPaymentMsg({ text: "Please select a valid image file.", ok: false }); return; }
    if (file.size > 5 * 1024 * 1024) { setPaymentMsg({ text: "Image must be under 5MB.", ok: false }); return; }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handlePayForChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposal) return;
    if (!screenshot) { setPaymentMsg({ text: "Please upload your payment screenshot first.", ok: false }); return; }
    setPaymentLoading(true); setPaymentMsg(null);
    try {
      const token = localStorage.getItem("soulvera_token");
      const res = await fetch(`${API}/proposals/${selectedProposal.id}/pay`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ screenshot }),
      });
      const data = await res.json();
      setPaymentMsg({ text: data.message, ok: data.success });
      if (data.success) { setScreenshot(null); setScreenshotName(""); fetchBackendProposals(); }
    } catch { setPaymentMsg({ text: "Could not connect to server.", ok: false }); }
    finally { setPaymentLoading(false); }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedUserId || !chatEnabled) return;
    const contentToSend = inputText.trim();
    setInputText("");
    try {
      const token = localStorage.getItem("soulvera_token");
      const res = await fetch(`${API}/messages/${selectedUserId}`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: contentToSend }),
      });
      if (res.ok) fetchMessages();
    } catch (err) { console.error("Failed to send message:", err); }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Loading chat...</p>
        </div>
      </div>
    );
  }

  const activeChatPartner = chatPartners.find((u) => u.id === selectedUserId);
  const activeMessages = selectedUserId ? chatHistories[selectedUserId] || [] : [];

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-24 pb-6 flex-grow flex flex-col">
        {proposalsLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chatPartners.length > 0 ? (
          <div className="glass border border-white/60 rounded-3xl shadow-xl overflow-hidden flex-grow flex flex-col md:flex-row" style={{ minHeight: "520px" }}>

            {/* Sidebar */}
            <aside className="w-full md:w-72 border-r border-stone-100 flex flex-col flex-shrink-0">
              <div className="p-4 border-b border-stone-100">
                <h3 className="font-bold text-sm text-stone-700 flex items-center gap-2">
                  <MessageCircle size={15} className="text-rose-500" /> Connected Matches
                </h3>
              </div>
              <div className="divide-y divide-stone-50 overflow-y-auto flex-grow">
                {chatPartners.map((partner) => {
                  const prop = backendProposals.find((p) => p.sender_id === partner.id || p.receiver_id === partner.id);
                  const isActive = partner.id === selectedUserId;
                  const isLocked = !prop?.chat_enabled;
                  return (
                    <button key={partner.id} onClick={() => setSelectedUserId(partner.id)}
                      className={`w-full p-4 flex items-center justify-between text-left transition-all ${
                        isActive ? "bg-rose-50 border-l-4 border-rose-500" : "hover:bg-stone-50 border-l-4 border-transparent"
                      }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {partner.profile?.photo_url ? (
                            <img src={partner.profile.photo_url} className="w-full h-full object-cover" alt="" />
                          ) : <UserCircle size={20} className="text-rose-300" />}
                        </div>
                        <div className="text-left">
                          <div className={`font-bold text-sm ${isActive ? "text-rose-700" : "text-stone-800"}`}>{partner.name}</div>
                          <div className="text-[10px] text-stone-400">{partner.soulvera_id}</div>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase flex-shrink-0 ${
                        isLocked ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {isLocked ? "Locked" : "Open"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* Chat area */}
            {activeChatPartner ? (
              <div className="flex-1 flex flex-col">
                {/* Chat header */}
                <div className="bg-white/60 border-b border-stone-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden flex items-center justify-center">
                      {activeChatPartner.profile?.photo_url ? (
                        <img src={activeChatPartner.profile.photo_url} className="w-full h-full object-cover" alt="" />
                      ) : <UserCircle size={24} className="text-rose-300" />}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-stone-800">{activeChatPartner.name}</div>
                      <div className="text-[10px] text-stone-400">{activeChatPartner.soulvera_id} · {activeChatPartner.profile?.city || ""}</div>
                    </div>
                  </div>
                  {chatEnabled && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase">
                      <CheckCircle size={11} /> Chat Unlocked
                    </span>
                  )}
                </div>

                {!chatEnabled ? (
                  /* Payment lock screen */
                  <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-rose-50/30 to-pink-50/20">
                    <div className="text-center max-w-sm mx-auto w-full">
                      <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                        <Lock size={32} className="text-amber-500" />
                      </div>
                      <h3 className="text-lg font-bold text-stone-800 mb-2">Chat is Locked</h3>

                      {paymentStatus === "unpaid" && (
                        <form onSubmit={handlePayForChat} className="text-left space-y-4 w-full mt-4">
                          <p className="text-xs text-stone-500 leading-relaxed text-center">
                            Your proposal with <strong>{activeChatPartner.name}</strong> is accepted! Pay and upload a screenshot to unlock chat.
                          </p>
                          <input ref={screenshotInputRef} type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
                          {!screenshot ? (
                            <button type="button" onClick={() => screenshotInputRef.current?.click()}
                              className="w-full border-2 border-dashed border-rose-300 hover:border-rose-500 rounded-2xl py-8 flex flex-col items-center gap-2 transition-all bg-white hover:bg-rose-50/50">
                              <Upload size={24} className="text-rose-400" />
                              <span className="text-xs font-bold text-rose-600">Upload Payment Screenshot</span>
                              <span className="text-[10px] text-stone-400">JPG, PNG, WEBP · Max 5MB</span>
                            </button>
                          ) : (
                            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-300">
                              <img src={screenshot} alt="Payment screenshot" className="w-full max-h-40 object-cover" />
                              <button type="button"
                                onClick={() => { setScreenshot(null); setScreenshotName(""); if (screenshotInputRef.current) screenshotInputRef.current.value = ""; }}
                                className="absolute top-2 right-2 bg-rose-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow">
                                <X size={12} />
                              </button>
                              <div className="bg-emerald-50 px-3 py-1.5 text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle size={10} /> {screenshotName}
                              </div>
                            </div>
                          )}

                          {paymentMsg && (
                            <div className={`text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 ${
                              paymentMsg.ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}>
                              {paymentMsg.ok ? <CheckCircle size={13} /> : <X size={13} />} {paymentMsg.text}
                            </div>
                          )}

                          <button type="submit" disabled={paymentLoading || !screenshot}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-bold py-3.5 rounded-2xl shadow-lg disabled:opacity-50 transition-all">
                            <CreditCard size={15} />{paymentLoading ? "Submitting..." : "Submit Payment"}
                          </button>
                          <p className="text-[10px] text-stone-400 text-center">Admin will verify your screenshot and unlock chat.</p>
                        </form>
                      )}

                      {paymentStatus === "paid" && (
                        <div className="mt-4 bg-sky-50 border border-sky-200 rounded-2xl p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock size={14} className="text-sky-600" />
                            <p className="text-xs font-bold text-sky-700">Payment Submitted</p>
                          </div>
                          <p className="text-[11px] text-stone-500">Your payment is under review. Admin will approve chat access shortly.</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Open chat */
                  <>
                    <div className="flex-1 p-5 overflow-y-auto max-h-[400px] space-y-3 bg-gradient-to-b from-rose-50/20 to-white/10">
                      {activeMessages.length === 0 && (
                        <div className="text-center py-10 text-xs text-stone-400">
                          No messages yet. Say Assalam-o-Alaikum! 🌹
                        </div>
                      )}
                      {activeMessages.map((msg) => {
                        const isMe = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? "bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-tr-none shadow-md"
                                : "bg-white text-stone-700 rounded-tl-none border border-stone-100 shadow-sm"
                            }`}>
                              <p>{msg.text}</p>
                              <div className={`text-[9px] mt-1.5 text-right ${isMe ? "text-white/60" : "text-stone-300"}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="bg-white/80 border-t border-stone-100 p-4 flex gap-3">
                      <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-white border border-stone-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-none transition-all" />
                      <button type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold px-5 py-3 rounded-2xl shadow-md transition-all">
                        <Send size={14} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-stone-400 text-sm">
                <div>
                  <MessageCircle size={40} className="mx-auto mb-3 text-stone-200" />
                  Select a match from the sidebar to start chatting.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass border border-white/60 py-20 text-center rounded-3xl shadow-xl max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-5">
              <MessageCircle size={32} className="text-rose-300" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">No Connected Matches Yet</h3>
            <p className="text-xs text-stone-400 max-w-sm mx-auto mb-6">
              Chat channels open once a proposal is mutually accepted. Browse profiles to start connecting.
            </p>
            <Link href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-2xl shadow-md hover:from-rose-600 hover:to-pink-600 transition-all">
              <Search size={14} /> Discover Profiles
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default function Messages() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Loading chat...</p>
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
