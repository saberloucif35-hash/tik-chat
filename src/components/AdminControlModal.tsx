import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Key, Mail, Coins, Gem, Plus, Minus, 
  UserCheck, UserMinus, ShieldAlert, Sparkles, CheckCircle2, 
  AlertCircle, Users, Settings, Lock, UserPlus, Zap, Search,
  History, Check, Crown, Award, TrendingUp
} from 'lucide-react';
import { User, ModeratorAccount, RechargeRecord } from '../types';
import { sounds } from '../utils/audioEffects';
import { authService } from '../utils/authService';
import { formatCoins, formatDiamonds, formatNumberFr } from '../utils/numberFormat';
import { UserLevelBadge } from './UserLevelBadge';
import { getSupporterTierStyle, getAccountLevelBadgeStyle, MAX_LEVEL } from '../utils/levelService';

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateCurrentUser: (updated: Partial<User>) => void;
  moderators: ModeratorAccount[];
  onAddModerator: (mod: Omit<ModeratorAccount, 'id' | 'assignedAt'>) => void;
  onRemoveModerator: (id: string) => void;
  allUsers?: User[];
  onRechargeUser?: (accountId: string, coins: number, diamonds: number, note?: string) => boolean;
  onUpdateUserLevel?: (accountIdOrId: string, newLevel: number, newSupporterLevel?: number) => boolean;
  rechargeHistory?: RechargeRecord[];
  initialTargetAccountId?: string;
  initialTab?: 'recharge_id' | 'funds' | 'moderators' | 'levels' | 'profile';
}

