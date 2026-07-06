"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, ProfileData } from "../../context/AuthContext";
import {
  Heart, User, BookOpen, Home, Star, Lock, Camera,
  ChevronRight, ChevronLeft, CheckCircle, AlertCircle, Phone,
  Briefcase, MapPin, Users, Globe, Eye, EyeOff, Sparkles,
} from "lucide-react";

const TOTAL_STEPS = 6;

const cities = [
  "Lahore", "Karachi", "Islamabad", "Faisalabad", "Rawalpindi", "Multan",
  "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Sargodha", "Bahawalpur",
  "Hyderabad", "Sukkur", "Larkana", "Abbottabad", "Mardan", "Mingora",
];

const heights = [
  "4'10\"","4'11\"","5'0\"","5'1\"","5'2\"","5'3\"","5'4\"","5'5\"",
  "5'6\"","5'7\"","5'8\"","5'9\"","5'10\"","5'11\"","6'0\"","6'1\"","6'2\"","6'3\"",
];

const educationOptions = [
  "Primary / Middle",
  "Matriculation (SSC / O-Level)",
  "Intermediate (FSC / FA / ICS / ICOM / A-Level)",
  "Diploma / Certificate (DAE / DIT / D.Pharm)",
  "Bachelor's — BA / BSc / BCom / BEd / BCS",
  "Bachelor's Engineering (BE / BSE / BEng)",
  "MBBS",
  "BDS (Dental)",
  "LLB / Law Graduate",
  "Master's — MA / MSc / MCom / MEd / MCS",
  "MBA",
  "MPhil",
  "PhD / Doctorate",
  "CA (Chartered Accountant)",
  "ACCA",
  "CIMA",
  "CFA",
  "MD / Specialist Doctor",
  "Double Master's",
  "Triple Master's",
  "Hafiz-e-Quran (with Formal Education)",
  "Alim / Alimah Degree",
  "Other",
];

const gradeOptions = [
  "Student / Fresher",
  "BPS-1 to BPS-5","BPS-6 to BPS-10","BPS-11 to BPS-15",
  "BPS-16 (Officer Grade)","BPS-17 (Assistant Commissioner / SDO)",
  "BPS-18 (Deputy Commissioner / Senior Officer)","BPS-19","BPS-20",
  "BPS-21 (Secretary / DG Level)","BPS-22 (Federal Secretary / IGP Level)",
  "Junior Officer / Executive","Senior Officer","Assistant Manager",
  "Deputy Manager","Manager","Senior Manager","General Manager",
  "Director","CEO / COO / CFO","Proprietor / Business Owner",
  "Self-Employed / Freelancer","Retired","Not Applicable",
];

const honorsOptions = [
  "None","Position Holder (Board Level / School)","Position Holder (University Level)",
  "Gold Medalist","Silver Medalist","Dean's List / Merit List",
  "Merit Scholarship Holder","CSS Qualified","PMS Qualified","FPSC Qualified",
  "Provincial Commission Qualified","International Scholarship (Chevening / Fulbright / HEC)",
  "LUMS / NUST / IBA Topper","Other National Award",
];

const islamicEducationOptions = [
  "None / Not Applicable","Basic Quranic Reading (Qaida / Noorani Qaida)",
  "Nazra Quran (Complete Recitation)","Quran with Tajweed","Quran with Translation (Tarjuma)",
  "Quran with Tafseer","Hafiz-e-Quran","Hafiz-e-Quran with Tajweed",
  "Partial Dars-e-Nizami","Dars-e-Nizami Complete (Alim / Alimah)",
  "Hifz + Dars-e-Nizami","Alimah Course (Female Madrasa)",
  "Islamic Studies — BA / BSc","Islamic Studies — MA / MSc","Sharia Degree","Other Islamic Studies",
];

const parentOccupationOptions = [
  "Retired (Government Service)","Retired (Military / Defense)","Retired (Private Sector)",
  "Government Officer — Federal","Government Officer — Provincial",
  "Military Officer (Army / Navy / Air Force)","Police Officer",
  "Doctor / Medical Professional","Engineer","Lawyer / Advocate / Judge",
  "Teacher / Lecturer / Professor","Business / Entrepreneur",
  "Agriculture / Farmer","Shopkeeper / Trader","Textile / Industry","Real Estate",
  "Skilled Worker / Technician","Overseas (UK / Europe / Australia)",
  "Overseas (USA / Canada)","Overseas (Middle East)","Deceased","Not Applicable","Other",
];

