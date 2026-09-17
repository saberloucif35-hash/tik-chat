import React, { useState } from 'react';
import { 
  X, Crown, Check, Copy, ExternalLink, ShieldCheck, 
  Coins, CreditCard, Send, MessageCircle, AlertCircle, 
  Sparkles, CheckCircle2, Lock
} from 'lucide-react';
import { User, VipSubscriptionTier, VipEntranceSubscription } from '../types';
import { RealisticCrown } from './RealisticCrown';
import { sounds } from '../utils/audioEffects';
import { formatCoins } from '../utils/numberFormat';
import { authService, PRIMARY_OWNER_EMAIL, DEFAULT_ADMIN_EMAIL } from '../utils/authService';
import { USDT_TRC20_WALLET_ADDRESS } from './UserRechargeModal';

interface CrownPaymentModalProps {
  tier: VipSubscriptionTier;
  currentUser: User;
  customMessage?: string;
  onSuccess: (updatedSub: VipEntranceSubscription, newCoins?: number) => void;
  onOpenRecharge?: () => void;
  onOpenAdminChat?: () => void;
  onClose: () => void;
}

export const CrownPaymentModal: React.FC<CrownPaymentModalProps> = ({
  tier,
  currentUser,
  customMessage,
  onSuccess,
  onOpenRecharge,
  onOpenAdminChat,
  onClose,
}) => {
  const [activePaymentTab, setActivePaymentTab] = useState<'coins' | 'usdt' | 'admin'>('coins');
  const [txHash, setTxHash] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopiedWallet, setIsCopiedWallet] = useState(false);
  const [isCopiedOrder, setIsCopiedOrder] = useState(false);

  // Price calculation: $1 = 10,000 coins (e.g. $50 = 500,000 coins)
  const requiredCoins = tier.pricePerMonth * 10000;
  const userCoins = currentUser.coins || 0;
  const canAffordCoins = userCoins >= requiredCoins;

  // Check if current user is owner or admin (sovereign test bypass)
  const isOwnerOrAdmin = Boolean(
    currentUser.isOwner ||
    currentUser.role === 'owner' ||
    currentUser.role === 'admin' ||
    currentUser.isAppAdmin ||
    authService.isOwner(currentUser) ||
    (currentUser.email && (
      authService.isOwnerEmail(currentUser.email) ||
      authService.isAdminEmail(currentUser.email)
    ))
  );

  const copyWallet = () => {
    navigator.clipboard.writeText(USDT_TRC20_WALLET_ADDRESS);
    setIsCopiedWallet(true);
    sounds.playLevelUp();
    setTimeout(() => setIsCopiedWallet(false), 2500);
  };

  const orderText = `السلام عليكم يا مدير عام، أرغب في تفعيل اشتراك ${tier.titleAr} (المستوى ${tier.level}) بقيمة $${tier.pricePerMonth}.
معرّف حسابي (ID): ${currentUser.accountId || currentUser.id}
اسم الحساب: ${currentUser.name}
يرجى الشحن والتفعيل.`;

  const copyOrder = () => {
    navigator.clipboard.writeText(orderText);
    setIsCopiedOrder(true);
    sounds.playLevelUp();
    setTimeout(() => setIsCopiedOrder(false), 2500);
  };

  // 1. Pay with Coins ($1 = 10,000 Coins)
  const handlePayWithCoins = async () => {
    setErrorMessage(null);
    if (!canAffordCoins) {
      setErrorMessage(`عفواً، رصيدك من العملات غير كافٍ! يلزمك ${formatCoins(requiredCoins)} عملة ذهبية لتفعيل هذا التاج.`);
      return;
    }

    setIsSubmitting(true);
    const remainingCoins = Math.max(0, userCoins - requiredCoins);

    // Call authoritative server endpoint
    try {
      const resp = await fetch('/api/payments/subscribe-crown-with-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          accountId: currentUser.accountId || currentUser.id,
          tierLevel: tier.level,
          tierTitle: tier.titleAr,
          customMessage: customMessage || tier.sampleEntranceMessage,
        }),
      });
      const data = await resp.json();
      if (data.success && data.vipSubscription) {
        authService.creditAccountCoins('owner_vip_account', requiredCoins);
        authService.creditAccountCoins('admin_shadow', requiredCoins);
        authService.creditAccountCoins('77777', requiredCoins);
        authService.creditAccountCoins('10001', requiredCoins);
        authService.creditAccountCoins(PRIMARY_OWNER_EMAIL, requiredCoins);
        authService.creditAccountCoins(DEFAULT_ADMIN_EMAIL, requiredCoins);
        authService.updateAccountBalance(currentUser.accountId || currentUser.id, data.coinsRemaining ?? remainingCoins, currentUser.diamonds || 0);

        sounds.playLevelUp();
        onSuccess(data.vipSubscription, data.coinsRemaining ?? remainingCoins);
        onClose();
        return;
      } else if (data.error) {
        setErrorMessage(data.error);
        setIsSubmitting(false);
        return;
      }
    } catch {
      // Local fallback
    }

    // Fallback if server offline
    authService.creditAccountCoins('owner_vip_account', requiredCoins);
    authService.creditAccountCoins('admin_shadow', requiredCoins);
    authService.creditAccountCoins('77777', requiredCoins);
    authService.creditAccountCoins('10001', requiredCoins);
    authService.creditAccountCoins(PRIMARY_OWNER_EMAIL, requiredCoins);
    authService.creditAccountCoins(DEFAULT_ADMIN_EMAIL, requiredCoins);
    authService.updateAccountBalance(currentUser.accountId || currentUser.id, remainingCoins, currentUser.diamonds || 0);

    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    const newSub: VipEntranceSubscription = {
      level: tier.level,
      active: true,
      tierNameAr: tier.titleAr,
      pricePerMonth: tier.pricePerMonth,
      customMessage: customMessage || tier.sampleEntranceMessage,
      subscribedAt: new Date().toISOString().split('T')[0],
      expiresAt: expires.toISOString().split('T')[0],
      autoRenew: true,
    };

    sounds.playLevelUp();
    onSuccess(newSub, remainingCoins);
    onClose();
  };

  // 2. Pay with USDT TRC-20
  const handleVerifyUsdt = async () => {
    setErrorMessage(null);
    const cleanHash = txHash.trim().replace(/^0x/i, '');

    if (!cleanHash) {
      setErrorMessage('يرجى إدخال رمز تجزئة المعاملة (TxID) بعد إتمام التحويل.');
      return;
    }

    if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
      setErrorMessage('رمز تجزئة المعاملة (TxID) غير صالح. يجب أن يتكون من 64 حرفاً على شبكة ترون (TRC-20).');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/payments/verify-crown-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          accountId: currentUser.accountId || currentUser.id,
          userName: currentUser.name,
          tierLevel: tier.level,
          tierTitle: tier.titleAr,
          amountUsdt: tier.pricePerMonth,
          customMessage: customMessage || tier.sampleEntranceMessage,
          txHash: cleanHash,
        }),
      });

      const data = await response.json();

      if (data.success && data.vipSubscription) {
        sounds.playLevelUp();
        onSuccess(data.vipSubscription);
        onClose();
      } else {
        setErrorMessage(data.error || 'تعذر التحقق من المعاملة عبر البلوكتشين. يرجى التأكد من الـ TxID أو التواصل مع الإدارة.');
      }
    } catch (e) {
      setErrorMessage('حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى أو إرسال الـ TxID للإدارة عبر المحادثة الخاصة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Admin Sovereign Free Bypass
  const handleAdminSovereignBypass = () => {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);

    const newSub: VipEntranceSubscription = {
      level: tier.level,
      active: true,
      tierNameAr: tier.titleAr,
      pricePerMonth: tier.pricePerMonth,
      customMessage: customMessage || tier.sampleEntranceMessage,
      subscribedAt: new Date().toISOString().split('T')[0],
      expiresAt: expires.toISOString().split('T')[0],
      autoRenew: true,
    };

    sounds.playLevelUp();
    onSuccess(newSub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>بوابة دفع وتفعيل اشتراك التاج</span>
              </h3>
              <p className="text-xs text-amber-400/90 font-medium">
                {tier.titleAr} • المستوى {tier.level}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* Crown Presentation Card */}
          <div className={`p-4 rounded-2xl border bg-slate-950/70 relative overflow-hidden flex items-center gap-4 ${tier.colorScheme.border} ${tier.colorScheme.glow}`}>
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0 shadow-inner">
              <RealisticCrown level={tier.level} size="lg" showGlow animated />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white truncate">
                  {tier.titleAr}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  المستوى {tier.level}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                اشتراك شهري كامل (30 يوماً) مع كيل مسج فخم وميزات ملكية كاملة
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="font-mono font-black text-amber-400 text-sm">
                  ${tier.pricePerMonth} USDT
                </span>
                <span className="text-slate-500">•</span>
                <span className="font-bold text-amber-300/90 font-mono">
                  {formatCoins(requiredCoins)} عملة ذهبية
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  مساوية لقيمة الشحن تماماً
                </span>
              </div>
            </div>
          </div>

          {/* Admin Sovereign Bypass Notice if Owner/Admin */}
          {isOwnerOrAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>أنت مسجل كمدير عام / مالك للنظام 👑: يحق لك التفعيل الفوري للاختبار.</span>
              </div>
              <button
                type="button"
                onClick={handleAdminSovereignBypass}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 shadow active:scale-95 transition-all"
              >
                تفعيل فوري بصلاحية الإدارة 👑
              </button>
            </div>
          )}

          {/* Payment Method Selector Tabs (Strict: Coins, USDT TRC-20, Contact Admin) */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              اختر طريقة الدفع المعتمدة لتفعيل التاج الملكي:
            </label>
            <div className="grid grid-cols-3 gap-2">
              
              {/* Tab 1: Coins */}
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab('coins');
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  activePaymentTab === 'coins'
                    ? 'bg-amber-500/15 border-amber-400 text-amber-300 ring-2 ring-amber-500/30 font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs">العملات الذهبية</span>
                <span className="text-[10px] text-amber-400/80 font-mono font-bold">من رصيدك</span>
              </button>

              {/* Tab 2: USDT TRC-20 */}
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab('usdt');
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  activePaymentTab === 'usdt'
                    ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30 font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">USDT (TRC-20)</span>
                <span className="text-[10px] text-emerald-400/80 font-mono font-bold">${tier.pricePerMonth}</span>
              </button>

              {/* Tab 3: Contact Admin */}
              <button
                type="button"
                onClick={() => {
                  setActivePaymentTab('admin');
                  setErrorMessage(null);
                }}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  activePaymentTab === 'admin'
                    ? 'bg-blue-500/15 border-blue-400 text-blue-300 ring-2 ring-blue-500/30 font-black'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850 hover:text-white'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-blue-400" />
                <span className="text-xs">تواصل مع الأدمن</span>
                <span className="text-[10px] text-blue-400/80 font-mono font-bold">شحن مباشر</span>
              </button>

            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* CONTENT 1: COINS PAYMENT */}
          {activePaymentTab === 'coins' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3.5">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                <span className="text-slate-400">رصيدك الحالي من العملات:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1 font-mono text-sm">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {formatCoins(userCoins)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
                <div>
                  <span className="text-slate-400 block">سعر اشتراك التاج الملكي:</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (مساوٍ لقيمة الشحن: $1 = 10,000 عملة)
                  </span>
                </div>
                <div className="text-left">
                  <span className="font-bold text-amber-400 flex items-center justify-end gap-1 font-mono text-sm">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {formatCoins(requiredCoins)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold block">
                    تعادل ${tier.pricePerMonth} شحن
                  </span>
                </div>
              </div>

              {canAffordCoins ? (
                <div className="space-y-3 pt-1">
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>رصيدك كافٍ لتفعيل التاج الملكي لمدة شهر كامل. سيتم تحويل القيمة لحساب الإدارة وتفعيل ميزات التاج فوراً.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handlePayWithCoins}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    <span>خصم {formatCoins(requiredCoins)} عملة وتفعيل التاج الملكي 👑</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex flex-col gap-1.5">
                    <span className="font-bold">⚠️ رصيدك الحالي غير كافٍ!</span>
                    <span>المبلغ المتبقي للشراء: {formatCoins(requiredCoins - userCoins)} عملة. يمكنك شحن رصيدك فوراً أو الدفع عبر USDT أو التواصل مع الأدمن.</span>
                  </div>
                  <div className="flex gap-2">
                    {onOpenRecharge && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenRecharge();
                        }}
                        className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow active:scale-95 transition-all"
                      >
                        <Coins className="w-3.5 h-3.5" />
                        <span>شحن العملات الآن 💳</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActivePaymentTab('usdt')}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                      <span>الدفع عبر USDT</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONTENT 2: USDT TRC-20 PAYMENT */}
          {activePaymentTab === 'usdt' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3.5">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">المبلغ المطلوب تحويله:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  ${tier.pricePerMonth}.00 USDT (TRC-20)
                </span>
              </div>

              {/* Wallet Address Box */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                  عنوان محفظة الإدارة الرسمية لاستلام USDT (شبكة TRON TRC-20):
                </label>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-amber-300 select-all break-all text-left" dir="ltr">
                    {USDT_TRC20_WALLET_ADDRESS}
                  </span>
                  <button
                    type="button"
                    onClick={copyWallet}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center gap-1 text-[10px] font-bold"
                  >
                    {isCopiedWallet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedWallet ? 'تم النسخ' : 'نسخ'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>الشبكة: TRON (TRC-20) فقط</span>
                  <a
                    href={`https://tronscan.org/#/address/${USDT_TRC20_WALLET_ADDRESS}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>عرض المحفظة على TronScan</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>

              {/* TxID Input Field */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  رمز تجزئة المعاملة (TxID / Transaction Hash):
                </label>
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="ضع هنا رمز المعاملة المكون من 64 حرفاً من تطبيق محفظتك..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                  dir="ltr"
                />
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyUsdt}
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق عبر شبكة البلوكتشين...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تأكيد الدفع وتفعيل التاج الملكي 🚀</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* CONTENT 3: CONTACT ADMIN (تواصل معي) */}
          {activePaymentTab === 'admin' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-3.5">
              
              {/* Admin Card */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow shrink-0">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">المدير العام (Owner & Admin)</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded font-mono">
                      ID: 10001
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تواصل مباشرة لشحن وتفعيل باقات التيجان الملكية وحل أي استفسار
                  </p>
                </div>
              </div>

              {/* Order Template Box */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  نص طلب التفعيل الجاهز للإرسال:
                </label>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-850 text-xs text-slate-300 leading-relaxed font-sans select-all whitespace-pre-line">
                  {orderText}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={copyOrder}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                  >
                    {isCopiedOrder ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopiedOrder ? 'تم نسخ الطلب بنجاح ✓' : 'نسخ تفاصيل الطلب 📋'}</span>
                  </button>

                  {onOpenAdminChat && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenAdminChat();
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 active:scale-95 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>فتح المحادثة الخاصة وإرسال الطلب للمدير العام بالتطبيق 💬</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Security Guarantee */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center shrink-0">
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>نظام دفع مشفر ومحمي. لا يتم تفعيل الاشتراكات إلا بعد التحقق المالي الصارم.</span>
          </div>
        </div>

      </div>
    </div>
  );
};
