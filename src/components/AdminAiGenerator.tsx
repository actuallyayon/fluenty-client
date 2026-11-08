'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import {
  Sparkles,
  BookOpen,
  Volume2,
  PenTool,
  Mic,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  Quote,
  Newspaper,
  Globe,
  ExternalLink,
  RefreshCw,
  Radio,
  FileText,
  Clock,
  Compass,
} from 'lucide-react';

const API_BASE = '';

interface NewsPortalInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  siteUrl: string;
  type: string;
  badgeColor: string;
}

interface NewsArticleItem {
  id: string;
  portalId: string;
  portalName: string;
  sourceCategory: string;
  title: string;
  snippet: string;
  url: string;
  publishedAt: string;
  lines: string[];
  suggestedTopic: string;
  difficulty: string;
}

export default function AdminAiGenerator({ onContentPublished }: { onContentPublished?: () => void }) {
  const { lang, t } = useLanguage();

  const [activeGenType, setActiveGenType] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');

  // Reading Source Sub-mode: 'news_portals' vs 'custom'
  const [readingSourceMode, setReadingSourceMode] = useState<'news_portals' | 'custom'>('news_portals');

  // News Portals state
  const [portals, setPortals] = useState<NewsPortalInfo[]>([]);
  const [selectedPortalId, setSelectedPortalId] = useState<string>('all');
  const [newsArticles, setNewsArticles] = useState<NewsArticleItem[]>([]);
  const [fetchingNews, setFetchingNews] = useState<boolean>(false);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Common Input states
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [taskType, setTaskType] = useState<'task1' | 'task2'>('task2');
  const [section, setSection] = useState<1 | 2 | 3 | 4>(1);

  // Status states
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Drafts
  const [readingDraft, setReadingDraft] = useState<any | null>(null);
  const [listeningDraft, setListeningDraft] = useState<any | null>(null);
  const [writingDraft, setWritingDraft] = useState<any | null>(null);
  const [speakingDraft, setSpeakingDraft] = useState<any | null>(null);

  // Load news portals on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/ai/news-portals`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.portals) {
          setPortals(data.portals);
        }
      })
      .catch((err) => console.warn('Could not load news portals:', err));

    // Also fetch initial news articles
    loadNewsArticles('all');
  }, []);

  const loadNewsArticles = async (portalId: string) => {
    setFetchingNews(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/ai/news-portals/${portalId}/articles`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.articles) {
        setNewsArticles(data.articles);
        if (data.articles.length > 0 && !activeArticleId) {
          setActiveArticleId(data.articles[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load news articles:', err);
    } finally {
      setFetchingNews(false);
    }
  };

  const handlePortalChange = (newPortalId: string) => {
    setSelectedPortalId(newPortalId);
    loadNewsArticles(newPortalId);
  };

  // 1. Generate from Selected News Article
  const handleGenerateFromArticle = async (article: NewsArticleItem) => {
    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/ai/generate-from-news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          article,
          difficulty,
          questionCount: 4,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate reading test from news article');
      }

      setReadingDraft(data.generated);
      setSuccessMsg(
        lang === 'bn'
          ? `Gemini AI সফলভাবে "${article.portalName}"-এর খবর ও উদ্ধৃতি ব্যবহার করে আইইএলটিএস রিডিং টেস্ট তৈরি করেছে! নিচে প্রিভিউ দেখুন।`
          : `Gemini AI successfully transformed the news story from "${article.portalName}" into an IELTS Reading test! Review below.`
      );
    } catch (err: any) {
      console.error('News generation error:', err);
      setErrorMsg(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // 2. AI Auto-Pick and Generate from News Portals
  const handleAutoPickAndGenerate = async () => {
    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/ai/auto-pick-news-reading`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          portalId: selectedPortalId,
          difficulty,
          questionCount: 4,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to auto-pick and generate reading test');
      }

      setReadingDraft(data.generated);
      setSuccessMsg(
        lang === 'bn'
          ? `Gemini AI স্বয়ংক্রিয়ভাবে "${data.pickedArticle?.portalName}"-এর সেরা খবরটি বেছে নিয়ে আইইএলটিএস প্যাসেজ তৈরি করেছে! যুক্তি: ${data.reasonPicked}`
          : `Gemini AI autonomously analyzed the feed, selected "${data.pickedArticle?.title}" from ${data.pickedArticle?.portalName}, and generated the test!`
      );
    } catch (err: any) {
      console.error('Auto-pick generation error:', err);
      setErrorMsg(err.message || 'Auto-pick generation failed');
    } finally {
      setGenerating(false);
    }
  };

  // 3. Manual Topic Generation
  const handleGenerateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে একটি বিষয়/টপিক লিখুন।' : 'Please enter a topic.');
      return;
    }

    setGenerating(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let endpoint = '';
      let body: any = { topic };

      if (activeGenType === 'reading') {
        endpoint = '/api/admin/ai/generate-reading';
        body.difficulty = difficulty;
        body.questionCount = 4;
      } else if (activeGenType === 'listening') {
        endpoint = '/api/admin/ai/generate-listening';
        body.section = section;
        body.questionCount = 3;
      } else if (activeGenType === 'writing') {
        endpoint = '/api/admin/ai/generate-writing';
        body.taskType = taskType;
      } else if (activeGenType === 'speaking') {
        endpoint = '/api/admin/ai/generate-speaking';
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate content');
      }

      if (activeGenType === 'reading') setReadingDraft(data.generated);
      if (activeGenType === 'listening') setListeningDraft(data.generated);
      if (activeGenType === 'writing') setWritingDraft(data.generated);
      if (activeGenType === 'speaking') setSpeakingDraft(data.generated);

      setSuccessMsg(
        lang === 'bn'
          ? 'জেমিনাই AI সফলভাবে খসড়া কনটেন্ট তৈরি করেছে! নিচে প্রিভিউ দেখুন এবং ডাটাবেজে সেভ করুন।'
          : 'Gemini AI successfully generated the draft! Review below and publish to live database.'
      );
    } catch (err: any) {
      console.error('Generation error:', err);
      setErrorMsg(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      let endpoint = '';
      let payload: any = null;

      if (activeGenType === 'reading') {
        endpoint = '/api/admin/ai/publish-reading';
        payload = readingDraft;
      } else if (activeGenType === 'listening') {
        endpoint = '/api/admin/ai/publish-listening';
        payload = listeningDraft;
      } else if (activeGenType === 'writing') {
        endpoint = '/api/admin/ai/publish-writing';
        payload = writingDraft;
      } else if (activeGenType === 'speaking') {
        endpoint = '/api/admin/ai/publish-speaking';
        payload = speakingDraft;
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish content');
      }

      setSuccessMsg(
        lang === 'bn'
          ? 'কনটেন্টটি সফলভাবে লাইভ ডাটাবেজে প্রকাশিত হয়েছে! শিক্ষার্থীরা এখন এটি অনুশীলন করতে পারবে।'
          : 'Content successfully published to live database! Learners can now practice it.'
      );

      // Clear draft
      if (activeGenType === 'reading') setReadingDraft(null);
      if (activeGenType === 'listening') setListeningDraft(null);
      if (activeGenType === 'writing') setWritingDraft(null);
      if (activeGenType === 'speaking') setSpeakingDraft(null);
      setTopic('');

      if (onContentPublished) onContentPublished();
    } catch (err: any) {
      console.error('Publish error:', err);
      setErrorMsg(err.message || 'Publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0F4C5C]/15 via-white dark:via-[#142024] to-[#D96B27]/10 border border-[#0F4C5C]/20 dark:border-[#2DD4BF]/20 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#0F4C5C] text-white">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini 3.8 AI Generator + Live News Connect</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0F2E35] dark:text-[#F3EFE6]">
          {t('adminAiGenTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] leading-relaxed max-w-3xl">
          {lang === 'bn'
            ? 'ব্রিটিশ কাউন্সিল, বিবিসি নিউজ, দ্য গার্ডিয়ান, রয়টার্স ও দ্য ডেইলি স্টার থেকে সরাসরি খবরের লাইন ও অনুচ্ছেদ সংযুক্ত করে স্বয়ংক্রিয়ভাবে প্রামাণ্য আইইএলটিএস রিডিং প্যাসেজ তৈরি করুন।'
            : 'Fetch real-time articles, quotes, and academic passages directly from British Council, BBC News, The Guardian, Reuters, and The Daily Star. AI automatically curates, extracts key lines, and generates IELTS tests.'}
        </p>
      </div>

      {/* Generator Module Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveGenType('reading');
            setErrorMsg(null);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGenType === 'reading'
              ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-white dark:bg-[#142024] shadow-sm ring-2 ring-[#0F4C5C]/20'
              : 'border-[#EAE5DB] dark:border-[#23353B] bg-white/60 dark:bg-[#101A1E] text-[#59656D] dark:text-[#8E9FA5]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            <BookOpen className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
            <span>Reading</span>
          </div>
          <span className="text-xs text-[#8E9FA5] block">News Portals & British Council</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveGenType('listening');
            setErrorMsg(null);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGenType === 'listening'
              ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-white dark:bg-[#142024] shadow-sm ring-2 ring-[#0F4C5C]/20'
              : 'border-[#EAE5DB] dark:border-[#23353B] bg-white/60 dark:bg-[#101A1E] text-[#59656D] dark:text-[#8E9FA5]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            <Volume2 className="w-4 h-4 text-[#D96B27]" />
            <span>Listening</span>
          </div>
          <span className="text-xs text-[#8E9FA5] block">Section 1-4 Dialogue Script</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveGenType('writing');
            setErrorMsg(null);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGenType === 'writing'
              ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-white dark:bg-[#142024] shadow-sm ring-2 ring-[#0F4C5C]/20'
              : 'border-[#EAE5DB] dark:border-[#23353B] bg-white/60 dark:bg-[#101A1E] text-[#59656D] dark:text-[#8E9FA5]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Writing</span>
          </div>
          <span className="text-xs text-[#8E9FA5] block">Task 1 & 2 + Model Essay</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveGenType('speaking');
            setErrorMsg(null);
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeGenType === 'speaking'
              ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-white dark:bg-[#142024] shadow-sm ring-2 ring-[#0F4C5C]/20'
              : 'border-[#EAE5DB] dark:border-[#23353B] bg-white/60 dark:bg-[#101A1E] text-[#59656D] dark:text-[#8E9FA5]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1 text-sm font-bold text-[#0F2E35] dark:text-[#F3EFE6]">
            <Mic className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Speaking</span>
          </div>
          <span className="text-xs text-[#8E9FA5] block">Part 1, 2 & 3 Cue Card</span>
        </button>
      </div>

      {/* ============================================================
          READING MODULE: LIVE NEWS PORTALS & BRITISH COUNCIL
          ============================================================ */}
      {activeGenType === 'reading' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-6">
          {/* Sub-mode switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
            <div className="flex items-center gap-2 p-1 bg-[#F4EFE6] dark:bg-[#1C2D33] rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setReadingSourceMode('news_portals')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  readingSourceMode === 'news_portals'
                    ? 'bg-white dark:bg-[#142024] text-[#0F4C5C] dark:text-[#2DD4BF] shadow-xs'
                    : 'text-[#59656D] dark:text-[#8E9FA5]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                <span>{lang === 'bn' ? 'নিউজ পোর্টাল ও ব্রিটিশ কাউন্সিল' : 'News Portals & British Council'}</span>
              </button>

              <button
                type="button"
                onClick={() => setReadingSourceMode('custom')}
                className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  readingSourceMode === 'custom'
                    ? 'bg-white dark:bg-[#142024] text-[#0F4C5C] dark:text-[#2DD4BF] shadow-xs'
                    : 'text-[#59656D] dark:text-[#8E9FA5]'
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'ম্যানুয়াল টপিক টাইপ' : 'Custom Topic Prompt'}</span>
              </button>
            </div>

            {/* Target Difficulty */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#59656D] dark:text-[#8E9FA5]">
                {lang === 'bn' ? 'টার্গেট ব্যান্ড:' : 'Target Band:'}
              </span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="p-1.5 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#101A1E] text-xs font-semibold"
              >
                <option value="easy">Easy (Band 5.5 - 6.0)</option>
                <option value="medium">Medium (Band 6.5 - 7.5)</option>
                <option value="hard">Hard (Band 8.0 - 9.0)</option>
              </select>
            </div>
          </div>

          {/* Sub-mode 1: News Portals & British Council Integration */}
          {readingSourceMode === 'news_portals' ? (
            <div className="space-y-6">
              {/* Filter Bar & AI Auto-Pick action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-xs font-bold text-[#59656D] dark:text-[#8E9FA5] whitespace-nowrap">
                    {lang === 'bn' ? 'সংযুক্ত পোর্টাল:' : 'Portal Feed:'}
                  </span>
                  <select
                    value={selectedPortalId}
                    onChange={(e) => handlePortalChange(e.target.value)}
                    disabled={fetchingNews || generating}
                    className="flex-1 max-w-sm p-2 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#101A1E] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                  >
                    <option value="all">🌍 All Connected Portals (BBC, Guardian, British Council, Reuters)</option>
                    {portals.map((portal) => (
                      <option key={portal.id} value={portal.id}>
                        {portal.name} ({portal.category})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => loadNewsArticles(selectedPortalId)}
                    disabled={fetchingNews || generating}
                    title="Refresh live feeds"
                    className="p-2 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] text-[#59656D] dark:text-[#8E9FA5] transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${fetchingNews ? 'animate-spin text-[#0F4C5C]' : ''}`} />
                  </button>
                </div>

                {/* ✨ Magic Auto-Pick AI Button */}
                <button
                  type="button"
                  onClick={handleAutoPickAndGenerate}
                  disabled={generating || fetchingNews || newsArticles.length === 0}
                  className="btn-primary-teal text-xs py-2.5 px-4 font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{lang === 'bn' ? 'AI নির্বাচন ও টেস্ট তৈরি করছে...' : 'AI Auto-Curating & Generating...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{lang === 'bn' ? '✨ AI অটো-পিক ও টেস্ট জেনারেট' : '✨ AI Auto-Pick & Generate Test'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Feed of fetched news articles */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-[#59656D] dark:text-[#8E9FA5]">
                  <span>
                    {lang === 'bn'
                      ? `উপলব্ধ খবরের রিপোর্ট ও অনুচ্ছেদ (${newsArticles.length} টি)`
                      : `Live News Articles & British Council Passages (${newsArticles.length})`}
                  </span>
                  <span className="text-[11px] font-normal text-[#8E9FA5]">
                    {lang === 'bn' ? 'যেকোনো একটি নির্বাচন করে রূপান্তর করুন' : 'Click "Transform with AI" on any story'}
                  </span>
                </div>

                {fetchingNews ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl border border-[#EAE5DB] dark:border-[#23353B] bg-[#FAF8F5]/50 dark:bg-[#101A1E] animate-pulse space-y-3"
                      >
                        <div className="h-4 bg-[#EAE5DB] dark:bg-[#23353B] rounded w-1/3" />
                        <div className="h-5 bg-[#EAE5DB] dark:bg-[#23353B] rounded w-3/4" />
                        <div className="h-12 bg-[#EAE5DB] dark:bg-[#23353B] rounded" />
                      </div>
                    ))}
                  </div>
                ) : newsArticles.length === 0 ? (
                  <div className="p-8 text-center rounded-xl border border-dashed border-[#D4CDBC] dark:border-[#2F454C] text-[#8E9FA5] space-y-2">
                    <Newspaper className="w-8 h-8 mx-auto" />
                    <p className="text-xs">No articles available. Click refresh to connect and fetch.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                    {newsArticles.map((art) => (
                      <div
                        key={art.id}
                        className="p-4 rounded-2xl border border-[#EAE5DB] dark:border-[#23353B] bg-[#FAF8F5]/60 dark:bg-[#101A1E] hover:border-[#0F4C5C]/50 dark:hover:border-[#2DD4BF]/50 flex flex-col justify-between space-y-3 transition-all group"
                      >
                        <div className="space-y-2">
                          {/* Portal badge & date */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md ${
                                art.portalId === 'british_council_ielts'
                                  ? 'bg-emerald-600 text-white'
                                  : art.portalId.includes('bbc')
                                  ? 'bg-red-600 text-white'
                                  : art.portalId.includes('guardian')
                                  ? 'bg-sky-700 text-white'
                                  : art.portalId === 'reuters_world'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-teal-700 text-white'
                              }`}
                            >
                              {art.portalName}
                            </span>
                            <span className="text-[10px] text-[#8E9FA5]">
                              {art.sourceCategory}
                            </span>
                          </div>

                          {/* Headline */}
                          <h4 className="font-heading font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6] leading-snug group-hover:text-[#0F4C5C] dark:group-hover:text-[#2DD4BF] transition-colors">
                            {art.title}
                          </h4>

                          {/* Snippet */}
                          <p className="text-xs text-[#59656D] dark:text-[#8E9FA5] leading-relaxed line-clamp-2">
                            {art.snippet}
                          </p>

                          {/* Newspaper lines / authentic quotes */}
                          {art.lines && art.lines.length > 0 && (
                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] font-bold text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center gap-1">
                                <Quote className="w-3 h-3" />
                                <span>{lang === 'bn' ? 'প্রামাণ্য খবরের লাইন/উদ্ধৃতি:' : 'Key Newspaper Lines:'}</span>
                              </span>
                              <div className="pl-2 border-l-2 border-[#0F4C5C]/30 text-[11px] italic text-[#59656D] dark:text-[#8E9FA5] line-clamp-2">
                                &ldquo;{art.lines[0]}&rdquo;
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer Actions */}
                        <div className="pt-3 border-t border-[#EAE5DB] dark:border-[#23353B] flex items-center justify-between gap-2">
                          <a
                            href={art.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF] transition-colors"
                          >
                            <span>Original Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleGenerateFromArticle(art)}
                            disabled={generating}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#E7EFF1] dark:bg-[#16363B] text-[#0F4C5C] dark:text-[#2DD4BF] hover:bg-[#0F4C5C] hover:text-white dark:hover:bg-[#2DD4BF] dark:hover:text-[#0F2E35] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{lang === 'bn' ? 'টেস্ট তৈরি করুন' : 'Transform with AI'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Sub-mode 2: Custom Topic Prompt */
            <form onSubmit={handleGenerateCustom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'রিডিং টপিক বা বিষয়বস্তু' : 'Reading Topic or Subject'}
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Cognitive Linguistics and Neuroplasticity in Geriatric Health"
                  disabled={generating}
                  className="w-full p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-[#1A252C] dark:text-[#EDE8DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={generating || !topic.trim()}
                  className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>{lang === 'bn' ? 'Gemini AI তৈরি করছে...' : 'Generating with Gemini...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'প্যাসেজ ও প্রশ্ন তৈরি করুন' : 'Generate Reading Test'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ============================================================
          OTHER MODULES: LISTENING, WRITING, SPEAKING
          ============================================================ */}
      {activeGenType !== 'reading' && (
        <form onSubmit={handleGenerateCustom} className="p-6 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#59656D] dark:text-[#8E9FA5]">
              {lang === 'bn' ? 'টপিক বা বিষয়বস্তু' : 'Topic or Subject'}
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                activeGenType === 'listening'
                  ? 'e.g. University Accommodation Inquiry'
                  : activeGenType === 'writing'
                  ? 'e.g. Impact of Social Media on Child Psychology'
                  : 'e.g. A memorable public speaking experience'
              }
              disabled={generating}
              className="w-full p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-[#1A252C] dark:text-[#EDE8DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeGenType === 'listening' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'লিসেনিং সেকশন' : 'IELTS Section'}
                </label>
                <select
                  value={section}
                  onChange={(e) => setSection(Number(e.target.value) as any)}
                  className="w-full p-3 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#101A1E] text-xs font-semibold"
                >
                  <option value={1}>Section 1 (Social Dialogue)</option>
                  <option value={2}>Section 2 (General Monologue)</option>
                  <option value={3}>Section 3 (Academic Discussion)</option>
                  <option value={4}>Section 4 (University Lecture)</option>
                </select>
              </div>
            )}

            {activeGenType === 'writing' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#59656D] dark:text-[#8E9FA5]">
                  {lang === 'bn' ? 'টাস্কের ধরন' : 'Task Type'}
                </label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#101A1E] text-xs font-semibold"
                >
                  <option value="task1">Task 1 (Report/Chart, 150 words)</option>
                  <option value="task2">Task 2 (Essay, 250 words)</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating || !topic.trim()}
              className="btn-primary-teal text-xs sm:text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>{lang === 'bn' ? 'Gemini AI তৈরি করছে...' : 'Generating with Gemini...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'কনটেন্ট তৈরি করুন' : 'Generate with Gemini'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ============================================================
          DRAFT PREVIEW & PUBLISH CONTROLS
          ============================================================ */}

      {/* 1. Reading Draft Preview */}
      {readingDraft && activeGenType === 'reading' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                  Draft Preview
                </span>
                {readingDraft.sourceName && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                    <Newspaper className="w-3 h-3" />
                    <span>Sourced from: {readingDraft.sourceName}</span>
                  </span>
                )}
                {readingDraft.difficulty && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                    {readingDraft.difficulty}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6]">
                {readingDraft.title}
              </h3>
              {readingDraft.sourceUrl && (
                <a
                  href={readingDraft.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#0F4C5C] dark:text-[#2DD4BF] hover:underline"
                >
                  <span>Original Article Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary-teal text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{publishing ? 'Publishing...' : 'Approve & Publish to Passages'}</span>
            </button>
          </div>

          {/* AI Selection Insight */}
          {readingDraft.reasonPicked && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold block">AI Pedagogical Selection Insight:</span>
                <span>{readingDraft.reasonPicked}</span>
              </div>
            </div>
          )}

          {/* Passage Text */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto font-serif">
            {readingDraft.passage}
          </div>

          {/* Questions Preview */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#0F4C5C] dark:text-[#2DD4BF]" />
              <span>Generated Questions ({readingDraft.questions?.length})</span>
            </h4>

            <div className="space-y-3">
              {readingDraft.questions?.map((q: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">
                      Q{q.order}. {q.prompt}
                    </span>
                    <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAE5DB] dark:bg-[#23353B] text-[#59656D] dark:text-[#8E9FA5]">
                      {q.type}
                    </span>
                  </div>

                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                      {q.options.map((opt: string, oi: number) => (
                        <div
                          key={oi}
                          className={`p-1.5 rounded-lg border text-[11px] ${
                            opt === q.correctAnswer
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-semibold'
                              : 'border-[#EAE5DB] dark:border-[#23353B] text-[#59656D] dark:text-[#8E9FA5]'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                    <span>Correct Answer:</span>
                    <span>{q.correctAnswer}</span>
                  </div>

                  {q.evidenceQuote && (
                    <blockquote className="text-[11px] italic text-[#59656D] dark:text-[#8E9FA5] pl-2.5 border-l-2 border-[#0F4C5C] dark:border-[#2DD4BF]">
                      &ldquo;{q.evidenceQuote}&rdquo;
                    </blockquote>
                  )}

                  <div className="pt-1 text-[11px] text-[#59656D] dark:text-[#EDE8DF] space-y-1">
                    <p>
                      <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">বাংলা ব্যাখ্যা:</span> {q.explanationBn}
                    </p>
                    {q.explanationEn && (
                      <p className="text-[10px] text-[#8E9FA5]">
                        <span className="font-bold">English:</span> {q.explanationEn}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Listening Draft Preview */}
      {listeningDraft && activeGenType === 'listening' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#D96B27]/30 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#D96B27]/10 text-[#D96B27]">
                Listening Section {listeningDraft.section}
              </span>
              <h3 className="text-xl font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6] mt-1">
                {listeningDraft.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary-teal text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{publishing ? 'Publishing...' : 'Approve & Publish to Listening'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-64 overflow-y-auto font-mono">
            {listeningDraft.transcript}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
              Questions ({listeningDraft.questions?.length})
            </h4>

            {listeningDraft.questions?.map((q: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs space-y-1">
                <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">Q{q.order}. {q.prompt}</span>
                <span className="block text-emerald-600 font-semibold">Answer: {q.correctAnswer}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Writing Draft Preview */}
      {writingDraft && activeGenType === 'writing' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-emerald-500/30 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                {writingDraft.taskType.toUpperCase()}
              </span>
              <h3 className="text-xl font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6] mt-1">
                {writingDraft.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary-teal text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{publishing ? 'Publishing...' : 'Approve & Publish to Writing'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm whitespace-pre-line leading-relaxed">
            <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF] block mb-1">Prompt Instructions:</span>
            {writingDraft.prompt}
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm whitespace-pre-line leading-relaxed font-serif">
            <span className="font-bold text-[#D96B27] block mb-1">Band 8.5+ Model Essay:</span>
            {writingDraft.modelEssay}
          </div>
        </div>
      )}

      {/* 4. Speaking Draft Preview */}
      {speakingDraft && activeGenType === 'speaking' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-purple-500/30 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600">
                Full 3-Part Cue Card
              </span>
              <h3 className="text-xl font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6] mt-1">
                {speakingDraft.topic}
              </h3>
            </div>

            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary-teal text-xs py-2 px-5 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{publishing ? 'Publishing...' : 'Approve & Publish to Speaking'}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm whitespace-pre-line leading-relaxed font-serif">
            <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF] block mb-1">Part 2 Cue Card:</span>
            {speakingDraft.cueCard}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-1">
              <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF] block">Part 1 Questions:</span>
              <ul className="list-disc pl-4 space-y-1">
                {speakingDraft.part1Questions?.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-1">
              <span className="font-bold text-[#D96B27] block">Part 3 Discussion:</span>
              <ul className="list-disc pl-4 space-y-1">
                {speakingDraft.part3Questions?.map((q: string, i: number) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
