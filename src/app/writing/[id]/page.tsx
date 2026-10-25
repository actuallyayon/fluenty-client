'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  PenTool,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BarChart2,
  Award,
  BookOpen,
  RotateCcw,
  Info,
} from 'lucide-react';

interface WritingPrompt {
  id: string;
  taskType: 'task1' | 'task2';
  title: string;
  prompt: string;
  imageUrl?: string;
  createdAt: string;
}

interface EvaluationFeedback {
  estimatedBand: number;
  criteriaScores: {
    taskResponse: { band: number; commentsBn: string; commentsEn: string };
    coherenceCohesion: { band: number; commentsBn: string; commentsEn: string };
    lexicalResource: { band: number; commentsBn: string; commentsEn: string };
    grammaticalAccuracy: { band: number; commentsBn: string; commentsEn: string };
  };
  correctedSentences: Array<{
    original: string;
    corrected: string;
    explanationBn: string;
  }>;
  improvedVersion: string;
}

function WritingWorkbenchContent() {
  const params = useParams();
  const promptId = params?.id as string;

  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [prompt, setPrompt] = useState<WritingPrompt | null>(null);
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState<number | null>(null);

  // Timer
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && !feedback) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, feedback]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      const fetchPrompt = async () => {
        try {
          const res = await fetch(
            `/api/writing/prompts/${promptId}`,
            { credentials: 'include' }
          );
          const data = await res.json();
          if (data.success && data.prompt) {
            setPrompt(data.prompt);
          } else {
            setErrorMessage(data.message || 'Prompt not found');
          }
        } catch (err) {
          console.error('Failed to fetch prompt:', err);
          setErrorMessage('Failed to connect to backend server');
        } finally {
          setLoading(false);
        }
      };

      fetchPrompt();
    }
  }, [promptId, session, isPending, router]);

  const words = essay.trim().split(/\s+/).filter(Boolean);
  const wordCount = essay.trim() === '' ? 0 : words.length;
  const minRequired = prompt?.taskType === 'task1' ? 150 : 250;
  const targetTimeMinutes = prompt?.taskType === 'task1' ? 20 : 40;

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (wordCount < 40) {
      alert(
        lang === 'bn'
          ? 'মূল্যায়নের জন্য কমপক্ষে ৪০ শব্দ লিখুন।'
          : 'Please write at least 40 words for a meaningful evaluation.'
      );
      return;
    }

    setEvaluating(true);
    setTimerRunning(false);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/writing/prompts/${promptId}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ essay }),
        }
      );

      const data = await res.json();

      if (data.success && data.feedback) {
        setFeedback(data.feedback);
        if (data.xpEarned) {
          setXpEarned(data.xpEarned);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMessage(data.message || 'Evaluation failed. Please try again.');
        setTimerRunning(true);
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      setErrorMessage(err.message || 'Connection error. Please try again.');
      setTimerRunning(true);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-sm">{t('loading')}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-xl font-bold font-heading">
            {lang === 'bn' ? 'প্রম্পট পাওয়া যায়নি' : 'Prompt Not Found'}
          </h2>
          <Link href="/writing" className="btn-primary-teal text-sm py-2 px-4">
            {lang === 'bn' ? 'রাইটিং তালিকায় ফিরুন' : 'Back to Writing Directory'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/writing"
              className="p-2 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] hover:bg-[#FAF8F5] dark:hover:bg-[#1B292E] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#59656D] dark:text-[#8E9FA5]" />
            </Link>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F4C5C] dark:text-[#2DD4BF]">
                {prompt.taskType.toUpperCase()} {lang === 'bn' ? 'অনুশীলন' : 'Practice'}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6] line-clamp-1">
                {prompt.title}
              </h1>
            </div>
          </div>

          {/* Timer and Word Count Header Widgets */}
          {!feedback && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] text-xs font-semibold">
                <Clock className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                <span className="tabular-nums font-mono">{formatTimer(secondsElapsed)}</span>
                <span className="text-[#8E9FA5]">/ {targetTimeMinutes}m</span>
              </div>

              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                  wordCount >= minRequired
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-[#142024] border-[#EAE5DB] dark:border-[#23353B] text-[#59656D] dark:text-[#8E9FA5]'
                }`}
              >
                <PenTool className="w-4 h-4" />
                <span>
                  {wordCount} / {minRequired} {t('wordCount')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* ============================================================
            FEEDBACK VIEW (Shown after submission evaluation)
            ============================================================ */}
        {feedback ? (
          <div className="space-y-8 animate-fade-in">
            {/* Top Score Banner with Disclaimer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0F4C5C]/10 via-[#FAF8F5] dark:via-[#142024] to-[#D96B27]/10 border border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#0F4C5C] text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini AI Evaluation Complete</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F2E35] dark:text-[#F3EFE6]">
                    {lang === 'bn' ? 'আপনার রচনার মূল্যায়ন রিপোর্ট' : 'Your Essay Evaluation Report'}
                  </h2>
                </div>

                {/* Big Estimated Band Badge */}
                <div className="flex items-center gap-3 bg-white dark:bg-[#101A1E] px-6 py-4 rounded-2xl border border-[#EAE5DB] dark:border-[#23353B] shadow-sm">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#8E9FA5] block">
                      Overall Band
                    </span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#0F4C5C] dark:text-[#2DD4BF]">
                      {feedback.estimatedBand.toFixed(1)}
                    </span>
                  </div>
                  {xpEarned && (
                    <div className="pl-3 border-l border-[#EAE5DB] dark:border-[#23353B] text-center">
                      <span className="text-xs font-bold text-amber-500 block">+{xpEarned} XP</span>
                      <span className="text-[10px] text-[#8E9FA5]">Awarded</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Strict Disclaimer per Product Spec */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'bn'
                    ? 'ঘোষণা: এটি একটি AI-ভিত্তিক আনুমানিক ব্যান্ড স্কোর (Estimated Band)। এটি কোনো অফিসিয়াল IELTS ব্যান্ড স্কোর নয়।'
                    : 'Disclaimer: This score is an AI-generated estimate based on IELTS criteria and is not an official IELTS result.'}
                </span>
              </div>
            </div>

            {/* Four Official IELTS Criteria Cards */}
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                <span>{lang === 'bn' ? '৪টি মানদণ্ডে স্কোর ও বিশ্লেষণ' : 'Official Criteria Breakdown'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Task Response */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                      {t('taskResponse')}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                      Band {feedback.criteriaScores.taskResponse.band.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                    {feedback.criteriaScores.taskResponse.commentsBn}
                  </p>
                </div>

                {/* 2. Coherence and Cohesion */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                      {t('coherenceCohesion')}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                      Band {feedback.criteriaScores.coherenceCohesion.band.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                    {feedback.criteriaScores.coherenceCohesion.commentsBn}
                  </p>
                </div>

                {/* 3. Lexical Resource */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                      {t('lexicalResource')}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                      Band {feedback.criteriaScores.lexicalResource.band.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                    {feedback.criteriaScores.lexicalResource.commentsBn}
                  </p>
                </div>

                {/* 4. Grammatical Range and Accuracy */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                      {t('grammaticalAccuracy')}
                    </span>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                      Band {feedback.criteriaScores.grammaticalAccuracy.band.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#EDE8DF] leading-relaxed">
                    {feedback.criteriaScores.grammaticalAccuracy.commentsBn}
                  </p>
                </div>
              </div>
            </div>

            {/* Sentence-by-Sentence Corrections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#D96B27]" />
                  <span>
                    {t('sentenceCorrections')} ({feedback.correctedSentences.length})
                  </span>
                </h3>
              </div>

              {feedback.correctedSentences.length === 0 ? (
                <div className="p-6 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm">
                  {lang === 'bn'
                    ? 'চমৎকার! আপনার লেখায় কোনো গুরুতর ব্যাকরণগত বা বানান ভুল পাওয়া যায়নি।'
                    : 'Outstanding! No major grammatical or spelling errors were detected in your essay.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {feedback.correctedSentences.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-3 shadow-sm"
                    >
                      <div className="space-y-2 text-xs sm:text-sm">
                        {/* Original */}
                        <div className="p-3 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider block text-rose-500 mb-0.5">
                            Original:
                          </span>
                          <span className="line-through decoration-rose-400">{item.original}</span>
                        </div>

                        {/* Corrected */}
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider block text-emerald-600 dark:text-emerald-400 mb-0.5">
                            Corrected:
                          </span>
                          <span className="font-semibold">{item.corrected}</span>
                        </div>
                      </div>

                      {/* Bangla pedagogical explanation */}
                      <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs text-[#1A252C] dark:text-[#EDE8DF] space-y-1">
                        <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF] block text-[11px]">
                          {lang === 'bn' ? 'ভুলের কারণ ও নিয়ম:' : 'Grammar & Usage Rule:'}
                        </span>
                        <p className="leading-relaxed">{item.explanationBn}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Band 8.0+ Model Essay */}
            {feedback.improvedVersion && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-[#0F4C5C] dark:text-[#2DD4BF]">
                  <Award className="w-5 h-5" />
                  <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                    {t('band8Model')}
                  </h3>
                </div>

                <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed whitespace-pre-line font-serif">
                  {feedback.improvedVersion}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#EAE5DB] dark:border-[#23353B]">
              <button
                type="button"
                onClick={() => {
                  setFeedback(null);
                  setEssay('');
                  setSecondsElapsed(0);
                  setTimerRunning(true);
                }}
                className="btn-secondary text-xs sm:text-sm py-2.5 px-5 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'bn' ? 'নতুন করে লিখুন' : 'Write Again'}</span>
              </button>

              <Link
                href="/writing"
                className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 flex items-center gap-2"
              >
                <span>{lang === 'bn' ? 'অন্য প্রম্পট অনুশীলন করুন' : 'Practice Another Prompt'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* ============================================================
             ACTIVE WRITING EDITOR WORKBENCH
             ============================================================ */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Prompt Card (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                    {prompt.taskType.toUpperCase()}
                  </span>

                  <span className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                    {prompt.taskType === 'task1' ? 'Minimum 150 words' : 'Minimum 250 words'}
                  </span>
                </div>

                <h2 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] leading-snug">
                  {prompt.title}
                </h2>

                <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed whitespace-pre-line">
                  {prompt.prompt}
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                  <span className="font-bold block">
                    {lang === 'bn' ? 'পরামর্শ:' : 'Key Instructions:'}
                  </span>
                  <p>
                    {prompt.taskType === 'task1'
                      ? 'Select and report the main features, and make comparisons where relevant. Write at least 150 words.'
                      : 'Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Editor Area (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'আপনার রচনা' : 'Your Response'}</span>
                  </span>

                  <span
                    className={`font-semibold ${
                      wordCount >= minRequired
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-[#8E9FA5]'
                    }`}
                  >
                    {wordCount} words ({wordCount >= minRequired ? 'Target Met' : `${minRequired - wordCount} more needed`})
                  </span>
                </div>

                <textarea
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'এখানে আপনার ইংরেজি রচনা টাইপ করুন...'
                      : 'Type your English essay response here...'
                  }
                  rows={18}
                  disabled={evaluating}
                  className="w-full p-4 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-[#1A252C] dark:text-[#EDE8DF] placeholder-[#8E9FA5] focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] text-sm leading-relaxed resize-y font-serif disabled:opacity-50"
                />

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-[#8E9FA5]">
                    {lang === 'bn'
                      ? 'জেমিনাই AI ব্যাকরণ, শব্দচয়ন ও ব্যান্ড স্কোর নির্ণয় করবে'
                      : 'Gemini evaluates grammar, vocabulary, and estimated bands'}
                  </span>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={evaluating || wordCount < 30}
                    className="btn-primary-teal text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {evaluating ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        <span>{t('evaluatingEssay')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('submitForEvaluation')}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function WritingWorkbenchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1619]">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin" />
        </div>
      }
    >
      <WritingWorkbenchContent />
    </Suspense>
  );
}
