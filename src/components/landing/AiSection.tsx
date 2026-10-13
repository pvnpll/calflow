"use client";

import { Bot, MessageSquareText, Plug } from "lucide-react";
import { Section, Reveal } from "./primitives";

const CARDS = [
  {
    icon: <MessageSquareText className="h-5 w-5" />,
    title: "CalFlow AI",
    body: "Built in. Log, edit, ask, and analyze — “change lunch from 2 rotis to 3” just works.",
    ex: "“What am I short on today?”",
  },
  {
    icon: <Bot className="h-5 w-5" />,
    title: "ChatGPT, Claude & Gemini",
    body: "Log meals in the assistant you already use. “I had 3 eggs and 2 rotis” becomes a CalFlow entry.",
    ex: "“Log my breakfast: oats, milk, banana.”",
  },
  {
    icon: <Plug className="h-5 w-5" />,
    title: "MCP + Siri Shortcuts",
    body: "One data layer, many interfaces — AI tools and phone shortcuts write to the same nutrition record.",
    ex: "“Add 500ml water”",
  },
];

export function AiSection() {
  return (
    <Section
      id="ai"
      eyebrow="AI"
      title="Talk to your nutrition data."
      sub="CalFlow doesn't make you fill out forms. You simply talk — anywhere."
      className="border-y border-border/50 bg-muted/30"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">{c.icon}</span>
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
              <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-[13px] font-medium">{c.ex}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
