"use client";

import { Reveal } from "./primitives";

export function ComparisonStrip() {
  return (
    <section className="border-y border-border/50 bg-muted/30 px-5 py-10">
      <Reveal className="mx-auto max-w-4xl text-center">
        <p className="text-balance text-[15px] leading-relaxed text-muted-foreground">
          Traditional trackers answer <span className="font-medium italic text-foreground">“What did I eat?”</span>
          {" "}CalFlow answers <span className="font-medium italic text-foreground">“What does it mean — and what should I do next?”</span>
        </p>
      </Reveal>
    </section>
  );
}
