'use client';

import React, { useState } from 'react';
import { Globe2, Check } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export interface Language {
  code: string;
  name: string;
  native: string;
}

export const INDIAN_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
];

interface LanguageSelectorProps {
  currentLanguage?: string;
  onLanguageChange?: (code: string) => void;
  className?: string;
}

export function LanguageSelector({
  currentLanguage = 'hi',
  onLanguageChange,
  className,
}: LanguageSelectorProps) {
  const [selected, setSelected] = useState(currentLanguage);

  const handleSelect = (code: string) => {
    setSelected(code);
    onLanguageChange?.(code);
  };

  return (
    <div className={cn('space-y-4 text-center', className)}>
      <div className="flex items-center justify-center gap-2">
        <Globe2 className="size-4 text-amber-600 dark:text-amber-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
          Multilingual Support
        </h3>
      </div>

      <p className="text-xs text-muted-foreground font-medium">
        Speak in the language you&apos;re comfortable with
      </p>

      {/* Pill selector container */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto p-1.5 rounded-2xl bg-muted/60 border border-border/50 backdrop-blur-xs">
        {INDIAN_LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              type="button"
              className={cn(
                'group relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none',
                isSelected
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-105'
                  : 'bg-background/80 text-foreground/80 hover:text-foreground hover:bg-background border border-transparent hover:border-border/60'
              )}
            >
              <span>{lang.native}</span>
              <span
                className={cn(
                  'text-[10px] font-medium opacity-70',
                  isSelected ? 'text-white/90' : 'text-muted-foreground'
                )}
              >
                ({lang.name})
              </span>
              {isSelected && <Check className="size-3.5 text-white stroke-[3]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