const motherOccupationOptions = [
  "Homemaker","Teacher / School Teacher","Lecturer / Professor","Doctor / Nurse",
  "Government Employee","Private Sector Employee","Business / Self-Employed",
  "Retired","Overseas (Working Abroad)","Deceased","Not Applicable","Other",
];

const countOptions = Array.from({ length: 11 }, (_, i) => String(i));

const familyDescriptionTags = [
  "Respectable Family","Religious / Practicing Family","Educated Family",
  "Joint Family System","Nuclear Family System","Middle Class",
  "Upper Middle Class","Well-Established / Affluent","Government Service Background",
  "Business Family","Military / Defense Background","Medical Family",
  "Agricultural Background","Conservative / Traditional Values",
  "Modern but Islamic Values","Settled in City","Village / Rural Background",
  "Overseas Family Members","Hospitality-Oriented","Close-Knit Family",
  "Simple & Humble","Open-Minded & Progressive",
];

const professionOptions = [
  "Student","Doctor (MBBS)","Specialist Doctor / Surgeon","Dentist (BDS)","Pharmacist",
  "Nurse / Paramedic","Engineer — Civil / Structural","Engineer — Electrical",
  "Engineer — Mechanical","Engineer — Chemical","Software Engineer / Developer",
  "IT Professional / Systems Admin","Data Scientist / AI Engineer",
  "Graphic Designer / UI-UX","Teacher / School Lecturer","College / University Lecturer",
  "Professor","Lawyer / Advocate","Judge / Magistrate",
  "Government Officer — Federal (CSS/PMS)","Government Officer — Provincial",
  "Police Officer","Military Officer — Army","Military Officer — Navy / Air Force",
  "Chartered Accountant (CA)","ACCA / CFA Professional","Banker / Finance Professional",
  "Accountant","Business / Entrepreneur","Textile / Manufacturing Industry",
  "Agriculture / Farmer","Shopkeeper / Trader","Real Estate Agent / Developer",
  "Journalist / Media Professional","Overseas Pakistani (UK)","Overseas Pakistani (USA / Canada)",
  "Overseas Pakistani (Middle East)","Overseas Pakistani (Europe / Australia)",
  "Skilled Worker / Technician","Driver / Transporter","Retired","Housewife / Homemaker",
  "Not Employed","Other",
];

// ── Shared style helpers ─────────────────────────────────────────────────────
const inputCls =
  "w-full bg-white/80 border border-stone-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-400/50 focus:border-rose-400 focus:outline-none transition-all placeholder:text-stone-300";

const selectCls = inputCls;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
      {children}
    </label>
  );
}

function Field({ children, full }: { children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "sm:col-span-2" : ""}>{children}</div>;
}

// Step metadata
const STEPS = [
  { label: "Personal", icon: User, color: "from-rose-500 to-pink-500" },
  { label: "Education", icon: BookOpen, color: "from-violet-500 to-purple-500" },
  { label: "Family", icon: Users, color: "from-amber-500 to-orange-500" },
  { label: "Residence", icon: Home, color: "from-teal-500 to-cyan-500" },
  { label: "Partner", icon: Heart, color: "from-rose-500 to-pink-500" },
  { label: "Privacy", icon: Lock, color: "from-emerald-500 to-green-500" },
];

