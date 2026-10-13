"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, UtensilsCrossed } from "lucide-react";
import { cn } from "cn";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#ai", label: "AI" },
  { href: "#insights", label: "Insights" },
  { href: "#how-it-works", label: "How it works" },
];

export function LandingNav({ isLoggedIn }: { isLoggedIn?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-[17px] font-semibold tracking-tight" aria-label="CalFlow home">
            <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-foreground text-background">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            CalFlow
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex h-9 items-center justify-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-muted md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors hover:bg-muted"
              >
                {l.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-border/60" />
            {isLoggedIn ? (
              <Link href="/dashboard" className="rounded-xl bg-foreground px-3 py-2.5 text-center text-[15px] font-medium text-background">
                Open app
              </Link>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="flex-1 rounded-xl border border-border px-3 py-2.5 text-center text-[15px] font-medium">
                  Log in
                </Link>
                <Link href="/signup" className="flex-1 rounded-xl bg-foreground px-3 py-2.5 text-center text-[15px] font-medium text-background">
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
