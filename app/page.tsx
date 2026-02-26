"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  BrainCircuit,
  Globe,
  ShieldCheck,
  ArrowRight,
  Mic,
  BarChart3,
  Clock,
  Users,
  Sparkles,
  CheckCircle2,
  Database,
} from "lucide-react";
import HeroBanner from "@/components/HeroBanner";
import LeadsLogo from "@/components/LeadsLogo";

/* ── Shared animation variants ────────────────────────────────────────── */

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease },
  }),
} as const;

const fadeScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
} as const;

const slideIn = (dir: "left" | "right") => ({
  hidden: { opacity: 0, x: dir === "left" ? -60 : 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease },
  },
});

/* ── Data ─────────────────────────────────────────────────────────────── */

const features = [
  {
    icon: Phone,
    title: "Natural Voice Calls",
    description:
      "AI agent makes and receives calls in fluent Arabic, handling objections and follow-ups like a seasoned rep.",
    gradient: "from-indigo-500 to-violet-500",
  },
  {
    icon: BrainCircuit,
    title: "Intelligent Qualification",
    description:
      "Extracts name, age, job title, citizenship, and investment readiness — all structured automatically.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Globe,
    title: "24/7 Availability",
    description:
      "Never miss a lead. Your AI agent works around the clock with consistent quality and zero fatigue.",
    gradient: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: ShieldCheck,
    title: "CRM Auto-Sync",
    description:
      "Every call outcome, transcript, and recording is saved to Airtable in real-time for your team.",
    gradient: "from-fuchsia-500 to-pink-500",
  },
];

const howItWorks = [
  {
    step: "01",
    icon: Mic,
    title: "AI Makes the Call",
    description:
      "Your voice agent dials prospects using a natural Arabic voice, following a customizable 7-step call script.",
  },
  {
    step: "02",
    icon: Users,
    title: "Qualifies the Lead",
    description:
      "Collects key data — name, age, job, citizenship, investment readiness — through a conversational flow.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Syncs to Your CRM",
    description:
      "Every detail, transcript, and call recording is instantly pushed to your Airtable dashboard.",
  },
];

const metrics = [
  { value: "0.8s", label: "Average Latency", icon: Clock },
  { value: "98%", label: "Call Completion Rate", icon: Phone },
  { value: "500+", label: "Leads Qualified", icon: Users },
  { value: "24/7", label: "Always Available", icon: Globe },
  { value: "6", label: "Data Points Per Call", icon: BarChart3 },
  { value: "100%", label: "Automated Pipeline", icon: Sparkles },
];

/* ── Component ────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Features ──────────────────────────────────────────────────── */}
      <section className="relative border-t border-surface-border bg-white px-4 py-24 md:py-32 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-600">
              <Sparkles className="h-3.5 w-3.5" />
              Core Features
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-ink-secondary max-w-2xl mx-auto">
              AI-powered features to automate your entire lead generation pipeline from first call to CRM entry.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                custom={index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative overflow-hidden rounded-2xl border border-surface-border bg-gradient-to-br from-slate-50 to-white p-8 transition-shadow hover:shadow-xl hover:shadow-indigo-500/10"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div
                  className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg shadow-indigo-500/20`}
                >
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="relative text-lg font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-ink-secondary">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white px-4 py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-20 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-semibold text-violet-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
              Three steps to autopilot
            </h2>
            <p className="mt-4 text-lg text-ink-secondary max-w-2xl mx-auto">
              Set up your voice agent in minutes and let it handle the rest.
            </p>
          </motion.div>

          <div className="grid gap-12 md:gap-16">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                variants={slideIn(index % 2 === 0 ? "left" : "right")}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  index % 2 === 1 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Visual */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative flex-shrink-0"
                >
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                    <item.icon className="w-14 h-14 md:w-16 md:h-16 text-white" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center text-sm font-bold text-indigo-600 shadow-md">
                    {item.step}
                  </div>
                </motion.div>

                {/* Text */}
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-2xl font-bold text-ink md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-ink-secondary max-w-lg">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Metrics / Numbers ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-24 md:py-32">
        {/* Animated background blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="relative mx-auto max-w-6xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-md">
              <BarChart3 className="h-3.5 w-3.5" />
              By the Numbers
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Built for performance
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">
              Real metrics from real calls. Our AI delivers enterprise-grade reliability at startup speed.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                custom={index}
                variants={fadeScale}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8 backdrop-blur-md text-center transition-all hover:border-white/25 hover:bg-white/10"
              >
                <div className="mx-auto mb-3 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  {metric.value}
                </div>
                <div className="mt-1 text-sm text-white/50">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 via-transparent to-violet-50/50" />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30"
          >
            <Phone className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
            Ready to automate your calls?
          </h2>
          <p className="mt-4 text-lg text-ink-secondary max-w-xl mx-auto">
            Start qualifying leads on autopilot. No coding required — just connect your CRM and let the AI handle the rest.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600 transition-all hover:scale-105 active:scale-95"
            >
              Try for Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold border border-surface-border-strong text-ink-secondary hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
            >
              View Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-surface-border bg-slate-50 px-4 py-8 text-center text-sm text-ink-muted">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LeadsLogo size={14} className="text-primary" />
            <span className="font-medium">
              Epochs Lead &copy; {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            <span>Powered by VAPI · Airtable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
