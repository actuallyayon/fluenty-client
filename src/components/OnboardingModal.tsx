'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Target, Calendar, Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (updatedProfile: any) => void;
}

export default function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const { lang } = useLanguage();
  const [step, setStep] = useState(1);
  const [targetBand, setTargetBand] = useState<number>(7.0);
  const [examDate, setExamDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  });
  const [currentLevel, setCurrentLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          targetBand,
          examDate,
          currentLevel,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save onboarding details');
      }

      onComplete(data.profile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bandOptions = [6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#142024] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D4CDBC] dark:border-[#2F454C] shadow-2xl space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-between border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0C2429] flex items-center justify-center text-xs font-bold">
              {step}
            </span>
            <span className="text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider">
              {lang === 'bn' ? `ধাপ ${step} / ৩: প্রস্তুতি সেটআপ` : `Step ${step} of 3: Study Roadmap`}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  s === step
                    ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF]'
                    : s < step
                    ? 'bg-[#0F4C5C]/40 dark:bg-[#2DD4BF]/40'
                    : 'bg-[#D4CDBC] dark:bg-[#2F454C]'
                }`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* STEP 1: Target Band */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'আপনার টার্গেট IELTS ব্যান্ড কত?' : 'What is your Target IELTS Band?'}
              </h2>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                {lang === 'bn'
                  ? 'আপনার লক্ষ্য অনুযায়ী প্রতিদিনের স্টাডি প্ল্যান ও প্রশ্নগুলো সাজানো হবে।'
                  : 'Your daily tasks and practice modules will be personalized to your score goal.'}
              </p>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-2">
              {bandOptions.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setTargetBand(b)}
                  className={`py-3 rounded-xl font-heading text-lg font-bold border transition-all ${
                    targetBand === b
                      ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-[#0F4C5C] text-white dark:bg-[#2DD4BF] dark:text-[#0C2429] shadow-md scale-105'
                      : 'border-[#D4CDBC] dark:border-[#2F454C] bg-[#FBF9F5] dark:bg-[#1A282D] text-[#1A252C] dark:text-[#EDE8DF] hover:border-[#0F4C5C]'
                  }`}
                >
                  {b.toFixed(1)}
                </button>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary-teal text-xs px-5 py-2.5 flex items-center gap-1.5"
              >
                <span>{lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Exam Date */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'আপনার সম্ভাব্য পরীক্ষার তারিখ কবে?' : 'When is your IELTS Exam?'}
              </h2>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                {lang === 'bn'
                  ? 'সময়সীমা অনুযায়ী রিভিশন ও দৈনিক ভোকাবুলারি রিভিউ নির্ধারণ করা হবে।'
                  : 'We pace your spaced repetition review so all topics are mastered before test day.'}
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'পরীক্ষার তারিখ নির্বাচন করুন' : 'Estimated Exam Date'}
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#FBF9F5] dark:bg-[#1A282D] border border-[#D4CDBC] dark:border-[#2F454C] rounded-xl text-sm font-semibold text-[#0F2E35] dark:text-[#F3EFE6] focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-secondary text-xs px-4 py-2"
              >
                {lang === 'bn' ? 'পেছনে যান' : 'Back'}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="btn-primary-teal text-xs px-5 py-2.5 flex items-center gap-1.5"
              >
                <span>{lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Current Level */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'আপনার বর্তমান ইংরেজি দক্ষতা কেমন?' : 'What is your current level?'}
              </h2>
              <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                {lang === 'bn'
                  ? 'সঠিক লেভেল নির্বাচনের মাধ্যমে সহজ বা চ্যালেঞ্জিং লেসন দিয়ে শুরু করতে পারবেন।'
                  : 'Helps us calibrate vocabulary flashcards and grammar explanations to your comfort.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                {
                  id: 'beginner' as const,
                  labelEn: 'Beginner (Band 5.0 - 5.5)',
                  labelBn: 'প্রাথমিক (বেসিক ব্যাকরণ ও সহজ শব্দ দিয়ে শুরু)',
                  descEn: 'Starting fresh with foundational grammar rules and everyday vocabulary.',
                },
                {
                  id: 'intermediate' as const,
                  labelEn: 'Intermediate (Band 6.0 - 6.5)',
                  labelBn: 'মধ্যবর্তী (সাধারণ বাক্য পড়তে পারেন কিন্তু ভুল হয়)',
                  descEn: 'Can read and write comfortably but struggle with complex grammatical accuracy.',
                },
                {
                  id: 'advanced' as const,
                  labelEn: 'Advanced (Band 7.0+)',
                  labelBn: 'উচ্চতর (স্পিড, জটিল প্যাসেজ ও ব্যান্ড ৭+ লক্ষ্য)',
                  descEn: 'Focusing on high-level collocations, timed reading, and Task 2 coherence.',
                },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setCurrentLevel(lvl.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                    currentLevel === lvl.id
                      ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-[#E7EFF1]/50 dark:bg-[#16363B]/50'
                      : 'border-[#D4CDBC] dark:border-[#2F454C] bg-[#FBF9F5] dark:bg-[#1A282D] hover:border-[#0F4C5C]'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
                      {lang === 'bn' ? lvl.labelBn : lvl.labelEn}
                    </div>
                    <div className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-0.5">
                      {lvl.descEn}
                    </div>
                  </div>
                  {currentLevel === lvl.id && (
                    <CheckCircle2 className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF] shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-secondary text-xs px-4 py-2"
              >
                {lang === 'bn' ? 'পেছনে যান' : 'Back'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="btn-primary-teal text-xs px-6 py-2.5 flex items-center gap-1.5"
              >
                <span>{isSubmitting ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'শুরু করুন' : 'Complete Setup')}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
