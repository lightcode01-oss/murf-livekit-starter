'use client';

import React from 'react';
import {
  Hospital,
  Pill,
  Syringe,
  Stethoscope,
  FileCheck,
  UserCheck,
  ShieldAlert,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export interface Category {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  promptSample: string;
  colorClass: string;
}

interface HealthCategoriesProps {
  onSelectCategory?: (category: Category) => void;
  className?: string;
}

export function HealthCategories({ onSelectCategory, className }: HealthCategoriesProps) {
  const categories: Category[] = [
    {
      id: 'hospital',
      icon: <Hospital className="size-6 text-amber-600 dark:text-amber-400" />,
      title: 'Find a Hospital',
      description: 'Find nearby government hospitals, PHCs, & CHCs with emergency directions.',
      badge: 'Nearby',
      promptSample: 'Mere paas government hospital kahan hai?',
      colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:border-amber-500/50',
    },
    {
      id: 'medicines',
      icon: <Pill className="size-6 text-emerald-600 dark:text-emerald-400" />,
      title: 'Medicines & Pharmacy',
      description: 'Locate affordable Jan Aushadhi Kendras and check medicine availability.',
      badge: 'Jan Aushadhi',
      promptSample: 'Generic medicine shop kahan milegi?',
      colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:border-emerald-500/50',
    },
    {
      id: 'vaccination',
      icon: <Syringe className="size-6 text-sky-600 dark:text-sky-400" />,
      title: 'Vaccination',
      description: 'Child immunization schedules, routine vaccines, & nearest vaccination booth.',
      badge: 'Immunization',
      promptSample: 'Bachche ke vaccination ke baare mein batao',
      colorClass: 'bg-sky-500/10 text-sky-600 border-sky-500/20 hover:border-sky-500/50',
    },
    {
      id: 'triage',
      icon: <Stethoscope className="size-6 text-teal-600 dark:text-teal-400" />,
      title: 'Health Information',
      description: 'Understand symptoms, fever care, and red flag warnings for emergency visits.',
      badge: 'Symptom Triage',
      promptSample: 'Mere bachche ko bukhar hai, kya karna chahiye?',
      colorClass: 'bg-teal-500/10 text-teal-600 border-teal-500/20 hover:border-teal-500/50',
    },
    {
      id: 'schemes',
      icon: <FileCheck className="size-6 text-indigo-600 dark:text-indigo-400" />,
      title: 'Government Schemes',
      description: 'Eligibility & benefits for Ayushman Bharat (PM-JAY), JSY, PMMVY & POSHAN.',
      badge: 'PM-JAY',
      promptSample: 'Ayushman Bharat card kaise use kar sakte hain?',
      colorClass: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:border-indigo-500/50',
    },
    {
      id: 'doctors',
      icon: <UserCheck className="size-6 text-rose-600 dark:text-rose-400" />,
      title: 'Find Healthcare Professionals',
      description: 'Find PHC medical officers, ASHA workers, & specialist doctor clinic hours.',
      badge: 'PHC / CHC',
      promptSample: 'Mujhe doctor se appointment kaise milega?',
      colorClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:border-rose-500/50',
    },
    {
      id: 'emergency',
      icon: <ShieldAlert className="size-6 text-red-600 dark:text-red-400" />,
      title: 'Emergency Guidance',
      description: 'Direct guidance for 108 Ambulance service & critical emergency triage.',
      badge: '108 Helpline',
      promptSample: 'Emergency ambulance number 108 kaise call karein?',
      colorClass: 'bg-red-500/10 text-red-600 border-red-500/20 hover:border-red-500/50',
    },
    {
      id: 'documents',
      icon: <FileText className="size-6 text-violet-600 dark:text-violet-400" />,
      title: 'Health Documents',
      description: 'Manage ABHA health cards, ASHA worker visit logs, and immunization charts.',
      badge: 'ABHA Card',
      promptSample: 'ABHA card ke kya fayde hain?',
      colorClass: 'bg-violet-500/10 text-violet-600 border-violet-500/20 hover:border-violet-500/50',
    },
  ];

  return (
    <section id="categories" className={cn('py-12 space-y-8', className)}>
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
          What can <span className="text-amber-600 dark:text-amber-500">Jana Seva</span> help you access?
        </h2>
        <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
          Select a healthcare category or speak your query directly in your local language.
        </p>
      </div>

      {/* Grid of 8 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory?.(cat)}
            className="group relative bg-card/90 border-border/80 rounded-2xl p-5 border shadow-xs hover:shadow-lg hover:border-amber-500/40 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:-translate-y-1 backdrop-blur-xs"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={cn('size-11 rounded-xl flex items-center justify-center', cat.colorClass)}>
                  {cat.icon}
                </div>
                {cat.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border/60">
                    {cat.badge}
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center justify-between">
                {cat.title}
                <ChevronRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600" />
              </h3>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {cat.description}
              </p>
            </div>

            <div className="pt-2 border-t border-border/40 text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
              <span>Ask via voice</span>
              <ChevronRight className="size-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
