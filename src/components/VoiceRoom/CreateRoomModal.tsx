import React, { useState } from 'react';
import { 
  X, Sparkles, Radio, Image as ImageIcon, Check, 
  Gamepad2, Users, Globe, Shield, AlertCircle, Plus
} from 'lucide-react';
import { VoiceRoom, User } from '../../types';
import { sounds } from '../../utils/audioEffects';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  userCreatedRoomsCount: number;
  maxRoomsAllowed?: number;
  isLoggedIn?: boolean;
  onOpenAuthModal?: () => void;
  onCreateRoom: (newRoom: VoiceRoom) => void;
}

const COVER_PRESETS = [
  {
    name: 'مجلس خليجي فخم',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'طرب وأمسيات موسيقية',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'ساحة لودو وتحديات',
    url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'كافيه سوالف وضحك',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'سماء ونجوم وخواطر',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'استوديو بث فضائي',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
  },
];

const CATEGORIES = [
  { id: 'chat', nameAr: 'سوالف وفرفشة ☕', tag: 'سوالف عامة' },
  { id: 'games', nameAr: 'ألعاب ولودو 🎲', tag: 'تحدي لودو' },
  { id: 'music', nameAr: 'طرب وشعر 🎶', tag: 'طرب وأمسيات' },
  { id: 'competitions', nameAr: 'مسابقات وتحديات 💡', tag: 'مسابقات مباشرة' },
  { id: 'poetry', nameAr: 'شعر وخواطر 🌙', tag: 'شعر وأدب' },
];

