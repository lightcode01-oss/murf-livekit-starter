'use client';

import React from 'react';
import { ArrowRight, Brain, HeartHandshake, Mic } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  const steps = [
    {
      num: '01',
      title: 'SPEAK',
      desc: 'Tell Jana Seva what you need in simple Hindi, English, or your local language.',
      icon: <Mic className="size-6 text-amber-600 dark:text-amber-400" />,
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-600',
    },
    {
      num: '02',
      title: 'UNDERSTAND',
      desc: 'AI processes your voice input, checks health guidelines & location data.',
      icon: <Brain className="size-6 text-sky-600 dark:text-sky-400" />,
      color: 'bg-sky-500/10 border-sky-500/20 text-sky-600',
    },
    {
      num: '03',
      title: 'CONNECT',
      desc: 'Get immediate health access, hospital directions, scheme guidance & visit logs.',
      icon: <HeartHandshake className="size-6 text-emerald-600 dark:text-emerald-400" />,
      color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    },
  ];

  return (
    <section id="how-it-works" className={cn('space-y-8 py-12', className)}>
      <div className="mx-auto max-w-xl space-y-3 text-center">
        <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[10px] font-extrabold tracking-widest text-amber-600 uppercase dark:text-amber-500">
          3-Step Simplicity
        </span>
        <h2 className="text-foreground text-2xl font-extrabold tracking-tight md:text-3xl">
          Healthcare access, simplified.
        </h2>
        <p className="text-muted-foreground text-xs leading-relaxed font-medium md:text-sm">
          Designed for citizens of all literacy levels across Bharat.
        </p>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="group bg-card/80 border-border/80 relative flex flex-col justify-between space-y-4 rounded-3xl border p-6 shadow-xs backdrop-blur-xs transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground/50 font-mono text-2xl font-black transition-colors group-hover:text-amber-600">
                {step.num}
              </span>
              <div
                className={cn(
                  'flex size-12 items-center justify-center rounded-2xl border',
                  step.color
                )}
              >
                {step.icon}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-foreground text-base font-extrabold tracking-wide">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>

            {idx < 2 && (
              <div className="text-muted-foreground/40 absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 md:block">
                <ArrowRight className="size-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
