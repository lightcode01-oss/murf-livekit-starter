'use client';

import React from 'react';
import { MessageSquare, HeartPulse, Sparkles } from 'lucide-react';
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
    <footer className={cn('w-full border-t border-border/50 bg-background/80 pt-10 pb-8', className)}>
      <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
                <MessageSquare className="size-5 text-white" />
                <HeartPulse className="absolute size-3 text-white stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-foreground font-sans">
                JANA SEVA
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-500 tracking-wide">
              “Your Voice. Your Health. Your Access.”
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
            <button onClick={() => handleNav('categories')} className="hover:text-foreground transition-colors cursor-pointer">
              Health Access
            </button>
            <button onClick={() => handleNav('how-it-works')} className="hover:text-foreground transition-colors cursor-pointer">
              How It Works
            </button>
            <button onClick={() => handleNav('languages')} className="hover:text-foreground transition-colors cursor-pointer">
              Languages
            </button>
            <button onClick={() => handleNav('safety')} className="hover:text-foreground transition-colors cursor-pointer">
              Safety & Disclaimer
            </button>
          </nav>
        </div>

        {/* Bottom Metadata */}
        <div className="pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <span>Built for</span>
            <span className="font-bold text-foreground">Voice of Bharat</span>
            <span>• Powered by Voice AI Technology</span>
          </div>

          <p className="text-center sm:text-right font-medium">
            Public-interest project for public health access.
          </p>
        </div>
      </div>
    </footer>
  );
}
