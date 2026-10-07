"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight, Activity, Droplets } from "lucide-react";

export function HeroSection({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden relative">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm font-medium dark:border-neutral-800 dark:bg-neutral-950"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            CalFlow AI is now available
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            Your nutrition. <br className="hidden md:block" /> Understood.
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl"
          >
            CalFlow turns your meals, water, weight, and nutrition goals into a living picture of your health — powered by AI.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-md bg-neutral-900 px-8 text-sm font-medium text-neutral-50 shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-md bg-neutral-900 px-8 text-sm font-medium text-neutral-50 shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90"
              >
                Get started
              </Link>
            )}
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-md border border-neutral-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
            >
              See how it works
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-16 relative mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white/50 p-2 shadow-2xl backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/50"
        >
          <div className="rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800">
              
              {/* Main Stats */}
              <div className="p-6 md:p-8 col-span-2">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-medium">Today's Nutrition</h3>
                  <span className="text-sm text-neutral-500">1,842 / 2,300 kcal</span>
                </div>
                
                <div className="space-y-6">
                  {/* Macros */}
                  <div className="space-y-4">
                    {[
                      { name: "Protein", val: 112, max: 140, color: "bg-blue-500" },
                      { name: "Carbs", val: 198, max: 260, color: "bg-green-500" },
                      { name: "Fat", val: 58, max: 75, color: "bg-yellow-500" },
                      { name: "Fiber", val: 19, max: 30, color: "bg-purple-500" },
                    ].map((macro) => (
                      <div key={macro.name}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium">{macro.name}</span>
                          <span className="text-neutral-500">{macro.val}g / {macro.max}g</span>
                        </div>
                        <div className="h-2 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(macro.val / macro.max) * 100}%` }}
                            transition={{ duration: 1, delay: 0.8 }}
                            className={`h-full ${macro.color} rounded-full`} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Water */}
                  <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Droplets className="text-blue-500" size={18} />
                        <span className="font-medium text-sm">Water</span>
                      </div>
                      <span className="text-sm text-neutral-500">1.75L / 2.5L</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="p-6 md:p-8 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <h4 className="text-sm font-medium">AI Insight</h4>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6">
                  "You're close to your protein target today. A protein-rich dinner would help close the gap."
                </p>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors flex items-center justify-between">
                    <span>What should I eat?</span>
                    <ChevronRight size={16} className="text-neutral-400" />
                  </button>
                  <button className="w-full text-left px-4 py-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors flex items-center justify-between">
                    <span>Log my dinner</span>
                    <ChevronRight size={16} className="text-neutral-400" />
                  </button>
                </div>
              </div>

            </div>
          </div>
          
          {/* Decorative glow */}
          <div className="absolute -inset-0.5 -z-10 rounded-2xl bg-gradient-to-b from-blue-500/20 to-purple-500/20 blur-xl opacity-50"></div>
        </motion.div>
      </div>
    </section>
  );
}
