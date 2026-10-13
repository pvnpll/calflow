// Shared minimal landing primitives: section shell, eyebrow, reveal-on-scroll.
'use client';

import { motion } from 'framer-motion';
import { cn } from 'cn';

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  sub,
  children,
  className,
  narrow = false,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  sub?: string;
  children?: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <section id={id} className={cn('px-5 py-20 sm:py-28', className)}>
      <div className={cn('mx-auto', narrow ? 'max-w-3xl' : 'max-w-6xl')}>
        <Reveal className="mx-auto max-w-2xl text-center">
          {eyebrow ? (
            <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {sub ? (
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {sub}
            </p>
          ) : null}
        </Reveal>
        {children ? <div className="mt-12 sm:mt-16">{children}</div> : null}
      </div>
    </section>
  );
}
