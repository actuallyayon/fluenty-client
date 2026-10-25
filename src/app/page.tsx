'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { authClient } from '@/lib/auth-client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Marquee from '@/components/landing/Marquee';
import {
  Sparkles,
  BookOpen,
  Award,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  const { t, lang } = useLanguage();
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* SPLIT HERO SECTION WITH MINIMAL IELTS BANNER & AMBIENT GLOW */}
        <section className="relative py-12 sm:py-16 lg:py-22 overflow-hidden">
          {/* Subtle top ambient radial lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[480px] bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(15,76,92,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,rgba(45,212,191,0.07),transparent_70%)] pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Left-aligned editorial copy */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/15 text-[#0F4C5C] dark:text-[#2DD4BF] text-xs font-semibold border border-[#0F4C5C]/20 dark:border-[#2DD4BF]/25 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#D96B27]" />
                  <span>{lang === 'bn' ? 'বাংলা ভাষাভাষীদের জন্য বিশেষভাবে ডিজাইনকৃত' : 'Tailored specifically for Bangla Speakers'}</span>
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-[#0F2E35] dark:text-[#F3EFE6] leading-[1.18]">
                  {t('heroTitle')}
                </h1>

                <p className="text-base sm:text-lg text-[#59656D] dark:text-[#8E9FA5] leading-relaxed font-normal">
                  {t('heroDescription')}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link
                    href={session?.user ? '/dashboard' : '/signup'}
                    className="btn-primary-teal text-sm sm:text-base font-semibold"
                  >
                    {session?.user ? t('navDashboard') : t('heroPrimaryCta')}
                  </Link>

                  <a
                    href="#features"
                    className="btn-secondary-link text-sm font-semibold inline-flex items-center gap-1.5"
                  >
                    <span>{t('heroSecondaryCta')}</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>

                <div className="pt-4 border-t border-[#EAE5DB] dark:border-[#23353B] grid grid-cols-2 gap-4 text-xs text-[#59656D] dark:text-[#8E9FA5]">
                  <div>
                    <span className="font-semibold text-[#1A252C] dark:text-[#EDE8DF] block">
                      {lang === 'bn' ? 'সরাসরি প্রমাণ' : 'Direct citation'}
                    </span>
                    <span>
                      {lang === 'bn'
                        ? 'প্যাসেজের নির্দিষ্ট বাক্যের রেফারেন্স'
                        : 'Linked to the exact line in source text'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#1A252C] dark:text-[#EDE8DF] block">
                      {lang === 'bn' ? 'বাংলা বিশ্লেষণ' : 'Native analysis'}
                    </span>
                    <span>
                      {lang === 'bn'
                        ? 'ভুল অপশনের ট্র্যাপ ও কনফিউশন ব্যাখ্যা'
                        : 'Distractor trap rationale in Bangla'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Minimal IELTS Editorial Photo Banner from Unsplash */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#D4CDBC]/80 dark:border-[#2F454C] shadow-xl group bg-[#142024] ring-1 ring-black/5 dark:ring-white/10">
                  {/* Minimal High-Res IELTS Study Photo */}
                  <img
                    src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1200&auto=format&fit=crop"
                    alt="Minimal IELTS examination study desk and preparation"
                    className="w-full h-[340px] sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-102"
                    loading="eager"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                  {/* Minimal Bottom Glassmorphic Overlay Badge */}
                  <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 text-white">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase text-white border border-white/25">
                        <Sparkles className="w-3 h-3 text-[#FDE68A]" />
                        <span>IELTS Band 7.5+ Target</span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-white/95 leading-snug">
                        {lang === 'bn'
                          ? 'রিডিং, লিসেনিং, রাইটিং ও স্পিকিং — বাংলায় স্পষ্ট যুক্তিসহ প্রস্তুতি।'
                          : 'Bilingual diagnostic reasoning across Reading, Listening, Writing & Speaking.'}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/45 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-white/90">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>{lang === 'bn' ? '৪টি মডিউল অন্তর্ভুক্ত' : 'All 4 Modules'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUIET TOPIC MARQUEE STRIP */}
        <Marquee />

        {/* THREE REAL FEATURE PREVIEWS AS MOCK UI CARDS (NOT an icon grid) */}
        <section id="features" className="py-16 sm:py-24 border-b border-[#EAE5DB] dark:border-[#23353B]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Left-aligned section header */}
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
                {t('featuresSectionTag')}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {t('featuresSectionHeading')}
              </h2>
              <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                {t('featuresSectionSubhead')}
              </p>
            </div>

            {/* Three Mock UI Feature Cards */}
            <div className="space-y-10">
              {/* FEATURE 1: Bangla AI Explanations */}
              <div className="luxury-card bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] rounded-2xl sm:rounded-3xl p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start shadow-[0_4px_24px_-4px_rgba(15,76,92,0.06)]">
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] uppercase tracking-wider">
                    {t('feature1Badge')}
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('feature1Title')}
                  </h3>
                  <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                    {t('feature1Desc')}
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/signup"
                      className="btn-secondary-link text-xs font-semibold"
                    >
                      {lang === 'bn' ? 'রিডিং প্রশ্ন অনুশীলন করুন →' : 'Practice reading items →'}
                    </Link>
                  </div>
                </div>

                {/* Mock UI Card 1: Question Review Box */}
                <div className="lg:col-span-7 bg-[#FAF7F2] dark:bg-[#10191D] border border-[#EAE5DB] dark:border-[#23353B] rounded-2xl p-5 sm:p-6 space-y-3.5 text-xs shadow-inner">
                  <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-2.5 text-[11px] text-[#73828C] dark:text-[#8E9FA5]">
                    <span className="font-medium tracking-wide">Review: Reading Task 1</span>
                    <span className="text-[#C0392B] dark:text-[#F87171] font-semibold bg-[#FDEDEC] dark:bg-[#451210]/60 px-2 py-0.5 rounded-md">Answer mismatch</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="font-semibold text-[#1A252C] dark:text-[#EDE8DF]">
                      Q7: True, False, or Not Given?
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] text-[#59656D] dark:text-[#8E9FA5] shadow-2xs">
                      Statement: <em>&ldquo;The original maritime treaty prohibited all commercial vessels from entering the northern straits.&rdquo;</em>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-xl border border-[#C0392B]/40 dark:border-[#EF4444]/40 bg-[#FDEDEC]/60 dark:bg-[#451210]/40">
                        <span className="block text-[#922B21] dark:text-[#FCA5A5] font-semibold">আপনার উত্তর: TRUE</span>
                        <span className="text-[#73828C] dark:text-[#8E9FA5]">প্যাসেজে &lsquo;all vessels&rsquo; বলা নেই</span>
                      </div>
                      <div className="p-2.5 rounded-xl border border-[#0F4C5C]/40 dark:border-[#2DD4BF]/40 bg-[#E7EFF1]/70 dark:bg-[#0F3532]/40">
                        <span className="block text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold">সঠিক উত্তর: FALSE</span>
                        <span className="text-[#73828C] dark:text-[#8E9FA5]">শুধুমাত্র সামরিক জাহাজের জন্য নিষেধ ছিল</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white dark:bg-[#142024] rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] space-y-1.5 shadow-2xs">
                    <div className="text-[11px] font-bold text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F4C5C] dark:bg-[#2DD4BF]" />
                      <span>{lang === 'bn' ? 'বাংলায় যুক্তি ও বিশ্লেষণ' : 'Rationale in Bangla'}</span>
                    </div>
                    <p className="text-[12px] leading-relaxed text-[#1A252C] dark:text-[#EDE8DF]">
                      {lang === 'bn'
                        ? 'প্যাসেজের ৩ নম্বর লাইনে বলা হয়েছে: "commercial traffic maintained unhindered passage, whereas naval frigates were restricted." অর্থাৎ বাণিজ্যিক জাহাজ নিষিদ্ধ ছিল না। প্রশ্নে "all commercial vessels" বলায় এটি নিশ্চিতভাবেই FALSE।'
                        : 'The text specifies that commercial shipping continued unhindered while only naval vessels were barred. The universal qualifier "all commercial vessels" directly contradicts the passage, making the answer FALSE.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* FEATURE 2: Writing Feedback */}
              <div className="luxury-card bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] rounded-2xl sm:rounded-3xl p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start shadow-[0_4px_24px_-4px_rgba(15,76,92,0.06)]">
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] uppercase tracking-wider">
                    {t('feature2Badge')}
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('feature2Title')}
                  </h3>
                  <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                    {t('feature2Desc')}
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/signup"
                      className="btn-secondary-link text-xs font-semibold"
                    >
                      {lang === 'bn' ? 'রাইটিং মূল্যায়ন পরখ করুন →' : 'Explore writing criteria →'}
                    </Link>
                  </div>
                </div>

                {/* Mock UI Card 2: IELTS Writing Feedback Editor */}
                <div className="lg:col-span-7 bg-[#FAF7F2] dark:bg-[#10191D] border border-[#EAE5DB] dark:border-[#23353B] rounded-2xl p-5 sm:p-6 space-y-4 text-xs shadow-inner">
                  <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-2.5 text-[11px]">
                    <span className="text-[#59656D] dark:text-[#8E9FA5] font-medium tracking-wide">IELTS Task 2 Submission</span>
                    <span className="bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] px-2.5 py-0.5 rounded-md font-mono font-semibold">
                      Estimated Overall: Band 6.5
                    </span>
                  </div>

                  {/* Submission sentence with inline strike-through correction */}
                  <div className="p-3.5 bg-white dark:bg-[#142024] rounded-xl border border-[#EAE5DB] dark:border-[#23353B] space-y-2 shadow-2xs">
                    <div className="text-[11px] font-bold text-[#73828C] dark:text-[#8E9FA5] uppercase tracking-wider">
                      Sentence Correction (বাক্য সংশোধন)
                    </div>
                    <p className="text-xs sm:text-[13px] leading-relaxed text-[#1A252C] dark:text-[#EDE8DF]">
                      In recent decades,{' '}
                      <del className="line-through text-[#C0392B] dark:text-[#F87171] bg-[#FDEDEC] dark:bg-[#451210]/60 px-1 rounded">
                        the number of vehicles are increasing
                      </del>{' '}
                      <ins className="no-underline text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold bg-[#E7EFF1] dark:bg-[#0F3532]/60 px-1 rounded">
                        the number of vehicles has increased
                      </ins>{' '}
                      rapidly, which has a destructive impact{' '}
                      <del className="line-through text-[#C0392B] dark:text-[#F87171] bg-[#FDEDEC] dark:bg-[#451210]/60 px-1 rounded">
                        in the environment
                      </del>{' '}
                      <ins className="no-underline text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold bg-[#E7EFF1] dark:bg-[#0F3532]/60 px-1 rounded">
                        on the environment
                      </ins>
                      .
                    </p>
                  </div>

                  {/* Criteria Bands Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                    <div className="p-2.5 bg-white dark:bg-[#142024] rounded-xl border border-[#EAE5DB] dark:border-[#23353B] shadow-2xs">
                      <span className="block text-[#73828C] dark:text-[#8E9FA5]">Task Response</span>
                      <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">6.5</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-[#142024] rounded-xl border border-[#EAE5DB] dark:border-[#23353B] shadow-2xs">
                      <span className="block text-[#73828C] dark:text-[#8E9FA5]">Coherence</span>
                      <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">6.5</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-[#142024] rounded-xl border border-[#EAE5DB] dark:border-[#23353B] shadow-2xs">
                      <span className="block text-[#73828C] dark:text-[#8E9FA5]">Lexical</span>
                      <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">6.0</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-[#142024] rounded-xl border border-[#EAE5DB] dark:border-[#23353B] shadow-2xs">
                      <span className="block text-[#73828C] dark:text-[#8E9FA5]">Grammar</span>
                      <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">6.0</span>
                    </div>
                  </div>

                  {/* Bangla Feedback Note */}
                  <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#1A2620]/40 rounded-xl border-l-3 border-[#D96B27] dark:border-[#FB923C] text-[11px] text-[#1A252C] dark:text-[#EDE8DF] space-y-1">
                    <span className="font-bold text-[#D96B27] dark:text-[#FB923C] block">
                      বাঙালি শিক্ষার্থীদের সাধারণ ভুল পর্যবেক্ষণ:
                    </span>
                    <p>
                      ১. &ldquo;The number of&rdquo; এর সাথে singular verb (&lsquo;has increased&rsquo;) বসে, কিন্তু &ldquo;A number of&rdquo; এর সাথে plural verb বসে।
                      <br />
                      ২. &ldquo;Impact&rdquo; শব্দের পর প্রিপজিশন হিসেবে &lsquo;in&rsquo; না হয়ে &lsquo;on&rsquo; (&ldquo;impact on something&rdquo;) ব্যবহার করতে হবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* FEATURE 3: Mistake Notebook */}
              <div className="luxury-card bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] rounded-2xl sm:rounded-3xl p-6 sm:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start shadow-[0_4px_24px_-4px_rgba(15,76,92,0.06)]">
                <div className="lg:col-span-5 space-y-3">
                  <span className="text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] uppercase tracking-wider">
                    {t('feature3Badge')}
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('feature3Title')}
                  </h3>
                  <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                    {t('feature3Desc')}
                  </p>
                  <div className="pt-2">
                    <Link
                      href="/signup"
                      className="btn-secondary-link text-xs font-semibold"
                    >
                      {lang === 'bn' ? 'নোটবুক ব্যবহার শুরু করুন →' : 'Organize your mistakes →'}
                    </Link>
                  </div>
                </div>

                {/* Mock UI Card 3: Mistake Ledger Interface */}
                <div className="lg:col-span-7 bg-[#FAF7F2] dark:bg-[#10191D] border border-[#EAE5DB] dark:border-[#23353B] rounded-2xl p-5 sm:p-6 space-y-3.5 text-xs shadow-inner">
                  <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-2.5">
                    <span className="font-semibold text-[#1A252C] dark:text-[#EDE8DF]">
                      {lang === 'bn' ? 'সংরক্ষিত ভুল তালিকার নমুনা' : 'Mistake Notebook Ledger'}
                    </span>
                    <span className="text-[11px] text-[#73828C] dark:text-[#8E9FA5]">
                      {lang === 'bn' ? '৩টি আইটেম পেন্ডিং' : '3 items flagged for review'}
                    </span>
                  </div>

                  {/* Filter chips */}
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0F4C5C] dark:bg-[#248277] text-white font-medium">
                      All (12)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5]">
                      Prepositions (4)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5]">
                      Subject-Verb (3)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5]">
                      Headings (5)
                    </span>
                  </div>

                  {/* List of mistake items */}
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between gap-3 shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold">
                            Preposition
                          </span>
                          <span className="text-[11px] text-[#73828C] dark:text-[#8E9FA5]">Yesterday</span>
                        </div>
                        <div className="text-xs">
                          <span className="line-through text-[#C0392B] dark:text-[#F87171]">married with</span>{' '}
                          <span className="text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold">married to</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline cursor-pointer font-medium">
                        {lang === 'bn' ? 'রিভিউ' : 'Review'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between gap-3 shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold">
                            Subject-Verb
                          </span>
                          <span className="text-[11px] text-[#73828C] dark:text-[#8E9FA5]">2 days ago</span>
                        </div>
                        <div className="text-xs">
                          <span className="line-through text-[#C0392B] dark:text-[#F87171]">each of the students were</span>{' '}
                          <span className="text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold">each of the students was</span>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline cursor-pointer font-medium">
                        {lang === 'bn' ? 'রিভিউ' : 'Review'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between gap-3 shadow-2xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] font-semibold">
                            Reading Matching
                          </span>
                          <span className="text-[11px] text-[#73828C] dark:text-[#8E9FA5]">3 days ago</span>
                        </div>
                        <div className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                          Section 3: Heading V confused with Heading VII
                        </div>
                      </div>
                      <span className="text-[11px] text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline cursor-pointer font-medium">
                        {lang === 'bn' ? 'রিভিউ' : 'Review'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LUXURY ENCLOSED BOTTOM CTA CARD */}
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0F4C5C] to-[#082B33] dark:from-[#143238] dark:to-[#0B1A1E] text-white p-8 sm:p-14 text-center space-y-6 shadow-2xl overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-md border border-white/15">
                  <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>{lang === 'bn' ? 'আজই প্রস্তুতি শুরু করুন' : 'Begin Your IELTS Journey Today'}</span>
                </span>
                <h2 className="font-heading text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  {lang === 'bn'
                    ? 'আইইএলটিএস প্রস্তুতি শুরু করুন আপনার সুবিধাজনক সময়ে'
                    : 'Begin targeted IELTS practice on your own schedule'}
                </h2>
                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-normal">
                  {lang === 'bn'
                    ? 'অ্যাকাউন্ট খুলে রিডিং ও ব্যাকরণ লেসনগুলো বিনামূল্যে অনুশীলন করে দেখতে পারেন।'
                    : 'Create an account to test sample reading passages and grammar diagnosis lessons for free.'}
                </p>
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href={session?.user ? '/dashboard' : '/signup'}
                    className="btn-primary-teal text-sm sm:text-base font-semibold px-8 py-3.5 bg-white text-[#0F4C5C] hover:bg-[#FBF9F5] border-white shadow-xl cursor-pointer"
                  >
                    {session?.user ? t('navDashboard') : t('heroPrimaryCta')}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    <span>{lang === 'bn' ? 'প্ল্যান ও প্রাইসিং দেখুন' : 'Compare plans and pricing'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
