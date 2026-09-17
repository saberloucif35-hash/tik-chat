// Advanced Leveling & Prestige Supporter System for YallaChat
// Maximum Level is strictly capped at 100 with exponential progression (difficult to reach 100)
// Supports mic stage presence XP and gift-giving supporter XP

import { User } from '../types';

export const MAX_LEVEL = 100;
export const MIC_XP_PER_MINUTE = 60; // 1 XP per second on mic = 60 XP / minute

/**
 * Account Level XP Curve (1 to 100)
 * Level 1: 0 XP
 * Level 2: 190 XP
 * Level 10: 17,200 XP
 * Level 50: 850,000 XP
 * Level 100: ~5,200,000 XP
 * This requires extensive time on mic + active support to max out.
 */
export function getXpRequiredForAccountLevel(level: number): number {
  if (level <= 1) return 0;
  const clamped = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level)));
  return Math.floor(95 * Math.pow(clamped, 2.38));
}

/**
 * Supporter / Gifter Level XP Curve (1 to 100)
 * Gained exclusively by sending gifts: 1 Coin spent = 1 Supporter XP
 * Level 1: 0 Coins
 * Level 2: 250 Coins
 * Level 10: 30,000 Coins
 * Level 25: 450,000 Coins
 * Level 50: 3,800,000 Coins
 * Level 75: 15,000,000 Coins
 * Level 100: ~40,000,000 Coins
 * Reaching Supporter Lv. 100 represents a legendary benefactor / whale.
 */
export function getXpRequiredForSupporterLevel(level: number): number {
  if (level <= 1) return 0;
  const clamped = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level)));
  return Math.floor(130 * Math.pow(clamped, 2.72));
}

/**
 * Calculate Account Level info from total XP
 */
export function calculateAccountLevelInfo(totalXp: number = 0): {
  level: number;
  currentLevelBaseXp: number;
  nextLevelBaseXp: number;
  currentLevelXp: number;
  neededForNextXp: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  const safeXp = Math.max(0, totalXp);

  // Binary search or loop up to 100
  let lvl = 1;
  while (lvl < MAX_LEVEL && safeXp >= getXpRequiredForAccountLevel(lvl + 1)) {
    lvl++;
  }

  const currentBase = getXpRequiredForAccountLevel(lvl);
  const nextBase = lvl >= MAX_LEVEL ? currentBase : getXpRequiredForAccountLevel(lvl + 1);
  const delta = Math.max(1, nextBase - currentBase);
  const currentInLvl = Math.max(0, safeXp - currentBase);
  const percent = lvl >= MAX_LEVEL ? 100 : Math.min(100, Math.max(0, Math.floor((currentInLvl / delta) * 100)));

  return {
    level: lvl,
    currentLevelBaseXp: currentBase,
    nextLevelBaseXp: nextBase,
    currentLevelXp: currentInLvl,
    neededForNextXp: Math.max(0, nextBase - safeXp),
    progressPercent: percent,
    isMaxLevel: lvl >= MAX_LEVEL,
  };
}

/**
 * Calculate Supporter Level info from total Supporter XP (coins gifted)
 */
export function calculateSupporterLevelInfo(totalSupporterXp: number = 0): {
  level: number;
  currentLevelBaseXp: number;
  nextLevelBaseXp: number;
  currentLevelXp: number;
  neededForNextXp: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  const safeXp = Math.max(0, totalSupporterXp);

  let lvl = 1;
  while (lvl < MAX_LEVEL && safeXp >= getXpRequiredForSupporterLevel(lvl + 1)) {
    lvl++;
  }

  const currentBase = getXpRequiredForSupporterLevel(lvl);
  const nextBase = lvl >= MAX_LEVEL ? currentBase : getXpRequiredForSupporterLevel(lvl + 1);
  const delta = Math.max(1, nextBase - currentBase);
  const currentInLvl = Math.max(0, safeXp - currentBase);
  const percent = lvl >= MAX_LEVEL ? 100 : Math.min(100, Math.max(0, Math.floor((currentInLvl / delta) * 100)));

  return {
    level: lvl,
    currentLevelBaseXp: currentBase,
    nextLevelBaseXp: nextBase,
    currentLevelXp: currentInLvl,
    neededForNextXp: Math.max(0, nextBase - safeXp),
    progressPercent: percent,
    isMaxLevel: lvl >= MAX_LEVEL,
  };
}

/**
 * Visual styling and metadata for Supporter Level Tiers
 */
export interface SupporterTierStyle {
  tierNameAr: string;
  badgeLabel: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  badgeShadow: string;
  icon: string;
  glowColor: string;
  ringColor: string;
}