export const AdminControlModal: React.FC<AdminControlModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser,
  moderators,
  onAddModerator,
  onRemoveModerator,
  allUsers = [],
  onRechargeUser,
  onUpdateUserLevel,
  rechargeHistory = [],
  initialTargetAccountId,
  initialTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'recharge_id' | 'funds' | 'moderators' | 'levels' | 'profile'>(initialTab || 'recharge_id');

  // Recharge User by Account ID State (Addition / Deduction / Transfer by ID)
  const [targetIdInput, setTargetIdInput] = useState(initialTargetAccountId || '');
  const [selectedUserForRecharge, setSelectedUserForRecharge] = useState<User | null>(null);
  const [rechargeMode, setRechargeMode] = useState<'addition' | 'deduction'>('addition');
  const [rechargeCoinsAmount, setRechargeCoinsAmount] = useState<number>(50000);
  const [rechargeDiamondsAmount, setRechargeDiamondsAmount] = useState<number>(500);
  const [rechargeNote, setRechargeNote] = useState<string>('شحن رسمي من المدير العام');

  // Level Management State (Authority to adjust any user's Level & Supporter Level up to 100)
  const [levelTargetInput, setLevelTargetInput] = useState(initialTargetAccountId || '');
  const [selectedUserForLevel, setSelectedUserForLevel] = useState<User | null>(null);
  const [targetAccountLevel, setTargetAccountLevel] = useState<number>(currentUser.level || 1);
  const [targetSupporterLevel, setTargetSupporterLevel] = useState<number>(currentUser.supporterLevel || 1);

  // Update target ID if prop changes
  useEffect(() => {
    if (initialTargetAccountId) {
      setTargetIdInput(initialTargetAccountId);
      setLevelTargetInput(initialTargetAccountId);
      if (initialTab) {
        setActiveSubTab(initialTab);
      } else {
        setActiveSubTab('recharge_id');
      }
    }
  }, [initialTargetAccountId, initialTab]);

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // Sync selected user for level editing when levelTargetInput changes
  useEffect(() => {
    const q = levelTargetInput.trim().toLowerCase();
    if (!q) {
      setSelectedUserForLevel(currentUser);
      setTargetAccountLevel(currentUser.level || 1);
      setTargetSupporterLevel(currentUser.supporterLevel || 1);
      return;
    }
    const found = allUsers.find(
      (u) =>
        u.accountId?.toLowerCase() === q ||
        u.id.toLowerCase() === q ||
        u.name.toLowerCase().includes(q)
    );
    if (found) {
      setSelectedUserForLevel(found);
      setTargetAccountLevel(found.level || 1);
      setTargetSupporterLevel(found.supporterLevel || 1);
    } else {
      setSelectedUserForLevel(null);
    }
  }, [levelTargetInput, allUsers, currentUser]);

  // Sync selected user when targetIdInput changes
  useEffect(() => {
    const q = targetIdInput.trim().toLowerCase();
    if (!q) {
      setSelectedUserForRecharge(null);
      return;
    }
    const found = allUsers.find(
      (u) =>
        u.accountId?.toLowerCase() === q ||
        u.id.toLowerCase() === q ||
        u.name.toLowerCase().includes(q)
    );
    setSelectedUserForRecharge(found || null);
  }, [targetIdInput, allUsers]);

  // Profile Edit State
  const [newEmail, setNewEmail] = useState(currentUser.email || 'shadow008btc@gmail.com');
  const [newName, setNewName] = useState(currentUser.name || 'المدير العام (Shadow)');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Funds Management State
  const [customCoinAmount, setCustomCoinAmount] = useState<string>('10000');
  const [customDiamondAmount, setCustomDiamondAmount] = useState<string>('500');

  // New Moderator State
  const [newModName, setNewModName] = useState('');
  const [newModEmail, setNewModEmail] = useState('');
  const [modCanMute, setModCanMute] = useState(true);
  const [modCanKick, setModCanKick] = useState(true);
  const [modCanWarn, setModCanWarn] = useState(true);

  // Status Alerts
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Strict Permission Check: Only admin can view or execute
  if (currentUser.role !== 'admin' && !currentUser.isAppAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" dir="rtl">
        <div className="bg-slate-900 border border-amber-500/50 rounded-3xl p-6 max-w-sm text-center">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">لوحة تحكم المدير العام</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            هذه اللوحة مخصصة للتحكم الإداري المجاني المطلق للمدير العام. لشحن رصيد حسابك الشخصي، يمكنك استخدام متجر الشحن الرسمي في التطبيق.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            إغلاق
          </button>
        </div>
      </div>
    );
  }

  // Handle User Recharge / Deduction by ID
  const handleExecuteUserRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    const q = targetIdInput.trim();
    if (!q) {
      setStatusMsg({ type: 'error', text: 'يرجى إدخال معرف الحساب (ID) المراد تعديل رصيده' });
      return;
    }

    if (!selectedUserForRecharge) {
      setStatusMsg({ type: 'error', text: `لم يتم العثور على حساب بالمعرف (ID: ${q})` });
      return;
    }

    if (rechargeCoinsAmount <= 0 && rechargeDiamondsAmount <= 0) {
      setStatusMsg({ type: 'error', text: 'يرجى تحديد كمية العملات أو الألماس المراد إضافتها أو خصمها' });
      return;
    }

    if (onRechargeUser) {
      const targetAccountId = selectedUserForRecharge.accountId || selectedUserForRecharge.id;
      const finalCoins = rechargeMode === 'addition' ? rechargeCoinsAmount : -rechargeCoinsAmount;
      const finalDiamonds = rechargeMode === 'addition' ? rechargeDiamondsAmount : -rechargeDiamondsAmount;

      const success = onRechargeUser(
        targetAccountId,
        finalCoins,
        finalDiamonds,
        rechargeNote || (rechargeMode === 'addition' ? 'شحن رصيد مجاني بواسطة المدير العام' : 'خصم رصيد بواسطة المدير العام')
      );

      if (success) {
        sounds.playGiftMagic();
        setStatusMsg({
          type: 'success',
          text: rechargeMode === 'addition'
            ? `تم شحن +${formatCoins(rechargeCoinsAmount)} عملة و +${formatDiamonds(rechargeDiamondsAmount)} ألماسة لحساب ${selectedUserForRecharge.name} (ID: ${targetAccountId}) مجاناً بنجاح! ⚡`
            : `تم خصم -${formatCoins(rechargeCoinsAmount)} عملة و -${formatDiamonds(rechargeDiamondsAmount)} ألماسة من حساب ${selectedUserForRecharge.name} (ID: ${targetAccountId}) بنجاح! 🔻`,
        });
        setTimeout(() => setStatusMsg(null), 4000);
      }
    }
  };

  // Handle Level Adjustment by Admin/Owner (Levels 1 to 100)
  const handleSaveUserLevels = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForLevel) {
      setStatusMsg({ type: 'error', text: 'يرجى تحديد أو إدخال معرف الحساب المراد تعديل مستواه أولاً' });
      return;
    }

    const targetAccId = selectedUserForLevel.accountId || selectedUserForLevel.id;
    const cleanAccountLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(targetAccountLevel)));
    const cleanSupporterLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(targetSupporterLevel)));

    if (onUpdateUserLevel) {
      const ok = onUpdateUserLevel(targetAccId, cleanAccountLevel, cleanSupporterLevel);
      if (ok) {
        sounds.playLevelUp();
        setStatusMsg({
          type: 'success',
          text: `👑 تم تعديل وترفيع حساب ${selectedUserForLevel.name} بنجاح إلى: المستوى العام ${cleanAccountLevel}/100 ومستوى الداعمين ${cleanSupporterLevel}/100! 🚀`,
        });
        setTimeout(() => setStatusMsg(null), 4500);
      } else {
        setStatusMsg({ type: 'error', text: 'فشل تعديل المستوى. يرجى التحقق من صلاحيات المالك.' });
      }
    } else {
      authService.updateAccountLevel(targetAccId, cleanAccountLevel, cleanSupporterLevel);
      sounds.playLevelUp();
      setStatusMsg({
        type: 'success',
        text: `👑 تم تعديل مستوى ${selectedUserForLevel.name} إلى ${cleanAccountLevel}/100 بنجاح!`,
      });
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  // Handle Profile Update (Email, Password, Name)
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setStatusMsg({ type: 'error', text: 'يرجى إدخال بريد إلكتروني صالح' });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'كلمة المرور وتأكيدها غير متطابقين' });
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('yalla_admin_email', newEmail.trim());
    }

    // Sync with authService to strictly protect login credentials
    authService.updateAdminCredentials(newEmail.trim(), newPassword ? newPassword.trim() : undefined);

    onUpdateCurrentUser({
      email: newEmail.trim(),
      name: newName.trim() || currentUser.name,
    });

    setStatusMsg({ 
      type: 'success', 
      text: 'تم تحديث بيانات حساب المدير (البريد الإلكتروني وكلمة المرور) بنجاح!' 
    });
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Handle Coin Adjustments (+ / -)
  const handleAdjustCoins = (amount: number, isAddition: boolean) => {
    const currentVal = currentUser.coins || 0;
    const nextVal = isAddition ? currentVal + amount : Math.max(0, currentVal - amount);

    onUpdateCurrentUser({ coins: nextVal });
    setStatusMsg({
      type: 'success',
      text: isAddition
        ? `تمت إضافة +${formatCoins(amount)} عملة إلى حسابك بنجاح!`
        : `تم خصم -${formatCoins(amount)} عملة من حسابك بنجاح!`,
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Handle Diamond Adjustments (+ / -)
  const handleAdjustDiamonds = (amount: number, isAddition: boolean) => {
    const currentVal = currentUser.diamonds || 0;
    const nextVal = isAddition ? currentVal + amount : Math.max(0, currentVal - amount);

    onUpdateCurrentUser({ diamonds: nextVal });
    setStatusMsg({
      type: 'success',
      text: isAddition
        ? `تمت إضافة +${formatDiamonds(amount)} ألماسة إلى حسابك بنجاح!`
        : `تم خصم -${formatDiamonds(amount)} ألماسة من حسابك بنجاح!`,
    });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Handle Adding a Moderator
  const handleCreateModerator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModName.trim() || !newModEmail.trim()) {
      setStatusMsg({ type: 'error', text: 'يرجى إدخال اسم وبريد المشرف الجديد' });
      return;
    }

    onAddModerator({
      name: newModName.trim(),
      email: newModEmail.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(newModName)}`,
      canMuteUsers: modCanMute,
      canKickFromSeat: modCanKick,
      canWarnUsers: modCanWarn,
      hasDashboardAccess: false, // Enforce strict rule
    });

    setStatusMsg({
      type: 'success',
      text: `تم تعيين "${newModName}" كمشرف على البرنامج بنجاح (مع حجب لوحة التحكم عنه)!`,
    });
    setNewModName('');
    setNewModEmail('');
    setTimeout(() => setStatusMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Decorative Ambience */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white">لوحة تحكم المدير العام (Admin Panel)</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                  صلاحيات كاملة ⚡
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                {currentUser.email || 'shadow008btc@gmail.com'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs inside Admin Panel */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 mt-3 relative z-10 shrink-0">
          <button
            onClick={() => setActiveSubTab('recharge_id')}
            className={`py-2 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeSubTab === 'recharge_id'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow shadow-amber-500/30 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3 fill-current text-amber-900" />
            <span>شحن ID</span>
          </button>

          <button
            onClick={() => setActiveSubTab('levels')}
            className={`py-2 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeSubTab === 'levels'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow shadow-purple-900/50 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3 h-3 text-amber-300" />
            <span>المستويات</span>
          </button>

          <button
            onClick={() => setActiveSubTab('funds')}
            className={`py-2 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeSubTab === 'funds'
                ? 'bg-amber-500 text-slate-950 shadow shadow-amber-500/30 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3 h-3" />
            <span>رصيدي</span>
          </button>

          <button
            onClick={() => setActiveSubTab('moderators')}
            className={`py-2 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeSubTab === 'moderators'
                ? 'bg-blue-600 text-white shadow shadow-blue-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>المشرفون</span>
          </button>

          <button
            onClick={() => setActiveSubTab('profile')}
            className={`py-2 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
              activeSubTab === 'profile'
                ? 'bg-blue-600 text-white shadow shadow-blue-900/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>الحساب</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {statusMsg && (
          <div className={`mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 shrink-0 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Tab Content (Scrollable area) */}
        <div className="mt-3 overflow-y-auto pr-1 flex-1 space-y-3 relative z-10 scrollbar-none">
          
          {/* TAB 0: RECHARGE USERS BY ACCOUNT ID (MAIN ADMIN EXCLUSIVE FEATURE) */}
          {activeSubTab === 'recharge_id' && (
            <div className="space-y-3.5">
              
              {/* Exclusive Feature Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-950/40 border border-amber-500/40 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <span>لوحة التحكم بالرصيد والتحويل بالـ ID (المدير العام)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">
                      صلاحية مطلقة 👑
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    بصفتك المدير العام، يمكنك زيادة أو إنقاص رصيد أي شخص مجاناً بأي كمية تحبها فورياً عبر معرف حسابه (User ID).
                  </p>
                </div>
              </div>

              {/* Enter ID or Select User Form */}
              <form onSubmit={handleExecuteUserRecharge} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                
                {/* Mode Selector: Addition vs Deduction */}
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-bold">
                    نوع العملية المطلوبة على الحساب:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setRechargeMode('addition')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        rechargeMode === 'addition'
                          ? 'bg-emerald-600 text-white font-black shadow-md shadow-emerald-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>➕ زيادة وشحن رصيد (مجاناً)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRechargeMode('deduction')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        rechargeMode === 'deduction'
                          ? 'bg-rose-600 text-white font-black shadow-md shadow-rose-600/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>➖ خصم وإنقاص رصيد</span>
                    </button>
                  </div>
                </div>

                {/* Account ID Input */}
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-bold">
                    معرف الحساب المستهدف (User Account ID):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetIdInput}
                      onChange={(e) => setTargetIdInput(e.target.value)}
                      placeholder="أدخل الـ ID... (مثال: 94102 أو 66205 أو 55104)"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                {/* Quick User Picker Pills */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">اختيار سريع لمستخدمين نشطين:</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {(allUsers || []).filter(u => u && u.id !== currentUser.id).slice(0, 6).map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => setTargetIdInput(u.accountId || u.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 border flex items-center gap-1 transition-all ${
                          targetIdInput === (u.accountId || u.id)
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-black'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <img src={u.avatar} alt={u.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                        <span>{u.name.split(' ')[0]}</span>
                        <span className="font-mono text-[9px] text-slate-400">({u.accountId || u.id})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target User Verified Preview Card */}
                {selectedUserForRecharge ? (
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={selectedUserForRecharge.avatar}
                        alt={selectedUserForRecharge.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">{selectedUserForRecharge.name}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                            Lv.{selectedUserForRecharge.level}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-300 font-mono font-bold block mt-0.5">
                          ID: {selectedUserForRecharge.accountId || selectedUserForRecharge.id}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono text-[10px]">
                      <span className="text-slate-400 block text-[9px]">الرصيد الحالي:</span>
                      <span className="text-amber-400 font-bold block">
                        {formatCoins(selectedUserForRecharge.coins || 0)} 🪙
                      </span>
                      <span className="text-sky-400 font-bold block">
                        {formatDiamonds(selectedUserForRecharge.diamonds || 0)} 💎
                      </span>
                    </div>
                  </div>
                ) : targetIdInput.trim() ? (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>لا يوجد مستخدم مطابق للمعرف "{targetIdInput}"</span>
                  </div>
                ) : null}

                {/* Coin Amount - Input and Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-slate-300 font-bold">
                      {rechargeMode === 'addition' ? 'كمية العملات المراد إضافتها مجاناً:' : 'كمية العملات المراد خصمها:'}
                    </span>
                    <span className={`text-xs font-black font-mono ${rechargeMode === 'addition' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {rechargeMode === 'addition' ? `+${formatCoins(rechargeCoinsAmount)}` : `-${formatCoins(rechargeCoinsAmount)}`} 🪙
                    </span>
                  </div>

                  {/* Free typing input for ANY amount */}
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      min="0"
                      value={rechargeCoinsAmount || ''}
                      onChange={(e) => setRechargeCoinsAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      placeholder="اكتب أي كمية عملات (مثلاً: 1000000)..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400 font-bold shrink-0">🪙 عملة ذهبية</span>
                  </div>

                  {/* Presets */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[10000, 50000, 100000, 500000, 1000000].map((amt) => (
                      <button
                        key={'preset_' + amt}
                        type="button"
                        onClick={() => setRechargeCoinsAmount(amt)}
                        className={`py-1.5 rounded-xl text-[10px] font-bold font-mono transition-all border ${
                          rechargeCoinsAmount === amt
                            ? rechargeMode === 'addition'
                              ? 'bg-emerald-600 text-white border-emerald-400 font-black shadow'
                              : 'bg-rose-600 text-white border-rose-400 font-black shadow'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
                        }`}
                      >
                        {rechargeMode === 'addition' ? '+' : '-'}{amt >= 1000000 ? `${amt / 1000000}M` : `${amt / 1000}K`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Diamonds & Note */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      {rechargeMode === 'addition' ? 'ألماس إضافي (+):' : 'خصم ألماس (-):'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={rechargeDiamondsAmount}
                      onChange={(e) => setRechargeDiamondsAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-sky-300 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">ملاحظة أو سبب التعديل:</label>
                    <input
                      type="text"
                      value={rechargeNote}
                      onChange={(e) => setRechargeNote(e.target.value)}
                      placeholder={rechargeMode === 'addition' ? 'مثال: مكافأة خاصة، شحن لودو...' : 'مثال: تسوية رصيد، استرجاع...'}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Submit Recharge / Deduction Button */}
                <button
                  type="submit"
                  disabled={!selectedUserForRecharge}
                  className={`w-full py-2.5 rounded-xl disabled:opacity-50 text-xs font-black flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all mt-1 ${
                    rechargeMode === 'addition'
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                      : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/25'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>
                    {rechargeMode === 'addition'
                      ? `⚡ تأكيد إضافة +${formatCoins(rechargeCoinsAmount)} عملة لحساب ${selectedUserForRecharge?.name || 'المستخدم'} (مجاناً)`
                      : `🔻 تأكيد خصم -${formatCoins(rechargeCoinsAmount)} عملة من حساب ${selectedUserForRecharge?.name || 'المستخدم'}`}
                  </span>
                </button>
              </form>

              {/* Recent Recharge History Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>سجل عمليات الرصيد المنجزة للمستخدمين:</span>
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">
                    {rechargeHistory.length} عملية
                  </span>
                </div>

                {rechargeHistory.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3 bg-slate-950 rounded-xl border border-slate-800">
                    لا توجد عمليات رصيد سابقة مسجلة.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {rechargeHistory.map((rec) => {
                      const isPositive = rec.amountCoins >= 0;
                      return (
                        <div
                          key={rec.id}
                          className="p-2 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-[11px]">{rec.targetUserName}</span>
                              <span className="font-mono text-[10px] text-amber-300 font-bold">(ID: {rec.targetAccountId})</span>
                            </div>
                            {rec.note && <span className="text-[10px] text-slate-400 block">{rec.note}</span>}
                          </div>
                          <div className="text-left font-mono">
                            <span className={`${isPositive ? 'text-emerald-400' : 'text-rose-400'} font-black block text-[11px]`}>
                              {isPositive ? `+${formatCoins(rec.amountCoins)}` : `${formatCoins(rec.amountCoins)}`} 🪙
                            </span>
                            <span className="text-[9px] text-slate-500 block">{rec.timestamp}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
          
          {/* TAB 1: FUNDS & WALLET MANAGEMENT (ADD OR DEDUCT MONEY) */}
          {activeSubTab === 'funds' && (
            <div className="space-y-4">
              
              {/* Current Balances Header */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] text-slate-400">رصيدك الحالي من العملات</span>
                  </div>
                  <span className="text-base font-black text-amber-300 font-mono">
                    {formatCoins(currentUser.coins || 0)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Gem className="w-4 h-4 text-sky-400" />
                    <span className="text-[11px] text-slate-400">رصيدك الحالي من الألماس</span>
                  </div>
                  <span className="text-base font-black text-sky-300 font-mono">
                    {formatDiamonds(currentUser.diamonds || 0)}
                  </span>
                </div>
              </div>

              {/* Coins Quick Actions (+ & -) */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>إضافة أو خصم عملات ذهبية</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">تحكم فوري</span>
                </div>

                {/* Quick Addition presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5">إضافة سريعة (+):</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5000, 25000, 100000, 500000].map((amt) => (
                      <button
                        key={'add_' + amt}
                        onClick={() => handleAdjustCoins(amt, true)}
                        className="py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-bold font-mono transition-colors active:scale-95"
                      >
                        +{formatCoins(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Deduction presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5">خصم من الرصيد (-):</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5000, 25000, 100000, 500000].map((amt) => (
                      <button
                        key={'ded_' + amt}
                        onClick={() => handleAdjustCoins(amt, false)}
                        className="py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[10px] font-bold font-mono transition-colors active:scale-95"
                      >
                        -{formatCoins(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount Form */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                  <input
                    type="number"
                    value={customCoinAmount}
                    onChange={(e) => setCustomCoinAmount(e.target.value)}
                    placeholder="مبلغ مخصص..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(customCoinAmount, 10);
                      if (!isNaN(val) && val > 0) handleAdjustCoins(val, true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة</span>
                  </button>
                  <button
                    onClick={() => {
                      const val = parseInt(customCoinAmount, 10);
                      if (!isNaN(val) && val > 0) handleAdjustCoins(val, false);
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>خصم</span>
                  </button>
                </div>
              </div>

              {/* Diamonds Quick Actions */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Gem className="w-4 h-4 text-sky-400" />
                    <span>إضافة أو خصم الألماس</span>
                  </h4>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleAdjustDiamonds(500, true)}
                    className="py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-[10px] font-bold font-mono transition-colors"
                  >
                    +500 ماس
                  </button>
                  <button
                    onClick={() => handleAdjustDiamonds(2500, true)}
                    className="py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-800/60 text-[10px] font-bold font-mono transition-colors"
                  >
                    +2,500 ماس
                  </button>
                  <button
                    onClick={() => handleAdjustDiamonds(500, false)}
                    className="py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[10px] font-bold font-mono transition-colors"
                  >
                    -500 ماس
                  </button>
                  <button
                    onClick={() => handleAdjustDiamonds(2500, false)}
                    className="py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-[10px] font-bold font-mono transition-colors"
                  >
                    -2,500 ماس
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MODERATORS MANAGEMENT (ONLY ROOM SUPERVISION, NO DASHBOARD ACCESS) */}
          {activeSubTab === 'moderators' && (
            <div className="space-y-4">
              
              {/* Important Security Rule Highlight */}
              <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-[11px] text-amber-200 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white mb-0.5">
                    شرط الصلاحية الصارم للمشرفين:
                  </span>
                  المشرفون يمتلكون صلاحية الرقابة داخل الغرف فقط (كتم الصوت، طرد من المقاعد، وتنبيه الأعضاء)، بينما <strong className="text-amber-300 underline">صلاحية لوحة التحكم غير موجودة نهائياً</strong> في حساباتهم ومحصورة بك كمدير عام.
                </div>
              </div>

              {/* Add New Moderator Form */}
              <form onSubmit={handleCreateModerator} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>إضافة مشرف جديد على البرنامج</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">اسم المشرف</label>
                    <input
                      type="text"
                      value={newModName}
                      onChange={(e) => setNewModName(e.target.value)}
                      placeholder="مثال: مشرف الغرف عمر"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">بريد المشرف</label>
                    <input
                      type="email"
                      value={newModEmail}
                      onChange={(e) => setNewModEmail(e.target.value)}
                      placeholder="omar.mod@yallachat.app"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Specific Room Permissions Checkboxes */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block mb-1.5">صلاحيات الغرف الممنوحة:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modCanMute}
                        onChange={(e) => setModCanMute(e.target.checked)}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span>كتم الصوت</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modCanKick}
                        onChange={(e) => setModCanKick(e.target.checked)}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span>إنزال من المايك</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modCanWarn}
                        onChange={(e) => setModCanWarn(e.target.checked)}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <span>إرسال تنبيه</span>
                    </label>
                  </div>
                </div>

                {/* Dashboard Access Disabled notice */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 text-[10px]">
                  <span className="text-slate-400">إمكانية فتح لوحة التحكم:</span>
                  <span className="text-rose-400 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60">
                    غير مسموح بها (مغلقة) ✗
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>تثبيت المشرف في البرنامج</span>
                </button>
              </form>

              {/* Current Active Moderators List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">
                  قائمة مشرفي البرنامج الحاليين ({moderators.length}):
                </h4>

                {moderators.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4 bg-slate-950 rounded-2xl border border-slate-800">
                    لا يوجد مشرفون معينون حالياً. يمكنك إضافة مشرفين باستخدام النموذج أعلاه.
                  </p>
                ) : (
                  moderators.map((mod) => (
                    <div
                      key={mod.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={mod.avatar}
                          alt={mod.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-blue-500"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{mod.name}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                              مشرف
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">{mod.email}</span>
                          <div className="flex items-center gap-1 text-[9px] text-slate-500 mt-0.5">
                            <span>صلاحيات الغرفة فقط</span>
                            <span>•</span>
                            <span className="text-rose-400">لوحة التحكم محجوبة</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onRemoveModerator(mod.id);
                          setStatusMsg({ type: 'success', text: `تم إلغاء رتبة المشرف "${mod.name}" بنجاح.` });
                          setTimeout(() => setStatusMsg(null), 2500);
                        }}
                        className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-[10px] font-bold transition-colors"
                        title="إلغاء رتبة المشرف"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* TAB 3: ADMIN PROFILE (CHANGE EMAIL, PASSWORD, NAME) */}
          {activeSubTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-blue-400" />
                <span>تعديل بيانات حساب المدير العام</span>
              </h4>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-bold">اسم المدير العام</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-bold">البريد الإلكتروني للادمن</label>
                <div className="relative">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                </div>
                <span className="text-[9px] text-slate-500 mt-1 block">
                  يمكنك تغيير بريدك في أي وقت، وسيظل حسابك يملك الصلاحيات الإدارية الكاملة.
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1 font-bold">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="اتركها فارغة إذا كنت لا تريد التغيير"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                </div>
              </div>

              {newPassword && (
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1 font-bold">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد كتابة كلمة المرور"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>حفظ التعديلات الجديدة</span>
              </button>
            </form>
          )}

          {/* TAB 5: SOVEREIGN LEVEL & SUPPORTER OVERRIDE (MAX LEVEL 100) */}
          {activeSubTab === 'levels' && (
            <div className="space-y-4">
              
              {/* Header Box */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900 border border-purple-800/50 shadow">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                    <Crown className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">إدارة وترفيع المستويات السيادية (أقصى مستوى 100)</h4>
                    <p className="text-[10px] text-purple-200/80">
                      صلاحية مطلقة للأدمن والمالك لرفع وضبط مستوى أي حساب ومستوى الداعمين لأي عضو
                    </p>
                  </div>
                </div>
              </div>

              {/* Target User Search & Selector */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-purple-400" />
                    <span>تحديد الحساب المستهدف (بالمعرف ID أو الاسم):</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLevelTargetInput(currentUser.accountId || currentUser.id);
                      setSelectedUserForLevel(currentUser);
                      setTargetAccountLevel(currentUser.level || 1);
                      setTargetSupporterLevel(currentUser.supporterLevel || 1);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800/60 font-bold transition-colors"
                  >
                    👑 حسابي أنا
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={levelTargetInput}
                    onChange={(e) => setLevelTargetInput(e.target.value)}
                    placeholder="أدخل رقم الـ ID (مثل 77777 أو 10001) أو اسم الحساب"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono text-left"
                    dir="ltr"
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-sans pointer-events-none">
                    ID / المعرف
                  </span>
                </div>

                {/* Target User Profile Preview Card */}
                {selectedUserForLevel ? (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-purple-800/40 flex items-center gap-3">
                    <img
                      src={selectedUserForLevel.avatar}
                      alt={selectedUserForLevel.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-purple-500/50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-white truncate">
                          {selectedUserForLevel.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950 text-amber-300 border border-slate-800">
                          ID: {selectedUserForLevel.accountId || selectedUserForLevel.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-slate-400">المستويات الحالية:</span>
                        <UserLevelBadge
                          level={selectedUserForLevel.level}
                          supporterLevel={selectedUserForLevel.supporterLevel}
                          size="xs"
                        />
                      </div>
                    </div>
                  </div>
                ) : levelTargetInput.trim() ? (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300 text-center font-bold">
                    لم يتم العثور على حساب بهذا المعرف. تأكد من صحة الـ ID.
                  </div>
                ) : null}
              </div>

              {/* Sliders & Level Controls */}
              <form onSubmit={handleSaveUserLevels} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                
                {/* 1. Account Level Slider (1 to 100) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-400" />
                      <span>مستوى الحساب العام (Account Level):</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={MAX_LEVEL}
                        value={targetAccountLevel}
                        onChange={(e) => setTargetAccountLevel(Math.min(MAX_LEVEL, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-black text-blue-300 text-center font-mono focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">/ {MAX_LEVEL}</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={MAX_LEVEL}
                    value={targetAccountLevel}
                    onChange={(e) => setTargetAccountLevel(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>مبتدئ (Lv. 1)</span>
                    <span className="font-bold text-blue-400">
                      {getAccountLevelBadgeStyle(targetAccountLevel).titleAr}
                    </span>
                    <span>الحد الأقصى (Lv. 100)</span>
                  </div>
                </div>

                {/* 2. Supporter Level Slider (1 to 100) */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>مستوى الداعمين الحصري (Supporter Level):</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min={1}
                        max={MAX_LEVEL}
                        value={targetSupporterLevel}
                        onChange={(e) => setTargetSupporterLevel(Math.min(MAX_LEVEL, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-black text-amber-300 text-center font-mono focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">/ {MAX_LEVEL}</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={MAX_LEVEL}
                    value={targetSupporterLevel}
                    onChange={(e) => setTargetSupporterLevel(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">برونزي (Lv. 1)</span>
                    <span className="font-black text-amber-400 flex items-center gap-1">
                      <span>{getSupporterTierStyle(targetSupporterLevel).icon}</span>
                      <span>{getSupporterTierStyle(targetSupporterLevel).tierNameAr}</span>
                    </span>
                    <span className="text-amber-400 font-mono font-bold">Max 100</span>
                  </div>
                </div>

                {/* Live Badge Preview */}
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">الشارات التي ستظهر للجميع:</span>
                  <UserLevelBadge
                    level={targetAccountLevel}
                    supporterLevel={targetSupporterLevel}
                    size="sm"
                  />
                </div>

                {/* Quick 1-Click Boost Presets */}
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1.5 font-bold">اختصارات ترفيع سريعة:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTargetAccountLevel(MAX_LEVEL);
                        setTargetSupporterLevel(MAX_LEVEL);
                      }}
                      className="p-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-purple-600/30 hover:from-amber-600/50 hover:to-purple-600/50 border border-amber-500/40 text-amber-200 text-xs font-black flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>⚡ ترفيع شامل 100 / 100</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetSupporterLevel(MAX_LEVEL)}
                      className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>👑 داعم 100 (أسطورة)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTargetAccountLevel(MAX_LEVEL)}
                      className="p-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span>⭐ حساب 100 (أقصى مستوى)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTargetAccountLevel((prev) => Math.min(MAX_LEVEL, prev + 10));
                        setTargetSupporterLevel((prev) => Math.min(MAX_LEVEL, prev + 10));
                      }}
                      className="p-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <span><TrendingUp className="w-3 h-3" /> +10 مستويات إضافية</span>
                    </button>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={!selectedUserForLevel}
                  className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${
                    selectedUserForLevel
                      ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:to-amber-400 text-white shadow-purple-900/50 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  }`}
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>تطبيق وترفيع المستوى فوراً 🚀</span>
                </button>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
