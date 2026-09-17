import React, { useState } from 'react';
import { X, Sparkles, Trophy, Play, RotateCcw, HelpCircle, Users } from 'lucide-react';
import { sounds } from '../../utils/audioEffects';

interface LudoGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnnounceInRoom: (message: string) => void;
}

interface Player {
  id: string;
  name: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  score: number;
  tokens: number[]; // positions 0 (base) to 20 (finish)
  isAi?: boolean;
}

export const LudoGameModal: React.FC<LudoGameModalProps> = ({
  isOpen,
  onClose,
  onAnnounceInRoom,
}) => {
  const [diceValue, setDiceValue] = useState<number>(6);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [currentTurn, setCurrentTurn] = useState<number>(0);
  const [aiHint, setAiHint] = useState<string | null>('تلميح تكتيكي: ابدأ بإخراج بيدك إلى نقطة البداية برمية 6 🎯');
  const [isGettingHint, setIsGettingHint] = useState<boolean>(false);
  const [winner, setWinner] = useState<string | null>(null);

  const [players, setPlayers] = useState<Player[]>([
    { id: 'p1', name: 'أنت (فارس)', color: 'red', score: 250, tokens: [5, 12, 0, 0] },
    { id: 'p2', name: 'سلطان (المضيف)', color: 'green', score: 180, tokens: [8, 0, 0, 0] },
    { id: 'p3', name: 'سارة', color: 'yellow', score: 210, tokens: [14, 2, 0, 0] },
    { id: 'p4', name: 'عمر السالم', color: 'blue', score: 320, tokens: [10, 16, 0, 0] },
  ]);

  if (!isOpen) return null;

  // Handle Interactive Dice Roll
  const handleRollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    sounds.playDiceRoll();

    let rollCount = 0;
    const interval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      if (rollCount > 8) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalValue);
        setIsRolling(false);

        // Move a token forward for active player
        setPlayers((prev) => {
          const updated = [...prev];
          const curPlayer = { ...updated[currentTurn] };
          const curTokens = [...curPlayer.tokens];

          // Move the furthest non-finished token
          let moved = false;
          for (let i = 0; i < curTokens.length; i++) {
            if (curTokens[i] < 20) {
              curTokens[i] = Math.min(20, curTokens[i] + finalValue);
              moved = true;
              break;
            }
          }

          if (curTokens.every((t) => t >= 20)) {
            setWinner(curPlayer.name);
            sounds.playVictory();
            onAnnounceInRoom(`🏆 مبروك! فاز ${curPlayer.name} في جولة لودو يلا شات! 🎲`);
          }

          curPlayer.tokens = curTokens;
          curPlayer.score += finalValue * 10;
          updated[currentTurn] = curPlayer;
          return updated;
        });

        // Pass turn to next player if not 6
        if (finalValue !== 6) {
          setCurrentTurn((prev) => (prev + 1) % 4);
        }
      }
    }, 60);
  };

  // Get AI Host Strategy Hint
  const handleAskAiCoach = async () => {
    setIsGettingHint(true);
    try {
      const response = await fetch('/api/gemini/host-interact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: `أنا ألعب لودو الآن ورميت النرد برقم ${diceValue}. ما هي أفضل خطوة استراتيجية في اللعبة الآن؟`,
          senderName: 'فارس',
          senderId: 'user_me',
          activeGame: 'ludo',
          roomTopic: 'بطولة لودو الخليج',
        }),
      });
      const data = await response.json();
      setAiHint(data.reply || 'تلميح: ركّز على حماية بيادقك في المربعات الآمنة وحاصر الخصم!');
    } catch (e) {
      setAiHint('تلميح: تقدم بأسرع بيدك نحو الممر الآمن وتجنب المخاطرة!');
    } finally {
      setIsGettingHint(false);
    }
  };

  const getPlayerColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'bg-rose-500 text-white';
      case 'green': return 'bg-emerald-500 text-white';
      case 'yellow': return 'bg-amber-400 text-slate-900';
      case 'blue': return 'bg-sky-500 text-white';
      default: return 'bg-slate-700 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-xl shadow">
              🎲
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                يلا لودو التفاعلية <span className="text-xs text-amber-400 font-bold">(Yalla Ludo Arena)</span>
              </h3>
              <p className="text-xs text-slate-400">لعبة الطاولة الاجتماعية الكلاسيكية داخل الغرفة الصوتية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Winner Banner */}
        {winner && (
          <div className="my-3 p-3 bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 rounded-xl flex items-center justify-between text-amber-300">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold">تهانينا! الفائز بالجولة: {winner}</span>
            </div>
            <button
              onClick={() => setWinner(null)}
              className="text-xs px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg"
            >
              جولة جديدة
            </button>
          </div>
        )}

        {/* Mini Ludo Board Visualizer */}
        <div className="my-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center">
          
          {/* 4 Player Stations */}
          <div className="grid grid-cols-2 gap-3 w-full mb-3">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  currentTurn === idx
                    ? 'border-amber-400 bg-amber-500/10 ring-2 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${getPlayerColorClass(p.color)}`}>
                    {p.name}
                  </span>
                  <span className="text-[11px] text-amber-400 font-bold">{p.score} نقطة</span>
                </div>

                {/* Tokens Progress Track */}
                <div className="flex items-center gap-1.5">
                  {p.tokens.map((pos, tIdx) => (
                    <div
                      key={tIdx}
                      className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden"
                      title={`البيدق ${tIdx + 1}: خطوة ${pos}/20`}
                    >
                      <div
                        className={`h-full ${getPlayerColorClass(p.color)} transition-all duration-300`}
                        style={{ width: `${(pos / 20) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Dice Display */}
          <div className="my-2 flex flex-col items-center">
            <button
              id="roll-dice-btn"
              onClick={handleRollDice}
              disabled={isRolling}
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black shadow-2xl transition-all ${
                isRolling
                  ? 'animate-spin bg-amber-400 text-slate-950'
                  : 'bg-gradient-to-br from-amber-400 to-rose-500 text-slate-950 hover:scale-105 active:scale-95 shadow-amber-500/30'
              }`}
            >
              {diceValue}
            </button>
            <span className="text-xs font-bold text-slate-300 mt-2">
              دور: {players[currentTurn].name} (اضغط لرمي النرد)
            </span>
          </div>
        </div>

        {/* AI In-Game Coach Hint Box */}
        {aiHint && (
          <div className="mb-4 p-3 bg-indigo-950/50 border border-indigo-500/30 rounded-xl flex items-start gap-2 text-indigo-200 text-xs">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-spin" />
            <div className="flex-1 leading-relaxed">{aiHint}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRollDice}
            disabled={isRolling}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>ارمي النرد الآن!</span>
          </button>

          <button
            onClick={handleAskAiCoach}
            disabled={isGettingHint}
            className="py-2.5 px-4 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 border border-indigo-400/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGettingHint ? 'جاري التحليل...' : 'نصيحة المساعد الذكي'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
