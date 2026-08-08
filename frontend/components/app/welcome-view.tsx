'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AgentStateBadge } from '@/components/app/agent-state-badge';
import {
  Stethoscope,
  ClipboardList,
  Clock,
  FileCheck,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  Loader2,
  RotateCcw,
  HeartPulse,
} from 'lucide-react';
import { HealthAvatar } from '@/components/app/health-avatar';

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
  return (
    <div ref={ref} className="min-h-screen w-full bg-background flex flex-col justify-between p-4 md:p-8 overflow-y-auto">
      {/* Top Health Access Navigation Header */}
      <header className="w-full max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center ring-4 ring-teal-500/5 shadow-xs">
            <HeartPulse className="size-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Swasthya Sathi
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 uppercase tracking-wide">
                Voice AI
              </span>
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Healthcare Access & ASHA Worker Support System</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold shadow-xs">
            <ShieldAlert className="size-3.5" />
            <span>108 Emergency Helpline</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
            <ClipboardList className="size-3.5 text-emerald-600" />
            <span>ASHA Tools Active</span>
          </div>
        </div>
      </header>

      {/* Main Hero & State Area */}
      <main className="w-full max-w-4xl mx-auto my-auto py-8 flex flex-col items-center text-center space-y-8">
        {/* Current State Badge */}
        <AgentStateBadge
          state={
            hasEnded || isDisconnected
              ? 'disconnected'
              : isConnecting
              ? 'connecting'
              : 'ready'
          }
        />

        {/* Dynamic State 1 / 2 / 5 Views */}
        {hasEnded || isDisconnected ? (
          /* STATE 5: Call Ended View */
          <div className="bg-card border-border/80 rounded-3xl p-8 border shadow-xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="size-16 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center ring-8 ring-slate-500/5">
              <PhoneCall className="size-8 rotate-135 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Health Consultation Ended</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your consultation session with Swasthya Sathi has concluded. You can review your visit notes or start a new health session anytime.
              </p>
            </div>

            <div className="pt-2">
              <Button
                size="lg"
                onClick={onStartCall}
                className="w-full rounded-full font-mono text-xs font-bold tracking-wider uppercase bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 gap-2 h-12"
              >
                <RotateCcw className="size-4" />
                START NEW CONSULTATION
              </Button>
            </div>
          </div>
        ) : isConnecting ? (
          /* STATE 2: Connecting View */
          <div className="bg-card border-border/80 rounded-3xl p-8 border shadow-xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-300 flex flex-col items-center">
            <HealthAvatar state="connecting" size="md" showDetails={false} />

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Connecting to Swasthya Sathi</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Joining room and establishing voice pipeline for symptom triage & health guidance. Please wait...
              </p>
            </div>
          </div>
        ) : (
          /* STATE 1: Ready View */
          <div className="space-y-8 w-full flex flex-col items-center">
            {/* Dr. Swasthya Sathi Avatar */}
            <HealthAvatar state="ready" size="xl" showDetails={true} />

            {/* Title & Headline */}
            <div className="space-y-3 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                Empowering Rural Healthcare with <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Voice AI</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Speak directly in Hindi or simple English to triage symptoms, check government health schemes, log ASHA visits, and get medicine reminders.
              </p>
            </div>

            {/* Primary Action Button (State 1) */}
            <div>
              <Button
                size="lg"
                onClick={onStartCall}
                className="px-10 py-7 min-w-[280px] rounded-full font-mono text-sm font-extrabold tracking-wider uppercase bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-600/25 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Sparkles className="size-5 mr-2 animate-pulse text-amber-300" />
                {startButtonText}
              </Button>
            </div>

            {/* Step 1: Health Access 4 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-6">
              {/* Card 1: Symptom Triage */}
              <div className="bg-card/80 border-border/70 rounded-2xl p-5 border shadow-xs hover:border-teal-500/40 hover:shadow-md transition-all space-y-3 backdrop-blur-xs">
                <div className="size-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Stethoscope className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Symptom Triage</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Evaluate fever, cough, & child health symptoms. Instant 108 emergency red flag alerts & PHC referral guidance.
                </p>
              </div>

              {/* Card 2: ASHA Worker Tools */}
              <div className="bg-card/80 border-border/70 rounded-2xl p-5 border shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all space-y-3 backdrop-blur-xs">
                <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ClipboardList className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">ASHA Worker Tools</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Log ANC/PNC field visits, track immunization schedules, and maintain community health logs by voice.
                </p>
              </div>

              {/* Card 3: Medication Reminders */}
              <div className="bg-card/80 border-border/70 rounded-2xl p-5 border shadow-xs hover:border-sky-500/40 hover:shadow-md transition-all space-y-3 backdrop-blur-xs">
                <div className="size-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Clock className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Medication Reminders</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Set daily dose schedules and get clear guidance on taking prescribed medicines safely after meals.
                </p>
              </div>

              {/* Card 4: Scheme Eligibility */}
              <div className="bg-card/80 border-border/70 rounded-2xl p-5 border shadow-xs hover:border-indigo-500/40 hover:shadow-md transition-all space-y-3 backdrop-blur-xs">
                <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileCheck className="size-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">Scheme Eligibility</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Check eligibility for Ayushman Bharat (PM-JAY), Janani Suraksha Yojana (JSY), PMMVY, and POSHAN Abhiyaan.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="w-full max-w-5xl mx-auto pt-6 border-t border-border/30 text-center">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <strong>Medical Disclaimer:</strong> Swasthya Sathi provides preliminary health information and triage guidance for community support. In case of life-threatening emergency, call <strong>108 Ambulance</strong> or visit the nearest Primary Health Centre (PHC) immediately.
        </p>
      </footer>
    </div>
  );
};
