"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";

export function ComparisonSection() {
  return (
    <section id="comparison" className="py-24 bg-neutral-50 dark:bg-neutral-900/20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            More than counting calories.
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Traditional trackers mainly answer <span className="italic">"What did I eat?"</span>. 
            CalFlow answers <span className="italic">"What does my nutrition look like — and what should I do next?"</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Traditional Tracker */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950/50 opacity-70">
            <div className="flex items-center gap-3 mb-8 text-neutral-500">
              <XCircle className="text-neutral-400" />
              <h3 className="font-medium text-lg">Traditional tracker</h3>
            </div>
            
            <div className="space-y-6 text-center text-neutral-500 font-medium">
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900">Food</div>
              <div className="flex justify-center"><ArrowRight size={20} className="rotate-90 md:rotate-0 md:hidden" /><ArrowRight size={20} className="hidden md:block rotate-90" /></div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900">Calories</div>
              <div className="flex justify-center"><ArrowRight size={20} className="rotate-90 md:rotate-0 md:hidden" /><ArrowRight size={20} className="hidden md:block rotate-90" /></div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-900">Done</div>
            </div>
          </div>

          {/* CalFlow */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl dark:border-neutral-700 dark:bg-neutral-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            <div className="flex items-center gap-3 mb-8">
              <CheckCircle2 className="text-blue-500" />
              <h3 className="font-medium text-lg">CalFlow</h3>
            </div>

            <div className="relative">
              <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/50 to-purple-500/50 -translate-x-1/2 z-0 hidden md:block"></div>
              
              <div className="space-y-4 relative z-10">
                {[
                  "Food",
                  "Nutrition",
                  "Daily targets",
                  "Historical context",
                  "Insights",
                  "Recommendations",
                  "Action"
                ].map((step, idx) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex justify-center"
                  >
                    <div className="w-full md:w-2/3 py-3 px-6 rounded-xl bg-white border border-neutral-100 shadow-sm text-center font-medium text-neutral-800 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-200">
                      {step}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
