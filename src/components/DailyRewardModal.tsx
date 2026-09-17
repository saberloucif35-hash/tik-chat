import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Gift, Coins, Gem, Sparkles, Check, Flame, Crown, X, 
  Award, Clock, Zap, Star, PartyPopper
} from 'lucide-react';
import { 
  dailyRewardService, 
  DAILY_REWARD_TIERS, 
  DailyRewardTier,
  UserDailyRewardState
} from '../utils/dailyRewardService';
import { sounds } from '../utils/audioEffects';
import { formatCoins } from '../utils/numberFormat';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onClaimSuccess: (coinsEarned: number, diamondsEarned: number, badgeEarned?: string) => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onClaimSuccess,
}) => {
  const [eligibility, setEligibility] = useState(() => 
    dailyRewardService.checkEligibility(currentUser.id)
  );
  const [userState, setUserState] = useState<UserDailyRewardState>(() =>
    dailyRewardService.getState(currentUser.id)
  );
  const [isClaiming, setIsClaiming] = useState(false);
  const [justClaimedReward, setJustClaimedReward] = useState<DailyRewardTier | null>(null);
  const [showCelebrationEffect, setShowCelebrationEffect] = useState(false);

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (isOpen) {
      const el = dailyRewardService.checkEligibility(currentUser.id);
      setEligibility(el);
      setUserState(dailyRewardService.getState(currentUser.id));
      setJustClaimedReward(null);
      setShowCelebrationEffect(false);
    }
  }, [isOpen, currentUser.id]);

  if (!isOpen) return null;

  const handleClaim = () => {
    if (!eligibility.canClaim || isClaiming) return;

    setIsClaiming(true);
    sounds.playVictory();

    setTimeout(() => {
      const result = dailyRewardService.claimReward(currentUser);

      if (result.success) {
        setJustClaimedReward(result.reward);
        setShowCelebrationEffect(true);
        setEligibility(dailyRewardService.checkEligibility(currentUser.id));
        setUserState(dailyRewardService.getState(currentUser.id));

        // Trigger callback to App.tsx to update user currency & messages
        onClaimSuccess(result.coinsGranted, result.diamondsGranted, result.badgeGranted);

        // Extra celebratory chime
        sounds.playLevelUp();
      }

      setIsClaiming(false);
    }, 450);
  };

  const activeTargetDay = eligibility.alreadyClaimedToday 
    ? userState.consecutiveDays 
    : eligibility.nextDayNumber;

  const nextTierIndex = (activeTargetDay % 7);
  const tomorrowTier = DAILY_REWARD_TIERS[nextTierIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in font-['Cairo',sans-serif]">
      
      {/* Floating Animated Ambient Glow */}
      <div className="absolute w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none -top-10 -left-10 animate-pulse" />
      <div className="absolute w-80 h-80 rounded-full bg-blue-600/20 blur-3xl pointer-events-none -bottom-10 -right-10" />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Decorative Gold Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-amber-400 to-yellow-500" />

        {/* Modal Header */}
        <div className="relative px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/30 text-slate-950">
              <Gift className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>مكافأة تسجيل الدخول اليومي</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  سلسلة 7 أيام 🔥
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                سجّل حضورك يومياً لربح عملات ذهبية وألماسات مجانية!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto px-5 py-4 space-y-4 flex-1 custom-scrollbar">
          
          {/* Welcoming Greeting Card */}
          <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-amber-950/50 border border-amber-500/30 shadow-md flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400 shadow"
                />
                <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                  Lv.{currentUser.level}
                </span>
              </div>

              <div>
                <span className="text-xs font-black text-white block">
                  أهلاً وسهلاً بك يا {currentUser.name}! 🌟
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-amber-300">
                    سلسلة الحضور: {userState.consecutiveDays} من 7 أيام
                  </span>
                </div>
              </div>
            </div>

            {/* Streak Indicator Pill */}
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-center">
              <span className="text-[10px] text-slate-400 block">المكافآت المجمعة</span>
              <span className="text-xs font-black text-amber-400 font-mono">
                +{formatCoins(userState.totalCoinsEarned || 0)} 🪙
              </span>
            </div>
          </div>

          {/* WELCOME HERO CARD: Showcases the Earned / Available Daily Reward */}
          {eligibility.canClaim ? (
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/15 to-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-500/15 text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-amber-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <span>مكافأتك المكتسبة لتسجيل الدخول اليوم جاهزة للاستلام!</span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              </div>

              <div className="flex items-center justify-center gap-4 py-1">
                <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-amber-400/60 shadow-inner">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center text-amber-400">
                    <Coins className="w-6 h-6 animate-bounce" />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">عملات ذهبية إضافية</span>
                    <span className="text-xl font-black text-amber-300 font-mono">
                      +{formatCoins(eligibility.reward.coins)} 🪙
                    </span>
                  </div>
                </div>

                {eligibility.reward.diamonds > 0 && (
                  <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-2xl border border-sky-400/60 shadow-inner">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/30 flex items-center justify-center text-sky-400">
                      <Gem className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">ألماس مجاني</span>
                      <span className="text-xl font-black text-sky-300 font-mono">
                        +{eligibility.reward.diamonds} 💎
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-amber-200/90 font-medium">
                {eligibility.reward.highlightText || 'مكافأة الحضور اليومي المستحقة'} • انقر الزر بالأسفل لشحن رصيدك فوراً!
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 text-center space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xs">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تم استلام مكافأة اليوم بنجاح وإيداعها في محفظتك!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                مكافأة الغد المنتظرة (<strong className="text-amber-300">{tomorrowTier?.titleAr}</strong>):{' '}
                <span className="text-amber-400 font-bold font-mono">+{tomorrowTier?.coins} عملة ذهبية</span>
                {tomorrowTier?.diamonds ? ` و +${tomorrowTier.diamonds} ألماسة` : ''} 🎁
              </p>
            </div>
          )}

          {/* Celebration Banner when reward is successfully claimed */}
          {showCelebrationEffect && justClaimedReward && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-emerald-500/25 border-2 border-amber-400 shadow-2xl text-center space-y-2 animate-in zoom-in-95 duration-300">
              <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-amber-400 text-slate-950 shadow-md animate-bounce">
                <PartyPopper className="w-6 h-6 fill-slate-950" />
              </div>
              <h4 className="text-sm font-black text-amber-300">
                🎉 تهانينا! تم شحن مكافأة {justClaimedReward.titleAr} في محفظتك!
              </h4>
              <div className="flex items-center justify-center gap-3 font-mono font-black text-sm">
                <span className="text-amber-400 flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400" />
                  +{formatCoins(justClaimedReward.coins)} عملة
                </span>
                {justClaimedReward.diamonds > 0 && (
                  <span className="text-sky-300 flex items-center gap-1">
                    <Gem className="w-4 h-4 text-sky-400" />
                    +{justClaimedReward.diamonds} ألماسة
                  </span>
                )}
              </div>
              {justClaimedReward.badge && (
                <div className="inline-block px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-black border border-amber-500/40">
                  تم منحك: {justClaimedReward.badge} 👑
                </div>
              )}
            </div>
          )}

          {/* 7-Day Roadmap Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-200 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                جدول المكافآت الأسبوعية
              </span>
              <span className="text-[11px] text-slate-400">
                اليوم المستهدف: <strong className="text-amber-300">اليوم {activeTargetDay}</strong>
              </span>
            </div>

            {/* Days 1 to 6 Grid */}
            <div className="grid grid-cols-3 gap-2">
              {DAILY_REWARD_TIERS.slice(0, 6).map((tier) => {
                const isClaimed = 
                  userState.consecutiveDays >= tier.day && 
                  (eligibility.alreadyClaimedToday || tier.day < eligibility.nextDayNumber);
                const isCurrent = tier.day === eligibility.nextDayNumber && !eligibility.alreadyClaimedToday;

                return (
                  <div
                    key={tier.day}
                    className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-between text-center transition-all border min-h-[96px] ${
                      isClaimed
                        ? 'bg-slate-900/60 border-emerald-500/40 text-slate-300'
                        : isCurrent
                        ? 'bg-gradient-to-b from-amber-500/25 via-slate-900 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50 scale-102'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 opacity-75'
                    }`}
                  >
                    {/* Day number label */}
                    <div className="w-full flex items-center justify-between text-[10px] mb-1">
                      <span className="font-bold">{tier.titleAr}</span>
                      {isClaimed ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      ) : null}
                    </div>

                    {/* Reward icon & amount */}
                    <div className="my-1 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isClaimed
                          ? 'bg-emerald-950/40 text-emerald-400'
                          : isCurrent
                          ? 'bg-amber-500/30 text-amber-300 animate-pulse'
                          : 'bg-slate-900 text-slate-400'
                      }`}>
                        <Coins className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-black font-mono mt-1 ${
                        isClaimed
                          ? 'text-emerald-400'
                          : isCurrent
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }`}>
                        +{tier.coins}
                      </span>
                      {tier.diamonds > 0 && (
                        <span className="text-[10px] text-sky-400 font-bold flex items-center gap-0.5">
                          +{tier.diamonds} <Gem className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                      isClaimed
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isCurrent
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'text-slate-500'
                    }`}>
                      {isClaimed ? 'تم الاستلام' : isCurrent ? 'جاهز الآن!' : 'مغلق'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Day 7: GRAND PRIZE CARD */}
            {(() => {
              const grandTier = DAILY_REWARD_TIERS[6];
              const isClaimed = 
                userState.consecutiveDays >= 7 && eligibility.alreadyClaimedToday;
              const isCurrent = eligibility.nextDayNumber === 7 && !eligibility.alreadyClaimedToday;

              return (
                <div
                  className={`relative rounded-2xl p-3.5 border transition-all overflow-hidden ${
                    isClaimed
                      ? 'bg-slate-900/80 border-emerald-500/50'
                      : isCurrent
                      ? 'bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border-amber-400 shadow-xl shadow-amber-500/25 ring-2 ring-amber-400/50'
                      : 'bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/30 shrink-0">
                        <Crown className="w-6 h-6 fill-slate-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-300">
                            اليوم السابع • الجائزة الكبرى الأسبوعية 👑
                          </span>
                          {isClaimed && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> تم الاستلام
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5 font-bold">
                          +1,000 عملة ذهبية + 25 ألماسة + شارة ملك الحضور 🌟
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 font-mono block">
                        +1,000 🪙
                      </span>
                      <span className="text-[10px] text-sky-400 font-mono font-bold block">
                        +25 💎
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Motivational Rules Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>قواعد تجديد المكافأة اليومية:</span>
            </div>
            <p className="leading-relaxed">
              • تتجدد المكافأة يومياً عند تسجيل الدخول كل 24 ساعة.
              <br />
              • حافظ على استمرار سلسلة الحضور 7 أيام متواصلة لنيل الجائزة الكبرى والألماسات والشارة الملكية.
              <br />
              • بعد اليوم السابع، يتم استئناف السلسلة من جديد لمواصلة جني العملات المجانية!
            </p>
          </div>

        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-col gap-2">
          {eligibility.canClaim ? (
            <>
              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                <Gift className="w-5 h-5 fill-slate-950" />
                <span>
                  {isClaiming ? 'جاري الاستلام...' : `استلام مكافأة اليوم ${eligibility.nextDayNumber} (+${eligibility.reward.coins} عملة ذهبية 🎁)`}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق والمتابعة لاحقاً
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <div className="w-full py-3 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-xs flex items-center justify-center gap-2 text-center">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تم استلام مكافأة اليوم بنجاح! عُد غداً لاستلام مكافأة اليوم التالي.</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                إغلاق النافذة والمتابعة
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
