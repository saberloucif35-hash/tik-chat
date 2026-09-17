import React from 'react';
import { Mic, MicOff, Crown, Sparkles, Volume2, Plus, VolumeX, Hand, Music2, PartyPopper, Flame } from 'lucide-react';
import { VoiceSeat, User } from '../../types';
import { sounds } from '../../utils/audioEffects';
import { RealisticCrown } from '../RealisticCrown';

interface VoiceStageProps {
  seats: VoiceSeat[];
  currentUser: User;
  isUserOnSeat: boolean;
  userSeatIndex: number | null;
  onTakeSeat: (seatIndex: number) => void;
  onLeaveSeat: () => void;
  isUserMuted: boolean;
  onToggleUserMute: () => void;
  botSpeechBubble: string | null;
  onSendRoomReaction: (emoji: string, soundType: 'applause' | 'dice' | 'victory') => void;
}

export const VoiceStage: React.FC<VoiceStageProps> = ({
  seats,
  currentUser,
  isUserOnSeat,
  userSeatIndex,
  onTakeSeat,
  onLeaveSeat,
  isUserMuted,
  onToggleUserMute,
  botSpeechBubble,
  onSendRoomReaction,
}) => {
  return (
    <div className="relative bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-xl overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-rose-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-72 h-32 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Stage Header Info */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-bold text-slate-300">منصة المتحدثين الصوتية المباشرة (Voice Stage)</span>
        </div>

        {/* User Stage Controls */}
        <div className="flex items-center gap-2">
          {isUserOnSeat ? (
            <>
              <button
                id="mic-toggle-btn"
                onClick={onToggleUserMute}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isUserMuted
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 animate-pulse'
                }`}
              >
                {isUserMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isUserMuted ? 'كتم المايك' : 'المايك مفتوح'}</span>
              </button>

              <button
                id="leave-seat-btn"
                onClick={onLeaveSeat}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800/70 hover:bg-slate-700/80 transition-colors border border-slate-700/50"
              >
                مغادرة المايك
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-amber-400" />
              <span>اضغط على أي مقعد فارغ للصعود والتحدث</span>
            </div>
          )}
        </div>
      </div>

      {/* 8 Seats Grid (Podiums) */}
      <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-2xl mx-auto my-2">
        {seats.map((seat) => {
          const isHost = seat.index === 0;
          const isMe = isUserOnSeat && userSeatIndex === seat.index;
          const isSpeaking = seat.user && (seat.audioLevel > 0 || (isMe && !isUserMuted));

          return (
            <div
              key={seat.index}
              className="flex flex-col items-center relative group"
            >
              {/* Podium Circle & Avatar */}
              <div className="relative">
                {/* Audio wave ripple animation when speaking */}
                {isSpeaking && (
                  <>
                    <span className="absolute -inset-2 rounded-full bg-amber-500/30 animate-ping pointer-events-none" />
                    <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-pulse pointer-events-none" />
                  </>
                )}

                {/* Host Crown */}
                {isHost && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 text-amber-400 drop-shadow-md">
                    <Crown className="w-5 h-5 fill-amber-400" />
                  </div>
                )}

                {/* VIP Royal Crown for Subscribed Users */}
                {seat.user?.vipSubscription?.active && (
                  <div className="absolute -top-3.5 -right-2 z-20 drop-shadow-lg">
                    <RealisticCrown level={seat.user.vipSubscription.level} size="xs" showGlow animated />
                  </div>
                )}

                {/* Seat Content */}
                {seat.user ? (
                  <div className="relative">
                    <img
                      src={seat.user.avatar}
                      alt={seat.user.name}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover transition-transform group-hover:scale-105 ${
                        isSpeaking
                          ? 'ring-4 ring-amber-400 shadow-lg shadow-amber-500/30'
                          : 'ring-2 ring-slate-700'
                      }`}
                    />

                    {/* Mic Status Indicator Badge */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md ${
                        seat.isMuted || (isMe && isUserMuted)
                          ? 'bg-rose-600 text-white'
                          : isSpeaking
                          ? 'bg-emerald-500 text-slate-950 animate-pulse'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {seat.isMuted || (isMe && isUserMuted) ? (
                        <MicOff className="w-3 h-3" />
                      ) : (
                        <Mic className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                ) : (
                  /* Empty Seat Slot */
                  <button
                    id={`take-seat-${seat.index}`}
                    onClick={() => onTakeSeat(seat.index)}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-dashed border-slate-700 hover:border-amber-400/80 bg-slate-800/40 hover:bg-amber-500/10 flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-amber-300 transition-all cursor-pointer group"
                    title="اصعد إلى هذا المقعد"
                  >
                    <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold">مقعد {seat.index + 1}</span>
                  </button>
                )}
              </div>

              {/* Name & Title */}
              <div className="mt-2 text-center max-w-[80px] sm:max-w-[100px]">
                {seat.user ? (
                  <>
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {seat.user.name}
                    </p>
                    <span className="text-[10px] text-amber-400/90 font-medium truncate block">
                      {isHost ? 'المضيف 👑' : `المستوى ${seat.user.level}`}
                    </span>
                  </>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium">فارغ</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Soundboard & Room Reactions */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <PartyPopper className="w-4 h-4 text-amber-400" />
          <span>مؤثرات وتفاعلات صوتية سريعة للغرفة:</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sounds.playApplause();
              onSendRoomReaction('👏 تصفيق حار!', 'applause');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 transition-all active:scale-95"
            title="تصفيق حار"
          >
            <span>👏</span>
            <span className="hidden sm:inline">تصفيق</span>
          </button>

          <button
            onClick={() => {
              sounds.playDiceRoll();
              onSendRoomReaction('🎲 رمي النرد!', 'dice');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 transition-all active:scale-95"
            title="رمي النرد"
          >
            <span>🎲</span>
            <span className="hidden sm:inline">نرد</span>
          </button>

          <button
            onClick={() => {
              sounds.playVictory();
              onSendRoomReaction('🎉 احتفال وفوز!', 'victory');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 transition-all active:scale-95"
            title="نغمة الفوز"
          >
            <span>🏆</span>
            <span className="hidden sm:inline">فوز</span>
          </button>

          <button
            onClick={() => {
              sounds.playGiftMagic();
              onSendRoomReaction('✨ بريق وهيبة!', 'applause');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 flex items-center gap-1 transition-all active:scale-95"
            title="نغمة سحرية"
          >
            <span>✨</span>
          </button>
        </div>
      </div>
    </div>
  );
};
