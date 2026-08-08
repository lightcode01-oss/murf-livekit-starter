'use client';

import React from 'react';
import { Mic, Brain, HeartHandshake, ArrowRight } from 'lucide-react';
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
    <section id="how-it-works" className={cn('py-12 space-y-8', className)}>
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          3-Step Simplicity
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          Healthcare access, simplified.
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
          Designed for citizens of all literacy levels across Bharat.
        </p>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto relative px-4">
        {steps.map((step, idx) => (
          <div
            key={step.num}
            className="group relative bg-card/80 border-border/80 rounded-3xl p-6 border shadow-xs hover:shadow-lg hover:border-amber-500/30 transition-all duration-300 flex flex-col justify-between space-y-4 backdrop-blur-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xl font-black text-muted-foreground/50 group-hover:text-amber-600 transition-colors">
                {step.num}
              </span>
              <div className={cn('size-12 rounded-2xl flex items-center justify-center border', step.color)}>
                {step.icon}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-base tracking-wide text-foreground">
                {step.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                {step.desc}
              </p>
            </div>

            {idx < 2 && (
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/40">
                <ArrowRight className="size-5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
