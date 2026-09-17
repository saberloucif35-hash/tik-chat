import React, { useState } from 'react';
import { 
  Users, Radio, Gamepad2, Plus, Sparkles, Trash2, 
  Crown, ArrowRight, Shield, Layers
} from 'lucide-react';
import { VoiceRoom, User } from '../types';
import { sounds } from '../utils/audioEffects';

interface ExploreRoomsProps {
  rooms: VoiceRoom[];
  currentUser: User;
  isLoggedIn?: boolean;
  onJoinRoom: (room: VoiceRoom) => void;
  onOpenCreateRoomModal: () => void;
  onOpenAuthModal?: () => void;
  onDeleteRoom?: (roomId: string) => void;
}

export const ExploreRooms: React.FC<ExploreRoomsProps> = ({ 
  rooms,
  currentUser,
  isLoggedIn = false,
  onJoinRoom,
  onOpenCreateRoomModal,
  onOpenAuthModal,
  onDeleteRoom,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

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

  // User's own designed rooms (or all rooms if Owner)
  const myRooms = rooms.filter(
    (r) => r.host.id === currentUser.id || isOwner
  );

  const handleCreateRoomClick = () => {
    if (!isLoggedIn) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    onOpenCreateRoomModal();
  };

  const categories = [
    { id: 'all', name: 'جميع الغرف' },
    ...(myRooms.length > 0 ? [{ id: 'my_rooms', name: `غرفي المصممة (${myRooms.length}) 👑` }] : []),
    { id: 'chat', name: 'سوالف وفرفشة ☕' },
    { id: 'games', name: 'ألعاب ولودو 🎲' },
    { id: 'music', name: 'طرب وشعر 🎶' },
    { id: 'competitions', name: 'مسابقات وتحديات 💡' },
    { id: 'poetry', name: 'شعر وخواطر 🌙' },
  ];

  const filteredRooms = selectedCategory === 'all'
    ? rooms
    : selectedCategory === 'my_rooms'
    ? myRooms
    : rooms.filter((r) => r.category === selectedCategory);

  const handleDeleteClick = (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    if (deletingRoomId === roomId) {
      if (onDeleteRoom) {
        onDeleteRoom(roomId);
        sounds.playMessageSent();
      }
      setDeletingRoomId(null);
    } else {
      setDeletingRoomId(roomId);
      setTimeout(() => {
        setDeletingRoomId((prev) => (prev === roomId ? null : prev));
      }, 4000);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Guest Notice Banner if browsing without logging in */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-blue-600/10 border border-amber-500/30 rounded-3xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>تتصفح التطبيق كزائر</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">وضع القراءة فقط</span>
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5">
                لا يمكنك تصميم الغرف أو الصعود إلى المايك أو إرسال الهدايا إلا بعد إنشاء حساب أو تسجيل الدخول.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md active:scale-95 transition-all"
          >
            فتح حساب / تسجيل الدخول
          </button>
        </div>
      )}

      {/* 1. Header Bar with Room Design Quota & Create Room Button */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-3xl border border-slate-800 p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <h2 className="text-sm font-black text-white">ساحة الغرف الصوتية</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                {rooms.length} نشطة
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              يمكن لكل عضو تصميم حتى <span className="text-amber-400 font-bold">3 غرف دردشة صوتية</span> خاصة به وبث برامجه.
            </p>
          </div>

          {/* Button to Create / Design a Room */}
          <button
            type="button"
            onClick={handleCreateRoomClick}
            className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>تصميم غرفة جديدة ({myRooms.length}/3)</span>
          </button>

        </div>
      </div>

      {/* 2. Live Stories Carousel Header (if rooms exist) */}
      {rooms.length > 0 && (
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-3 shadow-md">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold text-white">الغرف المتصلة الآن</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {rooms.length} غرف
            </span>
          </div>

          <div className="flex items-center gap-3.5 overflow-x-auto pb-1 scrollbar-none px-0.5">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onJoinRoom(room)}
                className="flex flex-col items-center shrink-0 group focus:outline-none cursor-pointer"
              >
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-rose-500 via-amber-500 to-blue-500 group-hover:scale-105 transition-transform shadow-md">
                  <img
                    src={room.coverImage}
                    alt={room.title}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-950"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-rose-600 text-[8px] font-black text-white rounded-full shadow-sm">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-200 truncate max-w-[68px] mt-1.5 text-center">
                  {room.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Categories Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 font-black'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 4. Rooms Grid or Empty State */}
      {filteredRooms.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800/80 my-4 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white mb-1">
              {selectedCategory === 'my_rooms' ? 'لم تقم بتصميم أي غرفة بعد' : 'لا توجد غرف صوتية منشأة حالياً'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {selectedCategory === 'my_rooms'
                ? 'يمكنك تصميم ما يصل إلى 3 غرف دردشة صوتية خاصة بك والبدء في استضافة أصدقائك وإدارتها بالكامل!'
                : 'لا توجد غرف بعد. صمم غرفتك الصوتية الآن لتظهر مباشرة لجميع المستخدمين في المنصة!'}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleCreateRoomClick}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ تصميم غرفة صوتية جديدة ({myRooms.length}/3)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-3.5 pb-6">
          {filteredRooms.map((room) => {
            const isOriginalHost = room.host.id === currentUser.id;
            const isMyRoom = isOwner || isOriginalHost || (currentUser.role === 'admin' && room.host.isAppAdmin);

            return (
              <div
                key={room.id}
                id={`room-card-${room.id}`}
                onClick={() => onJoinRoom(room)}
                className="aspect-[1/1.12] relative rounded-3xl overflow-hidden border border-slate-800/90 hover:border-blue-500 shadow-xl group cursor-pointer transition-all active:scale-95 flex flex-col justify-between p-3 select-none bg-slate-900"
              >
                {/* Background Cover Image */}
                <img
                  src={room.coverImage}
                  alt={room.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Deep Contrast Scrim Gradient for Crisp Typography */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 via-45% to-slate-950/25 pointer-events-none" />

                {/* Top Bar inside Card: Live indicator & Active Listeners */}
                <div className="relative z-10 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600/95 text-white text-[10px] font-black shadow-md shadow-rose-950/50">
                      <Radio className="w-2.5 h-2.5 animate-pulse" />
                      <span>مباشر</span>
                    </span>

                    {isMyRoom && (
                      <span className={`px-1.5 py-0.5 rounded-full font-black text-[9px] shadow flex items-center gap-0.5 ${
                        isOwner && !isOriginalHost
                          ? 'bg-amber-400 text-slate-950 ring-1 ring-amber-200'
                          : 'bg-amber-500/90 text-slate-950'
                      }`}>
                        <Crown className="w-2.5 h-2.5" />
                        <span>{isOwner && !isOriginalHost ? 'تحكم المالك' : 'غرفتي'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono border border-white/10 shadow">
                      <Users className="w-2.5 h-2.5 text-blue-400" />
                      <span>{room.activeUsersCount}</span>
                    </span>

                    {/* Delete room button (Host or Sovereign Owner) */}
                    {isMyRoom && onDeleteRoom && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, room.id)}
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-black transition-all shadow flex items-center gap-1 ${
                          deletingRoomId === room.id
                            ? 'bg-rose-600 text-white animate-pulse border border-rose-400 ring-2 ring-rose-500/50'
                            : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-800/80'
                        }`}
                        title={
                          deletingRoomId === room.id 
                            ? 'اضغط للتأكيد الفوري للحذف' 
                            : (isOwner && !isOriginalHost ? 'حذف هذه الغرفة بصلاحيات المالك السيادية' : 'حذف غرفتي المصممة')
                        }
                      >
                        <Trash2 className="w-3 h-3" />
                        {deletingRoomId === room.id && <span>تأكيد؟</span>}
                      </button>
                    )}
                  </div>
                </div>

                {/* Middle Badge: Game or Country tag */}
                <div className="relative z-10 flex items-center gap-1 my-auto">
                  {room.activeGame ? (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 shadow-md">
                      <Gamepad2 className="w-3 h-3" />
                      <span>{room.activeGame === 'ludo' ? 'لودو 🎲' : 'مسابقة 💡'}</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-900/80 text-blue-300 border border-slate-700 backdrop-blur-sm">
                      {room.country || 'عامة 🎙️'}
                    </span>
                  )}
                </div>

                {/* Bottom: Clear, Large Room Title & Host Info */}
                <div className="relative z-10 space-y-1.5 pt-1.5 border-t border-white/10">
                  <h3 className="text-xs sm:text-[13px] font-black text-white line-clamp-2 leading-snug drop-shadow-md group-hover:text-blue-300 transition-colors">
                    {room.title}
                  </h3>
                  
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <img
                        src={room.host.avatar}
                        alt={room.host.name}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-blue-400 shrink-0 shadow"
                      />
                      <span className="text-[10px] font-bold text-slate-300 truncate">
                        {room.host.name}
                      </span>
                    </div>
                    
                    <span className="px-2 py-0.5 rounded-lg bg-blue-600 group-hover:bg-blue-500 text-white text-[9px] font-black shadow transition-colors shrink-0">
                      دخول ↵
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
