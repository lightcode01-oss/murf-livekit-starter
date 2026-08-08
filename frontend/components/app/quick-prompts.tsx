'use client';

import React from 'react';
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
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
    <section className={cn('py-10 space-y-6', className)}>
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>Natural Voice Queries</span>
        </div>

        <h2 className="text-xl md:text-2xl font-extrabold text-foreground tracking-tight">
          You can simply say…
        </h2>
        <p className="text-xs text-muted-foreground font-medium">
          Click any example below to try Jana Seva voice assistant instantly
        </p>
      </div>

      {/* Interactive Quick Prompts Container */}
      <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto px-4">
        {prompts.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectPrompt?.(item)}
            type="button"
            className="group relative bg-card hover:bg-amber-500/10 border-border/80 hover:border-amber-500/50 rounded-full px-5 py-3 border shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-3 text-left hover:scale-103 active:scale-95"
          >
            <div className="size-7 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <MessageSquare className="size-3.5" />
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                “{item.query}”
              </span>
              {item.hindiText && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  {item.hindiText}
                </span>
              )}
            </div>

            <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </button>
        ))}
      </div>
    </section>
  );
}
