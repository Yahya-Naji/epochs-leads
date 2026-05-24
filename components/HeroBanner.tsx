"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ArrowRight,
  Headphones,
} from "lucide-react";
import LeadsLogo from "./LeadsLogo";

// Optometry / clinic stock imagery
const heroImages = [
  "https://images.unsplash.com/photo-1577401239170-897942555fb3?w=1920&q=80", // eye exam equipment
  "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1920&q=80", // glasses on display
  "https://images.unsplash.com/photo-1606206522398-de2eaba47e58?w=1920&q=80", // optometrist with patient
  "https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=1920&q=80", // close-up of eye
];

const stats = [
  { value: "0.8s", label: "Avg Latency" },
  { value: "98%", label: "Pickup Rate" },
  { value: "24/7", label: "Availability" },
  { value: "AI", label: "Powered" },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Rotating background images */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={heroImages[current] || heroImages[0]}
          alt="Optometry clinic background"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/30 to-violet-900/20" />

      {/* Header - transparent over hero */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-md">
              <LeadsLogo size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Epochs Optometry
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded-lg text-sm text-white/90 hover:bg-white/10 hover:text-white transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded-lg text-sm bg-white/15 text-white backdrop-blur-md hover:bg-white/25 border border-white/20 transition-all"
            >
              Try the Demo
            </Link>
          </div>
        </div>
      </header>

      {/* Hero content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-md"
          >
            <Zap className="h-3.5 w-3.5" />
            AI Front Desk for Optometry Clinics
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl"
          >
            Never miss a patient,
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              never miss a call
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70"
          >
            An AI receptionist that handles appointment reminders, books new exams,
            and checks vision-insurance coverage — in a natural voice, around the clock.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-base font-semibold bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-600 hover:to-violet-600 transition-all hover:scale-105 active:scale-95"
            >
              Try the Demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-base font-semibold border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
            >
              <Headphones className="h-4 w-4" />
              Hear a Call
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-16 grid w-full max-w-2xl grid-cols-4 divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-lg"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-white/50">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Image slider dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.3 }}
          className="mt-8 flex gap-2"
        >
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
