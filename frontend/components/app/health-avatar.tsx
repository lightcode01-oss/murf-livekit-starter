'use client';

import React from 'react';
import Image from 'next/image';
import { type AgentState } from '@livekit/components-react';
import { Stethoscope, Mic, Volume2, Brain, CheckCircle2, ShieldAlert } from 'lucide-react';
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
    <div className={cn('flex flex-col items-center justify-center text-center space-y-3', className)}>
      {/* Outer Pulse Rings & Avatar Wrapper */}
      <div className="relative flex items-center justify-center">
        {/* Animated Soundwave Rings when Listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping opacity-75 ring-4 ring-emerald-500/40" />
            <span className="absolute -inset-4 rounded-full border-2 border-emerald-500/40 animate-pulse" />
            <span className="absolute -inset-8 rounded-full border border-emerald-500/20" />
          </>
        )}

        {/* Animated Aura Waves when Speaking */}
        {isSpeaking && (
          <>
            <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-pulse ring-8 ring-indigo-500/20" />
            <span className="absolute -inset-4 rounded-full border-2 border-indigo-500/50 animate-ping duration-1000" />
            <span className="absolute -inset-8 rounded-full border border-teal-500/30 animate-pulse" />
          </>
        )}

        {/* Spinning Ring when Thinking */}
        {isThinking && (
          <span className="absolute -inset-3 rounded-full border-4 border-dashed border-sky-500/60 animate-spin" />
        )}

        {/* Connecting Ring */}
        {isConnecting && (
          <span className="absolute -inset-3 rounded-full border-4 border-amber-500/40 animate-pulse" />
        )}

        {/* Main Avatar Card Container */}
        <div
          className={cn(
            'relative rounded-full overflow-hidden border-4 bg-gradient-to-b from-teal-500/20 to-emerald-600/20 shadow-2xl transition-all duration-300',
            containerSizes,
            isListening && 'border-emerald-500 ring-4 ring-emerald-500/30 scale-105',
            isSpeaking && 'border-indigo-500 ring-4 ring-indigo-500/40 scale-105',
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
            'absolute -bottom-1 -right-1 size-10 rounded-full flex items-center justify-center text-white border-2 border-background shadow-lg transition-all duration-300',
            isListening && 'bg-emerald-500 scale-110 ring-4 ring-emerald-500/30',
            isSpeaking && 'bg-indigo-600 scale-110 ring-4 ring-indigo-500/30',
            isThinking && 'bg-sky-500 animate-pulse',
            !isListening && !isSpeaking && !isThinking && 'bg-teal-600'
          )}
        >
          {isListening ? (
            <Mic className="size-5 animate-pulse" />
          ) : isSpeaking ? (
            <Volume2 className="size-5 animate-bounce" />
          ) : isThinking ? (
            <Brain className="size-5 animate-spin-slow" />
          ) : (
            <Stethoscope className="size-5" />
          )}
        </div>
      </div>

      {/* Details Box */}
      {showDetails && (
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="font-bold text-base md:text-lg text-foreground flex items-center gap-1.5">
              Dr. Swasthya Sathi
              <CheckCircle2 className="size-4 text-teal-500 fill-teal-500/20" />
            </h3>
          </div>
          <p className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            AI Health & ASHA Assistant
          </p>
        </div>
      )}
    </div>
  );
}
