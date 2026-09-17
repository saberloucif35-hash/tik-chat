import React, { useState, useEffect } from 'react';
import { X, Trophy, Sparkles, Clock, CheckCircle2, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { TriviaQuestion } from '../../types';
import { sounds } from '../../utils/audioEffects';

interface TriviaQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnnounceInRoom: (message: string) => void;
}

export const TriviaQuizModal: React.FC<TriviaQuizModalProps> = ({
  isOpen,
  onClose,
  onAnnounceInRoom,
}) => {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(15);

  const fetchQuestion = async () => {
    setLoading(true);
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(15);

    try {
      const res = await fetch('/api/gemini/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'ثقافة عامة وألعاب', difficulty: 'متوسطة' }),
      });
      const data = await res.json();
      setQuestion(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !question) {
      fetchQuestion();
    }
  }, [isOpen]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isAnswered || loading || !question) return;
    if (timeLeft <= 0) {
      handleSelectOption(-1);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isAnswered, timeLeft, loading, question]);

  if (!isOpen) return null;

  const handleSelectOption = (idx: number) => {
    if (isAnswered || !question) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    if (idx === question.correctIndex) {
      sounds.playVictory();
      setScore((s) => s + 50);
      onAnnounceInRoom(`💡 إجابة صحيحة في مسابقة يلا الذكية! حصل على +50 نقطة!`);
    } else {
      sounds.playWarningBuzzer();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-lg shadow">
              💡
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                تحدي العباقرة والمسابقات <span className="text-xs text-amber-400 font-bold">(Gemini Trivia)</span>
              </h3>
              <p className="text-xs text-slate-400">أسئلة ذكاء خفيفة وسريعة مولدة فورياً بواسطة الذكاء الاصطناعي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score & Timer Bar */}
        <div className="my-3 flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>مجموع النقاط: {score}</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Clock className="w-4 h-4 text-rose-400" />
            <span>المتبقي: {timeLeft} ثانية</span>
          </div>
        </div>

        {/* Question Area */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Sparkles className="w-7 h-7 text-amber-400 animate-spin" />
            <p className="text-xs font-bold">يقوم عقل Gemini بإعداد السؤال التالي...</p>
          </div>
        ) : question ? (
          <div className="my-2">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 mb-4">
              <span className="inline-block text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md mb-2">
                {question.categoryAr}
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {question.question}
              </h4>
            </div>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {question.options.map((opt, idx) => {
                let btnStyle = 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200';
                if (isAnswered) {
                  if (idx === question.correctIndex) {
                    btnStyle = 'bg-emerald-600 border-emerald-500 text-white font-bold ring-2 ring-emerald-400/40';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-600 border-rose-500 text-white font-bold';
                  } else {
                    btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    id={`trivia-opt-${idx}`}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswered}
                    className={`p-3 rounded-xl border text-xs text-right transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && idx === question.correctIndex && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    )}
                    {isAnswered && idx === selectedOption && idx !== question.correctIndex && (
                      <XCircle className="w-4 h-4 text-rose-300" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after answer */}
            {isAnswered && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl mb-4 text-xs text-indigo-200">
                <span className="font-bold block mb-1">💡 معلومة إضافية:</span>
                {question.explanationAr}
              </div>
            )}
          </div>
        ) : null}

        {/* Footer Action */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={fetchQuestion}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>السؤال التالي</span>
          </button>
        </div>

      </div>
    </div>
  );
};
