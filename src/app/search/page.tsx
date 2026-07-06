"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import {
  Search, Heart, SlidersHorizontal, X, UserCircle,
  Shield, RotateCcw, GraduationCap, Briefcase, MapPin,
} from "lucide-react";

const API = "http://localhost:5000/api";

interface SearchProfile {
  user_id: string;
  user: { id: string; soulvera_id: string; name: string; role: string; is_verified: boolean; };
  age?: number;
  gender?: string;
  marital_status?: string;
  height?: string;
  religion?: string;
  caste?: string;
  city?: string;
  education?: string;
  profession?: string;
  about_me?: string;
  photo_url?: string;
  photo_privacy?: string;
  profile_complete?: boolean;
}

function FilterLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">{children}</label>;
}

const selectCls = "w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 focus:outline-none transition-all";
const inputCls = "w-full bg-white/80 border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 focus:outline-none transition-all placeholder:text-stone-300";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [city, setCity] = useState(searchParams.get("city") || "All Cities");
  const [religion, setReligion] = useState(searchParams.get("religion") || "All");
  const [caste, setCaste] = useState("");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(60);
  const [maritalStatus, setMaritalStatus] = useState("All");
  const [profession, setProfession] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [appliedGenderFilter, setAppliedGenderFilter] = useState<string | null>(null);
  const [shortlistMap, setShortlistMap] = useState<Record<string, boolean>>({});

  const getToken = () => typeof window !== "undefined" ? localStorage.getItem("soulvera_token") : null;

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  const fetchProfiles = useCallback(async () => {
    const token = getToken();
    if (!token || !user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city !== "All Cities") params.append("city", city);
      if (religion !== "All") params.append("religion", religion);
      if (caste) params.append("caste", caste);
      if (maritalStatus !== "All") params.append("maritalStatus", maritalStatus);
      if (profession) params.append("profession", profession);
      params.append("minAge", String(minAge));
      params.append("maxAge", String(maxAge));
      if (user.role === "family" && appliedGenderFilter) params.append("gender", appliedGenderFilter);

      const res = await fetch(`${API}/profiles?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles || []);
        setAppliedGenderFilter(data.genderFilter || null);
      }
    } catch (err) { console.error("Search failed:", err); }
    finally { setLoading(false); }
  }, [user, city, religion, caste, maritalStatus, profession, minAge, maxAge, appliedGenderFilter]);

  const fetchShortlist = useCallback(async () => {
    const token = getToken();
    if (!token || !user) return;
    try {
      const res = await fetch(`${API}/profiles/shortlist`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const map: Record<string, boolean> = {};
        (data.shortlist || []).forEach((s: any) => { map[s.target_user_id] = true; });
        setShortlistMap(map);
      }
    } catch (err) { console.error("Shortlist fetch failed:", err); }
  }, [user]);

  useEffect(() => {
    if (user) { fetchProfiles(); fetchShortlist(); }
  }, [user, fetchProfiles, fetchShortlist]);

  const handleToggleShortlist = async (userId: string) => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API}/profiles/${userId}/shortlist`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setShortlistMap((prev) => ({ ...prev, [userId]: data.isShortlisted }));
    } catch (err) { console.error("Shortlist toggle failed:", err); }
  };

  const resetFilters = () => {
    setCity("All Cities"); setReligion("All"); setCaste("");
    setMinAge(18); setMaxAge(60); setMaritalStatus("All"); setProfession("");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Loading search...</p>
        </div>
      </div>
    );
  }

  const isFamily = user.role === "family";

  const FilterPanel = () => (
    <div className="glass border border-white/60 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-5">
        <h3 className="font-bold text-stone-800 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-rose-500" /> Filters
        </h3>
        <button onClick={resetFilters} className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1">
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div className="space-y-4">
        {user.role === "individual" && appliedGenderFilter && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-xs font-bold text-rose-700">
              {appliedGenderFilter === "Female" ? "Showing Brides" : "Showing Grooms"}
            </span>
            <p className="text-[10px] text-rose-500/70 mt-0.5">Auto-set for your account</p>
          </div>
        )}

        {isFamily && (
          <div>
            <FilterLabel>Gender</FilterLabel>
            <select value={appliedGenderFilter || "All"} onChange={(e) => setAppliedGenderFilter(e.target.value === "All" ? null : e.target.value)} className={selectCls}>
              <option value="All">Show All</option>
              <option value="Female">Bride (Female)</option>
              <option value="Male">Groom (Male)</option>
            </select>
          </div>
        )}

        <div>
          <FilterLabel>Age Range ({minAge} – {maxAge} yrs)</FilterLabel>
          <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 w-4">Min</span>
              <input type="range" min={18} max={60} value={minAge}
                onChange={(e) => setMinAge(Math.min(parseInt(e.target.value), maxAge - 1))}
                className="flex-1 h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500" />
              <span className="text-[10px] font-bold text-rose-500 w-5">{minAge}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-400 w-4">Max</span>
              <input type="range" min={18} max={60} value={maxAge}
                onChange={(e) => setMaxAge(Math.max(parseInt(e.target.value), minAge + 1))}
                className="flex-1 h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500" />
              <span className="text-[10px] font-bold text-rose-500 w-5">{maxAge}</span>
            </div>
          </div>
        </div>

        <div>
          <FilterLabel>City</FilterLabel>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
            {["All Cities","Lahore","Karachi","Islamabad","Faisalabad","Rawalpindi","Multan","Peshawar","Quetta"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <FilterLabel>Caste / Clan</FilterLabel>
          <input type="text" value={caste} onChange={(e) => setCaste(e.target.value)} placeholder="e.g. Rajput, Syed" className={inputCls} />
        </div>

        <div>
          <FilterLabel>Religion</FilterLabel>
          <select value={religion} onChange={(e) => setReligion(e.target.value)} className={selectCls}>
            <option value="All">All Religions</option>
            <option>Islam</option><option>Christianity</option><option>Hinduism</option><option>Sikhism</option>
          </select>
        </div>

        <div>
          <FilterLabel>Marital Status</FilterLabel>
          <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={selectCls}>
            <option value="All">All Statuses</option>
            <option>Single</option><option>Divorced</option><option>Widowed</option>
          </select>
        </div>

        <div>
          <FilterLabel>Profession</FilterLabel>
          <input type="text" value={profession} onChange={(e) => setProfession(e.target.value)} placeholder="e.g. Doctor, Engineer" className={inputCls} />
        </div>

        <button onClick={fetchProfiles}
          className="w-full bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white text-xs font-bold py-3 rounded-xl shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
          <Search size={14} /> Search Profiles
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      <Header />

      {/* Gender notice */}
      {appliedGenderFilter && user.role === "individual" && (
        <div className="bg-rose-50/80 backdrop-blur-sm border-b border-rose-100 py-2 px-4 mt-16">
          <div className="max-w-7xl mx-auto text-center text-xs font-bold text-rose-600">
            {appliedGenderFilter === "Female" ? "Showing Brides (Female profiles)" : "Showing Grooms (Male profiles)"}
            <span className="font-normal text-rose-500/70 ml-2">— Opposite gender only, as per matrimonial standards.</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 flex-grow">

        {/* Mobile filter button */}
        <div className="flex items-center justify-between mb-5 lg:hidden">
          <h2 className="text-lg font-bold text-stone-800">
            {loading ? "Searching..." : `${profiles.length} Profiles Found`}
          </h2>
          <button onClick={() => setShowMobileSidebar(true)}
            className="flex items-center gap-2 bg-white border border-rose-200 text-rose-600 font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm">
            <SlidersHorizontal size={14} /> Filters
          </button>
        </div>

        {/* Mobile sidebar overlay */}
        {showMobileSidebar && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileSidebar(false)}>
            <div className="absolute left-0 top-0 h-full w-80 bg-white overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-stone-800">Filters</h3>
                <button onClick={() => setShowMobileSidebar(false)} className="text-stone-400 hover:text-stone-600">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar (desktop) */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Results grid */}
          <main className="flex-1">
            <div className="hidden lg:flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                <Search size={18} className="text-rose-500" />
                {loading ? "Searching..." : `${profiles.length} Profiles Found`}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="bg-white/60 border border-stone-100 rounded-3xl h-72 animate-pulse" />
                ))}
              </div>
            ) : profiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {profiles.map((profile) => {
                  const userId = profile.user?.id || profile.user_id;
                  const isShortlisted = !!shortlistMap[userId];
                  const isPhotoBlurred = profile.photo_privacy === "request" || profile.photo_privacy === "private";

                  return (
                    <div key={userId}
                      className="group bg-white border border-stone-100 rounded-3xl shadow-sm hover:shadow-[0_12px_40px_rgba(225,29,72,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col">

                      {/* Card header */}
                      <div className="relative bg-gradient-to-br from-rose-50 to-pink-50 p-5 pb-4">
                        <button
                          onClick={() => handleToggleShortlist(userId)}
                          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-white/90 border border-stone-200 flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        >
                          <Heart size={16} className={isShortlisted ? "text-rose-500 fill-rose-500" : "text-stone-300"} />
                        </button>

                        <div className="flex items-end gap-3">
                          <div className={`w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border-2 ${isShortlisted ? "border-rose-400" : "border-white"} shadow-md ${isPhotoBlurred ? "blur-sm" : ""}`}>
                            {profile.photo_url && profile.photo_url.startsWith("data:image") ? (
                              <img src={profile.photo_url} alt={profile.user?.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
                                <UserCircle size={30} className="text-rose-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 pb-1">
                            <div className="text-[9px] text-stone-400 font-bold mb-0.5">{profile.user?.soulvera_id}</div>
                            <h3 className="font-bold text-stone-800 truncate">{profile.user?.name}</h3>
                            <div className="flex items-center gap-1 mt-0.5">
                              {profile.user?.is_verified && (
                                <Shield size={11} className="text-emerald-500" />
                              )}
                              <span className="text-[10px] text-stone-500">{profile.age} yrs · {profile.marital_status || "Single"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4 flex-1 space-y-2">
                        {[
                          { icon: MapPin, label: profile.city || "—" },
                          { icon: GraduationCap, label: profile.education || "—" },
                          { icon: Briefcase, label: profile.profession || "—" },
                        ].map(({ icon: Icon, label }) => (
                          <div key={label} className="flex items-center gap-2">
                            <Icon size={12} className="text-rose-400 flex-shrink-0" />
                            <span className="text-xs text-stone-600 truncate">{label}</span>
                          </div>
                        ))}
                        {profile.about_me && (
                          <p className="text-[10px] text-stone-400 italic line-clamp-2 leading-relaxed pt-1 border-t border-stone-100 mt-1">
                            &ldquo;{profile.about_me}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Card footer */}
                      <div className="px-4 pb-4">
                        <Link href={`/profile/${userId}`}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-xs font-bold rounded-2xl transition-all shadow-sm hover:shadow-rose-200 hover:shadow-md">
                          View Full Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass border border-white/60 py-20 text-center rounded-3xl">
                <Search size={48} className="mx-auto text-stone-200 mb-4" />
                <h4 className="font-bold text-lg text-stone-700 mb-2">No profiles match your filters</h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto mb-6">
                  Try adjusting age range, city, or other filters. Make sure your profile is complete.
                </p>
                <button onClick={resetFilters}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Clear All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-stone-500 font-medium">Loading search...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
