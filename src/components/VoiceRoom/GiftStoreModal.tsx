import React, { useState } from 'react';
import { X, Gift, Coins, Sparkles, Send, Check, Eye, Music } from 'lucide-react';
import { VirtualGift, User, VoiceSeat } from '../../types';
import { virtualGifts } from '../../data/mockData';
import { sounds } from '../../utils/audioEffects';
import { formatCoins } from '../../utils/numberFormat';

interface GiftStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  seats: VoiceSeat[];
  roomHost?: User | null;
  onSendGift: (gift: VirtualGift, receiver: User) => void;
  onPreviewGift?: (gift: VirtualGift) => void;
  onOpenRecharge?: () => void;
}

export const GiftStoreModal: React.FC<GiftStoreModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  seats,
  roomHost,
  onSendGift,
  onPreviewGift,
  onOpenRecharge,
}) => {
  const [selectedGift, setSelectedGift] = useState<VirtualGift>(virtualGifts[0]);
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'luxury' | 'creatures' | 'vehicles' | 'interactive' | 'romance'
  >('all');

  // Eligible receivers on mic or room host (strict real users)
  const eligibleReceivers = seats
    .map((s) => s.user)
    .filter((u): u is User => u !== null && u.id !== currentUser.id);

  if (roomHost && roomHost.id !== currentUser.id && !eligibleReceivers.some((u) => u.id === roomHost.id)) {
    eligibleReceivers.unshift(roomHost);
  }

  // Also include current user as fallback if no one else is on stage
  const [selectedReceiver, setSelectedReceiver] = useState<User | null>(
    eligibleReceivers[0] || currentUser
  );

  if (!isOpen) return null;

  const filteredGifts =
    activeCategory === 'all'
      ? virtualGifts
      : virtualGifts.filter((g) => {
          if (activeCategory === 'luxury') return g.category === 'luxury';
          if (activeCategory === 'creatures') return g.category === 'creatures';
          if (activeCategory === 'vehicles') return g.category === 'vehicles';
          if (activeCategory === 'interactive') return g.category === 'interactive';
          if (activeCategory === 'romance') return g.category === 'romance';
          return true;
        });

  const canAfford = currentUser.coins >= selectedGift.price && selectedReceiver !== null;

  const handleSend = () => {
    if (!canAfford || !selectedReceiver) return;
    onSendGift(selectedGift, selectedReceiver);
    onClose();
  };

  const handlePreview = (gift: VirtualGift) => {
    if (onPreviewGift) {
      onPreviewGift(gift);
    } else {
      // Direct sound preview
      if (gift.animationEffect === 'universe') sounds.playUniverseFanfare();
      else if (gift.animationEffect === 'stars') sounds.playEpicStars();
      else if (gift.animationEffect === 'zeus') sounds.playThunder();
      else if (gift.animationEffect === 'superhero') sounds.playSuperheroClash();
      else if (gift.animationEffect === 'golden_car') sounds.playSupercarRev();
      else if (gift.animationEffect === 'treasure_box') sounds.playTreasureChest();
      else if (gift.animationEffect === 'gorilla') sounds.playGorillaRoar();
      else sounds.playGiftMagic();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#121217] border border-slate-800 rounded-3xl max-w-xl w-full p-3.5 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Header with Luxury Brand Accent */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
              🎁
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-black text-white">
                  متجر هدايا VIP الفاخرة
                </h3>
                <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-black text-[9px] shadow-sm">
                  NEW
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400">
                هدايا أسطورية بمؤثرات صوتية ومرئية 3D تهز أرجاء الغرفة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Coin Balance indicator */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-black text-amber-300 font-mono">
                {formatCoins(currentUser.coins)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 50/50 Revenue Split Notice */}
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-500/20 rounded-xl p-2 my-2 text-xs flex items-center gap-2 text-amber-300 shrink-0">
          <span className="text-base shrink-0">⚖️</span>
          <div className="leading-tight text-[11px] text-slate-300">
            <span className="font-bold text-amber-300">توزيع العملات:</span> يحصل المستلم على <span className="font-bold text-amber-400">50%</span> وتصل <span className="font-bold text-amber-400">50%</span> تلقائياً للإدارة 👑.
          </div>
        </div>

        {/* Receiver Picker on Stage */}
        <div className="mb-2 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-300">
              إهداء إلى العضو على المايك:
            </label>
            {selectedReceiver && (
              <span className="text-[11px] font-bold text-rose-400">
                المستلم: {selectedReceiver.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {eligibleReceivers.length > 0 ? (
              eligibleReceivers.map((u) => {
                const isChosen = selectedReceiver?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => setSelectedReceiver(u)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs transition-all shrink-0 ${
                      isChosen
                        ? 'bg-gradient-to-r from-rose-500/20 to-amber-500/20 border-rose-500 text-white font-bold ring-2 ring-rose-500/30'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-700"
                    />
                    <span className="truncate max-w-[85px] text-[11px]">{u.name}</span>
                  </button>
                );
              })
            ) : (
              <div className="w-full py-1 px-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 text-center">
                لا يوجد متحدثون آخرون على المايك حالياً (سيتم إرسالها إلى ملفك أو لجميع المستمعين)
              </div>
            )}
          </div>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-1 pb-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-slate-800/60">
          {[
            { id: 'all', label: '🌟 الكل' },
            { id: 'luxury', label: '👑 VIP أسطوري' },
            { id: 'creatures', label: '🌊 كائنات وبحار' },
            { id: 'vehicles', label: '🏎️ مركبات وخوارق' },
            { id: 'interactive', label: '💎 تفاعلي وهدايا' },
            { id: 'romance', label: '💖 محبة ورومانسية' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'bg-slate-900/60 border border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* GIFTS GRID (Luxurious TikTok / Yalla Style) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 my-2 overflow-y-auto pr-1 flex-1 min-h-0">
          {filteredGifts.map((gift) => {
            const isSelected = selectedGift.id === gift.id;
            return (
              <div
                key={gift.id}
                id={`gift-card-${gift.id}`}
                onClick={() => setSelectedGift(gift)}
                className={`group relative p-2 sm:p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-b from-rose-950/40 via-slate-900 to-slate-950 border-rose-500 ring-2 ring-rose-500/40 shadow-xl shadow-rose-950/50 scale-[1.02]'
                    : 'bg-[#18181f]/90 border-slate-800/90 hover:border-slate-700 hover:bg-[#20202a]'
                }`}
              >
                {/* Top Badges: New tag and Music tag */}
                <div className="w-full flex items-center justify-between pointer-events-none mb-0.5">
                  {gift.isNew ? (
                    <span className="px-1.5 py-0.2 rounded-md bg-rose-600 text-white text-[8px] font-black tracking-wider uppercase shadow">
                      New
                    </span>
                  ) : gift.badgeTag ? (
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[8px] font-bold truncate max-w-[65px]">
                      {gift.badgeTag.split(' ')[0]}
                    </span>
                  ) : (
                    <span />
                  )}

                  {gift.hasMusic && (
                    <span
                      title="مؤثرات موسيقية خاصة"
                      className="p-0.5 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[9px]"
                    >
                      <Music className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Big Center Artwork Icon */}
                <div className="my-1 relative flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform filter drop-shadow">
                    {gift.icon}
                  </span>
                  {isSelected && (
                    <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full pointer-events-none" />
                  )}
                </div>

                {/* Gift Name and Coin Price */}
                <div className="w-full">
                  <span className="text-[11px] sm:text-xs font-black text-white truncate block">
                    {gift.nameAr}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate block opacity-75">
                    {gift.name}
                  </span>

                  <div className="flex items-center justify-center gap-1 text-[11px] font-black text-amber-400 mt-1 bg-black/40 py-0.5 rounded-lg border border-slate-800">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span className="font-mono">{formatCoins(gift.price)}</span>
                  </div>
                </div>

                {/* Selected Checkmark badge */}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Gift Details & Description Card */}
        <div className="p-2.5 rounded-2xl bg-slate-950/90 border border-slate-800/90 my-1 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0">{selectedGift.icon}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-xs truncate">
                  {selectedGift.nameAr}
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  ({formatCoins(selectedGift.price)} عملة)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {selectedGift.descriptionAr}
              </p>
            </div>
          </div>

          {/* Preview Animation Button */}
          <button
            type="button"
            onClick={() => handlePreview(selectedGift)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-[10px] font-bold flex items-center gap-1 shrink-0 active:scale-95 transition-all"
            title="مشاهدة وسماع تأثير الهدية مباشرة"
          >
            <Eye className="w-3.5 h-3.5 text-pink-400" />
            <span>معاينة الهدية 👁️</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL FOOTER & SEND ACTION */}
        {/* ========================================================================= */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
          {!canAfford ? (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-rose-400 font-bold">
                ⚠️ رصيدك غير كافٍ!
              </span>
              {onOpenRecharge && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRecharge();
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all"
                >
                  <Coins className="w-3.5 h-3.5 text-slate-950" />
                  <span>شحن الرصيد 💳</span>
                </button>
              )}
            </div>
          ) : (
            <div className="text-[10px] text-slate-400">
              سيتم خصم <span className="text-amber-400 font-bold font-mono">{formatCoins(selectedGift.price)}</span> عملة
            </div>
          )}

          {/* Primary Send Button (TikTok / Yalla Pink Pill Style) */}
          <button
            id="confirm-send-gift-btn"
            onClick={handleSend}
            disabled={!canAfford}
            className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl shrink-0 ${
              canAfford
                ? 'bg-gradient-to-r from-[#ff0050] via-rose-600 to-amber-500 hover:opacity-90 text-white shadow-rose-600/30 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>إرسال {selectedGift.nameAr}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
