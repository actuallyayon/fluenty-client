'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  BookOpen,
  Headphones,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  Sparkles,
  Quote,
  ArrowRight,
  Filter,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

interface MistakeItem {
  id: string;
  practiceType: 'reading' | 'listening';
  userAnswer: string;
  correctAnswer: string;
  explanationBn?: string;
  explanationEn?: string;
  resolved: boolean;
  createdAt: string;
  question: {
    id: string;
    prompt: string;
    type: string;
    options?: string[];
    evidenceQuote?: string;
    contextTitle?: string;
    contextId?: string;
  };
}

function MistakeNotebookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const initialType = searchParams.get('practiceType') || 'all';
  const [filterType, setFilterType] = useState<string>(initialType);
  const [filterStatus, setFilterStatus] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [explanationLangs, setExplanationLangs] = useState<Record<string, 'bn' | 'en'>>({});

  const fetchMistakes = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType === 'reading' || filterType === 'listening') {
        params.set('practiceType', filterType);
      }
      if (filterStatus === 'unresolved') params.set('resolved', 'false');
      if (filterStatus === 'resolved') params.set('resolved', 'true');

      const res = await fetch(
        `/api/practice/mistakes?${params.toString()}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (data.success && data.mistakes) {
        setMistakes(data.mistakes);
      }
    } catch (err) {
      console.error('Failed to fetch mistakes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      fetchMistakes();
    }
  }, [session, isPending, router, filterType, filterStatus]);

  const handleToggleResolve = async (mistakeId: string) => {
    try {
      const res = await fetch(
        `/api/practice/mistakes/${mistakeId}/resolve`,
        { method: 'PATCH', credentials: 'include' }
      );
      const data = await res.json();
      if (data.success) {
        setMistakes((prev) =>
          prev.map((m) =>
            m.id === mistakeId ? { ...m, resolved: data.mistake.resolved } : m
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle mistake status:', err);
    }
  };

  const handleDeleteMistake = async (mistakeId: string) => {
    try {
      const res = await fetch(
        `/api/practice/mistakes/${mistakeId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await res.json();
      if (data.success) {
        setMistakes((prev) => prev.filter((m) => m.id !== mistakeId));
      }
    } catch (err) {
      console.error('Failed to delete mistake:', err);
    }
  };

  const toggleLanguage = (mistakeId: string) => {
    setExplanationLangs((prev) => ({
      ...prev,
      [mistakeId]: prev[mistakeId] === 'en' ? 'bn' : 'en',
    }));
  };

  const unresolvedCount = mistakes.filter((m) => !m.resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('navDashboard')}</span>
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-white dark:bg-[#142024] p-6 sm:p-8 rounded-3xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-800/40">
                <AlertCircle className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ব্যক্তিগত ভুল পর্যালোচনা' : 'Targeted Error Analysis'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E35] dark:text-[#F3EFE6]">
                {t('mistakesTitle')}
              </h1>
              <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-2xl leading-relaxed">
                {t('mistakesSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#F4EFE6] dark:bg-[#1C2D33] px-5 py-3.5 rounded-2xl border border-[#EAE5DB] dark:border-[#2F454C]">
              <div className="text-center">
                <span className="block font-heading font-bold text-lg text-rose-600 dark:text-rose-400">
                  {unresolvedCount}
                </span>
                <span className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'অমীমাংসিত ভুল' : 'Unresolved'}
                </span>
              </div>
              <div className="w-px h-8 bg-[#D4CDBC] dark:border-[#2F454C]" />
              <div className="text-center">
                <span className="block font-heading font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  {mistakes.length - unresolvedCount}
                </span>
                <span className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'সমাধানকৃত' : 'Resolved'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C]">
          {/* Module Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'মডিউল:' : 'Module:'}</span>
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: lang === 'bn' ? 'সবগুলো' : 'All' },
                { id: 'reading', label: lang === 'bn' ? 'রিডিং' : 'Reading' },
                { id: 'listening', label: lang === 'bn' ? 'লিসেনিং' : 'Listening' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    filterType === tab.id
                      ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0E1619]'
                      : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 self-end sm:self-auto">
            {[
              { id: 'all', label: lang === 'bn' ? 'সব অবস্থা' : 'All Status' },
              { id: 'unresolved', label: lang === 'bn' ? 'অমীমাংসিত' : 'Unresolved' },
              { id: 'resolved', label: lang === 'bn' ? 'সমাধানকৃত' : 'Resolved' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setFilterStatus(st.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === st.id
                    ? 'bg-[#EAE5DB] dark:bg-[#23353B] text-[#0F2E35] dark:text-[#F3EFE6] font-bold'
                    : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mistakes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] animate-pulse space-y-3"
                >
                  <div className="h-4 bg-[#EAE5DB] dark:bg-[#23353B] rounded w-1/4" />
                  <div className="h-5 bg-[#EAE5DB] dark:bg-[#23353B] rounded w-3/4" />
                  <div className="h-12 bg-[#EAE5DB] dark:bg-[#23353B] rounded" />
                </div>
              ))}
            </div>
          ) : mistakes.length === 0 ? (
            <div className="bg-white dark:bg-[#142024] p-12 rounded-3xl border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500" />
              <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'কোনো ভুল উত্তর পাওয়া যায়নি' : 'No Mistakes Found'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'অভিনন্দন! আপনার অনুশীলনে ভুল হলে তা স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত হবে।'
                  : 'Great job! Any incorrect answers in reading and listening practice are saved here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mistakes.map((m) => {
                const explLang = explanationLangs[m.id] || 'bn';
                const isResolved = m.resolved;

                return (
                  <div
                    key={m.id}
                    className={`bg-white dark:bg-[#142024] rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
                      isResolved
                        ? 'border-emerald-200 dark:border-emerald-900/40 opacity-75'
                        : 'border-[#D4CDBC] dark:border-[#2F454C]'
                    }`}
                  >
                    {/* Header: Module Badge, Context Title & Status Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            m.practiceType === 'reading'
                              ? 'bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]'
                              : 'bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C]'
                          }`}
                        >
                          {m.practiceType === 'reading' ? (
                            <BookOpen className="w-3 h-3" />
                          ) : (
                            <Headphones className="w-3 h-3" />
                          )}
                          <span className="capitalize">{m.practiceType}</span>
                        </span>

                        {m.question.contextTitle && (
                          <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] truncate max-w-xs">
                            {m.question.contextTitle}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Toggle Resolved Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleResolve(m.id)}
                          className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl border transition-colors ${
                            isResolved
                              ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                              : 'border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5] hover:text-emerald-600'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isResolved ? t('resolvedLabel') : t('markResolved')}</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteMistake(m.id)}
                          className="p-1.5 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5] hover:text-rose-600 hover:border-rose-300 transition-colors"
                          title="Remove from notebook"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Prompt */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#8E9FA5] tracking-wider">
                        Question:
                      </span>
                      <p className="font-heading font-semibold text-sm sm:text-base text-[#0F2E35] dark:text-[#F3EFE6] whitespace-pre-line leading-relaxed">
                        {m.question.prompt}
                      </p>
                    </div>

                    {/* Comparison Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                        <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-1">
                          {t('yourAnswer')}:
                        </span>
                        <span className="font-semibold text-rose-700 dark:text-rose-300">
                          {m.userAnswer}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                          {t('correctAnswer')}:
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                          {m.correctAnswer}
                        </span>
                      </div>
                    </div>

                    {/* Stored Explanation Card */}
                    {(m.explanationBn || m.explanationEn) && (
                      <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{t('explanationLabel')}</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleLanguage(m.id)}
                            className="text-[11px] font-bold text-[#D96B27] dark:text-[#FB923C] hover:underline"
                          >
                            {explLang === 'bn' ? 'In English' : 'বাংলায় দেখুন'}
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed">
                          {explLang === 'bn'
                            ? m.explanationBn || m.explanationEn
                            : m.explanationEn || m.explanationBn}
                        </p>
                      </div>
                    )}

                    {/* Evidence Quote if available */}
                    {m.question.evidenceQuote && (
                      <div className="p-3.5 rounded-xl bg-[#E7EFF1]/30 dark:bg-[#16363B]/20 border border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">
                          <Quote className="w-3.5 h-3.5" />
                          <span>{t('evidenceLabel')}</span>
                        </div>
                        <blockquote className="text-xs italic text-[#334155] dark:text-[#CBD5E1] pl-2 border-l-2 border-[#0F4C5C] dark:border-[#2DD4BF]">
                          &ldquo;{m.question.evidenceQuote}&rdquo;
                        </blockquote>
                      </div>
                    )}

                    {/* Action link to retry test */}
                    {m.question.contextId && (
                      <div className="pt-2 flex justify-end">
                        <Link
                          href={
                            m.practiceType === 'reading'
                              ? `/reading/${m.question.contextId}`
                              : `/listening/${m.question.contextId}`
                          }
                          className="text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
                        >
                          <span>{lang === 'bn' ? 'প্যাসেজটি পুনরায় অনুশীলন করুন' : 'Retry Full Test'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function MistakeNotebookPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1619]">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin" />
        </div>
      }
    >
      <MistakeNotebookContent />
    </Suspense>
  );
}
