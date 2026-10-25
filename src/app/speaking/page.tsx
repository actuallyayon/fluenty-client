'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Mic,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  History,
  Award,
  Layers,
  Volume2,
} from 'lucide-react';

interface SpeakingCue {
  id: string;
  topic: string;
  part: number;
  cueCard: string;
  followUpQuestions?: string[];
  createdAt: string;
}

interface PastSpeakingSession {
  id: string;
  topic: string;
  turnsCount: number;
  estimatedBand?: number;
  createdAt: string;
}

export default function SpeakingDirectoryPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [cues, setCues] = useState<SpeakingCue[]>([]);
  const [sessions, setSessions] = useState<PastSpeakingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      const fetchData = async () => {
        try {
          const [cuesRes, sessionsRes] = await Promise.all([
            fetch('/api/speaking/cues', { credentials: 'include' }),
            fetch('/api/speaking/sessions', { credentials: 'include' }),
          ]);

          const cuesData = await cuesRes.json();
          const sessionsData = await sessionsRes.json();

          if (cuesData.success && cuesData.cues) {
            setCues(cuesData.cues);
          }
          if (sessionsData.success && sessionsData.sessions) {
            setSessions(sessionsData.sessions);
          }
        } catch (err) {
          console.error('Failed to load speaking data:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF] border border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive AI Examiner</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {t('speakingTitle')}
          </h1>

          <p className="text-sm sm:text-base text-[#59656D] dark:text-[#8E9FA5] max-w-3xl leading-relaxed">
            {t('speakingSubtitle')}
          </p>
        </div>

        {/* 3 Speaking Parts Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                Part 1
              </span>
              <span className="text-xs text-[#8E9FA5]">4-5 mins</span>
            </div>
            <h3 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'পরিচিতি ও সাধারণ প্রশ্নোত্তর' : 'Introduction & Interview'}
            </h3>
            <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
              আপনার নাম, পড়াশোনা, কাজের অভিজ্ঞতা এবং দৈনন্দিন জীবনের পরিচিত বিষয় নিয়ে সংক্ষিপ্ত প্রশ্ন।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#D96B27]/10 text-[#D96B27]">
                Part 2
              </span>
              <span className="text-xs text-[#8E9FA5]">3-4 mins</span>
            </div>
            <h3 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'কিউ কার্ড ও দীর্ঘ বক্তব্য' : 'Cue Card Long Turn'}
            </h3>
            <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
              একটি নির্দিষ্ট বিষয় নিয়ে ১ মিনিট নোট তৈরি করে ১ থেকে ২ মিনিট একনাগাড়ে বক্তব্য দেওয়া।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Part 3
              </span>
              <span className="text-xs text-[#8E9FA5]">4-5 mins</span>
            </div>
            <h3 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'দ্বিমুখী গভীর আলোচনা' : 'Two-way Discussion'}
            </h3>
            <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
              পার্ট ২ এর বিষয়টির সাথে যুক্ত বিভিন্ন সামাজিক, বৈশ্বিক ও দার্শনিক দিক নিয়ে বিশ্লেষণী আলোচনা।
            </p>
          </div>
        </div>

        {/* Cue Cards Directory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
              <span>{lang === 'bn' ? 'উপলব্ধ স্পিকিং কিউ কার্ড' : 'Available Speaking Topics'}</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
              <p className="text-sm font-semibold text-[#59656D] dark:text-[#8E9FA5]">{t('loading')}</p>
            </div>
          ) : cues.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B]">
              <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-sm">
                {lang === 'bn' ? 'কোনো স্পিকিং টপিক পাওয়া যায়নি।' : 'No speaking topics available.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cues.map((cue) => (
                <div
                  key={cue.id}
                  className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] hover:border-[#0F4C5C]/50 dark:hover:border-[#2DD4BF]/50 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#1B292E] border border-[#EAE5DB] dark:border-[#23353B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                        <Layers className="w-3.5 h-3.5" />
                        <span>Part 1, 2 & 3 Full Mock</span>
                      </span>

                      <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>~12-14 mins</span>
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6] group-hover:text-[#0F4C5C] dark:group-hover:text-[#2DD4BF] transition-colors leading-snug">
                      {cue.topic}
                    </h3>

                    <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs text-[#59656D] dark:text-[#8E9FA5] whitespace-pre-line leading-relaxed">
                      {cue.cueCard}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#8E9FA5]">
                      Examiner: Dr. Sarah Jenkins
                    </span>

                    <Link
                      href={`/speaking/${cue.id}`}
                      className="btn-primary-teal text-xs sm:text-sm py-2 px-4 inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform"
                    >
                      <span>{lang === 'bn' ? 'মক ইন্টারভিউ শুরু করুন' : 'Start Mock Interview'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Sessions History */}
        {sessions.length > 0 && (
          <div className="space-y-4 pt-8 border-t border-[#EAE5DB] dark:border-[#23353B]">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
              <h2 className="text-xl font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'আপনার বিগত স্পিকিং সেশন' : 'Your Past Speaking Sessions'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{sess.turnsCount} turns</span>
                    </span>
                    <span className="text-[#8E9FA5]">
                      {new Date(sess.createdAt).toLocaleDateString(
                        lang === 'bn' ? 'bn-BD' : 'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-[#0F2E35] dark:text-[#F3EFE6] line-clamp-1">
                    {sess.topic}
                  </h4>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAE5DB] dark:border-[#23353B] text-xs">
                    <span className="text-[#59656D] dark:text-[#8E9FA5]">
                      {sess.estimatedBand ? 'Completed' : 'In Progress'}
                    </span>

                    {sess.estimatedBand && (
                      <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                        Band {sess.estimatedBand.toFixed(1)}
                      </span>
                    )}
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