export default function ProfileWizard() {
  const router = useRouter();
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── Step 1: Personal ────────────────────────────────────────────────────────
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState("5'7\"");
  const [build, setBuild] = useState("Average");
  const [maritalStatus, setMaritalStatus] = useState("Never Married");
  const [city, setCity] = useState("Lahore");
  const [religion, setReligion] = useState("Islam");
  const [sect, setSect] = useState("Sunni");
  const [religiousPractice, setReligiousPractice] = useState("Practicing Regularly");
  const [relocate, setRelocate] = useState("Flexible");

  // ── Step 2: Education & Career ──────────────────────────────────────────────
  const [education, setEducation] = useState(educationOptions[0]);
  const [grade, setGrade] = useState(gradeOptions[0]);
  const [educationHonors, setEducationHonors] = useState(honorsOptions[0]);
  const [islamicEducation, setIslamicEducation] = useState(islamicEducationOptions[0]);
  const [profession, setProfession] = useState(professionOptions[0]);
  const [income, setIncome] = useState("100k - 150k PKR/month");
  const [language, setLanguage] = useState("Urdu");
  const [caste, setCaste] = useState("");

  // ── Step 3: Family ──────────────────────────────────────────────────────────
  const [fatherOccupation, setFatherOccupation] = useState(parentOccupationOptions[0]);
  const [motherOccupation, setMotherOccupation] = useState(motherOccupationOptions[0]);
  const [brothersCount, setBrothersCount] = useState("0");
  const [brothersMarried, setBrothersMarried] = useState("0");
  const [sistersCount, setSistersCount] = useState("0");
  const [sistersEducated, setSistersEducated] = useState(false);
  const [familyTags, setFamilyTags] = useState<string[]>([]);
  const [familyDescription, setFamilyDescription] = useState("");

  const toggleFamilyTag = (tag: string) =>
    setFamilyTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  // ── Step 4: Residence & Assets ──────────────────────────────────────────────
  const [housesCount, setHousesCount] = useState(0);
  const [houseLocation, setHouseLocation] = useState("");
  const [agriculturalLand, setAgriculturalLand] = useState(false);
  const [plots, setPlots] = useState("");
  const [residenceAddress, setResidenceAddress] = useState("");

  // ── Step 5: Partner Preferences ────────────────────────────────────────────
  const [partnerMinAge, setPartnerMinAge] = useState(22);
  const [partnerMaxAge, setPartnerMaxAge] = useState(35);
  const [partnerHeight, setPartnerHeight] = useState("5'2\" or above");
  const [partnerEducation, setPartnerEducation] = useState("Any");
  const [partnerProfession, setPartnerProfession] = useState("Any Respectable Profession");
  const [partnerCaste, setPartnerCaste] = useState("Any Respectable Family");
  const [partnerCity, setPartnerCity] = useState("Any City");
  const [partnerMaritalStatus, setPartnerMaritalStatus] = useState("Never Married");

  // ── Step 6: About & Privacy ─────────────────────────────────────────────────
  const [aboutMe, setAboutMe] = useState("");
  const [photoPrivacy, setPhotoPrivacy] = useState<"public" | "request" | "private">("request");
  const [contactNumber, setContactNumber] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mesh">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const validateStep = () => {
    if (step === 1 && (!city || !religion)) { setError("Please fill all required fields."); return false; }
    if (step === 2 && !caste.trim()) { setError("Please enter your caste / biradari."); return false; }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (!validateStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };
  const handlePrev = () => { setError(""); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const data: ProfileData = {
        gender, age, height, build, maritalStatus, city, religion, sect,
        religiousPractice, relocate,
        education, grade, educationHonors, islamicEducation, profession, income,
        caste, subCaste: "", language,
        fatherOccupation, motherOccupation,
        brothersCount: parseInt(brothersCount),
        brothersMarried: parseInt(brothersMarried),
        sistersCount: parseInt(sistersCount),
        sistersEducated,
        familyDescription: familyTags.length
          ? familyTags.join(", ") + (familyDescription ? ". " + familyDescription : "")
          : familyDescription,
        housesCount, houseLocation, agriculturalLand, plots, residenceAddress,
        partnerMinAge, partnerMaxAge, partnerHeight, partnerEducation,
        partnerProfession, partnerCaste, partnerCity, partnerMaritalStatus,
        aboutMe, photoPrivacy, contactNumber,
        photoUrl: gender === "Male" ? "👨‍💼" : "👩‍💼",
      };
      await updateProfile(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const currentStep = STEPS[step - 1];
  const StepIcon = currentStep.icon;
  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-mesh flex flex-col justify-center py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-rose-200/20 rounded-full blur-3xl pointer-events-none -z-10 animate-blob" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-200/15 rounded-full blur-3xl pointer-events-none -z-10 animate-blob" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-100/10 rounded-full blur-3xl pointer-events-none -z-10 animate-blob" style={{ animationDelay: "4s" }} />

      {/* Logo + Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center mb-8 animate-fadeInDown">
        <Link href="/" className="inline-flex items-center gap-2.5 group mb-5">
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

        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Your <span className="gradient-text">Matrimonial Biodata</span>
        </h1>
        <p className="text-stone-500 text-sm">
          Welcome, <span className="font-semibold text-rose-600">{user.name}</span> — complete your profile to find your best match.
        </p>

        {/* Step progress */}
        <div className="mt-6 max-w-xl mx-auto">
          {/* Step dots */}
          <div className="flex justify-between items-center mb-3 relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-stone-200 -z-0" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-rose-500 to-pink-400 -z-0 transition-all duration-500"
              style={{ width: `${progressPct}%` }} />
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done = step > i + 1;
              const active = step === i + 1;
              return (
                <div key={s.label} className="relative z-10 flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    done ? "bg-gradient-to-br from-rose-500 to-pink-500 border-rose-500 shadow-md shadow-rose-200" :
                    active ? "bg-white border-rose-500 shadow-lg shadow-rose-200 scale-110" :
                    "bg-white border-stone-200"
                  }`}>
                    {done
                      ? <CheckCircle size={14} className="text-white" />
                      : <Icon size={13} className={active ? "text-rose-500" : "text-stone-300"} />
                    }
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${
                    active ? "text-rose-600" : done ? "text-rose-400" : "text-stone-300"
                  }`}>{s.label}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-stone-400 font-medium">
            Step <span className="text-rose-600 font-bold">{step}</span> of {TOTAL_STEPS}
            <span className="mx-2 text-stone-200">•</span>
            <span className="text-rose-500 font-semibold">{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl animate-fadeInUp" style={{ animationDelay: "0.1s" }}>
        <div className="glass border border-white/60 py-8 px-6 sm:px-10 rounded-3xl shadow-[0_24px_80px_rgba(225,29,72,0.10)]">

          {/* Step header */}
          <div className="flex items-center gap-4 mb-7 pb-5 border-b border-stone-100">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentStep.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
              <StepIcon size={22} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5">Step {step} of {TOTAL_STEPS}</div>
              <h2 className="text-xl font-bold text-stone-900" style={{ fontFamily: "var(--font-display)" }}>
                {step === 1 && "Personal & Basic Details"}
                {step === 2 && "Education, Career & Community"}
                {step === 3 && "Family Background"}
                {step === 4 && "Residence & Assets"}
                {step === 5 && "Preferred Life Partner"}
                {step === 6 && "About You & Privacy"}
              </h2>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 bg-rose-50 border border-rose-200 p-4 rounded-2xl">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-rose-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* ══ STEP 1: Personal ══ */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
                <div>
                  <Label>Gender *</Label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectCls}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>

                <div>
                  <Label>Age *</Label>
                  <input type="number" min={18} max={70} value={age}
                    onChange={(e) => setAge(parseInt(e.target.value))} className={inputCls} />
                </div>

                <div>
                  <Label>Height *</Label>
                  <select value={height} onChange={(e) => setHeight(e.target.value)} className={selectCls}>
                    {heights.map((h) => <option key={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Build / Physique</Label>
                  <select value={build} onChange={(e) => setBuild(e.target.value)} className={selectCls}>
                    <option>Slim</option>
                    <option>Average</option>
                    <option>Well-Built</option>
                    <option>Athletic</option>
                    <option>Heavy</option>
                  </select>
                </div>

                <div>
                  <Label>Marital Status *</Label>
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className={selectCls}>
                    <option>Never Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                    <option>Khula</option>
                  </select>
                </div>

                <div>
                  <Label>City *</Label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className={selectCls}>
                    {cities.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Religion *</Label>
                  <select value={religion} onChange={(e) => setReligion(e.target.value)} className={selectCls}>
                    <option>Islam</option>
                    <option>Christianity</option>
                    <option>Hinduism</option>
                    <option>Sikhism</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <Label>Sect / Maslak</Label>
                  <select value={sect} onChange={(e) => setSect(e.target.value)} className={selectCls}>
                    <option>Sunni</option>
                    <option>Shia</option>
                    <option>Barelvi</option>
                    <option>Deobandi</option>
                    <option>Ahl-e-Hadith</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <Label>Religious Practice</Label>
                  <select value={religiousPractice} onChange={(e) => setReligiousPractice(e.target.value)} className={selectCls}>
                    <option>Practicing Regularly</option>
                    <option>Practicing Occasionally</option>
                    <option>Not Practicing</option>
                    <option>Liberal</option>
                  </select>
                </div>

                <div>
                  <Label>Willing to Relocate?</Label>
                  <select value={relocate} onChange={(e) => setRelocate(e.target.value)} className={selectCls}>
                    <option>Yes</option>
                    <option>No</option>
                    <option>Only For Job</option>
                    <option>Flexible</option>
                    <option>After Marriage</option>
                  </select>
                </div>
              </div>
            )}

            {/* ══ STEP 2: Education & Career ══ */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
                <Field full>
                  <Label>Degree(s) / Education *</Label>
                  <select value={education} onChange={(e) => setEducation(e.target.value)} className={selectCls}>
                    {educationOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>

                <div>
                  <Label>Job Grade / Designation</Label>
                  <select value={grade} onChange={(e) => setGrade(e.target.value)} className={selectCls}>
                    {gradeOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Honors / Awards</Label>
                  <select value={educationHonors} onChange={(e) => setEducationHonors(e.target.value)} className={selectCls}>
                    {honorsOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Islamic Education</Label>
                  <select value={islamicEducation} onChange={(e) => setIslamicEducation(e.target.value)} className={selectCls}>
                    {islamicEducationOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <Field full>
                  <Label>Profession *</Label>
                  <select value={profession} onChange={(e) => setProfession(e.target.value)} className={selectCls}>
                    {professionOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>

                <div>
                  <Label>Monthly Income</Label>
                  <select value={income} onChange={(e) => setIncome(e.target.value)} className={selectCls}>
                    <option>Under 50k PKR/month</option>
                    <option>50k - 100k PKR/month</option>
                    <option>100k - 150k PKR/month</option>
                    <option>150k - 250k PKR/month</option>
                    <option>250k - 400k PKR/month</option>
                    <option>400k+ PKR/month</option>
                    <option>Prefer Not to Say</option>
                  </select>
                </div>

                <div>
                  <Label>Caste / Biradari *</Label>
                  <input type="text" value={caste} onChange={(e) => setCaste(e.target.value)}
                    placeholder="e.g. Jutt, Syed, Rajput, Awan"
                    className={inputCls} />
                </div>

                <div>
                  <Label>Mother Tongue</Label>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)} className={selectCls}>
                    {["Urdu","Punjabi","Sindhi","Pashto","Balochi","Saraiki","Kashmiri","English"].map(l => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ══ STEP 3: Family Background ══ */}
            {step === 3 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
                <div>
                  <Label>Father&apos;s Occupation</Label>
                  <select value={fatherOccupation} onChange={(e) => setFatherOccupation(e.target.value)} className={selectCls}>
                    {parentOccupationOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Mother&apos;s Occupation</Label>
                  <select value={motherOccupation} onChange={(e) => setMotherOccupation(e.target.value)} className={selectCls}>
                    {motherOccupationOptions.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Number of Brothers</Label>
                  <select value={brothersCount} onChange={(e) => setBrothersCount(e.target.value)} className={selectCls}>
                    {countOptions.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Brothers Married</Label>
                  <select value={brothersMarried} onChange={(e) => setBrothersMarried(e.target.value)} className={selectCls}>
                    {countOptions.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Number of Sisters</Label>
                  <select value={sistersCount} onChange={(e) => setSistersCount(e.target.value)} className={selectCls}>
                    {countOptions.map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="sisEdu" checked={sistersEducated}
                    onChange={(e) => setSistersEducated(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 rounded" />
                  <label htmlFor="sisEdu" className="text-sm font-semibold text-stone-700">Sisters are Educated</label>
                </div>

                <Field full>
                  <Label>About Family <span className="font-normal normal-case text-stone-400">(select all that apply)</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {familyDescriptionTags.map((tag) => {
                      const active = familyTags.includes(tag);
                      return (
                        <button key={tag} type="button" onClick={() => toggleFamilyTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            active
                              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-rose-500 shadow-sm shadow-rose-200"
                              : "bg-white/60 border-stone-200 text-stone-500 hover:border-rose-300 hover:text-rose-500"
                          }`}>
                          {active ? <CheckCircle size={10} className="inline mr-1" /> : null}{tag}
                        </button>
                      );
                    })}
                  </div>
                  {familyTags.length > 0 && (
                    <p className="mt-2 text-xs text-rose-500 font-semibold">
                      {familyTags.length} tag{familyTags.length !== 1 ? "s" : ""} selected
                    </p>
                  )}
                </Field>

                <Field full>
                  <Label>Additional Details <span className="font-normal normal-case text-stone-400">(optional)</span></Label>
                  <textarea rows={2} value={familyDescription} onChange={(e) => setFamilyDescription(e.target.value)}
                    placeholder="Any other details about family background, values, city, etc..."
                    className={inputCls + " resize-none"} />
                </Field>
              </div>
            )}

            {/* ══ STEP 4: Residence & Assets ══ */}
            {step === 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
                <div>
                  <Label>Number of Houses Owned</Label>
                  <input type="number" min={0} max={50} value={housesCount}
                    onChange={(e) => setHousesCount(parseInt(e.target.value) || 0)} className={inputCls} />
                </div>

                <div>
                  <Label>House Location(s)</Label>
                  <input type="text" value={houseLocation} onChange={(e) => setHouseLocation(e.target.value)}
                    placeholder="e.g. 2 in Village, 1 in City under construction"
                    className={inputCls} />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input type="checkbox" id="agriLand" checked={agriculturalLand}
                    onChange={(e) => setAgriculturalLand(e.target.checked)}
                    className="w-4 h-4 accent-rose-500 rounded" />
                  <label htmlFor="agriLand" className="text-sm font-semibold text-stone-700">Have Agricultural Land</label>
                </div>

                <div>
                  <Label>Plots / Commercial Property</Label>
                  <input type="text" value={plots} onChange={(e) => setPlots(e.target.value)}
                    placeholder="e.g. 2 Residential Plots in DHA"
                    className={inputCls} />
                </div>

                <Field full>
                  <Label>Permanent / Current Residence</Label>
                  <input type="text" value={residenceAddress} onChange={(e) => setResidenceAddress(e.target.value)}
                    placeholder="e.g. Samundari Road, Dijkot, Faisalabad"
                    className={inputCls} />
                </Field>
              </div>
            )}

            {/* ══ STEP 5: Partner Preferences ══ */}
            {step === 5 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-fadeIn">
                <div>
                  <Label>Partner Min Age</Label>
                  <input type="number" min={18} max={70} value={partnerMinAge}
                    onChange={(e) => setPartnerMinAge(parseInt(e.target.value))} className={inputCls} />
                </div>

                <div>
                  <Label>Partner Max Age</Label>
                  <input type="number" min={18} max={70} value={partnerMaxAge}
                    onChange={(e) => setPartnerMaxAge(parseInt(e.target.value))} className={inputCls} />
                </div>

                <div>
                  <Label>Partner Min Height</Label>
                  <select value={partnerHeight} onChange={(e) => setPartnerHeight(e.target.value)} className={selectCls}>
                    <option>No Preference</option>
                    {heights.map((h) => <option key={h}>{h} or above</option>)}
                  </select>
                </div>

                <div>
                  <Label>Partner Education</Label>
                  <input type="text" value={partnerEducation} onChange={(e) => setPartnerEducation(e.target.value)}
                    placeholder="e.g. Master's Degree, Any, Graduate"
                    className={inputCls} />
                </div>

                <div>
                  <Label>Partner Profession</Label>
                  <input type="text" value={partnerProfession} onChange={(e) => setPartnerProfession(e.target.value)}
                    placeholder="e.g. Any Respectable Profession, Doctor"
                    className={inputCls} />
                </div>

                <div>
                  <Label>Partner Caste / Family</Label>
                  <input type="text" value={partnerCaste} onChange={(e) => setPartnerCaste(e.target.value)}
                    placeholder="e.g. Any Respectable Family, Syed"
                    className={inputCls} />
                </div>

                <div>
                  <Label>Partner City Preference</Label>
                  <input type="text" value={partnerCity} onChange={(e) => setPartnerCity(e.target.value)}
                    placeholder="e.g. Any City, Lahore, Village OK"
                    className={inputCls} />
                </div>

                <div>
                  <Label>Partner Marital Status</Label>
                  <select value={partnerMaritalStatus} onChange={(e) => setPartnerMaritalStatus(e.target.value)} className={selectCls}>
                    <option>Never Married</option>
                    <option>Divorced</option>
                    <option>Widowed</option>
                    <option>Never Married, Divorced Or Widowed (Without Children)</option>
                    <option>Any</option>
                  </select>
                </div>
              </div>
            )}

            {/* ══ STEP 6: About & Privacy ══ */}
            {step === 6 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <Label>About Me / Introduction</Label>
                  <textarea rows={5} value={aboutMe} onChange={(e) => setAboutMe(e.target.value)}
                    placeholder="Write a brief introduction about yourself, your values, family background, and what you are looking for in a life partner..."
                    className={inputCls + " resize-none"} />
                  <p className="text-xs text-stone-400 mt-1.5">This will appear on your public profile card.</p>
                </div>

                <div>
                  <Label>Photo Visibility</Label>
                  <div className="space-y-3 mt-1">
                    {[
                      {
                        val: "public",
                        icon: Globe,
                        iconColor: "text-sky-500",
                        iconBg: "from-sky-100 to-blue-100",
                        title: "Public",
                        desc: "All registered members can see your photos.",
                      },
                      {
                        val: "request",
                        icon: Eye,
                        iconColor: "text-rose-500",
                        iconBg: "from-rose-100 to-pink-100",
                        title: "Visible on Request",
                        badge: "Recommended",
                        desc: "Photos are blurred by default. Revealed only after proposal is accepted.",
                      },
                      {
                        val: "private",
                        icon: Lock,
                        iconColor: "text-stone-500",
                        iconBg: "from-stone-100 to-slate-100",
                        title: "Private",
                        desc: "Photos are completely hidden. Share manually in messages only.",
                      },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const active = photoPrivacy === opt.val;
                      return (
                        <button key={opt.val} type="button"
                          onClick={() => setPhotoPrivacy(opt.val as "public" | "request" | "private")}
                          className={`w-full p-4 border-2 rounded-2xl text-left flex items-center gap-4 transition-all ${
                            active
                              ? "border-rose-400 bg-rose-50/50 shadow-md shadow-rose-100"
                              : "border-stone-200 bg-white/60 hover:border-rose-200 hover:bg-rose-50/30"
                          }`}>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <Icon size={18} className={opt.iconColor} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-stone-800">{opt.title}</span>
                              {opt.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full">
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5">{opt.desc}</p>
                          </div>
                          {active && (
                            <CheckCircle size={18} className="text-rose-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Contact Number — admin only */}
                <div className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Phone size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700">
                        Contact Number
                      </h4>
                      <p className="text-[10px] text-amber-600 font-medium">Admin Only — Strictly Private</p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-600 mb-3 leading-relaxed">
                    This number will ONLY be visible to Soulvera admin. It will never be shown to other users. Admin may use it to call or WhatsApp you regarding your profile.
                  </p>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+92 300 1234567"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-stone-100">
              {step > 1 ? (
                <button type="button" onClick={handlePrev}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-stone-200 text-stone-600 rounded-2xl text-sm font-bold hover:bg-stone-50 hover:border-stone-300 transition-all">
                  <ChevronLeft size={16} />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < TOTAL_STEPS ? (
                <button type="button" onClick={handleNext}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5">
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button type="submit" disabled={saving}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 transition-all disabled:opacity-60 hover:-translate-y-0.5">
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving Profile...</>
                  ) : (
                    <><Sparkles size={16} />Complete Profile</>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-stone-400 mt-5">
          Your data is encrypted and only shared with matched profiles.
          <Link href="/dashboard" className="ml-1 text-rose-500 font-semibold hover:underline">Skip for now</Link>
        </p>
      </div>
    </div>
  );
}
