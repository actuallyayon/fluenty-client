'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Volume2,
  Headphones,
  HelpCircle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Layers,
} from 'lucide-react';

interface ListeningSummary {
  id: string;
  title: string;
  audioUrl: string;
  section: 1 | 2 | 3 | 4;
  questionCount: number;
  createdAt: string;
}

export default function ListeningDirectoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [items, setItems] = useState<ListeningSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/practice/listening/items`, {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.items) {
            setItems(data.items);
          }
        })
        .catch((err) => console.error('Failed to load listening items:', err))
        .finally(() => setLoading(false));
    }
  }, [session, isPending, router]);

  const getSectionTitle = (section: number) => {
    switch (section) {
      case 1:
        return lang === 'bn' ? 'সেকশন ১: দৈনন্দিন সামাজিক কথোপকথন' : 'Section 1: Everyday Social Dialogue';
      case 2:
        return lang === 'bn' ? 'সেকশন ২: একক বক্তব্য বা মনোলগ' : 'Section 2: Social Context Monologue';
      case 3:
        return lang === 'bn' ? 'সেকশন ৩: শিক্ষামূলক বা প্রশিক্ষণ আলোচনা' : 'Section 3: Educational/Training Discussion';
      case 4:
        return lang === 'bn' ? 'সেকশন ৪: একাডেমিক লেকচার' : 'Section 4: Academic Lecture';
      default:
        return `Section ${section}`;
    }
  };

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
            href="/mistakes?practiceType=listening"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D96B27] dark:text-[#FB923C] hover:underline"
          >
            <span>{lang === 'bn' ? 'লিসেনিং মিস্টেক দেখুন' : 'View Listening Mistakes'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-white dark:bg-[#142024] p-6 sm:p-8 rounded-3xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] rounded-lg text-xs font-bold">
                <Headphones className="w-4 h-4" />
                <span>{lang === 'bn' ? 'মডিউল: আইইএলটিএস লিসেনিং' : 'Module: IELTS Listening'}</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#0F2E35] dark:text-[#F3EFE6]">
                {t('listeningTitle')}
              </h1>
              <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-2xl leading-relaxed">
                {t('listeningSubtitle')}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#F4EFE6] dark:bg-[#1C2D33] px-5 py-3.5 rounded-2xl border border-[#EAE5DB] dark:border-[#2F454C]">
              <div className="text-center">
                <span className="block font-heading font-bold text-lg text-[#0F4C5C] dark:text-[#2DD4BF]">
                  {items.length}
                </span>
                <span className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'অডিও মডিউল' : 'Audio Modules'}
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

        {/* Listening Items List */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            {lang === 'bn' ? 'লিসেনিং টেস্ট নির্বাচন করুন' : 'Select a Listening Test'}
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
          ) : items.length === 0 ? (
            <div className="bg-white dark:bg-[#142024] p-12 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-3">
              <Volume2 className="w-10 h-10 mx-auto text-[#8E9FA5]" />
              <h3 className="font-heading font-bold text-lg">
                {lang === 'bn' ? 'কোনো লিসেনিং মডিউল পাওয়া যায়নি' : 'No Listening Items Found'}
              </h3>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'শীঘ্রই নতুন অডিও প্র্যাকটিস মডিউল যুক্ত করা হবে।'
                  : 'New audio practice modules will be available shortly.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {items.map((it) => (
                <div
                  key={it.id}
                  className="bg-white dark:bg-[#142024] rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] p-6 flex flex-col justify-between hover:border-[#D96B27] dark:hover:border-[#FB923C] transition-all shadow-xs group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C]">
                        Section {it.section}
                      </span>
                      <span className="text-xs font-medium text-[#59656D] dark:text-[#8E9FA5]">
                        {getSectionTitle(it.section)}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] group-hover:text-[#D96B27] dark:group-hover:text-[#FB923C] transition-colors leading-snug">
                      {it.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#59656D] dark:text-[#8E9FA5] pt-1">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                        <span>{it.questionCount} {lang === 'bn' ? 'টি প্রশ্ন' : 'Questions'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
                        <span>{lang === 'bn' ? 'সাবমিটের পর ট্রান্সক্রিপ্ট' : 'Transcript upon submit'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between">
                    <div className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                      {lang === 'bn' ? 'অডিও স্পিড কন্ট্রোল সহ' : 'Includes speed controls'}
                    </div>

                    <Link
                      href={`/listening/${it.id}`}
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
