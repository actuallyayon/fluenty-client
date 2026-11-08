'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { useLanguage } from '@/lib/language-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
  XCircle,
  Bookmark,
  ChevronLeft,
  Award,
  Flame,
  ArrowRight,
  Headphones,
  FileText,
  Sparkles,
  HelpCircle,
  Quote,
  Compass,
  Navigation,
  MapPin,
  Mic,
  Users,
} from 'lucide-react';

interface DialogueTurn {
  speaker: string;
  text: string;
  gender: 'male' | 'female' | 'neutral';
}

const LONDON_BRIDGE_SVG = `<svg viewBox="0 0 650 380" className="w-full max-w-xl h-auto rounded-xl shadow-xs" xmlns="http://www.w3.org/2000/svg">
  <rect width="650" height="380" fill="#F0F4F1" rx="16" />
  
  <!-- River Thames -->
  <path d="M 0 160 C 180 130 350 210 650 170 L 650 250 C 350 290 180 210 0 240 Z" fill="#BAE6FD" stroke="#38BDF8" stroke-width="2" />
  <text x="320" y="215" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284C7" letter-spacing="3">RIVER THAMES</text>
  
  <!-- Bridges -->
  <rect x="230" y="130" width="45" height="135" rx="4" fill="#94A3B8" stroke="#475569" stroke-width="2" />
  <text x="252" y="200" text-anchor="middle" font-size="10" font-weight="bold" fill="#0F172A" transform="rotate(-90 252 200)">LONDON BRIDGE</text>
  
  <!-- Footpaths / Roads -->
  <path d="M 50 330 L 252 265 L 580 330" fill="none" stroke="#D1B894" stroke-width="16" stroke-linecap="round" />
  <path d="M 252 130 L 252 40 L 480 40" fill="none" stroke="#D1B894" stroke-width="16" stroke-linecap="round" />
  <path d="M 252 265 L 252 360" fill="none" stroke="#D1B894" stroke-width="16" stroke-linecap="round" />

  <!-- Meeting Point -->
  <rect x="210" y="340" width="85" height="30" rx="6" fill="#0F4C5C" />
  <text x="252" y="359" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">START HERE</text>

  <!-- Compass Rose -->
  <g transform="translate(580, 60)">
    <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#0F4C5C" stroke-width="2" />
    <polygon points="0,-22 5,-5 0,0 -5,-5" fill="#EF4444" />
    <polygon points="0,22 5,5 0,0 -5,5" fill="#64748B" />
    <polygon points="22,0 5,5 0,0 5,-5" fill="#64748B" />
    <polygon points="-22,0 -5,5 0,0 -5,-5" fill="#64748B" />
    <text x="0" y="-12" text-anchor="middle" font-size="9" font-weight="bold" fill="#B91C1C">N</text>
    <text x="0" y="20" text-anchor="middle" font-size="9" font-weight="bold" fill="#334155">S</text>
    <text x="17" y="3" text-anchor="middle" font-size="9" font-weight="bold" fill="#334155">E</text>
    <text x="-17" y="3" text-anchor="middle" font-size="9" font-weight="bold" fill="#334155">W</text>
  </g>

  <!-- Location Markers -->
  <!-- A: Southwark Cathedral (South West) -->
  <g transform="translate(130, 290)">
    <circle cx="0" cy="0" r="16" fill="#0F4C5C" />
    <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">A</text>
  </g>

  <!-- B: Borough Market (South, further West) -->
  <g transform="translate(80, 340)">
    <circle cx="0" cy="0" r="16" fill="#0F4C5C" />
    <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">B</text>
  </g>

  <!-- C: The Shard (South East) -->
  <g transform="translate(420, 310)">
    <circle cx="0" cy="0" r="16" fill="#0F4C5C" />
    <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">C</text>
  </g>

  <!-- D: The Monument (North East) -->
  <g transform="translate(360, 60)">
    <circle cx="0" cy="0" r="16" fill="#0F4C5C" />
    <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">D</text>
  </g>

  <!-- E: Old St. Magnus Church (North Bank, East of bridge) -->
  <g transform="translate(490, 110)">
    <circle cx="0" cy="0" r="16" fill="#0F4C5C" />
    <text x="0" y="5" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">E</text>
  </g>
</svg>`;

const LONDON_BRIDGE_FALLBACK_TRANSCRIPT = `Guide: Good morning and welcome everyone to our London Bridge historical walking tour. Before we begin our walk across the River Thames, please look carefully at the map of the Southwark and City riverside area on your display.
We are currently gathered at the southern approach of London Bridge, marked START HERE at the bottom of the plan. A very common mistake visitors make is confusing London Bridge with the famous twin-towered Tower Bridge situated further downriver. London Bridge is a sleek concrete structure opened in 1973, though crossings have stood here since Roman times.
Now, let me orient you to the key landmarks around us.
First, looking directly to your left—heading west along the south embankment path—you will see Southwark Cathedral at location A. It is one of London's oldest Gothic churches.
If you continue past the cathedral slightly further south-west under the railway arches, you will arrive at Borough Market, marked at location B, renowned for gourmet food and fresh produce.
Now turning towards the south-east, dominating the skyline above the station, stands The Shard at location C—Western Europe's tallest skyscraper.
Next, as we cross London Bridge to the north bank of the Thames, we enter the City of London. Once off the bridge, heading north-east up the pedestrian walkway, you will find the Monument to the Great Fire of London at location D.
Finally, right along the north riverbank immediately east of the bridge stands St. Magnus the Martyr Church at location E, which once served as the medieval gateway to Old London Bridge.`;

