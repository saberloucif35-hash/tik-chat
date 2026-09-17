import React, { useState } from 'react';
import { 
  X, Coins, Gem, CreditCard, CheckCircle2, ShieldCheck, 
  Sparkles, Zap, Copy, Check, ChevronLeft, ArrowRight, 
  Lock, Smartphone, ExternalLink, HelpCircle, AlertCircle,
  MessageSquare, Send, Mail, MessageCircle, Crown
} from 'lucide-react';
import { User } from '../types';
import { sounds } from '../utils/audioEffects';
import { formatNumberFr, formatCoins, formatDiamonds } from '../utils/numberFormat';

export const USDT_TRC20_WALLET_ADDRESS = "TL1417xeaNrvU6La3N5Vgpye1e47i4zHUv";

interface RechargePackage {
  id: string;
  category: 'coins' | 'diamonds' | 'vip';
  title: string;
  coins: number;
  bonusCoins?: number;
  diamonds: number;
  bonusDiamonds?: number;
  priceUsd: number;
  priceSar: number;
  badge?: string;
  popular?: boolean;
  bestValue?: boolean;
  color: string;
}

const RECHARGE_PACKAGES: RechargePackage[] = [
  // Coins Packages ($1 = 10,000 عملة ذهبية - مساوية تماماً ومطابقة لأسعار اشتراكات التيجان الملكية)
  {
    id: 'pkg_coin_1',
    category: 'coins',
    title: 'حزمة السهرات الخفيفة',
    coins: 100000,
    diamonds: 50,
    priceUsd: 10.00,
    priceSar: 37.50,
    badge: '100 ألف عملة 🪙',
    color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
  },
  {
    id: 'pkg_coin_2',
    category: 'coins',
    title: 'حزمة الداعمين',
    coins: 250000,
    diamonds: 150,
    priceUsd: 25.00,
    priceSar: 93.75,
    popular: true,
    badge: 'الأكثر طلباً 🔥',
    color: 'from-amber-500/30 to-amber-600/20 border-amber-400',
  },
  {
    id: 'pkg_coin_3',
    category: 'coins',
    title: 'باقة التاج البرونزي (Lv.1)',
    coins: 500000,
    diamonds: 400,
    priceUsd: 50.00,
    priceSar: 187.50,
    badge: 'تعادل تاج Lv.1 👑',
    color: 'from-amber-700/30 to-yellow-600/25 border-amber-600/60',
  },
  {
    id: 'pkg_coin_4',
    category: 'coins',
    title: 'باقة التاج الفضي (Lv.2)',
    coins: 1000000,
    diamonds: 1000,
    priceUsd: 100.00,
    priceSar: 375.00,
    badge: 'تعادل تاج Lv.2 🥈',
    color: 'from-slate-400/25 to-slate-200/20 border-slate-300',
  },
  {
    id: 'pkg_coin_5',
    category: 'coins',
    title: 'باقة التاج الزمردي (Lv.3)',
    coins: 1500000,
    diamonds: 1800,
    priceUsd: 150.00,
    priceSar: 562.50,
    badge: 'تعادل تاج Lv.3 💚',
    color: 'from-emerald-600/25 to-teal-500/20 border-emerald-400',
  },
  {
    id: 'pkg_coin_6',
    category: 'coins',
    title: 'باقة التاج الياقوتي (Lv.4)',
    coins: 2000000,
    diamonds: 2800,
    priceUsd: 200.00,
    priceSar: 750.00,
    bestValue: true,
    badge: 'تعادل تاج Lv.4 👑❤️',
    color: 'from-rose-600/30 to-red-600/25 border-rose-400',
  },
  {
    id: 'pkg_coin_7',
    category: 'coins',
    title: 'صندوق التاج الألماسي الأعظم (Lv.5)',
    coins: 2500000,
    diamonds: 5000,
    priceUsd: 250.00,
    priceSar: 937.50,
    badge: 'تعادل تاج Lv.5 👑💎',
    color: 'from-amber-500/40 via-sky-600/20 to-amber-600/30 border-amber-300 shadow-amber-500/20',
  },

  // Diamonds Packages ($1 = 200 Diamonds)
  {
    id: 'pkg_gem_1',
    category: 'diamonds',
    title: 'صرّة الألماس',
    coins: 10000,
    diamonds: 1000,
    priceUsd: 5.00,
    priceSar: 18.75,
    color: 'from-sky-500/20 to-blue-600/10 border-sky-500/30',
  },
  {
    id: 'pkg_gem_2',
    category: 'diamonds',
    title: 'حقيبة الألماس الفضي',
    coins: 25000,
    diamonds: 2000,
    bonusDiamonds: 250,
    priceUsd: 10.00,
    priceSar: 37.50,
    popular: true,
    badge: 'الأكثر طلباً 💎',
    color: 'from-sky-500/30 to-blue-600/20 border-sky-400',
  },
  {
    id: 'pkg_gem_3',
    category: 'diamonds',
    title: 'كنز الألماس الياقوتي',
    coins: 100000,
    diamonds: 5000,
    bonusDiamonds: 800,
    priceUsd: 25.00,
    priceSar: 93.75,
    badge: 'قيمة ممتازة 💎',
    color: 'from-sky-500/25 to-indigo-600/20 border-sky-500/40',
  },
  {
    id: 'pkg_gem_4',
    category: 'diamonds',
    title: 'مخزن الألماس الإمبراطوري',
    coins: 250000,
    diamonds: 10000,
    bonusDiamonds: 2500,
    priceUsd: 50.00,
    priceSar: 187.50,
    bestValue: true,
    badge: 'صفقة النبلاء ⭐',
    color: 'from-cyan-500/30 to-blue-600/30 border-cyan-400',
  },
];

