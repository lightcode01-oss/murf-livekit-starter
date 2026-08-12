'use client';

import React from 'react';
import { CheckCircle2, Lock, MicOff, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function MicPermissionModal({ isOpen, onClose, onRetry }: MicPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs duration-200">
      <div className="bg-card text-card-foreground border-border w-full max-w-md space-y-5 rounded-2xl border p-6 shadow-2xl">
        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 ring-4 ring-red-500/5">
            <MicOff className="size-6" />
          </div>
          <div>
            <h3 className="text-foreground text-lg font-bold">Microphone Access Blocked</h3>
            <p className="text-muted-foreground text-xs font-medium">
              Swasthya Sathi requires audio input
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="bg-muted/50 text-muted-foreground border-border/50 space-y-1.5 rounded-xl border p-3.5 text-xs leading-relaxed">
          <p className="text-foreground flex items-center gap-1.5 font-semibold">
            <ShieldAlert className="size-4 shrink-0 text-amber-500" />
            Why is microphone access required?
          </p>
          <p>
            Swasthya Sathi is a voice-first health assistant. To conduct symptom triage, record ASHA
            visit notes, and answer health questions over voice, microphone permissions are
            required.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            How to unblock in browser:
          </p>
          <ol className="text-foreground space-y-2 text-xs">
            <li className="bg-background border-border/60 flex items-start gap-2 rounded-lg border p-2.5">
              <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                1
              </span>
              <span>
                Click the{' '}
                <strong className="text-foreground inline-flex items-center gap-1 font-semibold">
                  <Lock className="size-3 text-amber-500" /> Lock / Site Settings
                </strong>{' '}
                icon in your address bar.
              </span>
            </li>
            <li className="bg-background border-border/60 flex items-start gap-2 rounded-lg border p-2.5">
              <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                2
              </span>
              <span>
                Find <strong className="text-foreground font-semibold">Microphone</strong> and
                change setting to{' '}
                <strong className="inline-flex items-center gap-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" /> Allow
                </strong>
                .
              </span>
            </li>
            <li className="bg-background border-border/60 flex items-start gap-2 rounded-lg border p-2.5">
              <span className="bg-primary/10 text-primary flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold">
                3
              </span>
              <span>
                Click <strong className="text-foreground font-semibold">Try Again</strong> below or
                refresh your browser tab.
              </span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={onRetry}
            size="sm"
            className="gap-1.5 rounded-full bg-emerald-600 px-5 text-xs font-bold text-white hover:bg-emerald-700"
          >
            <RefreshCw className="animate-spin-slow size-3.5" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
