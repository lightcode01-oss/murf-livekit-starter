'use client';

import React from 'react';
import { ArrowRight, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export interface QuickPromptItem {
  id: string;
  query: string;
  category: string;
  hindiText?: string;
}

interface QuickPromptsProps {
  onSelectPrompt?: (prompt: QuickPromptItem) => void;
  className?: string;
}

export function QuickPrompts({ onSelectPrompt, className }: QuickPromptsProps) {
  const prompts: QuickPromptItem[] = [
    {
      id: 'p1',
      query: 'Mere paas government hospital kahan hai?',
      category: 'Hospital Lookup',
      hindiText: 'मेरे पास सरकारी अस्पताल कहाँ है?',
    },
    {
      id: 'p2',
      query: 'Vaccination centre kaise milega?',
      category: 'Vaccination',
      hindiText: 'वैक्सीनेशन सेंटर कैसे मिलेगा?',
    },
    {
      id: 'p3',
      query: 'Ayushman Bharat ke liye kya chahiye?',
      category: 'Health Scheme',
      hindiText: 'आयुष्मान भारत कार्ड कैसे यूज़ करें?',
    },
    {
      id: 'p4',
      query: 'Mujhe doctor se milna hai',
      category: 'Doctor Appointment',
      hindiText: 'मुझे डॉक्टर से मिलना है',
    },
    {
      id: 'p5',
      query: 'Mujhe health scheme ke baare mein batao',
      category: 'Govt Schemes',
      hindiText: 'सरकारी स्वास्थ्य योजनाएँ क्या हैं?',
    },
  ];

  return (
    <section className={cn('space-y-6 py-10', className)}>
      <div className="mx-auto max-w-xl space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Natural Voice Queries</span>
        </div>

        <h2 className="text-foreground text-xl font-extrabold tracking-tight md:text-2xl">
          You can simply say…
        </h2>
        <p className="text-muted-foreground text-xs font-medium">
          Click any example below to try Jana Seva voice assistant instantly
        </p>
      </div>

      {/* Interactive Quick Prompts Container */}
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 px-4">
        {prompts.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt?.(item)}
            type="button"
            className="group bg-card border-border/80 relative flex cursor-pointer items-center gap-3 rounded-full border px-5 py-3 text-left shadow-xs transition-all duration-200 hover:scale-103 hover:border-amber-500/50 hover:bg-amber-500/10 hover:shadow-md active:scale-95"
          >
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <MessageSquare className="size-3.5" />
            </div>

            <div className="flex flex-col">
              <span className="text-foreground text-xs font-bold transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-400">
                “{item.query}”
              </span>
              {item.hindiText && (
                <span className="text-muted-foreground text-[10px] font-medium">
                  {item.hindiText}
                </span>
              )}
            </div>

            <ArrowRight className="text-muted-foreground ml-1 size-3.5 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:text-amber-600" />
          </button>
        ))}
      </div>
    </section>
  );
}
