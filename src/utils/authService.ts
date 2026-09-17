import { User } from '../types';
import { adminUser } from '../data/mockData';

export interface RegisteredAccount {
  id: string;
  accountId: string;
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'owner' | 'admin' | 'moderator' | 'user';
  isOwner?: boolean;
  isAppAdmin?: boolean;
  isImmune?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  registeredAt: string;
  authProvider: 'email' | 'phone' | 'google' | 'facebook' | 'apple' | 'twitter' | 'tiktok' | 'discord' | 'telegram';
  avatar: string;
  level: number;
  xp?: number;
  supporterLevel?: number;
  supporterXp?: number;
  micTimeSeconds?: number;
  totalCoinsSent?: number;
  badge?: string;
  coins: number;
  diamonds: number;
}

export interface OtpRecord {
  code: string;
  destination: string;
  type: 'email' | 'sms';
  purpose?: 'verification' | 'reset';
  createdAt: number;
  expiresAt: number;
}

const STORAGE_KEY = 'yalla_registered_accounts_clean_v3';
const ADMIN_EMAIL_KEY = 'yalla_admin_email';
const ADMIN_PASSWORD_KEY = 'yalla_admin_password';

// Owner & Admin Credentials
export const PRIMARY_OWNER_EMAIL = 'motanow000@gmail.com';
export const OWNER_EMAIL = 'vip666bitcoin@gmail.com';
export const ALT_OWNER_EMAIL = 'moissanite.watch2025@gmail.com';
export const MAIN_ADMIN_EMAIL = 'comprasevendas81@gmail.com';
export const DEFAULT_ADMIN_EMAIL = 'shadow008btc@gmail.com';
export const ALT_ADMIN_EMAIL = 'saberloucif35@gmail.com';
export const SENDER_ADMIN_EMAIL = 'saber.loucif35@gmail.com';
export const USER_ADMIN_EMAIL = 'saberqsq@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'SaberTmWrs3';

const ACTIVE_SESSION_KEY = 'yalla_active_user_session_v3';
export const PERMANENT_PROFILE_KEY = 'yalla_permanent_user_profile_v5';
export const PERMANENT_PROFILES_MAP_KEY = 'yalla_permanent_user_profiles_dict_v1';
export const PERMANENT_BALANCES_KEY = 'yalla_permanent_user_balances_v1';

// In-memory OTP storage for real verification flow
const activeOtps: Map<string, OtpRecord> = new Map();

// Helper to seed initial registered accounts (Clean production: official Owner and Admin accounts)
const getInitialSeedAccounts = (): RegisteredAccount[] => {
  return [
    {
      id: 'owner_vip_account',
      accountId: '77777',
      name: '👑 مالك التطبيق (Owner)',
      email: OWNER_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: 'owner',
      isOwner: true,
      isAppAdmin: true,
      isImmune: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      registeredAt: '2026-01-01 00:00',
      authProvider: 'email',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      level: 100,
      badge: '👑 المالك السيادي (Owner)',
      coins: 999999,
      diamonds: 99999,
    },
    {
      id: adminUser.id,
      accountId: adminUser.accountId || '10001',
      name: adminUser.name,
      email: DEFAULT_ADMIN_EMAIL,
      password: DEFAULT_ADMIN_PASSWORD,
      role: 'admin',
      isAppAdmin: true,
      isImmune: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      registeredAt: '2026-01-01 00:00',
      authProvider: 'email',
      avatar: adminUser.avatar,
      level: 100,
      badge: '⚡ المدير العام (Admin)',
      coins: 500000,
      diamonds: 25000,
    },
  ];
};

const LEGACY_DUMMY_IDS = new Set([
  'user_me', 'user_khaled_1', 'user_sara', 'user_fahad', 
  'user_reem', 'host_talal', 'host_majed', 'host_yasmeen', 'guest_user'
]);

