'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/app/navbar';
import { JanaSevaAvatar } from '@/components/app/jana-seva-avatar';
import { VoiceOrb, type VoiceOrbState } from '@/components/app/voice-orb';
import { HealthCategories, type Category } from '@/components/app/health-categories';
import { QuickPrompts, type QuickPromptItem } from '@/components/app/quick-prompts';
import { LanguageSelector } from '@/components/app/language-selector';
import { HowItWorks } from '@/components/app/how-it-works';
import { TrustSection } from '@/components/app/trust-section';
import { SafetyNotice } from '@/components/app/safety-notice';
import { Footer } from '@/components/app/footer';
import { VoiceModal } from '@/components/app/voice-modal';
import { Sparkles, Mic, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  isConnecting?: boolean;
  isDisconnected?: boolean;
  hasEnded?: boolean;
  onResetSession?: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  isConnecting = false,
  isDisconnected = false,
  hasEnded = false,
  onResetSession,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [modalInitialQuery, setModalInitialQuery] = useState<string>('');

  const handleOpenVoice = (query?: string) => {
    setModalInitialQuery(query || '');
    setVoiceModalOpen(true);
  };

  const handleSelectPrompt = (prompt: QuickPromptItem) => {
    handleOpenVoice(prompt.query);
  };

  const handleSelectCategory = (cat: Category) => {
    handleOpenVoice(cat.promptSample);
  };

  return (
    <div ref={ref} className="min-h-screen w-full bg-background flex flex-col justify-between overflow-x-hidden selection:bg-amber-500/20">
      {/* Sticky Navbar */}
      <Navbar onStartVoice={onStartCall} />

      {/* Main Content Sections Container */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 space-y-16 py-8">
        {/* HERO SECTION (Section 5) */}
        <section id="hero" className="py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT HERO TEXT & CTA */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20 shadow-xs">
              <span className="text-base">🇮🇳</span>
              <span>VOICE OF BHARAT • HEALTH ACCESS</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight leading-none font-sans">
                Healthcare,<br />
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
                  in your voice.
                </span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Speak naturally. Jana Seva helps you understand health information and find the right healthcare access — in a way that&apos;s simple, local and human.
              </p>
            </div>

            {/* HERO CTA BUTTONS */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                size="lg"
                onClick={onStartCall}
                className="px-8 py-7 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-sm font-extrabold tracking-wider uppercase shadow-xl shadow-amber-600/25 transition-all duration-300 hover:scale-105 active:scale-95 gap-2.5 cursor-pointer"
              >
                <Sparkles className="size-5 text-amber-200 animate-pulse" />
                <span>🎙️ Talk to Jana Seva</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-7 py-7 rounded-full border-border/80 text-foreground font-semibold text-xs gap-2 hover:bg-muted cursor-pointer"
              >
                <span>Explore Health Services</span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* RIGHT AI AVATAR & VOICE ORB DISPLAY (Section 6 & 8) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative p-6 rounded-3xl bg-muted/30 border border-border/50 backdrop-blur-md shadow-2xl w-full max-w-sm flex flex-col items-center text-center space-y-6">
              <JanaSevaAvatar state={isConnecting ? 'connecting' : 'idle'} size="xl" showDetails={true} />

              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground flex items-center justify-center gap-1.5">
                  <Mic className="size-3.5 text-amber-600 animate-pulse" />
                  Voice-First Health Assistant
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Click to start live voice consultation
                </p>
              </div>

              {/* Central Voice Orb Trigger */}
              <VoiceOrb
                state={isConnecting ? 'connecting' : 'idle'}
                onClick={onStartCall}
                size="md"
              />
            </div>
          </div>
        </section>

        {/* QUICK VOICE PROMPTS (Section 11) */}
        <QuickPrompts onSelectPrompt={handleSelectPrompt} />

        {/* HEALTH ACCESS CATEGORIES (Section 10) */}
        <HealthCategories onSelectCategory={handleSelectCategory} />

        {/* HOW IT WORKS (Section 16) */}
        <HowItWorks />

        {/* MULTILINGUAL INDIA (Section 12) */}
        <section id="languages" className="py-8">
          <LanguageSelector onLanguageChange={(code) => console.log('Language changed:', code)} />
        </section>

        {/* TRUST SECTION (Section 13) */}
        <TrustSection />

        {/* HEALTH SAFETY NOTICE (Section 14) */}
        <section id="safety">
          <SafetyNotice />
        </section>
      </main>

      {/* FOOTER (Section 27) */}
      <Footer />

      {/* FULL-SCREEN VOICE EXPERIENCE MODAL (Section 9 & 24) */}
      <VoiceModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        initialQuery={modalInitialQuery}
        isLiveConnection={false}
        onLiveStart={onStartCall}
      />
    </div>
  );
};
