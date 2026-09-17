import React, { useState } from 'react';
import { 
  X, Settings, Image as ImageIcon, Edit3, Shield, 
  Check, UserCheck, Trash2, Sparkles, RefreshCw, AlertCircle,
  Lock, Unlock
} from 'lucide-react';
import { VoiceRoom } from '../../types';

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: VoiceRoom;
  onUpdateRoomInfo: (title: string, coverImage: string) => void;
  onUnbanUser?: (userId: string) => void;
  onDeleteRoom?: (roomId: string) => void;
  isHost?: boolean;
  onToggleRoomMicsLock?: (isLocked: boolean) => void;
}

const coverPresets = [
  {
    name: 'مجلس خليجي فخم',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'طرب وشعر وأمسيات',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'ساحة لودو وألعاب',
    url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'كافيه سوالف وضحك',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80',
  },
  {
    name: 'استوديو بث فضائي',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&auto=format&fit=crop&q=80',
  },
];

export const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  isOpen,
  onClose,
  room,
  onUpdateRoomInfo,
  onUnbanUser,
  onDeleteRoom,
  isHost,
  onToggleRoomMicsLock,
}) => {
  const [title, setTitle] = useState(room.title);
  const [coverImage, setCoverImage] = useState(room.coverImage);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (!isOpen) return null;

  const handleDeleteRoomClick = () => {
    if (isConfirmingDelete) {
      if (onDeleteRoom) {
        onDeleteRoom(room.id);
        onClose();
      }
    } else {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 5000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUpdateRoomInfo(title.trim(), coverImage);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-white">إعدادات الغرفة</h3>
              <p className="text-[10px] text-slate-400">
                تعديل اسم الغرفة، صورتها، وإدارة المحظورين
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Save Success Alert */}
        {saveSuccess && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>تم حفظ التعديلات بنجاح وتحديث الغرفة!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          
          {/* 1. ROOM TITLE */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              اسم / عنوان الغرفة
            </label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الغرفة الصوتية..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Edit3 className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          {/* 2. ROOM COVER IMAGE */}
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              صورة / غلاف الغرفة
            </label>
            
            {/* Current Cover Preview */}
            <div className="relative h-28 w-full rounded-2xl overflow-hidden border border-slate-800 mb-2.5">
              <img
                src={coverImage}
                alt="Room Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />
              <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-slate-950/80 px-2 py-0.5 rounded-md text-amber-300 border border-white/10">
                معاينة الغلاف الحالي
              </span>
            </div>

            {/* Presets Picker */}
            <span className="text-[10px] text-slate-400 block mb-1.5 font-bold">
              اختر غلافاً فخماً من التشكيلة الجاهزة:
            </span>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {coverPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCoverImage(preset.url)}
                  className={`relative rounded-xl overflow-hidden aspect-video border transition-all ${
                    coverImage === preset.url
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow'
                      : 'border-slate-800 hover:border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute inset-0 bg-slate-950/50 flex items-center justify-center text-[9px] font-black text-white text-center p-1 leading-tight">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom URL Input */}
            <div className="relative">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="أو ضع رابط صورة مخصص (URL)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
              <ImageIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          {/* 3. MICS LOCK CONTROL (FOR HOST / OWNER) */}
          {isHost && onToggleRoomMicsLock && (
            <div className="pt-2 border-t border-slate-800/80">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow ${
                      room.areMicsLocked
                        ? 'bg-rose-950/80 border-rose-600/50 text-rose-400'
                        : 'bg-emerald-950/80 border-emerald-600/50 text-emerald-400'
                    }`}
                  >
                    {room.areMicsLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      حالة مايكات الغرفة
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {room.areMicsLocked
                        ? 'المايكات مقفلة حالياً (المستمعون مكتومون)'
                        : 'المايكات مفتوحة ومتاحة لجميع الحاضرين'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleRoomMicsLock(!room.areMicsLocked)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95 border ${
                    room.areMicsLocked
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/50'
                      : 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400/50'
                  }`}
                >
                  {room.areMicsLocked ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>فتح المايكات</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>قفل المايكات</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 4. BANNED USERS LIST */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>المستخدمين المطرودين / المحظورين في هذه الغرفة:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {room.bannedUsers?.length || 0} محظور
              </span>
            </div>

            {room.bannedUsers && room.bannedUsers.length > 0 ? (
              <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-none">
                {room.bannedUsers.map((banned) => (
                  <div
                    key={banned.userId}
                    className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {banned.userAvatar ? (
                        <img
                          src={banned.userAvatar}
                          alt={banned.userName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-rose-950 text-rose-300 flex items-center justify-center text-[10px] font-bold">
                          {banned.userName[0]}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">
                          {banned.userName}
                        </span>
                        <span className="text-[9px] text-rose-400 block">
                          {banned.isPermanent ? 'حظر دائم' : `مؤقت (${banned.durationMinutes || 15} دقيقة)`}
                        </span>
                      </div>
                    </div>

                    {onUnbanUser && (
                      <button
                        type="button"
                        onClick={() => onUnbanUser(banned.userId)}
                        className="px-2 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900/60 border border-emerald-700 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>إلغاء الحظر</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 py-1.5 text-center">
                لا يوجد أي مستخدمين محظورين في هذه الغرفة حالياً
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800">
            {onDeleteRoom && isHost ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleDeleteRoomClick}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isConfirmingDelete
                      ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse border border-rose-400 ring-2 ring-rose-500/40'
                      : 'bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isConfirmingDelete ? 'تأكيد الحذف نهائياً؟' : 'حذف الغرفة نهائياً'}</span>
                </button>
                {isConfirmingDelete && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-2 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    تراجع
                  </button>
                )}
              </div>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ تعديلات الغرفة</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
