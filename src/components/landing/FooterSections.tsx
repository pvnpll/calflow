"use client";

import Link from "next/link";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { Reveal } from "./primitives";

export function CtaSection({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="px-5 pb-20 pt-4 sm:pb-28">
      <Reveal className="mx-auto max-w-6xl">
        <div className="rounded-3xl bg-foreground px-6 py-16 text-center text-background sm:py-24 dark:bg-muted dark:text-foreground">
          <h2 className="mx-auto max-w-xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl">
            Start understanding your nutrition.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-background/70 sm:text-lg dark:text-muted-foreground">
            Track less manually. Understand more.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={isLoggedIn ? "/dashboard" : "/signup"}
              className="inline-flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-background px-7 text-[15px] font-medium text-foreground transition-opacity hover:opacity-90 sm:w-auto dark:bg-foreground dark:text-background"
            >
              {isLoggedIn ? "Open app" : "Get started"}
              <ArrowRight size={17} />
            </Link>
            <Link
              href="#product"
              className="inline-flex h-12 w-full items-center justify-center rounded-full border border-background/25 px-7 text-[15px] font-medium transition-colors hover:bg-background/10 sm:w-auto dark:border-border dark:hover:bg-muted"
            >
              Explore the product
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-border/50 px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background">
              <UtensilsCrossed className="h-3.5 w-3.5" />
            </span>
            CalFlow
          </Link>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            AI-powered nutrition tracking. Your nutrition. Understood.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-8 text-sm sm:flex sm:gap-12">
          <div className="space-y-2.5">
            <p className="font-medium">Product</p>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <Link href="#product" className="transition-colors hover:text-foreground">Product</Link>
              <Link href="#ai" className="transition-colors hover:text-foreground">AI</Link>
              <Link href="#how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
            </div>
          </div>
          <div className="space-y-2.5">
            <p className="font-medium">Account</p>
            <div className="flex flex-col gap-2 text-muted-foreground">
              <Link href="/login" className="transition-colors hover:text-foreground">Log in</Link>
              <Link href="/signup" className="transition-colors hover:text-foreground">Get started</Link>
            </div>
          </div>
        </nav>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-border/50 pt-6 text-[13px] text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} CalFlow. All rights reserved.</p>
        <p>AI-generated estimates — not medical advice.</p>
      </div>
    </footer>
  );
}