export function getSupporterTierStyle(supporterLevel: number = 1): SupporterTierStyle {
  const lvl = Math.min(MAX_LEVEL, Math.max(1, Math.floor(supporterLevel)));

  if (lvl >= 100) {
    return {
      tierNameAr: 'أسطورة الدعم الملكي الأقصى (Max Lv.100)',
      badgeLabel: `👑 داعم 100`,
      badgeBg: 'bg-gradient-to-r from-amber-500 via-rose-500 to-yellow-400 animate-gradient-x',
      badgeBorder: 'border-yellow-300',
      badgeText: 'text-slate-950 font-black',
      badgeShadow: 'shadow-[0_0_15px_rgba(234,179,8,0.8)]',
      icon: '👑',
      glowColor: '#eab308',
      ringColor: 'ring-amber-400 ring-offset-slate-950',
    };
  }
  if (lvl >= 90) {
    return {
      tierNameAr: 'داعم ملكي فائق (Royal Whale)',
      badgeLabel: `💎 داعم ${lvl}`,
      badgeBg: 'bg-gradient-to-r from-rose-700 via-amber-600 to-rose-900',
      badgeBorder: 'border-rose-400/80',
      badgeText: 'text-yellow-100 font-bold',
      badgeShadow: 'shadow-[0_0_12px_rgba(244,63,94,0.6)]',
      icon: '🔱',
      glowColor: '#f43f5e',
      ringColor: 'ring-rose-500',
    };
  }
  if (lvl >= 70) {
    return {
      tierNameAr: 'داعم ماسي ساطع (Diamond)',
      badgeLabel: `💎 داعم ${lvl}`,
      badgeBg: 'bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-600',
      badgeBorder: 'border-pink-400/60',
      badgeText: 'text-white font-bold',
      badgeShadow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]',
      icon: '💎',
      glowColor: '#a855f7',
      ringColor: 'ring-purple-500',
    };
  }
  if (lvl >= 50) {
    return {
      tierNameAr: 'داعم بلاتيني مشع (Platinum)',
      badgeLabel: `⚡ داعم ${lvl}`,
      badgeBg: 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700',
      badgeBorder: 'border-cyan-400/60',
      badgeText: 'text-cyan-50 font-bold',
      badgeShadow: 'shadow-[0_0_8px_rgba(6,182,212,0.4)]',
      icon: '🔷',
      glowColor: '#06b6d4',
      ringColor: 'ring-cyan-500',
    };
  }
  if (lvl >= 25) {
    return {
      tierNameAr: 'داعم ذهبي متميز (Gold)',
      badgeLabel: `⭐ داعم ${lvl}`,
      badgeBg: 'bg-gradient-to-r from-amber-600 to-yellow-500',
      badgeBorder: 'border-yellow-400/60',
      badgeText: 'text-slate-950 font-bold',
      badgeShadow: 'shadow-[0_0_8px_rgba(234,179,8,0.4)]',
      icon: '⭐',
      glowColor: '#eab308',
      ringColor: 'ring-amber-500',
    };
  }
  if (lvl >= 10) {
    return {
      tierNameAr: 'داعم فضي متألق (Silver)',
      badgeLabel: `✨ داعم ${lvl}`,
      badgeBg: 'bg-gradient-to-r from-slate-600 via-slate-500 to-slate-700',
      badgeBorder: 'border-slate-300/50',
      badgeText: 'text-slate-100 font-bold',
      badgeShadow: 'shadow-sm',
      icon: '✨',
      glowColor: '#94a3b8',
      ringColor: 'ring-slate-400',
    };
  }
  return {
    tierNameAr: 'داعم برونزي واعد (Bronze)',
    badgeLabel: `🔰 داعم ${lvl}`,
    badgeBg: 'bg-gradient-to-r from-amber-900 to-amber-800',
    badgeBorder: 'border-amber-700/60',
    badgeText: 'text-amber-200 font-bold',
    badgeShadow: 'shadow-xs',
    icon: '🔰',
    glowColor: '#b45309',
    ringColor: 'ring-amber-700',
  };
}

/**
 * Visual styling for General Account Level (1 to 100)
 */
