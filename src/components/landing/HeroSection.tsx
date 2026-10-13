"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./primitives";
import { DashboardShot } from "./shots";

export function HeroSection({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="relative overflow-hidden px-5 pb-16 pt-28 sm:pt-36">
      {/* faint wash */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[480px] bg-muted/50 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground shadow-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            AI nutrition tracking
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl"
          >
            Your nutrition. Understood.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            CalFlow turns your meals, water, weight, and goals into a living
            picture of your health — and tells you what to do next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-foreground px-7 text-[15px] font-medium text-background transition-opacity hover:opacity-90 sm:w-auto"
            >
              {isLoggedIn ? "Open app" : "Get started"}
              <ArrowRight size={17} />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-border bg-card px-7 text-[15px] font-medium transition-colors hover:bg-muted/60 sm:w-auto"
            >
              See how it works
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.55, delay: 0.32 }}
            className="mt-4 text-[13px] text-muted-foreground"
          >
            Free to start · No credit card · Your data stays yours
          </motion.p>
        </div>

        <Reveal delay={0.15} className="mx-auto mt-12 max-w-4xl sm:mt-16">
          <DashboardShot />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            The actual CalFlow dashboard — calories, macros, water, meals, and AI insights.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
