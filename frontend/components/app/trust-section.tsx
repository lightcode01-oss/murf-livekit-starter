'use client';

import React from 'react';
import { Accessibility, Mic, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

interface TrustSectionProps {
  className?: string;
}

export function TrustSection({ className }: TrustSectionProps) {
  const pillars = [
    {
      icon: <Sparkles className="size-6 text-amber-600 dark:text-amber-400" />,
      title: 'Simple',
      desc: 'No complicated forms, typing, or technical menus required. Just speak.',
    },
    {
      icon: <Mic className="size-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Voice First',
      desc: 'Speak naturally in Hindi, English, or your local regional dialect.',
    },
    {
      icon: <Accessibility className="size-6 text-sky-600 dark:text-sky-400" />,
      title: 'Accessible',
      desc: 'Designed for citizens with different levels of digital literacy across India.',
    },
  ];

  return (
    <section
      className={cn(
        'bg-muted/40 border-border/60 space-y-8 rounded-3xl border p-8 py-12',
        className
      )}
    >
      <div className="mx-auto max-w-xl space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="size-3.5" />
          <span>Public Service Mission</span>
        </div>
        <h2 className="text-foreground text-2xl font-extrabold tracking-tight md:text-3xl">
          Built for Bharat 🇮🇳
        </h2>
        <p className="text-muted-foreground text-xs leading-relaxed font-medium md:text-sm">
          Bridging the healthcare access gap with accessible AI technology for every Indian citizen.
        </p>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="bg-background/90 border-border/70 space-y-3 rounded-2xl border p-5 text-center shadow-xs transition-colors hover:border-amber-500/30"
          >
            <div className="bg-muted mx-auto flex size-12 items-center justify-center rounded-xl">
              {p.icon}
            </div>
            <h3 className="text-foreground text-sm font-extrabold">{p.title}</h3>
            <p className="text-muted-foreground text-xs leading-relaxed font-medium">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
