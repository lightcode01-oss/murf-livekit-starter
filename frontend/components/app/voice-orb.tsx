'use client';

import React from 'react';
import { Mic, Volume2, Brain, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export type VoiceOrbState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

interface VoiceOrbProps {
  state?: VoiceOrbState;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceOrb({
  state = 'idle',
  onClick,
  className,
  size = 'lg',
}: VoiceOrbProps) {
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
        'group relative flex items-center justify-center cursor-pointer select-none transition-all duration-500',
        className
      )}
    >
      {/* Outer Glow & Particle Pulse Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* State 2: Listening Pulsing Rings */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping opacity-75 ring-8 ring-amber-500/30" />
            <span className="absolute -inset-6 rounded-full border-2 border-amber-500/40 animate-pulse duration-700" />
            <span className="absolute -inset-12 rounded-full border border-amber-500/20" />
          </>
        )}

        {/* State 4: Speaking Active Voice Aura */}
        {isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse ring-8 ring-emerald-500/30" />
            <span className="absolute -inset-6 rounded-full border-2 border-emerald-500/50 animate-ping duration-1000" />
            <span className="absolute -inset-12 rounded-full border border-teal-500/30 animate-pulse" />
          </>
        )}

        {/* State 3: Thinking Processing Spinning Ring */}
        {isThinking && (
          <>
            <span className="absolute -inset-4 rounded-full border-4 border-dashed border-sky-500/60 animate-spin" />
            <span className="absolute -inset-8 rounded-full border border-sky-500/20 animate-pulse" />
          </>
        )}

        {/* State 5: Error Pulse */}
        {isError && (
          <span className="absolute -inset-4 rounded-full border-2 border-red-500/50 animate-pulse" />
        )}

        {/* State 1: Idle Ambient Ring */}
        {!isListening && !isSpeaking && !isThinking && !isError && (
          <span className="absolute -inset-4 rounded-full border border-amber-500/20 animate-pulse group-hover:border-amber-500/40 transition-colors" />
        )}
      </div>

      {/* Main Gradient Voice Orb Sphere */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 transform backdrop-blur-md',
          orbSize,
          isListening &&
            'bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 shadow-amber-500/40 scale-105 ring-4 ring-amber-400/40',
          isSpeaking &&
            'bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 shadow-emerald-500/40 scale-105 ring-4 ring-emerald-400/40',
          isThinking &&
            'bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 shadow-sky-500/40 ring-4 ring-sky-400/40',
          isError &&
            'bg-gradient-to-br from-red-500 via-rose-600 to-red-700 shadow-red-500/40 ring-4 ring-red-400/40',
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
        <div className="flex items-center justify-center gap-1.5 z-10">
          {isSpeaking || isListening ? (
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-6 bg-white rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-10 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-14 bg-white rounded-full animate-bounce [animation-delay:300ms]" />
              <span className="w-1.5 h-8 bg-white rounded-full animate-bounce [animation-delay:450ms]" />
              <span className="w-1.5 h-5 bg-white rounded-full animate-bounce [animation-delay:200ms]" />
            </div>
          ) : isThinking ? (
            <Brain className="size-12 text-white animate-pulse" />
          ) : isError ? (
            <AlertCircle className="size-12 text-white" />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <Mic className="size-12 text-white stroke-[2.2] group-hover:scale-110 transition-transform" />
            </div>
          )}
        </div>

        {/* Small Sparkle Badge on Idle */}
        {!isListening && !isSpeaking && !isThinking && !isError && (
          <div className="absolute bottom-2 right-2 size-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Sparkles className="size-4 text-amber-200 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
