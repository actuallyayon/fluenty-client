'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from 'lucide-react';

interface MockExamSummary {
  id: string;
  title: string;
  descriptionBn: string;
  descriptionEn: string;
  difficulty: string;
  createdAt: string;
}

export default function MockExamsDirectoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [exams, setExams] = useState<MockExamSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      const fetchExams = async () => {
        try {
          const res = await fetch('/api/mock-exams', { credentials: 'include' });
          const data = await res.json();
          if (data.success && data.exams) {
            setExams(data.exams);
          }
        } catch (err) {
          console.error('Failed to load mock exams:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchExams();
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF] border border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Full Cambridge IELTS Simulation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {t('mockExamsTitle')}
          </h1>

          <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] max-w-3xl leading-relaxed">
            {t('mockExamsSubtitle')}
          </p>
        </div>

        {/* 4 Skills Progression Timeline Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#8E9FA5]">
            {lang === 'bn' ? 'অফিসিয়াল টেস্ট ক্রম ও টাইমিং' : 'Exam Structure & Official Flow'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center gap-1.5">
                  <Headphones className="w-4 h-4" />
                  <span>Section 1: Listening</span>
                </span>
                <span className="text-[#8E9FA5]">~20 mins</span>
              </div>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                অডিও শুনে রিয়েল-টাইমে বহুনির্বাচনী ও শূন্যস্থান পূরণ প্রশ্নের উত্তর।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Section 2: Reading</span>
                </span>
                <span className="text-[#8E9FA5]">20 mins</span>
              </div>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                টাইমড একাডেমিক প্যাসেজ ও সত্য/মিথ্যা/তথ্যবিহীন এবং তথ্য যাচাই প্রশ্ন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#D96B27] flex items-center gap-1.5">
                  <PenTool className="w-4 h-4" />
                  <span>Section 3: Writing</span>
                </span>
                <span className="text-[#8E9FA5]">60 mins</span>
              </div>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                টাস্ক ১ (১৫০ শব্দ) এবং টাস্ক ২ (২৫০ শব্দ) এর পূর্ণাঙ্গ রচনা প্রস্তুত।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Mic className="w-4 h-4" />
                  <span>Section 4: Speaking</span>
                </span>
                <span className="text-[#8E9FA5]">~12 mins</span>
              </div>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                ড. হ্যারিসন AI পরীক্ষকের সাথে পার্ট ১, ২ ও ৩ এর ইন্টারভিউ সম্পন্ন।
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {lang === 'bn'
                ? 'আইইএলটিএস অফিসিয়াল নিয়ম: প্রতিটি সেকশনের স্কোর শেষ হওয়ার পর সর্বমোট কম্পোজিট ব্যান্ড স্কোর (যেমন: Band 7.0) হিসাব করা হবে।'
                : 'IELTS Official Scoring: Section scores are aggregated and rounded to the nearest half-band on the final scorecard.'}
            </span>
          </div>
        </div>

        {/* Mock Exams List */}
        <div className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            {lang === 'bn' ? 'উপলব্ধ পূর্ণাঙ্গ মক টেস্ট' : 'Available Mock Exams'}
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
              <p className="text-sm font-semibold text-[#59656D] dark:text-[#8E9FA5]">{t('loading')}</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B]">
              <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-sm">
                {lang === 'bn' ? 'কোনো মক টেস্ট প্রস্তুত নেই।' : 'No mock exams available right now.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] hover:border-[#0F4C5C]/60 dark:hover:border-[#2DD4BF]/60 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                        <Award className="w-3.5 h-3.5" />
                        <span>Official 4-Skill Standard</span>
                      </span>

                      <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~120 mins total</span>
                      </span>
                    </div>

                    <h3 className="font-heading font-extrabold text-xl text-[#0F2E35] dark:text-[#F3EFE6] group-hover:text-[#0F4C5C] dark:group-hover:text-[#2DD4BF] transition-colors leading-snug">
                      {exam.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                      {lang === 'bn' ? exam.descriptionBn : exam.descriptionEn}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      +150 XP on Completion
                    </span>

                    <Link
                      href={`/mock-exams/${exam.id}`}
                      className="btn-primary-teal text-xs sm:text-sm py-2.5 px-5 inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                    >
                      <span>{t('startMockExam')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