export const authService = {
  // Get balances map: { [id_or_accountId_or_email]: { coins: number, diamonds: number } }
  getPermanentBalances(): Record<string, { coins: number; diamonds: number }> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(PERMANENT_BALANCES_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  },

  // Save balances map
  savePermanentBalances(map: Record<string, { coins: number; diamonds: number }>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PERMANENT_BALANCES_KEY, JSON.stringify(map));
    } catch {}
  },

  // Get permanent profiles dictionary (name & avatar preserved per account)
  getPermanentProfilesMap(): Record<string, { name?: string; avatar?: string }> {
    if (typeof window === 'undefined') return {};
    try {
      const stored = localStorage.getItem(PERMANENT_PROFILES_MAP_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  },

  // Save permanent profiles dictionary
  savePermanentProfilesMap(map: Record<string, { name?: string; avatar?: string }>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PERMANENT_PROFILES_MAP_KEY, JSON.stringify(map));
    } catch {}
  },

  // Update a user's balance permanently across registered accounts, session, and server
  updateAccountBalance(
    userIdOrAccIdOrEmail: string,
    coins: number,
    diamonds?: number
  ): void {
    if (!userIdOrAccIdOrEmail) return;
    const cleanKey = userIdOrAccIdOrEmail.trim().toLowerCase();
    const balances = this.getPermanentBalances();

    const existingBalance = balances[cleanKey] || { coins: 0, diamonds: 0 };
    const newCoins = typeof coins === 'number' ? Math.max(0, coins) : existingBalance.coins;
    const newDiamonds = typeof diamonds === 'number' ? Math.max(0, diamonds) : existingBalance.diamonds;

    // Update in registered accounts
    const accounts = this.getRegisteredAccounts();
    let accountModified = false;
    let matchedId = '';
    let matchedAccId = '';
    let matchedEmail = '';

    const updatedAccounts = accounts.map((acc) => {
      const match =
        acc.id.toLowerCase() === cleanKey ||
        acc.accountId.toLowerCase() === cleanKey ||
        (acc.email && acc.email.toLowerCase() === cleanKey);
      if (match) {
        accountModified = true;
        matchedId = acc.id;
        matchedAccId = acc.accountId;
        matchedEmail = acc.email || '';
        return {
          ...acc,
          coins: newCoins,
          diamonds: newDiamonds,
        };
      }
      return acc;
    });

    if (accountModified) {
      this.saveRegisteredAccounts(updatedAccounts);
    }

    // Save under all aliases in balance map
    balances[cleanKey] = { coins: newCoins, diamonds: newDiamonds };
    if (matchedId) balances[matchedId.toLowerCase()] = { coins: newCoins, diamonds: newDiamonds };
    if (matchedAccId) balances[matchedAccId.toLowerCase()] = { coins: newCoins, diamonds: newDiamonds };
    if (matchedEmail) balances[matchedEmail.toLowerCase()] = { coins: newCoins, diamonds: newDiamonds };
    this.savePermanentBalances(balances);

    // Update active session if it's the current user
    const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (stored) {
      try {
        const active: User = JSON.parse(stored);
        if (
          active &&
          (active.id.toLowerCase() === cleanKey ||
            active.accountId?.toLowerCase() === cleanKey ||
            active.email?.toLowerCase() === cleanKey)
        ) {
          active.coins = newCoins;
          active.diamonds = newDiamonds;
          localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(active));
        }
      } catch {}
    }

    // Sync to backend server asynchronously
    if (typeof window !== 'undefined' && typeof fetch === 'function') {
      fetch('/api/users/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: matchedId || cleanKey,
          accountId: matchedAccId || (cleanKey.length <= 6 ? cleanKey : undefined),
          email: matchedEmail || (cleanKey.includes('@') ? cleanKey : undefined),
          coins: newCoins,
          diamonds: newDiamonds,
        }),
      }).catch(() => {});
    }
  },

  // Credit coins to any account by ID/AccountID/Email
  creditAccountCoins(userIdOrAccIdOrEmail: string, coinsToAdd: number): number {
    if (!userIdOrAccIdOrEmail || coinsToAdd <= 0) return 0;
    const cleanKey = userIdOrAccIdOrEmail.trim().toLowerCase();
    const balances = this.getPermanentBalances();
    const existing = balances[cleanKey];
    const accounts = this.getRegisteredAccounts();
    const found = accounts.find(
      (a) =>
        a.id.toLowerCase() === cleanKey ||
        a.accountId.toLowerCase() === cleanKey ||
        (a.email && a.email.toLowerCase() === cleanKey)
    );
    const currentCoins = existing && typeof existing.coins === 'number' ? existing.coins : (found?.coins || 0);
    const newCoins = currentCoins + coinsToAdd;
    const currentDiamonds = existing && typeof existing.diamonds === 'number' ? existing.diamonds : (found?.diamonds || 0);
    this.updateAccountBalance(userIdOrAccIdOrEmail, newCoins, currentDiamonds);
    return newCoins;
  },

  // Distribute gift revenue: 50% to receiver, 50% to the Main Admin/Owner
  distributeGiftSplit(
    receiverIdOrAcc: string,
    giftPrice: number
  ): { receiverShare: number; adminShare: number } {
    const receiverShare = Math.floor(giftPrice * 0.5);
    const adminShare = Math.max(0, giftPrice - receiverShare);

    // 1. Credit 50% to receiver account
    if (receiverIdOrAcc && receiverShare > 0) {
      this.creditAccountCoins(receiverIdOrAcc, receiverShare);
    }

    // 2. Credit 50% to the Main Admin / Owner accounts (motanow000@gmail.com, shadow008btc@gmail.com, 10001, admin_shadow, 77777, owner_vip_account)
    if (adminShare > 0) {
      this.creditAccountCoins('owner_vip_account', adminShare);
      this.creditAccountCoins('admin_shadow', adminShare);
      this.creditAccountCoins('77777', adminShare);
      this.creditAccountCoins('10001', adminShare);
      this.creditAccountCoins(PRIMARY_OWNER_EMAIL, adminShare);
      this.creditAccountCoins(DEFAULT_ADMIN_EMAIL, adminShare);
      this.creditAccountCoins(OWNER_EMAIL, adminShare);
    }

    return { receiverShare, adminShare };
  },

  // Get active user session for persistence across reloads/revisits
  getActiveSession(): User | null {
    if (typeof window === 'undefined') return null;
    try {
      // Check permanent custom profile store first
      let permanentProfile: any = null;
      const permStored = localStorage.getItem(PERMANENT_PROFILE_KEY);
      if (permStored) {
        try {
          permanentProfile = JSON.parse(permStored);
        } catch {}
      }

      const stored = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (!stored && !permanentProfile) return null;

      let user: User = stored ? JSON.parse(stored) : {
        id: permanentProfile?.id || 'user_saved',
        accountId: permanentProfile?.accountId || '10001',
        name: permanentProfile?.name || 'مستخدم',
        avatar: permanentProfile?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        level: 1,
        coins: 0,
        diamonds: 0,
        role: 'user',
      };

      // Synchronize with latest data in registered accounts store
      const accounts = this.getRegisteredAccounts();
      const cleanEmail = user.email?.toLowerCase();
      const cleanId = user.id?.toLowerCase();
      const cleanAccId = user.accountId?.toLowerCase();
      const found = accounts.find(
        (a) =>
          (cleanEmail && a.email?.toLowerCase() === cleanEmail) ||
          (cleanId && a.id?.toLowerCase() === cleanId) ||
          (cleanAccId && a.accountId?.toLowerCase() === cleanAccId)
      );

      // Check account-specific permanent profiles map
      const profilesMap = this.getPermanentProfilesMap();
      const savedProfile =
        (cleanId ? profilesMap[cleanId] : undefined) ||
        (cleanAccId ? profilesMap[cleanAccId] : undefined) ||
        (cleanEmail ? profilesMap[cleanEmail] : undefined);

      // Check single-profile key only if it strictly matches this specific user
      const permMatchesUser = Boolean(permanentProfile && (
        (permanentProfile.id && cleanId && permanentProfile.id.toLowerCase() === cleanId) ||
        (permanentProfile.accountId && cleanAccId && permanentProfile.accountId.toLowerCase() === cleanAccId) ||
        (permanentProfile.email && cleanEmail && permanentProfile.email.toLowerCase() === cleanEmail)
      ));

      const finalName = savedProfile?.name || (permMatchesUser ? permanentProfile.name : undefined) || user.name || (found ? found.name : 'مستخدم');
      const finalAvatar = savedProfile?.avatar || (permMatchesUser ? permanentProfile.avatar : undefined) || user.avatar || (found ? found.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

      // Check permanent balance map
      const balances = this.getPermanentBalances();
      const lookupKey = cleanId || cleanAccId || cleanEmail || '';
      const savedBal =
        (cleanId ? balances[cleanId] : undefined) ||
        (cleanAccId ? balances[cleanAccId] : undefined) ||
        (cleanEmail ? balances[cleanEmail] : undefined) ||
        balances[lookupKey];

      const resolvedCoins = savedBal && typeof savedBal.coins === 'number' ? savedBal.coins : (found ? found.coins : user.coins);
      const resolvedDiamonds = savedBal && typeof savedBal.diamonds === 'number' ? savedBal.diamonds : (found ? found.diamonds : user.diamonds);

      if (found) {
        const mapped = this.mapAccountToUser(found);
        return {
          ...mapped,
          name: finalName,
          avatar: finalAvatar,
          coins: resolvedCoins,
          diamonds: resolvedDiamonds,
          seatIndex: user.seatIndex,
        };
      }

      return {
        ...user,
        name: finalName,
        avatar: finalAvatar,
        coins: resolvedCoins,
        diamonds: resolvedDiamonds,
      };
    } catch {
      return null;
    }
  },

  // Save active user session
  saveSession(user: User): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));

      // Also persist coins & diamonds to permanent balances
      if (typeof user.coins === 'number' || typeof user.diamonds === 'number') {
        const balances = this.getPermanentBalances();
        const balObj = { coins: user.coins || 0, diamonds: user.diamonds || 0 };
        if (user.id) balances[user.id.toLowerCase()] = balObj;
        if (user.accountId) balances[user.accountId.toLowerCase()] = balObj;
        if (user.email) balances[user.email.toLowerCase()] = balObj;
        this.savePermanentBalances(balances);

        // Also sync registered accounts
        const accounts = this.getRegisteredAccounts();
        let modified = false;
        const updatedAccounts = accounts.map((acc) => {
          if (
            acc.id === user.id ||
            (user.accountId && acc.accountId === user.accountId) ||
            (user.email && acc.email?.toLowerCase() === user.email.toLowerCase())
          ) {
            modified = true;
            return {
              ...acc,
              coins: user.coins,
              diamonds: user.diamonds,
              level: typeof user.level === 'number' ? user.level : acc.level,
              xp: typeof user.xp === 'number' ? user.xp : acc.xp,
              supporterLevel: typeof user.supporterLevel === 'number' ? user.supporterLevel : acc.supporterLevel,
              supporterXp: typeof user.supporterXp === 'number' ? user.supporterXp : acc.supporterXp,
              micTimeSeconds: typeof user.micTimeSeconds === 'number' ? user.micTimeSeconds : acc.micTimeSeconds,
              totalCoinsSent: typeof user.totalCoinsSent === 'number' ? user.totalCoinsSent : acc.totalCoinsSent,
            };
          }
          return acc;
        });
        if (modified) {
          this.saveRegisteredAccounts(updatedAccounts);
        }
      }

      // Also persist to permanent profile store dictionary
      if (user.name || user.avatar) {
        const profilesMap = this.getPermanentProfilesMap();
        const pObj = { name: user.name, avatar: user.avatar };
        if (user.id) profilesMap[user.id.toLowerCase()] = pObj;
        if (user.accountId) profilesMap[user.accountId.toLowerCase()] = pObj;
        if (user.email) profilesMap[user.email.toLowerCase()] = pObj;
        this.savePermanentProfilesMap(profilesMap);

        const existingPerm = localStorage.getItem(PERMANENT_PROFILE_KEY);
        let permObj: any = {};
        if (existingPerm) {
          try {
            permObj = JSON.parse(existingPerm);
          } catch {}
        }
        localStorage.setItem(
          PERMANENT_PROFILE_KEY,
          JSON.stringify({
            ...permObj,
            id: user.id || permObj.id,
            accountId: user.accountId || permObj.accountId,
            email: user.email || permObj.email,
            name: user.name || permObj.name,
            avatar: user.avatar || permObj.avatar,
            coins: user.coins,
            diamonds: user.diamonds,
            updatedAt: Date.now(),
          })
        );
      }
    } catch (e) {
      console.error('Failed to save session to localStorage:', e);
    }
  },

  // Clear active session upon logout
  clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    } catch {}
  },

  // Get all registered accounts (Filtered of all test/dummy data)
  getRegisteredAccounts(): RegisteredAccount[] {
    if (typeof window === 'undefined') return getInitialSeedAccounts();
    try {
      // Clear old legacy keys with dummy data if present
      localStorage.removeItem('yalla_registered_accounts_v2');
      localStorage.removeItem('yalla_registered_accounts');

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        const initial = getInitialSeedAccounts();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      const parsed: RegisteredAccount[] = JSON.parse(stored);
      // Clean out any legacy mock accounts
      let cleaned = parsed.filter(
        (acc) => !LEGACY_DUMMY_IDS.has(acc.id) && acc.email !== 'user@yallachat.app'
      );

      // Ensure Owner account is present in the accounts array
      const hasOwner = cleaned.some(
        (acc) =>
          acc.email?.toLowerCase() === OWNER_EMAIL.toLowerCase() ||
          acc.id === 'owner_vip_account' ||
          acc.accountId === '77777'
      );
      if (!hasOwner) {
        cleaned.unshift({
          id: 'owner_vip_account',
          accountId: '77777',
          name: '👑 مالك التطبيق (Owner)',
          email: OWNER_EMAIL,
          password: DEFAULT_ADMIN_PASSWORD,
          role: 'owner',
          isOwner: true,
          isAppAdmin: true,
          isImmune: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          registeredAt: '2026-01-01 00:00',
          authProvider: 'email',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          level: 100,
          badge: '👑 المالك السيادي (Owner)',
          coins: 999999,
          diamonds: 99999,
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      } else {
        if (cleaned.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
        }
      }
      return cleaned;
    } catch {
      return getInitialSeedAccounts();
    }
  },

  // Save accounts to storage
  saveRegisteredAccounts(accounts: RegisteredAccount[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to localStorage:', e);
    }
  },

  // Get current Admin Credentials
  getAdminCredentials(): { email: string; password: string } {
    if (typeof window === 'undefined') {
      return { email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD };
    }
    const email = localStorage.getItem(ADMIN_EMAIL_KEY) || DEFAULT_ADMIN_EMAIL;
    const storedPass = localStorage.getItem(ADMIN_PASSWORD_KEY);
    // If empty or old default from previous sessions, normalize to SaberTmWrs3
    if (!storedPass || storedPass === 'Admin@2026' || storedPass === 'admin') {
      localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_ADMIN_PASSWORD);
      return { email, password: DEFAULT_ADMIN_PASSWORD };
    }
    return { email, password: storedPass };
  },

  // Update Admin Credentials (from Admin Control Modal)
  updateAdminCredentials(newEmail: string, newPassword?: string): void {
    if (typeof window === 'undefined') return;
    const cleanEmail = newEmail.trim();
    if (cleanEmail) {
      localStorage.setItem(ADMIN_EMAIL_KEY, cleanEmail);
    }
    if (newPassword && newPassword.trim()) {
      localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword.trim());
    }

    // Also update in accounts store
    const accounts = this.getRegisteredAccounts();
    const updated = accounts.map((acc) => {
      if (acc.role === 'admin' || acc.id === 'admin_shadow') {
        return {
          ...acc,
          email: cleanEmail || acc.email,
          password: newPassword ? newPassword.trim() : acc.password,
        };
      }
      return acc;
    });
    this.saveRegisteredAccounts(updated);
  },

  // Check if an email is an Admin email
  isAdminEmail(email: string): boolean {
    const clean = email.trim().toLowerCase();
    const { email: savedAdminEmail } = this.getAdminCredentials();
    return (
      clean === savedAdminEmail.toLowerCase() ||
      clean === MAIN_ADMIN_EMAIL.toLowerCase() ||
      clean === PRIMARY_OWNER_EMAIL.toLowerCase() ||
      clean === DEFAULT_ADMIN_EMAIL.toLowerCase() ||
      clean === ALT_ADMIN_EMAIL.toLowerCase() ||
      clean === SENDER_ADMIN_EMAIL.toLowerCase() ||
      clean === USER_ADMIN_EMAIL.toLowerCase() ||
      clean === OWNER_EMAIL.toLowerCase() ||
      clean === ALT_OWNER_EMAIL.toLowerCase()
    );
  },

  // Check if an email is an Owner email
  isOwnerEmail(email?: string): boolean {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return (
      clean === MAIN_ADMIN_EMAIL.toLowerCase() ||
      clean === PRIMARY_OWNER_EMAIL.toLowerCase() ||
      clean === OWNER_EMAIL.toLowerCase() ||
      clean === ALT_OWNER_EMAIL.toLowerCase() ||
      clean === DEFAULT_ADMIN_EMAIL.toLowerCase()
    );
  },

  // Check if a user is an Owner (Sovereign Authority across all rooms)
  isOwner(user?: User | null): boolean {
    if (!user) return false;
    const isOwnerId = 
      user.id === 'owner_vip_account' || 
      user.id === 'admin_shadow' || 
      user.accountId === '10001' || 
      user.accountId === '77777';
    return Boolean(
      user.isOwner ||
      user.role === 'owner' ||
      user.role === 'admin' ||
      user.isAppAdmin ||
      isOwnerId ||
      (user.email && this.isOwnerEmail(user.email))
    );
  },

  // Authenticate Admin Credentials specifically
  loginAdmin(email: string, pass: string): { success: boolean; user?: User; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!this.isAdminEmail(cleanEmail)) {
      return {
        success: false,
        error: 'البريد الإلكتروني المدخل غير مسجل كمدير عام للنظام.',
      };
    }

    const { password: currentAdminPassword } = this.getAdminCredentials();
    if (cleanPass !== currentAdminPassword && cleanPass !== DEFAULT_ADMIN_PASSWORD) {
      return {
        success: false,
        error: 'كلمة مرور المدير العام غير صحيحة! تم رفض محاولة تسجيل الدخول.',
      };
    }

    const accounts = this.getRegisteredAccounts();
    const isOwner = this.isOwnerEmail(cleanEmail);

    // Look up existing admin/owner account in registered accounts store
    let found = accounts.find((a) => a.email?.toLowerCase() === cleanEmail);
    if (!found) {
      found = accounts.find((a) =>
        isOwner ? (a.role === 'owner' || a.isOwner || a.id === 'owner_vip_account') : (a.role === 'admin' || a.id === adminUser.id)
      );
    }

    if (!found) {
      found = {
        id: isOwner ? 'owner_vip_account' : adminUser.id,
        accountId: isOwner ? '77777' : (adminUser.accountId || '10001'),
        name: isOwner ? '👑 مالك التطبيق (Owner)' : adminUser.name,
        email: cleanEmail,
        password: cleanPass,
        role: isOwner ? 'owner' : 'admin',
        isOwner: isOwner,
        isAppAdmin: true,
        isImmune: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        registeredAt: '2026-01-01 00:00',
        authProvider: 'email',
        avatar: isOwner
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : adminUser.avatar,
        level: 100,
        badge: isOwner ? '👑 مالك التطبيق (Owner)' : '⚡ المدير العام (Admin)',
        coins: isOwner ? 999999 : 500000,
        diamonds: isOwner ? 99999 : 25000,
      };
      accounts.push(found);
      this.saveRegisteredAccounts(accounts);
    } else {
      // Ensure sovereign roles and credentials remain intact
      found.email = cleanEmail;
      if (isOwner) {
        found.role = 'owner';
        found.isOwner = true;
      }
      found.isAppAdmin = true;
      found.isImmune = true;
      this.saveRegisteredAccounts(accounts);
    }

    const user = this.mapAccountToUser(found);
    this.saveSession(user);
    return { success: true, user };
  },

  // Login with Email & Password (Strict verification)
  loginWithEmail(email: string, pass: string): { 
    success: boolean; 
    user?: User; 
    error?: string; 
    isWrongPassword?: boolean;
    targetEmail?: string;
  } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    if (!cleanEmail) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني أو معرّف الحساب (ID).' };
    }
    if (!cleanPass) {
      return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    }

    // If it's an admin or owner email, route to sovereign login check
    if (this.isAdminEmail(cleanEmail)) {
      const adminRes = this.loginAdmin(cleanEmail, cleanPass);
      if (!adminRes.success) {
        return {
          success: false,
          error: 'كلمة مرور المدير العام أو المالك غير صحيحة! يرجى التأكد من كلمة المرور أو إعادة تعيينها.',
          isWrongPassword: true,
          targetEmail: cleanEmail,
        };
      }
      return adminRes;
    }

    // Look up in registered accounts by email, accountId, or unique id
    const accounts = this.getRegisteredAccounts();
    const found = accounts.find(
      (a) =>
        a.email?.toLowerCase() === cleanEmail ||
        (a.accountId && a.accountId.toLowerCase() === cleanEmail) ||
        (a.id && a.id.toLowerCase() === cleanEmail)
    );

    if (!found) {
      return {
        success: false,
        error: 'عذراً، هذا البريد أو الحساب غير مسجل في النظام. يرجى الضغط على «حساب جديد بالبريد» للتسجيل أولاً.',
      };
    }

    if (found.password !== cleanPass) {
      return {
        success: false,
        error: 'كلمة المرور المدخلة غير صحيحة! يرجى التأكد من كلمة المرور أو إعادة تعيينها عبر بريدك الإلكتروني.',
        isWrongPassword: true,
        targetEmail: cleanEmail,
      };
    }

    const user = this.mapAccountToUser(found);
    this.saveSession(user);
    return {
      success: true,
      user,
    };
  },

  // Login with Phone & Password (Strict verification)
  loginWithPhone(phoneCountry: string, phoneNumber: string, pass: string): { success: boolean; user?: User; error?: string } {
    const cleanNum = phoneNumber.trim().replace(/\s+/g, '');
    const cleanPass = pass.trim();

    if (!cleanNum || cleanNum.length < 6) {
      return { success: false, error: 'يرجى إدخال رقم جوال صحيح.' };
    }
    if (!cleanPass) {
      return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    }

    const fullPhone = `${phoneCountry} ${cleanNum}`;
    const accounts = this.getRegisteredAccounts();
    const found = accounts.find((a) => {
      if (!a.phone) return false;
      const normalizedA = a.phone.replace(/\s+/g, '');
      const normalizedInput = fullPhone.replace(/\s+/g, '');
      return normalizedA === normalizedInput || a.phone.includes(cleanNum);
    });

    if (!found) {
      return {
        success: false,
        error: 'عذراً، رقم الجوال هذا غير مسجل لدينا. يرجى الضغط على «إنشاء حساب جديد» أولاً.',
      };
    }

    if (found.password !== cleanPass) {
      return {
        success: false,
        error: 'كلمة المرور غير صحيحة! يرجى إعادة المحاولة.',
      };
    }

    return {
      success: true,
      user: this.mapAccountToUser(found),
    };
  },

  // Send real 6-digit OTP verification code (for registration, verification, or password reset)
  async sendOtp(
    destination: string,
    type: 'email' | 'sms',
    purpose: 'verification' | 'reset' = 'verification'
  ): Promise<{
    success: boolean;
    message: string;
    realDelivery?: boolean;
    provider?: string;
  }> {
    const cleanDest = destination.trim().toLowerCase();
    if (!cleanDest) {
      return { success: false, message: 'يرجى تحديد وجهة التحقق أولاً.' };
    }

    // Immediately clear any prior local OTP for this destination
    activeOtps.delete(cleanDest);

    const label = type === 'email' ? 'البريد الإلكتروني' : 'رقم الجوال عبر رسالة SMS';

    try {
      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: cleanDest, type, purpose }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'تعذر إرسال رمز التحقق، يرجى التأكد من صحة البيانات وإعادة المحاولة.',
        };
      }

      return {
        success: true,
        message: data.message || `تم إرسال رمز التحقق بنجاح إلى ${label}. يرجى مراجعة البريد وإدخال الرمز لتأكيد الملكية.`,
        realDelivery: data.realDelivery,
        provider: data.provider,
      };
    } catch (err: any) {
      console.warn('Network send-verification error:', err);
      return {
        success: false,
        message: 'تعذر الاتصال بخادم البريد، يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.',
      };
    }
  },

  // Clear pending or used OTPs to guarantee fresh codes
  clearOtp(destination?: string): void {
    if (destination) {
      const cleanDest = destination.trim().toLowerCase();
      activeOtps.delete(cleanDest);
      fetch('/api/auth/clear-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: cleanDest }),
      }).catch(() => {});
    } else {
      activeOtps.clear();
      fetch('/api/auth/clear-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }).catch(() => {});
    }
  },

  // Verify OTP code securely with backend verification
  async verifyOtp(
    destination: string,
    inputCode: string,
    purpose?: 'verification' | 'reset'
  ): Promise<{ success: boolean; error?: string }> {
    const cleanDest = destination.trim().toLowerCase();
    const cleanCode = inputCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, error: 'يرجى إدخال رمز التحقق المكون من 6 أرقام كاملاً.' };
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: cleanDest, code: cleanCode, purpose }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        activeOtps.delete(cleanDest);
        return { success: true };
      }

      // Check local fallback
      const localRec = activeOtps.get(cleanDest);
      if (
        localRec &&
        localRec.code === cleanCode &&
        (!purpose || !localRec.purpose || localRec.purpose === purpose) &&
        Date.now() <= localRec.expiresAt
      ) {
        activeOtps.delete(cleanDest);
        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'رمز التحقق المدخل غير صحيح أو انتهت صلاحيته.',
      };
    } catch {
      const localRec = activeOtps.get(cleanDest);
      if (
        localRec &&
        localRec.code === cleanCode &&
        (!purpose || !localRec.purpose || localRec.purpose === purpose) &&
        Date.now() <= localRec.expiresAt
      ) {
        activeOtps.delete(cleanDest);
        return { success: true };
      }
      return { success: false, error: 'تعذر التحقق من الرمز، يرجى إعادة المحاولة.' };
    }
  },

  // Register New Account with Verified Email
  registerWithEmail(params: {
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
  }): { success: boolean; user?: User; error?: string } {
    const { name, email, password, isVerified } = params;
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();
    const cleanName = name.trim();

    // 1. Email format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني حقيقي وصالح (مثال: name@gmail.com)' };
    }

    // 2. Password length
    if (cleanPass.length < 6) {
      return { success: false, error: 'يجب ألا تقل كلمة المرور عن 6 خانات.' };
    }

    // 3. Verification check
    if (!isVerified) {
      return { success: false, error: 'يرجى تأكيد رمز التحقق المرسل لبريدك الإلكتروني أولاً لإتمام التسجيل.' };
    }

    // 4. Duplicate check
    const accounts = this.getRegisteredAccounts();
    if (accounts.some((a) => a.email?.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'هذا البريد الإلكتروني مسجل مسبقاً! يرجى تسجيل الدخول أو استعادة كلمة المرور.',
      };
    }

    // Generate unique 5-digit Account ID
    const accountId = this.generateUniqueAccountId(accounts);
    const newAccount: RegisteredAccount = {
      id: 'user_' + Date.now().toString(36),
      accountId,
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: cleanPass,
      role: 'user',
      isAppAdmin: false,
      isImmune: false,
      isEmailVerified: true,
      isPhoneVerified: false,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      authProvider: 'email',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      level: 1,
      badge: '🌟 عضو جديد موثق',
      coins: 100,
      diamonds: 10,
    };

    accounts.push(newAccount);
    this.saveRegisteredAccounts(accounts);
    this.clearOtp(cleanEmail);

    return {
      success: true,
      user: this.mapAccountToUser(newAccount),
    };
  },

  // Register New Account with Verified Phone
  registerWithPhone(params: {
    name: string;
    phoneCountry: string;
    phoneNumber: string;
    password: string;
    isVerified: boolean;
  }): { success: boolean; user?: User; error?: string } {
    const { name, phoneCountry, phoneNumber, password, isVerified } = params;
    const cleanNum = phoneNumber.trim().replace(/\s+/g, '');
    const cleanPass = password.trim();
    const cleanName = name.trim();

    if (!cleanNum || cleanNum.length < 7 || !/^\d+$/.test(cleanNum)) {
      return { success: false, error: 'يرجى إدخال رقم جوال حقيقي يتكون من أرقام صحيحة.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, error: 'يجب ألا تقل كلمة المرور عن 6 خانات.' };
    }

    if (!isVerified) {
      return { success: false, error: 'يرجى تأكيد رمز التحقق المرسل إلى رقم جوالك عبر SMS أولاً.' };
    }

    const fullPhone = `${phoneCountry} ${cleanNum}`;
    const accounts = this.getRegisteredAccounts();
    if (accounts.some((a) => a.phone && a.phone.replace(/\s+/g, '') === fullPhone.replace(/\s+/g, ''))) {
      return {
        success: false,
        error: 'رقم الجوال هذا مسجل مسبقاً بحساب آخر! يرجى تسجيل الدخول بدلاً من ذلك.',
      };
    }

    const accountId = this.generateUniqueAccountId(accounts);
    const newAccount: RegisteredAccount = {
      id: 'user_' + Date.now().toString(36),
      accountId,
      name: cleanName || `عضو ${cleanNum.slice(-4)}`,
      phone: fullPhone,
      password: cleanPass,
      role: 'user',
      isAppAdmin: false,
      isImmune: false,
      isEmailVerified: false,
      isPhoneVerified: true,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      authProvider: 'phone',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanNum)}`,
      level: 1,
      badge: '📱 عضو جوال موثق',
      coins: 100,
      diamonds: 10,
    };

    accounts.push(newAccount);
    this.saveRegisteredAccounts(accounts);

    return {
      success: true,
      user: this.mapAccountToUser(newAccount),
    };
  },

  // Social Login/Register with Real Profile (Google, Apple, Facebook, TikTok, Twitter/X, Discord, Telegram)
  loginOrRegisterSocial(
    provider: 'google' | 'apple' | 'facebook' | 'twitter' | 'tiktok' | 'discord' | 'telegram',
    profile: {
      email: string;
      name: string;
      avatar?: string;
      socialId?: string;
    }
  ): { success: boolean; user: User } {
    const cleanEmail = profile.email.trim().toLowerCase();
    const accounts = this.getRegisteredAccounts();

    // Check if account already exists with this email
    const existing = accounts.find((a) => a.email?.toLowerCase() === cleanEmail);
    if (existing) {
      const isOwner = this.isOwnerEmail(cleanEmail) || existing.isOwner;
      const isAdmin = isOwner || this.isAdminEmail(cleanEmail) || existing.role === 'admin';
      const updated: RegisteredAccount = {
        ...existing,
        // PRESERVE user custom avatar & name! Only fallback to social profile if user has none
        name: existing.name || profile.name,
        avatar: existing.avatar || profile.avatar,
        role: isOwner ? 'owner' : (isAdmin ? 'admin' : existing.role),
        isOwner: isOwner || existing.isOwner,
        isAppAdmin: isAdmin || existing.isAppAdmin,
        isImmune: (isOwner || isAdmin) ? true : existing.isImmune,
        isEmailVerified: true,
      };
      const newAccounts = accounts.map((a) => (a.id === existing.id ? updated : a));
      this.saveRegisteredAccounts(newAccounts);
      const user = this.mapAccountToUser(updated);
      this.saveSession(user);
      return { success: true, user };
    }

    // Check if the social email is registered as Owner or Admin
    const isOwner = this.isOwnerEmail(cleanEmail);
    if (isOwner || this.isAdminEmail(cleanEmail)) {
      const sovereignAcc: RegisteredAccount = {
        id: isOwner ? 'owner_vip_account' : adminUser.id,
        accountId: isOwner ? '77777' : (adminUser.accountId || '10001'),
        name: profile.name || (isOwner ? '👑 مالك التطبيق (Owner)' : adminUser.name),
        email: cleanEmail,
        password: DEFAULT_ADMIN_PASSWORD,
        role: isOwner ? 'owner' : 'admin',
        isOwner: isOwner,
        isAppAdmin: true,
        isImmune: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        registeredAt: '2026-01-01 00:00',
        authProvider: provider,
        avatar: profile.avatar || (isOwner ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' : adminUser.avatar),
        level: 100,
        badge: isOwner ? '👑 المالك السيادي (Owner)' : '⚡ المدير العام (Admin)',
        coins: isOwner ? 999999 : 500000,
        diamonds: isOwner ? 99999 : 25000,
      };
      accounts.push(sovereignAcc);
      this.saveRegisteredAccounts(accounts);
      const user = this.mapAccountToUser(sovereignAcc);
      this.saveSession(user);
      return { success: true, user };
    }

    // If new user registering via Social
    const accountId = this.generateUniqueAccountId(accounts);
    const newAccount: RegisteredAccount = {
      id: `social_${provider}_` + Date.now().toString(36),
      accountId,
      name: profile.name || cleanEmail.split('@')[0],
      email: cleanEmail,
      role: 'user',
      isAppAdmin: false,
      isImmune: false,
      isEmailVerified: true,
      isPhoneVerified: false,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      authProvider: provider,
      avatar: profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      level: 1,
      badge: `✨ موثق عبر ${provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : provider}`,
      coins: 100,
      diamonds: 10,
    };

    accounts.push(newAccount);
    this.saveRegisteredAccounts(accounts);
    const user = this.mapAccountToUser(newAccount);
    this.saveSession(user);
    return { success: true, user };
  },

  // Reset Password via verified OTP
  resetPassword(destination: string, newPass: string, isVerified: boolean): { success: boolean; error?: string } {
    if (!isVerified) {
      return { success: false, error: 'يرجى تأكيد كود التحقق أولاً لتغيير كلمة المرور.' };
    }
    if (newPass.length < 6) {
      return { success: false, error: 'يجب ألا تقل كلمة المرور الجديدة عن 6 خانات.' };
    }

    const cleanDest = destination.trim().toLowerCase();
    const accounts = this.getRegisteredAccounts();
    const target = accounts.find(
      (a) =>
        a.email?.toLowerCase() === cleanDest ||
        (a.phone && a.phone.replace(/\s+/g, '') === cleanDest.replace(/\s+/g, ''))
    );

    if (!target) {
      return { success: false, error: 'لم يتم العثور على حساب مرتبط بهذه الوجهة.' };
    }

    target.password = newPass.trim();
    this.saveRegisteredAccounts(accounts);
    this.clearOtp(cleanDest);

    // If target was admin, also update admin credentials
    if (target.role === 'admin' || this.isAdminEmail(cleanDest)) {
      this.updateAdminCredentials(cleanDest, newPass.trim());
    }

    return { success: true };
  },

  // Update user name and/or avatar in registered accounts storage and active session
  updateProfile(userIdOrAccountIdOrEmail: string, updates: { name?: string; avatar?: string }): boolean {
    const cleanKey = userIdOrAccountIdOrEmail.toLowerCase().trim();

    // 1. Immediately persist to permanent storage key
    if (typeof window !== 'undefined') {
      try {
        const existingPerm = localStorage.getItem(PERMANENT_PROFILE_KEY);
        let permObj: any = {};
        if (existingPerm) {
          try {
            permObj = JSON.parse(existingPerm);
          } catch {}
        }
        localStorage.setItem(
          PERMANENT_PROFILE_KEY,
          JSON.stringify({
            ...permObj,
            id: permObj.id || cleanKey,
            name: updates.name?.trim() || permObj.name,
            avatar: updates.avatar?.trim() || permObj.avatar,
            updatedAt: Date.now(),
          })
        );
      } catch {}

      // Asynchronously sync to backend server REST API
      try {
        fetch('/api/users/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: cleanKey,
            name: updates.name?.trim(),
            avatar: updates.avatar?.trim(),
          }),
        }).catch(() => {});
      } catch {}
    }

    const accounts = this.getRegisteredAccounts();

    // 2. Search by id, accountId, or email
    let idx = accounts.findIndex(
      (a) =>
        a.id.toLowerCase() === cleanKey ||
        (a.accountId && a.accountId.toLowerCase() === cleanKey) ||
        (a.email && a.email.toLowerCase() === cleanKey)
    );

    // 3. Fallback search for owner / admin credentials
    if (idx === -1) {
      const isOwner = this.isOwnerEmail(cleanKey);
      const isAdmin = isOwner || this.isAdminEmail(cleanKey);
      if (isAdmin) {
        idx = accounts.findIndex((a) =>
          isOwner
            ? (a.role === 'owner' || a.isOwner || a.id === 'owner_vip_account')
            : (a.role === 'admin' || a.id === adminUser.id)
        );
      }
    }

    if (idx !== -1) {
      if (updates.name && updates.name.trim()) {
        accounts[idx].name = updates.name.trim();
      }
      if (updates.avatar && updates.avatar.trim()) {
        accounts[idx].avatar = updates.avatar.trim();
      }
      this.saveRegisteredAccounts(accounts);

      // Save to permanent profiles dictionary
      const profilesMap = this.getPermanentProfilesMap();
      const profEntry = { name: accounts[idx].name, avatar: accounts[idx].avatar };
      profilesMap[cleanKey] = profEntry;
      if (accounts[idx].id) profilesMap[accounts[idx].id.toLowerCase()] = profEntry;
      if (accounts[idx].accountId) profilesMap[accounts[idx].accountId.toLowerCase()] = profEntry;
      if (accounts[idx].email) profilesMap[accounts[idx].email.toLowerCase()] = profEntry;
      this.savePermanentProfilesMap(profilesMap);

      // Keep active session in sync
      const active = this.getActiveSession();
      if (active) {
        const matchesActive =
          (active.email && accounts[idx].email && active.email.toLowerCase() === accounts[idx].email.toLowerCase()) ||
          (active.id && active.id.toLowerCase() === accounts[idx].id.toLowerCase()) ||
          (active.accountId && accounts[idx].accountId && active.accountId.toLowerCase() === accounts[idx].accountId.toLowerCase());
        if (matchesActive) {
          this.saveSession({
            ...active,
            ...(updates.name && updates.name.trim() ? { name: updates.name.trim() } : {}),
            ...(updates.avatar && updates.avatar.trim() ? { avatar: updates.avatar.trim() } : {}),
          });
        }
      }
      return true;
    }

    // 4. If account not found in registered accounts, create and persist it immediately
    const isOwnerTarget = this.isOwnerEmail(cleanKey);
    const isAdminTarget = isOwnerTarget || this.isAdminEmail(cleanKey);
    const newAcc: RegisteredAccount = {
      id: isOwnerTarget ? 'owner_vip_account' : (cleanKey === 'guest_user' ? 'guest_user' : `user_${Date.now().toString(36)}`),
      accountId: isOwnerTarget ? '77777' : this.generateUniqueAccountId(accounts),
      name: updates.name?.trim() || (isOwnerTarget ? '👑 مالك التطبيق (Owner)' : 'مستخدم'),
      email: cleanKey.includes('@') ? cleanKey : undefined,
      password: DEFAULT_ADMIN_PASSWORD,
      role: isOwnerTarget ? 'owner' : (isAdminTarget ? 'admin' : 'user'),
      isOwner: isOwnerTarget,
      isAppAdmin: isAdminTarget,
      isImmune: isAdminTarget,
      isEmailVerified: true,
      isPhoneVerified: false,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      authProvider: 'email',
      avatar:
        updates.avatar?.trim() ||
        (isOwnerTarget
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'),
      level: isOwnerTarget ? 100 : 1,
      badge: isOwnerTarget ? '👑 المالك السيادي (Owner)' : undefined,
      coins: isOwnerTarget ? 999999 : 100,
      diamonds: isOwnerTarget ? 99999 : 10,
    };
    accounts.push(newAcc);
    this.saveRegisteredAccounts(accounts);

    const active = this.getActiveSession();
    if (active) {
      this.saveSession({
        ...active,
        ...(updates.name && updates.name.trim() ? { name: updates.name.trim() } : {}),
        ...(updates.avatar && updates.avatar.trim() ? { avatar: updates.avatar.trim() } : {}),
      });
    }

    return true;
  },

  // Generate unique 5-digit Account ID
  generateUniqueAccountId(accounts: RegisteredAccount[]): string {
    const existingIds = new Set(accounts.map((a) => a.accountId));
    let candidate = '';
    for (let i = 0; i < 100; i++) {
      candidate = String(Math.floor(10000 + Math.random() * 90000));
      if (!existingIds.has(candidate)) return candidate;
    }
    return String(Date.now()).slice(-5);
  },

  // Map registered account to User object
  mapAccountToUser(acc: RegisteredAccount): User {
    const isOwnerUser = Boolean(
      acc.isOwner ||
      acc.role === 'owner' ||
      acc.role === 'admin' ||
      acc.isAppAdmin ||
      (acc.email && this.isOwnerEmail(acc.email))
    );

    // Apply permanent balance if exists for this account
    const balances = this.getPermanentBalances();
    const cleanId = acc.id ? acc.id.toLowerCase() : '';
    const cleanAccId = acc.accountId ? acc.accountId.toLowerCase() : '';
    const cleanEmail = acc.email ? acc.email.toLowerCase() : '';

    const saved =
      (cleanId ? balances[cleanId] : undefined) ||
      (cleanAccId ? balances[cleanAccId] : undefined) ||
      (cleanEmail ? balances[cleanEmail] : undefined);

    const finalCoins = saved && typeof saved.coins === 'number' ? saved.coins : acc.coins;
    const finalDiamonds = saved && typeof saved.diamonds === 'number' ? saved.diamonds : acc.diamonds;

    // Apply permanent profile name & avatar if customized
    const profilesMap = this.getPermanentProfilesMap();
    const savedProf =
      (cleanId ? profilesMap[cleanId] : undefined) ||
      (cleanAccId ? profilesMap[cleanAccId] : undefined) ||
      (cleanEmail ? profilesMap[cleanEmail] : undefined);

    const finalName = (savedProf?.name && savedProf.name.trim()) ? savedProf.name.trim() : acc.name;
    const finalAvatar = (savedProf?.avatar && savedProf.avatar.trim()) ? savedProf.avatar.trim() : acc.avatar;

    return {
      id: acc.id,
      accountId: acc.accountId,
      name: finalName,
      email: acc.email,
      phone: acc.phone,
      role: isOwnerUser ? 'owner' : acc.role,
      avatar: finalAvatar,
      level: acc.level || 1,
      xp: acc.xp || 0,
      supporterLevel: acc.supporterLevel || 1,
      supporterXp: acc.supporterXp || 0,
      micTimeSeconds: acc.micTimeSeconds || 0,
      totalCoinsSent: acc.totalCoinsSent || 0,
      badge: isOwnerUser ? (acc.badge || '👑 مالك التطبيق (Owner)') : acc.badge,
      coins: finalCoins,
      diamonds: finalDiamonds,
      isOwner: isOwnerUser,
      isAppAdmin: isOwnerUser ? true : acc.isAppAdmin,
      isImmune: isOwnerUser ? true : acc.isImmune,
      isEmailVerified: acc.isEmailVerified,
      isPhoneVerified: acc.isPhoneVerified,
      registeredAt: acc.registeredAt,
      authProvider: acc.authProvider,
      isHost: false,
      isMuted: false,
      isSpeaking: false,
    };
  },

  // Update Account Level and/or Supporter Level (Admin Authority / Automatic Progression)
  updateAccountLevel(
    userIdOrAccIdOrEmail: string,
    level: number,
    supporterLevel?: number,
    xp?: number,
    supporterXp?: number,
    micTimeSeconds?: number,
    totalCoinsSent?: number
  ): boolean {
    if (!userIdOrAccIdOrEmail) return false;
    const cleanKey = userIdOrAccIdOrEmail.trim().toLowerCase();
    const accounts = this.getRegisteredAccounts();
    let modified = false;

    const updated = accounts.map((acc) => {
      const match =
        acc.id.toLowerCase() === cleanKey ||
        acc.accountId.toLowerCase() === cleanKey ||
        (acc.email && acc.email.toLowerCase() === cleanKey);
      if (match) {
        modified = true;
        return {
          ...acc,
          level: Math.min(100, Math.max(1, Math.floor(level))),
          ...(typeof supporterLevel === 'number'
            ? { supporterLevel: Math.min(100, Math.max(1, Math.floor(supporterLevel))) }
            : {}),
          ...(typeof xp === 'number' ? { xp } : {}),
          ...(typeof supporterXp === 'number' ? { supporterXp } : {}),
          ...(typeof micTimeSeconds === 'number' ? { micTimeSeconds } : {}),
          ...(typeof totalCoinsSent === 'number' ? { totalCoinsSent } : {}),
        };
      }
      return acc;
    });

    if (modified) {
      this.saveRegisteredAccounts(updated);
    }

    // Keep active session in sync if current user matches
    const active = this.getActiveSession();
    if (active) {
      const isCurrent =
        (active.email && active.email.toLowerCase() === cleanKey) ||
        (active.id && active.id.toLowerCase() === cleanKey) ||
        (active.accountId && active.accountId.toLowerCase() === cleanKey);
      if (isCurrent) {
        this.saveSession({
          ...active,
          level: Math.min(100, Math.max(1, Math.floor(level))),
          ...(typeof supporterLevel === 'number'
            ? { supporterLevel: Math.min(100, Math.max(1, Math.floor(supporterLevel))) }
            : {}),
          ...(typeof xp === 'number' ? { xp } : {}),
          ...(typeof supporterXp === 'number' ? { supporterXp } : {}),
          ...(typeof micTimeSeconds === 'number' ? { micTimeSeconds } : {}),
          ...(typeof totalCoinsSent === 'number' ? { totalCoinsSent } : {}),
        });
      }
    }

    return modified;
  },
};
