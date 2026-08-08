'use client';

import React from 'react';
import { MicOff, ShieldAlert, RefreshCw, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export function MicPermissionModal({ isOpen, onClose, onRetry }: MicPermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border-border w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-5">
        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500 ring-4 ring-red-500/5">
            <MicOff className="size-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Microphone Access Blocked</h3>
            <p className="text-muted-foreground text-xs font-medium">Swasthya Sathi requires audio input</p>
          </div>
        </div>

        {/* Message */}
        <div className="bg-muted/50 rounded-xl p-3.5 text-xs leading-relaxed text-muted-foreground border border-border/50 space-y-1.5">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldAlert className="size-4 text-amber-500 shrink-0" />
            Why is microphone access required?
          </p>
          <p>
            Swasthya Sathi is a voice-first health assistant. To conduct symptom triage, record ASHA visit notes, and answer health questions over voice, microphone permissions are required.
          </p>
        </div>

        {/* Instructions */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">How to unblock in browser:</p>
          <ol className="space-y-2 text-xs text-foreground">
            <li className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border/60">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">1</span>
              <span>Click the <strong className="inline-flex items-center gap-1 font-semibold text-foreground"><Lock className="size-3 text-amber-500" /> Lock / Site Settings</strong> icon in your address bar.</span>
            </li>
            <li className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border/60">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">2</span>
              <span>Find <strong className="font-semibold text-foreground">Microphone</strong> and change setting to <strong className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5"><CheckCircle2 className="size-3" /> Allow</strong>.</span>
            </li>
            <li className="flex items-start gap-2 bg-background p-2.5 rounded-lg border border-border/60">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[11px]">3</span>
              <span>Click <strong className="font-semibold text-foreground">Try Again</strong> below or refresh your browser tab.</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-full text-xs font-semibold">
            Cancel
          </Button>
          <Button onClick={onRetry} size="sm" className="rounded-full text-xs font-bold gap-1.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white">
            <RefreshCw className="size-3.5 animate-spin-slow" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
