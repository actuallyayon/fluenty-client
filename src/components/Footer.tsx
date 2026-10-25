'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function Footer() {
  const { t, lang } = useLanguage();

  return (
    <footer className="mt-auto border-t border-[#EAE5DB] dark:border-[#23353B] bg-[#F4EFE6]/50 dark:bg-[#0D1518] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-xl font-bold tracking-tight text-[#0F4C5C] dark:text-[#2DD4BF]">
                Fluenty
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D96B27]" />
            </div>
            <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-sm leading-relaxed">
              {lang === 'bn'
                ? 'বাংলাভাষীদের জন্য সুনির্দিষ্ট IELTS প্রস্তুতি। রিডিং, লিসেনিং, রাইটিং ও ব্যাকরণ অনুশীলনে প্রতিটি ভুলের পেছনের যুক্তি ও প্রমাণ বিশ্লেষণ।'
                : 'Targeted IELTS preparation platform for Bangla speakers. Evidence-based answer explanations and grammar error analysis.'}
            </p>
            <div className="text-xs text-[#8C979E] dark:text-[#64748B] pt-2">
              © 2026 Fluenty. All rights reserved.
            </div>
          </div>

          {/* Practice Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1A252C] dark:text-[#EDE8DF] uppercase tracking-wider">
              {lang === 'bn' ? 'মডিউলসমূহ' : 'Modules'}
            </h4>
            <ul className="space-y-2 text-sm text-[#59656D] dark:text-[#8E9FA5]">
              <li>
                <Link href="/dashboard" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {lang === 'bn' ? 'ভোকাবুলারি' : 'Vocabulary'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {lang === 'bn' ? 'বাঙালিদের সাধারণ ব্যাকরণ ভুল' : 'Common Grammar Pitfalls'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {lang === 'bn' ? 'রিডিং টেস্ট ও ব্যাখ্যা' : 'Reading Practice & Analysis'}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {lang === 'bn' ? 'লিসেনিং প্র্যাকটিস' : 'Listening Practice'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1A252C] dark:text-[#EDE8DF] uppercase tracking-wider">
              {lang === 'bn' ? 'প্রয়োজনীয় লিঙ্ক' : 'Platform'}
            </h4>
            <ul className="space-y-2 text-sm text-[#59656D] dark:text-[#8E9FA5]">
              <li>
                <Link href="/pricing" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {t('navPricing')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {t('navAbout')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {t('navFAQ')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors">
                  {t('navContact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
