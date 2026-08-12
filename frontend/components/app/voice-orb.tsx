'use client';

import React from 'react';
import { AlertCircle, Brain, Mic, Sparkles, Volume2 } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export type VoiceOrbState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

interface VoiceOrbProps {
  state?: VoiceOrbState;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceOrb({ state = 'idle', onClick, className, size = 'lg' }: VoiceOrbProps) {
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isSpeaking = state === 'speaking';
  const isError = state === 'error';

  const sizeClasses = {
    sm: 'size-20',
    md: 'size-32',
    lg: 'size-44 md:size-52',
  };

  const orbSize = sizeClasses[size] || sizeClasses.lg;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex cursor-pointer items-center justify-center transition-all duration-500 select-none',
        className
      )}
    >
      {/* Outer Glow & Particle Pulse Rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* State 2: Listening Pulsing Rings */}
        {isListening && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/20 opacity-75 ring-8 ring-amber-500/30" />
            <span className="absolute -inset-6 animate-pulse rounded-full border-2 border-amber-500/40 duration-700" />
            <span className="absolute -inset-12 rounded-full border border-amber-500/20" />
          </>
        )}

        {/* State 4: Speaking Active Voice Aura */}
        {isSpeaking && (
          <>
            <span className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/30 ring-8 ring-emerald-500/30" />
            <span className="absolute -inset-6 animate-ping rounded-full border-2 border-emerald-500/50 duration-1000" />
            <span className="absolute -inset-12 animate-pulse rounded-full border border-teal-500/30" />
          </>
        )}

        {/* State 3: Thinking Processing Spinning Ring */}
        {isThinking && (
          <>
            <span className="absolute -inset-4 animate-spin rounded-full border-4 border-dashed border-sky-500/60" />
            <span className="absolute -inset-8 animate-pulse rounded-full border border-sky-500/20" />
          </>
        )}

        {/* State 5: Error Pulse */}
        {isError && (
          <span className="absolute -inset-4 animate-pulse rounded-full border-2 border-red-500/50" />
        )}

        {/* State 1: Idle Ambient Ring */}
        {!isListening && !isSpeaking && !isThinking && !isError && (
          <span className="absolute -inset-4 animate-pulse rounded-full border border-amber-500/20 transition-colors group-hover:border-amber-500/40" />
        )}
      </div>

      {/* Main Gradient Voice Orb Sphere */}
      <div
        className={cn(
          'relative flex transform items-center justify-center rounded-full shadow-2xl backdrop-blur-md transition-all duration-500',
          orbSize,
          isListening &&
            'scale-105 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 ring-4 shadow-amber-500/40 ring-amber-400/40',
          isSpeaking &&
            'scale-105 bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 ring-4 shadow-emerald-500/40 ring-emerald-400/40',
          isThinking &&
            'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 ring-4 shadow-sky-500/40 ring-sky-400/40',
          isError &&
            'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 ring-4 shadow-red-500/40 ring-red-400/40',
          !isListening &&
            !isSpeaking &&
            !isThinking &&
            !isError &&
            'bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-600 shadow-amber-500/20 group-hover:scale-105 group-hover:shadow-amber-500/30'
        )}
      >
        {/* Inner Highlight Reflection */}
        <div className="absolute top-3 left-6 size-12 rounded-full bg-white/25 blur-xs" />

        {/* Real-time Waveform Micro-Bar Animations inside Orb */}
        <div className="z-10 flex items-center justify-center gap-1.5">
          {isSpeaking || isListening ? (
            <div className="flex items-center gap-1">
              <span className="h-6 w-1.5 animate-bounce rounded-full bg-white [animation-delay:0ms]" />
              <span className="h-10 w-1.5 animate-bounce rounded-full bg-white [animation-delay:150ms]" />
              <span className="h-14 w-1.5 animate-bounce rounded-full bg-white [animation-delay:300ms]" />
              <span className="h-8 w-1.5 animate-bounce rounded-full bg-white [animation-delay:450ms]" />
              <span className="h-5 w-1.5 animate-bounce rounded-full bg-white [animation-delay:200ms]" />
            </div>
          ) : isThinking ? (
            <Brain className="size-12 animate-pulse text-white" />
          ) : isError ? (
            <AlertCircle className="size-12 text-white" />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <Mic className="size-12 stroke-[2.2] text-white transition-transform group-hover:scale-110" />
            </div>
          )}
        </div>

        {/* Small Sparkle Badge on Idle */}
        {!isListening && !isSpeaking && !isThinking && !isError && (
          <div className="absolute right-2 bottom-2 flex size-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
            <Sparkles className="size-4 animate-pulse text-amber-200" />
          </div>
        )}
      </div>
    </div>
  );
}
