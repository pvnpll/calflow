"use client";

import React from "react";
import { motion } from "framer-motion";
import { Droplets, Activity, LineChart, PieChart } from "lucide-react";

export function FeaturesSection() {
  return (
    <div id="features" className="space-y-32 py-24 overflow-hidden">
      {/* Tracking Section */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Everything that matters. <br className="hidden md:block"/> In one place.
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              CalFlow keeps structured historical data rather than treating every meal as an isolated entry. 
              Track calories, protein, carbohydrates, fat, fiber, micronutrients, water, and weight all in one unified dashboard.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-3xl transform rotate-3 scale-105"></div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 relative">
              <div className="space-y-4">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <div className="text-sm text-neutral-500 mb-1">Daily Summary</div>
                    <div className="text-2xl font-bold">1,842 kcal</div>
                  </div>
                  <div className="text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">On track</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Protein", val: "112g", p: 80, color: "bg-blue-500" },
                    { label: "Carbs", val: "198g", p: 75, color: "bg-green-500" },
                    { label: "Fat", val: "58g", p: 60, color: "bg-yellow-500" },
                    { label: "Fiber", val: "19g", p: 50, color: "bg-purple-500" },
                  ].map(m => (
                    <div key={m.label} className="p-4 rounded-xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                      <div className="text-sm text-neutral-500 mb-1">{m.label}</div>
                      <div className="font-semibold mb-2">{m.val}</div>
                      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color}`} style={{ width: `${m.p}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Water Section */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse">
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Water, without the friction.
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              One tap. 250 ml logged. No complex menus or forms.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Mobile button
              </li>
              <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Siri Shortcut
              </li>
              <li className="flex items-center gap-3 text-neutral-700 dark:text-neutral-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> AI/chat logging
              </li>
            </ul>
          </div>
          <div className="order-2 md:order-1 flex justify-center">
            <div className="w-64 rounded-3xl border-4 border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-blue-50 dark:bg-blue-900/20 -z-10 transition-all duration-1000 rounded-b-2xl"></div>
              <div className="text-center mt-4">
                <Droplets className="mx-auto text-blue-500 mb-4" size={32} />
                <div className="text-sm text-neutral-500 mb-1">Today's water</div>
                <div className="text-2xl font-bold mb-8">1.75 L / 2.50 L</div>
                <button className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform">
                  +250
                </button>
                <div className="text-xs text-neutral-400 mt-4">ml</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weight Section */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              Track progress, not just meals.
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
              CalFlow connects your weight history with your nutrition history so you can see trends over time and understand what's actually working.
            </p>
          </div>
          <div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-neutral-500 mb-1">Current Weight</div>
                  <div className="text-3xl font-bold">76.4 <span className="text-lg text-neutral-400 font-normal">kg</span></div>
                </div>
                <div className="text-sm font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full flex items-center gap-1">
                  ↓ 1.2 kg this month
                </div>
              </div>
              <div className="h-40 w-full flex items-end gap-2 px-2">
                {/* Simulated minimal chart */}
                {[78, 77.8, 77.5, 77.6, 77.2, 76.9, 76.5, 76.8, 76.4].map((w, i) => (
                  <div key={i} className="flex-1 bg-neutral-100 dark:bg-neutral-800 rounded-t-sm relative group">
                    <div 
                      className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-sm opacity-50 group-hover:opacity-100 transition-opacity" 
                      style={{ height: `${(w - 75) * 20}%` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-neutral-400 mt-2 px-2">
                <span>4 weeks ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Section */}
      <section id="insights" className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Your data becomes useful when you can see the pattern.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-blue-500" />
              <h3 className="font-semibold text-lg">Weekly Analytics</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div>
                <div className="text-xs text-neutral-500 mb-1">Avg Calories</div>
                <div className="font-semibold text-lg">2,150</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Protein Hit</div>
                <div className="font-semibold text-lg">5/7 days</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Water Avg</div>
                <div className="font-semibold text-lg">2.1 L</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500 mb-1">Weight</div>
                <div className="font-semibold text-lg text-green-500">-0.4 kg</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">AI-Generated Insights</h4>
              
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div className="font-medium text-blue-900 dark:text-blue-200 text-sm mb-1">Protein consistency</div>
                <p className="text-sm text-blue-800 dark:text-blue-300 opacity-80">"You hit your protein target on 5 of the last 7 days."</p>
              </div>
              
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                <div className="font-medium text-green-900 dark:text-green-200 text-sm mb-1">Water</div>
                <p className="text-sm text-green-800 dark:text-green-300 opacity-80">"Your average water intake increased this week."</p>
              </div>
              
              <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30">
                <div className="font-medium text-orange-900 dark:text-orange-200 text-sm mb-1">Nutrition</div>
                <p className="text-sm text-orange-800 dark:text-orange-300 opacity-80">"Your recent meals are consistently lower in fiber than your target."</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-900 p-6 text-white dark:border-neutral-800 dark:bg-neutral-900 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-32 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div>
              <h3 className="text-xl font-bold mb-4">Don't just track. Know what to do next.</h3>
              <p className="text-neutral-400 text-sm mb-8">
                Based on your remaining targets, CalFlow recommends options to perfectly close out your day.
              </p>

              <div className="bg-black/40 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                <div className="font-medium text-sm mb-1">Chicken + vegetables + roti</div>
                <div className="text-xs text-neutral-400 flex gap-3">
                  <span>~620 kcal</span>
                  <span>~45g protein</span>
                </div>
              </div>
              
              <div className="bg-black/40 rounded-xl p-4 mb-4 backdrop-blur-sm border border-white/10">
                <div className="font-medium text-sm mb-1">Paneer + vegetables + roti</div>
                <div className="text-xs text-neutral-400 flex gap-3">
                  <span>~650 kcal</span>
                  <span>~32g protein</span>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-neutral-500 flex items-center gap-1 mt-4">
              <SparklesIcon /> AI generated estimates
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18"></path>
      <path d="M3 12h18"></path>
      <path d="M18.364 5.636l-12.728 12.728"></path>
      <path d="M5.636 5.636l12.728 12.728"></path>
    </svg>
  );
}
