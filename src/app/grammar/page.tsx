'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import {
  FileText,
  Bookmark,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface GrammarLesson {
  id: string;
  title: string;
  titleBn: string;
  category: string;
  subCategory?: string;
  contentBn: string;
  contentEn: string;
  commonMistakesCount: number;
  order: number;
  isBookmarked: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function GrammarLessonsPage() {
  const { lang, t } = useLanguage();
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, [selectedSubCategory]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const url =
        selectedSubCategory === 'all'
          ? `${API_BASE}/api/learning/grammar/lessons`
          : `${API_BASE}/api/learning/grammar/lessons?subCategory=${selectedSubCategory}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLessons(data.lessons || []);
      }
    } catch (err) {
      console.error('Failed to load grammar lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (e: React.MouseEvent, lessonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`${API_BASE}/api/learning/bookmarks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          itemType: 'lesson',
          itemId: lessonId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, isBookmarked: data.bookmarked } : l))
        );
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const categories = [
    { id: 'all', labelEn: 'All Topics', labelBn: 'সকল টপিক' },
    { id: 'articles', labelEn: 'Articles', labelBn: 'আর্টিকেল' },
    { id: 'prepositions', labelEn: 'Prepositions', labelBn: 'প্রিপজিশন' },
    { id: 'subject-verb-agreement', labelEn: 'Subject-Verb', labelBn: 'কর্তা-ক্রিয়ার মিল' },
    { id: 'tenses', labelEn: 'Tenses', labelBn: 'টেন্স' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-3 text-center sm:text-left border-b border-[#EAE5DB] dark:border-[#23353B] pb-6">
          <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
            {lang === 'bn' ? 'বাংলাভাষীদের সাধারণ ব্যাকরণ ভুল' : 'Common Mistakes of Bangla Speakers'}
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {lang === 'bn' ? 'ব্যাকরণ লেসন ও ভুল সংশোধন' : 'IELTS Grammar Lessons'}
          </h1>
          <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-2xl leading-relaxed">
            {lang === 'bn'
              ? 'ইংরেজি ও বাংলার কাঠামোগত পার্থক্যের কারণে বাঙালি শিক্ষার্থীদের যেসব জায়গায় নম্বর কাটা যায়, সেই নিয়মগুলোর স্পষ্ট ব্যাখ্যা ও অনুশীলন।'
              : 'Targeted lessons addressing frequent syntax, preposition, and tense errors made by native Bangla speakers in IELTS Writing & Speaking.'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedSubCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedSubCategory === cat.id
                  ? 'bg-[#0F4C5C] text-white dark:bg-[#2DD4BF] dark:text-[#0C2429] shadow-xs'
                  : 'bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5] hover:border-[#0F4C5C]'
              }`}
            >
              {lang === 'bn' ? cat.labelBn : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Lessons List Grid */}
        {loading ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center p-8">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-xs mt-3">
              Loading grammar lessons...
            </p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-2">
            <h3 className="font-heading font-bold text-base text-[#0F2E35] dark:text-[#F3EFE6]">
              No lessons in this category
            </h3>
            <p className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
              Please select another topic tab or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/grammar/${lesson.id}`}
                className="group bg-white dark:bg-[#142024] rounded-2xl p-6 border border-[#D4CDBC] dark:border-[#2F454C] hover:border-[#0F4C5C] dark:hover:border-[#2DD4BF] shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] text-[10px] font-bold uppercase tracking-wider">
                      {lesson.subCategory || lesson.category}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleToggleBookmark(e, lesson.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        lesson.isBookmarked
                          ? 'text-[#D96B27] dark:text-[#FB923C] bg-[#FAF2EB] dark:bg-[#351B0F]'
                          : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#D96B27]'
                      }`}
                      title={lesson.isBookmarked ? 'Bookmarked' : 'Add to bookmarks'}
                    >
                      <Bookmark className={`w-4 h-4 ${lesson.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#0F2E35] dark:text-[#F3EFE6] group-hover:text-[#0F4C5C] dark:group-hover:text-[#2DD4BF] transition-colors">
                      {lesson.title}
                    </h3>
                    <h4 className="text-xs font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] mt-0.5">
                      {lesson.titleBn}
                    </h4>
                  </div>

                  <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] line-clamp-2 leading-relaxed">
                    {lesson.contentBn}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between text-xs">
                  <span className="font-medium text-[#59656D] dark:text-[#8E9FA5]">
                    {lesson.commonMistakesCount} common mistakes analyzed
                  </span>
                  <div className="inline-flex items-center gap-1 font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] group-hover:translate-x-1 transition-transform">
                    <span>{lang === 'bn' ? 'লেসন পড়ুন' : 'Read Lesson'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
