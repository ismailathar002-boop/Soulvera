"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/Header";
import {
  Heart, Shield, CheckCircle, Clock, X, Lock,
  UserCircle, MessageCircle, Phone, Mail, Star,
  GraduationCap, Briefcase, MapPin, AlertCircle,
} from "lucide-react";

interface ProfileDetailProps {
  params: Promise<{ id: string }>;
}

const API = "http://localhost:5000/api";

interface BackendProfile {
  id: string; soulvera_id: string; name: string; email: string;
  phone: string; role: string; is_verified: boolean; isShortlisted: boolean;
  created_at?: string;
  profileData: {
    age?: number; gender?: string; marital_status?: string; height?: string; build?: string;
    religion?: string; religious_practice?: string; caste?: string; sub_caste?: string;
    sect?: string; language?: string; city?: string; relocate?: string;
    education?: string; grade?: string; education_honors?: string; islamic_education?: string;
    profession?: string; income?: string;
    father_occupation?: string; mother_occupation?: string;
    brothers_count?: number; brothers_married?: number;
    sisters_count?: number; sisters_educated?: boolean;
    family_description?: string;
    houses_count?: number; house_location?: string;
    agricultural_land?: boolean; plots?: string; residence_address?: string;
    partner_min_age?: number; partner_max_age?: number; partner_height?: string;
    partner_education?: string; partner_profession?: string;
    partner_caste?: string; partner_city?: string; partner_marital_status?: string;
    about_me?: string; photo_url?: string; photo_privacy?: string;
    gallery_urls?: string[]; contact_number?: string; profile_complete?: boolean;
  } | null;
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-stone-50 last:border-0">
      <span className="text-xs text-stone-400 font-medium">{label}</span>
      <span className="text-xs font-bold text-stone-700 text-right max-w-[55%] truncate">{value || "—"}</span>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
        <Icon size={14} className="text-white" />
      </div>
      <h3 className="font-bold text-stone-800" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
    </div>
  );
}