const LONDON_BRIDGE_QUESTIONS: QuestionItem[] = [
  {
    id: 'london-q1',
    type: 'map_labelling',
    prompt: 'Label the map below. Choose the correct letter (A-E) for:\nSouthwark Cathedral',
    options: ['A', 'B', 'C', 'D', 'E'],
    order: 1,
  },
  {
    id: 'london-q2',
    type: 'map_labelling',
    prompt: 'Label the map below. Choose the correct letter (A-E) for:\nBorough Market',
    options: ['A', 'B', 'C', 'D', 'E'],
    order: 2,
  },
  {
    id: 'london-q3',
    type: 'map_labelling',
    prompt: 'Label the map below. Choose the correct letter (A-E) for:\nThe Shard',
    options: ['A', 'B', 'C', 'D', 'E'],
    order: 3,
  },
  {
    id: 'london-q4',
    type: 'map_labelling',
    prompt: 'Label the map below. Choose the correct letter (A-E) for:\nThe Monument to the Great Fire',
    options: ['A', 'B', 'C', 'D', 'E'],
    order: 4,
  },
  {
    id: 'london-q5',
    type: 'map_labelling',
    prompt: 'Label the map below. Choose the correct letter (A-E) for:\nSt. Magnus the Martyr Church',
    options: ['A', 'B', 'C', 'D', 'E'],
    order: 5,
  },
];

