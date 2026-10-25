'use client';

import React from 'react';
import { useLanguage } from '@/lib/language-context';

export interface MarqueeItem {
  id: string;
  en: string;
  bn: string;
  isAi?: boolean;
}

export const MARQUEE_FEATURES: MarqueeItem[] = [
  {
    id: 'ai-explanations',
    en: 'Bangla AI explanations with text evidence',
    bn: 'প্যাসেজের প্রমাণসহ বাংলায় AI ব্যাখ্যা',
    isAi: true,
  },
  {
    id: 'grammar-pitfalls',
    en: 'Common Bangla speaker grammar pitfalls',
    bn: 'বাঙালিদের সাধারণ ব্যাকরণ ভুল ও সংশোধন',
    isAi: false,
  },
  {
    id: 'ai-writing',
    en: 'IELTS writing criteria evaluation & sentence edits',
    bn: 'AI রাইটিং মূল্যায়ন ও বাক্যভিত্তিক সংশোধন',
    isAi: true,
  },
  {
    id: 'mistake-notebook',
    en: 'Automated category mistake notebook',
    bn: 'স্বয়ংক্রিয় ক্যাটাগরি মিস্টেক নোটবুক',
    isAi: false,
  },
  {
    id: 'ai-tutor',
    en: '24/7 AI tutor chat in Bangla',
    bn: 'বাংলায় সার্বক্ষণিক AI টিউটর চ্যাট',
    isAi: true,
  },
  {
    id: 'reading-practice',
    en: 'Timed academic reading tests & instant scoring',
    bn: 'টাইমড রিডিং টেস্ট ও তাৎক্ষণিক স্কোর',
    isAi: false,
  },
  {
    id: 'ai-speaking',
    en: 'AI speaking examiner interview practice',
    bn: 'AI স্পিকিং এক্সামিনার ইন্টারভিউ অনুশীলন',
    isAi: true,
  },
  {
    id: 'vocab-repetition',
    en: 'SM-2 spaced repetition vocabulary flashcards',
    bn: 'স্পেসড রিপিটেশন শব্দভাণ্ডার ফ্ল্যাশকার্ড',
    isAi: false,
  },
  {
    id: 'ai-study-plan',
    en: 'Personalized weekly AI study plan',
    bn: 'ব্যক্তিগত দুর্বলতাভিত্তিক AI স্টাডি প্ল্যান',
    isAi: true,
  },
  {
    id: 'listening-transcripts',
    en: 'Listening practice with full post-test transcripts',
    bn: 'লিসেনিং প্র্যাকটিস ও সম্পূর্ণ ট্রান্সক্রিপ্ট',
    isAi: false,
  },
  {
    id: 'question-types',
    en: 'True/False/Not Given & matching headings practice',
    bn: 'হেডিং ম্যাচিং, T/F/NG ও ফিল ইন দ্য ব্ল্যাঙ্কস',
    isAi: false,
  },
];

export default function Marquee() {
  const { lang } = useLanguage();

  const renderItem = (item: MarqueeItem, index: number, isDuplicate = false) => {
    return (
      <div
        key={`${item.id}-${index}-${isDuplicate ? 'dup' : 'orig'}`}
        className="inline-flex items-center gap-2 shrink-0 whitespace-nowrap text-[14px] sm:text-[15px] select-none"
      >
        {item.isAi && (
          <span
            className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#FAF2EB] dark:bg-[#2C180E] text-[#D96B27] dark:text-[#FB923C] border border-[#D96B27]/40 dark:border-[#FB923C]/40 shrink-0 select-none shadow-2xs"
            title="AI Feature"
          >
            AI
          </span>
        )}

        {lang === 'bn' ? (
          <span
            className={`tracking-normal ${
              item.isAi
                ? 'font-semibold text-[#0F5C58] dark:text-[#2DD4BF]'
                : 'font-medium text-[#1A252C] dark:text-[#EDE8DF]'
            }`}
          >
            {item.bn}
          </span>
        ) : (
          <span
            className={`tracking-tight ${
              item.isAi
                ? 'font-semibold text-[#0F4C5C] dark:text-[#2DD4BF]'
                : 'font-medium text-[#14221F] dark:text-[#EDE8DF]'
            }`}
          >
            {item.en}
          </span>
        )}

        {/* Small orange dot separating items */}
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#E8742C] dark:bg-[#FB923C] ml-3 sm:ml-5 shrink-0 opacity-80"
          aria-hidden="true"
        />
      </div>
    );
  };

  return (
    <div
      className="marquee-container w-full bg-[#FAF7F2] dark:bg-[#10191D] border-y border-[#E6E0D6] dark:border-[#23353B] overflow-hidden min-h-[56px] sm:min-h-[64px] flex items-center relative transition-colors"
      tabIndex={0}
      role="region"
      aria-label="Features and AI capabilities in Fluenty"
    >
      {/* Screen-reader accessible alternative */}
      <ul className="sr-only">
        {MARQUEE_FEATURES.map((feature) => (
          <li key={`sr-${feature.id}`}>
            {feature.isAi ? '[AI] ' : ''}
            {lang === 'bn' ? feature.bn : feature.en}
          </li>
        ))}
      </ul>

      {/* Visual Scrolling Track with gradient edge fade mask */}
      <div className="w-full overflow-hidden marquee-mask py-3.5 sm:py-4">
        <div className="animate-marquee-track items-center">
          {/* Primary loop track */}
          <div className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0">
            {MARQUEE_FEATURES.map((item, idx) => renderItem(item, idx, false))}
          </div>

          {/* Secondary seamless loop track (marked aria-hidden) */}
          <div
            className="flex items-center gap-4 sm:gap-6 pr-4 sm:pr-6 shrink-0"
            aria-hidden="true"
          >
            {MARQUEE_FEATURES.map((item, idx) => renderItem(item, idx, true))}
          </div>
        </div>
      </div>
    </div>
  );
}
