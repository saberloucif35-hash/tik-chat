import React, { useEffect, useState } from 'react';
import { VirtualGift, User } from '../../types';
import { sounds } from '../../utils/audioEffects';
import { formatCoins } from '../../utils/numberFormat';
import { Sparkles, X, Flame, Zap, Crown, Heart, Music2, Star } from 'lucide-react';

interface GiftAnimationOverlayProps {
  gift: VirtualGift | null;
  sender: User | null;
  receiver: User | null;
  onFinished: () => void;
}

export const GiftAnimationOverlay: React.FC<GiftAnimationOverlayProps> = ({
  gift,
  sender,
  receiver,
  onFinished,
}) => {
  const [step, setStep] = useState<number>(0);
  const [thunderFlash, setThunderFlash] = useState<boolean>(false);

  useEffect(() => {
    if (!gift) return;

    setStep(0);
    const stepTimer1 = setTimeout(() => setStep(1), 200);
    const stepTimer2 = setTimeout(() => setStep(2), 1200);

    // Trigger distinctive gift audio
    try {
      if (gift.animationEffect === 'universe') {
        sounds.playUniverseFanfare();
      } else if (gift.animationEffect === 'stars') {
        sounds.playEpicStars();
      } else if (gift.animationEffect === 'seal_whale' || gift.animationEffect === 'sam_whale') {
        sounds.playWhaleOceanSong();
      } else if (gift.animationEffect === 'lion_cub' || gift.animationEffect === 'lion') {
        sounds.playLionRoar();
      } else if (gift.animationEffect === 'zeus') {
        sounds.playThunder();
        // Lightning strobe sequence
        setThunderFlash(true);
        setTimeout(() => setThunderFlash(false), 120);
        setTimeout(() => setThunderFlash(true), 240);
        setTimeout(() => setThunderFlash(false), 380);
      } else if (gift.animationEffect === 'superhero') {
        sounds.playSuperheroClash();
      } else if (gift.animationEffect === 'golden_car' || gift.animationEffect === 'supercar') {
        sounds.playSupercarRev();
      } else if (gift.animationEffect === 'gorilla') {
        sounds.playGorillaRoar();
      } else if (gift.animationEffect === 'treasure_box') {
        sounds.playTreasureChest();
      } else if (gift.animationEffect === 'heart_target') {
        sounds.playCupidArrowHit();
      } else if (gift.animationEffect === 'dragon') {
        sounds.playDragonFire();
      } else if (gift.animationEffect === 'castle') {
        sounds.playFireworks();
      } else if (gift.animationEffect === 'private_jet') {
        sounds.playSupercarRev();
      } else if (gift.animationEffect === 'yacht' || gift.animationEffect === 'whale' || gift.animationEffect === 'planet') {
        sounds.playCosmicChime();
      } else {
        sounds.playGiftMagic();
      }
    } catch (e) {
      console.error('Failed to play audio:', e);
    }

    const duration = gift.price >= 25000 ? 6000 : 4500;
    const endTimer = setTimeout(() => {
      onFinished();
    }, duration);

    return () => {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(endTimer);
    };
  }, [gift, onFinished]);

  if (!gift || !sender || !receiver) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden select-none">
      {/* Dynamic Strobe / Backdrop Flash for Zeus */}
      {thunderFlash && (
        <div className="absolute inset-0 bg-cyan-300/40 z-30 pointer-events-none transition-opacity duration-75" />
      )}

      {/* Cinematic Dark Luxury Dimming Wash */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[3px] transition-opacity duration-700 pointer-events-none" />

      {/* Manual Quick Dismiss Button (pointer-events enabled) */}
      <button
        onClick={onFinished}
        className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 pointer-events-auto backdrop-blur-md transition-all shadow-lg active:scale-95"
        title="إغلاق العرض"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 🌟 TOP BANNER: Broadcast Ribbon with Avatars and Grand Gold Title */}
      <div className="absolute top-12 sm:top-16 z-30 px-3 sm:px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-black text-xs sm:text-sm shadow-2xl shadow-rose-500/50 flex items-center gap-2 sm:gap-3 border-2 border-amber-300/60 animate-bounce max-w-[95vw]">
        {/* Sender pill */}
        <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full text-amber-300 border border-amber-400/30">
          <img
            src={sender.avatar}
            alt={sender.name}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-amber-300 shadow"
          />
          <span className="truncate max-w-[80px] sm:max-w-[110px]">{sender.name}</span>
        </div>

        {/* Action text */}
        <div className="flex items-center gap-1.5 text-white text-xs sm:text-sm">
          <span>أهدى</span>
          <span className="text-lg sm:text-xl drop-shadow animate-pulse">{gift.icon}</span>
          <span className="text-yellow-200 font-black underline decoration-amber-400 truncate max-w-[130px] sm:max-w-none">
            {gift.nameAr}
          </span>
          <span>إلى</span>
        </div>

        {/* Receiver pill */}
        <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full text-rose-300 border border-rose-400/30">
          <img
            src={receiver.avatar}
            alt={receiver.name}
            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-rose-300 shadow"
          />
          <span className="truncate max-w-[80px] sm:max-w-[110px]">{receiver.name}</span>
        </div>

        {/* Coin badge */}
        <div className="hidden md:flex items-center gap-1 bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-xs shadow">
          <span>🪙 {formatCoins(gift.price)}</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🎭 CENTERPIECE LUXURY GIFT ANIMATIONS */}
      {/* ========================================================================= */}
      <div className="relative z-20 flex flex-col items-center justify-center scale-90 sm:scale-105 md:scale-110 max-w-2xl px-4 text-center">

        {/* ------------------------------------------------------------- */}
        {/* 1. 🪐 TIKTOK UNIVERSE (أضخم وأفخم هدية VIP) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'universe' && (
          <div className="relative flex flex-col items-center">
            {/* Giant swirling cosmic nebula backdrop */}
            <div className="w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] rounded-full bg-gradient-to-tr from-purple-700/40 via-pink-600/30 to-amber-500/30 blur-3xl absolute -top-16 pointer-events-none animate-pulse" />
            
            {/* Rotating planetary orbital ring */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
              {/* Outer glowing cosmic orbit ring */}
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: '18s' }} />
              <div className="absolute inset-4 rounded-full border-2 border-pink-500/50 animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }} />

              {/* Orbiting celestial satellites */}
              <div className="absolute top-0 text-3xl animate-bounce">☄️</div>
              <div className="absolute bottom-2 right-4 text-2xl animate-pulse">✨</div>
              <div className="absolute top-1/3 left-0 text-3xl animate-spin" style={{ animationDuration: '6s' }}>💫</div>
              <div className="absolute bottom-6 left-6 text-2xl">⭐</div>

              {/* Central Giant Cosmic Planet with Rings */}
              <div className="relative z-10 flex items-center justify-center">
                <div className="text-[7.5rem] sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(236,72,153,0.9)] transform hover:scale-110 transition-transform animate-pulse">
                  🪐
                </div>
                {/* Glowing stellar core */}
                <div className="absolute w-28 h-28 rounded-full bg-amber-300/40 blur-xl animate-ping pointer-events-none" />
              </div>
            </div>

            {/* Supreme Glowing Title */}
            <div className="mt-2 text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-400 drop-shadow-[0_4px_25px_rgba(234,179,8,0.9)] tracking-wider">
              ✨ YALLA UNIVERSE ✨
            </div>
            <div className="text-base sm:text-xl font-bold text-amber-200 mt-1 drop-shadow">
              أضخم هدية ملكية فلكية في الشرق الأوسط! 👑🌌
            </div>
            <div className="mt-2 px-5 py-1 rounded-full bg-black/60 border border-amber-400/60 text-amber-300 text-xs sm:text-sm font-black shadow-lg">
              ✨ كرم إمبراطوري يضيء سماء الغرفة بالكامل ✨
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 2. ✨ TIKTOK STARS (دوامة النجوم الفلكية) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'stars' && (
          <div className="relative flex flex-col items-center">
            <div className="w-80 h-80 rounded-full bg-gradient-to-r from-amber-400/40 to-yellow-500/30 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Star spiral particles */}
              <div className="absolute inset-0 rounded-full border-2 border-yellow-300/60 animate-spin" style={{ animationDuration: '8s' }} />
              <div className="absolute top-2 left-6 text-3xl animate-bounce">🧑‍🚀</div>
              <div className="absolute bottom-4 right-6 text-3xl animate-spin" style={{ animationDuration: '5s' }}>🚀</div>
              <div className="absolute top-1/2 right-0 text-2xl animate-ping">🌟</div>
              <div className="absolute bottom-1/2 left-2 text-2xl animate-ping">⭐</div>

              <div className="text-8xl sm:text-9xl drop-shadow-[0_20px_40px_rgba(251,191,36,0.95)] z-10 animate-pulse">
                🌟
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 drop-shadow mt-2">
              دوامة نجوم الساحة الأسطورية! ⭐✨
            </div>
            <div className="text-sm sm:text-base font-bold text-yellow-200 mt-1">
              آلاف النجوم تتلألأ وتزف المستلم إلى قمة المجد!
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. 🐋 SEAL AND WHALE (فقمة وحوت المحيط الفضي) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'seal_whale' && (
          <div className="relative flex flex-col items-center">
            {/* Silvery Moonlight Aura */}
            <div className="w-96 h-96 rounded-full bg-sky-400/30 blur-3xl absolute -top-14 pointer-events-none animate-pulse" />
            
            {/* Luminous Silver Moon in background */}
            <div className="absolute -top-12 text-6xl sm:text-7xl opacity-80 animate-pulse">
              🌕
            </div>

            <div className="relative flex items-center justify-center my-4">
              {/* Giant Blue Whale leaping */}
              <div className="text-8xl sm:text-[10rem] drop-shadow-[0_20px_45px_rgba(14,165,233,0.9)] transform -rotate-12 animate-bounce z-10">
                🐋
              </div>
              {/* Cute Seal on top riding the wave */}
              <div className="absolute -top-8 right-6 text-5xl sm:text-6xl animate-pulse z-20">
                🦭
              </div>
              {/* Geyser fountain splash */}
              <div className="absolute -bottom-6 text-4xl sm:text-5xl animate-spin" style={{ animationDuration: '12s' }}>
                🌊
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 drop-shadow">
              قفزة الفقمة والحوت الأزرق الساحر! 🌊🦭
            </div>
            <div className="text-sm sm:text-base font-bold text-sky-200 mt-1">
              أمواج بحرية ونوافير كريستالية تعانق ضوء القمر!
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. 🦁 LEON AND LION (الأسد الملك والشبل) */}
        {/* ------------------------------------------------------------- */}
        {(gift.animationEffect === 'lion_cub' || gift.animationEffect === 'lion') && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-amber-500/35 blur-3xl absolute -top-12 pointer-events-none animate-pulse" />
            
            {/* Crown hovering over the majestic Lion */}
            <div className="relative">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl sm:text-6xl animate-bounce z-20">
                👑
              </div>
              <div className="flex items-end justify-center gap-2">
                {/* Father Lion */}
                <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(245,158,11,0.95)] z-10">
                  🦁
                </div>
                {/* Little Cub Lion */}
                <div className="text-5xl sm:text-6xl drop-shadow-[0_15px_30px_rgba(245,158,11,0.8)] pb-2 animate-bounce z-10">
                  🦁
                </div>
              </div>
              {/* Golden Sun Savanna Rocks */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-4xl opacity-80">
                ⛰️
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 drop-shadow-[0_4px_20px_rgba(245,158,11,0.9)] mt-3">
              زئير الأسد الملك والشبل الشجاع! 🦁👑
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-200 mt-1 bg-black/40 px-4 py-1 rounded-full border border-amber-500/40">
              هيبة الملوك وأصالة الكرم تهز أركان المسرح 🔥
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 5. ⚡ ZEUS (زيوس ملك الصواعق والرعد) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'zeus' && (
          <div className="relative flex flex-col items-center">
            {/* Thunderstorm Dark Cyan Glow */}
            <div className="w-96 h-96 rounded-full bg-cyan-500/40 blur-3xl absolute -top-10 pointer-events-none animate-ping" />
            
            {/* Storm clouds & lightning */}
            <div className="relative flex items-center justify-center">
              <div className="absolute -top-12 text-6xl animate-pulse">🌩️</div>
              <div className="absolute -top-4 -left-10 text-5xl animate-bounce">⚡</div>
              <div className="absolute -top-4 -right-10 text-5xl animate-bounce">⚡</div>

              {/* Zeus Avatar / Figure with electric blue eyes */}
              <div className="relative text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_60px_rgba(6,182,212,0.95)] z-10 animate-pulse">
                ⚡👑
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-200 to-indigo-300 drop-shadow-[0_4px_25px_rgba(6,182,212,0.9)] mt-2">
              صاعقة زيوس ملك الرعد والبرق! ⚡🌩️
            </div>
            <div className="text-sm sm:text-base font-bold text-cyan-200 mt-1 bg-black/50 px-4 py-1 rounded-full border border-cyan-400/50">
              شحنات كهربائية جبارة تزلزل الشاشة بصوت الرعد!
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 6. 💥 SUPERHERO FIGHT (معركة الأبطال الخارقين) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'superhero' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-gradient-to-r from-rose-600/40 via-cyan-500/30 to-amber-500/40 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            {/* Clashing Heroes */}
            <div className="relative flex items-center justify-center gap-4 my-2">
              <div className="text-7xl sm:text-8xl transform translate-x-4 animate-bounce">
                🦸‍♂️
              </div>
              <div className="text-7xl sm:text-8xl drop-shadow-[0_20px_50px_rgba(239,68,68,0.9)] animate-ping z-20">
                💥
              </div>
              <div className="text-7xl sm:text-8xl transform -translate-x-4 animate-bounce">
                🦹‍♂️
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-yellow-200 to-cyan-400 drop-shadow mt-2">
              صدام الأبطال الخارقين الأسطوري! 💥⚡
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-200 mt-1 bg-black/50 px-4 py-1 rounded-full border border-rose-500/40">
              انفجار طاقة ليزر وشحنات تفجيرية تملأ المسرح!
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 7. 🏎️ GOLDEN SPORTS CAR (سيارة السوبر كار الذهبية) */}
        {/* ------------------------------------------------------------- */}
        {(gift.animationEffect === 'golden_car' || gift.animationEffect === 'supercar') && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-amber-400/30 blur-3xl absolute -top-12 pointer-events-none animate-pulse" />
            
            <div className="relative flex items-center justify-center my-3">
              {/* Exhaust flame smoke */}
              <div className="absolute -left-12 bottom-2 text-4xl animate-pulse">
                💨🔥
              </div>
              {/* Golden Supercar speeding */}
              <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(245,158,11,0.95)] z-10 animate-bounce">
                🏎️
              </div>
              {/* Finish line flags */}
              <div className="absolute -right-8 top-0 text-4xl animate-bounce">
                🏁✨
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-500 drop-shadow mt-2">
              انطلاق السوبر كار الذهبية الفارهة! 🏎️💨
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-200 mt-1 bg-black/50 px-4 py-1 rounded-full border border-amber-500/40">
              سرعة جنونية وهدير محرك رياضي من الذهب الخالص 🏁
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 8. 🦍 GORILLA (الغوريلا العملاقة كينغ كونغ) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'gorilla' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-emerald-600/30 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="relative flex items-center justify-center my-3">
              <div className="absolute -top-10 text-4xl animate-bounce">🌲</div>
              {/* Giant Gorilla beating chest */}
              <div className="text-8xl sm:text-[10rem] drop-shadow-[0_25px_50px_rgba(55,65,81,0.95)] z-10 animate-bounce">
                🦍
              </div>
              {/* Shockwave bass thumps */}
              <div className="absolute -bottom-4 text-4xl animate-ping">
                💥
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-slate-200 drop-shadow mt-2">
              زلزال الغوريلا الجبلية العملاقة! 🦍🌲
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-200 mt-1 bg-black/50 px-4 py-1 rounded-full border border-emerald-500/40">
              دق الصدور والزئير الجبار يهز أرجاء القاعة!
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 9. 🎁 TREASURE BOX (صندوق الكنز الملكي التفاعلي) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'treasure_box' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-gradient-to-r from-amber-400/40 to-rose-500/40 blur-3xl absolute -top-12 pointer-events-none animate-pulse" />
            
            <div className="relative flex items-center justify-center my-2">
              {/* Golden Key flying */}
              <div className="absolute -top-10 left-4 text-4xl animate-bounce">
                🗝️✨
              </div>
              {/* Ornate Gold & Ruby Chest */}
              <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(245,158,11,0.95)] z-10 animate-bounce">
                🎁
              </div>
              {/* Shower of gems and diamonds */}
              <div className="absolute -top-4 right-2 text-4xl animate-ping">
                💎
              </div>
              <div className="absolute bottom-2 left-0 text-3xl animate-ping">
                🪙
              </div>
              <div className="absolute -bottom-4 right-4 text-4xl animate-pulse">
                👑
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-rose-300 to-amber-400 drop-shadow mt-2">
              انفجار صندوق الكنز الملكي المرصع! 💎🪙
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-200 mt-1 bg-black/50 px-4 py-1 rounded-full border border-amber-500/40">
              أمطار من الذهب والألماس والياقوت تغمر المستلم!
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 10. 🐳 SAM THE WHALE (سام الحوت الأزرق الكوني) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'sam_whale' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-cyan-400/35 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="relative flex items-center justify-center my-3">
              <div className="absolute -top-8 text-5xl animate-pulse">🌈</div>
              <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_20px_45px_rgba(6,182,212,0.9)] z-10 animate-bounce">
                🐳
              </div>
              <div className="absolute -bottom-4 text-4xl animate-spin" style={{ animationDuration: '10s' }}>
                🌊
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 drop-shadow mt-2">
              سام الحوت الأزرق ورذاذ قوس قزح! 🐳🌈
            </div>
            <div className="text-sm sm:text-base font-bold text-sky-200 mt-1">
              شلالات نقية من محيطات الفخامة والجمال
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 11. 🎯 HEART TARGET (سهم قلب الحب) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'heart_target' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-rose-500/35 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="relative flex items-center justify-center my-3">
              {/* Flying Arrow */}
              <div className="absolute -left-16 text-5xl animate-bounce">
                🏹
              </div>
              {/* Bullseye Heart Target */}
              <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(244,63,94,0.95)] z-10 animate-pulse">
                🎯
              </div>
              {/* Cupid Heart burst */}
              <div className="absolute -top-6 -right-6 text-5xl animate-ping">
                💘
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-300 drop-shadow mt-2">
              إصابة الهدف بسهم كيوبيد في قلب الحب! 💘🎯
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-200 mt-1 bg-black/50 px-4 py-1 rounded-full border border-rose-500/40">
              سهم العاطفة والمحبة الصادقة يصيب المنتصف تماماً!
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 12. 🐉 IMPERIAL DRAGON (التنين الناري الإمبراطوري) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'dragon' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-red-600/35 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(239,68,68,0.95)] z-10 animate-bounce">
              🐉
            </div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-300 to-yellow-400 drop-shadow mt-2">
              ألسنة لهب التنين الإمبراطوري! 🌋🔥
            </div>
            <div className="text-sm sm:text-base font-bold text-orange-200 mt-1 bg-black/50 px-4 py-1 rounded-full border border-orange-500/40">
              طاقة أسطورية تعبر عن الجود والكرم الفخم
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 13. 🏰 DIAMOND PALACE (قلعة الألماس الساحرة) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'castle' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-purple-600/35 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="relative">
              <div className="absolute -top-10 left-0 text-4xl animate-bounce">🎆</div>
              <div className="absolute -top-10 right-0 text-4xl animate-bounce">🎆</div>
              <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(168,85,247,0.95)] z-10 animate-pulse">
                🏰
              </div>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-200 to-amber-200 drop-shadow mt-2">
              قلعة الألماس وألعاب نارية تضيء المسرح! 🏰🎆
            </div>
            <div className="text-sm sm:text-base font-bold text-purple-200 mt-1">
              احتفال ملكي فاخر يليق بنجوم الغرفة
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 14. ✈️ ROYAL PRIVATE JET (طائرة الملوك الخاصة) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'private_jet' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-amber-400/30 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(251,191,36,0.9)] z-10 animate-bounce">
              ✈️
            </div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow mt-2">
              طائرة الملوك الخاصة VIP تحلق فوق السحاب! ☁️✨
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-200 mt-1">
              رحلة الملوك الخاصة لكبار الشخصيات
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 15. 🛥️ LUXURY ROYAL YACHT (يخت الملوك الفاخر) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'yacht' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-cyan-500/30 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(14,165,233,0.9)] z-10 animate-bounce">
              🛥️
            </div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-teal-300 drop-shadow mt-2">
              إبحار يخت الملوك الفاخر في الأمواج المتلألئة! 🌊🌴
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 16. 💐 999 ROYAL ROSES (باقة 999 وردة جوري ملكية) */}
        {/* ------------------------------------------------------------- */}
        {gift.animationEffect === 'roses_999' && (
          <div className="relative flex flex-col items-center">
            <div className="w-96 h-96 rounded-full bg-rose-600/35 blur-3xl absolute -top-10 pointer-events-none animate-pulse" />
            
            <div className="text-8xl sm:text-[9.5rem] drop-shadow-[0_25px_50px_rgba(244,63,94,0.95)] z-10 animate-bounce">
              💐
            </div>
            <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-200 drop-shadow mt-2">
              عاصفة 999 وردة جوري ملكية! 💖🌹
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-200 mt-1">
              أمطار الجوري والمحبة الصادقة تعانق القلوب
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 💫 PARTICLES RAIN: Falling luxury sparkles, stars, and coins */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {Array.from({ length: 32 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-xl sm:text-3xl animate-ping select-none"
            style={{
              top: `${(i * 13) % 88 + 6}%`,
              left: `${(i * 29) % 92 + 4}%`,
              animationDelay: `${(i * 0.18) % 2.5}s`,
              animationDuration: '2.5s',
            }}
          >
            {gift.animationEffect === 'universe' || gift.animationEffect === 'stars'
              ? (i % 4 === 0 ? '✨' : i % 4 === 1 ? '🪐' : i % 4 === 2 ? '⭐' : '🌟')
              : gift.animationEffect === 'treasure_box' || gift.animationEffect === 'golden_car'
              ? (i % 3 === 0 ? '🪙' : i % 3 === 1 ? '💎' : '✨')
              : gift.animationEffect === 'zeus'
              ? (i % 3 === 0 ? '⚡' : i % 3 === 1 ? '🌩️' : '✨')
              : gift.animationEffect === 'heart_target' || gift.animationEffect === 'roses_999'
              ? (i % 3 === 0 ? '💖' : i % 3 === 1 ? '🌹' : '✨')
              : (i % 3 === 0 ? '✨' : i % 3 === 1 ? '🌟' : '💫')}
          </div>
        ))}
      </div>
    </div>
  );
};