const COUNTRIES = [
  '🇸🇦 السعودية',
  '🇦🇪 الإمارات',
  '🇰🇼 الكويت',
  '🇶🇦 قطر',
  '🇴🇲 عُمان',
  '🇧🇭 البحرين',
  '🇪🇬 مصر',
  '🇯🇴 الأردن',
  '🇮🇶 العراق',
  '🇩🇿 الجزائر',
  '🇲🇦 المغرب',
  '🌍 عامة / كل الدول',
];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  userCreatedRoomsCount,
  maxRoomsAllowed = 3,
  isLoggedIn = false,
  onOpenAuthModal,
  onCreateRoom,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'chat' | 'games' | 'music' | 'competitions' | 'poetry'>('chat');
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [country, setCountry] = useState('🇸🇦 السعودية');
  const [maxSeats, setMaxSeats] = useState<number>(8);
  const [activeGame, setActiveGame] = useState<'none' | 'ludo' | 'trivia' | 'truth_dare'>('none');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Check if current user is sovereign Owner
  const isOwner = Boolean(
    currentUser.isOwner ||
    currentUser.role === 'owner' ||
    currentUser.role === 'admin' ||
    currentUser.isAppAdmin ||
    currentUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' ||
    currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
    currentUser.email?.toLowerCase() === 'moissanite.watch2025@gmail.com'
  );

  // If visitor/guest, show required login modal prompt
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-black text-white">تسجيل الدخول مطلوب</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              عفواً، لا يمكن للزائر تصميم غرف صوتية وبث البرامج. يرجى إنشاء حساب جديد أو تسجيل الدخول للمتابعة.
            </p>
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenAuthModal) onOpenAuthModal();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 cursor-pointer transition-all active:scale-95"
            >
              فتح حساب / تسجيل الدخول الآن
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Owner has unlimited room capacity, standard members are limited to maxRoomsAllowed
  const hasReachedLimit = isOwner ? false : userCreatedRoomsCount >= maxRoomsAllowed;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setError('عفواً، لا يمكن للزائر تصميم غرف. يرجى تسجيل الدخول أولاً.');
      return;
    }
    if (hasReachedLimit) {
      setError(`وصلت إلى الحد الأقصى لتصميم الغرف (${maxRoomsAllowed} غرف لكل مستخدم).`);
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('يرجى كتابة اسم أو عنوان للغرفة الصوتية.');
      return;
    }

    const finalCover = customCoverUrl.trim() || coverImage;
    const catObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

    const newRoom: VoiceRoom = {
      id: 'room_' + Date.now(),
      title: trimmedTitle,
      description: description.trim() || `غرفة صوتية خاصة بـ ${currentUser.name} للحديث والتواصل الراقي`,
      category,
      categoryNameAr: catObj.nameAr,
      tag: catObj.tag,
      coverImage: finalCover,
      host: currentUser,
      activeUsersCount: 1,
      maxSeats,
      isLive: true,
      activeGame: activeGame === 'none' ? null : activeGame,
      country,
      bannedUsers: [],
      mutedUserIds: [],
      moderatorUserIds: [],
    };

    sounds.playLevelUp();
    onCreateRoom(newRoom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-2">
                <span>تصميم غرفة دردشة جديدة</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                  {userCreatedRoomsCount} / {maxRoomsAllowed}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                متاح لكل مستخدم تصميم حتى {maxRoomsAllowed} غرف صوتية كحد أقصى
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Limit Warning Alert */}
        {hasReachedLimit ? (
          <div className="p-4 my-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>لقد وصلت للحد الأقصى لتصميم الغرف ({maxRoomsAllowed} غرف)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              وفقاً لنظام التطبيق، يحق لكل مستخدم تصميم ما يصل إلى {maxRoomsAllowed} غرف دردشة صوتية فقط. لحجز مساحة لغرفة جديدة، يرجى الدخول على إحدى غرفك المصممة وحذفها أولاً.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                حسناً، فهمت
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1 scrollbar-none">
            
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 1. Room Title */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                اسم / عنوان الغرفة الصوتية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: مجلس الأحبة وطرب الأصايل 🎙️"
                maxLength={45}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* 2. Room Category */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                تصنيف / نوع الغرفة
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                      category === cat.id
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-900/40 font-black'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.nameAr}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Cover Image Selection */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                غلاف الغرفة (اختر غلافاً فخماً أو ضع رابطاً)
              </label>
              
              <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCoverImage(preset.url);
                      setCustomCoverUrl('');
                    }}
                    className={`relative rounded-xl overflow-hidden aspect-video border transition-all cursor-pointer ${
                      coverImage === preset.url && !customCoverUrl
                        ? 'border-blue-400 ring-2 ring-blue-500 scale-102 shadow-md'
                        : 'border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 bg-slate-950/60 flex items-center justify-center text-[9px] font-bold text-white text-center p-1 leading-tight">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              <input
                type="url"
                value={customCoverUrl}
                onChange={(e) => setCustomCoverUrl(e.target.value)}
                placeholder="أو ضع رابط صورة مخصص (URL)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 focus:outline-none font-mono"
                dir="ltr"
              />
            </div>

            {/* 4. Seats & Country */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  سعة مقاعد المايك
                </label>
                <select
                  value={maxSeats}
                  onChange={(e) => setMaxSeats(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value={4}>4 مقاعد (جلسة ثنائية هادئة)</option>
                  <option value={6}>6 مقاعد</option>
                  <option value={8}>8 مقاعد (الافتراضي الرسمي)</option>
                  <option value={10}>10 مقاعد (مجلس كبير)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  الدولة / العلم
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Active Game (Optional) */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                تفعيل لعبة تفاعلية تلقائياً (اختياري)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveGame('none')}
                  className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    activeGame === 'none'
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-slate-950 border-slate-850 text-slate-400'
                  }`}
                >
                  صوتية فقط 🎙️
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGame('ludo')}
                  className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    activeGame === 'ludo'
                      ? 'bg-amber-600 border-amber-400 text-white font-black'
                      : 'bg-slate-950 border-slate-850 text-slate-400'
                  }`}
                >
                  لودو كينج 🎲
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGame('trivia')}
                  className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    activeGame === 'trivia'
                      ? 'bg-indigo-600 border-indigo-400 text-white font-black'
                      : 'bg-slate-950 border-slate-850 text-slate-400'
                  }`}
                >
                  مسابقات 💡
                </button>
              </div>
            </div>

            {/* 6. Description / Welcome message */}
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                وصف الغرفة أو شروطها الترحيبية
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="أهلاً بالجميع، نسعد بحضوركم ومشاركتكم في البث..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>

            {/* Quota indicator info box */}
            <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-200 flex items-center justify-between">
              <span>رصيد تصميم الغرف المتبقي لك:</span>
              <span className="font-bold font-mono text-amber-300">
                {maxRoomsAllowed - userCreatedRoomsCount} من أصل {maxRoomsAllowed} غرف
              </span>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>إنشاء الغرفة وبدء البث 🎙️</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