export default function ProfileDetail({ params }: ProfileDetailProps) {
  const router = useRouter();
  const { id } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<BackendProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileBlocked, setProfileBlocked] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<"none" | "sent" | "received" | "accepted" | "rejected">("none");
  const [proposalId, setProposalId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("soulvera_token") : null;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const fetchProfile = useCallback(async () => {
    const token = getToken();
    if (!token || !id) return;
    setLoadingProfile(true); setProfileBlocked(false);
    try {
      const res = await fetch(`${API}/profiles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.status === 403) { setProfileBlocked(true); setProfile(null); }
      else if (data.success) { setProfile(data.user); setIsShortlisted(data.user.isShortlisted || false); }
      else setProfile(null);
    } catch (err) { console.error("Failed to load profile:", err); setProfile(null); }
    finally { setLoadingProfile(false); }
  }, [id]);

  const fetchProposalStatus = useCallback(async () => {
    const token = getToken();
    if (!token || !user) return;
    try {
      const res = await fetch(`${API}/proposals`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) return;
      const sent = (data.sent || []).find((p: any) => p.receiver_id === id);
      if (sent) { setProposalId(sent.id); setProposalStatus(sent.status === "accepted" ? "accepted" : sent.status === "rejected" ? "rejected" : "sent"); return; }
      const received = (data.received || []).find((p: any) => p.sender_id === id);
      if (received && received.admin_status === "approved") { setProposalId(received.id); setProposalStatus(received.status === "accepted" ? "accepted" : received.status === "rejected" ? "rejected" : "received"); return; }
      setProposalStatus("none");
    } catch (err) { console.error("Failed to fetch proposal status:", err); }
  }, [id, user]);

  useEffect(() => {
    if (user && id) { fetchProfile(); fetchProposalStatus(); }
  }, [user, id, fetchProfile, fetchProposalStatus]);

  const handleSendProposal = async () => {
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/proposals/${id}`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({}) });
      const data = await res.json();
      if (data.success) { setProposalStatus("sent"); setProposalId(data.proposal?.id); setSuccessMsg("Proposal sent! Awaiting admin approval."); setTimeout(() => setSuccessMsg(""), 4000); }
      else { setSuccessMsg(data.message || "Failed to send proposal."); setTimeout(() => setSuccessMsg(""), 3000); }
    } catch (err) { console.error("Send proposal error:", err); }
    finally { setActionLoading(false); }
  };

  const handleRespondProposal = async (status: "accepted" | "rejected") => {
    if (!proposalId) return;
    const token = getToken();
    if (!token) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/proposals/${proposalId}/respond`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (data.success) { setProposalStatus(status); setSuccessMsg(status === "accepted" ? "Proposal accepted!" : "Proposal declined."); setTimeout(() => setSuccessMsg(""), 3000); }
    } catch (err) { console.error("Respond error:", err); }
    finally { setActionLoading(false); }
  };

  const handleToggleShortlist = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/profiles/${id}/shortlist`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setIsShortlisted(data.isShortlisted);
    } catch (err) { console.error("Shortlist toggle error:", err); }
  };

  const Loading = () => (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (authLoading || !user) return <Loading />;
  if (loadingProfile) return <Loading />;

  if (profileBlocked) return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center mx-auto mb-5"><Lock size={32} className="text-stone-400" /></div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Profile Not Available</h3>
          <p className="text-stone-400 text-sm mb-6">This profile is not available to you.</p>
          <Link href="/search" className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-xl shadow-md">Search Matches</Link>
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-5"><UserCircle size={32} className="text-rose-300" /></div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Profile Not Found</h3>
          <p className="text-stone-400 text-sm mb-6">This profile does not exist or has been deactivated.</p>
          <Link href="/search" className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-xl shadow-md">Search Matches</Link>
        </div>
      </div>
    </div>
  );

  // Non-admin users must have profileData to view
  if (!profile.profileData && user.role !== "admin") return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 flex items-center justify-center mx-auto mb-5"><UserCircle size={32} className="text-rose-300" /></div>
          <h3 className="text-xl font-bold text-stone-800 mb-2">Profile Not Found</h3>
          <p className="text-stone-400 text-sm mb-6">This profile does not exist or has been deactivated.</p>
          <Link href="/search" className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-xl shadow-md">Search Matches</Link>
        </div>
      </div>
    </div>
  );

  const data = profile.profileData;
  const isProposalAccepted = proposalStatus === "accepted";
  const isPhotoBlurred = data?.photo_privacy === "request" && !isProposalAccepted;

  // Normalize any phone number to WhatsApp-compatible format (digits only, with country code)
  const normalizePhone = (raw: string) => {
    let digits = raw.replace(/[^0-9]/g, "");
    if (digits.startsWith("92") && digits.length >= 12) return digits;   // already +92xxx
    if (digits.startsWith("0") && digits.length >= 10) return "92" + digits.slice(1); // 0300... → 92300...
    if (digits.length >= 10) return "92" + digits; // bare number, prepend 92
    return digits;
  };

  const cleanPhone = normalizePhone(profile.phone || "");
  const whatsappMsg = encodeURIComponent(`Assalam-o-Alaikum, I am ${user.name} from Soulvera. I saw your profile (ID: ${profile.soulvera_id}) and would like to proceed.`);
  const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsappMsg}` : "#";

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 pt-24 pb-12 flex-grow">

        {/* Hero card */}
        <div className="glass border border-white/60 rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Cover */}
          <div className="relative bg-gradient-to-br from-rose-50 to-pink-50 p-8 sm:p-10">
            {/* Shortlist button — hidden for admin */}
            {user.role !== "admin" && (
              <button onClick={handleToggleShortlist}
                className="absolute top-5 right-5 w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-sm border border-stone-200 flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10">
                <Heart size={18} className={isShortlisted ? "text-rose-500 fill-rose-500" : "text-stone-300"} />
              </button>
            )}

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              {/* Avatar */}
              <div className={`w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 border-4 ${isShortlisted ? "border-rose-300" : "border-white"} shadow-xl relative ${isPhotoBlurred ? "filter blur-md select-none" : ""}`}>
                {data?.photo_url && data.photo_url.startsWith("data:image") ? (
                  <img src={data.photo_url} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                    <UserCircle size={52} className="text-rose-300" />
                  </div>
                )}
                {isPhotoBlurred && (
                  <div className="absolute inset-0 bg-stone-200/60 flex items-center justify-center">
                    <Lock size={20} className="text-stone-600" />
                  </div>
                )}
              </div>

              <div className="text-center sm:text-left flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-2">
                  <span className="badge-primary text-[10px]">{profile.role === "family" ? "Family Managed" : "Individual"}</span>
                  {profile.is_verified && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-xl uppercase">
                      <CheckCircle size={10} /> Verified
                    </span>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  {profile.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 justify-center sm:justify-start">
                  <span className="font-mono text-[10px] bg-white/80 border border-stone-200 px-2 py-0.5 rounded-lg">{profile.soulvera_id}</span>
                  {data?.age && <span>{data.age} years</span>}
                  {data?.religion && <span>{data.religion}</span>}
                  {data?.caste && <span>{data.caste}</span>}
                  {data?.city && <span className="flex items-center gap-1"><MapPin size={10} />{data.city}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Left — details */}
            <div className="md:col-span-2 space-y-6">

              {/* About */}
              {data?.about_me && (
                <div className="bg-gradient-to-br from-rose-50/60 to-pink-50/40 border border-rose-100 rounded-2xl p-5">
                  <SectionHeader icon={UserCircle} title="About Candidate" />
                  <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">{data.about_me}</p>
                </div>
              )}

              {/* Profile Details */}
              {data && (
                <div className="bg-white border border-stone-100 rounded-2xl p-5">
                  <SectionHeader icon={UserCircle} title="Profile Details" />
                  <InfoRow label="Marital Status" value={data.marital_status} />
                  <InfoRow label="Height" value={data.height} />
                  <InfoRow label="Sect" value={(data as any).sect} />
                  <InfoRow label="Mother Tongue" value={data.language} />
                  <InfoRow label="Sub-Caste" value={data.sub_caste} />
                  <InfoRow label="City" value={data.city} />
                </div>
              )}

              {/* Education & Career */}
              {data && (
                <div className="bg-white border border-stone-100 rounded-2xl p-5">
                  <SectionHeader icon={GraduationCap} title="Education & Career" />
                  <InfoRow label="Degree" value={data.education} />
                  <InfoRow label="Profession" value={data.profession} />
                  <InfoRow label="Income Range" value={data.income} />
                </div>
              )}

              {isPhotoBlurred && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                  <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-amber-700 text-xs leading-relaxed">
                    Photos are hidden. Candidate set visibility to &ldquo;Visible on Request&rdquo;. Photos will unlock once the proposal is accepted.
                  </p>
                </div>
              )}
            </div>

            {/* Right — actions sidebar */}
            <div className="space-y-4">

              {/* Proposal actions — hidden for admin */}
              {user.role !== "admin" && (
                <div className="bg-gradient-to-b from-white to-rose-50/40 border border-rose-100 rounded-3xl p-5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-4 text-center">
                    Matrimonial Action
                  </h4>

                  {successMsg && (
                    <div className="mb-3 flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2.5 rounded-2xl">
                      <CheckCircle size={13} /> {successMsg}
                    </div>
                  )}

                  {proposalStatus === "received" ? (
                    <div className="space-y-2.5">
                      <div className="text-center text-xs text-rose-600 font-bold mb-3 flex items-center justify-center gap-1.5">
                        <Heart size={13} className="fill-rose-500 text-rose-500" /> They sent you a proposal!
                      </div>
                      <button onClick={() => handleRespondProposal("accepted")} disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold py-3 rounded-2xl shadow-md hover:from-rose-600 hover:to-pink-600 transition-all disabled:opacity-60">
                        <CheckCircle size={14} />{actionLoading ? "Processing..." : "Accept Proposal"}
                      </button>
                      <button onClick={() => handleRespondProposal("rejected")} disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 border border-stone-200 text-stone-500 hover:bg-stone-50 text-xs font-semibold py-3 rounded-2xl transition-all disabled:opacity-60">
                        <X size={13} />Decline
                      </button>
                    </div>
                  ) : proposalStatus === "sent" ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-3 rounded-2xl">
                        <Clock size={14} /> Pending Admin Approval
                      </div>
                    </div>
                  ) : proposalStatus === "accepted" ? (
                    <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-3 rounded-2xl">
                      <CheckCircle size={14} /> Proposal Accepted!
                    </div>
                  ) : proposalStatus === "rejected" ? (
                    <div className="flex items-center justify-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold px-4 py-3 rounded-2xl">
                      <X size={14} /> Proposal Rejected
                    </div>
                  ) : (
                    <button onClick={handleSendProposal} disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold py-3 rounded-2xl shadow-md transition-all disabled:opacity-60 hover:-translate-y-0.5">
                      <Heart size={14} className="fill-white" />{actionLoading ? "Sending..." : "Send Matrimonial Proposal"}
                    </button>
                  )}

                  {/* WhatsApp */}
                  <div className="mt-3">
                    {isProposalAccepted ? (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-3 rounded-2xl shadow-sm transition-all">
                        <MessageCircle size={14} /> Chat on WhatsApp
                      </a>
                    ) : (
                      <button disabled
                        className="w-full flex items-center justify-center gap-2 bg-stone-100 text-stone-400 text-xs font-semibold py-3 rounded-2xl cursor-not-allowed">
                        <Lock size={13} /> WhatsApp locked
                      </button>
                    )}
                    <p className="text-[10px] text-stone-400 mt-2 text-center leading-relaxed">
                      WhatsApp unlocks only after both parties accept the proposal.
                    </p>
                  </div>
                </div>
              )}

              {/* Verification box */}
              <div className="bg-white border border-stone-100 rounded-3xl p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-1.5">
                  <Shield size={11} /> Verification
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Verified</span>
                    <span className={`font-bold ${profile.is_verified ? "text-emerald-600" : "text-amber-600"}`}>
                      {profile.is_verified ? "Yes ✓" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Profile Complete</span>
                    <span className="font-bold text-emerald-600">Yes ✓</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-400">Soulvera ID</span>
                    <span className="font-mono text-[10px] text-stone-600">{profile.soulvera_id}</span>
                  </div>
                </div>
              </div>

              {/* Admin-only contact */}
              {user.role === "admin" && (() => {
                const phone = data?.contact_number || profile.phone || "";
                const phoneForWa = normalizePhone(phone);
                const waMsg = encodeURIComponent(`Assalam-o-Alaikum, I am Soulvera Admin. We are contacting you regarding your profile (ID: ${profile.soulvera_id}).`);
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                      <Lock size={11} /> Admin — Private Contact
                    </div>

                    {/* Phone number */}
                    <div className="bg-white border border-amber-100 rounded-2xl px-3 py-2.5">
                      <div className="text-[10px] text-stone-400 mb-0.5">Phone Number</div>
                      {phone ? (
                        <span className="font-mono font-bold text-stone-800 text-sm">{phone}</span>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Not provided</span>
                      )}
                    </div>

                    {phone ? (
                      <>
                        <a href={`tel:+${phoneForWa}`}
                          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                          <Phone size={13} /> Call Now
                        </a>
                        <a href={`https://wa.me/${phoneForWa}?text=${waMsg}`}
                          target="_blank" rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                          <MessageCircle size={13} /> WhatsApp Message
                        </a>
                      </>
                    ) : null}

                    <div className="pt-2 border-t border-amber-200">
                      <div className="text-[10px] text-stone-400 mb-1">Email</div>
                      <a href={`mailto:${profile.email}`} className="text-xs font-semibold text-rose-600 hover:underline break-all flex items-center gap-1">
                        <Mail size={11} /> {profile.email}
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Admin — no profile wizard done */}
          {user.role === "admin" && !data && (
            <div className="border-t border-stone-100 p-6 sm:p-8">
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-800">Profile wizard complete nahi hua</p>
                  <p className="text-[11px] text-amber-600 mt-0.5">Is user ne abhi tak apni detail submit nahi ki.</p>
                </div>
              </div>
            </div>
          )}

          {/* Admin — Complete Profile Data (full width below) */}
          {user.role === "admin" && data && (
            <div className="border-t border-stone-100 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Shield size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-sm" style={{ fontFamily: "var(--font-display)" }}>Admin — Complete Profile Data</h3>
                  <p className="text-[10px] text-stone-400">Woh tamam information jo user ne submit ki hai</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Account Info */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-600 mb-3">Account Info</p>
                  <div className="space-y-2">
                    {[
                      ["Soulvera ID", profile.soulvera_id],
                      ["Name", profile.name],
                      ["Email", profile.email],
                      ["Phone", profile.phone],
                      ["Role", profile.role === "family" ? "Family Managed" : "Individual"],
                      ["Verified", profile.is_verified ? "Yes ✓" : "Pending"],
                      ["Joined", profile.created_at ? new Date(profile.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-start gap-2 text-xs border-b border-amber-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-400 flex-shrink-0">{label}</span>
                        <span className="font-semibold text-stone-700 text-right break-all">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Details */}
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-rose-500 mb-3">Personal Details</p>
                  <div className="space-y-2">
                    {[
                      ["Age", data.age ? `${data.age} years` : null],
                      ["Gender", data.gender],
                      ["Marital Status", data.marital_status],
                      ["Height", data.height],
                      ["Build", data.build],
                      ["Religion", data.religion],
                      ["Sect", data.sect],
                      ["Religious Practice", data.religious_practice],
                      ["Caste", data.caste],
                      ["Sub-Caste", data.sub_caste],
                      ["Mother Tongue", data.language],
                      ["City", data.city],
                      ["Relocate", data.relocate],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-start gap-2 text-xs border-b border-rose-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-400 flex-shrink-0">{label}</span>
                        <span className="font-semibold text-stone-700 text-right">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education & Career */}
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-sky-600 mb-3">Education & Career</p>
                  <div className="space-y-2">
                    {[
                      ["Education", data.education],
                      ["Grade / Result", data.grade],
                      ["Honors / Distinctions", data.education_honors],
                      ["Islamic Education", data.islamic_education],
                      ["Profession", data.profession],
                      ["Income Range", data.income],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-start gap-2 text-xs border-b border-sky-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-400 flex-shrink-0">{label}</span>
                        <span className="font-semibold text-stone-700 text-right">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Family Info */}
                <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 mb-3">Family Info</p>
                  <div className="space-y-2">
                    {[
                      ["Father Occupation", data.father_occupation],
                      ["Mother Occupation", data.mother_occupation],
                      ["Brothers (Total)", data.brothers_count != null ? String(data.brothers_count) : null],
                      ["Brothers (Married)", data.brothers_married != null ? String(data.brothers_married) : null],
                      ["Sisters (Total)", data.sisters_count != null ? String(data.sisters_count) : null],
                      ["Sisters Educated", data.sisters_educated != null ? (data.sisters_educated ? "Yes" : "No") : null],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-start gap-2 text-xs border-b border-violet-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-400 flex-shrink-0">{label}</span>
                        <span className="font-semibold text-stone-700 text-right">{val || "—"}</span>
                      </div>
                    ))}
                    {data.family_description && (
                      <div className="pt-1">
                        <p className="text-[10px] text-stone-400 mb-1">Family Description</p>
                        <p className="text-xs text-stone-600 leading-relaxed">{data.family_description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Property & Residence */}
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-3">Property & Residence</p>
                  <div className="space-y-2">
                    {[
                      ["Houses (Count)", data.houses_count != null ? String(data.houses_count) : null],
                      ["House Location", data.house_location],
                      ["Agricultural Land", data.agricultural_land != null ? (data.agricultural_land ? "Yes" : "No") : null],
                      ["Plots", data.plots],
                      ["Residence Address", data.residence_address],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-start gap-2 text-xs border-b border-emerald-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-400 flex-shrink-0">{label}</span>
                        <span className="font-semibold text-stone-700 text-right break-all">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Partner Preferences */}
                <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-pink-600 mb-3">Partner Preferences</p>
                  <div className="space-y-2">
                    {[
                      ["Age Range", (data.partner_min_age && data.partner_max_age) ? `${data.partner_min_age}–${data.partner_max_age} yrs` : null],
                      ["Height", data.partner_height],
                      ["Education", data.partner_education],
                      ["Profession", data.partner_profession],
                      ["Caste", data.partner_caste],
                      ["City", data.partner_city],
                      ["Marital Status", data.partner_marital_status],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-start gap-2 text-xs border-b border-pink-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-400 flex-shrink-0">{label}</span>
                        <span className="font-semibold text-stone-700 text-right">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* About Me */}
              {data.about_me && (
                <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">About Me (User ka likha hua)</p>
                  <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{data.about_me}</p>
                </div>
              )}

              {/* Contact + Settings row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">Contact & Settings</p>
                  <div className="space-y-2">
                    {[
                      ["Contact Number", data.contact_number],
                      ["Photo Privacy", data.photo_privacy],
                      ["Profile Complete", data.profile_complete ? "Yes ✓" : "No"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between items-start gap-2 text-xs border-b border-stone-100 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-stone-400 flex-shrink-0">{label}</span>
                        <span className="font-semibold text-stone-700 text-right">{val || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gallery thumbnails */}
                {data.gallery_urls && data.gallery_urls.length > 0 && (
                  <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-3">Gallery ({data.gallery_urls.length} photos)</p>
                    <div className="flex flex-wrap gap-2">
                      {data.gallery_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Gallery ${i + 1}`} className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm hover:opacity-80 transition-opacity" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
