'use client';

import React from 'react';
import { Sparkles, Mic, Accessibility, ShieldCheck } from 'lucide-react';
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
    <section className={cn('py-12 bg-muted/40 rounded-3xl p-8 border border-border/60 space-y-8', className)}>
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
          <ShieldCheck className="size-3.5" />
          <span>Public Service Mission</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Built for Bharat 🇮🇳
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
          Bridging the healthcare access gap with accessible AI technology for every Indian citizen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {pillars.map((p) => (
          <div
            key={p.title}
            className="bg-background/90 border-border/70 rounded-2xl p-5 border shadow-xs text-center space-y-3 hover:border-amber-500/30 transition-colors"
          >
            <div className="size-12 rounded-xl bg-muted mx-auto flex items-center justify-center">
              {p.icon}
            </div>
            <h3 className="font-extrabold text-sm text-foreground">{p.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
