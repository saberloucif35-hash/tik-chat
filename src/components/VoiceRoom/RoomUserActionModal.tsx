import React, { useState } from 'react';
import { 
  X, MicOff, Mic, ArrowDownCircle, UserX, Ban, ShieldAlert, 
  ShieldCheck, Shield, AlertTriangle, Clock, Check, 
  UserPlus, UserCheck, MessageSquare, Zap, Copy, User as UserIcon,
  Crown, Award, Coins, Sparkles, Star, Trophy, Gift
} from 'lucide-react';
import { User, VoiceRoom } from '../../types';
import { sounds } from '../../utils/audioEffects';
import { UserLevelBadge } from '../UserLevelBadge';
import { 
  MAX_LEVEL,
  getXpRequiredForAccountLevel, 
  getXpRequiredForSupporterLevel, 
  getSupporterTierStyle, 
  getAccountLevelBadgeStyle 
} from '../../utils/levelService';
import { formatCoins } from '../../utils/numberFormat';
import { RealisticCrown } from '../RealisticCrown';

interface RoomUserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User | null;
  targetSeatIndex?: number | null;
  currentUser: User;
  currentRoom?: VoiceRoom;
  isTargetMuted?: boolean;
  onMuteUser?: (user: User) => void;
  onDropFromMic?: (user: User) => void;
  onKickUser?: (user: User, durationMinutes?: number, isPermanent?: boolean) => void;
  onTriggerVipEntrance?: (user: User, level: number, message: string) => void;
  onNavigateToSubscriptions?: () => void;
  isFriend?: boolean;
  onSendFriendRequest?: (user: User) => void;
  onOpenPrivateChat?: (user: User) => void;
  onOpenGiftStore?: (targetUser: User) => void;
  onOpenAdminRecharge?: (targetAccountId?: string) => void;
  onOpenAdminLevelEditor?: (targetAccountId?: string) => void;
}

