import { User } from '../types';

export interface DailyRewardTier {
  day: number; // 1 to 7
  coins: number;
  diamonds: number;
  titleAr: string;
  badge?: string;
  isGrandPrize?: boolean;
  highlightText?: string;
}

export interface UserDailyRewardState {
  userId: string;
  lastClaimDate: string; // YYYY-MM-DD
  consecutiveDays: number; // Current streak, e.g. 1 to 7
  totalClaims: number;
  totalCoinsEarned: number;
  totalDiamondsEarned: number;
  history: {
    date: string;
    day: number;
    coins: number;
    diamonds: number;
    claimedAt: string;
  }[];
}

export const DAILY_REWARD_TIERS: DailyRewardTier[] = [
  {
    day: 1,
    coins: 50,
    diamonds: 0,
    titleAr: 'اليوم الأول',
    highlightText: 'ترحيب البداية',
  },
  {
    day: 2,
    coins: 100,
    diamonds: 0,
    titleAr: 'اليوم الثاني',
    highlightText: 'استمرار النشاط',
  },
  {
    day: 3,
    coins: 150,
    diamonds: 5,
    titleAr: 'اليوم الثالث',
    highlightText: 'هدية ألماسات 💎',
  },
  {
    day: 4,
    coins: 200,
    diamonds: 0,
    titleAr: 'اليوم الرابع',
    highlightText: 'مضاعفة المكافأة',
  },
  {
    day: 5,
    coins: 300,
    diamonds: 10,
    titleAr: 'اليوم الخامس',
    highlightText: 'كنز فضي 🎁',
  },
  {
    day: 6,
    coins: 500,
    diamonds: 0,
    titleAr: 'اليوم السادس',
    highlightText: 'قريب من القمة 🔥',
  },
  {
    day: 7,
    coins: 1000,
    diamonds: 25,
    titleAr: 'اليوم السابع',
    badge: '👑 ملك الحضور اليومي',
    isGrandPrize: true,
    highlightText: 'الجائزة الكبرى 👑',
  },
];

const STORAGE_KEY = 'yalla_daily_rewards_v1';

// Helper to format local date as YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to get yesterday date string
export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return getLocalDateString(d);
}

export const dailyRewardService = {
  // Load all users reward states from localStorage
  getAllStates(): Record<string, UserDailyRewardState> {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse daily rewards storage:', e);
      return {};
    }
  },

  // Save all states
  saveAllStates(states: Record<string, UserDailyRewardState>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
    } catch (e) {
      console.error('Failed to save daily rewards storage:', e);
    }
  },

  // Get state for a specific user
  getState(userId: string): UserDailyRewardState {
    const states = this.getAllStates();
    if (states[userId]) {
      return states[userId];
    }
    const defaultState: UserDailyRewardState = {
      userId,
      lastClaimDate: '',
      consecutiveDays: 0,
      totalClaims: 0,
      totalCoinsEarned: 0,
      totalDiamondsEarned: 0,
      history: [],
    };
    return defaultState;
  },

  // Check if user has already claimed reward today
  hasClaimedToday(userId: string): boolean {
    const state = this.getState(userId);
    const today = getLocalDateString();
    return state.lastClaimDate === today;
  },

  // Check eligibility & compute next day
  checkEligibility(userId: string): {
    canClaim: boolean;
    nextDayNumber: number; // 1 to 7
    reward: DailyRewardTier;
    currentStreak: number;
    isStreakBroken: boolean;
    lastClaimDate: string;
    alreadyClaimedToday: boolean;
  } {
    const state = this.getState(userId);
    const today = getLocalDateString();
    const yesterday = getYesterdayDateString();

    const alreadyClaimedToday = state.lastClaimDate === today;

    if (alreadyClaimedToday) {
      const currentDay = state.consecutiveDays || 1;
      const reward = DAILY_REWARD_TIERS.find((t) => t.day === currentDay) || DAILY_REWARD_TIERS[0];
      return {
        canClaim: false,
        nextDayNumber: currentDay,
        reward,
        currentStreak: state.consecutiveDays,
        isStreakBroken: false,
        lastClaimDate: state.lastClaimDate,
        alreadyClaimedToday: true,
      };
    }

    // Determine streak
    let nextDayNumber = 1;
    let isStreakBroken = false;

    if (!state.lastClaimDate) {
      // First time user
      nextDayNumber = 1;
    } else if (state.lastClaimDate === yesterday) {
      // Consecutive login: continue streak!
      nextDayNumber = (state.consecutiveDays % 7) + 1;
    } else {
      // Missed one or more days: streak reset to Day 1
      nextDayNumber = 1;
      isStreakBroken = state.consecutiveDays > 0;
    }

    const reward = DAILY_REWARD_TIERS.find((t) => t.day === nextDayNumber) || DAILY_REWARD_TIERS[0];

    return {
      canClaim: true,
      nextDayNumber,
      reward,
      currentStreak: isStreakBroken ? 0 : state.consecutiveDays,
      isStreakBroken,
      lastClaimDate: state.lastClaimDate,
      alreadyClaimedToday: false,
    };
  },

  // Claim today's daily reward
  claimReward(user: User): {
    success: boolean;
    reward: DailyRewardTier;
    coinsGranted: number;
    diamondsGranted: number;
    badgeGranted?: string;
    updatedStreak: number;
    message: string;
    error?: string;
  } {
    const userId = user.id;
    const eligibility = this.checkEligibility(userId);

    if (!eligibility.canClaim) {
      return {
        success: false,
        reward: eligibility.reward,
        coinsGranted: 0,
        diamondsGranted: 0,
        updatedStreak: eligibility.currentStreak,
        message: 'لقد استلمت مكافأة اليوم بالفعل! عُد غداً لاستلام مكافأة اليوم التالي.',
        error: 'ALREADY_CLAIMED',
      };
    }

    const today = getLocalDateString();
    const targetReward = eligibility.reward;
    const nextStreak = eligibility.nextDayNumber;

    const allStates = this.getAllStates();
    const currentState = this.getState(userId);

    const updatedState: UserDailyRewardState = {
      ...currentState,
      userId,
      lastClaimDate: today,
      consecutiveDays: nextStreak,
      totalClaims: (currentState.totalClaims || 0) + 1,
      totalCoinsEarned: (currentState.totalCoinsEarned || 0) + targetReward.coins,
      totalDiamondsEarned: (currentState.totalDiamondsEarned || 0) + targetReward.diamonds,
      history: [
        {
          date: today,
          day: nextStreak,
          coins: targetReward.coins,
          diamonds: targetReward.diamonds,
          claimedAt: new Date().toLocaleTimeString('ar-EG'),
        },
        ...currentState.history.slice(0, 30),
      ],
    };

    allStates[userId] = updatedState;
    this.saveAllStates(allStates);

    return {
      success: true,
      reward: targetReward,
      coinsGranted: targetReward.coins,
      diamondsGranted: targetReward.diamonds,
      badgeGranted: targetReward.badge,
      updatedStreak: nextStreak,
      message: `مبروك! استلمت مكافأة اليوم ${nextStreak} بنجاح: +${targetReward.coins} عملة ذهبية${
        targetReward.diamonds > 0 ? ` و +${targetReward.diamonds} ألماسة` : ''
      }! 🎁✨`,
    };
  },
};
