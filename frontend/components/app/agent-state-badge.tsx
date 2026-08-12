'use client';

import React from 'react';
import { Brain, CheckCircle2, Loader2, Mic, PhoneOff, Volume2 } from 'lucide-react';
import { type AgentState } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

interface AgentStateBadgeProps {
  state?: AgentState | 'ready' | 'connecting' | 'disconnected';
  className?: string;
}

export function AgentStateBadge({ state = 'ready', className }: AgentStateBadgeProps) {
  const getBadgeContent = () => {
    switch (state) {
      case 'ready':
        return {
          label: 'Ready to connect',
          subtext: 'Click Start Health Consultation to begin',
          icon: <CheckCircle2 className="size-4 text-emerald-500" />,
          colorClass:
            'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
          pulse: false,
        };
      case 'connecting':
      case 'initializing':
        return {
          label: 'Connecting to Swasthya Sathi...',
          subtext: 'Establishing secure voice connection',
          icon: <Loader2 className="size-4 animate-spin text-amber-500" />,
          colorClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
          pulse: true,
        };
      case 'listening':
        return {
          label: 'Listening to you...',
          subtext: 'Speak your health query or symptom',
          icon: (
            <span className="relative flex size-3 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <Mic className="relative z-10 size-3.5 text-emerald-600 dark:text-emerald-400" />
            </span>
          ),
          colorClass:
            'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30 ring-2 ring-emerald-500/20',
          pulse: true,
        };
      case 'thinking':
        return {
          label: 'Swasthya Sathi is thinking...',
          subtext: 'Analyzing symptoms & health guidelines',
          icon: <Brain className="size-4 animate-pulse text-sky-500" />,
          colorClass: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20',
          pulse: true,
        };
      case 'speaking':
        return {
          label: 'Swasthya Sathi is speaking...',
          subtext: 'Listen to health advice & instructions',
          icon: (
            <span className="relative flex size-3 items-center justify-center">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <Volume2 className="relative z-10 size-3.5 text-indigo-600 dark:text-indigo-400" />
            </span>
          ),
          colorClass:
            'bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-indigo-500/30 ring-2 ring-indigo-500/20',
          pulse: true,
        };
      case 'disconnected':
        return {
          label: 'Consultation Ended',
          subtext: 'Thank you for using Swasthya Sathi',
          icon: <PhoneOff className="size-4 text-slate-400" />,
          colorClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
          pulse: false,
        };
      default:
        return {
          label: 'Swasthya Sathi Active',
          subtext: 'Voice health assistant',
          icon: <Mic className="text-primary size-4" />,
          colorClass: 'bg-primary/10 text-primary border-primary/20',
          pulse: false,
        };
    }
  };

  const badge = getBadgeContent();

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-semibold shadow-xs backdrop-blur-md transition-all duration-300',
        badge.colorClass,
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-center">{badge.icon}</div>
      <div className="flex flex-col text-left">
        <span className="leading-none font-bold tracking-tight">{badge.label}</span>
        <span className="mt-0.5 text-[10px] leading-tight font-medium opacity-80">
          {badge.subtext}
        </span>
      </div>
    </div>
  );
}
