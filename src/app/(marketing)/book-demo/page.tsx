"use client";

import { useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  mauRange: string;
  currentEngine: string;
  biggestProblem: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  company: "",
  role: "",
  mauRange: "",
  currentEngine: "",
  biggestProblem: "",
};

const MAU_OPTIONS = [
  { value: "", label: "Select MAU range" },
  { value: "<1M", label: "< 1M" },
  { value: "1-10M", label: "1 - 10M" },
  { value: "10-50M", label: "10 - 50M" },
  { value: "50-100M", label: "50 - 100M" },
  { value: "100M+", label: "100M+" },
];

/* ------------------------------------------------------------------ */
/*  Input component                                                    */
/* ------------------------------------------------------------------ */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm text-[#94a3b8] mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full bg-[#0a0a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#94a3b8]/40 focus:outline-none focus:border-[#4a90e2]/50 transition-colors";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BookDemoPage() {
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, boolean>>>({});

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const newErrors: Partial<Record<keyof FormData, boolean>> = {};
    if (!form.name.trim()) newErrors.name = true;
    if (!form.email.trim() || !form.email.includes("@")) newErrors.email = true;
    if (!form.company.trim()) newErrors.company = true;
    if (!form.role.trim()) newErrors.role = true;
    if (!form.mauRange) newErrors.mauRange = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#4a90e2]/20 to-[#9b51e0]/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 gradient-text">Demo Requested</h1>
          <p className="text-[#94a3b8] mb-2">
            We&apos;ll be in touch within 24 hours.
          </p>
          <p className="text-sm text-[#94a3b8]/60 mb-8">
            A member of our team will reach out to {form.email} to schedule a live walkthrough of the DNA engine.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 text-sm text-[#4a90e2] hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Try the interactive demo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ---- Hero ---- */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-[#4a90e2]/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-[#9b51e0]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left: Context */}
            <div className="lg:sticky lg:top-32">
              <p className="text-xs uppercase tracking-[0.3em] text-[#4a90e2] mb-4">
                Book a Demo
              </p>
              <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                See the DNA engine
                <br />
                <span className="gradient-text">in action</span>
              </h1>
              <p className="text-[#94a3b8] leading-relaxed mb-8">
                30-minute live walkthrough with our team. We&apos;ll analyze your catalog, show real DNA
                matches, and demonstrate how the engine integrates with your recommendation stack.
              </p>

              <div className="space-y-4">
                {[
                  { text: "Live DNA extraction on your tracks", icon: "M9 18V5l12-2v13" },
                  { text: "Similarity search across 100M+ songs", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                  { text: "Integration architecture review", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
                  { text: "Custom pricing for your MAU tier", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4a90e2]/10 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a90e2" strokeWidth="1.5">
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-sm text-[#94a3b8]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Form */}
            <div className="glass-card p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="Name *">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Jane Smith"
                    className={`${inputClass} ${errors.name ? "border-red-500/50" : ""}`}
                  />
                </FormField>

                <FormField label="Work Email *">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="jane@company.com"
                    className={`${inputClass} ${errors.email ? "border-red-500/50" : ""}`}
                  />
                </FormField>

                <FormField label="Company *">
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => update("company", e.target.value)}
                    placeholder="Acme Streaming"
                    className={`${inputClass} ${errors.company ? "border-red-500/50" : ""}`}
                  />
                </FormField>

                <FormField label="Role *">
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => update("role", e.target.value)}
                    placeholder="VP of Product"
                    className={`${inputClass} ${errors.role ? "border-red-500/50" : ""}`}
                  />
                </FormField>

                <FormField label="DSP / Streaming MAU Range *">
                  <select
                    value={form.mauRange}
                    onChange={(e) => update("mauRange", e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer ${
                      errors.mauRange ? "border-red-500/50" : ""
                    } ${!form.mauRange ? "text-[#94a3b8]/40" : ""}`}
                  >
                    {MAU_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="What recommendation engine are you using today?">
                  <textarea
                    value={form.currentEngine}
                    onChange={(e) => update("currentEngine", e.target.value)}
                    placeholder="e.g., Collaborative filtering, custom ML pipeline, vendor..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </FormField>

                <FormField label="What's your biggest discovery problem?">
                  <textarea
                    value={form.biggestProblem}
                    onChange={(e) => update("biggestProblem", e.target.value)}
                    placeholder="e.g., Cold-start for new releases, genre bias, low engagement..."
                    rows={3}
                    className={`${inputClass} resize-none`}
                  />
                </FormField>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#4a90e2] to-[#9b51e0] text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  Book a Demo Call
                </button>

                <p className="text-xs text-[#94a3b8]/40 text-center">
                  No spam. No automated sequences. A human will reply.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
