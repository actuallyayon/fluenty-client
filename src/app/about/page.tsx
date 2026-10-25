'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import { Target, Users, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
            {t('navAbout')}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {lang === 'bn' ? 'বাংলাভাষীদের জন্য IELTS প্রস্তুতিকে সহজ করা' : 'Empowering Bangla Speakers for IELTS Success'}
          </h1>
          <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] max-w-2xl mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'আমরা বিশ্বাস করি কোনো ভাষা শেখার সবচেয়ে সুন্দর মাধ্যম হলো নিজের মাতৃভাষার সঠিক প্রয়োগের মাধ্যমে তার পার্থক্যগুলো বোঝা।'
              : 'Fluenty bridges the linguistic nuances between Bangla and English to help learners comfortably achieve Band 7+.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'লক্ষ্যভিত্তিক শিক্ষা' : 'Targeted Learning'}
            </h3>
            <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs leading-relaxed">
              {lang === 'bn'
                ? 'শুধু অন্ধের মতো প্র্যাকটিস নয়, প্রতিটি ভুলের পেছনের যুক্তি বাংলায় উপলব্ধি করা।'
                : 'Focusing on where candidates lose marks and correcting root conceptual issues in Bangla.'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'শিক্ষার্থীবান্ধব ইন্টারফেস' : 'Focused Experience'}
            </h3>
            <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs leading-relaxed">
              {lang === 'bn'
                ? 'ডেইলি স্ট্রিক, পয়েন্ট এবং লেভেলের মাধ্যমে নিয়মিত পড়ার অভ্যাস গড়ে তোলা।'
                : 'Consistent practice habits with streaks, XP, and focused error diagnostics.'}
            </p>
          </div>

          <div className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs space-y-3 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'উন্নত AI সাপোর্ট' : 'Next-Gen AI Analysis'}
            </h3>
            <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs leading-relaxed">
              {lang === 'bn'
                ? 'Gemini মডেল ব্যবহার করে নির্ভুল ব্যাকরণ এবং রাইটিংয়ের এস্টিমেটেড ব্যান্ড ফিডব্যাক।'
                : 'Leveraging modern Google Gemini models for deep, localized writing and reading analysis.'}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
