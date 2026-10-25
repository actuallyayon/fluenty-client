'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  BookOpen,
  Clock,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  BarChart,
} from 'lucide-react';

interface PassageSummary {
  id: string;
  title: string;
  difficulty: string;
  timeLimitMinutes: number;
  questionCount: number;
  createdAt: string;
}

export default function ReadingDirectoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [passages, setPassages] = useState<PassageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/practice/reading/passages`, {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.passages) {
            setPassages(data.passages);
          }
        })
        .catch((err) => console.error('Failed to load passages:', err))
        .finally(() => setLoading(false));
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{t('navDashboard')}</span>
          </Link>

          <Link
            href="/mistakes?practiceType=reading"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D96B27] dark:text-[#FB923C] hover:underline"
          >
            <span>{lang === 'bn' ? 'রিডিং মিস্টেক দেখুন' : 'View Reading Mistakes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-white dark:bg-[#142024] p-6 sm:p-8 rounded-3xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] rounded-lg text-xs font-bold">
                <BookOpen className="w-4 h-4" />
                <span>{lang === 'bn' ? 'মডিউল: আইইএলটিএস রিডিং' : 'Module: IELTS Reading'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E35] dark:text-[#F3EFE6]">
                {t('readingTitle')}
              </h1>
              <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-2xl leading-relaxed">
                {t('readingSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#F4EFE6] dark:bg-[#1C2D33] px-5 py-3.5 rounded-2xl border border-[#EAE5DB] dark:border-[#2F454C]">
              <div className="text-center">
                <span className="block font-heading font-bold text-lg text-[#0F4C5C] dark:text-[#2DD4BF]">
                  {passages.length}
                </span>
                <span className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'উপলব্ধ টেস্ট' : 'Available Tests'}
                </span>
              </div>
              <div className="w-px h-8 bg-[#D4CDBC] dark:border-[#2F454C]" />
              <div className="text-center">
                <span className="block font-heading font-bold text-lg text-[#D96B27] dark:text-[#FB923C]">
                  +35 XP
                </span>
                <span className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'প্রতি টেস্টে' : 'Per Test'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Passages List */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            {lang === 'bn' ? 'অনুশীলনের জন্য প্যাসেজ নির্বাচন করুন' : 'Select a Reading Passage'}
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] animate-pulse space-y-4"
                >
                  <div className="h-5 bg-[#EAE5DB] dark:bg-[#23353B] rounded w-3/4" />
                  <div className="h-4 bg-[#EAE5DB] dark:bg-[#23353B] rounded w-1/2" />
                  <div className="h-10 bg-[#EAE5DB] dark:bg-[#23353B] rounded" />
                </div>
              ))}
            </div>
          ) : passages.length === 0 ? (
            <div className="bg-white dark:bg-[#142024] p-12 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-[#8E9FA5]" />
              <h3 className="font-heading font-bold text-lg">
                {lang === 'bn' ? 'কোনো প্যাসেজ পাওয়া যায়নি' : 'No Reading Passages Found'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'শীঘ্রই নতুন আইইএলটিএস একাডেমিক প্যাসেজ যুক্ত করা হবে।'
                  : 'New academic reading passages will be available shortly.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {passages.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-[#142024] rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] p-6 flex flex-col justify-between hover:border-[#0F4C5C] dark:hover:border-[#2DD4BF] transition-all shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                        {p.difficulty}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#59656D] dark:text-[#8E9FA5]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{p.timeLimitMinutes} {lang === 'bn' ? 'মিনিট' : 'mins'}</span>
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] group-hover:text-[#0F4C5C] dark:group-hover:text-[#2DD4BF] transition-colors leading-snug">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#59656D] dark:text-[#8E9FA5] pt-1">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                        <span>{p.questionCount} {lang === 'bn' ? 'টি প্রশ্ন' : 'Questions'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
                        <span>MCQ, TFNG, Blanks, Headings</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                      {lang === 'bn' ? 'টাইমার সহ সরাসরি অনুশীলন' : 'Includes live timer'}
                    </div>

                    <Link
                      href={`/reading/${p.id}`}
                      className="btn-primary-teal text-xs py-2 px-4 flex items-center gap-1.5 font-bold"
                    >
                      <span>{t('startPractice')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
