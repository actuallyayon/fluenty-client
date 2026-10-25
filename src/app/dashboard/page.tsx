'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OnboardingModal from '@/components/OnboardingModal';
import {
  Flame,
  Award,
  Target,
  BookOpen,
  Volume2,
  FileText,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Headphones,
  CheckCircle2,
  Clock,
  Bookmark,
  Settings,
  PenTool,
  Mic,
  Calendar,
  Crown,
  ArrowRight,
} from 'lucide-react';

interface AttemptSummary {
  id: string;
  practiceType: 'reading' | 'listening';
  title: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  createdAt: string;
}

interface ProfileData {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  targetBand?: number;
  examDate?: string;
  currentLevel?: string;
  plan: 'free' | 'premium';
  xp: number;
  dailyStreak: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<AttemptSummary[]>([]);

  const daysUntilExam = React.useMemo(() => {
    if (!profile?.examDate) return null;
    const target = new Date(profile.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  }, [profile?.examDate]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      fetch('/api/me', {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile) {
            setProfile(data.profile);
            // Prompt onboarding if user has not set target band yet
            if (!data.profile.targetBand) {
              setShowOnboarding(true);
            }
          }
        })
        .catch((err) => console.error('Failed to load profile:', err))
        .finally(() => setLoadingProfile(false));

      // Fetch recent attempts for practice feed
      fetch('/api/practice/attempts?limit=5', {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.attempts) {
            setRecentAttempts(data.attempts);
          }
        })
        .catch((err) => console.error('Failed to load attempts:', err));
    }
  }, [session, isPending, router]);

  const handleOnboardingComplete = (updatedProfile: any) => {
    setProfile(updatedProfile);
    setShowOnboarding(false);
  };

  if (isPending || loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
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

  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-[#0F4C5C] dark:bg-[#123837] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#0A3642] dark:border-[#1E6E64] relative overflow-hidden transition-colors">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-lg text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />
                  <span>{profile?.role === 'admin' ? t('adminBadge') : t('userBadge')}</span>
                </span>
                <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-semibold text-white/90">
                  Plan: {profile?.plan?.toUpperCase()}
                </span>
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {t('dashboardWelcome')} {user?.name || 'IELTS Aspirant'}
              </h1>
              <p className="text-white/80 text-sm max-w-xl leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার আজকের IELTS প্রস্তুতি শুরু করুন। নিয়মিত প্র্যাকটিসের মাধ্যমে নিজের লক্ষ্য ব্যান্ড অর্জন নিশ্চিত করুন।'
                  : 'Start your daily IELTS preparation. Consistent practice is the secret to Band 7+.'}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Daily Streak */}
              <div className="flex-1 md:flex-none bg-white/10 dark:bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#FDE68A] font-bold text-lg">
                  <Flame className="w-5 h-5 fill-[#FDE68A]" />
                  <span>{profile?.dailyStreak || 0}</span>
                </div>
                <div className="text-[11px] font-semibold text-white/70 mt-0.5">
                  {lang === 'bn' ? 'স্ট্রিক দিন' : 'Day Streak'}
                </div>
              </div>

              {/* Total XP */}
              <div className="flex-1 md:flex-none bg-white/10 dark:bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#FDE68A] font-bold text-lg">
                  <Award className="w-5 h-5" />
                  <span>{profile?.xp || 0}</span>
                </div>
                <div className="text-[11px] font-semibold text-white/70 mt-0.5">
                  {lang === 'bn' ? 'অর্জিত XP' : 'Total XP'}
                </div>
              </div>

              {/* Target Band (Clickable to edit) */}
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="flex-1 md:flex-none bg-white/10 dark:bg-black/20 hover:bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center transition-colors group cursor-pointer"
                title="Click to change target band & exam date"
              >
                <div className="flex items-center justify-center gap-1.5 text-white font-bold text-lg group-hover:scale-105 transition-transform">
                  <Target className="w-5 h-5 text-[#2DD4BF]" />
                  <span>{profile?.targetBand ? profile.targetBand.toFixed(1) : 'Set'}</span>
                </div>
                <div className="text-[11px] font-semibold text-white/70 mt-0.5">
                  {lang === 'bn' ? 'টার্গেট ব্যান্ড' : 'Target Band'}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Link bar: Bookmarks & Onboarding settings */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'আপনার প্রস্তুতি রুটিন:' : 'Study Roadmap:'}
            </span>
            <span className="text-[#59656D] dark:text-[#8E9FA5]">
              Target: Band {profile?.targetBand || 7.0} · Level: {profile?.currentLevel || 'Intermediate'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] flex items-center gap-1 font-semibold"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Goal</span>
            </button>

            <Link
              href="/mistakes"
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1 text-rose-600 dark:text-rose-400"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'মিস্টেক নোটবুক' : 'Mistake Notebook'}</span>
            </Link>

            <Link
              href="/bookmarks"
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#D96B27]" />
              <span>{lang === 'bn' ? 'বুকমার্কস' : 'Bookmarks'}</span>
            </Link>

            <Link
              href="/mock-exams"
              className="px-3 py-1.5 bg-[#0F4C5C] text-white rounded-xl text-xs font-bold hover:bg-[#0c3c49] transition-colors flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{t('navMockExams')}</span>
            </Link>
          </div>
        </div>

        {/* Exam Countdown & Pro Plan Widget Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Exam Date Countdown */}
          <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                <span>{lang === 'bn' ? 'IELTS পরীক্ষার তারিখ' : 'Target Exam Date'}</span>
              </span>
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-xs text-[#0F4C5C] dark:text-[#2DD4BF] font-semibold hover:underline cursor-pointer"
              >
                {lang === 'bn' ? 'পরিবর্তন' : 'Change'}
              </button>
            </div>

            <div className="my-3">
              <div className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {daysUntilExam !== null ? (
                  daysUntilExam > 0 ? (
                    `${daysUntilExam} ${lang === 'bn' ? 'দিন বাকি' : 'Days Remaining'}`
                  ) : daysUntilExam === 0 ? (
                    lang === 'bn' ? 'আজ পরীক্ষার দিন!' : 'Exam is Today!'
                  ) : (
                    lang === 'bn' ? 'তারিখ অতিক্রান্ত' : 'Exam Date Passed'
                  )
                ) : (
                  lang === 'bn' ? 'তারিখ নির্ধারণ করুন' : 'Not Set'
                )}
              </div>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1">
                {profile?.examDate
                  ? new Date(profile.examDate).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : lang === 'bn'
                  ? 'টার্গেট পরীক্ষার তারিখ সেট করে ডেডলাইন ট্র্যাকিং করুন'
                  : 'Set your target test date to maintain study discipline.'}
              </p>
            </div>

            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              {lang === 'bn' ? 'প্রতিদিন ১টি মডিউল শেষ করে স্ট্রিক বজায় রাখুন' : 'Practice 1 module daily to maintain test readiness'}
            </div>
          </div>

          {/* Card 2: Target Band Strategy */}
          <div className="bg-white dark:bg-[#142024] p-5 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#D96B27] dark:text-[#FB923C]" />
                <span>{lang === 'bn' ? 'টার্গেট ব্যান্ড কৌশল' : 'Band Strategy'}</span>
              </span>
              <button
                onClick={() => setShowOnboarding(true)}
                className="text-xs text-[#D96B27] dark:text-[#FB923C] font-semibold hover:underline cursor-pointer"
              >
                {lang === 'bn' ? 'এডিট' : 'Edit'}
              </button>
            </div>

            <div className="my-3">
              <div className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                Band {profile?.targetBand ? profile.targetBand.toFixed(1) : '7.0'}
              </div>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1">
                {lang === 'bn'
                  ? 'রাইটিং ও স্পিকিং এ ফোকাস করুন — এগুলো ব্যান্ড স্কোরে সবচেয়ে প্রভাব ফেলে।'
                  : 'Focus on Writing & Speaking — they have the highest scoring variability.'}
              </p>
            </div>

            <div className="text-[11px] font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] bg-[#0F4C5C]/5 dark:bg-[#2DD4BF]/10 px-3 py-1.5 rounded-xl border border-[#0F4C5C]/15 dark:border-[#2DD4BF]/20">
              {lang === 'bn' ? 'বর্তমান লেভেল: ' + (profile?.currentLevel || 'Intermediate') : 'Proficiency: ' + (profile?.currentLevel || 'Intermediate')}
            </div>
          </div>

          {/* Card 3: Membership Status / Upgrade */}
          <div className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
            profile?.plan === 'premium'
              ? 'bg-gradient-to-br from-[#0F4C5C]/10 to-[#D96B27]/10 dark:from-[#14292F] dark:to-[#2A1E18] border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30'
              : 'bg-white dark:bg-[#142024] border-[#D4CDBC] dark:border-[#2F454C]'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1.5">
                <Crown className={`w-4 h-4 ${profile?.plan === 'premium' ? 'text-[#D96B27] dark:text-[#FB923C]' : 'text-[#59656D]'}`} />
                <span>{lang === 'bn' ? 'মেম্বারশিপ প্ল্যান' : 'Membership Status'}</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                profile?.plan === 'premium'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
              }`}>
                {profile?.plan === 'premium' ? 'Pro Member' : 'Free Tier'}
              </span>
            </div>

            <div className="my-3">
              <div className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {profile?.plan === 'premium'
                  ? lang === 'bn' ? 'আনলিমিটেড প্রো অ্যাক্সেস সক্রিয়' : 'Full Pro Access Active'
                  : lang === 'bn' ? 'ফ্রি প্ল্যান সক্রিয়' : 'Free Practice Tier'}
              </div>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1">
                {profile?.plan === 'premium'
                  ? lang === 'bn'
                    ? 'AI এসে গ্রেডিং ও লাইভ স্পিকিং ইন্টারভিউ আনলিমিটেড ব্যবহার করতে পারবেন।'
                    : 'Enjoy unlimited AI Writing evaluations and Hands-Free Live Voice calls.'
                  : lang === 'bn'
                  ? 'bKash বা কার্ড দিয়ে আপগ্রেড করে আনলিমিটেড AI ফিডব্যাক ও লাইভ ইন্টারভিউ আনলক করুন।'
                  : 'Upgrade via bKash/Nagad or Card for unlimited AI evaluations & Live Mock tests.'}
              </p>
            </div>

            {profile?.plan === 'premium' ? (
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'সব প্রিমিয়াম ফিচার আনলক করা' : 'All Pro Modules & Tests Unlocked'}</span>
              </div>
            ) : (
              <Link
                href="/pricing"
                className="w-full py-2 px-3 bg-[#0F4C5C] hover:bg-[#0c3c49] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>{lang === 'bn' ? 'প্রো আপগ্রেড করুন (৳৯৯৯)' : 'Upgrade to Pro (৳999)'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <h2 className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {t('quickActions')}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Vocab Module Card - ACTIVE */}
            <Link
              href="/vocab"
              className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] hover:border-[#0F4C5C] dark:hover:border-[#2DD4BF] transition-all shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center transition-transform group-hover:scale-105">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                    SM-2 Active
                  </span>
                </div>
                <h3 className="font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-lg">
                  {t('startVocab')}
                </h3>
                <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs mt-1 mb-4 leading-relaxed">
                  {lang === 'bn'
                    ? 'SM-2 স্পেসড রিপিটেশন সহ গুরুত্বপূর্ণ IELTS শব্দ শিখুন।'
                    : 'Master high-frequency IELTS vocabulary with spaced repetition review.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] group-hover:translate-x-1 transition-transform">
                <span>{lang === 'bn' ? 'প্র্যাকটিস শুরু করুন' : 'Practice Flashcards'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Grammar Module Card - ACTIVE */}
            <Link
              href="/grammar"
              className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] hover:border-[#D96B27] dark:hover:border-[#FB923C] transition-all shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] flex items-center justify-center transition-transform group-hover:scale-105">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C]">
                    Bangla Errors
                  </span>
                </div>
                <h3 className="font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-lg">
                  {t('startGrammar')}
                </h3>
                <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs mt-1 mb-4 leading-relaxed">
                  {lang === 'bn'
                    ? 'বাঙালি শিক্ষার্থীদের কমন গ্রামার ভুলগুলো বাংলায় বুঝুন।'
                    : 'Avoid typical grammar errors made by native Bangla speakers.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#D96B27] dark:text-[#FB923C] group-hover:translate-x-1 transition-transform">
                <span>{lang === 'bn' ? 'লেসন দেখুন' : 'Explore Lessons'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Reading Module Card - ACTIVE IN PHASE 4 */}
            <Link
              href="/reading"
              className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] hover:border-[#0F4C5C] dark:hover:border-[#2DD4BF] transition-all shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center transition-transform group-hover:scale-105">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                    Timed Tests
                  </span>
                </div>
                <h3 className="font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-lg">
                  {t('startReading')}
                </h3>
                <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs mt-1 mb-4 leading-relaxed">
                  {lang === 'bn'
                    ? 'টাইমড প্যাসেজ ও ইনস্ট্যান্ট বাংলা AI ভুল বিশ্লেষণ।'
                    : 'Timed passages with instant AI explanations for wrong answers.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] group-hover:translate-x-1 transition-transform">
                <span>{lang === 'bn' ? 'রিডিং টেস্ট শুরু করুন' : 'Start Reading Test'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Listening Module Card - ACTIVE IN PHASE 4 */}
            <Link
              href="/listening"
              className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] hover:border-[#D96B27] dark:hover:border-[#FB923C] transition-all shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] flex items-center justify-center transition-transform group-hover:scale-105">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C]">
                    Audio + Script
                  </span>
                </div>
                <h3 className="font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-lg">
                  {t('startListening')}
                </h3>
                <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs mt-1 mb-4 leading-relaxed">
                  {lang === 'bn'
                    ? 'অডিও টেস্ট এবং সাবমিটের পর সম্পূর্ণ ট্রান্সক্রিপ্ট।'
                    : 'Interactive audio player with transcript and scoring.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#D96B27] dark:text-[#FB923C] group-hover:translate-x-1 transition-transform">
                <span>{lang === 'bn' ? 'লিসেনিং টেস্ট শুরু করুন' : 'Start Listening Test'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Writing Module Card - PHASE 5 */}
            <Link
              href="/writing"
              className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] hover:border-[#0F4C5C] dark:hover:border-[#2DD4BF] transition-all shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center transition-transform group-hover:scale-105">
                    <PenTool className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                    Gemini AI 3.8
                  </span>
                </div>
                <h3 className="font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-lg">
                  {lang === 'bn' ? 'রাইটিং ওয়ার্কবেঞ্চ' : 'Writing Workbench'}
                </h3>
                <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs mt-1 mb-4 leading-relaxed">
                  {lang === 'bn'
                    ? 'টাস্ক ১ ও ২ রচনা লিখে ৪টি অফিশিয়াল ক্রাইটেরিয়া ও বাক্যভিত্তিক বাংলা সংশোধন পান।'
                    : 'Submit Task 1 & 2 essays for 4-criteria feedback and sentence-by-sentence Bangla edits.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] group-hover:translate-x-1 transition-transform">
                <span>{lang === 'bn' ? 'রাইটিং অনুশীলন শুরু করুন' : 'Start Writing Practice'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Speaking Module Card - PHASE 5 */}
            <Link
              href="/speaking"
              className="bg-white dark:bg-[#142024] p-6 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] hover:border-[#D96B27] dark:hover:border-[#FB923C] transition-all shadow-xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] flex items-center justify-center transition-transform group-hover:scale-105">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C]">
                    Examiner Bot
                  </span>
                </div>
                <h3 className="font-heading font-bold text-[#0F2E35] dark:text-[#F3EFE6] text-lg">
                  {lang === 'bn' ? 'স্পিকিং সিমুলেশন' : 'Speaking Simulation'}
                </h3>
                <p className="text-[#59656D] dark:text-[#8E9FA5] text-xs mt-1 mb-4 leading-relaxed">
                  {lang === 'bn'
                    ? 'AI পরীক্ষক ড. সারা জেনকিন্সের সাথে ৩-পার্ট ইন্টারভিউ ও উচ্চারণ-সাবলীলতার পরামর্শ।'
                    : 'Interactive 3-part mock test with AI Examiner Dr. Sarah Jenkins and Band 7+ tips.'}
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-[#D96B27] dark:text-[#FB923C] group-hover:translate-x-1 transition-transform">
                <span>{lang === 'bn' ? 'মক ইন্টারভিউ শুরু করুন' : 'Start Mock Interview'}</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Practice Attempts Feed */}
        {recentAttempts.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-[#EAE5DB] dark:border-[#23353B]">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                <span>{lang === 'bn' ? 'সাম্প্রতিক অনুশীলন ও ফলাফল' : 'Recent Practice History'}</span>
              </h2>
              <Link
                href="/mistakes"
                className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] hover:underline"
              >
                {lang === 'bn' ? 'সব মিস্টেক দেখুন' : 'View Mistake Notebook'}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentAttempts.map((att) => (
                <div
                  key={att.id}
                  className="bg-white dark:bg-[#142024] p-4 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] space-y-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        att.practiceType === 'reading'
                          ? 'bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]'
                          : 'bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C]'
                      }`}
                    >
                      {att.practiceType}
                    </span>
                    <span className="text-[11px] font-bold text-[#59656D] dark:text-[#8E9FA5]">
                      {att.score}/{att.totalQuestions} ({att.percentage}%)
                    </span>
                  </div>

                  <h3 className="font-heading font-semibold text-sm text-[#0F2E35] dark:text-[#F3EFE6] truncate">
                    {att.title}
                  </h3>

                  <div className="pt-2 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between text-[11px] text-[#59656D] dark:text-[#8E9FA5]">
                    <span>{new Date(att.createdAt).toLocaleDateString()}</span>
                    <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">
                      {att.percentage >= 70 ? 'Passed' : 'Needs Review'}
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
