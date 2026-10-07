"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Zap, Sparkles, BrainCircuit, RefreshCw, Trash2, Target } from "lucide-react";

export function AiEcosystem() {
  return (
    <section id="ai" className="py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Talk to your nutrition data.
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            CalFlow doesn't make you fill out forms. You can simply talk.
          </p>
        </div>

        {/* 3 AI Entry Points */}
        <div className="grid md:grid-cols-3 gap-6 mb-24">
          {/* ChatGPT */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <MessageSquare size={18} /> ChatGPT
            </h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="bg-white dark:bg-neutral-950 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 self-end ml-4">
                "I had 3 eggs, 2 rotis and some curd for lunch."
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 mr-4 text-blue-900 dark:text-blue-100">
                "Logged. Approximately 520 kcal, 27g protein..."
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium mt-2">
                <CheckIcon /> CalFlow: Meal added
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Connect CalFlow to ChatGPT and log meals through natural conversation.
            </p>
          </div>

          {/* Claude */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900/50">
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Zap size={18} /> Claude
            </h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="bg-white dark:bg-neutral-950 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800 self-end ml-4">
                "Log my breakfast: oats, milk, banana and whey."
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-100 dark:border-orange-900/50 mr-4 text-orange-900 dark:text-orange-100">
                "Done. I've added breakfast to CalFlow."
              </div>
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium mt-2">
                <CheckIcon /> Tool used: add_meal
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Use CalFlow through Claude with seamless MCP integration.
            </p>
          </div>

          {/* CalFlow AI */}
          <div className="rounded-2xl border border-neutral-200 bg-white shadow-lg p-6 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="font-semibold mb-6 flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Sparkles size={18} /> CalFlow AI
            </h3>
            <div className="space-y-4 mb-6 text-sm">
              <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg self-end ml-4">
                "What am I missing today?"
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-900/50 mr-4 text-purple-900 dark:text-purple-100">
                "You're currently short on protein and fiber. You have enough calories remaining for a protein-rich meal."
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg self-end ml-4">
                "What should I eat?"
              </div>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Built-in AI for logging, editing, analyzing and querying your nutrition data.
            </p>
          </div>
        </div>

        {/* AI Capabilities Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CapabilityCard 
            icon={<MessageSquare />}
            title="Log naturally"
            example='"I had 2 eggs and 3 rotis."'
            desc="AI understands the meal and records it."
          />
          <CapabilityCard 
            icon={<Target />}
            title="Ask anything"
            example='"How much protein have I eaten today?"'
            desc="Get an answer from your actual CalFlow data."
          />
          <CapabilityCard 
            icon={<BrainCircuit />}
            title="Find gaps"
            example='"What am I short on today?"'
            desc="AI analyzes current nutrition against your goals."
          />
          <CapabilityCard 
            icon={<Sparkles />}
            title="Get recommendations"
            example='"What should I eat for dinner?"'
            desc="Recommendations based on what you've already eaten."
          />
          <CapabilityCard 
            icon={<RefreshCw />}
            title="Update your data"
            example='"Change lunch from 2 rotis to 3."'
            desc="AI smartly updates the existing record."
          />
          <CapabilityCard 
            icon={<Trash2 />}
            title="Delete entries"
            example='"Remove the coffee I logged this morning."'
            desc="AI can perform the appropriate deletion action."
          />
        </div>
      </div>
    </section>
  );
}

function CapabilityCard({ icon, title, example, desc }: any) {
  return (
    <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mb-4">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="text-sm font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-900 p-2 rounded mb-2">
        {example}
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {desc}
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
