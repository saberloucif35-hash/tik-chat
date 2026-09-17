import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, MicOff, Crown, Sparkles, Volume2, Plus, VolumeX, Hand, 
  Gamepad2, Gift, Send, Heart, Flame, Trophy, Share2, X, Users, 
  Radio, ShieldAlert, ShieldCheck, HelpCircle, MessageSquare, LogOut, ArrowDown,
  Settings, UserCheck, Trash2, Lock, Unlock
} from 'lucide-react';
import { VoiceSeat, User, VoiceRoom, ChatMessage, VirtualGift, ModerationResult } from '../../types';
import { sounds } from '../../utils/audioEffects';
import { vipSubscriptionTiers } from '../../data/mockData';
import { LuxuriousEntranceBanner } from './LuxuriousEntranceBanner';
import { RoomUserActionModal } from './RoomUserActionModal';
import { RoomSettingsModal } from './RoomSettingsModal';
import { RealisticCrown } from '../RealisticCrown';
import { authService } from '../../utils/authService';
import { UserLevelBadge } from '../UserLevelBadge';

interface MobileVoiceRoomProps {
  room: VoiceRoom;
  seats: VoiceSeat[];
  currentUser: User;
  isUserOnSeat: boolean;
  userSeatIndex: number | null;
  onTakeSeat: (seatIndex: number) => void;
  onLeaveSeat: () => void;
  isUserMuted: boolean;
  onToggleUserMute: () => void;
  onToggleRoomMicsLock?: (isLocked: boolean) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isAiProcessing: boolean;
  botSpeechBubble: string | null;
  isAudioVoiceActive: boolean;
  onToggleAudioVoice: () => void;
  onOpenLudo: () => void;
  onOpenTrivia: () => void;
  onOpenGiftStore: () => void;
  onSendReaction: (emoji: string, soundType: 'applause' | 'dice' | 'victory') => void;
  onExitRoom: () => void;
  activeVipEntrance?: {
    user: User;
    level: number;
    message: string;
  } | null;
  onDismissVipEntrance?: () => void;
  onMuteUser?: (targetUser: User) => void;
  onDropFromMic?: (targetUser: User) => void;
  onKickUser?: (targetUser: User, durationMinutes?: number, isPermanent?: boolean) => void;
  onUpdateRoomInfo?: (title: string, coverImage: string) => void;
  onUnbanUser?: (userId: string) => void;
  onTriggerVipEntrance?: (user: User, level: number, message: string) => void;
  onNavigateToSubscriptions?: () => void;
  isFriend?: (targetUser: User) => boolean;
  onSendFriendRequest?: (targetUser: User) => void;
  onOpenPrivateChat?: (targetUser: User) => void;
  onOpenAdminRecharge?: (targetAccountId?: string) => void;
  onOpenAdminLevelEditor?: (targetAccountId?: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onDeleteRoom?: (roomId: string) => void;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
}

export const MobileVoiceRoom: React.FC<MobileVoiceRoomProps> = ({
  room,
  seats,
  currentUser,
  isUserOnSeat,
  userSeatIndex,
  onTakeSeat,
  onLeaveSeat,
  isUserMuted,
  onToggleUserMute,
  onToggleRoomMicsLock,
  messages,
  onSendMessage,
  isAiProcessing,
  botSpeechBubble,
  isAudioVoiceActive,
  onToggleAudioVoice,
  onOpenLudo,
  onOpenTrivia,
  onOpenGiftStore,
  onSendReaction,
  onExitRoom,
  activeVipEntrance,
  onDismissVipEntrance,
  onMuteUser,
  onDropFromMic,
  onKickUser,
  onUpdateRoomInfo,
  onUnbanUser,
  onTriggerVipEntrance,
  onNavigateToSubscriptions,
  isFriend,
  onSendFriendRequest,
  onOpenPrivateChat,
  onOpenAdminRecharge,
  onOpenAdminLevelEditor,
  onDeleteMessage,
  onDeleteRoom,
}) => {
  const [inputText, setInputText] = useState('');
  const [showInputBar, setShowInputBar] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Moderation & Settings State
  const [selectedModerationUser, setSelectedModerationUser] = useState<User | null>(null);
  const [selectedModerationSeatIndex, setSelectedModerationSeatIndex] = useState<number | null>(null);
  const [isModerationModalOpen, setIsModerationModalOpen] = useState(false);
  const [isRoomSettingsOpen, setIsRoomSettingsOpen] = useState(false);

  // Sovereign Owner / Moderator / Host / Admin permissions
  const isOwner = authService.isOwner(currentUser);
  const isRoomHost = room.host.id === currentUser.id || room.host.accountId === currentUser.accountId || currentUser.isHost || isOwner;
  const isRoomModerator = room.moderatorUserIds?.includes(currentUser.id) || currentUser.role === 'moderator' || isOwner;
  const isAppAdmin = Boolean(
    isOwner ||
    currentUser.isAppAdmin ||
    currentUser.role === 'admin' ||
    currentUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' ||
    currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
    currentUser.isImmune
  );
  const canModerate = isRoomHost || isRoomModerator || isAppAdmin || isOwner;

  // Safe mic toggle handler honoring room lock while exempting sovereign owner
  const handleToggleUserMuteSafe = () => {
    if (room.areMicsLocked && isUserMuted && !isOwner && !isRoomHost) {
      alert("⚠️ مايكات الغرفة مقفلة حالياً من قبل صاحب الغرفة! فقط صاحب الغرفة والمالك الرئيسي يمكنهم التحدث.");
      sounds.playNotice();
      return;
    }
    onToggleUserMute();
  };

  // Auto-scroll chat on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Floating reactions generator
  const triggerFloatingEmoji = (emoji: string, soundType: 'applause' | 'dice' | 'victory' = 'applause') => {
    onSendReaction(emoji, soundType);
    const newId = Date.now() + Math.random();
    const randomLeft = Math.floor(Math.random() * 60) + 20; // 20% to 80%
    setFloatingEmojis((prev) => [...prev, { id: newId, emoji, left: randomLeft }]);

    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== newId));
    }, 2200);
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiProcessing) return;
    const txt = inputText;
    setInputText('');
    setShowInputBar(false);
    await onSendMessage(txt);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-slate-950 text-slate-100 overflow-hidden select-none">
      
      {/* 👑 Active Luxurious VIP Entrance Banner (Silent Kill Message on side of screen) */}
      {activeVipEntrance && (
        <LuxuriousEntranceBanner
          user={activeVipEntrance.user}
          level={activeVipEntrance.level}
          customMessage={activeVipEntrance.message}
          onDismiss={onDismissVipEntrance}
        />
      )}

      {/* Room User Moderation Modal */}
      {selectedModerationUser && (
        <RoomUserActionModal
          isOpen={isModerationModalOpen}
          onClose={() => {
            setIsModerationModalOpen(false);
            setSelectedModerationUser(null);
            setSelectedModerationSeatIndex(null);
          }}
          targetUser={selectedModerationUser}
          targetSeatIndex={selectedModerationSeatIndex}
          currentUser={currentUser}
          currentRoom={room}
          isTargetMuted={
            selectedModerationSeatIndex !== null && selectedModerationSeatIndex !== undefined
              ? seats[selectedModerationSeatIndex]?.isMuted
              : room.mutedUserIds?.includes(selectedModerationUser.id)
          }
          onMuteUser={(target) => onMuteUser && onMuteUser(target)}
          onDropFromMic={(target) => onDropFromMic && onDropFromMic(target)}
          onKickUser={(target, duration, isPerm) => onKickUser && onKickUser(target, duration, isPerm)}
          onTriggerVipEntrance={onTriggerVipEntrance}
          onNavigateToSubscriptions={onNavigateToSubscriptions}
          isFriend={isFriend ? isFriend(selectedModerationUser) : false}
          onSendFriendRequest={onSendFriendRequest}
          onOpenPrivateChat={onOpenPrivateChat}
          onOpenGiftStore={() => onOpenGiftStore()}
          onOpenAdminRecharge={onOpenAdminRecharge}
          onOpenAdminLevelEditor={onOpenAdminLevelEditor}
        />
      )}

      {/* Room Settings Modal */}
      <RoomSettingsModal
        isOpen={isRoomSettingsOpen}
        onClose={() => setIsRoomSettingsOpen(false)}
        room={room}
        onUpdateRoomInfo={(title, cover) => onUpdateRoomInfo && onUpdateRoomInfo(title, cover)}
        onUnbanUser={(userId) => onUnbanUser && onUnbanUser(userId)}
        onDeleteRoom={onDeleteRoom}
        isHost={isRoomHost || isAppAdmin || isOwner}
        onToggleRoomMicsLock={onToggleRoomMicsLock}
      />

      {/* Ambient background glow */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-72 h-44 bg-blue-600/15 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-20 right-4 w-60 h-40 bg-indigo-950/30 blur-3xl pointer-events-none rounded-full" />

      {/* Floating Reactions Particles (Fly upwards) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            className="absolute text-2xl animate-float-up opacity-90 transition-all duration-1000"
            style={{
              left: `${item.left}%`,
              bottom: '90px',
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* 1. TOP MOBILE ROOM HEADER */}
      <div className="pt-2 px-3 pb-2 flex items-center justify-between z-20 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-sm">
        {/* Host Profile Info Pill */}
        <div 
          onClick={() => {
            setSelectedModerationUser(room.host);
            setSelectedModerationSeatIndex(0);
            setIsModerationModalOpen(true);
          }}
          className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800 shadow cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div className="relative">
            <img
              src={room.coverImage || room.host.avatar}
              alt={room.host.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-blue-500"
            />
            <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
          </div>
          <div className="leading-tight">
            <h4 className="text-[11px] font-black text-white truncate max-w-[90px]">
              {room.title}
            </h4>
            <span className="text-[9px] text-slate-400 block truncate max-w-[90px]">
              {room.host.name}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerFloatingEmoji('❤️', 'applause');
            }}
            className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-black text-[9px] hover:bg-blue-500 active:scale-95 transition-all ml-1 shadow shadow-blue-900/50"
          >
            +متابعة
          </button>
        </div>

        {/* Viewers Pill, Mic Lock (Host/Owner Quick Toggle & Visual Indicator for All), Settings & Exit Button */}
        <div className="flex items-center gap-1.5">
          {/* Room Mics Lock Status Indicator & Quick Toggle */}
          {(isRoomHost || isOwner) && onToggleRoomMicsLock ? (
            <button
              id="room-lock-mics-toggle-btn"
              onClick={() => onToggleRoomMicsLock(!room.areMicsLocked)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 border shadow transition-all active:scale-95 cursor-pointer ${
                room.areMicsLocked
                  ? 'bg-rose-950/90 border-rose-500 text-rose-300 hover:bg-rose-900 shadow-rose-950/50 animate-pulse'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/50'
              }`}
              title={
                room.areMicsLocked
                  ? 'مايكات الغرفة مقفلة حالياً - انقر كصاحب الغرفة لفتح المايكات للجميع'
                  : 'مايكات الغرفة مفتوحة للجميع - انقر كصاحب الغرفة لقفل المايكات على الجميع'
              }
            >
              {room.areMicsLocked ? (
                <>
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>المايكات مقفلة 🔒</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span>قفل المايكات</span>
                </>
              )}
            </button>
          ) : (
            <div
              id="room-lock-mics-indicator-header"
              className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border shadow ${
                room.areMicsLocked
                  ? 'bg-rose-950/90 border-rose-600/70 text-rose-300'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400'
              }`}
              title={room.areMicsLocked ? 'مايكات الغرفة مقفلة من قبل صاحب الغرفة' : 'مايكات الغرفة مفتوحة ومتاحة للجميع'}
            >
              {room.areMicsLocked ? (
                <>
                  <Lock className="w-3 h-3 text-rose-400 animate-pulse" />
                  <span>مقفلة 🔒</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 text-emerald-400" />
                  <span>مفتوحة 🟢</span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
            <Users className="w-3 h-3 text-blue-400" />
            <span className="font-mono font-bold text-white">{room.activeUsersCount}</span>
          </div>

          {/* Room Settings Gear for Host, Moderators, and App Admins */}
          {canModerate && (
            <button
              onClick={() => setIsRoomSettingsOpen(true)}
              className="p-1.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/50 transition-colors cursor-pointer"
              title="إعدادات الغرفة (اسم وصورة ومحظورين وقفل المايكات)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={onExitRoom}
            className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="مغادرة الغرفة"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Room Mics Locked Notice Banner with Quick Unlock Button */}
      {room.areMicsLocked && (
        <div className="mx-3 mt-1.5 py-1.5 px-3 rounded-xl bg-gradient-to-r from-rose-950/90 via-slate-900/90 to-red-950/90 border border-rose-600/70 text-rose-200 text-[10.5px] font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>مايكات الغرفة مقفلة حالياً من قبل {room.micsLockedByName || 'صاحب الغرفة'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {(isRoomHost || isOwner) && onToggleRoomMicsLock && (
              <button
                id="banner-unlock-mics-btn"
                onClick={() => onToggleRoomMicsLock(false)}
                className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black border border-emerald-400/50 shadow transition-all active:scale-95 cursor-pointer"
                title="إلغاء قفل المايكات وفتحها للجميع"
              >
                إلغاء القفل 🔓
              </button>
            )}
            <span className="text-[9px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
              المالك مستثنى 👑
            </span>
          </div>
        </div>
      )}

      {/* 3. MOBILE VOICE STAGE (8 MIC PODIUMS: 2 ROWS X 4 COLS) */}
      <div className="px-3 py-2.5 z-10">
        {/* Stage Mic Lock Status Indicator & Quick Toggle Bar */}
        <div className="flex items-center justify-between mb-2 px-2 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xs">
          {/* Stage info and active seats count */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Radio className="w-3 h-3 animate-pulse" />
            </div>
            <span className="text-[11px] font-black text-slate-200">
              منصة الصوت ({seats.filter((s) => Boolean(s.user)).length}/8)
            </span>
          </div>

          {/* Visual Indicator & Quick Action for Owner */}
          <div className="flex items-center gap-1.5">
            {/* Visual Indicator of Mic Lock State */}
            <div
              id="stage-mics-status-indicator"
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border transition-all ${
                room.areMicsLocked
                  ? 'bg-rose-950/90 border-rose-500/80 text-rose-300 shadow-sm shadow-rose-950/60'
                  : 'bg-emerald-950/70 border-emerald-600/50 text-emerald-300 shadow-sm shadow-emerald-950/40'
              }`}
              title={
                room.areMicsLocked
                  ? 'حالة المايكات: مقفلة من صاحب الغرفة (المستمعون مكتومون)'
                  : 'حالة المايكات: مفتوحة للجميع (المجال متاح للتحدث)'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  room.areMicsLocked ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                }`}
              />
              {room.areMicsLocked ? (
                <>
                  <Lock className="w-3 h-3 text-rose-400" />
                  <span>المايكات مقفلة</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-emerald-400" />
                  <span>المايكات مفتوحة</span>
                </>
              )}
            </div>

            {/* Quick Toggle Button for Room Owner / Host */}
            {(isRoomHost || isOwner) && onToggleRoomMicsLock && (
              <button
                id="stage-quick-toggle-mics-btn"
                onClick={() => onToggleRoomMicsLock(!room.areMicsLocked)}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer shadow-md transition-all active:scale-95 border ${
                  room.areMicsLocked
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/60 shadow-emerald-950/50'
                    : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white border-rose-400/60 shadow-rose-950/50'
                }`}
                title={
                  room.areMicsLocked
                    ? 'انقر الآن لفتح المايكات لجميع الأعضاء في الغرفة'
                    : 'انقر الآن لقفل المايكات على جميع الأعضاء في الغرفة'
                }
              >
                {room.areMicsLocked ? (
                  <>
                    <Unlock className="w-3 h-3 text-white" />
                    <span>فتح المايكات 🔓</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-white" />
                    <span>قفل المايكات 🔒</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5">
          {seats.map((seat) => {
            const isHost = seat.index === 0;
            const isMe = isUserOnSeat && userSeatIndex === seat.index;
            const isSpeaking = seat.user && (seat.audioLevel > 0 || (isMe && !isUserMuted));

            return (
              <div key={seat.index} className="flex flex-col items-center">
                <button
                  id={`mobile-seat-${seat.index}`}
                  onClick={() => {
                    if (isMe) {
                      handleToggleUserMuteSafe();
                    } else if (!seat.user) {
                      onTakeSeat(seat.index);
                    } else if (seat.user) {
                      // Open moderator / profile action modal
                      setSelectedModerationUser(seat.user);
                      setSelectedModerationSeatIndex(seat.index);
                      setIsModerationModalOpen(true);
                    }
                  }}
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                    seat.user
                      ? 'bg-slate-900 shadow-md border border-slate-800'
                      : 'border border-dashed border-slate-800 hover:border-blue-500/60 bg-slate-900/40'
                  } ${
                    isSpeaking
                      ? 'ring-4 ring-blue-500/80 shadow-lg shadow-blue-600/40 animate-pulse'
                      : isHost
                      ? 'ring-2 ring-amber-400/70 shadow-amber-900/30'
                      : isMe
                      ? 'ring-2 ring-blue-500'
                      : ''
                  }`}
                >
                  {seat.user ? (
                    <>
                      <img
                        src={seat.user.avatar}
                        alt={seat.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />

                      {/* Speaking Audio Waves Indicator */}
                      {isSpeaking && (
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-600 items-center justify-center text-[8px] text-white">
                            🎙️
                          </span>
                        </span>
                      )}

                      {/* Muted Icon */}
                      {seat.isMuted && !isSpeaking && (
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow border ${
                          room.areMicsLocked && !isHost
                            ? 'bg-rose-950 border-rose-700 text-rose-300'
                            : 'bg-slate-800 border-slate-700 text-rose-400'
                        }`}>
                          {room.areMicsLocked && !isHost ? (
                            <Lock className="w-2.5 h-2.5" />
                          ) : (
                            <MicOff className="w-2.5 h-2.5" />
                          )}
                        </div>
                      )}

                      {/* Host Crown */}
                      {isHost && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sm drop-shadow">
                          👑
                        </div>
                      )}

                      {/* VIP Subscription Crown Badge */}
                      {seat.user.vipSubscription?.active && !isHost && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs drop-shadow">
                          {seat.user.vipSubscription.level >= 5 ? '👑💎' : '👑'}
                        </div>
                      )}

                      {/* App Admin Shield */}
                      {(seat.user.isAppAdmin || seat.user.role === 'admin' || seat.user.email?.toLowerCase() === 'shadow008btc@gmail.com') && (
                        <div className="absolute -bottom-1 left-0 w-3.5 h-3.5 rounded-full bg-amber-500 border border-slate-950 flex items-center justify-center text-[7px] text-slate-950 font-black shadow" title="مسؤول إدارة">
                          🛡️
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 transition-colors">
                      {room.areMicsLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-rose-400/80 mb-0.5" />
                          <span className="text-[8px] text-rose-400/80 font-bold">مقفل</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span className="text-[8px] mt-0.5">{seat.index + 1}</span>
                        </>
                      )}
                    </div>
                  )}
                </button>

                {/* Seat Name & Status */}
                <div className="mt-1 flex flex-col items-center justify-center max-w-[68px]">
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full text-center">
                    {seat.user ? seat.user.name : `مايك ${seat.index + 1}`}
                  </span>
                  {seat.user && (
                    <UserLevelBadge
                      level={seat.user.level}
                      supporterLevel={seat.user.supporterLevel}
                      size="xs"
                      className="mt-0.5"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ROOM INTERACTIVE FEATURES BAR (LUDO & TRIVIA SHORTCUTS) */}
      <div className="px-3 py-1 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenLudo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 text-[10px] text-slate-300 hover:text-white transition-all shadow active:scale-95"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>طاولة لودو 🎲</span>
          </button>

          <button
            onClick={onOpenTrivia}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 text-[10px] text-slate-300 hover:text-white transition-all shadow active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>مسابقة الذكاء 🏆</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => triggerFloatingEmoji('🔥', 'applause')}
            className="p-1 rounded-lg bg-slate-900/80 border border-slate-800 text-amber-400 hover:scale-110 transition-transform text-xs"
            title="حماس"
          >
            🔥
          </button>
          <button
            onClick={() => triggerFloatingEmoji('👏', 'applause')}
            className="p-1 rounded-lg bg-slate-900/80 border border-slate-800 text-blue-400 hover:scale-110 transition-transform text-xs"
            title="تصفيق"
          >
            👏
          </button>
          <button
            onClick={() => triggerFloatingEmoji('🌹', 'applause')}
            className="p-1 rounded-lg bg-slate-900/80 border border-slate-800 text-rose-400 hover:scale-110 transition-transform text-xs"
            title="وردة"
          >
            🌹
          </button>
        </div>
      </div>

      {/* 5. LIVE ROOM CHAT & STREAMING MESSAGES (NATIVE MOBILE STREAM) */}
      <div className="flex-1 px-3 py-2 overflow-y-auto space-y-2 text-xs scrollbar-none z-10 flex flex-col justify-end">
        {messages.slice(-25).map((msg) => {
          const isWarning = msg.isWarning;
          const isGift = Boolean(msg.giftPayload);
          const isSystem = msg.isSystem;
          const isAi = msg.isAiBot;

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-0.5">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400">
                  {msg.text}
                </span>
              </div>
            );
          }

          if (isGift) {
            return (
              <div
                key={msg.id}
                className="p-2 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2 shadow animate-fade-in"
              >
                <span className="text-xl shrink-0">{msg.giftPayload?.gift.icon}</span>
                <div className="leading-tight flex-1">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-bold text-white">{msg.user.name}</span>
                    <UserLevelBadge
                      level={msg.user.level}
                      supporterLevel={msg.user.supporterLevel}
                      size="xs"
                    />
                  </div>
                  <span className="text-[11px] text-amber-300">أهدى {msg.giftPayload?.receiver.name}</span>
                  <p className="text-[10px] text-slate-300">{msg.giftPayload?.gift.nameAr}</p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                isWarning
                  ? 'bg-rose-950/40 border border-rose-800/50 p-2 rounded-2xl'
                  : ''
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedModerationUser(msg.user);
                  setSelectedModerationSeatIndex(null);
                  setIsModerationModalOpen(true);
                }}
                className="relative shrink-0 hover:opacity-80 transition-opacity"
              >
                <img
                  src={msg.user.avatar}
                  alt={msg.user.name}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                />
                {msg.user.vipSubscription?.active && (
                  <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedModerationUser(msg.user);
                      setSelectedModerationSeatIndex(null);
                      setIsModerationModalOpen(true);
                    }}
                    className="font-bold text-slate-300 hover:text-white text-[11px] truncate text-right"
                  >
                    {msg.user.name}
                  </button>

                  <UserLevelBadge
                    level={msg.user.level}
                    supporterLevel={msg.user.supporterLevel}
                    size="xs"
                  />

                  {/* Badges */}
                  {msg.user.vipSubscription?.active && (
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-bold">
                      {msg.user.vipSubscription.tierNameAr}
                    </span>
                  )}
                  {(msg.user.isAppAdmin || msg.user.role === 'admin' || msg.user.email?.toLowerCase() === 'shadow008btc@gmail.com') && (
                    <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[8px] font-black">
                      إدارة 🛡️
                    </span>
                  )}
                </div>

                <p className="break-words text-slate-100 font-medium">{msg.text}</p>

                {isWarning && (
                  <span className="text-[9px] text-rose-300 block font-bold mt-0.5">
                    ⚠️ {msg.moderationResult?.reasonAr}
                  </span>
                )}
              </div>

              {/* Message Delete Button (Permanently removes message) */}
              {onDeleteMessage && (msg.user.id === currentUser.id || canModerate) && (
                <button
                  type="button"
                  onClick={() => onDeleteMessage(msg.id)}
                  title="حذف الرسالة نهائياً"
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all rounded hover:bg-slate-800 shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        <div ref={chatEndRef} />
      </div>

      {/* 6. EXPANDABLE CHAT INPUT BAR (When User Taps To Write) */}
      {showInputBar && (
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 z-30 animate-slide-up">
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              id="mobile-chat-input"
              type="text"
              autoFocus
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب رسالة في الغرفة..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2 rounded-full transition-all ${
                inputText.trim()
                  ? 'bg-blue-600 text-white shadow shadow-blue-900/50'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowInputBar(false)}
              className="p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </form>

          {/* Quick chip suggestions for mobile */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setInputText('السلام عليكم ورحمة الله وبركاته 🌹')}
              className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-blue-500/50 shrink-0"
            >
              🌹 السلام عليكم
            </button>
            <button
              type="button"
              onClick={() => setInputText('مساء الخير جميعاً أهلاً وسهلاً')}
              className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-blue-500/50 shrink-0"
            >
              ✨ مساء الخير
            </button>
            <button
              type="button"
              onClick={() => setInputText('منورين الغرفة يا غاليين 🤍')}
              className="px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 hover:text-white hover:border-blue-500/50 shrink-0"
            >
              🤍 منورين
            </button>
          </div>
        </div>
      )}

      {/* 7. MOBILE BOTTOM ROOM DOCK (ALWAYS VISIBLE) */}
      {!showInputBar && (
        <div className="px-2.5 py-2 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-1.5 z-20">
          
          {/* Chat Opener Button */}
          <button
            id="open-mobile-chat-btn"
            onClick={() => setShowInputBar(true)}
            className="flex-1 min-w-[95px] max-w-[125px] flex items-center gap-1 px-2.5 py-2 rounded-full bg-slate-950 border border-slate-800 text-slate-400 text-xs hover:border-blue-500/50 hover:text-white transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="text-[10px] truncate text-slate-300">دردشة...</span>
          </button>

          {/* Dedicated Mic Controls Area */}
          <div className="flex items-center gap-1.5">
            {/* Quick Owner Mic Lock / Unlock Toggle Button in Bottom Dock */}
            {(isRoomHost || isOwner) && onToggleRoomMicsLock && (
              <button
                id="mobile-dock-mic-lock-toggle-btn"
                onClick={() => onToggleRoomMicsLock(!room.areMicsLocked)}
                className={`p-2 rounded-full border transition-all active:scale-95 shadow-md flex items-center justify-center cursor-pointer ${
                  room.areMicsLocked
                    ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-rose-950/50 hover:bg-rose-900 animate-pulse'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/60'
                }`}
                title={
                  room.areMicsLocked
                    ? 'مايكات الغرفة مقفلة - انقر كصاحب الغرفة لفتح المايكات للجميع'
                    : 'مايكات الغرفة مفتوحة - انقر كصاحب الغرفة لقفل المايكات على الجميع'
                }
              >
                {room.areMicsLocked ? (
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>
            )}

            {isUserOnSeat ? (
              <>
                {/* 1. Open / Mute Mic Button */}
                <button
                  id="mobile-mic-toggle-btn"
                  onClick={handleToggleUserMuteSafe}
                  className={`px-2.5 py-1.5 rounded-full flex items-center gap-1 text-[10px] font-bold shadow-md transition-all active:scale-95 cursor-pointer ${
                    isUserMuted
                      ? room.areMicsLocked && !isOwner && !isRoomHost
                        ? 'bg-rose-950/80 border border-rose-700/80 text-rose-300'
                        : 'bg-slate-900 border border-slate-700 text-slate-200 hover:border-blue-500'
                      : 'bg-blue-600 text-white shadow shadow-blue-900/60 animate-pulse'
                  }`}
                  title={
                    room.areMicsLocked && !isOwner && !isRoomHost
                      ? 'مايكات الغرفة مقفلة من قبل صاحب الغرفة'
                      : isUserMuted
                      ? 'فتح المايك والتحدث'
                      : 'كتم المايك'
                  }
                >
                  {isUserMuted ? (
                    room.areMicsLocked && !isOwner && !isRoomHost ? (
                      <Lock className="w-3 h-3 text-rose-400" />
                    ) : (
                      <MicOff className="w-3 h-3 text-rose-400" />
                    )
                  ) : (
                    <Mic className="w-3 h-3 text-white" />
                  )}
                  <span>
                    {isUserMuted
                      ? room.areMicsLocked && !isOwner && !isRoomHost
                        ? 'مقفل 🔒'
                        : 'فتح المايك'
                      : 'كتم المايك'}
                  </span>
                </button>

                {/* 2. Leave / Descend from Mic Button */}
                <button
                  id="mobile-mic-leave-btn"
                  onClick={onLeaveSeat}
                  className="px-2 py-1.5 rounded-full bg-rose-950/80 border border-rose-700/80 text-rose-300 hover:bg-rose-900 hover:text-white flex items-center gap-1 text-[10px] font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                  title="النزول من المايك إلى الجمهور"
                >
                  <LogOut className="w-3 h-3" />
                  <span>النزول</span>
                </button>
              </>
            ) : (
              /* Request / Take Mic Button when in audience */
              <button
                id="mobile-mic-join-btn"
                onClick={() => {
                  if (room.areMicsLocked && !isOwner && !isRoomHost) {
                    alert("⚠️ مايكات الغرفة مقفلة حالياً من قبل صاحب الغرفة.");
                    sounds.playNotice();
                    return;
                  }
                  const emptyIdx = seats.findIndex((s) => !s.user);
                  if (emptyIdx !== -1) {
                    onTakeSeat(emptyIdx);
                  }
                }}
                className={`px-2.5 py-1.5 rounded-full flex items-center gap-1 text-[10px] font-bold shadow-md active:scale-95 transition-all cursor-pointer ${
                  room.areMicsLocked && !isOwner && !isRoomHost
                    ? 'bg-slate-900 border border-rose-700/60 text-rose-300'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/50'
                }`}
                title={
                  room.areMicsLocked && !isOwner && !isRoomHost
                    ? 'مايكات الغرفة مقفلة من قبل صاحب الغرفة'
                    : 'الصعود إلى المايك والتحدث'
                }
              >
                {room.areMicsLocked && !isOwner && !isRoomHost ? (
                  <>
                    <Lock className="w-3 h-3 text-rose-400" />
                    <span>مقفلة 🔒</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3" />
                    <span>طلب المايك</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Quick Actions (Games, Gifts, Reactions) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Games Launcher */}
            <button
              id="mobile-games-dock-btn"
              onClick={onOpenLudo}
              className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-slate-400 hover:text-blue-400 flex items-center justify-center transition-all shadow active:scale-95"
              title="ألعاب الغرفة (لودو / مسابقات)"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
            </button>

            {/* Gifts Store Launcher */}
            <button
              id="mobile-gifts-dock-btn"
              onClick={onOpenGiftStore}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 flex items-center justify-center transition-all shadow shadow-amber-500/20 active:scale-95"
              title="متجر الهدايا"
            >
              <Gift className="w-4 h-4 fill-slate-950" />
            </button>

            {/* Quick Heart Reaction */}
            <button
              onClick={() => triggerFloatingEmoji('❤️', 'applause')}
              className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 text-rose-500 hover:scale-110 active:scale-90 flex items-center justify-center transition-transform"
              title="إرسال تفاعل"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
