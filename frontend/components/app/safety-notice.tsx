'use client';

import React from 'react';
import { Hospital, PhoneCall, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

interface SafetyNoticeProps {
  className?: string;
}

export function SafetyNotice({ className }: SafetyNoticeProps) {
  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-900 backdrop-blur-xs dark:text-red-200',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="size-5 shrink-0 text-red-600 dark:text-red-400" />
        <h4 className="text-foreground text-sm font-extrabold tracking-tight">
          Important Medical & Emergency Notice
        </h4>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed font-medium">
        <strong>Jana Seva</strong> provides general health information and assists in finding
        healthcare access facilities. It is{' '}
        <strong>not a substitute for a qualified doctor or emergency medical service</strong>.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400">
          <PhoneCall className="size-3.5" />
          <span>Emergency Helpline: 108</span>
        </div>
        <span className="text-muted-foreground/40">•</span>
        <div className="text-muted-foreground flex items-center gap-1.5 font-semibold">
          <Hospital className="size-3.5 text-amber-600" />
          <span>Visit nearest Primary Health Centre (PHC) for urgent care</span>
        </div>
      </div>
    </div>
  );
}
