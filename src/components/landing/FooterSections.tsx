"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600 dark:bg-blue-900 -z-20"></div>
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-20 -z-10" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)', 
          backgroundSize: '32px 32px' 
        }}>
      </div>
      <div className="absolute top-0 right-0 p-[30rem] bg-purple-500/30 rounded-full blur-[100px] -mr-64 -mt-64 -z-10"></div>
      
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Start understanding your nutrition.
        </h2>
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
          Track less manually. Understand more.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-base font-medium text-blue-900 shadow-xl transition-transform hover:scale-105 focus-visible:outline-none w-full sm:w-auto"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex h-14 items-center justify-center rounded-xl bg-white px-8 text-base font-medium text-blue-900 shadow-xl transition-transform hover:scale-105 focus-visible:outline-none w-full sm:w-auto"
            >
              Get started <ArrowRight size={18} className="ml-2" />
            </Link>
          )}
          <Link
            href="#features"
            className="inline-flex h-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-8 text-base font-medium text-white transition-colors hover:bg-white/20 focus-visible:outline-none w-full sm:w-auto"
          >
            Explore CalFlow
          </Link>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-900 pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="font-semibold text-xl tracking-tight mb-4 inline-block">
              CalFlow
            </Link>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              AI-powered nutrition tracking.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="#features" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#ai" className="hover:text-neutral-900 dark:hover:text-white transition-colors">AI</Link></li>
              <li><Link href="#insights" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Insights</Link></li>
              <li><Link href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-white transition-colors">How it works</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Account</h4>
            <ul className="space-y-3 text-sm text-neutral-500 dark:text-neutral-400">
              <li><Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Log in</Link></li>
              <li><Link href="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Get started</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} CalFlow. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
