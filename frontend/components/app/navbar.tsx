'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HeartPulse, Menu, MessageSquare, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/shadcn/utils';

interface NavbarProps {
  onStartVoice: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export function Navbar({ onStartVoice, onNavigateSection }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (id: string) => {
    setMobileMenuOpen(false);
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
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-background/80 border-border/60 border-b py-3 shadow-xs backdrop-blur-md'
          : 'bg-transparent py-4'
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 md:px-8">
        {/* LOGO (Speech Bubble + Cross + Pulse) */}
        <div className="flex cursor-pointer items-center gap-3" onClick={() => handleNav('hero')}>
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
            <MessageSquare className="size-6 text-white" />
            <HeartPulse className="absolute size-3.5 stroke-[2.5] text-white" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-foreground font-sans text-lg font-extrabold tracking-tight md:text-xl">
                JANA SEVA
              </span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                🇮🇳 Voice of Bharat
              </span>
            </div>
            <span className="text-muted-foreground text-[10px] leading-none font-semibold tracking-wide">
              Public Health Access Assistant
            </span>
          </div>
        </div>

        {/* CENTER NAV LINKS */}
        <nav className="text-muted-foreground hidden items-center gap-6 text-xs font-semibold md:flex">
          <button
            onClick={() => handleNav('hero')}
            className="hover:text-foreground cursor-pointer transition-colors"
          >
            Home
          </button>
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

          <div className="bg-border/60 h-4 w-px" />

          <Link
            href="/analytics"
            className="flex items-center gap-1 font-bold text-amber-600 transition-colors hover:underline dark:text-amber-400"
          >
            <span>📊 Analytics</span>
          </Link>
          <Link
            href="/escalations"
            className="flex items-center gap-1 font-bold text-emerald-600 transition-colors hover:underline dark:text-emerald-400"
          >
            <span>🚨 Escalations</span>
          </Link>
        </nav>

        {/* RIGHT CTA BUTTON */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            onClick={onStartVoice}
            size="default"
            className="cursor-pointer gap-2 rounded-full bg-amber-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-600/20 transition-transform hover:scale-105 hover:bg-amber-700 active:scale-95"
          >
            <Sparkles className="size-4 animate-pulse text-amber-200" />
            <span>🎙️ Talk to Jana Seva</span>
          </Button>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            onClick={onStartVoice}
            size="sm"
            className="gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
          >
            <Sparkles className="size-3.5" />
            <span>Talk</span>
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-foreground hover:bg-muted rounded-lg p-2"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="bg-background/95 border-border animate-in slide-in-from-top-2 space-y-3 border-b p-4 backdrop-blur-lg duration-200 md:hidden">
          <button
            onClick={() => handleNav('hero')}
            className="text-foreground block w-full py-2 text-left text-sm font-semibold hover:text-amber-600"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('categories')}
            className="text-foreground block w-full py-2 text-left text-sm font-semibold hover:text-amber-600"
          >
            Health Access
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="text-foreground block w-full py-2 text-left text-sm font-semibold hover:text-amber-600"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('languages')}
            className="text-foreground block w-full py-2 text-left text-sm font-semibold hover:text-amber-600"
          >
            Languages
          </button>
          <Link
            href="/analytics"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full py-2 text-left text-sm font-bold text-amber-600 dark:text-amber-400"
          >
            📊 Call Analytics
          </Link>
          <Link
            href="/escalations"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full py-2 text-left text-sm font-bold text-emerald-600 dark:text-emerald-400"
          >
            🚨 Human Escalations
          </Link>
          <div className="border-border/50 border-t pt-2">
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartVoice();
              }}
              className="w-full gap-2 rounded-full bg-amber-600 py-3 text-xs font-bold text-white hover:bg-amber-700"
            >
              <Sparkles className="size-4" />
              <span>🎙️ Talk to Jana Seva</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
