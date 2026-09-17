import React from 'react';
import { Radio, Coins, Gem, Sparkles, LayoutGrid, Crown, Code2, ShieldCheck, Flame } from 'lucide-react';
import { User } from '../types';
import { formatCoins } from '../utils/numberFormat';

interface NavbarProps {
  currentUser: User;
  activeTab: 'room' | 'explore' | 'aistudio';
  setActiveTab: (tab: 'room' | 'explore' | 'aistudio') => void;
  onAddCoins: () => void;
  hasApiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onAddCoins,
  hasApiKey,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 shadow-md shadow-rose-500/20">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                يلا شات <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">AI</span>
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Voice & Games
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              عقل الذكاء الاصطناعي مع البنية التحتية للصوت المباشر
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <button
            id="tab-room"
            onClick={() => setActiveTab('room')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'room'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>الغرفة الصوتية</span>
            <span className="hidden md:inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse ml-1" />
          </button>

          <button
            id="tab-explore"
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'explore'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>اكتشاف الغرف</span>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 rounded font-normal">AI</span>
          </button>

          <button
            id="tab-aistudio"
            onClick={() => setActiveTab('aistudio')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'aistudio'
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 shadow-md font-bold'
                : 'text-amber-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>الاشتراك الملكي</span>
          </button>
        </nav>

        {/* User Balance & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Gemini Brain Status Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>Gemini 3.8 Flash</span>
          </div>

          {/* Wallet Coins */}
          <button
            id="wallet-coins-btn"
            onClick={onAddCoins}
            title="انقر لزيادة الرصيد التجريبي"
            className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer group"
          >
            <Coins className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>{formatCoins(currentUser.coins)}</span>
            <span className="text-amber-500 font-extrabold text-sm leading-none">+</span>
          </button>

          {/* User Avatar */}
          <div className="relative flex items-center gap-2 pr-1 sm:pr-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full ring-2 ring-amber-500/60 object-cover"
            />
            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white leading-tight flex items-center gap-1">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <Flame className="w-2.5 h-2.5" />
                <span>المستوى {currentUser.level}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
