"use client";

import React from "react";
import { Lock, Shield, Server, Database } from "lucide-react";

export function HowItWorksSection() {
  return (
    <div id="how-it-works" className="space-y-32 py-24 bg-neutral-50 dark:bg-neutral-900/20">
      {/* How it works */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How it works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-neutral-200 dark:bg-neutral-800 -translate-y-1/2 z-0"></div>
          
          {[
            { num: "01", title: "Log", desc: "Tell CalFlow what you ate." },
            { num: "02", title: "Understand", desc: "AI estimates nutrition and structures the data." },
            { num: "03", title: "Analyze", desc: "CalFlow compares your intake with your goals and history." },
            { num: "04", title: "Act", desc: "Get insights and recommendations for what to do next." },
          ].map((step, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-lg mb-6 text-neutral-900 dark:text-neutral-100 shadow-sm">
                {step.num}
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture */}
      <section className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Use CalFlow wherever you are.
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            One data layer. Many interfaces.
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-8 md:p-12 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 font-mono text-sm sm:text-base overflow-x-auto">
          <pre className="text-neutral-600 dark:text-neutral-400 text-center">
{`             ┌── ChatGPT
             │
             ├── Claude
             │
             ├── Gemini
             │
USER ────────┼── CalFlow AI
             │
             ├── Mobile
             │
             └── Siri
                    ↓
               CALFLOW
                    ↓
             Your nutrition data`}
          </pre>
        </div>
      </section>

      {/* Privacy */}
      <section className="container mx-auto px-4 max-w-3xl text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 mb-8">
          <Shield size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
          Your nutrition data belongs to you.
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mt-12">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <Lock className="text-neutral-400 mt-0.5" size={18} />
            <div>
              <div className="font-medium text-sm mb-1">Secure authentication</div>
              <div className="text-xs text-neutral-500">Your account and data are protected.</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <Database className="text-neutral-400 mt-0.5" size={18} />
            <div>
              <div className="font-medium text-sm mb-1">User-isolated data</div>
              <div className="text-xs text-neutral-500">Your data is strictly isolated via Row Level Security.</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <Server className="text-neutral-400 mt-0.5" size={18} />
            <div>
              <div className="font-medium text-sm mb-1">No arbitrary AI access</div>
              <div className="text-xs text-neutral-500">AI operates only through strictly controlled tools/actions.</div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <Shield className="text-neutral-400 mt-0.5" size={18} />
            <div>
              <div className="font-medium text-sm mb-1">Protected database</div>
              <div className="text-xs text-neutral-500">All access routes are secured and authenticated.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