export function getAccountLevelBadgeStyle(level: number = 1): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  titleAr: string;
} {
  const lvl = Math.min(MAX_LEVEL, Math.max(1, Math.floor(level)));

  if (lvl >= 100) {
    return {
      badgeBg: 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950',
      badgeText: 'text-slate-950 font-black',
      badgeBorder: 'border-yellow-300 shadow-yellow-500/50',
      titleAr: 'سيد المنصة الأقصى (Lv.100)',
    };
  }
  if (lvl >= 80) {
    return {
      badgeBg: 'bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white',
      badgeText: 'text-white font-bold',
      badgeBorder: 'border-pink-400/70 shadow-pink-500/30',
      titleAr: 'أسطورة الغرف (Lv.80+)',
    };
  }
  if (lvl >= 50) {
    return {
      badgeBg: 'bg-gradient-to-r from-blue-700 to-cyan-600 text-white',
      badgeText: 'text-white font-bold',
      badgeBorder: 'border-cyan-400/50 shadow-cyan-500/20',
      titleAr: 'نجم الحضور (Lv.50+)',
    };
  }
  if (lvl >= 25) {
    return {
      badgeBg: 'bg-gradient-to-r from-emerald-700 to-teal-600 text-white',
      badgeText: 'text-white font-bold',
      badgeBorder: 'border-teal-400/40',
      titleAr: 'عضو نشط (Lv.25+)',
    };
  }
  return {
    badgeBg: 'bg-slate-800 text-slate-200',
    badgeText: 'text-slate-200 font-medium',
    badgeBorder: 'border-slate-700',
    titleAr: 'عضو (Lv.1-24)',
  };
}

/**
 * Award XP to user for staying on mic
 */
export function awardMicTimeXp(
  user: User,
  elapsedSeconds: number
): {
  updatedUser: User;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  xpEarned: number;
} {
  const currentLevel = user.level || 1;
  const currentXp = user.xp || getXpRequiredForAccountLevel(currentLevel);
  const currentMicTime = user.micTimeSeconds || 0;

  // 1 second on mic = 1 XP
  const xpEarned = Math.max(1, Math.floor(elapsedSeconds));
  const newTotalXp = currentXp + xpEarned;
  const newMicTime = currentMicTime + elapsedSeconds;

  const info = calculateAccountLevelInfo(newTotalXp);
  const leveledUp = info.level > currentLevel;

  const updatedUser: User = {
    ...user,
    xp: newTotalXp,
    level: info.level,
    micTimeSeconds: newMicTime,
  };

  return {
    updatedUser,
    leveledUp,
    oldLevel: currentLevel,
    newLevel: info.level,
    xpEarned,
  };
}

/**
 * Award XP for sending gifts (increases both Account Level and Supporter Level)
 */
export function awardGiftSupportXp(
  user: User,
  giftCoinsPrice: number
): {
  updatedUser: User;
  accountLeveledUp: boolean;
  supporterLeveledUp: boolean;
  oldAccountLevel: number;
  newAccountLevel: number;
  oldSupporterLevel: number;
  newSupporterLevel: number;
} {
  const safeCoins = Math.max(0, giftCoinsPrice);
  const currentAccLevel = user.level || 1;
  const currentAccXp = user.xp || getXpRequiredForAccountLevel(currentAccLevel);

  const currentSuppLevel = user.supporterLevel || 1;
  const currentSuppXp = user.supporterXp || getXpRequiredForSupporterLevel(currentSuppLevel);
  const currentTotalCoinsSent = (user.totalCoinsSent || 0) + safeCoins;

  // 1 Coin = 1 Account XP & 1 Supporter XP
  const newAccXp = currentAccXp + safeCoins;
  const newSuppXp = currentSuppXp + safeCoins;

  const accInfo = calculateAccountLevelInfo(newAccXp);
  const suppInfo = calculateSupporterLevelInfo(newSuppXp);

  const accountLeveledUp = accInfo.level > currentAccLevel;
  const supporterLeveledUp = suppInfo.level > currentSuppLevel;

  const updatedUser: User = {
    ...user,
    xp: newAccXp,
    level: accInfo.level,
    supporterXp: newSuppXp,
    supporterLevel: suppInfo.level,
    totalCoinsSent: currentTotalCoinsSent,
  };

  return {
    updatedUser,
    accountLeveledUp,
    supporterLeveledUp,
    oldAccountLevel: currentAccLevel,
    newAccountLevel: accInfo.level,
    oldSupporterLevel: currentSuppLevel,
    newSupporterLevel: suppInfo.level,
  };
}

/**
 * Admin override: Set any user's Level (1 to 100) or Supporter Level (1 to 100)
 */
export function adminSetUserLevels(
  user: User,
  targetAccountLevel?: number,
  targetSupporterLevel?: number
): User {
  const nextUser: User = { ...user };

  if (typeof targetAccountLevel === 'number') {
    const clampedAcc = Math.min(MAX_LEVEL, Math.max(1, Math.floor(targetAccountLevel)));
    nextUser.level = clampedAcc;
    nextUser.xp = getXpRequiredForAccountLevel(clampedAcc);
  }

  if (typeof targetSupporterLevel === 'number') {
    const clampedSupp = Math.min(MAX_LEVEL, Math.max(1, Math.floor(targetSupporterLevel)));
    nextUser.supporterLevel = clampedSupp;
    nextUser.supporterXp = getXpRequiredForSupporterLevel(clampedSupp);
    nextUser.totalCoinsSent = Math.max(nextUser.totalCoinsSent || 0, nextUser.supporterXp);
  }

  return nextUser;
}
