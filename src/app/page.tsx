"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Heart, Shield, Users, Star, ChevronRight, Check,
  Sparkles, ArrowRight, MessageCircle, Search,
  Award, Lock, Zap, Globe, Quote, PlayCircle,
} from "lucide-react";

/* ── Floating heart particle ─────────────────────────────── */
function FloatingHeart({ style }: { style: React.CSSProperties }) {
  return (
    <div
      className="absolute pointer-events-none select-none text-rose-300/40"
      style={style}
    >
      ♥
    </div>
  );
}

/* ── Animated counter ────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(ease * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── Section wrapper with scroll reveal ──────────────────── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

const HEARTS = [
  { top: "8%",  left: "4%",  fontSize: "2rem",  animationDelay: "0s",    animationDuration: "6s"  },
  { top: "15%", left: "92%", fontSize: "1.5rem", animationDelay: "1s",    animationDuration: "8s"  },
  { top: "45%", left: "2%",  fontSize: "1.2rem", animationDelay: "2s",    animationDuration: "7s"  },
  { top: "60%", left: "96%", fontSize: "1.8rem", animationDelay: "0.5s",  animationDuration: "9s"  },
  { top: "75%", left: "6%",  fontSize: "1rem",   animationDelay: "3s",    animationDuration: "6s"  },
  { top: "85%", left: "90%", fontSize: "1.4rem", animationDelay: "1.5s",  animationDuration: "7s"  },
  { top: "30%", left: "88%", fontSize: "1rem",   animationDelay: "2.5s",  animationDuration: "5s"  },
  { top: "50%", left: "8%",  fontSize: "0.8rem", animationDelay: "4s",    animationDuration: "8s"  },
];

const FEATURES = [
  {
    icon: Shield,
    color: "from-rose-500 to-pink-500",
    bg: "from-rose-50 to-pink-50",
    title: "Fully Verified Profiles",
    desc: "Every profile goes through our rigorous verification process. Browse with complete confidence.",
  },
  {
    icon: Lock,
    color: "from-violet-500 to-purple-500",
    bg: "from-violet-50 to-purple-50",
    title: "Privacy First",
    desc: "Your data stays private. Photos hidden by default, contact revealed only after mutual interest.",
  },
  {
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    bg: "from-pink-50 to-rose-50",
    title: "AI Compatibility",
    desc: "Smart matching based on values, background, family expectations, and partner preferences.",
  },
  {
    icon: MessageCircle,
    color: "from-sky-500 to-blue-500",
    bg: "from-sky-50 to-blue-50",
    title: "Safe Messaging",
    desc: "Payment-gated chat ensures only serious, genuine people connect with each other.",
  },
  {
    icon: Users,
    color: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
    title: "Family Involvement",
    desc: "Dedicated family accounts so parents and siblings can be part of the journey.",
  },
  {
    icon: Award,
    color: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    title: "Premium Support",
    desc: "Dedicated matrimonial advisors available to help you through every step.",
  },
];

const STEPS = [
  {
    step: "01",
    icon: Users,
    title: "Create Your Biodata",
    desc: "Fill in your complete matrimonial profile in 6 elegant steps. Add your education, family details, and partner preferences.",
    color: "from-rose-500 to-pink-500",
  },
  {
    step: "02",
    icon: Search,
    title: "Discover Your Match",
    desc: "Browse verified profiles using smart filters. Save your favorites and receive compatibility suggestions daily.",
    color: "from-violet-500 to-purple-500",
  },
  {
    step: "03",
    icon: Heart,
    title: "Send a Proposal",
    desc: "Express interest with a formal matrimonial proposal. Our admin team ensures both parties are serious.",
    color: "from-pink-500 to-rose-600",
  },
  {
    step: "04",
    icon: MessageCircle,
    title: "Connect & Decide",
    desc: "Once proposals are accepted, unlock secure messaging. Take your time to know each other beautifully.",
    color: "from-emerald-500 to-teal-600",
  },
];

const TESTIMONIALS = [
  {
    name: "Ayesha & Bilal",
    city: "Lahore",
    text: "Soulvera made the entire process feel dignified and respectful. We found each other within 3 months. Alhamdulillah!",
    rating: 5,
    year: "2024",
  },
  {
    name: "Fatima & Hamza",
    city: "Karachi",
    text: "As someone who was nervous about online matrimonials, Soulvera's privacy features and admin oversight made us feel completely safe.",
    rating: 5,
    year: "2024",
  },
  {
    name: "Amna & Usman",
    city: "Islamabad",
    text: "The family account feature was a blessing. My parents could be involved every step of the way. Highly recommended.",
    rating: 5,
    year: "2025",
  },
];

const FAQS = [
  {
    q: "Is Soulvera free to use?",
    a: "Yes! Creating a profile and browsing matches is completely free. Premium features like verified badge, priority matching, and VIP support are available in paid plans.",
  },
  {
    q: "How does profile verification work?",
    a: "Our team manually reviews all uploaded documents and profile information before marking a profile as verified. This ensures authenticity and safety.",
  },
  {
    q: "Can my family be involved in the search?",
    a: "Absolutely. We offer dedicated Family Accounts where parents, siblings, or guardians can manage and oversee the matrimonial process.",
  },
  {
    q: "How is my privacy protected?",
    a: "Photos are blurred by default and only revealed after mutual acceptance. Your contact details are never shared with any third party.",
  },
  {
    q: "What is the payment-gated chat feature?",
    a: "To ensure serious intent, messaging requires a nominal payment that is reviewed by admin before chat is unlocked between matched parties.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [quickCity, setQuickCity] = useState("");

  return (
    <div className="relative overflow-x-hidden">

      {/* ════════════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Mesh background */}
        <div className="absolute inset-0 bg-mesh" />

        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-rose-200/30 to-pink-200/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-violet-200/20 to-pink-200/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
        <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-gradient-to-br from-rose-100/30 to-pink-100/20 rounded-full blur-2xl animate-blob" style={{ animationDelay: "6s" }} />

        {/* Floating hearts */}
        {HEARTS.map((h, i) => (
          <FloatingHeart
            key={i}
            style={{
              top: h.top, left: h.left,
              fontSize: h.fontSize,
              animation: `floatHeart ${h.animationDuration} ease-in-out infinite`,
              animationDelay: h.animationDelay,
            }}
          />
        ))}

        {/* Header space */}
        <div className="h-16" />

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-rose-200/60 shadow-sm mb-8 animate-fadeInDown">
            <span className="w-2 h-2 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 animate-pulse" />
            <span className="text-xs font-bold text-rose-600 tracking-wide uppercase">Pakistan&apos;s Most Trusted Matrimonial Platform</span>
          </div>

          {/* Headline */}
          <h1 className="heading-hero text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] text-stone-900 mb-6 animate-fadeInUp" style={{ animationDelay: "100ms" }}>
            Where Hearts Find{" "}
            <span className="relative inline-block">
              <span className="gradient-text italic">Their Forever.</span>
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 300 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M0 6 Q75 0 150 4 Q225 8 300 2" stroke="url(#u1)" strokeWidth="3" strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="u1" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E11D48" />
                    <stop offset="1" stopColor="#F472B6" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp" style={{ animationDelay: "200ms" }}>
            Discover meaningful relationships through trust, compatibility, and genuine connections.
            Join thousands of verified profiles finding their perfect life partner.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fadeInUp" style={{ animationDelay: "300ms" }}>
            <Link
              href="/register"
              className="group relative overflow-hidden flex items-center gap-2.5 bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-[0_8px_30px_rgba(225,29,72,0.35)] hover:shadow-[0_12px_40px_rgba(225,29,72,0.50)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
            >
              <Heart size={18} className="fill-white animate-heartBeat" />
              Find Your Match
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/register"
              className="group flex items-center gap-2.5 bg-white/80 backdrop-blur-sm text-stone-700 font-bold text-base px-8 py-4 rounded-2xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50/80 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md"
            >
              <Sparkles size={18} className="text-rose-500" />
              Create Profile
              <ChevronRight size={16} className="text-rose-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-500 animate-fadeInUp" style={{ animationDelay: "400ms" }}>
            {[
              { icon: Shield, text: "100% Verified" },
              { icon: Lock, text: "Privacy Protected" },
              { icon: Star, text: "4.9 / 5 Rating" },
            ].map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-1.5 font-medium">
                <Icon size={14} className="text-rose-500" />
                {text}
              </span>
            ))}
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pb-12 animate-fadeInUp" style={{ animationDelay: "500ms" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 10000, suffix: "+", label: "Verified Profiles" },
              { value: 2500, suffix: "+", label: "Successful Matches" },
              { value: 50, suffix: "+", label: "Cities Covered" },
              { value: 99, suffix: "%", label: "Satisfaction Rate" },
            ].map((s) => (
              <div key={s.label} className="glass border border-white/60 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  <Counter target={s.value} suffix={s.suffix} />
                </div>
                <div className="text-xs text-stone-500 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <span className="text-xs text-stone-400 font-medium tracking-wider uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-rose-400 to-transparent animate-bounce-soft" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          HOW IT WORKS
          ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 to-pink-50/20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-16">
            <div className="badge-primary inline-block mb-4">How It Works</div>
            <h2 className="heading-section text-4xl sm:text-5xl text-stone-900 mb-4">
              Your Journey to{" "}
              <span className="gradient-text italic">Happiness</span>
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              Four simple steps to find your perfect life partner through our trusted platform.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.step} delay={i * 120} className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(100%-1rem)] w-8 h-px bg-gradient-to-r from-rose-300 to-pink-200 z-10" />
                )}
                <div className="card-premium p-6 h-full hover:scale-[1.02] transition-all">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <step.icon size={24} className="text-white" />
                  </div>
                  <div className="text-5xl font-black text-rose-100 mb-2 leading-none" style={{ fontFamily: "var(--font-display)" }}>
                    {step.step}
                  </div>
                  <h3 className="font-bold text-stone-900 text-base mb-2">{step.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FEATURES
          ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-stone-50 to-rose-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-100/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-16">
            <div className="badge-primary inline-block mb-4">Why Soulvera</div>
            <h2 className="heading-section text-4xl sm:text-5xl text-stone-900 mb-4">
              Everything You Need for a{" "}
              <span className="gradient-text">Sacred Union</span>
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              We have built every feature with one goal: helping you find your perfect life partner safely and with dignity.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <Reveal key={feat.title} delay={i * 80}>
                <div className="group bg-white rounded-3xl p-7 border border-stone-100 hover:border-rose-200 hover:shadow-[0_20px_60px_rgba(225,29,72,0.10)] transition-all duration-400 hover:-translate-y-2 cursor-default">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feat.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center`}>
                      <feat.icon size={16} className="text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-stone-900 text-base mb-2">{feat.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-violet-50/20" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-16">
            <div className="badge-primary inline-block mb-4">Success Stories</div>
            <h2 className="heading-section text-4xl sm:text-5xl text-stone-900 mb-4">
              Thousands of{" "}
              <span className="gradient-text italic">Happy Families</span>
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              Real stories from real couples who found their forever on Soulvera.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="bg-gradient-to-br from-white to-rose-50/60 border border-rose-100 rounded-3xl p-7 hover:shadow-[0_20px_50px_rgba(225,29,72,0.10)] hover:-translate-y-2 transition-all duration-400">
                  <Quote size={32} className="text-rose-200 mb-4" />
                  <p className="text-stone-600 text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md">
                        <Heart size={14} className="text-white fill-white" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-stone-800">{t.name}</div>
                        <div className="text-xs text-stone-500">{t.city} · {t.year}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, s) => (
                        <Star key={s} size={12} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          PRICING PREVIEW
          ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-rose-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=http://www.w3.org/2000/svg%3E%3Cpath d=M0 0 L60 0 L60 60 L0 60 Z fill=none stroke=white stroke-opacity=0.04 /%3E%3C/svg%3E')] opacity-30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 mb-6">
              <Zap size={14} className="text-amber-300" />
              <span className="text-xs font-bold text-white/90 tracking-wide uppercase">Membership Plans</span>
            </div>
            <h2 className="heading-section text-4xl sm:text-5xl text-white mb-6">
              Choose Your Path to Love
            </h2>
            <p className="text-white/75 text-lg max-w-lg mx-auto mb-10">
              Start free. Upgrade when you are ready. Cancel anytime.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {[
                { name: "Basic Shield", price: "Free", features: ["Browse profiles", "Send 3 proposals", "Basic filters"], color: "bg-white/10" },
                { name: "Premium", price: "₨2,500/mo", features: ["Unlimited proposals", "Advanced filters", "Priority badge", "Verified status"], color: "bg-white/20", popular: true },
                { name: "VIP Elite", price: "₨8,000/mo", features: ["Everything in Premium", "Personal advisor", "Matchmaker access", "VIP badge"], color: "bg-white/10" },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`${plan.color} ${plan.popular ? "ring-2 ring-white/50 scale-105" : ""} backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-left relative transition-transform hover:scale-[1.02]`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      Most Popular
                    </div>
                  )}
                  <div className="text-white font-bold text-sm mb-1">{plan.name}</div>
                  <div className="text-white text-2xl font-black mb-4" style={{ fontFamily: "var(--font-display)" }}>{plan.price}</div>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-white/80 text-sm">
                        <Check size={13} className="text-white flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-white text-rose-600 font-bold text-base px-8 py-4 rounded-2xl hover:bg-rose-50 transition-colors shadow-xl"
            >
              See All Plans
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FAQ
          ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-16">
            <div className="badge-primary inline-block mb-4">FAQ</div>
            <h2 className="heading-section text-4xl sm:text-5xl text-stone-900 mb-4">
              Frequently Asked{" "}
              <span className="gradient-text">Questions</span>
            </h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 60}>
                <div
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "border-rose-300 shadow-[0_4px_20px_rgba(225,29,72,0.10)]" : "border-stone-100 hover:border-rose-200"
                  }`}
                >
                  <button
                    className="w-full flex items-center justify-between p-5 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-bold text-stone-800 text-sm pr-4">{faq.q}</span>
                    <div className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center transition-all ${openFaq === i ? "bg-rose-500 rotate-45" : "bg-rose-50"}`}>
                      <span className={`text-lg leading-none font-bold ${openFaq === i ? "text-white" : "text-rose-500"}`}>+</span>
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-stone-500 text-sm leading-relaxed animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          CTA SECTION
          ════════════════════════════════════════════════════ */}
      <section className="py-24 bg-mesh relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }} />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-200 animate-float">
              <Heart size={28} className="text-white fill-white" />
            </div>
            <h2 className="heading-section text-4xl sm:text-5xl text-stone-900 mb-4">
              Your Story Begins{" "}
              <span className="gradient-text italic">Today</span>
            </h2>
            <p className="text-stone-500 text-lg max-w-lg mx-auto mb-10">
              Join thousands of people who trusted Soulvera to help them find their forever. Your perfect match is waiting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group relative overflow-hidden flex items-center justify-center gap-2.5 bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-[0_8px_30px_rgba(225,29,72,0.35)] hover:shadow-[0_12px_40px_rgba(225,29,72,0.50)] transition-all hover:-translate-y-1"
              >
                <Heart size={18} className="fill-white" />
                Create Free Profile
              </Link>
              <Link
                href="/search"
                className="flex items-center justify-center gap-2 bg-white text-stone-700 font-bold text-base px-8 py-4 rounded-2xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50 transition-all hover:-translate-y-1 shadow-sm"
              >
                <Search size={16} className="text-rose-500" />
                Browse Profiles
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════════════ */}
      <footer className="bg-stone-900 text-stone-300 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                  <Heart size={16} className="text-white fill-white" />
                </div>
                <span className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>
                  Soul<span className="text-rose-400">vera</span>
                </span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed max-w-xs mb-6">
                Pakistan&apos;s most trusted matrimonial platform. Helping hearts find their forever since 2024.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: Globe, label: "Website" },
                  { icon: MessageCircle, label: "Support" },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-rose-600 flex items-center justify-center transition-colors" aria-label={label}>
                    <Icon size={14} className="text-stone-300" />
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-bold text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/search", label: "Browse Profiles" },
                  { href: "/register", label: "Create Account" },
                  { href: "/pricing", label: "Pricing" },
                  { href: "/register?tab=login", label: "Sign In" },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-stone-400 hover:text-rose-400 text-sm transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-sm mb-4">Company</h4>
              <ul className="space-y-2.5">
                {["About Us", "Privacy Policy", "Terms of Service", "Contact"].map((l) => (
                  <li key={l}>
                    <span className="text-stone-400 text-sm cursor-default">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-500 text-sm">© 2025 Soulvera. All rights reserved. Made with <Heart size={12} className="inline text-rose-500 fill-rose-500 mx-0.5" /> in Pakistan.</p>
            <div className="flex items-center gap-4 text-stone-500 text-xs">
              <span>Privacy Policy</span>
              <span>·</span>
              <span>Terms</span>
              <span>·</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
