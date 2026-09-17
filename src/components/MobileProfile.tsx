import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { formatCoins, formatDiamonds } from '../utils/numberFormat';
import { 
  Coins, Gem, ShieldCheck, CreditCard, Sparkles,
  Shield, LogOut, Check, Copy, Camera, User as UserIcon,
  Upload, Edit3, AlertCircle, LogIn, Crown, Smartphone, Award,
  TrendingUp, Mic
} from 'lucide-react';
import { sounds } from '../utils/audioEffects';
import { UserLevelBadge } from './UserLevelBadge';
import { 
  getSupporterTierStyle, 
  getAccountLevelBadgeStyle, 
  getXpRequiredForAccountLevel, 
  getXpRequiredForSupporterLevel, 
  MAX_LEVEL 
} from '../utils/levelService';

interface MobileProfileProps {
  currentUser: User;
  isLoggedIn?: boolean;
  onUpdateUser?: (updated: Partial<User>) => void;
  onOpenUserRecharge?: () => void;
  onOpenAdminRecharge?: (targetAccountId?: string) => void;
  onOpenAdminPanel?: () => void;
  onOpenVipStore?: () => void;
  onOpenAuthModal?: () => void;
  onLogout: () => void;
}

export const MobileProfile: React.FC<MobileProfileProps> = ({
  currentUser,
  isLoggedIn = true,
  onUpdateUser,
  onOpenUserRecharge,
  onOpenAdminRecharge,
  onOpenAdminPanel,
  onOpenVipStore,
  onOpenAuthModal,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.isAppAdmin;
  const isModerator = currentUser.role === 'moderator';

  const [copiedId, setCopiedId] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);

  // Keep name input synchronized with external changes if not actively editing
  useEffect(() => {
    if (!isEditingName) {
      setNameInput(currentUser.name || '');
    }
  }, [currentUser.name, isEditingName]);

  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCopyAccountId = () => {
    const idToCopy = currentUser.accountId || currentUser.id;
    navigator.clipboard?.writeText(idToCopy);
    setCopiedId(true);
    sounds.playMessageSent();
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Save updated name
  const handleSaveName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    if (onUpdateUser) {
      onUpdateUser({ name: trimmed });
    }
    sounds.playLevelUp();
    setNameSuccess('تم تحديث الاسم بنجاح ✓');
    setIsEditingName(false);
    setTimeout(() => setNameSuccess(null), 3000);
  };

  // Helper to resize/compress uploaded avatar so it safely fits in localStorage (max 256x256, JPEG 0.85)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 256;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  // Upload avatar exclusively from mobile device with automatic optimization
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('يرجى اختيار ملف صورة صالح (JPG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت');
      return;
    }

    setAvatarError(null);
    compressImage(file)
      .then((compressedUrl) => {
        if (onUpdateUser) {
          onUpdateUser({ avatar: compressedUrl });
        }
        sounds.playLevelUp();
        setAvatarSuccess('تم رفع وحفظ صورتك الشخصية من جوالك بنجاح ✓');
        setTimeout(() => setAvatarSuccess(null), 3000);
      })
      .catch(() => {
        setAvatarError('تعذر معالجة الصورة، يرجى اختيار صورة أخرى من جوالك.');
      });

    // Reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  return (
    <div className="space-y-4 p-4 pb-24 text-slate-100 bg-slate-950 min-h-full">
      
      {/* 1. بطاقة الملف الشخصي العلوية */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-5 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            {/* الصورة الشخصية مع زر التعديل السريع */}
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className={`w-16 h-16 rounded-full object-cover ring-2 shadow-lg ${
                  isAdmin ? 'ring-amber-400 shadow-amber-500/30' : 'ring-blue-500 shadow-blue-500/30'
                }`}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-all active:scale-90 cursor-pointer"
                title="تغيير صورتك الشخصية من جهازك"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* تفاصيل الاسم والمعرف */}
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-black text-white">{currentUser.name}</h3>
                {currentUser.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    isAdmin 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                      : 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                  }`}>
                    {currentUser.badge}
                  </span>
                )}
              </div>

              {/* البريد الإلكتروني أو رقم الهاتف */}
              <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {currentUser.email || currentUser.phone || 'حساب مفعل'}
              </div>

              {/* معرف الحساب ID مع زر النسخ */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/90 border border-slate-800 text-amber-300 font-mono text-xs font-bold">
                  <span className="text-[10px] text-slate-400 font-sans">ID:</span>
                  <span className="text-amber-300">{currentUser.accountId || currentUser.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyAccountId}
                    className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                    title="نسخ معرف الحساب"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {copiedId && (
                  <span className="text-[10px] text-emerald-400 font-bold animate-fade-in">
                    تم النسخ!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* زر تسجيل الخروج أو الدخول السريع في الأعلى */}
          {isLoggedIn ? (
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
              title="تسجيل الخروج من الحساب"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-md"
              title="تسجيل الدخول / إنشاء حساب"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>دخول</span>
            </button>
          )}
        </div>

        {/* شارات التوثيق وحالة الحساب */}
        <div className="flex flex-wrap items-center gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-[11px]">
          {isAdmin ? (
            <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
              <Shield className="w-3 h-3 text-amber-400" />
              <span>المدير العام للمنصة 👑</span>
            </span>
          ) : isModerator ? (
            <span className="text-blue-300 font-bold flex items-center gap-1 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/30">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>مشرف البرنامج</span>
            </span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              <Check className="w-3 h-3" />
              <span>حساب رسمي نشط</span>
            </span>
          )}

          {currentUser.isEmailVerified && (
            <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> إيميل موثق
            </span>
          )}
          {currentUser.isPhoneVerified && (
            <span className="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> جوال موثق
            </span>
          )}
        </div>
      </div>

      {/* قسم نظام المستويات ومستوى الداعمين (Levels & Supporters System - Max 100) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/40 border border-purple-900/40 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">نظام المستويات والداعمين</h4>
              <span className="text-[9px] text-purple-300/80">أقصى مستوى 100 👑</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <UserLevelBadge
              level={currentUser.level || 1}
              supporterLevel={currentUser.supporterLevel || 1}
              size="sm"
            />
          </div>
        </div>

        {/* 1. بطاقة مستوى الحساب العام (Account Level) */}
        <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] font-bold text-white">مستوى الحساب العام</span>
            </div>
            <span className="text-xs font-black text-blue-400 font-mono">
              Lv. {currentUser.level || 1} / {MAX_LEVEL}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, (((currentUser.xp || 0) - getXpRequiredForAccountLevel(currentUser.level || 1)) / Math.max(1, (getXpRequiredForAccountLevel((currentUser.level || 1) + 1) - getXpRequiredForAccountLevel(currentUser.level || 1)))) * 100))}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span className="flex items-center gap-1">
                <Mic className="w-2.5 h-2.5 text-blue-400" />
                <span>التحدث في المايك: {Math.floor((currentUser.micTimeSeconds || 0) / 60)} دقيقة</span>
              </span>
              <span className="font-bold text-blue-300">
                {getAccountLevelBadgeStyle(currentUser.level || 1).titleAr}
              </span>
            </div>
          </div>
        </div>

        {/* 2. بطاقة مستوى الداعمين الحصري (Supporter Level) */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-purple-950/30 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-black text-amber-200">مستوى الداعمين الحصري</span>
            </div>
            <span className="text-xs font-black text-amber-400 font-mono">
              💎 Lv. {currentUser.supporterLevel || 1} / {MAX_LEVEL}
            </span>
          </div>

          {/* Supporter Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, (((currentUser.supporterXp || 0) - getXpRequiredForSupporterLevel(currentUser.supporterLevel || 1)) / Math.max(1, (getXpRequiredForSupporterLevel((currentUser.supporterLevel || 1) + 1) - getXpRequiredForSupporterLevel(currentUser.supporterLevel || 1)))) * 100))}%`
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400">
              <span className="flex items-center gap-1">
                <Coins className="w-2.5 h-2.5 text-amber-400" />
                <span>إجمالي الدعم: {formatCoins(currentUser.totalCoinsSent || 0)} عملة</span>
              </span>
              <span className="font-black text-amber-300">
                {getSupporterTierStyle(currentUser.supporterLevel || 1).tierNameAr}
              </span>
            </div>
          </div>

          <p className="text-[9.5px] text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
            ⭐ يرتفع هذا المستوى بإرسال الهدايا والدعم داخل الغرف الصوتية، ويظهر مميزاً لجميع الداعمين والمستخدمين مع ألقاب وألوان متدرجة حصرية حتى المستوى 100 الأسطوري!
          </p>
        </div>

        {/* Admin Quick Control Access if Owner / Admin */}
        {isAdmin && onOpenAdminPanel && (
          <button
            type="button"
            onClick={onOpenAdminPanel}
            className="w-full py-2 px-3 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-800/60 text-purple-200 text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow"
          >
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            <span>لوحة المالك: تعديل وترفيع مستويات أي حساب فوراً ⚡</span>
          </button>
        )}
      </div>

      {/* قسم خزانة المقتنيات والأوسمة الملكية (Prestige Badges & Collectibles Showcase) */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-[#13131c] to-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">خزانة الأوسمة والمقتنيات الملكية</h4>
              <span className="text-[9px] text-amber-300/80">تظهر في ملفك الشخصي لجميع الزوار</span>
            </div>
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
            نشط في ملفك
          </span>
        </div>

        {/* الأوسمة الملكية */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: '👑', label: 'تاج الأساطير', sub: 'رتبة ملكية', border: 'border-amber-500/40 bg-amber-950/20 text-amber-300' },
            { icon: '🦁', label: 'قلب الأسد', sub: 'كبار الداعمين', border: 'border-rose-500/40 bg-rose-950/20 text-rose-300' },
            { icon: '⚡', label: 'برق الصواعق', sub: 'هيبة الحضور', border: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300' },
            { icon: '🌟', label: 'نجم الساحة', sub: 'شهرة واسعة', border: 'border-purple-500/40 bg-purple-950/20 text-purple-300' },
          ].map((badge, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center ${badge.border}`}
            >
              <span className="text-2xl mb-1 filter drop-shadow">{badge.icon}</span>
              <span className="text-[10px] font-black leading-tight truncate w-full">{badge.label}</span>
              <span className="text-[8px] text-slate-400 opacity-80 truncate w-full">{badge.sub}</span>
            </div>
          ))}
        </div>

        {/* أبرز الهدايا الفاخرة المستلمة والمحفوظة */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أبرز الهدايا الفاخرة المحفوظة في ملفك:</span>
            </span>
            <span className="text-[9px] text-slate-400">تلقائي من الغرف</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: '🪐', name: 'كون يلا شات', value: '44,999' },
              { icon: '🦁', name: 'الأسد والشبل', value: '34,500' },
              { icon: '🏎️', name: 'سوبر كار ذهبية', value: '29,999' },
              { icon: '🎁', name: 'صندوق الكنز', value: '24,999' },
            ].map((g, idx) => (
              <div
                key={idx}
                className="p-2 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center text-center shadow-inner"
              >
                <span className="text-2xl mb-1 filter drop-shadow">{g.icon}</span>
                <span className="text-[10px] font-bold text-white truncate w-full">{g.name}</span>
                <span className="text-[9px] text-amber-400 font-mono font-bold mt-0.5">🪙 {g.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. قسم الشحن والمحفظة */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h4 className="text-xs font-black text-white">المحفظة والشحن</h4>
          </div>
          <span className="text-[10px] text-slate-400 font-bold">
            رصيدك الحالي
          </span>
        </div>

        {/* مربعات عرض الرصيد */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">العملات الذهبية</span>
                <span className="text-sm font-black text-amber-300 font-mono">
                  {formatCoins(currentUser.coins || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-center">
                <Gem className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">الألماس</span>
                <span className="text-sm font-black text-sky-300 font-mono">
                  {formatDiamonds(currentUser.diamonds || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار الشحن ومتجر الاشتراكات */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onOpenUserRecharge}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4 fill-slate-950" />
            <span>شحن الرصيد 💳</span>
          </button>

          {onOpenVipStore && (
            <button
              type="button"
              onClick={onOpenVipStore}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 border border-amber-500/50 font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
            >
              <Crown className="w-4 h-4 text-amber-400" />
              <span>متجر الاشتراكات الملكية 👑</span>
            </button>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => (onOpenAdminRecharge ? onOpenAdminRecharge() : onOpenAdminPanel?.())}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-950 hover:bg-slate-850 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>لوحة شحن المدير العام 👑</span>
            </button>
          )}
        </div>

        {/* تنبيه معرف الحساب لاستلام الشحن */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80 text-xs">
          <span className="text-slate-400 text-[11px]">
            معرف حسابك لشحن واستلام العملات من الآخرين:
          </span>
          <button
            type="button"
            onClick={handleCopyAccountId}
            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-[11px] font-bold font-mono flex items-center gap-1 cursor-pointer transition-colors"
          >
            {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{currentUser.accountId || currentUser.id}</span>
          </button>
        </div>
      </div>

      {/* 3. قسم إدارة الحساب (تغيير الاسم والصورة الشخصية) */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-blue-400" />
            <h4 className="text-xs font-black text-white">إدارة الحساب وتعديل البيانات</h4>
          </div>
          <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold">
            تحديث مباشر
          </span>
        </div>

        {/* إشعار نجاح تحديث الاسم */}
        {nameSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in font-bold">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{nameSuccess}</span>
          </div>
        )}

        {/* نموذج تعديل الاسم */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-blue-400" />
              الاسم المستعار / الشخصي
            </span>
            <span className="text-[10px] text-slate-400 font-normal">يظهر في المحادثات والغرف</span>
          </label>

          <form onSubmit={handleSaveName} className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setIsEditingName(true);
              }}
              placeholder="اكتب اسمك الجديد هنا..."
              maxLength={30}
              className="flex-1 bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!nameInput.trim() || nameInput.trim() === currentUser.name}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>حفظ الاسم</span>
            </button>
          </form>
        </div>

        <div className="border-t border-slate-800/80 pt-3 space-y-2.5">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-blue-400" />
              تغيير الصورة الشخصية
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30 flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              <span>حصرياً من الجوال 📱</span>
            </span>
          </label>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            تم إيقاف الصور الجاهزة؛ يمكنك رفع واختيار صورتك الشخصية الحقيقية مباشرة وحصرياً من كاميرا هاتفك أو من ألبوم الصور بجوالك.
          </p>

          {/* إشعار نجاح أو خطأ الصورة */}
          {avatarSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2 animate-fade-in font-bold">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{avatarSuccess}</span>
            </div>
          )}
          {avatarError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 animate-fade-in font-bold">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{avatarError}</span>
            </div>
          )}

          {/* معاينة الصورة الحالية وبطاقة الرفع الحصرية من الجوال */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500/40 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white shadow">
                <Camera className="w-3 h-3" />
              </span>
            </div>

            <div className="flex-1 text-center sm:text-right space-y-0.5">
              <span className="text-xs font-bold text-white block">صورتك الشخصية الحالية</span>
              <span className="text-[10px] text-slate-400 block">
                تدعم صيغ JPG, PNG, GIF, WebP بحجم يصل إلى 10 ميجابايت مع تحسين وضغط تلقائي للحساب.
              </span>
            </div>
          </div>

          {/* Hidden file inputs for Mobile Camera and Mobile Gallery */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* أزرار الرفع الحصرية من الجوال */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <Camera className="w-4 h-4" />
              <span>التقاط صورة بكاميرا الجوال 📸</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/50 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>اختيار من ألبوم جوالك 🖼️</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. زر تسجيل الخروج أو تسجيل الدخول الرئيسي */}
      <div className="pt-1">
        {isLoggedIn ? (
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 hover:border-rose-700 text-rose-200 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>تسجيل الخروج من الحساب</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول / إنشاء حساب جديد</span>
          </button>
        )}
      </div>

    </div>
  );
};