export const RoomUserActionModal: React.FC<RoomUserActionModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  targetSeatIndex,
  currentUser,
  currentRoom,
  isTargetMuted = false,
  onMuteUser,
  onDropFromMic,
  onKickUser,
  onTriggerVipEntrance,
  onNavigateToSubscriptions,
  isFriend = false,
  onSendFriendRequest,
  onOpenPrivateChat,
  onOpenGiftStore,
  onOpenAdminRecharge,
  onOpenAdminLevelEditor,
}) => {
  const [kickDuration, setKickDuration] = useState<number>(15); // 15 mins default
  const [immunityNotice, setImmunityNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  if (!isOpen || !targetUser) return null;

  const isMe = targetUser.id === currentUser.id;
  const isAdmin = currentUser.role === 'admin' || currentUser.isAppAdmin;

  const handleCopyTargetId = () => {
    const idToCopy = targetUser.accountId || targetUser.id;
    navigator.clipboard?.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Check if current user is the sovereign Owner
  const isMeOwner = Boolean(
    currentUser.isOwner ||
    currentUser.role === 'owner' ||
    currentUser.role === 'admin' ||
    currentUser.isAppAdmin ||
    currentUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' ||
    currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
    currentUser.email?.toLowerCase() === 'moissanite.watch2025@gmail.com'
  );

  // Strict Sovereign Immunity check for Owner / App Admins and the User himself
  const isTargetImmune = Boolean(
    targetUser.isOwner ||
    targetUser.role === 'owner' ||
    targetUser.isAppAdmin ||
    targetUser.role === 'admin' ||
    targetUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' ||
    targetUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
    targetUser.email?.toLowerCase() === 'moissanite.watch2025@gmail.com' ||
    targetUser.isImmune
  );

  // Check if current user is allowed to moderate in this room (Owner has full authority across ALL rooms!)
  const isRoomHost = Boolean(currentRoom && (currentRoom.host.id === currentUser.id || currentUser.isHost || isMeOwner));
  const isRoomModerator = Boolean(currentRoom && (currentRoom.moderatorUserIds?.includes(currentUser.id) || currentUser.role === 'moderator' || isMeOwner));
  const isAppAdmin = Boolean(isMeOwner || currentUser.isAppAdmin || currentUser.role === 'admin' || currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com');
  const canModerate = Boolean(currentRoom && !isMe && (isMeOwner || isRoomHost || isRoomModerator || isAppAdmin));

  const handleAction = (actionType: 'mute' | 'drop' | 'kick_temp' | 'kick_perm') => {
    // Only another owner can moderate an owner, but generally owner is immune to anyone else
    if (isTargetImmune && !isMeOwner) {
      setImmunityNotice(
        '⛔ إجراء محظور! هذا المستخدم هو مالك التطبيق (Owner) أو مسؤول إدارة التطبيق ومحصن سيادياً كلياً ضد الكتم والإنزال والطرد بأمر الإدارة العليا.'
      );
      return;
    }

    if (!canModerate) {
      setImmunityNotice('ليس لديك صلاحية إدارة في هذه الغرفة.');
      return;
    }

    if (actionType === 'mute' && onMuteUser) {
      onMuteUser(targetUser);
      onClose();
    } else if (actionType === 'drop' && onDropFromMic) {
      onDropFromMic(targetUser);
      onClose();
    } else if (actionType === 'kick_temp' && onKickUser) {
      onKickUser(targetUser, kickDuration, false);
      onClose();
    } else if (actionType === 'kick_perm' && onKickUser) {
      onKickUser(targetUser, undefined, true);
      onClose();
    }
  };

  // Level & Supporter Progress Math
  const targetLevel = Math.min(MAX_LEVEL, Math.max(1, targetUser.level || 1));
  const targetSupporterLevel = Math.min(MAX_LEVEL, Math.max(1, targetUser.supporterLevel || 1));
  const targetXp = targetUser.xp || 0;
  const targetSupporterXp = targetUser.supporterXp || 0;
  const targetMicSeconds = targetUser.micTimeSeconds || 0;
  const targetCoinsSent = targetUser.totalCoinsSent || 0;

  const currentLevelBaseXp = getXpRequiredForAccountLevel(targetLevel);
  const nextLevelXp = getXpRequiredForAccountLevel(Math.min(MAX_LEVEL, targetLevel + 1));
  const accountLevelProgress = targetLevel >= MAX_LEVEL 
    ? 100 
    : Math.min(100, Math.max(5, Math.round(((targetXp - currentLevelBaseXp) / Math.max(1, nextLevelXp - currentLevelBaseXp)) * 100)));

  const currentSupporterBaseXp = getXpRequiredForSupporterLevel(targetSupporterLevel);
  const nextSupporterXp = getXpRequiredForSupporterLevel(Math.min(MAX_LEVEL, targetSupporterLevel + 1));
  const supporterProgress = targetSupporterLevel >= MAX_LEVEL
    ? 100
    : Math.min(100, Math.max(5, Math.round(((targetSupporterXp - currentSupporterBaseXp) / Math.max(1, nextSupporterXp - currentSupporterBaseXp)) * 100)));

  const accountStyle = getAccountLevelBadgeStyle(targetLevel);
  const supporterStyle = getSupporterTierStyle(targetSupporterLevel);
  const micMinutes = Math.floor(targetMicSeconds / 60);
  const micHours = (micMinutes / 60).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in" dir="rtl">
      <div className="relative w-full max-w-md max-h-[92vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        
        {/* 1. Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/90 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-inner">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">الملف الشخصي والمستويات</h3>
              <p className="text-[10px] text-slate-400">
                {targetSeatIndex !== undefined && targetSeatIndex !== null
                  ? `متحدث على المنصة (المقعد ${targetSeatIndex + 1})`
                  : currentRoom ? 'عضو في الغرفة' : 'معلومات الحساب'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-right">
          
          {/* User Profile Card */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-xl">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="relative shrink-0">
                <img
                  src={targetUser.avatar}
                  alt={targetUser.name}
                  className={`w-16 h-16 rounded-full object-cover ring-2 shadow-lg ${
                    isTargetImmune
                      ? 'ring-amber-500'
                      : 'ring-blue-500'
                  }`}
                />
                <span className="absolute -bottom-1 -left-1 px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-300 border border-slate-800 text-[9px] font-bold">
                  Lv.{targetLevel}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-black text-white truncate">
                    {targetUser.name}
                  </h4>
                  {targetUser.vipSubscription?.active && (
                    <span title={targetUser.vipSubscription.tierNameAr}>
                      <RealisticCrown level={targetUser.vipSubscription.level} size="xs" showGlow />
                    </span>
                  )}
                  {isTargetImmune ? (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/50 text-[10px] font-black flex items-center gap-1 shadow-sm">
                      <Shield className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>إدارة التطبيق (حصانة عليا)</span>
                    </span>
                  ) : targetUser.badge ? (
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-bold">
                      {targetUser.badge}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono text-[11px] font-bold">
                    <span className="text-[9px] text-slate-400 font-sans">ID:</span>
                    <span>{targetUser.accountId || targetUser.id}</span>
                    <button
                      onClick={handleCopyTargetId}
                      className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                      title="نسخ معرف الحساب"
                    >
                      {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                  {copiedId && (
                    <span className="text-[10px] text-emerald-400 font-bold animate-fade-in">
                      تم النسخ!
                    </span>
                  )}
                </div>

                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">
                    {targetUser.role === 'admin' ? '👑 المدير العام' : targetUser.role === 'moderator' ? '🛡️ مشرف معتمد' : 'عضو نشط في البرنامج'}
                  </span>
                  <UserLevelBadge
                    level={targetLevel}
                    supporterLevel={targetSupporterLevel}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* Social & Admin ID Action Toolbar */}
            {!isMe && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
                {/* Friend Button */}
                {isFriend ? (
                  <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>أنتم أصدقاء ✓</span>
                  </div>
                ) : requestSent ? (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>تم إرسال الطلب</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (onSendFriendRequest) onSendFriendRequest(targetUser);
                      sounds.playMessageSent();
                      setRequestSent(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>إضافة كصديق</span>
                  </button>
                )}

                {/* Private Chat Button */}
                {onOpenPrivateChat && (
                  <button
                    onClick={() => {
                      onOpenPrivateChat(targetUser);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>محادثة خاصة</span>
                  </button>
                )}

                {/* Admin Quick Recharge Button (Admin only) */}
                {isAdmin && onOpenAdminRecharge && (
                  <button
                    onClick={() => {
                      onOpenAdminRecharge(targetUser.accountId || targetUser.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    title="شحن رصيد هذا الحساب بالـ ID"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>شحن ⚡</span>
                  </button>
                )}

                {/* Admin Quick Level Override Button (Admin only) */}
                {isAdmin && onOpenAdminLevelEditor && (
                  <button
                    onClick={() => {
                      onOpenAdminLevelEditor(targetUser.accountId || targetUser.id);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-purple-950 active:scale-95 transition-all cursor-pointer"
                    title="تعديل وترفيع مستوى الحساب أو الداعمين كمالك"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-300" />
                    <span>تعديل المستوى 👑</span>
                  </button>
                )}

                {/* Send Luxury Gift Button */}
                {onOpenGiftStore && (
                  <button
                    onClick={() => {
                      onOpenGiftStore(targetUser);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-rose-950 active:scale-95 transition-all cursor-pointer"
                    title="إرسال هدية فاخرة لهذا العضو"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>إرسال هدية 🎁</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 3. معرض الأوسمة وخزانة الهدايا الفاخرة للمستخدم */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-950 via-[#161622] to-slate-950 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">خزانة الهدايا والأوسمة الملكية</h4>
                  <span className="text-[10px] text-amber-300/80">المقتنيات الفاخرة المعتمدة</span>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
                VIP Showcase
              </span>
            </div>

            {/* الأوسمة الملكية */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { icon: '👑', label: 'تاج الأساطير', sub: 'رتبة ملكية', border: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
                { icon: '🦁', label: 'قلب الأسد', sub: 'كبار الداعمين', border: 'border-rose-500/40 bg-rose-950/20 text-rose-300' },
                { icon: '⚡', label: 'برق الصواعق', sub: 'هيبة الحضور', border: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300' },
                { icon: '🌟', label: 'نجم الساحة', sub: 'شهرة واسعة', border: 'border-purple-500/40 bg-purple-950/20 text-purple-300' },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center ${badge.border}`}
                >
                  <span className="text-xl mb-0.5 filter drop-shadow">{badge.icon}</span>
                  <span className="text-[10px] font-black leading-tight truncate w-full">{badge.label}</span>
                  <span className="text-[8px] text-slate-400 opacity-80 truncate w-full">{badge.sub}</span>
                </div>
              ))}
            </div>

            {/* خزانة أبرز الهدايا الفاخرة المستلمة */}
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>أبرز الهدايا الفاخرة:</span>
                </span>
                {onOpenGiftStore && !isMe && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenGiftStore(targetUser);
                      onClose();
                    }}
                    className="text-[10px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                  >
                    <span>أهدِ هدية الآن 🎁</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { icon: '🪐', name: 'كون يلا شات', value: '44,999' },
                  { icon: '🦁', name: 'الأسد والشبل', value: '34,500' },
                  { icon: '🏎️', name: 'سوبر كار ذهبية', value: '29,999' },
                  { icon: '🎁', name: 'صندوق الكنز', value: '24,999' },
                ].map((g, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (onOpenGiftStore && !isMe) {
                        onOpenGiftStore(targetUser);
                        onClose();
                      }
                    }}
                    className={`p-2 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center transition-all ${
                      onOpenGiftStore && !isMe ? 'hover:border-pink-500/60 hover:bg-slate-850 cursor-pointer active:scale-95' : ''
                    }`}
                    title={onOpenGiftStore && !isMe ? `إرسال ${g.name} للمستخدم` : g.name}
                  >
                    <span className="text-2xl mb-1 filter drop-shadow">{g.icon}</span>
                    <span className="text-[10px] font-bold text-white truncate w-full">{g.name}</span>
                    <span className="text-[9px] text-amber-400 font-mono font-bold mt-0.5">🪙 {g.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. تفاصيل نظام المستويات والداعمين الكاملة (Full Level & Supporter System) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-900/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Crown className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">نظام المستويات والداعمين</h4>
                  <span className="text-[10px] text-purple-300/90 font-medium">الحد الأقصى للمستوى {MAX_LEVEL} 👑</span>
                </div>
              </div>

              <UserLevelBadge
                level={targetLevel}
                supporterLevel={targetSupporterLevel}
                size="md"
              />
            </div>

            {/* بطاقة مستوى الحساب العام (Account Level) */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-white">مستوى الحساب العام</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    {accountStyle.titleAr}
                  </span>
                </div>
                <span className="text-xs font-black text-blue-400 font-mono">
                  Lv. {targetLevel} / {MAX_LEVEL}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${accountLevelProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3 text-blue-400" />
                    <span>التحدث في المايك: {micMinutes >= 60 ? `${micHours} ساعة` : `${micMinutes} دقيقة`}</span>
                  </span>
                  <span className="font-mono text-blue-300 font-bold">
                    {accountLevelProgress}%
                  </span>
                </div>
              </div>

              <p className="text-[9.5px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                🎙️ يرتفع هذا المستوى تلقائياً كلما زادت فترة التواجد والتحدث على المايك داخل الغرف الصوتية.
              </p>
            </div>

            {/* بطاقة مستوى الداعمين الحصري (Supporter Level) */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-purple-950/30 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-black text-amber-200">مستوى الداعمين الحصري</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${supporterStyle.badgeBg} ${supporterStyle.badgeBorder} ${supporterStyle.badgeText}`}>
                    {supporterStyle.tierNameAr}
                  </span>
                </div>
                <span className="text-xs font-black text-amber-400 font-mono">
                  💎 Lv. {targetSupporterLevel} / {MAX_LEVEL}
                </span>
              </div>

              {/* Supporter Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${supporterProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>إجمالي الدعم: {formatCoins(targetCoinsSent)} عملة</span>
                  </span>
                  <span className="font-mono text-amber-300 font-bold">
                    {supporterProgress}%
                  </span>
                </div>
              </div>

              <p className="text-[9.5px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
                ⭐ يرتفع هذا المستوى حصرياً بإرسال الهدايا والدعم داخل الغرف الصوتية، ويمنح صاحبه أوسمة وألقاباً فاخرة وظهوراً مميزاً لجميع المستخدمين.
              </p>
            </div>
          </div>

          {/* 4. Sovereign Immunity Banner if App Admin */}
          {isTargetImmune && (
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border-2 border-amber-500/80 text-amber-200 text-xs space-y-2 shadow-lg shadow-amber-950/40">
              <div className="flex items-center gap-2 font-black text-amber-300">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>حصانة سيادية عليا (محصن ومحمي كلياً)</span>
              </div>
              <p className="text-[11px] text-amber-100/90 leading-relaxed font-medium">
                هذا المستخدم من مسؤولي البرنامج المعتمدين (Shadow / App Admin). يتمتع بحصانة مطلقة في جميع الغرف الصوتية، ومحمي برمجياً ضد الكتم، الإنزال من المايك، أو الطرد بأمر الإدارة العليا.
              </p>
            </div>
          )}

          {/* 5. Moderation Controls (Only if Moderator/Host/Admin and Target is NOT Immune and NOT Me and inside a room) */}
          {canModerate && !isTargetImmune && (
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                <ShieldAlert className="w-4 h-4" />
                <span>إجراءات مشرف الغرفة على العضو:</span>
              </div>

              {/* MUTE / UNMUTE */}
              <button
                onClick={() => handleAction('mute')}
                className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all active:scale-98 cursor-pointer ${
                  isTargetMuted
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/40'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isTargetMuted ? (
                    <Mic className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <MicOff className="w-4 h-4 text-rose-400" />
                  )}
                  <span>{isTargetMuted ? 'إلغاء كتم المايك' : 'كتم المايك في الغرفة'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isTargetMuted ? 'مكتوم حالياً' : 'مفتوح'}
                </span>
              </button>

              {/* DROP FROM MIC */}
              {targetSeatIndex !== undefined && targetSeatIndex !== null && (
                <button
                  onClick={() => handleAction('drop')}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:text-white text-xs font-bold flex items-center justify-between transition-all active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4 text-amber-400" />
                    <span>إنزال من المايك إلى المستمعين</span>
                  </div>
                  <span className="text-[10px] text-slate-400">إخلاء المقعد</span>
                </button>
              )}

              {/* TEMPORARY KICK */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>طرد مؤقت من الغرفة</span>
                  </div>
                  <select
                    value={kickDuration}
                    onChange={(e) => setKickDuration(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                  >
                    <option value={5}>5 دقائق</option>
                    <option value={15}>15 دقيقة</option>
                    <option value={60}>ساعة واحدة</option>
                    <option value={1440}>24 ساعة</option>
                  </select>
                </div>

                <button
                  onClick={() => handleAction('kick_temp')}
                  className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-98 cursor-pointer"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>تطبيق الطرد المؤقت ({kickDuration >= 60 ? `${kickDuration / 60} ساعة` : `${kickDuration} دقيقة`})</span>
                </button>
              </div>

              {/* PERMANENT BAN */}
              <button
                onClick={() => handleAction('kick_perm')}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-800 text-rose-200 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all active:scale-98 cursor-pointer"
              >
                <Ban className="w-4 h-4 text-rose-400" />
                <span>طرد وحظر دائم من هذه الغرفة</span>
              </button>
            </div>
          )}

          {/* Immunity Notice Message */}
          {immunityNotice && (
            <div className="mt-3 p-2.5 rounded-xl bg-rose-950 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{immunityNotice}</span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};


