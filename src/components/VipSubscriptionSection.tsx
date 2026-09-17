import React, { useState } from 'react';
import { 
  Crown, Sparkles, Check, Play, ShieldCheck, 
  CreditCard, Flame, Zap, Wand2, Star, CheckCircle2, Shield, Lock, Coins
} from 'lucide-react';
import { User, VipSubscriptionTier, VipEntranceSubscription } from '../types';
import { vipSubscriptionTiers } from '../data/mockData';
import { LuxuriousEntranceBanner } from './VoiceRoom/LuxuriousEntranceBanner';
import { RealisticCrown } from './RealisticCrown';
import { CrownPaymentModal } from './CrownPaymentModal';
import { formatCoins } from '../utils/numberFormat';

interface VipSubscriptionSectionProps {
  currentUser: User;
  onUpdateUser: (updated: Partial<User>) => void;
  onTestEntranceInRoom?: (tierLevel: number, message: string) => void;
  onOpenRecharge?: () => void;
  onOpenAdminChat?: () => void;
}

export const VipSubscriptionSection: React.FC<VipSubscriptionSectionProps> = ({
  currentUser,
  onUpdateUser,
  onTestEntranceInRoom,
  onOpenRecharge,
  onOpenAdminChat,
}) => {
  const currentSub = currentUser.vipSubscription;
  const [selectedTierLevel, setSelectedTierLevel] = useState<number>(
    currentSub?.active ? currentSub.level : 1
  );
  const [customMsgInput, setCustomMsgInput] = useState<string>(
    currentSub?.customMessage || ''
  );
  const [previewBannerUser, setPreviewBannerUser] = useState<User | null>(null);
  const [subscribeSuccessNotice, setSubscribeSuccessNotice] = useState<string | null>(null);
  const [selectedTierForPayment, setSelectedTierForPayment] = useState<VipSubscriptionTier | null>(null);

  const activeTier = vipSubscriptionTiers.find((t) => t.level === selectedTierLevel) || vipSubscriptionTiers[0];

  // Preview Kill Message banner on screen (No sound - pure visual kill message)
  const handleTriggerKillMessagePreview = (tierLevel: number) => {
    const msg = customMsgInput.trim() || 
      (vipSubscriptionTiers.find(t => t.level === tierLevel)?.sampleEntranceMessage || '');
    
    setPreviewBannerUser({
      ...currentUser,
      vipSubscription: {
        level: tierLevel,
        active: true,
        tierNameAr: vipSubscriptionTiers.find(t => t.level === tierLevel)?.titleAr || '',
        pricePerMonth: tierLevel * 50,
        customMessage: msg,
        subscribedAt: new Date().toISOString().split('T')[0],
        expiresAt: '2026-10-16',
        autoRenew: true,
      }
    });

    if (onTestEntranceInRoom) {
      onTestEntranceInRoom(tierLevel, msg);
    }
  };

  // Open payment gate for tier
  const handleOpenPayment = (tier: VipSubscriptionTier) => {
    setSelectedTierForPayment(tier);
  };

  // Cancel subscription
  const handleCancelSubscription = () => {
    onUpdateUser({
      vipSubscription: undefined,
      badge: 'عضو مميز',
    });
    setSubscribeSuccessNotice('تم إلغاء الاشتراك بنجاح. لن يتم تجديد الكيل مسج للشهر القادم.');
    setTimeout(() => setSubscribeSuccessNotice(null), 4000);
  };

  return (
    <div className="space-y-4">
      
      {/* Live Preview Floating Overlay if active */}
      {previewBannerUser && (
        <LuxuriousEntranceBanner
          user={previewBannerUser}
          level={selectedTierLevel}
          customMessage={customMsgInput}
          onDismiss={() => setPreviewBannerUser(null)}
          className="fixed right-2 top-1/2 -translate-y-1/2 z-50 pointer-events-auto w-auto max-w-[220px] sm:max-w-[240px] select-none animate-in slide-in-from-right-full fade-in duration-300 ease-out filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
        />
      )}

      {/* Clean Header Bar */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 shrink-0">
            <Crown className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>اشتراكات تيجان الملوك الملكية (VIP Crowns)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                5 مستويات ($50 لكل مستوى)
              </span>
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {currentSub?.active ? (
                <span className="text-emerald-400 font-bold">
                  تاجك الحالي: {currentSub.tierNameAr} (المستوى {currentSub.level}) • ${currentSub.pricePerMonth}/شهر
                </span>
              ) : (
                'اختر تاجك الملكي المفضل لتفعيل الكيل مسج (Kill Message) الفخم على طرف الشاشة بدون إزعاج صوتي'
              )}
            </p>
          </div>
        </div>

        {currentSub?.active && (
          <button
            onClick={handleCancelSubscription}
            className="text-[11px] text-rose-400 hover:text-rose-300 font-bold px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/40 transition-colors shrink-0"
          >
            إلغاء التجديد
          </button>
        )}
      </div>

      {/* Success Alert Banner */}
      {subscribeSuccessNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{subscribeSuccessNotice}</span>
        </div>
      )}

      {/* All 5 King's Crown Tiers - Stacked Boxes Under Each Other (مربعات تحت بعض) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>باقات التيجان الخمسة المتاحة (اختر باقتك الملكية):</span>
          </span>
          <span className="text-[11px] text-amber-300/90 font-medium">
            5 مستويات ملكية
          </span>
        </div>

        {/* Vertical Stacked Cards (مربعات واضحة تحت بعض) */}
        <div className="flex flex-col space-y-3.5">
          {vipSubscriptionTiers.map((tier) => {
            const isSelected = selectedTierLevel === tier.level;
            const isCurrentActive = currentSub?.active && currentSub.level === tier.level;

            return (
              <div
                key={tier.level}
                onClick={() => setSelectedTierLevel(tier.level)}
                className={`w-full p-4 sm:p-5 rounded-2xl cursor-pointer border transition-all relative flex flex-col text-right ${
                  isSelected
                    ? `bg-slate-900/95 ${tier.colorScheme.border} ring-2 ring-amber-400 shadow-xl ${tier.colorScheme.glow}`
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                {/* Active Sub Badge */}
                {isCurrentActive && (
                  <span className="absolute -top-2.5 right-4 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[11px] shadow-md z-10 flex items-center gap-1">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>مفعل لديك حالياً</span>
                  </span>
                )}

                {/* 1. Header of the Card: Crown Icon, Title, Level & Monthly Price */}
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-lg p-1 group-hover:border-amber-500/50 transition-colors">
                      <RealisticCrown level={tier.level} size="md" showGlow animated />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-white truncate">
                          {tier.titleAr}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          المستوى {tier.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        دخول كيل مسج (Kill Message) فخم على جانب الشاشة
                      </p>
                    </div>
                  </div>

                  {/* Price Column */}
                  <div className="text-left shrink-0 pl-1">
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg sm:text-xl font-black text-amber-400 font-mono">
                        ${tier.pricePerMonth}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">/شهر</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-mono font-bold block">
                      {formatCoins(tier.pricePerMonth * 10000)} عملة
                    </span>
                  </div>
                </div>

                {/* 2. Kill Message Preview Banner (Sample on Screen Side) */}
                <div className="my-3 p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-right">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>نص الكيل مسج التلقائي عند دخول الغرفة:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">بدون أصوات مزعجة 🔇</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800/60 leading-relaxed">
                    "{tier.sampleEntranceMessage.replace('{name}', currentUser.name)}"
                  </div>
                </div>

                {/* 3. Features & Privileges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3.5">
                  {tier.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-300 bg-slate-950/50 px-2.5 py-1.5 rounded-lg border border-slate-850">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="leading-tight">{feat}</span>
                    </div>
                  ))}
                </div>

                {/* 4. Action Buttons (Preview & Subscribe) */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerKillMessagePreview(tier.level);
                    }}
                    className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>معاينة الكيل مسج ⚔️</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPayment(tier);
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 ${
                      isCurrentActive
                        ? 'bg-emerald-600 text-white shadow-emerald-950/40'
                        : `bg-gradient-to-r ${tier.colorScheme.gradient} text-white hover:opacity-90 shadow-md`
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>{isCurrentActive ? 'اشتراكك الحالي (تجديد أو ترقية) ✓' : `شراء التاج ($${tier.pricePerMonth}/شهر)`}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Message Customizer */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-amber-400" />
              <span>تخصيص نص الكيل مسج (Kill Message) لـ {activeTier.titleAr}:</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              اكتب عبارتك الملكية المخصصة التي ستظهر على طرف الشاشة عند دخولك الغرفة، أو اتركها فارغة لاعتماد النص الملكي الافتراضي.
            </p>
          </div>

          {customMsgInput && (
            <button
              onClick={() => setCustomMsgInput('')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold transition-all shrink-0 border border-slate-700"
              title="استعادة النص الملكي الافتراضي"
            >
              استعادة النص الافتراضي
            </button>
          )}
        </div>

        {/* Input Text Box */}
        <div className="relative">
          <input
            type="text"
            value={customMsgInput}
            onChange={(e) => setCustomMsgInput(e.target.value)}
            placeholder={activeTier.sampleEntranceMessage.replace('{name}', currentUser.name)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-10"
          />
          <span className="absolute right-3 top-3.5 text-base">
            {activeTier.badgeIcon}
          </span>
        </div>

        {/* Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            onClick={() => handleTriggerKillMessagePreview(selectedTierLevel)}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>معاينة الكيل مسج على طرف الشاشة ⚔️</span>
          </button>

          <button
            onClick={() => handleOpenPayment(activeTier)}
            className={`px-5 py-2.5 rounded-2xl bg-gradient-to-r ${activeTier.colorScheme.gradient} text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-950/50 active:scale-95 transition-all`}
          >
            <Crown className="w-4 h-4" />
            <span>شراء وتفعيل اشتراك {activeTier.titleAr} (${activeTier.pricePerMonth} أو {formatCoins(activeTier.pricePerMonth * 10000)} عملة)</span>
          </button>
        </div>
      </div>

      {/* Crown Payment Gateway Modal */}
      {selectedTierForPayment && (
        <CrownPaymentModal
          tier={selectedTierForPayment}
          currentUser={currentUser}
          customMessage={customMsgInput.trim() || selectedTierForPayment.sampleEntranceMessage}
          onOpenRecharge={onOpenRecharge}
          onOpenAdminChat={onOpenAdminChat}
          onClose={() => setSelectedTierForPayment(null)}
          onSuccess={(newSub, newCoins) => {
            onUpdateUser({
              vipSubscription: newSub,
              badge: `${selectedTierForPayment.badgeIcon} ${selectedTierForPayment.badgeLabel}`,
              ...(newCoins !== undefined ? { coins: newCoins } : {}),
            });
            setSubscribeSuccessNotice(
              `تهانينا! تم تفعيل اشتراكك في ${newSub.tierNameAr} بنجاح بقيمة $${newSub.pricePerMonth}/شهرياً. الكيل مسج الفخم مفعل الآن بدون أصوات مزعجة!`
            );
            setSelectedTierForPayment(null);
            setTimeout(() => {
              setSubscribeSuccessNotice(null);
            }, 6000);
          }}
        />
      )}

    </div>
  );
};
