"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart, Check, X, Zap, Crown, Shield,
  Star, ArrowRight, Sparkles,
} from "lucide-react";

const PLANS = [
  {
    name: "Basic Shield",
    icon: Shield,
    color: "from-stone-400 to-stone-500",
    bg: "from-stone-50 to-stone-50",
    priceMonthly: 0,
    priceYearly: 0,
    description: "Standard access to matchmaking for individuals.",
    features: [
      "Create 1 detailed profile",
      "Browse matches in city directory",
      "Send up to 5 proposals",
      "Standard photo visibility",
    ],
    cta: "Current Free Tier",
    popular: false,
    highlight: false,
  },
  {
    name: "Soulvera Premium",
    icon: Star,
    color: "from-rose-500 to-pink-500",
    bg: "from-rose-50 to-pink-50",
    priceMonthly: 2500,
    priceYearly: 20000,
    description: "Advanced controls and direct contact channels.",
    features: [
      "Everything in Basic",
      "Unlimited matrimonial proposals",
      "Unlock direct WhatsApp buttons",
      "View photos unblurred",
      "Highlight in recommendations",
    ],
    cta: "Get Premium Match",
    popular: false,
    highlight: true,
  },
  {
    name: "VIP Elite Agent",
    icon: Crown,
    color: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    priceMonthly: 8000,
    priceYearly: 65000,
    description: "Dedicated matchmaker assistance for your family.",
    features: [
      "Everything in Premium",
      "Personal matchmaker agent",
      "Family-to-family coordination",
      "Offline meeting setup",
      "Pre-screened background files",
    ],
    cta: "Hire VIP Agent",
    popular: true,
    highlight: false,
  },
];

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleCtaClick = (planName: string) => {
    if (planName === "Basic Shield") return;
    setSelectedPlan(planName);
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSuccess(true);
    setTimeout(() => { setShowCheckout(false); setPaymentSuccess(false); }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-mesh">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-rose-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-md">
              <Heart size={16} className="text-white fill-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              <span className="gradient-text">Soul</span><span className="text-stone-800">vera</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-xs font-bold text-stone-500 hover:text-rose-600 transition-colors py-2 flex items-center gap-1">
            Dashboard <ArrowRight size={13} />
          </Link>
        </div>
      </header>

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-28 pb-20 flex-grow">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="badge-primary inline-block mb-4">Membership Plans</div>
          <h1 className="heading-section text-4xl sm:text-5xl text-stone-900 mb-4">
            Invest in Your{" "}
            <span className="gradient-text italic">Forever Together</span>
          </h1>
          <p className="text-stone-500 text-base max-w-md mx-auto">
            Choose a plan that fits your matchmaking needs. No hidden charges.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/80 border border-stone-200 rounded-2xl p-2 shadow-sm">
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${billingCycle === "monthly" ? "bg-rose-500 text-white shadow-sm" : "text-stone-400"}`}
              onClick={() => setBillingCycle("monthly")}>Monthly</span>
            <button onClick={() => setBillingCycle((c) => c === "monthly" ? "yearly" : "monthly")}
              className="relative w-12 h-6 bg-stone-200 rounded-full transition-colors hover:bg-stone-300">
              <div className={`absolute top-1 left-1 w-4 h-4 bg-rose-500 rounded-full shadow transition-transform ${billingCycle === "yearly" ? "translate-x-6" : ""}`} />
            </button>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${billingCycle === "yearly" ? "bg-rose-500 text-white shadow-sm" : "text-stone-400"}`}
              onClick={() => setBillingCycle("yearly")}>
              Yearly
              <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-1.5 py-0.5 rounded-full">20% OFF</span>
            </span>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => {
            const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;
            const Icon = plan.icon;

            return (
              <div key={plan.name}
                className={`relative rounded-3xl transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? "bg-gradient-to-br from-rose-600 to-pink-600 text-white shadow-[0_24px_60px_rgba(225,29,72,0.30)] scale-[1.03] md:scale-[1.05]"
                    : "bg-white border border-stone-100 shadow-lg hover:shadow-xl hover:border-rose-100"
                }`}>

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-7">
                  {/* Icon + name */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-stone-900"}`} style={{ fontFamily: "var(--font-display)" }}>
                    {plan.name}
                  </h3>
                  <p className={`text-xs mb-5 ${plan.highlight ? "text-white/70" : "text-stone-400"}`}>{plan.description}</p>

                  {/* Price */}
                  <div className="mb-5">
                    <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "text-stone-900"}`} style={{ fontFamily: "var(--font-display)" }}>
                      {price === 0 ? "Free" : `Rs. ${price.toLocaleString()}`}
                    </span>
                    {price > 0 && (
                      <span className={`text-xs ml-1 ${plan.highlight ? "text-white/60" : "text-stone-400"}`}>
                        /{billingCycle === "monthly" ? "month" : "year"}
                      </span>
                    )}
                  </div>

                  {/* Features */}
                  <ul className={`space-y-3 text-xs border-t ${plan.highlight ? "border-white/20" : "border-stone-100"} pt-5 mb-6`}>
                    {plan.features.map((feat) => (
                      <li key={feat} className={`flex items-center gap-2.5 ${plan.highlight ? "text-white/85" : "text-stone-600"}`}>
                        <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center ${plan.highlight ? "bg-white/20" : "bg-rose-50"}`}>
                          <Check size={10} className={plan.highlight ? "text-white" : "text-rose-500"} />
                        </div>
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleCtaClick(plan.name)}
                    disabled={plan.name === "Basic Shield"}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all ${
                      plan.name === "Basic Shield"
                        ? "bg-stone-100 text-stone-400 cursor-default"
                        : plan.highlight
                          ? "bg-white text-rose-600 hover:bg-rose-50 shadow-lg hover:-translate-y-0.5"
                          : "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md hover:from-rose-600 hover:to-pink-600 hover:-translate-y-0.5"
                    }`}>
                    {plan.cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 flex-wrap justify-center gap-y-3">
            {[
              { icon: Shield, text: "No Hidden Fees" },
              { icon: Zap, text: "Instant Activation" },
              { icon: Heart, text: "Cancel Anytime" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-stone-500 font-medium">
                <Icon size={16} className="text-rose-400" /> {text}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass border border-white/60 rounded-3xl p-7 sm:p-9 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors">
              <X size={14} className="text-stone-600" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mx-auto mb-5 shadow-xl">
                  <Sparkles size={32} className="text-white" />
                </div>
                <h4 className="text-xl font-bold text-stone-900 mb-2" style={{ fontFamily: "var(--font-display)" }}>Subscription Activated!</h4>
                <p className="text-xs text-stone-500">Welcome to Soulvera Premium. Redirecting you to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>Upgrade to {selectedPlan}</h3>
                  <p className="text-xs text-stone-400">Secure payment simulation. No actual funds transferred.</p>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-xs">
                  <div className="flex justify-between font-bold text-stone-800 mb-1">
                    <span>Total Amount:</span>
                    <span className="gradient-text">Rs. {billingCycle === "monthly" ? "2,500" : "20,000"}</span>
                  </div>
                  <div className="text-stone-400">{billingCycle === "monthly" ? "Monthly billing" : "Annual billing"}</div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2 block">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="border-2 border-rose-400 bg-rose-50 p-3 rounded-2xl text-center text-xs font-bold text-rose-700">
                      Credit Card
                    </button>
                    <button type="button" className="border border-stone-200 bg-white p-3 rounded-2xl text-center text-xs font-semibold text-stone-600">
                      Mobile Wallet
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">Card Number</label>
                  <input type="text" required placeholder="4000 1234 5678 9010"
                    className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">Expiry</label>
                    <input type="text" required placeholder="MM/YY"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5 block">CVV</label>
                    <input type="password" required maxLength={3} placeholder="•••"
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-400/40 focus:border-rose-400 focus:outline-none" />
                  </div>
                </div>

                <button type="submit"
                  className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-500 hover:from-rose-700 hover:to-pink-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5">
                  Confirm & Activate Premium
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