function parseTranscript(transcript: string): DialogueTurn[] {
  const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);
  const turns: DialogueTurn[] = [];

  for (const line of lines) {
    const match = line.match(/^([A-Za-z0-9\s._'-]+):\s*(.+)$/);
    if (match) {
      const speakerName = match[1].trim();
      const content = match[2].trim();

      let gender: 'male' | 'female' | 'neutral' = 'neutral';
      const lower = speakerName.toLowerCase();
      if (/sarah|woman|female|mrs|miss|ms|emma|anna|lucy|mary|jane|chloe|alice|lisa|kate|girl|mother|daughter/i.test(lower)) {
        gender = 'female';
      } else if (/mark|man|male|mr|dr|john|david|peter|paul|alex|tutor|librarian|boy|father|son|henderson/i.test(lower)) {
        gender = 'male';
      }

      turns.push({
        speaker: speakerName,
        text: content,
        gender,
      });
    } else {
      turns.push({
        speaker: 'Narrator',
        text: line,
        gender: 'neutral',
      });
    }
  }

  // If dialogue has multiple speakers but genders are unassigned, alternate male and female
  const uniqueSpeakers = Array.from(new Set(turns.map((t) => t.speaker)));
  if (uniqueSpeakers.length > 1) {
    const speakerGenderMap = new Map<string, 'male' | 'female'>();
    uniqueSpeakers.forEach((spk, idx) => {
      const existing = turns.find((t) => t.speaker === spk && t.gender !== 'neutral');
      if (existing) {
        speakerGenderMap.set(spk, existing.gender as 'male' | 'female');
      } else {
        speakerGenderMap.set(spk, idx % 2 === 0 ? 'male' : 'female');
      }
    });

    turns.forEach((t) => {
      if (speakerGenderMap.has(t.speaker)) {
        t.gender = speakerGenderMap.get(t.speaker)!;
      }
    });
  }

  return turns;
}

function getVoiceForGender(
  gender: 'male' | 'female' | 'neutral',
  voices: SpeechSynthesisVoice[]
) {
  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
  const pool = englishVoices.length > 0 ? englishVoices : voices;

  const femaleVoices = pool.filter((v) =>
    /female|susan|hazel|zira|samantha|victoria|karen|catherine|fiona|serena/i.test(v.name)
  );
  const maleVoices = pool.filter((v) =>
    /male|george|david|daniel|arthur|oliver|james|richard|alex|fred/i.test(v.name)
  );

  let selectedVoice: SpeechSynthesisVoice | undefined;
  let pitch = 1.0;

  if (gender === 'female') {
    selectedVoice = femaleVoices[0] || pool.find((v) => !maleVoices.includes(v)) || pool[0];
    pitch = 1.18; // Crisp, higher feminine pitch
  } else if (gender === 'male') {
    selectedVoice = maleVoices[0] || pool.find((v) => !femaleVoices.includes(v)) || pool[0];
    pitch = 0.88; // Deep, calm masculine pitch
  } else {
    selectedVoice = pool[0];
    pitch = 1.0;
  }

  return { voice: selectedVoice, pitch };
}

interface QuestionItem {
  id: string;
  type: 'multiple_choice' | 'true_false_not_given' | 'fill_in_the_blank' | 'matching_headings' | 'map_labelling';
  prompt: string;
  options?: string[];
  order: number;
  mapTitle?: string;
  mapSvgData?: string;
}

interface ListeningDetail {
  id: string;
  title: string;
  audioUrl: string;
  section: number;
  transcript?: string;
  hasMap?: boolean;
  mapTitle?: string;
  mapSvgData?: string;
}

interface EvaluationResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanationBn: string;
  explanationEn: string;
  evidenceQuote?: string;
  prompt: string;
  type: string;
  order: number;
}

interface SubmissionResponse {
  attemptId: string;
  practiceType: 'listening';
  listeningItemId: string;
  title: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  xpEarned: number;
  totalXp: number;
  dailyStreak: number;
  timeSpentSeconds: number;
  results: EvaluationResult[];
  transcript?: string;
}

function ListeningTestRunner() {
  const params = useParams();
  const router = useRouter();
  const itemId = params?.id as string;
  const { t, lang } = useLanguage();
  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ListeningDetail | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechIntervalRef = useRef<any>(null);
  const dialogueTimeoutRef = useRef<any>(null);
  const isPlayingRef = useRef(false);
  const currentTurnIndexRef = useRef(0);

  const [isAiSpeechMode, setIsAiSpeechMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Submission & Results
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResponse | null>(null);
  const [explanationLangs, setExplanationLangs] = useState<Record<string, 'bn' | 'en'>>({});
  const [aiExplanations, setAiExplanations] = useState<
    Record<string, { loading: boolean; text?: string; evidence?: string; error?: string }>
  >({});
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (itemId && session?.user) {
      fetch(`/api/practice/listening/items/${itemId}?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.item) {
            const rawItem = { ...data.item };
            const isLondon =
              rawItem.title?.toLowerCase().includes('london bridge') ||
              String(itemId).includes('6af02edf') ||
              String(itemId).includes('6af036e0');

            if (isLondon || rawItem.hasMap || rawItem.section === 2) {
              rawItem.hasMap = true;
              if (!rawItem.transcript || rawItem.transcript.length < 50) {
                rawItem.transcript = LONDON_BRIDGE_FALLBACK_TRANSCRIPT;
              }
              if (!rawItem.mapSvgData) {
                rawItem.mapSvgData = LONDON_BRIDGE_SVG;
              }
              if (!rawItem.mapTitle) {
                rawItem.mapTitle = 'London Bridge & Riverside Historical Walking Map';
              }
            }

            setItem(rawItem);

            let qs = data.questions || [];
            if (isLondon && (qs.length === 0 || !qs.some((q: any) => q.type === 'map_labelling'))) {
              qs = LONDON_BRIDGE_QUESTIONS;
            }
            setQuestions(qs);
          }
        })
        .catch((err) => console.error('Failed to load listening item:', err))
        .finally(() => setLoading(false));

      // Fetch bookmarks
      fetch('/api/learning/bookmarks', {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.bookmarks) {
            const questionBm = new Set<string>(
              data.bookmarks.questions?.map((q: any) => q.id) || []
            );
            setBookmarkedIds(questionBm);
          }
        })
        .catch((err) => console.error('Failed to fetch bookmarks:', err));
    }
  }, [itemId, session, isPending, router]);

  // Detect AI speech synthesis mode or fallback
  useEffect(() => {
    if (item?.audioUrl && (item.audioUrl.startsWith('ai-speech://') || !item.audioUrl.startsWith('http'))) {
      setIsAiSpeechMode(true);
      const textToCount =
        item.transcript && item.transcript.length > 50
          ? item.transcript
          : item.title?.toLowerCase().includes('london bridge')
          ? LONDON_BRIDGE_FALLBACK_TRANSCRIPT
          : item.transcript || item.title;
      if (textToCount) {
        const words = textToCount.split(/\s+/).length;
        setDuration(Math.max(60, Math.round(words / 2.3)));
      }
    }
  }, [item]);

  // Audio element listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !item || isAiSpeechMode) return;

    // Force load when item or audioUrl changes
    audio.load();

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onCanPlay = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = (e: Event) => {
      console.warn('Audio playback/load error, falling back to AI voice:', e);
      if (item.transcript) {
        setIsAiSpeechMode(true);
      }
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // If metadata was already cached by browser
    if (audio.readyState >= 1 && audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [item, isAiSpeechMode]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
      if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
    };
  }, []);

  const togglePlay = async () => {
    // If AI Speech synthesis mode (free IELTS resource / no MP3 file needed)
    if (isAiSpeechMode || (item && item.audioUrl?.startsWith('ai-speech://'))) {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        alert('Browser speech synthesis is not supported in this browser.');
        return;
      }

      if (isPlaying) {
        window.speechSynthesis.cancel();
        if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
        if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setActiveSpeaker(null);
      } else {
        window.speechSynthesis.cancel();
        if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
        if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);

        const isLondon =
          item?.title?.toLowerCase().includes('london bridge') ||
          String(item?.id).includes('6af02edf') ||
          String(item?.id).includes('6af036e0');

        const transcriptText =
          item?.transcript && item.transcript.length > 50
            ? item.transcript
            : isLondon
            ? LONDON_BRIDGE_FALLBACK_TRANSCRIPT
            : item?.transcript || item?.title || 'This is the listening test audio.';

        const turns = parseTranscript(transcriptText);
        const voices = window.speechSynthesis.getVoices();

        isPlayingRef.current = true;
        setIsPlaying(true);

        // Multi-speaker dialogue player (Alternates Male & Female voices)
        const playTurn = (index: number) => {
          if (!isPlayingRef.current || index >= turns.length) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            setActiveSpeaker(null);
            setCurrentTime(0);
            currentTurnIndexRef.current = 0;
            if (speechIntervalRef.current) clearInterval(speechIntervalRef.current);
            return;
          }

          currentTurnIndexRef.current = index;
          const turn = turns[index];
          const genderLabel = turn.gender === 'female' ? 'Female Voice' : 'Male Voice';
          setActiveSpeaker(`${turn.speaker} (${genderLabel})`);

          const utter = new SpeechSynthesisUtterance(turn.text);
          const { voice, pitch } = getVoiceForGender(turn.gender, voices);
          if (voice) utter.voice = voice;
          utter.pitch = pitch;
          utter.rate = playbackRate;
          synthUtteranceRef.current = utter;

          utter.onend = () => {
            if (!isPlayingRef.current) return;
            // Realistic 320ms conversational gap between speakers
            dialogueTimeoutRef.current = setTimeout(() => {
              playTurn(index + 1);
            }, 320);
          };

          utter.onerror = (err) => {
            console.warn('Utterance playback error:', err);
            if (!isPlayingRef.current) return;
            dialogueTimeoutRef.current = setTimeout(() => {
              playTurn(index + 1);
            }, 200);
          };

          window.speechSynthesis.speak(utter);
        };

        playTurn(currentTurnIndexRef.current || 0);

        speechIntervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            if (duration > 0 && prev >= duration) {
              return prev;
            }
            return prev + 1;
          });
        }, 1000);
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Audio play error, falling back to speech synthesis:', e);
        if (item?.transcript) {
          setIsAiSpeechMode(true);
          setTimeout(() => togglePlay(), 50);
        } else {
          setIsPlaying(false);
        }
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    setCurrentTime(targetTime);
    if (!isAiSpeechMode && audioRef.current) {
      audioRef.current.currentTime = targetTime;
    } else if (isAiSpeechMode && item?.transcript && duration > 0) {
      const turns = parseTranscript(item.transcript);
      if (turns.length > 0) {
        const ratio = Math.min(1, Math.max(0, targetTime / duration));
        const targetTurn = Math.min(turns.length - 1, Math.floor(ratio * turns.length));
        currentTurnIndexRef.current = targetTurn;
        if (isPlaying) {
          window.speechSynthesis.cancel();
          if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
          togglePlay();
        }
      }
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    if (isAiSpeechMode && isPlaying) {
      window.speechSynthesis.cancel();
      if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
      togglePlay();
    }
  };

  const toggleMute = () => {
    if (isAiSpeechMode) {
      if (!isMuted) {
        window.speechSynthesis.cancel();
        if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setActiveSpeaker(null);
      }
      setIsMuted(!isMuted);
      return;
    }
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleToggleBookmark = async (questionId: string) => {
    try {
      const res = await fetch('/api/learning/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itemType: 'question', itemId: questionId }),
      });
      const data = await res.json();
      if (data.success) {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          if (data.bookmarked) next.add(questionId);
          else next.delete(questionId);
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleSubmit = async () => {
    if (!item) return;
    setSubmitting(true);
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }

    try {
      const formattedAnswers = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers[q.id] || '',
      }));

      const timeSpentSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));

      const res = await fetch(
        `/api/practice/listening/items/${item.id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            answers: formattedAnswers,
            timeSpentSeconds,
          }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setSubmissionResult(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to submit listening attempt:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExplanationLanguage = (questionId: string) => {
    setExplanationLangs((prev) => ({
      ...prev,
      [questionId]: prev[questionId] === 'en' ? 'bn' : 'en',
    }));
  };

  const handleRequestAiExplanation = async (
    questionId: string,
    wrongAnswer: string,
    questionPrompt: string,
    correctAnswer: string
  ) => {
    setAiExplanations((prev) => ({
      ...prev,
      [questionId]: { loading: true },
    }));

    try {
      const res = await fetch(
        '/api/ai/explain',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            questionId,
            wrongAnswer: wrongAnswer || '(Blank / unanswered)',
            language: lang === 'bn' ? 'bn' : 'en',
            questionPrompt,
            correctAnswer,
            passageOrTranscript: submissionResult?.transcript || item?.transcript || '',
          }),
        }
      );

      const data = await res.json();
      if (data.success && data.explanation) {
        setAiExplanations((prev) => ({
          ...prev,
          [questionId]: {
            loading: false,
            text: lang === 'bn' ? data.explanation.explanationBn : data.explanation.explanationEn,
            evidence: data.explanation.evidenceQuote,
          },
        }));
      } else {
        setAiExplanations((prev) => ({
          ...prev,
          [questionId]: {
            loading: false,
            error: data.message || 'Failed to fetch AI explanation',
          },
        }));
      }
    } catch (err: any) {
      setAiExplanations((prev) => ({
        ...prev,
        [questionId]: {
          loading: false,
          error: err.message || 'Connection error',
        },
      }));
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
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

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF]">
        <Navbar />
        <main className="flex-1 max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-center space-y-4">
          <h2 className="text-xl font-bold font-heading">
            {lang === 'bn' ? 'লিসেনিং টেস্ট পাওয়া যায়নি' : 'Listening Item Not Found'}
          </h2>
          <Link href="/listening" className="btn-primary-teal text-sm py-2 px-4">
            {lang === 'bn' ? 'লিসেনিং তালিকায় ফিরে যান' : 'Back to Listening Directory'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0E1619] text-[#1A252C] dark:text-[#EDE8DF] transition-colors duration-200">
      <Navbar />

      {/* Hidden Native Audio Element */}
      {!isAiSpeechMode && item.audioUrl && !item.audioUrl.startsWith('ai-speech://') && (
        <audio ref={audioRef} src={item.audioUrl} preload="auto" />
      )}

      {/* Sticky Custom Audio Player Bar */}
      <div className="sticky top-18 z-40 bg-[#FBF9F5]/95 dark:bg-[#0E1619]/95 backdrop-blur-md border-b border-[#EAE5DB] dark:border-[#23353B] py-3.5 px-4 sm:px-6 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
            <Link
              href="/listening"
              className="p-1.5 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C] hover:bg-[#EAE5DB]/50 dark:hover:bg-[#1C2D33] text-[#59656D] dark:text-[#8E9FA5]"
              title="Back"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#D96B27] dark:text-[#FB923C] block">
                  IELTS Section {item.section} Audio
                </span>
                {(item.section === 1 || item.section === 3) ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    <Users className="w-3 h-3" />
                    <span>Multi-Voice Dialogue (Male & Female)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <Sparkles className="w-3 h-3" />
                    <span>Solo Monologue Voice</span>
                  </span>
                )}
                {activeSpeaker && isPlaying && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800 animate-pulse">
                    <Mic className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    <span>Speaking: {activeSpeaker}</span>
                  </span>
                )}
              </div>
              <h1 className="font-heading font-bold text-sm sm:text-base text-[#0F2E35] dark:text-[#F3EFE6] truncate max-w-xs sm:max-w-md">
                {item.title}
              </h1>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0E1619] flex items-center justify-center hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              aria-label={isPlaying ? 'Pause Audio' : 'Play Audio'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>

            {/* Time & Scrub Bar */}
            <div className="flex items-center gap-2 flex-1 sm:w-60">
              <span className="text-xs font-mono text-[#59656D] dark:text-[#8E9FA5] w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-[#D4CDBC] dark:bg-[#2F454C] rounded-lg appearance-none cursor-pointer accent-[#0F4C5C] dark:accent-[#2DD4BF]"
              />
              <span className="text-xs font-mono text-[#59656D] dark:text-[#8E9FA5] w-10">
                {formatTime(duration)}
              </span>
            </div>

            {/* Speed Options */}
            <div className="hidden md:flex items-center gap-1 border border-[#D4CDBC] dark:border-[#2F454C] rounded-lg p-0.5 text-xs font-bold bg-white dark:bg-[#142024]">
              {[0.75, 1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  type="button"
                  onClick={() => changeSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    playbackRate === speed
                      ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0E1619]'
                      : 'text-[#59656D] dark:text-[#8E9FA5] hover:text-[#1A252C] dark:hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Mute button */}
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-lg border border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C] dark:hover:text-[#2DD4BF]"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Results Banner when finished */}
        {submissionResult && (
          <div className="bg-[#0F4C5C] dark:bg-[#123837] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#0A3642] dark:border-[#1E6E64] relative overflow-hidden animate-fade-in space-y-6">
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-xs rounded-lg text-xs font-bold tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4BF]" />
                  <span>{lang === 'bn' ? 'লিসেনিং টেস্ট সম্পন্ন হয়েছে' : 'Listening Test Completed'}</span>
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  {lang === 'bn' ? 'ফলাফল ও স্কোর সামারি' : 'Score Summary'}
                </h2>
                <p className="text-white/80 text-sm max-w-xl">
                  {lang === 'bn'
                    ? `আপনি ${submissionResult.totalQuestions} টির মধ্যে ${submissionResult.score} টি সঠিক উত্তর দিয়েছেন (${submissionResult.percentage}%)। নিচে অডিওর সম্পূর্ণ ট্রান্সক্রিপ্ট ও প্রতিটি উত্তরের বিস্তারিত বাংলা ব্যাখ্যা দেওয়া হলো।`
                    : `You answered ${submissionResult.score} of ${submissionResult.totalQuestions} questions correctly (${submissionResult.percentage}%). Full transcript and explanation are revealed below.`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1 text-[#FDE68A] font-bold text-xl font-heading">
                    <Award className="w-5 h-5" />
                    <span>+{submissionResult.xpEarned}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-white/70">XP Earned</div>
                </div>

                <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[90px]">
                  <div className="flex items-center justify-center gap-1 text-[#FDE68A] font-bold text-xl font-heading">
                    <Flame className="w-5 h-5 fill-[#FDE68A]" />
                    <span>{submissionResult.dailyStreak}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-white/70">Day Streak</div>
                </div>

                <Link
                  href="/mistakes?practiceType=listening"
                  className="bg-white hover:bg-[#F4EFE6] text-[#0F4C5C] font-bold text-xs px-4 py-3 rounded-2xl transition-colors text-center"
                >
                  <span>{lang === 'bn' ? 'মিস্টেক নোটবুক' : 'Mistake Notebook'}</span>
                </Link>
              </div>
            </div>

            {/* Revealed Full Transcript after submission */}
            {submissionResult.transcript && (
              <div className="pt-4 border-t border-white/15 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FDE68A] uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>{t('transcriptLabel')}</span>
                </div>
                <div className="bg-black/20 rounded-2xl p-4 sm:p-5 text-sm text-white/90 leading-relaxed font-sans whitespace-pre-line border border-white/10 max-h-80 overflow-y-auto select-text">
                  {submissionResult.transcript}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Questions Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-xl text-[#0F2E35] dark:text-[#F3EFE6] flex items-center gap-2">
              <Headphones className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
              <span>
                {submissionResult
                  ? (lang === 'bn' ? 'লিসেনিং প্রশ্নের বিস্তারিত বিশ্লেষণ' : 'Question Feedback & Evidence')
                  : (lang === 'bn' ? 'অডিও শুনে প্রশ্নের উত্তর দিন' : 'Questions: Listen & Answer')}
              </span>
            </h2>

            <span className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5]">
              {questions.length} {lang === 'bn' ? 'টি প্রশ্ন' : 'Questions'}
            </span>
          </div>

          {/* Visual Map / Plan Direction Diagram (For Map Labelling Tests) */}
          {(item.hasMap || questions.some((q) => q.type === 'map_labelling')) && (
            <div className="bg-white dark:bg-[#142024] rounded-3xl border border-[#D4CDBC] dark:border-[#2F454C] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE5DB] dark:border-[#23353B] pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#0F4C5C]/10 dark:bg-[#2DD4BF]/10 text-[#0F4C5C] dark:text-[#2DD4BF]">
                    <Compass className="w-5 h-5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D96B27] dark:text-[#FB923C] block">
                      IELTS Section 2 Map & Plan Direction
                    </span>
                    <h3 className="font-heading font-bold text-sm sm:text-base text-[#0F2E35] dark:text-[#F3EFE6]">
                      {item.mapTitle || 'Map & Facility Direction Plan'}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27]">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'দিকনির্দেশনা শুনুন (উত্তর, দক্ষিণ, পূর্ব, পশ্চিম)' : 'Listen for Compass Directions (N, S, E, W)'}</span>
                  </span>
                </div>
              </div>

              {/* Map Canvas / Diagram Render */}
              <div className="relative rounded-2xl overflow-hidden border border-[#D4CDBC] dark:border-[#2F454C] bg-[#F7F4EE] dark:bg-[#0E1619] p-4 flex flex-col items-center justify-center">
                {item.mapSvgData ? (
                  <div
                    className="w-full max-w-2xl overflow-x-auto flex justify-center [&>svg]:w-full [&>svg]:max-w-xl [&>svg]:h-auto [&>svg]:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: item.mapSvgData }}
                  />
                ) : (
                  <svg viewBox="0 0 600 360" className="w-full max-w-xl h-auto rounded-xl shadow-xs" xmlns="http://www.w3.org/2000/svg">
                    <rect width="600" height="360" fill="#E8F1EC" rx="16" />
                    <path d="M 50 330 Q 150 200 300 200 T 550 80" fill="none" stroke="#D1B894" strokeWidth="22" strokeLinecap="round" />
                    <path d="M 300 200 L 300 60" fill="none" stroke="#D1B894" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 300 200 L 450 300" fill="none" stroke="#D1B894" strokeWidth="18" strokeLinecap="round" />
                    <path d="M 120 220 L 80 100" fill="none" stroke="#D1B894" strokeWidth="16" strokeLinecap="round" />
                    <ellipse cx="440" cy="140" rx="65" ry="40" fill="#BAE6FD" stroke="#38BDF8" strokeWidth="3" />
                    <text x="440" y="145" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0369A1">Ornamental Pond</text>
                    <rect x="20" y="310" width="80" height="30" rx="6" fill="#0F4C5C" />
                    <text x="60" y="329" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ffffff">ENTRANCE</text>
                    <g transform="translate(540, 50)">
                      <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#0F4C5C" strokeWidth="2" />
                      <polygon points="0,-22 5,-5 0,0 -5,-5" fill="#EF4444" />
                      <polygon points="0,22 5,5 0,0 -5,5" fill="#64748B" />
                      <polygon points="22,0 5,5 0,0 5,-5" fill="#64748B" />
                      <polygon points="-22,0 -5,5 0,0 -5,-5" fill="#64748B" />
                      <text x="0" y="-12" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#B91C1C">N</text>
                      <text x="0" y="20" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">S</text>
                      <text x="17" y="3" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">E</text>
                      <text x="-17" y="3" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155">W</text>
                    </g>
                    <g transform="translate(90, 85)"><circle cx="0" cy="0" r="16" fill="#0F4C5C" /><text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">A</text></g>
                    <g transform="translate(230, 130)"><circle cx="0" cy="0" r="16" fill="#0F4C5C" /><text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">B</text></g>
                    <g transform="translate(300, 50)"><circle cx="0" cy="0" r="16" fill="#0F4C5C" /><text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">C</text></g>
                    <g transform="translate(390, 240)"><circle cx="0" cy="0" r="16" fill="#0F4C5C" /><text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">D</text></g>
                    <g transform="translate(500, 290)"><circle cx="0" cy="0" r="16" fill="#0F4C5C" /><text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#ffffff">E</text></g>
                  </svg>
                )}
              </div>
            </div>
          )}

          {/* Question Cards */}
          <div className="space-y-5">
            {questions.map((q, idx) => {
              const evalItem = submissionResult?.results.find((r) => r.questionId === q.id);
              const isBookmarked = bookmarkedIds.has(q.id);
              const currentAnswer = answers[q.id] || '';
              const explLang = explanationLangs[q.id] || 'bn';

              return (
                <div
                  key={q.id}
                  className={`bg-white dark:bg-[#142024] rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-4 ${
                    evalItem
                      ? evalItem.isCorrect
                        ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10'
                        : 'border-rose-300 dark:border-rose-800/60 bg-rose-50/20 dark:bg-rose-950/10'
                      : 'border-[#D4CDBC] dark:border-[#2F454C]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27] dark:text-[#FB923C] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#59656D] dark:text-[#8E9FA5]">
                        {q.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {evalItem && (
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            evalItem.isCorrect
                              ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {evalItem.isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Correct (+15 XP)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Incorrect</span>
                            </>
                          )}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'border-[#D96B27] bg-[#FAF2EB] dark:bg-[#351B0F] text-[#D96B27]'
                            : 'border-[#D4CDBC] dark:border-[#2F454C] text-[#59656D] dark:text-[#8E9FA5] hover:text-[#0F4C5C]'
                        }`}
                        title="Bookmark Question"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <p className="font-heading font-semibold text-sm sm:text-base text-[#0F2E35] dark:text-[#F3EFE6] leading-relaxed whitespace-pre-line">
                    {q.prompt}
                  </p>

                  {/* Inputs */}
                  {!submissionResult ? (
                    <div className="pt-2">
                      {q.type === 'multiple_choice' && q.options && (
                        <div className="space-y-3">
                          {q.options.map((opt, oIdx) => {
                            const letter = String.fromCharCode(65 + oIdx);
                            const isSelected = currentAnswer === opt;
                            return (
                              <label
                                key={oIdx}
                                className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border text-sm sm:text-base cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-[#0F4C5C]/5 dark:bg-[#2DD4BF]/10 font-semibold text-[#0F4C5C] dark:text-[#2DD4BF] shadow-xs ring-2 ring-[#0F4C5C]/20 dark:ring-[#2DD4BF]/20 scale-[1.01]'
                                    : 'border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] hover:bg-[#FAF8F5] dark:hover:bg-[#1C2D33] text-[#1A252C] dark:text-[#EDE8DF]'
                                }`}
                              >
                                <span
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors ${
                                    isSelected
                                      ? 'bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0E1619]'
                                      : 'bg-[#FAF2EB] dark:bg-[#23353B] text-[#D96B27] dark:text-[#FB923C]'
                                  }`}
                                >
                                  {letter}
                                </span>
                                <input
                                  type="radio"
                                  name={`listening-q-${q.id}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                  className="sr-only"
                                />
                                <span className="flex-1 leading-snug">{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'true_false_not_given' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {['True', 'False', 'Not Given'].map((val, vIdx) => {
                            const isSelected = currentAnswer.toLowerCase() === val.toLowerCase();
                            const letter = ['A', 'B', 'C'][vIdx];
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleAnswerChange(q.id, val)}
                                className={`py-3 px-4 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-xs ${
                                  isSelected
                                    ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0E1619] shadow-md ring-2 ring-[#0F4C5C]/20 dark:ring-[#2DD4BF]/20 scale-[1.02]'
                                    : 'border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] hover:bg-[#FAF8F5] dark:hover:bg-[#1C2D33] text-[#1A252C] dark:text-[#EDE8DF]'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                                    isSelected
                                      ? 'bg-white/20 text-white dark:text-[#0E1619]'
                                      : 'bg-[#FAF2EB] dark:bg-[#23353B] text-[#D96B27] dark:text-[#FB923C]'
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span>{val}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {q.type === 'fill_in_the_blank' && (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            placeholder={lang === 'bn' ? 'অডিও থেকে শোনা সঠিক শব্দটি লিখুন...' : 'Type word heard from audio...'}
                            className="w-full px-4 py-3 rounded-2xl border border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] text-sm text-[#1A252C] dark:text-[#EDE8DF] focus:outline-hidden focus:border-[#0F4C5C] dark:focus:border-[#2DD4BF]"
                          />
                        </div>
                      )}

                      {q.type === 'map_labelling' && (
                        <div className="space-y-2.5 pt-1">
                          <div className="text-xs font-semibold text-[#59656D] dark:text-[#8E9FA5] flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2DD4BF]" />
                            <span>{lang === 'bn' ? 'মানচিত্রের সঠিক অক্ষরটি নির্বাচন করুন:' : 'Select location letter on map:'}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((letter) => {
                              const isSelected = currentAnswer.toUpperCase() === letter;
                              return (
                                <button
                                  key={letter}
                                  type="button"
                                  onClick={() => handleAnswerChange(q.id, letter)}
                                  className={`min-w-[54px] sm:min-w-[62px] h-12 px-4 rounded-xl border text-base font-bold transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                                    isSelected
                                      ? 'border-[#0F4C5C] dark:border-[#2DD4BF] bg-[#0F4C5C] dark:bg-[#2DD4BF] text-white dark:text-[#0E1619] shadow-sm ring-2 ring-[#0F4C5C]/30 scale-105'
                                      : 'border-[#D4CDBC] dark:border-[#2F454C] bg-white dark:bg-[#142024] hover:bg-[#F4EFE6] dark:hover:bg-[#1C2D33] text-[#1A252C] dark:text-[#EDE8DF] hover:border-[#0F4C5C]/40'
                                  }`}
                                >
                                  {letter}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Post-Submission Feedback */
                    evalItem && (
                      <div className="pt-2 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B]">
                            <span className="text-[11px] font-bold text-[#59656D] dark:text-[#8E9FA5] block mb-1">
                              {t('yourAnswer')}:
                            </span>
                            <span
                              className={`font-semibold ${
                                evalItem.isCorrect
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {evalItem.userAnswer || '(Blank)'}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white dark:bg-[#142024] border border-[#EAE5DB] dark:border-[#23353B]">
                            <span className="text-[11px] font-bold text-[#59656D] dark:text-[#8E9FA5] block mb-1">
                              {t('correctAnswer')}:
                            </span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {evalItem.correctAnswer}
                            </span>
                          </div>
                        </div>

                        {/* Explanation Card */}
                        <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#101A1E] border border-[#EAE5DB] dark:border-[#23353B] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{t('explanationLabel')}</span>
                            </span>

                            <button
                              type="button"
                              onClick={() => toggleExplanationLanguage(q.id)}
                              className="text-[11px] font-bold text-[#D96B27] dark:text-[#FB923C] hover:underline"
                            >
                              {explLang === 'bn' ? 'In English' : 'বাংলায় দেখুন'}
                            </button>
                          </div>

                          <p className="text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed">
                            {explLang === 'bn' ? evalItem.explanationBn : evalItem.explanationEn}
                          </p>
                        </div>

                        {/* Evidence quote */}
                        {evalItem.evidenceQuote && (
                          <div className="p-3.5 rounded-xl bg-[#FAF2EB]/50 dark:bg-[#351B0F]/30 border border-[#D96B27]/20 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D96B27] dark:text-[#FB923C]">
                              <Quote className="w-3.5 h-3.5" />
                              <span>{t('evidenceLabel')}</span>
                            </div>
                            <blockquote className="text-xs italic text-[#334155] dark:text-[#CBD5E1] pl-2 border-l-2 border-[#D96B27] dark:border-[#FB923C]">
                              &ldquo;{evalItem.evidenceQuote}&rdquo;
                            </blockquote>
                          </div>
                        )}

                        {/* Phase 5 On-Demand Gemini AI Deep Breakdown for Incorrect Answers */}
                        {!evalItem.isCorrect && (
                          <div className="pt-2">
                            {!aiExplanations[q.id]?.text ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleRequestAiExplanation(
                                    q.id,
                                    evalItem.userAnswer,
                                    q.prompt,
                                    evalItem.correctAnswer
                                  )
                                }
                                disabled={aiExplanations[q.id]?.loading}
                                className="w-full py-2.5 px-4 rounded-xl border border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30 bg-[#0F4C5C]/5 dark:bg-[#2DD4BF]/5 text-[#0F4C5C] dark:text-[#2DD4BF] text-xs font-bold hover:bg-[#0F4C5C]/10 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                              >
                                {aiExplanations[q.id]?.loading ? (
                                  <>
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0F4C5C] dark:border-[#2DD4BF] border-t-transparent animate-spin" />
                                    <span>Gemini AI বিশ্লেষণ প্রস্তুত হচ্ছে...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>
                                      {lang === 'bn'
                                        ? 'Gemini AI ডায়াগনস্টিক বিশ্লেষণ (অডিও ট্র্যাপ ও ভুলের কারণ)'
                                        : 'Request Deep Gemini AI Diagnosis'}
                                    </span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0F4C5C]/10 to-[#FAF8F5] dark:to-[#142024] border border-[#0F4C5C]/30 dark:border-[#2DD4BF]/30 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F4C5C] dark:text-[#2DD4BF]">
                                  <Sparkles className="w-4 h-4" />
                                  <span>Gemini AI Deep Diagnostic Analysis</span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#1A252C] dark:text-[#EDE8DF] leading-relaxed">
                                  {aiExplanations[q.id]?.text}
                                </p>
                                {aiExplanations[q.id]?.evidence && (
                                  <p className="text-xs italic text-[#59656D] dark:text-[#8E9FA5] pl-2 border-l-2 border-[#0F4C5C] dark:border-[#2DD4BF]">
                                    &ldquo;{aiExplanations[q.id]?.evidence}&rdquo;
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit / Reset Actions */}
          <div className="pt-4 flex items-center justify-between">
            {!submissionResult ? (
              <>
                <span className="text-xs text-[#59656D] dark:text-[#8E9FA5]">
                  {Object.keys(answers).length} of {questions.length} answered
                </span>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary-teal text-sm py-2.5 px-6 font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? t('submittingTest') : t('submitAnswers')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between">
                <Link
                  href="/listening"
                  className="btn-secondary text-xs sm:text-sm py-2 px-4 font-semibold"
                >
                  <span>{lang === 'bn' ? 'অন্য টেস্ট নির্বাচন করুন' : 'Choose Another Test'}</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setSubmissionResult(null);
                    setAnswers({});
                    if (audioRef.current) {
                      audioRef.current.currentTime = 0;
                    }
                  }}
                  className="btn-primary-teal text-xs sm:text-sm py-2 px-4 flex items-center gap-1.5 font-bold"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('retryPractice')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ListeningTestPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F5] dark:bg-[#0E1619]">
          <div className="w-8 h-8 rounded-lg bg-[#0F4C5C] dark:bg-[#2DD4BF] animate-spin" />
        </div>
      }
    >
      <ListeningTestRunner />
    </Suspense>
  );
}
