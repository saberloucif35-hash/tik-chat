import React, { useState, useEffect } from 'react';
import { 
  Radio, LayoutGrid, Crown, Wifi, 
  Coins, LogIn, Users, Zap, Gift
} from 'lucide-react';
import { User } from '../types';
import { formatCoins } from '../utils/numberFormat';

interface MobileShellProps {
  children: React.ReactNode;
  activeTab: 'room' | 'explore' | 'friends' | 'vip' | 'profile';
  setActiveTab: (tab: 'room' | 'explore' | 'friends' | 'vip' | 'profile') => void;
  currentUser: User;
  isLoggedIn?: boolean;
  onAddCoins: () => void;
  hasApiKey: boolean;
  isAiProcessing?: boolean;
  unreadFriendsCount?: number;
  onOpenAuthModal?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenAdminRecharge?: () => void;
  onOpenUserRecharge?: () => void;
  onOpenDailyReward?: () => void;
  isDailyRewardClaimable?: boolean;
}

export const MobileShell: React.FC<MobileShellProps> = ({
  children,
  activeTab,
  setActiveTab,
  currentUser,
  isLoggedIn = false,
  onAddCoins,
  hasApiKey,
  isAiProcessing = false,
  unreadFriendsCount = 0,
  onOpenAuthModal,
  onOpenAdminPanel,
  onOpenAdminRecharge,
  onOpenUserRecharge,
  onOpenDailyReward,
  isDailyRewardClaimable = false,
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');
  const isAdmin = currentUser.role === 'admin' || currentUser.isAppAdmin;

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCoinClick = () => {
    if (onOpenUserRecharge) {
      onOpenUserRecharge();
    } else if (isAdmin && onOpenAdminRecharge) {
      onOpenAdminRecharge();
    } else {
      onAddCoins();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:py-6 sm:px-4 font-['Cairo',sans-serif] selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP RESPONSIVE DESKTOP/TABLET TOOLBAR */}
      <header className="w-full max-w-lg mb-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl shadow-blue-950/20 flex items-center justify-between gap-2 z-50">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow shadow-blue-900/50">
            <Radio className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>يلا شات</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-950/80 text-blue-300 border border-blue-800/50">
                صوتي مباشر
              </span>
            </h1>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Admin panel launcher or Login button */}
          {isAdmin ? (
            <button
              onClick={onOpenAdminRecharge || onOpenAdminPanel}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold border border-amber-500/40 active:scale-95 transition-all shadow-sm"
              title="لوحة تحكم وشحن المدير العام"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>شحن بالـ ID 👑</span>
            </button>
          ) : !isLoggedIn ? (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md shadow-blue-600/30 active:scale-95 transition-all"
              title="تسجيل الدخول / إنشاء حساب"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-[11px] font-bold transition-all"
              title="عرض الحساب الشخصي"
            >
              <img src={currentUser.avatar} alt={currentUser.name} className="w-4 h-4 rounded-full object-cover ring-1 ring-blue-400" />
              <span className="max-w-[75px] truncate">{currentUser.name}</span>
            </button>
          )}

          {/* Daily Reward Button */}
          {onOpenDailyReward && (
            <button
              onClick={onOpenDailyReward}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all active:scale-95 shadow-sm relative group cursor-pointer ${
                isDailyRewardClaimable
                  ? 'bg-gradient-to-r from-amber-500/25 via-yellow-500/20 to-amber-500/25 border-amber-400 text-amber-300 shadow-amber-500/20'
                  : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-amber-300'
              }`}
              title="مكافأة تسجيل الدخول اليومي"
            >
              <Gift className={`w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform ${isDailyRewardClaimable ? 'animate-bounce' : ''}`} />
              <span className="hidden xs:inline">مكافأة اليوم</span>
              <span className="xs:hidden">هدية</span>
              {isDailyRewardClaimable && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>
          )}

          {/* Currency button - opens recharge store for all users */}
          <button
            onClick={handleCoinClick}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-amber-400 text-[11px] font-bold border border-amber-500/30 active:scale-95 transition-all shadow-sm group"
            title="متجر شحن العملات الذهبية والألماس"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-amber-300">{formatCoins(currentUser.coins || 0)}</span>
            <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-black group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              +
            </span>
          </button>
        </div>
      </header>

      {/* 2. THE APPLICATION VIEWPORT CONTAINER */}
      <div
        className="w-full max-w-md h-[880px] max-h-[94vh] rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl p-0 relative transition-all duration-300 ease-out flex flex-col"
      >

        {/* 3. PHONE INNER SCREEN (Glass Viewport) */}
        <div className="relative flex-1 w-full h-full bg-slate-950 rounded-3xl overflow-hidden flex flex-col border border-slate-800/80 shadow-inner">
          
          {/* 3.1 STATUS BAR (Time, Status, Network, Battery) */}
          <div className="relative h-11 px-6 flex items-center justify-between bg-slate-950 text-slate-300 z-40 shrink-0 select-none border-b border-slate-800/40">
            
            {/* Status Bar Left: Digital Clock */}
            <div className="text-[12px] font-bold font-mono tracking-tight text-slate-300">
              {currentTime}
            </div>

            {/* Status Center */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 shadow">
              {activeTab === 'room' ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-400 font-mono">متصل بالغرفة</span>
                </div>
              ) : (
                <span className="text-[10px] text-slate-300 font-bold">يلا شات</span>
              )}
            </div>

            {/* Status Bar Right: 5G, Wi-Fi, Battery */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] font-black tracking-tighter text-slate-300">5G</span>
              <Wifi className="w-3.5 h-3.5 text-slate-300" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px] font-mono text-slate-300">98%</span>
                <div className="w-4 h-2.5 rounded-[3px] border border-blue-500/80 p-0.5 flex items-center">
                  <div className="h-full w-full bg-blue-500 rounded-[1px]" />
                </div>
              </div>
            </div>

          </div>

          {/* 3.2 MAIN ACTIVE SCREEN VIEW (Scrollable or Full Area) */}
          <div className="flex-1 w-full overflow-y-auto relative scrollbar-none flex flex-col bg-slate-950 text-slate-100">
            {children}
          </div>

          {/* 3.3 MOBILE BOTTOM NAVIGATION BAR (Fixed Native App Dock) */}
          <div className="h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 flex items-center justify-around shrink-0 z-40">
            
            {/* Tab 1: Live Voice Room */}
            <button
              id="mobile-nav-room"
              onClick={() => setActiveTab('room')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'room'
                  ? 'text-blue-400 scale-105 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Radio className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold">الغرفة</span>
            </button>

            {/* Tab 2: Explore & Feed */}
            <button
              id="mobile-nav-explore"
              onClick={() => setActiveTab('explore')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'explore'
                  ? 'text-blue-400 scale-105 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
              <span className="text-[10px] font-bold">اكتشاف</span>
            </button>

            {/* Tab 3: Friends & Private Chat (ID Social System) */}
            <button
              id="mobile-nav-friends"
              onClick={() => setActiveTab('friends')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'friends'
                  ? 'text-blue-400 scale-105 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Users className="w-5 h-5" />
                {unreadFriendsCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center border border-slate-900 animate-pulse">
                    {unreadFriendsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold">الأصدقاء</span>
            </button>

            {/* Tab 4: Subscriptions & VIP Store (متجر الاشتراكات) */}
            <button
              id="mobile-nav-vip"
              onClick={() => setActiveTab('vip')}
              className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'vip'
                  ? 'text-amber-400 scale-105 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="متجر الاشتراكات الملكية والباقات"
            >
              <div className="relative">
                <Crown className={`w-5 h-5 transition-colors ${activeTab === 'vip' ? 'text-amber-400 fill-amber-400/20' : 'text-amber-400/80'}`} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse ring-1 ring-slate-900" />
              </div>
              <span className="text-[10px] font-bold">الاشتراكات</span>
            </button>

            {/* Tab 5: User Profile & Wallet */}
            <button
              id="mobile-nav-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'text-blue-400 scale-105 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="صفحة حسابي الشخصي والمحفظة"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`w-5 h-5 rounded-full object-cover ring-1 ${
                    activeTab === 'profile' ? 'ring-blue-400' : 'ring-slate-700'
                  }`}
                />
              </div>
              <span className="text-[10px] font-bold">حسابي</span>
            </button>

          </div>

          {/* 3.4 SMARTPHONE HOME INDICATOR BAR (iOS/Android Gesture line) */}
          <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0 select-none">
            <div className="w-28 h-1 bg-slate-700/60 rounded-full" />
          </div>

        </div>

      </div>

    </div>
  );
};
