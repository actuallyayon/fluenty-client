'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  XCircle,
  Sparkles,
  Award,
  BookOpen,
  Check,
} from 'lucide-react';

interface CommonMistake {
  incorrect: string;
  correct: string;
  explanationBn: string;
}

interface LessonDetail {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  subCategory?: string;
  contentBn: string;
  contentEn: string;
  commonMistakesBn: CommonMistake[];
  isBookmarked: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function GrammarLessonContent() {
  const params = useParams();
  const lessonId = params?.id as string;

  const { lang } = useLanguage();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayLang, setDisplayLang] = useState<'bn' | 'en'>('bn');

  // Completion state
  const [isCompleted, setIsCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/learning/grammar/lessons/${lessonId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.lesson) {
        setLesson(data.lesson);
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!lesson) return;
    try {
      const res = await fetch(`${API_BASE}/api/learning/bookmarks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemType: 'lesson',
          itemId: lesson.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLesson((prev) => (prev ? { ...prev, isBookmarked: data.bookmarked } : null));
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleCompleteLesson = async () => {
    if (isCompleted || !lesson) return;
    try {
      const res = await fetch(`${API_BASE}/api/learning/grammar/lessons/${lesson.id}/complete`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setIsCompleted(true);
        setXpEarned(data.xpEarned || 25);
      }
    } catch (err) {
      console.error('Complete lesson failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
          <Link
            href="/grammar"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সব লেসনে ফিরে যান' : 'Back to Lessons'}</span>
          </Link>

          {lesson && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleBookmark}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  lesson.isBookmarked
                    ? 'border-[#D96B27] text-[#D96B27] dark:border-[#FB923C] dark:text-[#FB923C] bg-[#FAF2EB] dark:bg-[#351B0F]'
                    : 'border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5] hover:border-[#D96B27]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${lesson.isBookmarked ? 'fill-current' : ''}`} />
                <span>{lesson.isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center p-8">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-xs mt-3">
              Loading lesson...
            </p>
          </div>
        ) : !lesson ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-2">
            <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
              Lesson not found
            </h3>
            <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
              The requested lesson could not be loaded.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Lesson Title Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] text-[10px] font-bold uppercase tracking-wider">
                  {lesson.subCategory || lesson.category}
                </span>
                <span className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                  IELTS Grammar Masterclass
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
                {lesson.title}
              </h1>
              <h2 className="text-base font-medium text-[#0F4C5C] dark:text-[#2DD4BF]">
                {lesson.titleBn}
              </h2>
            </div>

            {/* Language Switch for Explanations */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4EFE6] dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-xs">
              <span className="font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                Explanation Language:
              </span>
              <div className="inline-flex items-center gap-1 bg-white dark:bg-[#1C2D33] p-1 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C]">
                <button
                  type="button"
                  onClick={() => setDisplayLang('bn')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    displayLang === 'bn'
                      ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                      : 'text-[#59656D] dark:text-[#8E9FA5]'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayLang('en')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    displayLang === 'en'
                      ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429]'
                      : 'text-[#59656D] dark:text-[#8E9FA5]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Core Explanation Body */}
            <div className="bg-white dark:bg-[#142024] p-6 sm:p-8 rounded-3xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-2xs space-y-4">
              <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                {displayLang === 'bn' ? 'মূল ব্যাকরণগত তত্ত্ব ও কারণ' : 'Grammatical Rationale'}
              </h3>
              <p className="text-sm text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed whitespace-pre-line">
                {displayLang === 'bn' ? lesson.contentBn : lesson.contentEn}
              </p>
            </div>

            {/* COMMON MISTAKES OF BANGLA SPEAKERS (KEY REQUIREMENT) */}
            {lesson.commonMistakesBn && lesson.commonMistakesBn.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D96B27]" />
                  <h3 className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                    {lang === 'bn'
                      ? 'বাঙালি শিক্ষার্থীদের যেসব জায়গায় সচরাচর ভুল হয়'
                      : 'Common Mistakes Made by Bangla Speakers'}
                  </h3>
                </div>

                <div className="space-y-4">
                  {lesson.commonMistakesBn.map((m, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-[#142024] rounded-2xl p-6 border-2 border-[#D4CDBC] dark:border-[#2F454C] shadow-2xs space-y-4"
                    >
                      {/* Compare Box: Incorrect vs Correct */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span>Incorrect Usage</span>
                          </div>
                          <div className="font-medium text-[#1A252C] dark:text-[#EDE8DF] line-through">
                            "{m.incorrect}"
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Correct Form</span>
                          </div>
                          <div className="font-semibold text-[#0F4C5C] dark:text-[#2DD4BF]">
                            "{m.correct}"
                          </div>
                        </div>
                      </div>

                      {/* Explanation in Bangla */}
                      <div className="p-4 rounded-xl bg-[#FAF2EB] dark:bg-[#2A1D13] border border-[#E8D0BF] dark:border-[#52331C] text-xs leading-relaxed text-[#8C3A27] dark:text-[#FB923C]">
                        <span className="font-bold">ভুলের কারণ ও নিয়ম:</span> {m.explanationBn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Completion Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#F4EFE6] dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-4">
              {isCompleted ? (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-xl bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                    {lang === 'bn' ? 'লেসনটি সম্পন্ন হয়েছে!' : 'Lesson Completed!'}
                  </h3>
                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                    {lang === 'bn'
                      ? `অভিনন্দন! আপনার প্রোফাইলে +${xpEarned || 25} XP যুক্ত হয়েছে এবং স্ট্রিক বৃদ্ধি পেয়েছে।`
                      : `Great work! +${xpEarned || 25} XP has been credited to your profile.`}
                  </p>
                  <div className="pt-2">
                    <Link href="/grammar" className="btn-secondary text-xs px-5 py-2">
                      {lang === 'bn' ? 'পরবর্তী লেসন দেখুন' : 'Explore Next Lesson'}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <h3 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                    {lang === 'bn' ? 'পড়া শেষ করেছেন?' : 'Finished studying this lesson?'}
                  </h3>
                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] max-w-md mx-auto">
                    {lang === 'bn'
                      ? 'সম্পন্ন বাটনে ক্লিক করে +২৫ XP অর্জন করুন এবং আপনার দৈনিক স্ট্রিক রক্ষা করুন।'
                      : 'Click below to mark this topic complete and claim +25 XP toward your daily streak.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleCompleteLesson}
                    className="btn-primary-teal text-xs px-6 py-2.5 inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-[#FDE68A]" />
                    <span>{lang === 'bn' ? 'সম্পন্ন হয়েছে ও +২৫ XP নিন' : 'Mark as Complete & Claim +25 XP'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function GrammarLessonReaderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] items-center justify-center p-8">
          <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 border-t-transparent" />
        </div>
      }
    >
      <GrammarLessonContent />
    </Suspense>
  );
}
