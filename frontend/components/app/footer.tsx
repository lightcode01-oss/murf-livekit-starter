'use client';

import React from 'react';
import { HeartPulse, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

interface FooterProps {
  className?: string;
  onNavigateSection?: (sectionId: string) => void;
}

export function Footer({ className, onNavigateSection }: FooterProps) {
  const handleNav = (id: string) => {
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer
      className={cn('border-border/50 bg-background/80 w-full border-t pt-10 pb-8', className)}
    >
      <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center space-y-2 text-center md:items-start md:text-left">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
                <MessageSquare className="size-5 text-white" />
                <HeartPulse className="absolute size-3 stroke-[2.5] text-white" />
              </div>
              <span className="text-foreground font-sans text-xl font-extrabold tracking-tight">
                JANA SEVA
              </span>
            </div>
            <p className="text-xs font-semibold tracking-wide text-amber-600 dark:text-amber-500">
              “Your Voice. Your Health. Your Access.”
            </p>
          </div>

          {/* Links */}
          <nav className="text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
            <button
              onClick={() => handleNav('categories')}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Health Access
            </button>
            <button
              onClick={() => handleNav('how-it-works')}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNav('languages')}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Languages
            </button>
            <button
              onClick={() => handleNav('safety')}
              className="hover:text-foreground cursor-pointer transition-colors"
            >
              Safety & Disclaimer
            </button>
          </nav>
        </div>

        {/* Bottom Metadata */}
        <div className="border-border/40 text-muted-foreground flex flex-col items-center justify-between gap-3 border-t pt-6 text-[11px] sm:flex-row">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Built for</span>
            <span className="text-foreground font-bold">Voice of Bharat</span>
            <span>• Powered by Voice AI Technology</span>
          </div>

          <p className="text-center font-medium sm:text-right">
            Public-interest project for public health access.
          </p>
        </div>
      </div>
    </footer>
  );
}
