'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Mic,
  Volume2,
  Brain,
  Navigation,
  MapPin,
  PhoneCall,
  RotateCcw,
  Sparkles,
  VolumeX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceOrb, type VoiceOrbState } from '@/components/app/voice-orb';
import { JanaSevaAvatar } from '@/components/app/jana-seva-avatar';
import { cn } from '@/lib/shadcn/utils';

export interface DemoResponseData {
  userQuery: string;
  assistantReply: string;
  locationTitle?: string;
  distance?: string;
  address?: string;
  actions?: { label: string; url?: string; type?: string }[];
}

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  isLiveConnection?: boolean;
  onLiveStart?: () => void;
}

export function VoiceModal({
  isOpen,
  onClose,
  initialQuery,
  isLiveConnection = false,
  onLiveStart,
}: VoiceModalProps) {
  const [orbState, setOrbState] = useState<VoiceOrbState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [responseData, setResponseData] = useState<DemoResponseData | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Default demo response datasets for interactive prompts
  const sampleResponses: Record<string, DemoResponseData> = {
    hospital: {
      userQuery: 'Mere paas government hospital kahan hai?',
      assistantReply: 'Aapke nazdeek sabse paas District Community Health Centre 2.4 km door hai. Yahan 24/7 Emergency, OPD, aur Jan Aushadhi generic chemist available hai.',
      locationTitle: 'District Community Health Centre (CHC)',
      distance: '2.4 km • 8 min drive',
      address: 'Station Road, Near Gram Panchayat Office, Sector 4',
      actions: [
        { label: 'View Details', type: 'details' },
        { label: 'Get Directions', type: 'directions' },
      ],
    },
    vaccination: {
      userQuery: 'Vaccination centre kaise milega?',
      assistantReply: 'Aapke ilake mein Primary Health Centre (PHC) mein har Budhvar ko regular immunization booth lagta hai. Polio aur Routine child vaccines bilkul free hain.',
      locationTitle: 'Primary Health Centre (PHC) Vaccination Booth',
      distance: '1.2 km • Open Today 9 AM - 4 PM',
      address: 'Main Health Block, Primary Health Centre',
      actions: [
        { label: 'View Vaccination Schedule', type: 'details' },
        { label: 'Get Directions', type: 'directions' },
      ],
    },
    schemes: {
      userQuery: 'Ayushman Bharat ke liye kya chahiye?',
      assistantReply: 'Ayushman Bharat (PM-JAY) card ke liye Ration Card ya SECC ID required hai. Isse family ko har saal 5 Lakh rupees tak free ilaaj milta hai. Aap nearest CSC center par card banwa sakte hain.',
      locationTitle: 'Ayushman Bharat (PM-JAY) Help Desk',
      distance: 'Free Coverage Up to ₹5 Lakh/Family',
      address: 'Nearest Common Service Centre (CSC) or CHC Hospital',
      actions: [
        { label: 'Check Eligibility', type: 'details' },
        { label: 'Find Nearest CSC', type: 'directions' },
      ],
    },
    default: {
      userQuery: 'Mere paas government health service kahan hai?',
      assistantReply: 'Jana Seva aapko nearest government hospital, Jan Aushadhi generic medicines, aur free health scheme access mein madad karta hai.',
      locationTitle: 'Jan Seva Community Health Center',
      distance: '1.8 km nearby',
      address: 'Government Civil Hospital Compound',
      actions: [
        { label: 'View Details', type: 'details' },
        { label: 'Get Directions', type: 'directions' },
      ],
    },
  };

  // Run demo simulation flow when opened with a query or prompt
  const startDemoFlow = (queryText?: string) => {
    const q = queryText || initialQuery || 'Mere paas government hospital kahan hai?';
    setTranscript(q);
    setResponseData(null);

    // State 1 -> State 2: LISTENING (3 seconds)
    setOrbState('listening');

    setTimeout(() => {
      // State 3: THINKING (1.5 seconds)
      setOrbState('thinking');

      setTimeout(() => {
        // Match response
        let resp = sampleResponses.hospital;
        if (q.toLowerCase().includes('vaccin')) resp = sampleResponses.vaccination;
        else if (q.toLowerCase().includes('ayushman') || q.toLowerCase().includes('scheme')) resp = sampleResponses.schemes;

        resp.userQuery = q;
        setResponseData(resp);

        // State 4: SPEAKING (3.5 seconds)
        setOrbState('speaking');
        setIsPlayingAudio(true);

        setTimeout(() => {
          setOrbState('idle');
          setIsPlayingAudio(false);
        }, 3500);
      }, 1500);
    }, 2500);
  };

  useEffect(() => {
    if (isOpen) {
      if (isLiveConnection && onLiveStart) {
        onLiveStart();
      } else {
        startDemoFlow(initialQuery);
      }
    } else {
      setOrbState('idle');
      setResponseData(null);
    }
  }, [isOpen, initialQuery, isLiveConnection]);

  if (!isOpen) return null;

  const handleHearResponse = () => {
    setIsPlayingAudio(true);
    setOrbState('speaking');
    setTimeout(() => {
      setIsPlayingAudio(false);
      setOrbState('idle');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl p-4 md:p-8 animate-in fade-in duration-300 overflow-y-auto">
      {/* Top Header Controls */}
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            JANA SEVA Voice Session
          </span>
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          size="icon-sm"
          className="rounded-full size-9 bg-background/80 hover:bg-muted cursor-pointer"
        >
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Main Workspace Flow */}
      <div className="w-full max-w-3xl mx-auto py-12 flex flex-col items-center justify-center text-center space-y-8 my-auto">
        {/* Avatar & Voice Orb Display */}
        <div className="relative flex items-center justify-center pt-6">
          <JanaSevaAvatar state={orbState} size="xl" showDetails={false} />
        </div>

        {/* State Indicators */}
        <div className="space-y-2 max-w-md">
          {orbState === 'listening' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-500/30 animate-pulse">
              <Mic className="size-4 animate-bounce" />
              <span>I&apos;m listening… Speak naturally</span>
            </div>
          )}

          {orbState === 'thinking' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/15 text-sky-700 dark:text-sky-300 font-bold text-xs border border-sky-500/30 animate-pulse">
              <Brain className="size-4 animate-spin-slow" />
              <span>Let me understand that… Searching health database</span>
            </div>
          )}

          {orbState === 'speaking' && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30">
              <Volume2 className="size-4 animate-bounce text-emerald-600" />
              <span>Swasthya Sathi is speaking…</span>
            </div>
          )}

          {orbState === 'idle' && responseData && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold text-xs border border-teal-500/30">
              <Sparkles className="size-4 text-teal-600" />
              <span>Response Ready</span>
            </div>
          )}
        </div>

        {/* USER SAID TRANSCRIPT */}
        {transcript && (
          <div className="bg-muted/70 border-border/60 rounded-2xl p-4 border max-w-lg w-full text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              👤 You Said:
            </span>
            <p className="text-sm font-semibold text-foreground">“{transcript}”</p>
          </div>
        )}

        {/* RESPONSE CARD (Section 17) */}
        {responseData && (
          <div className="bg-card border-border rounded-3xl p-6 border shadow-2xl max-w-lg w-full text-left space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* JANA SEVA REPLIES */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center gap-1">
                <Sparkles className="size-3" /> JANA SEVA REPLIES:
              </span>
              <p className="text-xs md:text-sm font-medium leading-relaxed text-foreground">
                {responseData.assistantReply}
              </p>
            </div>

            {/* LOCATION / RESULT CARD */}
            {responseData.locationTitle && (
              <div className="bg-muted/60 rounded-2xl p-4 border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="size-4 text-amber-600 shrink-0" />
                    {responseData.locationTitle}
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300">
                    {responseData.distance}
                  </span>
                </div>
                {responseData.address && (
                  <p className="text-[11px] text-muted-foreground font-medium">
                    {responseData.address}
                  </p>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                onClick={handleHearResponse}
                variant="outline"
                size="sm"
                className="rounded-full text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
              >
                {isPlayingAudio ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                <span>{isPlayingAudio ? 'Playing Audio...' : '🎙️ Hear Response'}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => startDemoFlow('Mere paas government hospital kahan hai?')}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-semibold gap-1"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Try Again</span>
                </Button>
                <Button
                  onClick={() => startDemoFlow()}
                  size="sm"
                  className="rounded-full text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white gap-1"
                >
                  <Mic className="size-3.5" />
                  <span>Ask Another Question</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAP TO RE-SPEAK OR CONNECT LIVE AGENT CTA */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => startDemoFlow()}
            size="lg"
            className="px-6 py-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs font-bold tracking-wider uppercase shadow-xl shadow-amber-600/25 gap-2 cursor-pointer"
          >
            <Mic className="size-4 animate-pulse" />
            <span>Try Interactive Voice Demo</span>
          </Button>

          {onLiveStart && (
            <Button
              onClick={() => {
                onClose();
                onLiveStart();
              }}
              size="lg"
              className="px-6 py-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold tracking-wider uppercase shadow-xl shadow-emerald-600/25 gap-2 cursor-pointer"
            >
              <Sparkles className="size-4 animate-pulse" />
              <span>Connect Live Agent (Real Voice)</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
