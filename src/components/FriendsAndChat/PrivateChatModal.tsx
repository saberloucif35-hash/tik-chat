import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Send, Mic, MicOff, Play, Pause, Phone, PhoneOff, 
  Volume2, VolumeX, ShieldCheck, Sparkles, CheckCheck, 
  Copy, Check, UserPlus, Flame, Smile, ArrowRight, Trash2, UserMinus
} from 'lucide-react';
import { User, PrivateMessage } from '../../types';
import { sounds } from '../../utils/audioEffects';

interface PrivateChatModalProps {
  friend: User;
  currentUser: User;
  messages: PrivateMessage[];
  onSendMessage: (receiverId: string, text: string) => void;
  onSendVoiceMessage: (receiverId: string, durationSeconds: number, transcription: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onClearChat?: (friendId: string) => void;
  onRemoveFriend?: (friendId: string) => void;
  onClose: () => void;
}

export const PrivateChatModal: React.FC<PrivateChatModalProps> = ({
  friend,
  currentUser,
  messages = [],
  onSendMessage,
  onSendVoiceMessage,
  onDeleteMessage,
  onClearChat,
  onRemoveFriend,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [activeCallStatus, setActiveCallStatus] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'clear' | 'remove' | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingTimerRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecording]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  // Call timer
  useEffect(() => {
    if (activeCallStatus === 'connected') {
      setCallSeconds(0);
      callTimerRef.current = setInterval(() => {
        setCallSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [activeCallStatus]);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(friend.id, text);
    sounds.playMessageSent();
  };

  const handleStartRecord = () => {
    sounds.playVoiceRecordStart();
    setIsRecording(true);
  };

  const handleStopAndSendRecord = (customText?: string) => {
    const dur = Math.max(2, recordingSeconds);
    setIsRecording(false);
    sounds.playMessageSent();
    const transcription = customText || `تسجيل صوتي خاص (${dur} ثانية)`;
    onSendVoiceMessage(friend.id, dur, transcription);
  };

  const handleQuickVoicePreset = (presetText: string, durationSec: number = 4) => {
    sounds.playVoiceRecordStart();
    setTimeout(() => {
      sounds.playMessageSent();
      onSendVoiceMessage(friend.id, durationSec, presetText);
    }, 400);
  };

  const handlePlayVoice = (msg: PrivateMessage) => {
    if (playingMessageId === msg.id) {
      // Pause
      setPlayingMessageId(null);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }

    setPlayingMessageId(msg.id);
    const textToSpeak = msg.audioTranscription || 'مرحباً، هذه رسالة صوتية مرسلة في الدردشة الخاصة';
    
    // Play with speech synthesis or synthesized voice melody
    sounds.speakArabic(textToSpeak, () => {
      setPlayingMessageId(null);
    });

    // Fallback timer if synthesis is quiet
    setTimeout(() => {
      setPlayingMessageId((current) => (current === msg.id ? null : current));
    }, (msg.audioDurationSeconds || 4) * 1000);
  };

  const handleStartCall = () => {
    setActiveCallStatus('calling');
    sounds.playDiceRoll(); // Subtle audio indicator
    setTimeout(() => {
      setActiveCallStatus('connected');
      sounds.playGiftMagic();
    }, 2000);
  };

  const handleEndCall = () => {
    setActiveCallStatus('idle');
    setCallSeconds(0);
    sounds.playWarningBuzzer();
  };

  const handleCopyId = () => {
    navigator.clipboard?.writeText(friend.accountId || friend.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filter messages between currentUser and this friend
  const conversationMessages = (messages || []).filter(
    (m) =>
      m &&
      ((m.senderId === currentUser.id && m.receiverId === friend.id) ||
      (m.senderId === friend.id && m.receiverId === currentUser.id))
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg h-[92vh] max-h-[760px] flex flex-col shadow-2xl overflow-hidden relative">
        
        {/* TOP BAR: Friend Info, ID, Status, and Actions */}
        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <img
                src={friend.avatar}
                alt={friend.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/80 shadow"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white truncate max-w-[150px]">
                  {friend.name}
                </h3>
                {friend.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                    {friend.badge}
                  </span>
                )}
              </div>

              {/* ID Badge with 1-click Copy */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono font-bold transition-colors"
                  title="نسخ المعرف الفريد لهذا الصديق"
                >
                  <span>ID: {friend.accountId || friend.id}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                </button>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  متصل الآن
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Direct Voice Call Button */}
            <button
              onClick={handleStartCall}
              disabled={activeCallStatus !== 'idle'}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all flex items-center gap-1 text-xs font-bold active:scale-95"
              title="بدء اتصال صوتي خاص"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">اتصال</span>
            </button>

            {/* Clear chat button */}
            {onClearChat && conversationMessages.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirmAction === 'clear') {
                    onClearChat(friend.id);
                    setConfirmAction(null);
                  } else {
                    setConfirmAction('clear');
                    setTimeout(() => setConfirmAction((prev) => (prev === 'clear' ? null : prev)), 4000);
                  }
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                  confirmAction === 'clear'
                    ? 'bg-rose-600 text-white animate-pulse border-rose-400 ring-2 ring-rose-500/50'
                    : 'bg-slate-800 hover:bg-rose-950/60 border-slate-700 hover:border-rose-700/60 text-slate-400 hover:text-rose-300'
                }`}
                title={confirmAction === 'clear' ? 'تأكيد مسح جميع الرسائل الآن؟' : 'مسح سجل المحادثة'}
              >
                <Trash2 className="w-4 h-4" />
                {confirmAction === 'clear' && <span className="text-[10px]">مسح الكل؟</span>}
              </button>
            )}

            {/* Remove friend button */}
            {onRemoveFriend && (
              <button
                type="button"
                onClick={() => {
                  if (confirmAction === 'remove') {
                    onRemoveFriend(friend.id);
                    setConfirmAction(null);
                    onClose();
                  } else {
                    setConfirmAction('remove');
                    setTimeout(() => setConfirmAction((prev) => (prev === 'remove' ? null : prev)), 4000);
                  }
                }}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 ${
                  confirmAction === 'remove'
                    ? 'bg-rose-600 text-white animate-pulse border-rose-400 ring-2 ring-rose-500/50'
                    : 'bg-slate-800 hover:bg-rose-950/60 border-slate-700 hover:border-rose-700/60 text-slate-400 hover:text-rose-300'
                }`}
                title={confirmAction === 'remove' ? 'تأكيد حذف هذا الصديق؟' : 'حذف هذا الصديق'}
              >
                <UserMinus className="w-4 h-4" />
                {confirmAction === 'remove' && <span className="text-[10px]">حذف الصديق؟</span>}
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="إغلاق المحادثة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ACTIVE VOICE CALL OVERLAY (Simulated direct peer audio call) */}
        {activeCallStatus !== 'idle' && (
          <div className="bg-gradient-to-b from-indigo-950/90 via-slate-900/95 to-slate-950 border-b border-indigo-500/30 p-4 shrink-0 flex items-center justify-between animate-fade-in shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-400 animate-pulse"
                />
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white">
                  📞
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black text-white flex items-center gap-2">
                  <span>مكالمة صوتية خاصة مع {friend.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    HD Audio
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                  {activeCallStatus === 'calling' ? (
                    <span className="text-amber-300 animate-pulse">جاري الرنين والاتصال...</span>
                  ) : (
                    <span className="text-emerald-400 font-bold">متصل • {formatTime(callSeconds)}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCallMuted(!isCallMuted)}
                className={`p-2.5 rounded-full border transition-all ${
                  isCallMuted
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
                title={isCallMuted ? 'إلغاء كتم المايك' : 'كتم المايك'}
              >
                {isCallMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={handleEndCall}
                className="px-3.5 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-lg shadow-rose-950/60 active:scale-95 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>إنهاء</span>
              </button>
            </div>
          </div>
        )}

        {/* CHAT MESSAGES BODY */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Encrypted private badge */}
          <div className="flex flex-col items-center gap-1.5 my-1">
            <div className="px-3 py-1 rounded-full bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>محادثة خاصة مشفرة بين {currentUser.name} و {friend.name}</span>
            </div>
            <div className="px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300/90 flex items-center gap-1">
              <span>🎁 الهدايا حصرية داخل الغرف الصوتية فقط على المسرح، وغير متاحة في الخاص</span>
            </div>
          </div>

          {conversationMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-2xl mb-3 text-blue-400">
                💬
              </div>
              <h4 className="text-sm font-bold text-white mb-1">لا توجد رسائل سابقة بعد</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                ابدأ محادثتك مع صديقك الآن عبر الرسائل النصية أو الرسائل الصوتية الفورية!
              </p>
            </div>
          ) : (
            conversationMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const isVoice = msg.type === 'voice';
              const isPlaying = playingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    isMe ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <img
                    src={isMe ? currentUser.avatar : friend.avatar}
                    alt={isMe ? currentUser.name : friend.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-slate-700 mb-1"
                  />

                  <div className={`max-w-[78%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    
                    {/* BUBBLE CONTENT */}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed shadow-md transition-all ${
                        isMe
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {/* VOICE MESSAGE BUBBLE */}
                      {isVoice ? (
                        <div className="min-w-[200px] sm:min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handlePlayVoice(msg)}
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                                isPlaying
                                  ? 'bg-amber-400 text-slate-950 scale-105 shadow-lg shadow-amber-400/50'
                                  : isMe
                                  ? 'bg-white/20 hover:bg-white/30 text-white'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white'
                              }`}
                              title={isPlaying ? 'إيقاف الصوت' : 'تشغيل التسجيل الصوتي'}
                            >
                              {isPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current mr-0.5" />
                              )}
                            </button>

                            {/* Animated Audio Equalizer Waveform */}
                            <div className="flex-1 flex items-center gap-1 h-7">
                              {(msg.audioWaveform || [35, 60, 85, 40, 95, 70, 50, 80, 45, 90, 65, 30]).map(
                                (h, idx) => (
                                  <span
                                    key={idx}
                                    style={{ height: `${isPlaying ? Math.min(100, Math.max(20, h + (idx % 2 === 0 ? 15 : -15))) : h}%` }}
                                    className={`w-1 rounded-full transition-all duration-300 ${
                                      isPlaying
                                        ? 'bg-amber-300 animate-pulse'
                                        : isMe
                                        ? 'bg-white/60'
                                        : 'bg-blue-400'
                                    }`}
                                  />
                                )
                              )}
                            </div>

                            <span className="text-[11px] font-mono font-bold shrink-0 opacity-90">
                              0:{msg.audioDurationSeconds?.toString().padStart(2, '0') || '05'}
                            </span>
                          </div>

                          {/* Spoken subtitle / transcription if present */}
                          {msg.audioTranscription && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-[11px] flex items-center gap-1.5 opacity-90 italic">
                              <Volume2 className="w-3 h-3 shrink-0" />
                              <span>"{msg.audioTranscription}"</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* TEXT MESSAGE BUBBLE */
                        <div>
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                      )}
                    </div>

                    {/* Timestamp, Read Receipts, & Delete message */}
                    <div className="flex items-center gap-1.5 px-1 mt-1 text-[10px] text-slate-500 font-mono">
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="w-3.5 h-3.5 text-sky-400" />}
                      {onDeleteMessage && (
                        <button
                          type="button"
                          onClick={() => onDeleteMessage(msg.id)}
                          title="حذف هذه الرسالة نهائياً"
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* RECORDING LIVE WAVEFORM PREVIEW */}
          {isRecording && (
            <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/50 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="text-xs font-bold text-rose-200">جاري تسجيل رسالة صوتية...</span>
                <span className="text-xs font-mono font-black text-rose-400">
                  {formatTime(recordingSeconds)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecording(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleStopAndSendRecord()}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow"
                >
                  <Send className="w-3 h-3 rotate-180" />
                  <span>إرسال</span>
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK VOICE PHRASE PRESETS (Fast instant voice messages in Arabic) */}
        <div className="px-3 py-1.5 bg-slate-950/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
            <Mic className="w-3 h-3 text-sky-400" />
            صوتيات سريعة:
          </span>
          <button
            onClick={() => handleQuickVoicePreset('أهلاً وسهلاً يا غالي 🎙️', 3)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-200 shrink-0 border border-slate-700/60 active:scale-95 transition-all"
          >
            🎙️ أهلاً يا غالي
          </button>
          <button
            onClick={() => handleQuickVoicePreset('مساء الورد والسرور 🌹', 4)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-200 shrink-0 border border-slate-700/60 active:scale-95 transition-all"
          >
            🌹 مساء الورد
          </button>
          <button
            onClick={() => handleQuickVoicePreset('جاهز تلعب معنا لودو الليلة؟ 🎲', 5)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-200 shrink-0 border border-slate-700/60 active:scale-95 transition-all"
          >
            🎲 جاهز للودو؟
          </button>
          <button
            onClick={() => handleQuickVoicePreset('شكراً على ذوقك الراقي يا بطل 👑', 4)}
            className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-[11px] text-slate-200 shrink-0 border border-slate-700/60 active:scale-95 transition-all"
          >
            👑 شكراً يا بطل
          </button>
        </div>

        {/* BOTTOM INPUT BAR: Text & Voice recording */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            
            {/* Voice record trigger button */}
            <button
              type="button"
              onClick={isRecording ? () => handleStopAndSendRecord() : handleStartRecord}
              className={`p-2.5 rounded-2xl transition-all shadow-md active:scale-95 shrink-0 ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-600/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700'
              }`}
              title={isRecording ? 'إيقاف وإرسال التسجيل الصوتي' : 'تسجيل رسالة صوتية'}
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`أرسل رسالة خاصة إلى ${friend.name}...`}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white disabled:text-slate-600 transition-all shadow-md active:scale-95 shrink-0"
              title="إرسال الرسالة"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
