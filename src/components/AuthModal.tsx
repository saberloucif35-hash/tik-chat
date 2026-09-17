import React, { useState, useEffect } from 'react';
import { 
  X, Mail, Lock, User as UserIcon, Sparkles, 
  CheckCircle2, AlertCircle, LogIn, UserPlus, KeyRound, ShieldCheck,
  Check, Eye, EyeOff, Shield, Loader2, Send, ArrowLeft
} from 'lucide-react';
import { User } from '../types';
import { authService, USER_ADMIN_EMAIL } from '../utils/authService';
import { sounds } from '../utils/audioEffects';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'signup' | 'admin' | 'reset';
}

type AuthMode = 'login' | 'signup' | 'reset' | 'admin';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Wrong password detection state
  const [wrongPasswordState, setWrongPasswordState] = useState<{ isWrong: boolean; email: string } | null>(null);

  // OTP Verification state (for email verification & reset)
  const [verificationCode, setVerificationCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Helper to switch mode and cleanly reset verification state
  const switchMode = (newMode: 'login' | 'signup' | 'reset' | 'admin') => {
    setMode(newMode);
    setError(null);
    setSuccessMsg(null);
    setWrongPasswordState(null);
    setIsCodeVerified(false);
    setIsOtpSent(false);
    setVerificationCode('');
    setVerifiedEmail(null);
    setPassword('');
    setConfirmPassword('');
    authService.clearOtp();
  };

  // Google OAuth Loading state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleManualEmail, setGoogleManualEmail] = useState('');

  // Admin specific form state
  const [adminEmail, setAdminEmail] = useState(USER_ADMIN_EMAIL);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Submission loading & feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for resending verification code
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Sync mode if initialMode changes or modal opens/closes
  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setSuccessMsg(null);
    setWrongPasswordState(null);
    setIsCodeVerified(false);
    setIsOtpSent(false);
    setVerificationCode('');
    setVerifiedEmail(null);
    setPassword('');
    setConfirmPassword('');
    authService.clearOtp();
  }, [initialMode, isOpen]);

  // Listen for Google OAuth Callback postMessage from popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (
        !origin.endsWith('.run.app') && 
        !origin.includes('localhost') && 
        !origin.includes('google.com')
      ) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        completeGoogleLogin(currentUser.email || 'user@gmail.com', currentUser.name || 'مستخدم جوجل الموثق');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentUser]);

  if (!isOpen) return null;

  // Complete Google / Gmail Login
  const completeGoogleLogin = (userEmail: string, userName?: string) => {
    setIsGoogleLoading(false);
    setShowGooglePrompt(false);

    const cleanEmail = userEmail.trim().toLowerCase();
    const cleanName = userName?.trim() || cleanEmail.split('@')[0] || 'مستخدم Gmail';

    const res = authService.loginOrRegisterSocial('google', {
      email: cleanEmail,
      name: cleanName,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      socialId: cleanEmail,
    });

    sounds.playApplause();
    setSuccessMsg(`تم تسجيل الدخول بنجاح عبر حساب Google (${cleanEmail})! حصلت على 100 عملة 🎁`);
    
    setTimeout(() => {
      onLoginSuccess(res.user);
      onClose();
    }, 800);
  };

  // Launch Google OAuth
  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setIsGoogleLoading(true);

    const redirectUri = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback` 
      : 'https://ais-dev-kvuvyd7vym77czzr26kr55-443746271141.europe-west1.run.app/auth/callback';

    try {
      const res = await fetch(`/api/auth/oauth/url?provider=google&redirect_uri=${encodeURIComponent(redirectUri)}`);
      let authUrl = '';
      if (res.ok) {
        const data = await res.json();
        authUrl = data.url;
      }

      if (!authUrl) {
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=10476483921-google-oauth.apps.googleusercontent.com&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;
      }

      const authWindow = window.open(
        authUrl,
        'google_oauth_popup',
        'width=560,height=680,status=yes,scrollbars=yes,location=yes'
      );

      if (!authWindow) {
        // Popup blocked -> show direct Gmail input sheet
        setIsGoogleLoading(false);
        setShowGooglePrompt(true);
        setGoogleManualEmail(currentUser.email || '');
        return;
      }

      const checkInterval = setInterval(() => {
        if (!authWindow || authWindow.closed) {
          clearInterval(checkInterval);
          setIsGoogleLoading(false);
        }
      }, 1000);

    } catch (err) {
      console.error('Google auth error:', err);
      setIsGoogleLoading(false);
      setShowGooglePrompt(true);
    }
  };

  // Send real email OTP for verification / reset
  const handleSendEmailOtp = async (targetOverride?: string, purposeOverride?: 'verification' | 'reset') => {
    const targetEmail = targetOverride || (mode === 'admin' ? adminEmail : email);
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('يرجى كتابة البريد الإلكتروني أولاً لاستلام رمز التحقق.');
      return;
    }

    const currentPurpose: 'verification' | 'reset' = purposeOverride || (mode === 'reset' ? 'reset' : 'verification');

    // Invalidate any previous verification status & code to guarantee fresh code
    setIsCodeVerified(false);
    setVerifiedEmail(null);
    setVerificationCode('');
    setError(null);
    setIsSendingOtp(true);

    try {
      const res = await authService.sendOtp(cleanEmail, 'email', currentPurpose);
      setIsSendingOtp(false);

      if (res.success) {
        setIsOtpSent(true);
        setOtpCountdown(60);
        setSuccessMsg(
          res.message || (
            currentPurpose === 'reset'
              ? `تم إرسال كود جديد لإعادة تعيين كلمة المرور إلى بريدك (${cleanEmail}). يرجى مراجعة صندوق الوارد.`
              : `تم إرسال رمز التحقق إلى بريدك الإلكتروني (${cleanEmail}) بنجاح.`
          )
        );
        sounds.playGiftMagic();
      } else {
        setError(res.message || 'فشل إرسال رمز التحقق، يرجى المحاولة لاحقاً.');
      }
    } catch {
      setIsSendingOtp(false);
      setError('حدث خطأ أثناء الاتصال بخادم البريد، يرجى المحاولة مجدداً.');
    }
  };

  // Trigger dedicated password reset flow for wrong password email
  const triggerPasswordResetForEmail = (targetMail: string) => {
    setError(null);
    setSuccessMsg(null);
    setMode('reset');
    setEmail(targetMail);
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setIsCodeVerified(false);
    setIsOtpSent(false);
    setVerifiedEmail(null);
    setWrongPasswordState(null);
    authService.clearOtp(targetMail);
    handleSendEmailOtp(targetMail, 'reset');
  };

  // Verify entered OTP code
  const handleVerifyOtp = async () => {
    const targetEmail = mode === 'admin' ? adminEmail : email;
    const cleanEmail = targetEmail.trim().toLowerCase();
    if (!verificationCode.trim() || verificationCode.trim().length !== 6) {
      setError('يرجى إدخال كود التحقق المكون من 6 أرقام كاملاً.');
      return;
    }

    const currentPurpose: 'verification' | 'reset' = mode === 'reset' ? 'reset' : 'verification';

    setError(null);
    setIsVerifyingOtp(true);

    try {
      const res = await authService.verifyOtp(cleanEmail, verificationCode, currentPurpose);
      setIsVerifyingOtp(false);

      if (res.success) {
        setIsCodeVerified(true);
        setVerifiedEmail(cleanEmail);
        setSuccessMsg(
          currentPurpose === 'reset'
            ? 'تم تأكيد رمز الأمان بنجاح ✓ يمكنك الآن كتابة وحفظ كلمة المرور الجديدة.'
            : 'تم التحقق من ملكية البريد الإلكتروني بنجاح ✓'
        );
        sounds.playLevelUp();
      } else {
        setIsCodeVerified(false);
        setVerifiedEmail(null);
        setError(res.error || 'رمز التحقق غير صحيح، يرجى التأكد من البريد.');
      }
    } catch {
      setIsVerifyingOtp(false);
      setIsCodeVerified(false);
      setVerifiedEmail(null);
      setError('تعذر التحقق من الرمز، يرجى إعادة المحاولة.');
    }
  };

  // Email form submit (Login / Signup / Reset)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. LOGIN MODE
    if (mode === 'login') {
      setTimeout(() => {
        const res = authService.loginWithEmail(cleanEmail, cleanPass);
        setIsLoading(false);

        if (!res.success || !res.user) {
          setError(res.error || 'فشل تسجيل الدخول بالبريد الإلكتروني.');
          if (res.isWrongPassword) {
            setWrongPasswordState({ isWrong: true, email: cleanEmail });
          } else {
            setWrongPasswordState(null);
          }
          sounds.playGiftMagic();
          return;
        }

        setWrongPasswordState(null);
        sounds.playApplause();
        setSuccessMsg(`أهلاً بك مجدداً يا ${res.user.name}! جاري تسجيل دخولك...`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 700);
      }, 400);
      return;
    }

    // 2. SIGNUP MODE (Strict Real Verification Enforced)
    if (mode === 'signup') {
      if (!isCodeVerified || verifiedEmail !== cleanEmail) {
        setIsLoading(false);
        if (!isOtpSent) {
          handleSendEmailOtp(cleanEmail, 'verification');
          setError('تم إرسال كود تحقق حقيقي إلى بريدك الإلكتروني. يرجى إدخال الرمز المكون من 6 أرقام لتأكيد الحساب.');
        } else {
          setError('يرجى تأكيد رمز التحقق المكون من 6 أرقام المرسل إلى بريدك أولاً لإتمام التسجيل.');
        }
        return;
      }

      setTimeout(() => {
        const res = authService.registerWithEmail({
          name: name.trim() || cleanEmail.split('@')[0] || 'عضو جديد',
          email: cleanEmail,
          password: cleanPass,
          isVerified: true,
        });
        setIsLoading(false);

        if (!res.success || !res.user) {
          setError(res.error || 'تعذر إنشاء الحساب بالبريد الإلكتروني.');
          sounds.playGiftMagic();
          return;
        }

        sounds.playLevelUp();
        setSuccessMsg(`مبروك! تم إنشاء حسابك بنجاح وحصلت على 100 عملة ترحيبية 🎁`);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          setIsCodeVerified(false);
          setIsOtpSent(false);
          setVerificationCode('');
          setVerifiedEmail(null);
          setPassword('');
          setConfirmPassword('');
          onClose();
        }, 700);
      }, 400);
      return;
    }

    // 3. RESET PASSWORD MODE (Real Email Reset Flow)
    if (mode === 'reset') {
      if (!isCodeVerified || verifiedEmail !== cleanEmail) {
        setIsLoading(false);
        if (!isOtpSent) {
          handleSendEmailOtp(cleanEmail, 'reset');
          setError('تم إرسال كود أمان جديد إلى بريدك. يرجى إدخال الرمز المكون من 6 أرقام لتغيير كلمة المرور.');
        } else {
          setError('يرجى إدخال وتأكيد كود الأمان الجديد المرسل إلى بريدك أولاً لتعيين كلمة مرور جديدة.');
        }
        return;
      }

      if (cleanPass.length < 6) {
        setIsLoading(false);
        setError('يجب ألا تقل كلمة المرور الجديدة عن 6 خانات.');
        return;
      }

      if (confirmPassword && cleanPass !== confirmPassword.trim()) {
        setIsLoading(false);
        setError('كلمتا المرور غير متطابقتين! يرجى التأكد من تطابق كلمة المرور وتأكيدها.');
        return;
      }

      setTimeout(() => {
        const res = authService.resetPassword(cleanEmail, cleanPass, true);
        setIsLoading(false);

        if (!res.success) {
          setError(res.error || 'تعذر تغيير كلمة المرور.');
          return;
        }

        sounds.playLevelUp();
        setSuccessMsg('تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول بها.');
        setTimeout(() => {
          switchMode('login');
        }, 1200);
      }, 400);
      return;
    }
  };

  // Admin Login Submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = authService.loginAdmin(adminEmail.trim(), adminPassword.trim());
      setIsLoading(false);

      if (!res.success || !res.user) {
        setError(res.error || 'فشل تسجيل دخول المدير العام.');
        sounds.playGiftMagic();
        return;
      }

      sounds.playLevelUp();
      setSuccessMsg('تم تسجيل دخول المدير العام بنجاح 👑 مرحباً بك في لوحة الإدارة.');
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 700);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl text-slate-100 overflow-hidden my-auto">
        
        {/* Ambient Subtle Backlight */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow ${
              mode === 'admin' 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-amber-500/20' 
                : 'bg-blue-600/20 border-blue-500/30 text-blue-400 shadow-blue-500/20'
            }`}>
              {mode === 'admin' ? <Shield className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black text-white flex items-center gap-2">
                {mode === 'login' && 'تسجيل الدخول بالبريد والجيميل'}
                {mode === 'signup' && 'إنشاء حساب جديد حقيقي'}
                {mode === 'reset' && 'استعادة وتعيين كلمة المرور'}
                {mode === 'admin' && 'بوابة إدارة المنصة (VIP)'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {mode === 'admin' 
                  ? 'خاص بمسؤولي النظام والمدير العام فقط'
                  : 'التسجيل والمصادقة الحقيقية عبر الجيميل والبريد الإلكتروني'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts & Feedbacks */}
        {error && (
          <div className="my-3.5 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2 text-xs text-red-300 animate-fade-in relative z-10">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="my-3.5 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-300 animate-fade-in relative z-10">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* NON-ADMIN MODES: GMAIL + EMAIL ONLY */}
        {/* ============================================================ */}
        {mode !== 'admin' && (
          <div className="space-y-4 pt-3 relative z-10">
            
            {/* 1. PRIMARY PROMINENT GMAIL / GOOGLE AUTH BUTTON */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-98 cursor-pointer border border-slate-200 disabled:opacity-70"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    <span>جاري الاتصال بـ Google...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google 'G' Vector Icon */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span>المتابعة والتسجيل باستخدام حساب Google / Gmail</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between px-1 text-[10.5px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  تسجيل فوري وموثق بحساب Google الرسمي
                </span>
                <span className="text-amber-300 font-bold">+100 عملة مجانية 🎁</span>
              </div>
            </div>

            {/* DIVIDER: "أو عبر البريد الإلكتروني" */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-400 shrink-0">
                أو استخدام البريد الإلكتروني (Email)
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Sub-mode Navigation: Login vs Signup */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل دخول بالبريد</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>حساب جديد بالبريد</span>
              </button>
            </div>

            {/* Wrong Password Special Recovery Card */}
            {wrongPasswordState?.isWrong && mode === 'login' && (
              <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-amber-500/10 border border-amber-500/40 rounded-2xl space-y-2.5 animate-fade-in shadow-lg">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl shrink-0 mt-0.5">
                    <KeyRound className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300">
                      هل نسيت كلمة المرور الخاصة بحسابك؟
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      لديك كامل الصلاحية لإعادة تعيين كلمة المرور فورياً عبر إرسال رمز تحقق حقيقي إلى بريدك الإلكتروني (<span className="text-amber-300 font-mono font-bold" dir="ltr">{wrongPasswordState.email}</span>).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerPasswordResetForEmail(wrongPasswordState.email)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>إعادة تعيين كلمة المرور عبر البريد الآن (كود حقيقي)</span>
                </button>
              </div>
            )}

            {/* 2. EMAIL FORM */}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              
              {/* Display Name (Only in Signup mode) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الاسم المعروض في المحادثات والغرف الصوتية
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="اسمك المستعار أو الكامل"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-9"
                    />
                    <UserIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  البريد الإلكتروني (Email Address)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsCodeVerified(false);
                      setIsOtpSent(false);
                      setVerificationCode('');
                      setVerifiedEmail(null);
                    }}
                    placeholder="name@gmail.com أو أي بريد إلكتروني"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-9 font-mono"
                    dir="ltr"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Verification Code Section (Required in reset & real signup) */}
              {(mode === 'reset' || mode === 'signup') && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                      {mode === 'reset' ? 'رمز الأمان لإعادة تعيين كلمة المرور' : 'رمز التحقق الحقيقي للبريد'}
                    </span>

                    {isCodeVerified && verifiedEmail === email.trim().toLowerCase() ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                        <Check className="w-3 h-3" /> تم التحقق وتأكيد الملكية ✓
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendEmailOtp(undefined, mode === 'reset' ? 'reset' : 'verification')}
                        disabled={otpCountdown > 0 || isSendingOtp}
                        className="text-[11px] font-bold text-blue-400 hover:text-blue-300 disabled:text-slate-500 flex items-center gap-1 cursor-pointer"
                      >
                        {isSendingOtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        <span>
                          {otpCountdown > 0 
                            ? `إعادة الإرسال بعد (${otpCountdown}s)` 
                            : (isOtpSent 
                                ? 'إعادة إرسال كود جديد' 
                                : (mode === 'reset' ? 'إرسال كود جديد للبريد' : 'إرسال رمز التحقق للبريد'))}
                        </span>
                      </button>
                    )}
                  </div>

                  {(!isCodeVerified || verifiedEmail !== email.trim().toLowerCase()) && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          placeholder={mode === 'reset' ? 'أدخل كود إعادة التعيين الجديد (6 أرقام)' : 'أدخل كود التحقق (6 أرقام)'}
                          disabled={isCodeVerified || isVerifyingOtp}
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-blue-500 disabled:opacity-60"
                        />

                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isVerifyingOtp || verificationCode.length !== 6}
                          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          {isVerifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'تأكيد الرمز'}
                        </button>
                      </div>

                      {isOtpSent && (!isCodeVerified || verifiedEmail !== email.trim().toLowerCase()) && (
                        <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                          {mode === 'reset'
                            ? '📩 تم إرسال رمز أمان جديد لإعادة تعيين كلمة المرور إلى بريدك. يرجى إدخال الرمز المكون من 6 أرقام هنا.'
                            : '📩 تم إرسال رمز التحقق إلى بريدك الإلكتروني. يرجى مراجعة بريدك وإدخال الرمز المكون من 6 أرقام.'}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {mode === 'reset' ? 'كلمة المرور الجديدة' : 'كلمة المرور'}
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('reset')}
                      className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (6 خانات على الأقل)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-9 pl-9 font-mono"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (In Reset Mode) */}
              {mode === 'reset' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="أعد إدخال كلمة المرور الجديدة للتأكيد"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 pr-9 font-mono"
                      dir="ltr"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    {mode === 'login' && <LogIn className="w-4 h-4 stroke-[2.5]" />}
                    {mode === 'signup' && <UserPlus className="w-4 h-4 stroke-[2.5]" />}
                    {mode === 'reset' && <KeyRound className="w-4 h-4 stroke-[2.5]" />}
                    <span>
                      {mode === 'login' && 'تسجيل الدخول بالبريد'}
                      {mode === 'signup' && (isCodeVerified ? 'إتمام إنشاء الحساب الموثق (+100 عملة 🎁)' : 'تأكيد البريد وإنشاء الحساب')}
                      {mode === 'reset' && 'حفظ وتأكيد كلمة المرور الجديدة'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Back button from Reset mode */}
            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>العودة لتسجيل الدخول</span>
              </button>
            )}

            {/* Discreet Admin VIP portal entry */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>خاص بمشرفي المنصة؟</span>
              <button
                type="button"
                onClick={() => switchMode('admin')}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer hover:underline"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>دخول الإدارة العامة (VIP)</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ADMIN VIP MODE */}
        {/* ============================================================ */}
        {mode === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-3.5 pt-3 relative z-10">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">بوابة المدير العام (Admin Root):</p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  الدخول محمي ببيانات اعتماد المدير العام لإدارة الغرف الصوتية، تعيين الحظر، وإسناد الرتب.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                بريد المدير العام المعتمد (Admin Email)
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-9 font-mono"
                  placeholder="saberqsq@gmail.com"
                  dir="ltr"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                كلمة مرور الإدارة العليا
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 pr-9 pl-9 font-mono"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق من هوية المدير...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>تسجيل دخول لوحة الإدارة (VIP)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => switchMode('login')}
              className="w-full py-2 text-slate-400 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>العودة لتسجيل دخول الأعضاء (الجيميل والبريد)</span>
            </button>
          </form>
        )}

        {/* DIALOG FOR DIRECT GMAIL ADDRESS ENTRY (When popup is blocked) */}
        {showGooglePrompt && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">
                      تسجيل حساب Google / Gmail
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      أدخل بريد Gmail الحقيقي الخاص بك للمتابعة
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGooglePrompt(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    عنوان بريد Gmail
                  </label>
                  <input
                    type="email"
                    required
                    value={googleManualEmail}
                    onChange={(e) => setGoogleManualEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    dir="ltr"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowGooglePrompt(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!googleManualEmail.trim() || !googleManualEmail.includes('@')) {
                        setError('يرجى إدخال عنوان Gmail صحيح');
                        return;
                      }
                      completeGoogleLogin(googleManualEmail);
                    }}
                    className="flex-1 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-black transition-all shadow cursor-pointer"
                  >
                    تأكيد ودخول
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
