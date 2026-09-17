export interface VipEntranceSubscription {
  level: number; // 1 to 5 ($50 per level)
  active: boolean;
  tierNameAr: string;
  pricePerMonth: number; // $50 * level
  customMessage: string;
  subscribedAt: string;
  expiresAt: string;
  autoRenew: boolean;
}

export interface VipSubscriptionTier {
  level: number;
  titleAr: string;
  pricePerMonth: number;
  badgeIcon: string;
  badgeLabel: string;
  colorScheme: {
    gradient: string;
    border: string;
    text: string;
    glow: string;
    bgBadge: string;
  };
  sampleEntranceMessage: string;
  soundType: 'chime' | 'fanfare' | 'falcon' | 'supercar' | 'royal_trumpets';
  features: string[];
}

export interface User {
  id: string;
  accountId?: string; // Unique numeric account ID (e.g., '10001', '88201')
  name: string;
  email?: string;
  phone?: string;
  role?: 'owner' | 'admin' | 'moderator' | 'user';
  avatar: string;
  level: number; // General Account Level (1 to 100)
  xp?: number; // General Account Experience Points
  supporterLevel?: number; // Dedicated Supporter / Wealth Level (1 to 100)
  supporterXp?: number; // Supporter Experience Points (Coins gifted)
  micTimeSeconds?: number; // Total seconds active on mic
  totalCoinsSent?: number; // Total coins gifted
  badge?: string;
  coins: number;
  diamonds: number;
  isHost?: boolean;
  isMuted?: boolean;
  isSpeaking?: boolean;
  seatIndex?: number; // 0 to 7
  gender?: 'male' | 'female';
  authProvider?: 'email' | 'phone' | 'google' | 'facebook' | 'apple' | 'twitter' | 'tiktok' | 'discord' | 'telegram';
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  registeredAt?: string;
  vipSubscription?: VipEntranceSubscription;
  isOwner?: boolean; // App Owner with sovereign control across all rooms
  isAppAdmin?: boolean; // App Administrator with absolute immunity in all rooms
  isImmune?: boolean; // Fully immune against mute, kick, and mic drop
  moderatorPermissions?: {
    canMuteUsers: boolean;
    canKickFromSeat: boolean;
    canWarnUsers: boolean;
    hasDashboardAccess: false; // Explicitly forbidden for moderators
  };
}

export interface AppAdminAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  addedAt: string;
  isOwner?: boolean;
  isImmune: boolean; // Immutable immunity flag
  titleAr: string;
}

export interface BannedUser {
  userId: string;
  userName: string;
  userAvatar?: string;
  bannedAt: string;
  bannedBy: string;
  isPermanent: boolean;
  durationMinutes?: number;
  expiresAt?: number; // timestamp ms
  reason?: string;
}

export interface ModeratorAccount {
  id: string;
  name: string;
  email: string;
  avatar: string;
  assignedAt: string;
  canMuteUsers: boolean;
  canKickFromSeat: boolean;
  canWarnUsers: boolean;
  hasDashboardAccess: false; // Strict rule: No control panel access
}

export interface VoiceSeat {
  index: number;
  user: User | null;
  isLocked: boolean;
  isMuted: boolean;
  audioLevel: number; // 0 to 100
}

export interface VirtualGift {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  price: number; // in coins
  animationEffect: 
    | 'universe' 
    | 'stars' 
    | 'seal_whale' 
    | 'lion_cub' 
    | 'zeus' 
    | 'superhero' 
    | 'treasure_box' 
    | 'gorilla' 
    | 'sam_whale' 
    | 'golden_car' 
    | 'heart_target' 
    | 'lion' 
    | 'dragon' 
    | 'whale' 
    | 'falcon' 
    | 'supercar' 
    | 'private_jet' 
    | 'yacht' 
    | 'crown' 
    | 'castle' 
    | 'ring' 
    | 'rose' 
    | 'rocket' 
    | 'planet' 
    | 'perfume' 
    | 'roses_999';
  descriptionAr: string;
  category?: 'all' | 'luxury' | 'creatures' | 'vehicles' | 'romance' | 'classic' | 'interactive';
  badgeTag?: string;
  isNew?: boolean;
  hasMusic?: boolean;
}

export interface ChatMessage {
  id: string;
  user: User;
  text: string;
  timestamp: string;
  isAiBot?: boolean;
  isSystem?: boolean;
  isWarning?: boolean;
  moderationResult?: ModerationResult;
  giftPayload?: {
    gift: VirtualGift;
    receiver: User;
  };
}

export interface ModerationResult {
  isSafe: boolean;
  infractionType: 'none' | 'hate_speech' | 'insult_harassment' | 'spam' | 'sexual_or_offensive' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
  suggestedAction: 'allow' | 'warn' | 'mute' | 'ban';
  reasonAr: string;
  flaggedTerms?: string[];
}

export interface VoiceRoom {
  id: string;
  title: string;
  description: string;
  category: 'games' | 'music' | 'chat' | 'competitions' | 'poetry';
  categoryNameAr?: string;
  tag?: string;
  coverImage: string;
  host: User;
  activeUsersCount: number;
  maxSeats?: number;
  isLive?: boolean;
  activeGame?: 'ludo' | 'trivia' | 'truth_dare' | null;
  country?: string;
  countryCode?: string;
  countryNameAr?: string;
  isLocked?: boolean;
  moderatorUserIds?: string[]; // IDs of room moderators
  bannedUsers?: BannedUser[]; // List of temporarily or permanently banned users
  mutedUserIds?: string[]; // List of users currently muted by room host/moderator
  areMicsLocked?: boolean; // Whether the room host has locked all room microphones
  micsLockedByName?: string; // Name of host or admin who locked the mics
}

export interface RecommendationResult {
  recommendedRooms: {
    roomId: string;
    priority: number;
    score: number;
    matchingReasonAr: string;
    recommendedGame?: string;
  }[];
  userProfileSummaryAr: string;
}

export interface FunctionCallLog {
  id: string;
  timestamp: string;
  toolName: 'ban_user' | 'start_game' | 'send_virtual_gift';
  arguments: Record<string, any>;
  result: {
    status: 'success' | 'failed';
    messageAr: string;
    details?: any;
  };
  initiatedBy: 'ai_host' | 'moderation_guard' | 'manual_test';
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  categoryAr: string;
  explanationAr: string;
  timeLimitSeconds: number;
}

export interface FriendRequest {
  id: string;
  fromUser: User;
  toUserId: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface PrivateMessage {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'text' | 'voice' | 'gift';
  text?: string;
  timestamp: string;
  audioDurationSeconds?: number;
  audioWaveform?: number[]; // Heights for audio visualizer
  audioTranscription?: string;
  isRead?: boolean;
  giftPayload?: {
    gift: VirtualGift;
  };
}

export interface RechargeRecord {
  id: string;
  adminId: string;
  targetAccountId: string;
  targetUserName: string;
  amountCoins: number;
  amountDiamonds: number;
  timestamp: string;
  note?: string;
}
