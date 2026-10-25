'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  PenTool,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  History,
  AlertCircle,
  BarChart2,
  Award,
} from 'lucide-react';

interface WritingPrompt {
  id: string;
  taskType: 'task1' | 'task2';
  title: string;
  prompt: string;
  imageUrl?: string;
  createdAt: string;
}

interface PastSubmission {
  id: string;
  promptId: string;
  promptTitle: string;
  taskType: 'task1' | 'task2';
  wordCount: number;
  estimatedBand: number;
  createdAt: string;
}

export default function WritingDirectoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [submissions, setSubmissions] = useState<PastSubmission[]>([]);
  const [selectedTask, setSelectedTask] = useState<'all' | 'task1' | 'task2'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      const fetchData = async () => {
        try {
          const [promptsRes, submissionsRes] = await Promise.all([
            fetch('/api/writing/prompts', { credentials: 'include' }),
            fetch('/api/writing/submissions', { credentials: 'include' }),
          ]);

          const promptsData = await promptsRes.json();
          const submissionsData = await submissionsRes.json();

          if (promptsData.success && promptsData.prompts) {
            setPrompts(promptsData.prompts);
          }
          if (submissionsData.success && submissionsData.submissions) {
            setSubmissions(submissionsData.submissions);
          }
        } catch (err) {
          console.error('Failed to load writing data:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [session, isPending, router]);

  const filteredPrompts = prompts.filter(
    (p) => selectedTask === 'all' || p.taskType === selectedTask
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF] border border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini AI 3.8 Evaluator</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {t('writingTitle')}
          </h1>

          <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] max-w-3xl leading-relaxed">
            {t('writingSubtitle')}
          </p>
        </div>

        {/* Feature highlight banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? '৪টি আইইএলটিএস ক্রাইটেরিয়া' : '4 IELTS Criteria'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                TR, CC, LR, এবং GRA এর প্রতিটিতে আলাদা ব্যান্ড ও বিশ্লেষণ।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#D96B27]/10 text-[#D96B27]">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'বাক্যভিত্তিক ভুল সংশোধন' : 'Sentence-by-Sentence Fixes'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                ভুল ব্যাকরণ ও কোলোকেশন শনাক্ত করে বাংলায় স্পষ্ট কারণ সহ শুদ্ধ রূপ।
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'ব্যান্ড ৮.০+ মডেল রচনা' : 'Band 8.0+ Model Essay'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                আপনার লেখার ভাব বজায় রেখে সর্বোচ্চ মানের শব্দ ও গঠনে রূপান্তর।
              </p>
            </div>
          </div>
        </div>

        {/* Task Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-[#EAE5DB] dark:border-[#23353B] pb-3">
          <button
            type="button"
            onClick={() => setSelectedTask('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedTask === 'all'
                ? 'bg-[#0F4C5C] text-white shadow-sm'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#FAF8F5] dark:hover:bg-[#162327]'
            }`}
          >
            {lang === 'bn' ? 'সকল টাস্ক' : 'All Tasks'} ({prompts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTask('task1')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedTask === 'task1'
                ? 'bg-[#0F4C5C] text-white shadow-sm'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#FAF8F5] dark:hover:bg-[#162327]'
            }`}
          >
            Task 1 ({lang === 'bn' ? 'রিপোর্ট / চিঠি' : 'Report / Letter'})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTask('task2')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedTask === 'task2'
                ? 'bg-[#0F4C5C] text-white shadow-sm'
                : 'text-[#59656D] dark:text-[#8E9FA5] hover:bg-[#FAF8F5] dark:hover:bg-[#162327]'
            }`}
          >
            Task 2 ({lang === 'bn' ? 'প্রবন্ধ / এসে' : 'Essay'})
          </button>
        </div>

        {/* Prompts Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-sm font-semibold text-[#59656D] dark:text-[#8E9FA5]">{t('loading')}</p>
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B]">
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-sm">
              {lang === 'bn' ? 'কোনো রাইটিং প্রম্পট পাওয়া যায়নি।' : 'No writing prompts available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPrompts.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] hover:border-[#0F4C5C]/50 dark:hover:border-[#2DD4BF]/50 shadow-sm transition-all hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1B292E] border border-[#EAE5DB] dark:border-[#23353B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                      <FileText className="w-3.5 h-3.5" />
                      <span>{item.taskType.toUpperCase()}</span>
                    </span>

                    <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.taskType === 'task1' ? '20 mins (150w)' : '40 mins (250w)'}</span>
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] group-hover:text-[#0F4C5C] dark:group-hover:text-[#2DD4BF] transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] line-clamp-3 leading-relaxed">
                    {item.prompt}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between">
                  <span className="text-xs font-medium text-[#8E9FA5]">
                    {lang === 'bn' ? 'তাত্ক্ষণিক AI প্রতিক্রিয়া' : 'Instant AI feedback'}
                  </span>

                  <Link
                    href={`/writing/${item.id}`}
                    className="btn-primary-teal text-xs sm:text-sm py-2 px-4 inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                  >
                    <span>{lang === 'bn' ? 'লেখা শুরু করুন' : 'Start Writing'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Submissions Section */}
        {submissions.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-[#EAE5DB] dark:border-[#23353B]">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
              <h2 className="text-xl font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'আপনার বিগত রাইটিং মূল্যায়ন' : 'Your Past Submissions'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase text-[#0F4C5C] dark:text-[#2DD4BF]">
                      {sub.taskType}
                    </span>
                    <span className="text-[#8E9FA5]">
                      {new Date(sub.createdAt).toLocaleDateString(
                        lang === 'bn' ? 'bn-BD' : 'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-[#0F2E35] dark:text-[#F3EFE6] line-clamp-1">
                    {sub.promptTitle}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE5DB] dark:border-[#23353B] text-xs">
                    <span className="text-[#59656D] dark:text-[#8E9FA5]">
                      {sub.wordCount} {t('wordCount')}
                    </span>

                    <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                      Band {sub.estimatedBand.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
