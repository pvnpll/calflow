"use client";

import { Droplets, MessagesSquare, TrendingUp } from "lucide-react";
import { Section, Reveal } from "./primitives";
import { ChatShot, InsightsShot, ShotFrame, Bar } from "./shots";

const ROWS = [
  {
    icon: <MessagesSquare className="h-4 w-4" />,
    eyebrow: "Log",
    title: "Tell AI Assistant what you ate.",
    body: "No forms, no database search. AI Assistant works out the calories, protein, carbs, fat, and fiber, then saves the meal to CalFlow through MCP. Compatible with ChatGPT, Gemini, Claude.",
    shot: <ChatShot />,
    caption: "ChatGPT logging a meal to CalFlow and answering from your saved data.",
  },
  {
    icon: <Droplets className="h-4 w-4" />,
    eyebrow: "Track",
    title: "Water and weight, without friction.",
    body: "One tap logs 250ml. Step on the scale and your trend builds next to your nutrition — so you see what's actually working.",
    shot: (
      <ShotFrame label="calflow — hydration & weight">
        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 p-4 text-center">
            <p className="text-xs text-muted-foreground">Today&apos;s water</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">1.75 / 2.5 L</p>
            <div className="mx-auto mt-3 max-w-xs"><Bar value={1.75} target={2.5} className="bg-blue-500" /></div>
            <div className="mt-3 inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background">+ 250 ml</div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Current weight</p>
              <p className="text-xl font-bold tabular-nums">76.4 <span className="text-sm font-normal text-muted-foreground">kg</span></p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">↓ 1.2 kg this month</span>
          </div>
        </div>
      </ShotFrame>
    ),
    caption: "Hydration and weight, next to your nutrition.",
  },
  {
    icon: <TrendingUp className="h-4 w-4" />,
    eyebrow: "Understand",
    title: "Your history becomes advice.",
    body: "Every meal AI Assistant logs builds your record. CalFlow compares today against your targets and past weeks, then recommends the meal that closes the gap.",
    shot: <InsightsShot />,
    caption: "Insights and a dinner recommendation, built from your logged meals.",
  },
];

export function ProductSection() {
  return (
    <Section
      id="product"
      eyebrow="Product"
      title="Log calories → Get Insights"
      sub="Your AI assistant does the logging through MCP. CalFlow keeps the record and turns it into insights and help you reach your goal."
    >
      <div className="space-y-16 sm:space-y-24">
        {ROWS.map((r, i) => (
          <div key={r.eyebrow} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
              <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card">{r.icon}</span>
                {r.eyebrow}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{r.title}</h3>
              <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{r.body}</p>
            </Reveal>
            <Reveal delay={0.1} className={i % 2 === 1 ? "lg:order-1" : ""}>
              {r.shot}
              <p className="mt-3 text-center text-xs text-muted-foreground">{r.caption}</p>
            </Reveal>
          </div>
        ))}
      </div>
    </Section>
  );
}
