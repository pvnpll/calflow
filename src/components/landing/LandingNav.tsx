"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, UtensilsCrossed } from "lucide-react";

export function LandingNav({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-transparent ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-neutral-200 dark:bg-neutral-950/80 dark:border-neutral-800"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-semibold text-xl tracking-tight">
            <span className="rounded-md bg-black/10 dark:bg-white/10 p-1.5">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            CalFlow
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
            <Link href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</Link>
            <Link href="#ai" className="hover:text-black dark:hover:text-white transition-colors">AI</Link>
            <Link href="#insights" className="hover:text-black dark:hover:text-white transition-colors">Insights</Link>
            <Link href="#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How it works</Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-neutral-50 shadow transition-colors hover:bg-neutral-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 py-4 px-4 flex flex-col gap-4">
          <Link href="#features" onClick={() => setMobileMenuOpen(false)}>Features</Link>
          <Link href="#ai" onClick={() => setMobileMenuOpen(false)}>AI</Link>
          <Link href="#insights" onClick={() => setMobileMenuOpen(false)}>Insights</Link>
          <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How it works</Link>
          <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-2" />
          {isLoggedIn ? (
            <Link href="/dashboard" className="font-medium">Go to Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="font-medium">Log in</Link>
              <Link href="/signup" className="font-medium text-blue-600 dark:text-blue-400">Get started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
