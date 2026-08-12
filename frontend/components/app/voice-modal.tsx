'use client';

import React, { useEffect, useState } from 'react';
import {
  Brain,
  MapPin,
  Mic,
  Navigation,
  PhoneCall,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { JanaSevaAvatar } from '@/components/app/jana-seva-avatar';
import { VoiceOrb, type VoiceOrbState } from '@/components/app/voice-orb';
import { Button } from '@/components/ui/button';
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
      assistantReply:
        'Aapke nazdeek sabse paas District Community Health Centre 2.4 km door hai. Yahan 24/7 Emergency, OPD, aur Jan Aushadhi generic chemist available hai.',
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
      assistantReply:
        'Aapke ilake mein Primary Health Centre (PHC) mein har Budhvar ko regular immunization booth lagta hai. Polio aur Routine child vaccines bilkul free hain.',
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
      assistantReply:
        'Ayushman Bharat (PM-JAY) card ke liye Ration Card ya SECC ID required hai. Isse family ko har saal 5 Lakh rupees tak free ilaaj milta hai. Aap nearest CSC center par card banwa sakte hain.',
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
      assistantReply:
        'Jana Seva aapko nearest government hospital, Jan Aushadhi generic medicines, aur free health scheme access mein madad karta hai.',
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
        else if (q.toLowerCase().includes('ayushman') || q.toLowerCase().includes('scheme'))
          resp = sampleResponses.schemes;

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
    <div className="bg-background/95 animate-in fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 backdrop-blur-xl duration-300 md:p-8">
      {/* Top Header Controls */}
      <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between md:top-6 md:right-8 md:left-8">
        <div className="flex items-center gap-2">
          <span className="size-3 animate-pulse rounded-full bg-emerald-500" />
          <span className="text-foreground text-xs font-bold tracking-wider uppercase">
            JANA SEVA Voice Session
          </span>
        </div>

        <Button
          onClick={onClose}
          variant="outline"
          size="icon-sm"
          className="bg-background/80 hover:bg-muted size-9 cursor-pointer rounded-full"
        >
          <X className="size-5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {/* Main Workspace Flow */}
      <div className="mx-auto my-auto flex w-full max-w-3xl flex-col items-center justify-center space-y-8 py-12 text-center">
        {/* Avatar & Voice Orb Display */}
        <div className="relative flex items-center justify-center pt-6">
          <JanaSevaAvatar state={orbState} size="xl" showDetails={false} />
        </div>

        {/* State Indicators */}
        <div className="max-w-md space-y-2">
          {orbState === 'listening' && (
            <div className="inline-flex animate-pulse items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300">
              <Mic className="size-4 animate-bounce" />
              <span>I&apos;m listening… Speak naturally</span>
            </div>
          )}

          {orbState === 'thinking' && (
            <div className="inline-flex animate-pulse items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/15 px-4 py-2 text-xs font-bold text-sky-700 dark:text-sky-300">
              <Brain className="animate-spin-slow size-4" />
              <span>Let me understand that… Searching health database</span>
            </div>
          )}

          {orbState === 'speaking' && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <Volume2 className="size-4 animate-bounce text-emerald-600" />
              <span>Swasthya Sathi is speaking…</span>
            </div>
          )}

          {orbState === 'idle' && responseData && (
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/15 px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-300">
              <Sparkles className="size-4 text-teal-600" />
              <span>Response Ready</span>
            </div>
          )}
        </div>

        {/* USER SAID TRANSCRIPT */}
        {transcript && (
          <div className="bg-muted/70 border-border/60 w-full max-w-lg space-y-1 rounded-2xl border p-4 text-left">
            <span className="text-muted-foreground block text-[10px] font-bold tracking-wider uppercase">
              👤 You Said:
            </span>
            <p className="text-foreground text-sm font-semibold">“{transcript}”</p>
          </div>
        )}

        {/* RESPONSE CARD (Section 17) */}
        {responseData && (
          <div className="bg-card border-border animate-in fade-in slide-in-from-bottom-4 w-full max-w-lg space-y-5 rounded-3xl border p-6 text-left shadow-2xl duration-300">
            {/* JANA SEVA REPLIES */}
            <div className="space-y-2">
              <span className="block flex items-center gap-1 text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
                <Sparkles className="size-3" /> JANA SEVA REPLIES:
              </span>
              <p className="text-foreground text-xs leading-relaxed font-medium md:text-sm">
                {responseData.assistantReply}
              </p>
            </div>

            {/* LOCATION / RESULT CARD */}
            {responseData.locationTitle && (
              <div className="bg-muted/60 border-border/60 space-y-2 rounded-2xl border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-foreground flex items-center gap-1.5 text-xs font-bold">
                    <MapPin className="size-4 shrink-0 text-amber-600" />
                    {responseData.locationTitle}
                  </span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                    {responseData.distance}
                  </span>
                </div>
                {responseData.address && (
                  <p className="text-muted-foreground text-[11px] font-medium">
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
                className="gap-1.5 rounded-full border-emerald-500/30 text-xs font-bold text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
              >
                {isPlayingAudio ? (
                  <VolumeX className="size-3.5" />
                ) : (
                  <Volume2 className="size-3.5" />
                )}
                <span>{isPlayingAudio ? 'Playing Audio...' : '🎙️ Hear Response'}</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => startDemoFlow('Mere paas government hospital kahan hai?')}
                  variant="outline"
                  size="sm"
                  className="gap-1 rounded-full text-xs font-semibold"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Try Again</span>
                </Button>
                <Button
                  onClick={() => startDemoFlow()}
                  size="sm"
                  className="gap-1 rounded-full bg-amber-600 text-xs font-bold text-white hover:bg-amber-700"
                >
                  <Mic className="size-3.5" />
                  <span>Ask Another Question</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAP TO RE-SPEAK OR CONNECT LIVE AGENT CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            onClick={() => startDemoFlow()}
            size="lg"
            className="cursor-pointer gap-2 rounded-full bg-amber-600 px-6 py-6 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-xl shadow-amber-600/25 hover:bg-amber-700"
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
              className="cursor-pointer gap-2 rounded-full bg-emerald-600 px-6 py-6 font-mono text-xs font-bold tracking-wider text-white uppercase shadow-xl shadow-emerald-600/25 hover:bg-emerald-700"
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
