'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/language-context';
import {
  Bookmark,
  BookOpen,
  FileText,
  HelpCircle,
  Trash2,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

interface BookmarkItem {
  id: string;
  itemType: 'vocab' | 'question' | 'lesson';
  itemId: string;
  createdAt: string;
  item: any;
}

const API_BASE = '';

export default function BookmarksPage() {
  const { lang, t } = useLanguage();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'vocab' | 'lesson'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [activeFilter]);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const url =
        activeFilter === 'all'
          ? `${API_BASE}/api/learning/bookmarks`
          : `${API_BASE}/api/learning/bookmarks?itemType=${activeFilter}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setBookmarks(data.bookmarks || []);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (itemType: string, itemId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/learning/bookmarks/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemType, itemId }),
      });
      const data = await res.json();
      if (data.success) {
        setBookmarks((prev) => prev.filter((b) => b.itemId !== itemId));
      }
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-[#EAE5DB] dark:border-[#23353B] pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#D96B27] dark:text-[#FB923C] uppercase tracking-wider">
              {lang === 'bn' ? 'সংরক্ষিত আইটেম' : 'Saved Collection'}
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#0F2E35] dark:text-[#F3EFE6] tracking-tight">
            {lang === 'bn' ? 'আপনার বুকমার্কসমূহ' : 'Personal Study Bookmarks'}
          </h1>
          <p className="text-sm text-[#59656D] dark:text-[#8E9FA5] max-w-xl">
            {lang === 'bn'
              ? 'অনুশীলন ও পড়ার সময় যেসব ভোকাবুলারি বা ব্যাকরণ নিয়ম পরবর্তীতে রিভিশনের জন্য সংরক্ষণ করেছেন।'
              : 'Review key vocabulary and tricky grammar lessons bookmarked during your preparation.'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {[
            { id: 'all' as const, label: lang === 'bn' ? 'সকল আইটেম' : 'All Items' },
            { id: 'vocab' as const, label: lang === 'bn' ? 'ভোকাবুলারি' : 'Vocabulary' },
            { id: 'lesson' as const, label: lang === 'bn' ? 'গ্রামার লেসন' : 'Grammar Lessons' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeFilter === tab.id
                  ? 'bg-[#0F4C5C] text-white dark:bg-[#2DD4BF] dark:text-[#0C2429]'
                  : 'bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5] hover:border-[#0F4C5C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center p-8">
            <div className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin border-4 border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 border-t-transparent" />
            <p className="text-[#59656D] dark:text-[#8E9FA5] font-semibold text-xs mt-3">
              Loading bookmarks...
            </p>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#142024] border border-[#D4CDBC] dark:border-[#2F454C] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFE6] dark:bg-[#1A282D] text-[#59656D] dark:text-[#8E9FA5] flex items-center justify-center mx-auto">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
              {lang === 'bn' ? 'কোনো বুকমার্ক পাওয়া যায়নি' : 'No Bookmarks Saved Yet'}
            </h3>
            <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] max-w-sm mx-auto">
              {lang === 'bn'
                ? 'ভোকাবুলারি কার্ড বা গ্রামার লেসন পড়ার সময় বুকমার্ক আইকনে চাপ দিয়ে গুরুত্বপূর্ণ তথ্য এখানে জমা রাখুন।'
                : 'Tap the bookmark icon while studying flashcards or reading grammar tips to save items here.'}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/vocab" className="btn-primary-teal text-xs px-4 py-2">
                {lang === 'bn' ? 'ভোকাবুলারি প্র্যাকটিস' : 'Study Vocab'}
              </Link>
              <Link href="/grammar" className="btn-secondary text-xs px-4 py-2">
                {lang === 'bn' ? 'গ্রামার লেসন দেখুন' : 'Explore Grammar'}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-[#142024] rounded-2xl p-5 border border-[#D4CDBC] dark:border-[#2F454C] shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF]">
                      {b.itemType === 'vocab' ? 'Vocabulary' : 'Grammar'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(b.itemType, b.itemId)}
                      className="p-1 rounded text-[#59656D] dark:text-[#8E9FA5] hover:text-red-500"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {b.itemType === 'vocab' && (
                    <div>
                      <h3 className="font-heading font-bold text-xl text-[#0F2E35] dark:text-[#F3EFE6]">
                        {b.item.word}
                      </h3>
                      <div className="text-xs font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] mt-0.5">
                        {b.item.meaningBn}
                      </div>
                      <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] mt-1.5 italic">
                        "{b.item.exampleEn}"
                      </p>
                    </div>
                  )}

                  {b.itemType === 'lesson' && (
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[#0F2E35] dark:text-[#F3EFE6]">
                        {b.item.title}
                      </h3>
                      <div className="text-xs font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] mt-0.5">
                        {b.item.titleBn}
                      </div>
                      <div className="text-[11px] text-[#59656D] dark:text-[#8E9FA5] mt-1">
                        Topic: {b.item.subCategory || b.item.category}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#EAE5DB] dark:border-[#23353B] flex justify-end">
                  {b.itemType === 'vocab' ? (
                    <Link
                      href="/vocab"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline"
                    >
                      <span>Practice in Flashcards</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href={`/grammar/${b.itemId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline"
                    >
                      <span>Open Lesson</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
