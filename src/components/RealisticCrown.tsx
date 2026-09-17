import React from 'react';

interface RealisticCrownProps {
  level: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

export const RealisticCrown: React.FC<RealisticCrownProps> = ({
  level = 1,
  size = 'md',
  className = '',
  showGlow = false,
  animated = false,
}) => {
  // Normalize level between 1 and 5
  const crownLevel = Math.max(1, Math.min(5, Math.round(level || 1)));

  // Size calculation
  const getDimensions = () => {
    if (typeof size === 'number') return { w: size, h: size };
    switch (size) {
      case 'xs': return { w: 18, h: 18 };
      case 'sm': return { w: 26, h: 26 };
      case 'md': return { w: 40, h: 40 };
      case 'lg': return { w: 56, h: 56 };
      case 'xl': return { w: 76, h: 76 };
      default: return { w: 40, h: 40 };
    }
  };

  const { w, h } = getDimensions();

  // Glow filters and drop-shadows per tier
  const glowStyle = showGlow
    ? crownLevel === 1
      ? 'drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]'
      : crownLevel === 2
      ? 'drop-shadow-[0_0_10px_rgba(203,213,225,0.7)]'
      : crownLevel === 3
      ? 'drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]'
      : crownLevel === 4
      ? 'drop-shadow-[0_0_14px_rgba(244,63,94,0.8)]'
      : 'drop-shadow-[0_0_16px_rgba(56,189,248,0.9)]'
    : 'drop-shadow-md';

  const animClass = animated ? 'hover:scale-110 transition-transform duration-300' : '';

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none ${glowStyle} ${animClass} ${className}`}
      style={{ width: w, height: h }}
      title={`تاج المستوى ${crownLevel}`}
    >
      {/* =========================================================
          LEVEL 1: تاج الملك البرونزي النبيل (Bronze Noble King's Crown)
          Antique heavy bronze metal, crenellated peaks, amber topaz jewels
          ========================================================= */}
      {crownLevel === 1 && (
        <svg viewBox="0 0 100 85" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Bronze Metal Gradients */}
            <linearGradient id="bronzeBase" x1="0" y1="0" x2="100" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#cd7f32" />
              <stop offset="25%" stopColor="#f4a460" />
              <stop offset="50%" stopColor="#8c4c1e" />
              <stop offset="75%" stopColor="#d48a37" />
              <stop offset="100%" stopColor="#5c3010" />
            </linearGradient>
            <linearGradient id="bronzeHighlight" x1="50" y1="10" x2="50" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffc078" />
              <stop offset="60%" stopColor="#a3541a" />
              <stop offset="100%" stopColor="#451e06" />
            </linearGradient>
            <radialGradient id="amberGem" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="50" cy="80" rx="42" ry="4" fill="rgba(0,0,0,0.4)" />

          {/* Crown Body - Heavy crenellated medieval bronze structure */}
          <path
            d="M8 72 L12 36 L28 48 L50 20 L72 48 L88 36 L92 72 Z"
            fill="url(#bronzeBase)"
            stroke="#5c3010"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Shading & 3D bevel ridges */}
          <path d="M50 20 L50 72 M28 48 L32 72 M72 48 L68 72" stroke="#451e06" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M12 36 L24 72 M88 36 L76 72" stroke="#ffc078" strokeWidth="1" strokeOpacity="0.4" />

          {/* Bottom Circlet Band */}
          <rect x="8" y="66" width="84" height="11" rx="4" fill="url(#bronzeHighlight)" stroke="#3e1b04" strokeWidth="2" />
          
          {/* Engraved braided studs on circlet */}
          <line x1="12" y1="71.5" x2="88" y2="71.5" stroke="#451e06" strokeWidth="1" strokeDasharray="2 3" />

          {/* Bronze Spheres on Spikes */}
          <circle cx="12" cy="34" r="5" fill="url(#bronzeHighlight)" stroke="#451e06" strokeWidth="1.5" />
          <circle cx="28" cy="46" r="4.5" fill="url(#bronzeHighlight)" stroke="#451e06" strokeWidth="1.5" />
          <circle cx="50" cy="18" r="7" fill="url(#bronzeHighlight)" stroke="#451e06" strokeWidth="2" />
          <circle cx="72" cy="46" r="4.5" fill="url(#bronzeHighlight)" stroke="#451e06" strokeWidth="1.5" />
          <circle cx="88" cy="34" r="5" fill="url(#bronzeHighlight)" stroke="#451e06" strokeWidth="1.5" />

          {/* Top Center Amber Gem */}
          <circle cx="50" cy="18" r="3.5" fill="url(#amberGem)" />
          <circle cx="49" cy="16.5" r="1" fill="#fff" />

          {/* Circlet Amber Topaz Cabochons */}
          <circle cx="22" cy="71.5" r="3" fill="url(#amberGem)" stroke="#451e06" strokeWidth="0.8" />
          <circle cx="36" cy="71.5" r="3" fill="url(#amberGem)" stroke="#451e06" strokeWidth="0.8" />
          <circle cx="50" cy="71.5" r="4.5" fill="url(#amberGem)" stroke="#451e06" strokeWidth="1" />
          <circle cx="48.5" cy="70" r="1.5" fill="#fff" opacity="0.9" />
          <circle cx="64" cy="71.5" r="3" fill="url(#amberGem)" stroke="#451e06" strokeWidth="0.8" />
          <circle cx="78" cy="71.5" r="3" fill="url(#amberGem)" stroke="#451e06" strokeWidth="0.8" />

          {/* Bronze Shield in Center Peak */}
          <polygon points="50,34 43,46 50,56 57,46" fill="#78350f" stroke="#ffc078" strokeWidth="1.5" />
          <circle cx="50" cy="45" r="2.5" fill="url(#amberGem)" />
        </svg>
      )}

      {/* =========================================================
          LEVEL 2: تاج الملك الفضي الإمبراطوري (Silver Imperial King's Crown)
          Polished platinum & sterling silver, imperial high arches, royal blue sapphires & pearls
          ========================================================= */}
      {crownLevel === 2 && (
        <svg viewBox="0 0 100 88" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="silverBase" x1="0" y1="0" x2="100" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="55%" stopColor="#cbd5e1" />
              <stop offset="80%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="silverCross" x1="50" y1="4" x2="50" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <radialGradient id="sapphireGem" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#93c5fd" />
              <stop offset="35%" stopColor="#2563eb" />
              <stop offset="75%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </radialGradient>
            <radialGradient id="pearl" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#94a3b8" />
            </radialGradient>
          </defs>

          {/* Shadow */}
          <ellipse cx="50" cy="84" rx="42" ry="4" fill="rgba(0,0,0,0.5)" />

          {/* Back Imperial Arches (Silver filigree) */}
          <path d="M16 68 Q30 30 50 20 Q70 30 84 68" stroke="url(#silverBase)" strokeWidth="4" fill="none" opacity="0.8" />
          <path d="M30 68 Q40 24 50 18 Q60 24 70 68" stroke="#cbd5e1" strokeWidth="2.5" fill="none" opacity="0.6" />

          {/* Crown Front Spikes & Fleur-de-lis */}
          <path
            d="M10 70 L14 42 L24 52 L36 34 L50 48 L64 34 L76 52 L86 42 L90 70 Z"
            fill="url(#silverBase)"
            stroke="#475569"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Imperial Cross at Apex */}
          <path
            d="M48 6 H52 V12 H58 V16 H52 V22 H48 V16 H42 V12 H48 Z"
            fill="url(#silverCross)"
            stroke="#334155"
            strokeWidth="1.2"
          />
          <circle cx="50" cy="14" r="2" fill="url(#sapphireGem)" />

          {/* Platinum Circlet Base */}
          <rect x="8" y="66" width="84" height="13" rx="4" fill="url(#silverBase)" stroke="#334155" strokeWidth="2" />
          <rect x="11" y="69" width="78" height="2" fill="#ffffff" opacity="0.7" />

          {/* Freshwater Pearls on Peaks */}
          <circle cx="14" cy="40" r="4" fill="url(#pearl)" stroke="#64748b" strokeWidth="1" />
          <circle cx="36" cy="32" r="4.5" fill="url(#pearl)" stroke="#64748b" strokeWidth="1" />
          <circle cx="50" cy="46" r="4" fill="url(#pearl)" stroke="#64748b" strokeWidth="1" />
          <circle cx="64" cy="32" r="4.5" fill="url(#pearl)" stroke="#64748b" strokeWidth="1" />
          <circle cx="86" cy="40" r="4" fill="url(#pearl)" stroke="#64748b" strokeWidth="1" />

          {/* Center Blue Sapphire Medallion */}
          <polygon points="50,52 42,60 50,68 58,60" fill="url(#sapphireGem)" stroke="#f8fafc" strokeWidth="1.5" />
          <circle cx="48" cy="58" r="1.5" fill="#fff" opacity="0.9" />

          {/* Circlet Row Sapphires and Diamonds */}
          <circle cx="18" cy="72.5" r="3" fill="url(#sapphireGem)" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="34" cy="72.5" r="3.5" fill="url(#sapphireGem)" stroke="#64748b" strokeWidth="0.8" />
          <rect x="47.5" y="70" width="5" height="5" rx="1" fill="url(#sapphireGem)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="66" cy="72.5" r="3.5" fill="url(#sapphireGem)" stroke="#64748b" strokeWidth="0.8" />
          <circle cx="82" cy="72.5" r="3" fill="url(#sapphireGem)" stroke="#64748b" strokeWidth="0.8" />
        </svg>
      )}

      {/* =========================================================
          LEVEL 3: تاج الملك الزمردي الملكي (Emerald Royal King's Crown)
          18k radiant royal gold, fleur-de-lis, rich emerald-cut Colombian emeralds & halo
          ========================================================= */}
      {crownLevel === 3 && (
        <svg viewBox="0 0 100 88" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldBase" x1="0" y1="0" x2="100" y2="88" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="75%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>
            <radialGradient id="emeraldGem" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="75%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064e3b" />
            </radialGradient>
            <linearGradient id="emeraldCut" x1="45" y1="20" x2="55" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="40%" stopColor="#059669" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
          </defs>

          {/* Subtle Emerald Radiance */}
          <circle cx="50" cy="40" r="32" fill="rgba(16,185,129,0.15)" filter="blur(10px)" />
          <ellipse cx="50" cy="82" rx="42" ry="4" fill="rgba(0,0,0,0.5)" />

          {/* Royal Fleur-de-lis Spikes (5 peaks) */}
          <path
            d="M8 70 L14 42 Q20 46 26 48 L32 30 Q40 44 50 14 Q60 44 68 30 L74 48 Q80 46 86 42 L92 70 Z"
            fill="url(#goldBase)"
            stroke="#713f12"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Central Major Emerald Jewel (Octagonal cut) */}
          <polygon
            points="50,14 44,22 44,34 50,42 56,34 56,22"
            fill="url(#emeraldCut)"
            stroke="#fef08a"
            strokeWidth="1.8"
          />
          {/* Emerald Internal Facets */}
          <polygon points="50,18 46,24 46,32 50,38 54,32 54,24" fill="url(#emeraldGem)" />
          <circle cx="48" cy="22" r="1.5" fill="#fff" opacity="0.9" />

          {/* Side Emerald Jewels */}
          <polygon points="32,30 28,36 28,42 32,46 36,42 36,36" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="1.2" />
          <polygon points="68,30 64,36 64,42 68,46 72,42 72,36" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="1.2" />
          <circle cx="14" cy="40" r="3.5" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="1" />
          <circle cx="86" cy="40" r="3.5" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="1" />

          {/* Gold Base Circlet */}
          <rect x="8" y="66" width="84" height="12" rx="4" fill="url(#goldBase)" stroke="#713f12" strokeWidth="2" />
          
          {/* Circlet Studs - Emerald Lozenge cut */}
          <rect x="18" y="69.5" width="5" height="5" transform="rotate(45 20.5 72)" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="0.8" />
          <rect x="33" y="69.5" width="5.5" height="5.5" transform="rotate(45 35.5 72)" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="0.8" />
          
          {/* Center Circlet Big Emerald */}
          <rect x="47" y="68" width="7" height="8" rx="1.5" fill="url(#emeraldCut)" stroke="#fef08a" strokeWidth="1.2" />
          <circle cx="49" cy="70" r="1.2" fill="#fff" opacity="0.9" />

          <rect x="63" y="69.5" width="5.5" height="5.5" transform="rotate(45 65.5 72)" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="0.8" />
          <rect x="78" y="69.5" width="5" height="5" transform="rotate(45 80.5 72)" fill="url(#emeraldGem)" stroke="#fef08a" strokeWidth="0.8" />

          {/* Gold Laurel leaves on crown band */}
          <path d="M22 58 Q34 52 48 58 M78 58 Q66 52 52 58" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}

      {/* =========================================================
          LEVEL 4: تاج الملك الياقوتي المهيب (Ruby Majestic Sovereign Crown)
          24k burnished red gold, crimson velvet inner cap, fiery ruby cabochons & cross
          ========================================================= */}
      {crownLevel === 4 && (
        <svg viewBox="0 0 100 90" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rubyGold" x1="0" y1="0" x2="100" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="25%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="80%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
            <linearGradient id="velvetCap" x1="50" y1="20" x2="50" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="35%" stopColor="#dc2626" />
              <stop offset="70%" stopColor="#7f1d1d" />
              <stop offset="100%" stopColor="#450a0a" />
            </linearGradient>
            <radialGradient id="rubyGem" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="35%" stopColor="#e11d48" />
              <stop offset="75%" stopColor="#9f1239" />
              <stop offset="100%" stopColor="#4c0519" />
            </radialGradient>
          </defs>

          {/* Crimson Royal Glow */}
          <circle cx="50" cy="45" r="34" fill="rgba(225,29,72,0.18)" filter="blur(12px)" />
          <ellipse cx="50" cy="85" rx="43" ry="4" fill="rgba(0,0,0,0.55)" />

          {/* Sovereign Royal Crimson Velvet Cap inside crown */}
          <path
            d="M16 68 Q18 36 50 26 Q82 36 84 68 Z"
            fill="url(#velvetCap)"
            stroke="#450a0a"
            strokeWidth="1.5"
          />
          {/* Velvet Tuft folds */}
          <path d="M50 26 Q40 45 32 68 M50 26 Q60 45 68 68" stroke="#450a0a" strokeWidth="2" opacity="0.6" />

          {/* Golden Arches meeting at the top */}
          <path d="M12 68 Q24 24 50 16 Q76 24 88 68" stroke="url(#rubyGold)" strokeWidth="4.5" fill="none" />
          <path d="M50 16 L50 68" stroke="url(#rubyGold)" strokeWidth="3" />

          {/* Golden Orb & Cross Pattée at Apex */}
          <circle cx="50" cy="15" r="4.5" fill="url(#rubyGold)" stroke="#78350f" strokeWidth="1.2" />
          <path
            d="M48 5 L52 5 L52 8 L55 8 L55 12 L52 12 L52 15 L48 15 L48 12 L45 12 L45 8 L48 8 Z"
            fill="url(#rubyGold)"
            stroke="#78350f"
            strokeWidth="0.8"
          />
          <circle cx="50" cy="10" r="1.5" fill="url(#rubyGem)" />

          {/* Front Golden Coronet & Spikes */}
          <path
            d="M8 70 L12 44 L26 54 L38 34 L50 48 L62 34 L74 54 L88 44 L92 70 Z"
            fill="url(#rubyGold)"
            stroke="#78350f"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Large Heart-cut / Cushion Ruby in Center */}
          <polygon points="50,44 41,54 50,66 59,54" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="1.8" />
          <circle cx="47" cy="51" r="1.8" fill="#fff" opacity="0.9" />

          {/* Spire Ruby Cabochons */}
          <circle cx="12" cy="42" r="3.5" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="1" />
          <circle cx="38" cy="33" r="4" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="1.2" />
          <circle cx="62" cy="33" r="4" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="1.2" />
          <circle cx="88" cy="42" r="3.5" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="1" />

          {/* Heavy Ermine / Gold Studded Base Band */}
          <rect x="8" y="66" width="84" height="13" rx="4" fill="url(#rubyGold)" stroke="#78350f" strokeWidth="2.2" />

          {/* Ruby Row on Base Band */}
          <circle cx="18" cy="72.5" r="3.5" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="0.8" />
          <circle cx="34" cy="72.5" r="3.8" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="0.8" />
          <rect x="46" y="68.5" width="8" height="8" rx="2" fill="url(#rubyGem)" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="48" cy="71" r="1.5" fill="#fff" opacity="0.9" />
          <circle cx="66" cy="72.5" r="3.8" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="0.8" />
          <circle cx="82" cy="72.5" r="3.5" fill="url(#rubyGem)" stroke="#fef08a" strokeWidth="0.8" />
        </svg>
      )}

      {/* =========================================================
          LEVEL 5: تاج الملك الألماسي الأسطوري الأعظم (Legendary Grand Diamond Imperial Crown)
          Supreme multi-tiered white gold & pure diamonds, celestial star pinnacle, prismatic rays
          ========================================================= */}
      {crownLevel === 5 && (
        <svg viewBox="0 0 100 92" className="w-full h-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="diamondPlatinum" x1="0" y1="0" x2="100" y2="92" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="25%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#bae6fd" />
              <stop offset="75%" stopColor="#f0f9ff" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
            <linearGradient id="diamondPrism" x1="30" y1="10" x2="70" y2="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#bae6fd" />
              <stop offset="50%" stopColor="#e0e7ff" />
              <stop offset="75%" stopColor="#fbcfe8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <radialGradient id="solitaireDiamond" cx="40%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#e0f2fe" />
              <stop offset="70%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
          </defs>

          {/* Celestial Cosmic Diamond Halo */}
          <circle cx="50" cy="40" r="38" fill="rgba(56,189,248,0.25)" filter="blur(14px)" />
          <ellipse cx="50" cy="86" rx="44" ry="4" fill="rgba(0,0,0,0.6)" />

          {/* Diamond Starburst Ray Beams at Apex */}
          <line x1="50" y1="0" x2="50" y2="16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
          <line x1="42" y1="4" x2="58" y2="12" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          <line x1="42" y1="12" x2="58" y2="4" stroke="#bae6fd" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

          {/* Supreme 8-Point Diamond Star at Pinnacle */}
          <polygon
            points="50,2 53,9 60,9 54,14 57,21 50,17 43,21 46,14 40,9 47,9"
            fill="#ffffff"
            stroke="#38bdf8"
            strokeWidth="1"
          />
          <circle cx="50" cy="12" r="2.5" fill="url(#solitaireDiamond)" />

          {/* Imperial Diamond Arches */}
          <path d="M12 70 Q26 22 50 14 Q74 22 88 70" stroke="url(#diamondPlatinum)" strokeWidth="4.5" fill="none" />
          <path d="M28 70 Q36 28 50 18 Q64 28 72 70" stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="0.8" />

          {/* Grand Emperor Crown Front Spikes */}
          <path
            d="M6 72 L12 40 L22 50 L34 26 L50 44 L66 26 L78 50 L88 40 L94 72 Z"
            fill="url(#diamondPlatinum)"
            stroke="#0284c7"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Massive Central Solitaire Brilliant-Cut Diamond */}
          <polygon
            points="50,42 38,48 42,66 50,72 58,66 62,48"
            fill="url(#diamondPrism)"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Diamond Internal Facet Cuts */}
          <polygon points="50,46 42,50 45,62 50,68 55,62 58,50" fill="url(#solitaireDiamond)" />
          <polygon points="50,46 50,68 45,62 42,50" fill="#ffffff" opacity="0.5" />
          <circle cx="47" cy="50" r="2" fill="#ffffff" />

          {/* Side Spires Diamonds */}
          <polygon points="34,24 28,30 34,40 40,30" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1.2" />
          <polygon points="66,24 60,30 66,40 72,30" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="12" cy="38" r="4" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1.2" />
          <circle cx="88" cy="38" r="4" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1.2" />

          {/* Grand Platinum & Diamond Pavé Base Band */}
          <rect x="6" y="68" width="88" height="14" rx="4" fill="url(#diamondPlatinum)" stroke="#0369a1" strokeWidth="2" />

          {/* Row of Brilliant Princess Cut Diamonds on Base */}
          <rect x="14" y="71.5" width="6" height="6" rx="1" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="16" cy="73.5" r="1" fill="#fff" />

          <rect x="28" y="71.5" width="6" height="6" rx="1" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="30" cy="73.5" r="1" fill="#fff" />

          {/* Center Band Huge Radiant Diamond */}
          <polygon points="50,69 44,75 50,81 56,75" fill="#ffffff" stroke="#0284c7" strokeWidth="1.2" />
          <circle cx="50" cy="75" r="2.5" fill="url(#solitaireDiamond)" />

          <rect x="66" y="71.5" width="6" height="6" rx="1" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="68" cy="73.5" r="1" fill="#fff" />

          <rect x="80" y="71.5" width="6" height="6" rx="1" fill="url(#solitaireDiamond)" stroke="#ffffff" strokeWidth="1" />
          <circle cx="82" cy="73.5" r="1" fill="#fff" />

          {/* Glistening Sparkles */}
          <path d="M20 44 L22 40 L24 44 L22 48 Z" fill="#ffffff" opacity="0.9" />
          <path d="M78 44 L80 40 L82 44 L80 48 Z" fill="#ffffff" opacity="0.9" />
          <path d="M50 28 L51.5 24 L53 28 L51.5 32 Z" fill="#ffffff" opacity="0.9" />
        </svg>
      )}
    </div>
  );
};