interface PaymentMethod {
  id: 'usdt_trc20' | 'contact_admin';
  name: string;
  icon: string;
  subtext: string;
  badge?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'usdt_trc20',
    name: 'USDT (TRC-20 ترون)',
    icon: '₮',
    subtext: 'دفع مشفر وتأكيد فوري عبر البلوكتشين',
    badge: 'بلوكتشين ⚡',
  },
  {
    id: 'contact_admin',
    name: 'عن طريق التواصل مع الأدمن',
    icon: '👑',
    subtext: 'شحن وتنسيق مباشر وسريع مع المدير العام',
    badge: 'تواصل معي 💬',
  },
];

interface UserRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPurchasePackage: (coins: number, diamonds: number, packageName: string, price: string) => void;
  onOpenAdminFreeRecharge?: (targetAccountId?: string) => void;
  onOpenAdminChat?: () => void;
}

export const UserRechargeModal: React.FC<UserRechargeModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPurchasePackage,
  onOpenAdminFreeRecharge,
  onOpenAdminChat,
}) => {
  const [activeCategory, setActiveCategory] = useState<'coins' | 'diamonds'>('coins');
  const [selectedPackage, setSelectedPackage] = useState<RechargePackage>(RECHARGE_PACKAGES[1]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [currencyView, setCurrencyView] = useState<'USD' | 'SAR'>('SAR');

  // USDT TRC20 Blockchain payment state
  const [usdtTxHash, setUsdtTxHash] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Real payment gateway state
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Contact Admin state ("خانة تواصل معي")
  const [adminContactMessage, setAdminContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [adminMessageSent, setAdminMessageSent] = useState(false);
  const [copiedContactDetails, setCopiedContactDetails] = useState(false);

  const isAdmin = currentUser.role === 'admin' || currentUser.isAppAdmin;

  if (!isOpen) return null;

  const currentId = currentUser.accountId || currentUser.id;

  const handleCopyId = () => {
    navigator.clipboard.writeText(currentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(USDT_TRC20_WALLET_ADDRESS);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const filteredPackages = RECHARGE_PACKAGES.filter((p) => p.category === activeCategory);

  // Generate default message for "خانة تواصل معي"
  const getDefaultAdminMessage = () => {
    const pkgPrice = currencyView === 'SAR' ? `${selectedPackage.priceSar.toFixed(2)} ر.س` : `$${selectedPackage.priceUsd.toFixed(2)}`;
    return `السلام عليكم يا مدير 👑، أود شحن باقة "${selectedPackage.title}" (${formatCoins(selectedPackage.coins + (selectedPackage.bonusCoins || 0))} عملة ذهبية) بمبلغ ${pkgPrice}. معرف حسابي ID: ${currentId}. يرجى تزويدي بطريقة التحويل أو شحن حسابي.`;
  };

  // Send direct message to the admin via /api/private-messages
  const handleSendAdminMessage = async () => {
    const textToSend = (adminContactMessage.trim() || getDefaultAdminMessage()).trim();
    setIsSendingMessage(true);
    try {
      await fetch('/api/private-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            id: `msg_recharge_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            senderId: currentUser.id,
            senderName: currentUser.name,
            senderAvatar: currentUser.avatar,
            receiverId: 'admin_shadow',
            text: textToSend,
            timestamp: Date.now(),
            isRead: false,
          },
        }),
      });

      sounds.playMessageSent();
      setAdminMessageSent(true);
      setTimeout(() => setAdminMessageSent(false), 5000);
    } catch {
      setAdminMessageSent(true);
      setTimeout(() => setAdminMessageSent(false), 5000);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Copy full order details to clipboard
  const handleCopyOrderDetails = () => {
    const textToCopy = (adminContactMessage.trim() || getDefaultAdminMessage()).trim();
    navigator.clipboard.writeText(textToCopy);
    setCopiedContactDetails(true);
    sounds.playMessageSent();
    setTimeout(() => setCopiedContactDetails(false), 2500);
  };

  // Fetch real transaction history from server
  const fetchTransactionHistory = async () => {
    setShowHistory(true);
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/payments/transactions/${encodeURIComponent(currentUser.id)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      }
    } catch {}
    setLoadingHistory(false);
  };

  // Execute payment: USDT TRC-20 Blockchain or Contact Admin
  const handleExecutePayment = async () => {
    if (selectedPaymentMethod.id === 'contact_admin') {
      await handleSendAdminMessage();
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    sounds.playLevelUp();

    try {
      const totalCoins = selectedPackage.coins + (selectedPackage.bonusCoins || 0);
      const totalDiamonds = selectedPackage.diamonds + (selectedPackage.bonusDiamonds || 0);

      // Dedicated USDT TRC-20 Blockchain verification flow
      const cleanTx = usdtTxHash.trim();
      if (!cleanTx || cleanTx.length < 10) {
        setPaymentError('يرجى لصق رمز المعاملة (TxID / Transaction Hash) من محفظتك بعد التحويل للتحقق عبر البلوكتشين.');
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/payments/verify-trc20', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          txHash: cleanTx,
          userId: currentUser.id,
          accountId: currentUser.accountId || currentUser.id,
          userName: currentUser.name,
          packageId: selectedPackage.id,
          packageTitle: selectedPackage.title,
          coins: totalCoins,
          diamonds: totalDiamonds,
          expectedAmount: selectedPackage.priceUsd,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.transaction) {
        setLastTransaction(data.transaction);
        setIsSuccess(true);
        sounds.playGiftMagic();

        const priceStr = `${data.transaction.totalAmount.toFixed(2)} USDT (TRC-20)`;
        onPurchasePackage(totalCoins, totalDiamonds, selectedPackage.title, priceStr);
      } else {
        setPaymentError(
          data.error || 'فشل التحقق من معاملة البلوكتشين. يرجى التأكد من صحة رمز TxID والتحويل للعنوان الصحيح.'
        );
      }
    } catch {
      setPaymentError('تعذر الاتصال ببوابة الدفع عبر البلوكتشين. يرجى التحقق من الشبكة وإعادة المحاولة أو التواصل مع الأدمن.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = () => {
    setIsSuccess(false);
    setLastTransaction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-100 overflow-hidden max-h-[92vh] flex flex-col">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Coins className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-white">متجر شحن الرصيد الرسمي</h3>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>دفع آمن 100%</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                شحن فوري ومباشر للعملات الذهبية والألماس بأفضل الأسعار
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

        {/* Success State View */}
        {isSuccess ? (
          <div className="py-8 px-4 text-center space-y-4 my-auto relative z-10 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h4 className="text-base font-black text-white">اكتملت عملية الشحن بنجاح! 🎉</h4>
              <p className="text-xs text-emerald-300 mt-1 font-bold">
                تمت إضافة الرصيد لحسابك فوراً
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-right space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>فاتورة إلكترونية معتمدة ضريبياً (ZATCA / VAT 15%)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {lastTransaction?.timestamp
                    ? new Date(lastTransaction.timestamp).toLocaleTimeString('ar-SA')
                    : 'الآن'}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span>رقم الفاتورة المرجعي:</span>
                <span className="font-mono text-emerald-300 font-bold">
                  #{lastTransaction?.id || `TX-${Date.now().toString().slice(-6)}`}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>المستفيد (معرف الحساب ID):</span>
                <span className="font-mono text-amber-300 font-bold">{currentId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>الباقة المشحونة:</span>
                <span className="text-white font-bold">{selectedPackage.title}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>وسيلة الدفع:</span>
                <span className="text-slate-200 font-bold">
                  {lastTransaction?.paymentMethodName || selectedPaymentMethod.name}
                </span>
              </div>

              {lastTransaction?.txHash && (
                <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-[10.5px] space-y-1.5 text-right">
                  <div className="flex items-center justify-between text-emerald-300 font-bold border-b border-emerald-500/30 pb-1">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>تأكيد البلوكتشين الرسمي (TRON TRC-20):</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-200 font-mono">
                      موثق على الشبكة ✓
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">عنوان محفظة الاستلام:</span>
                    <span className="font-mono text-emerald-300 text-[10px]" dir="ltr">
                      {USDT_TRC20_WALLET_ADDRESS}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">رمز تجزئة المعاملة (TxID):</span>
                    <a
                      href={`https://tronscan.org/#/transaction/${lastTransaction.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-sky-400 hover:text-sky-300 text-[10px] flex items-center gap-0.5 underline"
                      dir="ltr"
                    >
                      <span>
                        {lastTransaction.txHash.slice(0, 8)}...{lastTransaction.txHash.slice(-8)}
                      </span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-800/80 pt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>المبلغ الخاضع للضريبة:</span>
                  <span className="font-mono text-slate-300">
                    {lastTransaction?.amount
                      ? lastTransaction.amount.toFixed(2)
                      : (currencyView === 'SAR'
                          ? selectedPackage.priceSar
                          : selectedPackage.priceUsd
                        ).toFixed(2)}{' '}
                    {lastTransaction?.currency || currencyView}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span className="font-mono text-slate-300">
                    {lastTransaction?.vat
                      ? lastTransaction.vat.toFixed(2)
                      : (
                          (currencyView === 'SAR'
                            ? selectedPackage.priceSar
                            : selectedPackage.priceUsd) * 0.15
                        ).toFixed(2)}{' '}
                    {lastTransaction?.currency || currencyView}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-white font-bold pt-1 border-t border-slate-800/50">
                  <span>الإجمالي المسدد:</span>
                  <span className="font-mono text-emerald-400 text-sm font-black">
                    {lastTransaction?.totalAmount
                      ? lastTransaction.totalAmount.toFixed(2)
                      : (
                          (currencyView === 'SAR'
                            ? selectedPackage.priceSar
                            : selectedPackage.priceUsd) * 1.15
                        ).toFixed(2)}{' '}
                    {lastTransaction?.currency || currencyView}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                <span>الرصيد المضاف لحسابك:</span>
                <span className="text-amber-400 font-black font-mono">
                  +{formatCoins(selectedPackage.coins + (selectedPackage.bonusCoins || 0))} 🪙
                  {selectedPackage.diamonds > 0 && ` و +${formatDiamonds(selectedPackage.diamonds)} 💎`}
                </span>
              </div>
            </div>

            <button
              onClick={handleDone}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              العودة للتطبيق والاستمتاع بالرصيد 🌟
            </button>
          </div>
        ) : (
          /* Main Store Content Area */
          <div className="mt-3 overflow-y-auto pr-1 flex-1 space-y-3.5 relative z-10 scrollbar-none">
            
            {/* Admin Sovereign Free Power Banner (If User is Admin) */}
            {isAdmin && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-indigo-950/40 border border-amber-500/40 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 shrink-0">
                    <Zap className="w-4 h-4 fill-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-300 block">
                      أنت المدير العام (Admin) 👑
                    </span>
                    <span className="text-[10.5px] text-slate-300 block">
                      لديك صلاحية شحن رصيدك أو تحويله لأي مستخدم بالـ ID مجاناً بدون دفع!
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    if (onOpenAdminFreeRecharge) onOpenAdminFreeRecharge();
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10.5px] shrink-0 active:scale-95 transition-all shadow"
                >
                  لوحة الشحن المجاني ⚡
                </button>
              </div>
            )}

            {/* User Account ID & Current Balances Card */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <div>
                  <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-amber-300 font-mono font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      ID: {currentId}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 transition-colors"
                      title="نسخ معرف الحساب"
                    >
                      {copiedId ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Balances */}
              <div className="text-left font-mono">
                <div className="flex items-center justify-end gap-1 text-[11px] font-black text-amber-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{formatCoins(currentUser.coins || 0)}</span>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] font-black text-sky-400 mt-0.5">
                  <Gem className="w-3 h-3" />
                  <span>{formatDiamonds(currentUser.diamonds || 0)}</span>
                </div>
              </div>
            </div>

            {/* Category Tabs & Currency Selector */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveCategory('coins')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeCategory === 'coins'
                      ? 'bg-amber-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>العملات الذهبية</span>
                </button>
                <button
                  onClick={() => setActiveCategory('diamonds')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    activeCategory === 'diamonds'
                      ? 'bg-sky-500 text-slate-950 font-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Gem className="w-3.5 h-3.5" />
                  <span>الألماس</span>
                </button>
              </div>

              {/* Currency Toggle (SAR / USD) */}
              <div className="flex items-center gap-0.5 p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setCurrencyView('SAR')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    currencyView === 'SAR' ? 'bg-slate-800 text-amber-300' : 'text-slate-500'
                  }`}
                >
                  ر.س
                </button>
                <button
                  onClick={() => setCurrencyView('USD')}
                  className={`px-2 py-1 rounded-lg font-bold transition-all ${
                    currencyView === 'USD' ? 'bg-slate-800 text-amber-300' : 'text-slate-500'
                  }`}
                >
                  USD $
                </button>
              </div>
            </div>

            {/* Exchange Rate Alignment Notice */}
            {activeCategory === 'coins' && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>معدل الشحن الموحد: $1 = 10,000 عملة ذهبية (مساوٍ تماماً لاشتراكات التيجان الملكية)</span>
                </span>
                <span className="text-[10px] text-amber-400/80 font-mono shrink-0 hidden sm:inline">
                  $200 = 2,000,000 عملة
                </span>
              </div>
            )}

            {/* Package Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
              {filteredPackages.map((pkg) => {
                const isSelected = selectedPackage.id === pkg.id;
                const totalCoins = pkg.coins + (pkg.bonusCoins || 0);
                const totalDiamonds = pkg.diamonds + (pkg.bonusDiamonds || 0);
                const price = currencyView === 'SAR' ? `${pkg.priceSar.toFixed(2)} ر.س` : `$${pkg.priceUsd.toFixed(2)}`;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => {
                      setSelectedPackage(pkg);
                      sounds.playMessageSent();
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-b from-slate-850 to-slate-950 border-amber-400 ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Badges */}
                    {pkg.badge && (
                      <div className="absolute -top-2 left-2">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm ${
                          pkg.popular ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                        }`}>
                          {pkg.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-1.5 mb-1 mt-1">
                        {pkg.category === 'coins' ? (
                          <Coins className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Gem className="w-4 h-4 text-sky-400" />
                        )}
                        <span className="text-[11px] font-bold text-slate-300 truncate">
                          {pkg.title}
                        </span>
                      </div>

                      {/* Main Amount */}
                      <div className="my-1.5">
                        <span className="text-sm font-black text-amber-300 font-mono block">
                          {pkg.category === 'coins' ? `${formatCoins(totalCoins)} 🪙` : `${formatDiamonds(totalDiamonds)} 💎`}
                        </span>

                        {pkg.category === 'coins' && pkg.diamonds > 0 && (
                          <span className="text-[10px] text-sky-300 font-bold flex items-center gap-0.5 mt-0.5">
                            <Gem className="w-2.5 h-2.5" />
                            <span>+{formatDiamonds(pkg.diamonds)} ماس هدية</span>
                          </span>
                        )}

                        {pkg.category === 'diamonds' && pkg.coins > 0 && (
                          <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <Coins className="w-2.5 h-2.5" />
                            <span>+{formatCoins(pkg.coins)} ذهب هدية</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price Button */}
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-xs font-black text-white font-mono">
                        {price}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Methods Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                  <span>اختر وسيلة الدفع الحقيقية:</span>
                </label>
                <button
                  type="button"
                  onClick={fetchTransactionHistory}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <span>سجل المدفوعات 📋</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PAYMENT_METHODS.map((method) => {
                  const isChosen = selectedPaymentMethod.id === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`p-2.5 rounded-xl border text-right flex items-center justify-between gap-2 transition-all ${
                        isChosen
                          ? method.id === 'usdt_trc20'
                            ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/50'
                            : 'bg-amber-950/40 border-amber-500 text-white ring-1 ring-amber-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl font-bold w-7 text-center">{method.icon}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{method.name}</span>
                            {method.badge && (
                              <span className={`text-[8.5px] px-1.5 py-0.2 rounded font-bold ${
                                method.id === 'usdt_trc20' 
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}>
                                {method.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] text-slate-400 block">{method.subtext}</span>
                        </div>
                      </div>

                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isChosen 
                          ? method.id === 'usdt_trc20' 
                            ? 'border-emerald-400 bg-emerald-500 text-slate-950 font-bold'
                            : 'border-amber-400 bg-amber-500 text-slate-950 font-bold'
                          : 'border-slate-700'
                      }`}>
                        {isChosen && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* USDT TRC-20 Blockchain Payment Details */}
              {selectedPaymentMethod.id === 'usdt_trc20' && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-3 mt-2 animate-fade-in shadow-lg shadow-emerald-500/5">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span>دفع حقيقي عبر USDT (شبكة ترون TRC-20)</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                      تأكيد البلوكتشين ⚡
                    </span>
                  </div>

                  {/* Required USDT Amount */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-300 block font-bold">المبلغ المطلوب تحويله:</span>
                      <span className="text-[9px] text-slate-400">سعر الباقة المحدد بدون أي عمولات إضافية</span>
                    </div>
                    <div className="text-left" dir="ltr">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {selectedPackage.priceUsd.toFixed(2)} USDT
                      </span>
                    </div>
                  </div>

                  {/* Wallet Address to send to */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-300 font-bold block">
                        عنوان المحفظة المستلمة (TRC20 Wallet Address):
                      </label>
                      <a
                        href={`https://tronscan.org/#/address/${USDT_TRC20_WALLET_ADDRESS}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
                      >
                        <span>فحص العنوان على TronScan</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-emerald-500/30">
                      <span className="text-[11px] font-mono text-emerald-300 font-bold select-all break-all flex-1 text-left" dir="ltr">
                        {USDT_TRC20_WALLET_ADDRESS}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors shadow"
                      >
                        {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAddress ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Crucial Network Warning */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10.5px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                    <div>
                      <strong className="block mb-0.5 text-amber-200">تنبيه شبكة التحويل:</strong>
                      <span>
                        أرسل المبلغ حصراً عبر شبكة <strong>TRON (TRC-20)</strong> إلى العنوان أعلاه. أي تحويل عبر شبكة مغايرة (مثل ERC-20 أو BEP-20) لن يتم تأكيده عبر البلوكتشين.
                      </span>
                    </div>
                  </div>

                  {/* TxID Input Field */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10.5px] text-slate-200 font-bold block">
                      رمز المعاملة بعد التحويل (TxID / Transaction Hash):
                    </label>
                    <input
                      type="text"
                      placeholder="الصق رمز تجزئة المعاملة من محفظتك (TxID من Binance أو Trust Wallet)..."
                      value={usdtTxHash}
                      onChange={(e) => setUsdtTxHash(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-white text-xs font-mono focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 focus:outline-none text-left"
                      dir="ltr"
                    />
                    <p className="text-[9.5px] text-slate-400 leading-relaxed">
                      بعد إتمام التحويل من محفظتك الخاصة، انسخ رمز العملية (TxID / Hash) وضعه هنا ثم اضغط على زر التأكيد بالأسفل للتحقق الفوري عبر البلوكتشين وإيداع الرصيد.
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Admin & "خانة تواصل معي" Section */}
              {selectedPaymentMethod.id === 'contact_admin' && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 mt-2 animate-fade-in shadow-lg shadow-amber-500/5">
                  {/* Section Title */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      <span>خانة تواصل معي — التنسيق المباشر مع المدير العام</span>
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>متاح للشحن الفوري</span>
                    </span>
                  </div>

                  {/* Admin Info Card */}
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/20 border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                          alt="المدير العام"
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow"
                        />
                        <span className="absolute -top-1 -right-1 text-xs">👑</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">المدير العام (Owner)</span>
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                            ID: 10001
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-amber-400" />
                          <span>shadow008btc@gmail.com</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Package Details for Request */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">الباقة المطلوبة للشحن:</span>
                      <span className="font-bold text-amber-300">{selectedPackage.title}</span>
                      <span className="text-[10px] text-slate-400 mr-1.5">
                        ({formatCoins(selectedPackage.coins + (selectedPackage.bonusCoins || 0))} عملة)
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white block">
                        {currencyView === 'SAR' ? `${selectedPackage.priceSar.toFixed(2)} ر.س` : `$${selectedPackage.priceUsd.toFixed(2)}`}
                      </span>
                      <span className="text-[9.5px] text-emerald-400 font-mono">حسابك: ID {currentId}</span>
                    </div>
                  </div>

                  {/* خانة تواصل معي - Direct Message Textarea */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-amber-400" />
                        <span>خانة تواصل معي (اكتب رسالتك للمدير العام):</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setAdminContactMessage(getDefaultAdminMessage())}
                        className="text-[9.5px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                      >
                        <span>تعبئة تلقائية ✍️</span>
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={adminContactMessage}
                      onChange={(e) => setAdminContactMessage(e.target.value)}
                      placeholder={getDefaultAdminMessage()}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none resize-none leading-relaxed"
                    />

                    {/* Notification on Sent or Copied */}
                    {adminMessageSent && (
                      <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5 animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>تم إرسال رسالتك إلى المدير العام بنجاح! سيتم مراجعتها والرد فوراً في المحادثة الخاصة.</span>
                      </div>
                    )}

                    {copiedContactDetails && (
                      <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-1.5 animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>تم نسخ تفاصيل الطلب ومعرف حسابك بنجاح!</span>
                      </div>
                    )}

                    {/* Quick action buttons for Contact Me */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSendAdminMessage}
                        disabled={isSendingMessage}
                        className="py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isSendingMessage ? (
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        <span>إرسال للمدير الآن 🚀</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyOrderDetails}
                        className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all active:scale-95"
                      >
                        {copiedContactDetails ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>نسخ تفاصيل طلبي 📋</span>
                      </button>
                    </div>
                  </div>

                  {/* Fast Instant Channel: In-App Chat Only */}
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block">
                      القناة الرسمية المعتمدة للتواصل:
                    </span>
                    {onOpenAdminChat ? (
                      <button
                        type="button"
                        onClick={onOpenAdminChat}
                        className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4 text-white" />
                        <span>فتح محادثة خاصة فورية بالتطبيق مع المدير العام 💬</span>
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-blue-300 text-xs text-center font-bold">
                        تواصل مع المدير العام عبر المحادثة الخاصة داخل التطبيق
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Error Message Display */}
            {paymentError && (
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Direct Admin Transfer Info */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Crown className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-300 font-bold block mb-0.5">
                  طرق الشحن المعتمدة:
                </span>
                <span>
                  تم تفعيل الشحن حصراً عبر <strong>USDT (TRC-20)</strong> فوري عبر البلوكتشين، أو <strong>عن طريق التواصل مع الأدمن (خانة تواصل معي)</strong> وتزويده بمعرف حسابك (ID: {currentId}) للتنفيذ الفوري.
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <div className="pt-2 sticky bottom-0 bg-slate-900/95 backdrop-blur-md">
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={isProcessing || isSendingMessage}
                className={`w-full py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all disabled:opacity-50 ${
                  selectedPaymentMethod.id === 'usdt_trc20'
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25'
                }`}
              >
                {isProcessing || isSendingMessage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>
                      {selectedPaymentMethod.id === 'usdt_trc20'
                        ? 'جاري التحقق من البلوكتشين (TronScan API)...'
                        : 'جاري إرسال رسالتك وتواصل مع المدير العام...'}
                    </span>
                  </>
                ) : (
                  <>
                    {selectedPaymentMethod.id === 'usdt_trc20' ? (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-slate-950" />
                        <span>
                          تأكيد البلوكتشين وشحن {selectedPackage.title} ({selectedPackage.priceUsd.toFixed(2)} USDT TRC-20)
                        </span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-3.5 h-3.5" />
                        <span>
                          إرسال طلب الشحن وتواصل مع المدير العام 👑 ({selectedPackage.title})
                        </span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>

            {/* Transaction History Modal Overlay */}
            {showHistory && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/90 backdrop-blur-md animate-fade-in">
                <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl space-y-3 max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span>سجل عمليات الدفع والشحن الحقيقية</span>
                    </h4>
                    <button
                      onClick={() => setShowHistory(false)}
                      className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {loadingHistory ? (
                      <div className="py-8 text-center text-xs text-slate-400">جاري تحميل سجل العمليات...</div>
                    ) : transactions.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">لا توجد عمليات دفع مسجلة بعد.</div>
                    ) : (
                      transactions.map((tx: any) => (
                        <div key={tx.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-amber-300 font-bold">#{tx.id}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                              {tx.status === 'completed' ? 'مكتمل بنجاح ✓' : tx.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-300">
                            <span>{tx.packageTitle}</span>
                            <span className="font-bold text-white font-mono">
                              {tx.totalAmount ? tx.totalAmount.toFixed(2) : tx.amount.toFixed(2)} {tx.currency}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[10px]">
                            <span>{tx.paymentMethodName || tx.paymentMethod}</span>
                            <span>{new Date(tx.timestamp).toLocaleString('ar-SA')}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setShowHistory(false)}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
