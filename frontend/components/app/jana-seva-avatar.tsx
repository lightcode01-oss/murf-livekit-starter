'use client';

import React from 'react';
import Image from 'next/image';
import { Brain, CheckCircle2, Mic, ShieldAlert, Stethoscope, Volume2 } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export type AvatarState = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

interface JanaSevaAvatarProps {
  state?: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  className?: string;
}

export function JanaSevaAvatar({
  state = 'idle',
  size = 'xl',
  showDetails = true,
  className,
}: JanaSevaAvatarProps) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isError = state === 'error';

  const avatarSizes = {
    sm: 'size-20',
    md: 'size-28',
    lg: 'size-40',
    xl: 'size-48 md:size-56',
  };

  const containerSize = avatarSizes[size] || avatarSizes.xl;

  return (
    <div
      className={cn('flex flex-col items-center justify-center space-y-4 text-center', className)}
    >
      {/* Outer Sphere Wrapper & Multi-layer Ambient Rings */}
      <div className="relative flex items-center justify-center">
        {/* Layer 1: Ambient Pulse Ring when Listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-amber-500/20 opacity-75 ring-4 ring-amber-500/40" />
            <span className="absolute -inset-4 animate-pulse rounded-full border-2 border-amber-500/40" />
            <span className="absolute -inset-8 rounded-full border border-amber-500/20" />
          </>
        )}

        {/* Layer 2: Voice Reactive Wave Aura when Speaking */}
        {isSpeaking && (
          <>
            <span className="absolute inset-0 animate-pulse rounded-full bg-emerald-500/30 ring-8 ring-emerald-500/20" />
            <span className="absolute -inset-4 animate-ping rounded-full border-2 border-emerald-500/50 duration-1000" />
            <span className="absolute -inset-8 animate-pulse rounded-full border border-teal-500/30" />
          </>
        )}

        {/* Layer 3: Radar Pulse Ring when Thinking */}
        {isThinking && (
          <span className="absolute -inset-4 animate-spin rounded-full border-4 border-dashed border-sky-500/60" />
        )}

        {/* Layer 4: Subtle Idle Breathing Animation Ring */}
        {!isListening && !isSpeaking && !isThinking && !isError && (
          <span className="absolute -inset-3 animate-pulse rounded-full border-2 border-amber-500/25" />
        )}

        {/* Main Digital Portrait Avatar Container */}
        <div
          className={cn(
            'relative overflow-hidden rounded-full border-4 bg-gradient-to-b from-amber-500/10 via-emerald-500/10 to-slate-900 shadow-2xl transition-all duration-500',
            containerSize,
            isListening && 'scale-105 border-amber-500 ring-4 ring-amber-500/30',
            isSpeaking && 'scale-105 border-emerald-500 ring-4 ring-emerald-500/40',
            isThinking && 'border-sky-500 ring-4 ring-sky-500/20',
            !isListening &&
              !isSpeaking &&
              !isThinking &&
              'border-amber-500/40 hover:border-amber-500'
          )}
        >
          <Image
            src="/swasthya_sathi_avatar.png"
            alt="Jana Seva AI Public Health Assistant"
            fill
            className="object-cover object-center transition-transform duration-700 hover:scale-105"
            priority
          />
        </div>

        {/* Corner State Badge Icon */}
        <div
          className={cn(
            'border-background absolute -right-1 -bottom-1 flex size-11 items-center justify-center rounded-full border-3 text-white shadow-xl transition-all duration-300',
            isListening && 'scale-110 bg-amber-500 ring-4 ring-amber-500/30',
            isSpeaking && 'scale-110 bg-emerald-600 ring-4 ring-emerald-500/30',
            isThinking && 'animate-pulse bg-sky-500',
            !isListening && !isSpeaking && !isThinking && 'bg-amber-600'
          )}
        >
          {isListening ? (
            <Mic className="size-5 animate-pulse" />
          ) : isSpeaking ? (
            <Volume2 className="size-5 animate-bounce" />
          ) : isThinking ? (
            <Brain className="animate-spin-slow size-5" />
          ) : (
            <Stethoscope className="size-5" />
          )}
        </div>
      </div>

      {/* Details Label */}
      {showDetails && (
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-foreground flex items-center gap-1.5 text-base font-extrabold md:text-lg">
              Jana Seva Assistant
              <CheckCircle2 className="size-4 fill-emerald-500/20 text-emerald-500" />
            </h3>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs font-semibold">
            <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
            🇮🇳 Voice of Bharat • Public Health Access
          </p>
        </div>
      )}
    </div>
  );
}
