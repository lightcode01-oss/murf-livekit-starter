'use client';

import React from 'react';
import Image from 'next/image';
import { Brain, CheckCircle2, Mic, ShieldAlert, Stethoscope, Volume2 } from 'lucide-react';
import { type AgentState } from '@livekit/components-react';
import { cn } from '@/lib/shadcn/utils';

interface HealthAvatarProps {
  state?: AgentState | 'ready' | 'connecting' | 'disconnected';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  className?: string;
}

export function HealthAvatar({
  state = 'ready',
  size = 'lg',
  showDetails = true,
  className,
}: HealthAvatarProps) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';
  const isThinking = state === 'thinking';
  const isConnecting = state === 'connecting' || state === 'initializing';

  // Size dimensions
  const avatarSizes = {
    sm: 'size-16',
    md: 'size-24',
    lg: 'size-36',
    xl: 'size-44 md:size-52',
  };

  const containerSizes = avatarSizes[size] || avatarSizes.lg;

  return (
    <div
      className={cn('flex flex-col items-center justify-center space-y-3 text-center', className)}
    >
      {/* Outer Pulse Rings & Avatar Wrapper */}
      <div className="relative flex items-center justify-center">
        {/* Animated Soundwave Rings when Listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/20 opacity-75 ring-4 ring-emerald-500/40" />
            <span className="absolute -inset-4 animate-pulse rounded-full border-2 border-emerald-500/40" />
            <span className="absolute -inset-8 rounded-full border border-emerald-500/20" />
          </>
        )}

        {/* Animated Aura Waves when Speaking */}
        {isSpeaking && (
          <>
            <span className="absolute inset-0 animate-pulse rounded-full bg-indigo-500/30 ring-8 ring-indigo-500/20" />
            <span className="absolute -inset-4 animate-ping rounded-full border-2 border-indigo-500/50 duration-1000" />
            <span className="absolute -inset-8 animate-pulse rounded-full border border-teal-500/30" />
          </>
        )}

        {/* Spinning Ring when Thinking */}
        {isThinking && (
          <span className="absolute -inset-3 animate-spin rounded-full border-4 border-dashed border-sky-500/60" />
        )}

        {/* Connecting Ring */}
        {isConnecting && (
          <span className="absolute -inset-3 animate-pulse rounded-full border-4 border-amber-500/40" />
        )}

        {/* Main Avatar Card Container */}
        <div
          className={cn(
            'relative overflow-hidden rounded-full border-4 bg-gradient-to-b from-teal-500/20 to-emerald-600/20 shadow-2xl transition-all duration-300',
            containerSizes,
            isListening && 'scale-105 border-emerald-500 ring-4 ring-emerald-500/30',
            isSpeaking && 'scale-105 border-indigo-500 ring-4 ring-indigo-500/40',
            isThinking && 'border-sky-500 ring-4 ring-sky-500/20',
            !isListening && !isSpeaking && !isThinking && 'border-teal-500/40 hover:border-teal-500'
          )}
        >
          <Image
            src="/swasthya_sathi_avatar.png"
            alt="Dr. Swasthya Sathi - AI Voice Health Assistant"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Corner Status Badge Icon */}
        <div
          className={cn(
            'border-background absolute -right-1 -bottom-1 flex size-10 items-center justify-center rounded-full border-2 text-white shadow-lg transition-all duration-300',
            isListening && 'scale-110 bg-emerald-500 ring-4 ring-emerald-500/30',
            isSpeaking && 'scale-110 bg-indigo-600 ring-4 ring-indigo-500/30',
            isThinking && 'animate-pulse bg-sky-500',
            !isListening && !isSpeaking && !isThinking && 'bg-teal-600'
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

      {/* Details Box */}
      {showDetails && (
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-foreground flex items-center gap-1.5 text-base font-bold md:text-lg">
              Dr. Swasthya Sathi
              <CheckCircle2 className="size-4 fill-teal-500/20 text-teal-500" />
            </h3>
          </div>
          <p className="text-muted-foreground flex items-center justify-center gap-1 text-xs font-medium">
            <span className="inline-block size-2 animate-pulse rounded-full bg-emerald-500" />
            AI Health & ASHA Assistant
          </p>
        </div>
      )}
    </div>
  );
}
