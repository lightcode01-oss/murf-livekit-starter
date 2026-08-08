'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Menu, X, HeartPulse, MessageSquare, PhoneCall } from 'lucide-react';
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
          ? 'bg-background/80 backdrop-blur-md border-b border-border/60 shadow-xs py-3'
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* LOGO (Speech Bubble + Cross + Pulse) */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('hero')}>
          <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20">
            <MessageSquare className="size-6 text-white" />
            <HeartPulse className="absolute size-3.5 text-white stroke-[2.5]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg md:text-xl tracking-tight text-foreground font-sans">
                JANA SEVA
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                🇮🇳 Voice of Bharat
              </span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground tracking-wide leading-none">
              Public Health Access Assistant
            </span>
          </div>
        </div>

        {/* CENTER NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-muted-foreground">
          <button
            onClick={() => handleNav('hero')}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('categories')}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Health Access
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('languages')}
            className="hover:text-foreground transition-colors cursor-pointer"
          >
            Languages
          </button>
        </nav>

        {/* RIGHT CTA BUTTON */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            onClick={onStartVoice}
            size="default"
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-5 py-2.5 shadow-md shadow-amber-600/20 gap-2 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
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
            className="rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 gap-1 shadow-sm"
          >
            <Sparkles className="size-3.5" />
            <span>Talk</span>
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-foreground hover:bg-muted"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-lg border-b border-border p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNav('hero')}
            className="block w-full text-left py-2 text-sm font-semibold text-foreground hover:text-amber-600"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('categories')}
            className="block w-full text-left py-2 text-sm font-semibold text-foreground hover:text-amber-600"
          >
            Health Access
          </button>
          <button
            onClick={() => handleNav('how-it-works')}
            className="block w-full text-left py-2 text-sm font-semibold text-foreground hover:text-amber-600"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNav('languages')}
            className="block w-full text-left py-2 text-sm font-semibold text-foreground hover:text-amber-600"
          >
            Languages
          </button>
          <div className="pt-2 border-t border-border/50">
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartVoice();
              }}
              className="w-full rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 gap-2"
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
