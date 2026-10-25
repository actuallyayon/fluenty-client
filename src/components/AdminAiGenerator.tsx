'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

const API_BASE = '';

export default function AdminAiGenerator({ onContentPublished }: { onContentPublished?: () => void }) {
  const { lang, t } = useLanguage();

  const [activeGenType, setActiveGenType] = useState<'reading' | 'listening' | 'writing' | 'speaking'>('reading');

  // Input states
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

  const handleGenerate = async (e: React.FormEvent) => {
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
          <span>Gemini 3.8 AI Assistant</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#0F2E35] dark:text-[#F3EFE6]">
          {t('adminAiGenTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-[#59656D] dark:text-[#8E9FA5] leading-relaxed max-w-2xl">
          {t('adminAiGenDesc')}
        </p>
      </div>

      {/* Generator Type Selector */}
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
          <span className="text-xs text-[#8E9FA5] block">Passage + 4 Questions</span>
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
          <span className="text-xs text-[#8E9FA5] block">Dialogue Script + Questions</span>
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
          <span className="text-xs text-[#8E9FA5] block">Prompt + Band 8.5 Model</span>
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

      {/* Generator Prompt Form */}
      <form onSubmit={handleGenerate} className="p-6 rounded-2xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B] shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#59656D] dark:text-[#8E9FA5]">
            {lang === 'bn' ? 'টপিক বা বিষয়বস্তু' : 'Topic or Subject'}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              activeGenType === 'reading'
                ? 'e.g. Artificial Intelligence in Marine Biology'
                : activeGenType === 'listening'
                ? 'e.g. University Accommodation Inquiry'
                : activeGenType === 'writing'
                ? 'e.g. Impact of Social Media on Child Psychology'
                : 'e.g. A memorable public speaking experience'
            }
            disabled={generating}
            className="w-full p-3.5 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-[#FAF8F5]/50 dark:bg-[#101A1E] text-[#1A252C] dark:text-[#EDE8DF] text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4C5C]"
          />
        </div>

        {/* Dynamic sub-options based on type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {activeGenType === 'reading' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#59656D] dark:text-[#8E9FA5]">
                {lang === 'bn' ? 'কাঠিন্যের মাত্রা' : 'Difficulty Level'}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#101A1E] text-xs font-semibold"
              >
                <option value="easy">Easy (Band 5.5 - 6.0)</option>
                <option value="medium">Medium (Band 6.5 - 7.5)</option>
                <option value="hard">Hard (Band 8.0 - 9.0)</option>
              </select>
            </div>
          )}

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

      {/* Messages */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-xs sm:text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p>{successMsg}</p>
        </div>
      )}

      {/* ============================================================
          DRAFT PREVIEW & PUBLISH CONTROLS
          ============================================================ */}

      {/* 1. Reading Draft Preview */}
      {readingDraft && activeGenType === 'reading' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#142024] border border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30 shadow-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE5DB] dark:border-[#23353B] pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#0F4C5C]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                Draft Preview
              </span>
              <h3 className="text-xl font-bold font-heading text-[#0F2E35] dark:text-[#F3EFE6] mt-1">
                {readingDraft.title}
              </h3>
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

          <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-72 overflow-y-auto">
            {readingDraft.passage}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-sm text-[#0F2E35] dark:text-[#F3EFE6]">
              Generated Questions ({readingDraft.questions?.length})
            </h4>

            <div className="space-y-3">
              {readingDraft.questions?.map((q: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">Q{q.order}. {q.prompt}</span>
                    <span className="uppercase text-[10px] font-bold text-[#8E9FA5]">{q.type}</span>
                  </div>

                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <span>Correct Answer:</span>
                    <span>{q.correctAnswer}</span>
                  </div>

                  <blockquote className="text-[11px] italic text-[#59656D] dark:text-[#8E9FA5] pl-2 border-l-2 border-[#0F4C5C] dark:border-[#2DD4BF]">
                    &ldquo;{q.evidenceQuote}&rdquo;
                  </blockquote>

                  <p className="text-[11px] text-[#59656D] dark:text-[#EDE8DF]">
                    <span className="font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">বাংলা ব্যাখ্যা:</span> {q.explanationBn}
                  </p>
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
