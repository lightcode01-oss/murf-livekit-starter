'use client';

import React, { useState } from 'react';
import { ArrowRight, HeartPulse, Mic, ShieldCheck, Sparkles } from 'lucide-react';
import { Footer } from '@/components/app/footer';
import { type Category, HealthCategories } from '@/components/app/health-categories';
import { HowItWorks } from '@/components/app/how-it-works';
import { JanaSevaAvatar } from '@/components/app/jana-seva-avatar';
import { LanguageSelector } from '@/components/app/language-selector';
import { Navbar } from '@/components/app/navbar';
import { type QuickPromptItem, QuickPrompts } from '@/components/app/quick-prompts';
import { SafetyNotice } from '@/components/app/safety-notice';
import { TrustSection } from '@/components/app/trust-section';
import { VoiceModal } from '@/components/app/voice-modal';
import { VoiceOrb, type VoiceOrbState } from '@/components/app/voice-orb';
import { Button } from '@/components/ui/button';
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
    <div
      ref={ref}
      className="bg-background flex min-h-screen w-full flex-col justify-between overflow-x-hidden selection:bg-amber-500/20"
    >
      {/* Sticky Navbar */}
      <Navbar onStartVoice={onStartCall} />

      {/* Main Content Sections Container */}
      <main className="mx-auto w-full max-w-6xl space-y-16 px-4 py-8 md:px-8">
        {/* HERO SECTION (Section 5) */}
        <section
          id="hero"
          className="grid grid-cols-1 items-center gap-10 py-8 md:py-12 lg:grid-cols-12"
        >
          {/* LEFT HERO TEXT & CTA */}
          <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold text-amber-700 shadow-xs dark:text-amber-300">
              <span className="text-base">🇮🇳</span>
              <span>VOICE OF BHARAT • HEALTH ACCESS</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-foreground font-sans text-4xl leading-none font-black tracking-tight sm:text-5xl lg:text-6xl">
                Healthcare,
                <br />
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-emerald-600 bg-clip-text text-transparent">
                  in your voice.
                </span>
              </h1>
              <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed font-medium md:text-lg lg:mx-0">
                Speak naturally. Jana Seva helps you understand health information and find the
                right healthcare access — in a way that&apos;s simple, local and human.
              </p>
            </div>

            {/* HERO CTA BUTTONS */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
              <Button
                size="lg"
                onClick={onStartCall}
                className="cursor-pointer gap-2.5 rounded-full bg-amber-600 px-8 py-7 font-mono text-sm font-extrabold tracking-wider text-white uppercase shadow-xl shadow-amber-600/25 transition-all duration-300 hover:scale-105 hover:bg-amber-700 active:scale-95"
              >
                <Sparkles className="size-5 animate-pulse text-amber-200" />
                <span>🎙️ Talk to Jana Seva</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('categories');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="border-border/80 text-foreground hover:bg-muted cursor-pointer gap-2 rounded-full px-7 py-7 text-xs font-semibold"
              >
                <span>Explore Health Services</span>
                <ArrowRight className="text-muted-foreground size-4" />
              </Button>
            </div>
          </div>

          {/* RIGHT AI AVATAR & VOICE ORB DISPLAY (Section 6 & 8) */}
          <div className="relative flex flex-col items-center justify-center lg:col-span-5">
            <div className="bg-muted/30 border-border/50 relative flex w-full max-w-sm flex-col items-center space-y-6 rounded-3xl border p-6 text-center shadow-2xl backdrop-blur-md">
              <JanaSevaAvatar
                state={isConnecting ? 'connecting' : 'idle'}
                size="xl"
                showDetails={true}
              />

              <div className="space-y-1">
                <p className="text-foreground flex items-center justify-center gap-1.5 text-xs font-bold">
                  <Mic className="size-3.5 animate-pulse text-amber-600" />
                  Voice-First Health Assistant
                </p>
                <p className="text-muted-foreground text-[11px] font-medium">
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
