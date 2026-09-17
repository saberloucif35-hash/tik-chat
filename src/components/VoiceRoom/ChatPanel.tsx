import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShieldAlert, ShieldCheck, Flame, Gift, Gamepad2, Volume2, HelpCircle } from 'lucide-react';
import { ChatMessage, User, ModerationResult, FunctionCallLog } from '../../types';
import { sounds } from '../../utils/audioEffects';
import { RealisticCrown } from '../RealisticCrown';
import { UserLevelBadge } from '../UserLevelBadge';

interface ChatPanelProps {
  messages: ChatMessage[];
  currentUser: User;
  onSendMessage: (text: string) => Promise<void>;
  onTriggerGame: (gameName: 'ludo' | 'trivia' | 'truth_dare') => void;
  onOpenGiftStore: () => void;
  isAiProcessing: boolean;
  isAudioVoiceActive: boolean;
  onToggleAudioVoice: () => void;
  onUserClick?: (user: User) => void;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  currentUser,
  onSendMessage,
  onTriggerGame,
  onOpenGiftStore,
  isAiProcessing,
  isAudioVoiceActive,
  onToggleAudioVoice,
  onUserClick,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiProcessing) return;
    const msg = inputText;
    setInputText('');
    await onSendMessage(msg);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col h-[520px] shadow-xl overflow-hidden">
      
      {/* Chat Header */}
      <div className="p-3 sm:px-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-white">الدردشة العامة ورعاية الرقابة (Gemini Guard)</span>
        </div>

        {/* Chat label */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border bg-slate-800/60 text-slate-400 border-slate-700">
          <span>محادثة الغرفة</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {messages.map((msg) => {
          const isMe = msg.user.id === currentUser.id;
          const isWarning = msg.isWarning;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                isMe ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <button
                type="button"
                onClick={() => onUserClick && onUserClick(msg.user)}
                className="shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                title={`عرض الملف الشخصي لـ ${msg.user.name}`}
              >
                <img
                  src={msg.user.avatar}
                  alt={msg.user.name}
                  className={`w-8 h-8 rounded-full object-cover mt-0.5 ${
                    isMe
                      ? 'ring-2 ring-amber-400'
                      : 'ring-1 ring-slate-700'
                  }`}
                />
              </button>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow ${
                  isWarning
                    ? 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
                    : isMe
                    ? 'bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/30 text-slate-100'
                    : 'bg-slate-800/80 border border-slate-700/60 text-slate-200'
                }`}
              >
                {/* User Header in Bubble */}
                <div className="flex items-center gap-1.5 mb-1 font-bold flex-wrap">
                  <button
                    type="button"
                    onClick={() => onUserClick && onUserClick(msg.user)}
                    className={`font-black hover:underline cursor-pointer ${isMe ? 'text-amber-400' : 'text-slate-200'}`}
                    title="عرض البروفايل والمستويات"
                  >
                    {msg.user.name}
                  </button>
                  <UserLevelBadge
                    level={msg.user.level || 1}
                    supporterLevel={msg.user.supporterLevel || 1}
                    size="xs"
                  />
                  {msg.user.vipSubscription?.active && (
                    <span title={msg.user.vipSubscription.tierNameAr}>
                      <RealisticCrown level={msg.user.vipSubscription.level} size="xs" showGlow />
                    </span>
                  )}
                  {msg.user.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900/60 text-amber-300">
                      {msg.user.badge}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-normal mr-auto">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Body */}
                <p className="whitespace-pre-wrap">{msg.text}</p>

                {/* Moderation Infraction Warning Banner */}
                {msg.moderationResult && !msg.moderationResult.isSafe && (
                  <div className="mt-2 p-2 rounded-xl bg-rose-900/60 border border-rose-500/40 text-rose-200 text-[11px] flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black block text-rose-300">
                        تنبيه رقابي: {msg.moderationResult.reasonAr}
                      </span>
                      <span className="text-[10px] text-rose-400">
                        الإجراء التلقائي: {msg.moderationResult.suggestedAction === 'ban' ? 'حظر المستخدم' : 'تحذير أولي'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Safe badge for inspected messages */}
                {msg.moderationResult && msg.moderationResult.isSafe && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>تم الفحص الرقابي عبر Gemini (آمن)</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isAiProcessing && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/20 animate-pulse">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>المساعد الذكي ونظام الرقابة يقوم بفحص الرسالة وصياغة الرد...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Test Prompt Chips for Users */}
      <div className="px-3 py-1.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 shrink-0">تجربة سريعة:</span>

        <button
          onClick={() => handleQuickPrompt('يلا نلعب لودو يا شباب')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 shrink-0 transition-colors"
        >
          🎲 يلا نلعب لودو
        </button>

        <button
          onClick={() => handleQuickPrompt('سؤال مسابقة ثقافية')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 shrink-0 transition-colors"
        >
          💡 سؤال مسابقة
        </button>

        <button
          onClick={() => handleQuickPrompt('أرسل هدية التاج للمضيف سلطان تكريماً له')}
          className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 border border-slate-700 shrink-0 transition-colors"
        >
          👑 أرسل تاج
        </button>

        <button
          onClick={() => handleQuickPrompt('يا غبي وحقير انقلع من الغرفة')}
          className="px-2 py-0.5 rounded-full bg-rose-950/60 hover:bg-rose-900/60 text-[10px] text-rose-300 border border-rose-500/40 shrink-0 transition-colors"
          title="رسالة اختبار لكشف نظام الرقابة"
        >
          ⚠️ فحص السب والرقابة
        </button>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
        {/* Games Quick Launcher */}
        <button
          onClick={() => onTriggerGame('ludo')}
          className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors shrink-0"
          title="فتح لعبة اللودو"
        >
          <Gamepad2 className="w-4 h-4" />
        </button>

        {/* Gift Store Launcher */}
        <button
          onClick={onOpenGiftStore}
          className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors shrink-0"
          title="إرسال هدية افتراضية"
        >
          <Gift className="w-4 h-4" />
        </button>

        {/* Text Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
          <input
            id="chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اكتب رسالة في الغرفة..."
            disabled={isAiProcessing}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />

          <button
            id="send-chat-btn"
            type="submit"
            disabled={!inputText.trim() || isAiProcessing}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              inputText.trim() && !isAiProcessing
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
