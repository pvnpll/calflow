"use client";

import { Lock, Database, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Section, Reveal } from "./primitives";

const STEPS = [
  { n: "01", t: "Log", d: "Tell CalFlow what you ate, in plain words." },
  { n: "02", t: "Understand", d: "AI estimates nutrition and structures the data." },
  { n: "03", t: "Analyze", d: "Intake is compared with your goals and history." },
  { n: "04", t: "Act", d: "Get insights and what to eat next." },
];

export function HowItWorksSection() {
  return (
    <>
      <Section id="how-it-works" eyebrow="How it works" title="Four steps. Zero spreadsheets.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="h-full rounded-2xl border border-border/60 bg-card p-6">
                <p className="text-sm font-semibold tabular-nums text-muted-foreground">{s.n}</p>
                <h3 className="mt-2 font-semibold">{s.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
