import React, { useEffect, useState } from 'react';
import { Crown, Sparkles, X, Shield, Gem, Award } from 'lucide-react';
import { User, VipSubscriptionTier } from '../../types';
import { vipSubscriptionTiers } from '../../data/mockData';
import { RealisticCrown } from '../RealisticCrown';

interface LuxuriousEntranceBannerProps {
  user: User;
  level: number;
  customMessage?: string;
  onDismiss?: () => void;
  className?: string;
}

export const LuxuriousEntranceBanner: React.FC<LuxuriousEntranceBannerProps> = ({
  user,
  level = 1,
  customMessage,
  onDismiss,
  className,
}) => {
  const [visible, setVisible] = useState(true);
  const tier: VipSubscriptionTier =
    vipSubscriptionTiers.find((t) => t.level === level) || vipSubscriptionTiers[0];

  const entranceText = customMessage
    ? customMessage.replace('{name}', user.name)
    : tier.sampleEntranceMessage.replace('{name}', user.name);

  const crownLevel = Math.max(1, Math.min(5, Math.round(level || 1)));

  useEffect(() => {
    // Auto dismiss after 4.5 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className={
        className ||
        "absolute right-1 sm:right-2 top-[58%] -translate-y-1/2 z-40 pointer-events-auto w-auto max-w-[220px] sm:max-w-[240px] select-none cursor-pointer animate-in slide-in-from-right-full fade-in duration-300 ease-out filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
      }
      dir="rtl"
      title="انقر للإغلاق"
    >
      <div className="relative group">
        {/* Subtle Close Button on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          type="button"
          className="absolute -top-1.5 -left-1.5 z-30 w-4 h-4 rounded-full bg-slate-950/90 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity shadow"
          title="إغلاق"
        >
          <X className="w-2.5 h-2.5" />
        </button>

        {/* =========================================================================
            TIER 1: THE NOBLE BRONZE CREST (التاج البرونزي النبيل)
            Small, sleek, warm burnished bronze badge
            ========================================================================= */}
        {crownLevel === 1 && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-900 p-[1px] shadow-[0_0_10px_rgba(217,119,6,0.35)]">
            <div className="relative flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-[#1a0f05]/95 via-[#2b1608]/95 to-[#150b04]/95 rounded-[11px] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(245,158,11,0.15)_50%,transparent_75%)] animate-pulse pointer-events-none" />

              {/* Avatar + Crown */}
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-lg p-0.5 bg-gradient-to-br from-amber-400 to-amber-800 border border-amber-400/70 shadow">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-[6px] object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-1.5 drop-shadow z-20 scale-75 origin-top-right">
                  <RealisticCrown level={1} size="xs" />
                </div>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1 leading-tight z-10">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 font-bold border border-amber-600/40">
                    VIP 1
                  </span>
                  <h4 className="text-[10.5px] font-black text-amber-100 truncate max-w-[85px]">
                    {user.name}
                  </h4>
                </div>
                <p className="text-[8px] font-bold text-amber-300/90 truncate mt-0.5 max-w-[110px]">
                  {entranceText}
                </p>
              </div>

              {/* Icon Seal */}
              <div className="w-5 h-5 rounded-md bg-amber-950/80 border border-amber-600/40 flex items-center justify-center shrink-0 text-amber-400 z-10">
                <Shield className="w-3 h-3 text-amber-400" />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TIER 2: THE IMPERIAL FROSTED SAPPHIRE (التاج الفضي الإمبراطوري)
            Small, sleek, cyan-platinum ice badge
            ========================================================================= */}
        {crownLevel === 2 && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600 p-[1px] shadow-[0_0_12px_rgba(56,189,248,0.45)]">
            <div className="relative flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-[#082f49]/95 via-[#0c4a6e]/95 to-[#082f49]/95 rounded-[11px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.25),transparent_70%)] pointer-events-none" />

              {/* Avatar + Crown */}
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-lg p-0.5 bg-gradient-to-br from-sky-400 via-slate-100 to-blue-600 border border-white/80 shadow">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-[6px] object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-1.5 drop-shadow z-20 scale-75 origin-top-right">
                  <RealisticCrown level={2} size="xs" />
                </div>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1 leading-tight z-10">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] px-1 py-0.2 rounded bg-sky-950 text-sky-200 font-bold border border-sky-500/50">
                    VIP 2
                  </span>
                  <h4 className="text-[10.5px] font-black text-white truncate max-w-[85px] drop-shadow-[0_0_4px_rgba(56,189,248,0.6)]">
                    {user.name}
                  </h4>
                </div>
                <p className="text-[8px] font-bold text-sky-200 truncate mt-0.5 max-w-[110px]">
                  {entranceText}
                </p>
              </div>

              {/* Icon Seal */}
              <div className="w-5 h-5 rounded-md bg-sky-950/80 border border-sky-400/50 flex items-center justify-center shrink-0 text-sky-300 z-10">
                <Sparkles className="w-3 h-3 text-sky-300 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TIER 3: THE MAJESTIC EMERALD SOVEREIGN (التاج الزمردي الملكي)
            Small, sleek, emerald jade & gold badge
            ========================================================================= */}
        {crownLevel === 3 && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 p-[1px] shadow-[0_0_12px_rgba(16,185,129,0.5)]">
            <div className="relative flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-[#022c22]/95 via-[#064e3b]/95 to-[#022c22]/95 rounded-[11px] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_30%,rgba(16,185,129,0.2)_50%,transparent_70%)] animate-pulse pointer-events-none" />

              {/* Avatar + Crown */}
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-lg p-0.5 bg-gradient-to-br from-emerald-400 via-teal-200 to-yellow-500 border border-emerald-300 shadow">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-[6px] object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-1.5 drop-shadow z-20 scale-75 origin-top-right">
                  <RealisticCrown level={3} size="xs" />
                </div>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1 leading-tight z-10">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/60">
                    VIP 3
                  </span>
                  <h4 className="text-[10.5px] font-black text-emerald-100 truncate max-w-[85px] drop-shadow-[0_0_4px_rgba(16,185,129,0.6)]">
                    {user.name}
                  </h4>
                </div>
                <p className="text-[8px] font-bold text-emerald-200 truncate mt-0.5 max-w-[110px]">
                  {entranceText}
                </p>
              </div>

              {/* Icon Seal */}
              <div className="w-5 h-5 rounded-md bg-emerald-950/80 border border-emerald-400/50 flex items-center justify-center shrink-0 text-emerald-300 z-10">
                <Award className="w-3 h-3 text-emerald-300" />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TIER 4: THE GRAND RUBY SULTAN (التاج الياقوتي المهيب)
            Small, sleek, crimson ruby & gold laurels badge
            ========================================================================= */}
        {crownLevel === 4 && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-rose-500 via-amber-400 to-red-600 p-[1.5px] shadow-[0_0_14px_rgba(239,68,68,0.55)]">
            <div className="relative flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-[#450a0a]/95 via-[#7f1d1d]/95 to-[#450a0a]/95 rounded-[10px] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(254,205,211,0.25)_45%,transparent_70%)] animate-pulse pointer-events-none" />

              {/* Avatar + Crown */}
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-lg p-0.5 bg-gradient-to-br from-rose-500 via-amber-300 to-red-700 border border-white/90 shadow">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-[6px] object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-1.5 drop-shadow z-20 scale-75 origin-top-right">
                  <RealisticCrown level={4} size="xs" animated />
                </div>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1 leading-tight z-10">
                <div className="flex items-center gap-1">
                  <span className="text-[7px] px-1 py-0.2 rounded bg-red-950 text-amber-300 font-bold border border-rose-500/60">
                    VIP 4
                  </span>
                  <h4 className="text-[10.5px] font-black text-white truncate max-w-[85px] drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]">
                    {user.name}
                  </h4>
                </div>
                <p className="text-[8px] font-bold text-rose-200 truncate mt-0.5 max-w-[110px]">
                  {entranceText}
                </p>
              </div>

              {/* Icon Seal */}
              <div className="w-5 h-5 rounded-md bg-rose-950/80 border border-amber-400/60 flex items-center justify-center shrink-0 text-amber-300 z-10">
                <Crown className="w-3 h-3 fill-amber-400 text-amber-300" />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TIER 5: THE SUPREME CELESTIAL DIAMOND (التاج الألماسي الأسطوري الأعظم)
            Small, sleek, prismatic diamond & mythic gold badge
            ========================================================================= */}
        {crownLevel === 5 && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-300 via-sky-300 to-yellow-400 p-[1.5px] shadow-[0_0_16px_rgba(250,204,21,0.75)]">
            <div className="relative flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-[#1c1917]/98 via-[#0f172a]/98 to-[#1c1917]/98 rounded-[10px] overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_15%,rgba(254,240,138,0.3)_40%,rgba(56,189,248,0.3)_50%,transparent_75%)] animate-pulse pointer-events-none" />

              {/* Avatar + Crown */}
              <div className="relative shrink-0">
                <div className="w-7 h-7 rounded-lg p-0.5 bg-gradient-to-br from-amber-400 via-sky-200 to-purple-400 border border-white shadow">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-[6px] object-cover"
                  />
                </div>
                <div className="absolute -top-2.5 -right-1.5 drop-shadow z-20 scale-75 origin-top-right">
                  <RealisticCrown level={5} size="xs" animated />
                </div>
              </div>

              {/* Text Info */}
              <div className="min-w-0 flex-1 leading-tight z-10">
                <div className="flex items-center gap-1">
                  <span className="text-[6.5px] px-1 py-0.2 rounded bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black">
                    MYTHIC 5
                  </span>
                  <h4 className="text-[10.5px] font-black text-amber-200 truncate max-w-[85px] drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]">
                    {user.name}
                  </h4>
                </div>
                <p className="text-[8px] font-bold text-sky-200 truncate mt-0.5 max-w-[110px]">
                  {entranceText}
                </p>
              </div>

              {/* Icon Seal */}
              <div className="w-5 h-5 rounded-md bg-slate-950 border border-amber-300/80 flex items-center justify-center shrink-0 text-amber-300 z-10">
                <Gem className="w-3 h-3 text-cyan-300 fill-cyan-400/30 animate-pulse" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
