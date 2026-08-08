'use client';

import React from 'react';
import { ShieldAlert, PhoneCall, Hospital } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

interface SafetyNoticeProps {
  className?: string;
}

export function SafetyNotice({ className }: SafetyNoticeProps) {
  return (
    <div
      className={cn(
        'bg-red-500/10 border-red-500/20 text-red-900 dark:text-red-200 border rounded-2xl p-5 backdrop-blur-xs space-y-3',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="size-5 text-red-600 dark:text-red-400 shrink-0" />
        <h4 className="font-extrabold text-sm tracking-tight text-foreground">
          Important Medical & Emergency Notice
        </h4>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
        <strong>Jana Seva</strong> provides general health information and assists in finding healthcare access facilities. It is <strong>not a substitute for a qualified doctor or emergency medical service</strong>.
      </p>

      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-400">
          <PhoneCall className="size-3.5" />
          <span>Emergency Helpline: 108</span>
        </div>
        <span className="text-muted-foreground/40">•</span>
        <div className="flex items-center gap-1.5 font-semibold text-muted-foreground">
          <Hospital className="size-3.5 text-amber-600" />
          <span>Visit nearest Primary Health Centre (PHC) for urgent care</span>
        </div>
      </div>
    </div>
  );
}
