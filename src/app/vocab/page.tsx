'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import {
  Volume2,
  Bookmark,
  RotateCw,
  Sparkles,
  Award,
  ArrowRight,
  Flame,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface Flashcard {
  id: string;
  word: string;
  partOfSpeech: string;
  pronunciation?: string;
  meaningEn: string;
  meaningBn: string;
  exampleEn: string;
  exampleBn: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isBookmarked: boolean;
  progress?: {
    repetition: number;
    interval: number;
    isDue: boolean;
  } | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function VocabFlashcardsPage() {
  const { lang, t } = useLanguage();
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  // Session review completion
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionXp, setSessionXp] = useState(0);

  useEffect(() => {
    loadDeckAndStats();
  }, []);

  const loadDeckAndStats = async () => {
    setLoading(true);
    try {
      const [cardsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE}/api/learning/vocab/cards`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/learning/vocab/stats`, { credentials: 'include' }),
      ]);

      const cardsData = await cardsRes.json();
      const statsData = await statsRes.json();

      if (cardsData.success) {
        setDeck(cardsData.deck || []);
        setCurrentIndex(0);
        setIsFlipped(false);
        setSessionCompleted(false);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = deck[currentIndex];

  const handleSpeak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-GB'; // IELTS standard British pronunciation
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleBookmark = async () => {
    if (!currentCard) return;

    try {
      const res = await fetch(`${API_BASE}/api/learning/bookmarks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemType: 'vocab',
          itemId: currentCard.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDeck((prev) =>
          prev.map((c, i) =>
            i === currentIndex ? { ...c, isBookmarked: data.bookmarked } : c
          )
        );
      }
    } catch (err) {
      console.error('Bookmark toggle failed:', err);
    }
  };

  const handleRateSM2 = async (rating: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    try {
      const res = await fetch(`${API_BASE}/api/learning/vocab/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          vocabItemId: currentCard.id,
          rating,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSessionXp((prev) => prev + (data.xpEarned || 10));
      }

      // Proceed to next card or complete session
      if (currentIndex + 1 < deck.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionCompleted(true);
      }
    } catch (err) {
      console.error('Review submit failed:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EAE5DB] dark:border-[#23353B] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
                {lang === 'bn' ? 'ভোকাবুলারি ফ্ল্যাশকার্ড' : 'Vocabulary Flashcards'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E7EFF1] dark:bg-[#16363B] text-[10px] font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">
                SM-2 Spaced Repetition
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
              {lang === 'bn' ? 'স্পেসড রিপিটেশন ফ্ল্যাশকার্ড অনুশীলন' : 'IELTS Flashcard Deck'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/bookmarks"
              className="px-3.5 py-1.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'বুকমার্কসমূহ' : 'Bookmarks'}</span>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white dark:bg-[#142024] p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C]">
              <span className="text-[#59656D] dark:text-[#8E9FA5]">Due for Review</span>
              <div className="font-heading text-xl font-bold text-[#D96B27] dark:text-[#FB923C] mt-0.5">
                {stats.dueToday}
              </div>
            </div>
            <div className="bg-white dark:bg-[#142024] p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C]">
              <span className="text-[#59656D] dark:text-[#8E9FA5]">Mastered Words</span>
              <div className="font-heading text-xl font-bold text-[#0F4C5C] dark:text-[#2DD4BF] mt-0.5">
                {stats.mastered}
              </div>
            </div>
            <div className="bg-white dark:bg-[#142024] p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C]">
              <span className="text-[#59656D] dark:text-[#8E9FA5]">In Learning</span>
              <div className="font-heading text-xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] mt-0.5">
                {stats.learning}
              </div>
            </div>
            <div className="bg-white dark:bg-[#142024] p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C]">
              <span className="text-[#59656D] dark:text-[#8E9FA5]">Session Earned</span>
              <div className="font-heading text-xl font-bold text-[#D96B27] dark:text-[#FDE68A] mt-0.5 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-[#FDE68A]" />
                <span>+{sessionXp} XP</span>
              </div>
            </div>
          </div>
        )}

        {/* FLASHCARD CONTAINER */}
        {loading ? (
          <div className="min-h-[380px] flex flex-col items-center justify-center p-8">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-xs mt-3">
              Loading your vocabulary deck...
            </p>
          </div>
        ) : sessionCompleted || deck.length === 0 ? (
          /* SESSION COMPLETED CARD */
          <div className="bg-white dark:bg-[#142024] rounded-3xl p-8 sm:p-12 border border-[#D4CDBC] dark:border-[#2F454C] shadow-sm text-center space-y-6 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-2xl font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
                {lang === 'bn' ? 'আজকের ফ্ল্যাশকার্ড সম্পন্ন!' : 'Session Complete!'}
              </h2>
              <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5]">
                {lang === 'bn'
                  ? 'আপনি সফলভাবে এই সেশনের সব শব্দ রিভিশন করেছেন। SM-2 অ্যালগরিদম অনুযায়ী সময়মতো পরবর্তী রিভিউ তারিখ নির্ধারিত হয়েছে।'
                  : 'Great work! All flashcards in this deck have been scheduled based on your recall accuracy.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF2EB] dark:bg-[#2A1D13] border border-[#E8D0BF] dark:border-[#52331C] inline-flex items-center gap-3">
              <Award className="w-6 h-6 text-[#D96B27] dark:text-[#FB923C]" />
              <div className="text-left">
                <div className="font-bold text-sm text-[#8C3A27] dark:text-[#FB923C]">
                  +{sessionXp} XP Awarded
                </div>
                <div className="text-[11px] text-[#8C3A27]/80 dark:text-[#FB923C]/80">
                  Daily streak maintained
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={loadDeckAndStats}
                className="w-full sm:w-auto btn-primary-teal text-xs px-5 py-2.5 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Practice Another Deck</span>
              </button>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto btn-secondary text-xs px-5 py-2.5 text-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          /* ACTIVE FLASHCARD VIEW */
          <div className="space-y-6 max-w-xl mx-auto">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs text-[#59656D] dark:text-[#8E9FA5]">
              <span>
                Card {currentIndex + 1} of {deck.length}
              </span>
              <span className="font-semibold text-[#0F4C5C] dark:text-[#2DD4BF]">
                Topic: {currentCard.topic}
              </span>
            </div>

            {/* Flashcard Card */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="min-h-[340px] bg-white dark:bg-[#142024] rounded-3xl p-6 sm:p-8 border-2 border-[#D4CDBC] dark:border-[#2F454C] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between relative group select-none"
            >
              {/* Card Header Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      currentCard.difficulty === 'hard'
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : currentCard.difficulty === 'medium'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {currentCard.difficulty}
                  </span>
                  <span className="text-[11px] font-semibold text-[#59656D] dark:text-[#8E9FA5]">
                    {currentCard.partOfSpeech}
                  </span>
                </div>

                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleSpeak(currentCard.word)}
                    className="p-2 rounded-xl text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] transition-colors"
                    title="Listen to British pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    className={`p-2 rounded-xl transition-colors ${
                      currentCard.isBookmarked
                        ? 'text-[#D96B27] dark:text-[#FB923C] bg-[#FAF2EB] dark:bg-[#351B0F]'
                        : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#D96B27] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33]'
                    }`}
                    title={currentCard.isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${currentCard.isBookmarked ? 'fill-current' : ''}`}
                    />
                  </button>
                </div>
              </div>

              {/* Card Center Content: Front vs Back */}
              <div className="py-6 text-center space-y-3">
                {!isFlipped ? (
                  /* FRONT: Word & English sentence */
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-heading text-4xl sm:text-5xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
                        {currentCard.word}
                      </h2>
                      {currentCard.pronunciation && (
                        <div className="text-xs font-mono text-[#59656D] dark:text-[#8E9FA5] mt-1">
                          {currentCard.pronunciation}
                        </div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#18272C] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] italic leading-relaxed">
                      "{currentCard.exampleEn}"
                    </div>
                  </div>
                ) : (
                  /* BACK: Bangla meaning & translation */
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <div className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider mb-1">
                        বাংলা অর্থ
                      </div>
                      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">
                        {currentCard.meaningBn}
                      </h2>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#18272C] text-xs text-[#59656D] dark:text-[#8E9FA5] leading-relaxed">
                      <span className="font-semibold text-[#1A252C] dark:text-[#EDE8DF]">
                        English definition:
                      </span>{' '}
                      {currentCard.meaningEn}
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#FAF2EB] dark:bg-[#2A1D13] border border-[#E8D0BF] dark:border-[#52331C] text-xs text-[#8C3A27] dark:text-[#FB923C] leading-relaxed">
                      <span className="font-bold">বাংলা বাক্য:</span> "{currentCard.exampleBn}"
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Hint */}
              <div className="text-center">
                <span className="inline-flex items-center gap-1 text-[11px] text-[#59656D] dark:text-[#8E9FA5] group-hover:text-[#0F4C5C] dark:group-hover:text-[#2DD4BF] transition-colors">
                  <RotateCw className="w-3 h-3" />
                  <span>
                    {!isFlipped
                      ? lang === 'bn'
                        ? 'বাংলা অর্থ দেখতে কার্ডে চাপুন'
                        : 'Tap card to reveal Bangla meaning'
                      : lang === 'bn'
                        ? 'পুনরায় ইংরেজি দেখতে চাপুন'
                        : 'Tap card to flip back'}
                  </span>
                </span>
              </div>
            </div>

            {/* SM-2 RECALL RATING BUTTONS */}
            <div className="space-y-2">
              <div className="text-center text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] uppercase tracking-wider">
                {lang === 'bn'
                  ? 'এই শব্দটি আপনার কতটুকু মনে আছে?'
                  : 'How easily did you recall this word?'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1: AGAIN */}
                <button
                  type="button"
                  onClick={() => handleRateSM2(1)}
                  className="p-3 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-700 dark:text-red-300 transition-all text-center flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span className="font-bold text-xs">
                    {lang === 'bn' ? 'মনে নেই' : 'Again'}
                  </span>
                  <span className="text-[10px] opacity-75">1 day</span>
                </button>

                {/* 2: HARD */}
                <button
                  type="button"
                  onClick={() => handleRateSM2(2)}
                  className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 transition-all text-center flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span className="font-bold text-xs">
                    {lang === 'bn' ? 'কষ্টসাধ্য' : 'Hard'}
                  </span>
                  <span className="text-[10px] opacity-75">3 days</span>
                </button>

                {/* 3: GOOD */}
                <button
                  type="button"
                  onClick={() => handleRateSM2(3)}
                  className="p-3 rounded-xl border border-teal-200 dark:border-teal-900/40 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 text-teal-800 dark:text-teal-300 transition-all text-center flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span className="font-bold text-xs">
                    {lang === 'bn' ? 'মোটামুটি' : 'Good'}
                  </span>
                  <span className="text-[10px] opacity-75">6 days</span>
                </button>

                {/* 4: EASY */}
                <button
                  type="button"
                  onClick={() => handleRateSM2(4)}
                  className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 transition-all text-center flex flex-col items-center gap-0.5 active:scale-95"
                >
                  <span className="font-bold text-xs">
                    {lang === 'bn' ? 'খুব সহজ' : 'Easy'}
                  </span>
                  <span className="text-[10px] opacity-75">10 days</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
