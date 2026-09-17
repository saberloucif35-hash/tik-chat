import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Check, X, MessageSquare, Phone, 
  Copy, ShieldCheck, Sparkles, CheckCheck, UserCheck, Flame, 
  Clock, Zap, AlertCircle, Trash2, UserMinus
} from 'lucide-react';
import { User, FriendRequest, PrivateMessage } from '../../types';
import { sounds } from '../../utils/audioEffects';

interface FriendsViewProps {
  currentUser: User;
  allUsers?: User[];
  friends?: User[];
  friendRequests?: FriendRequest[];
  messages?: PrivateMessage[];
  onAcceptFriendRequest: (request: FriendRequest) => void;
  onDeclineFriendRequest: (requestId: string) => void;
  onSendFriendRequest: (targetUser: User) => void;
  onOpenPrivateChat: (friend: User) => void;
  onRemoveFriend?: (friendId: string) => void;
  onOpenAdminRecharge?: (targetAccountId?: string) => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentUser,
  allUsers = [],
  friends = [],
  friendRequests = [],
  messages = [],
  onAcceptFriendRequest,
  onDeclineFriendRequest,
  onSendFriendRequest,
  onOpenPrivateChat,
  onRemoveFriend,
  onOpenAdminRecharge,
}) => {
  const [searchIdInput, setSearchIdInput] = useState('');
  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [copiedMyId, setCopiedMyId] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friendsFilter, setFriendsFilter] = useState('');
  const [confirmDeleteFriendId, setConfirmDeleteFriendId] = useState<string | null>(null);

  const isAdmin = currentUser.role === 'admin' || currentUser.isAppAdmin;

  // Handle Search by ID
  const handleSearchById = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchIdInput.trim();
    if (!query) return;

    // Search in allUsers by accountId or id or name
    const found = (allUsers || []).find(
      (u) =>
        u.accountId?.toLowerCase() === query.toLowerCase() ||
        u.id.toLowerCase() === query.toLowerCase() ||
        u.name.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setSearchedUser(found);
      setSearchFeedback(null);
    } else {
      setSearchedUser(null);
      setSearchFeedback(`لم يتم العثور على أي مستخدم بالمعرف (ID: ${query})`);
    }
  };

  const handleCopyMyId = () => {
    const idToCopy = currentUser.accountId || currentUser.id;
    navigator.clipboard?.writeText(idToCopy);
    setCopiedMyId(true);
    setTimeout(() => setCopiedMyId(false), 2000);
  };

  // Helper to get last message with a friend
  const getLastMessage = (friendId: string): PrivateMessage | undefined => {
    const thread = (messages || []).filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === friendId) ||
        (m.senderId === friendId && m.receiverId === currentUser.id)
    );
    return thread[thread.length - 1];
  };

  const filteredFriends = (friends || []).filter(
    (f) =>
      f.name.toLowerCase().includes(friendsFilter.toLowerCase()) ||
      f.accountId?.toLowerCase().includes(friendsFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-5" dir="rtl">
      
      {/* HEADER: Title & Quick ID Card */}
      <div className="mb-4">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">الأصدقاء والمحادثات الخاصة</h2>
              <p className="text-[11px] text-slate-400">
                إضافة الأصدقاء بالمعرف (ID) والتواصل الصوتي والنصي المباشر
              </p>
            </div>
          </div>

          {/* Admin Fast Recharge Access if Admin */}
          {isAdmin && onOpenAdminRecharge && (
            <button
              onClick={() => onOpenAdminRecharge()}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all shrink-0"
              title="لوحة شحن الحسابات بالـ ID حصرياً للمدير العام"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>شحن الحسابات بالـ ID 👑</span>
            </button>
          )}
        </div>

        {/* MY ACCOUNT ID SHARE CARD */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/60"
            />
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">معرف حسابك الفريد لمشاركته مع الآخرين:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-black font-mono text-amber-300">
                  ID: {currentUser.accountId || currentUser.id}
                </span>
                {currentUser.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {currentUser.badge}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleCopyMyId}
            className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
          >
            {copiedMyId ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الـ ID</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SEARCH AND ADD FRIEND BY ID INPUT */}
      <div className="mb-4">
        <form onSubmit={handleSearchById} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchIdInput}
              onChange={(e) => setSearchIdInput(e.target.value)}
              placeholder="ابحث بمعرف الحساب (ID) لإضافة صديق... (مثال: 94102 أو 66205)"
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-2.5 px-4 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-blue-600/30 active:scale-95 transition-all shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>بحث بالـ ID</span>
          </button>
        </form>

        {/* SEARCH RESULT PREVIEW CARD */}
        {searchedUser && (
          <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/40 animate-fade-in flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <img
                src={searchedUser.avatar}
                alt={searchedUser.name}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-400 shadow"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-white">{searchedUser.name}</h4>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                    Lv.{searchedUser.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="font-mono text-amber-300 font-bold">
                    ID: {searchedUser.accountId || searchedUser.id}
                  </span>
                  {searchedUser.badge && <span>• {searchedUser.badge}</span>}
                </div>
              </div>
            </div>

            <div>
              {searchedUser.id === currentUser.id ? (
                <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[11px] text-slate-400">
                  حسابك الحالي
                </span>
              ) : friends.some((f) => f.id === searchedUser.id) ? (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    صديقك
                  </span>
                  <button
                    onClick={() => onOpenPrivateChat(searchedUser)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>محادثة</span>
                  </button>
                </div>
              ) : friendRequests.some((r) => r.toUserId === searchedUser.id || r.fromUser.id === searchedUser.id) ? (
                <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  الطلب قيد الانتظار
                </span>
              ) : (
                <button
                  onClick={() => {
                    onSendFriendRequest(searchedUser);
                    sounds.playMessageSent();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>إرسال طلب صداقة</span>
                </button>
              )}
            </div>
          </div>
        )}

        {searchFeedback && (
          <div className="mt-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{searchFeedback}</span>
          </div>
        )}
      </div>

      {/* TABS: Friends List vs. Friend Requests */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'friends'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>قائمة الأصدقاء ({friends.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 relative ${
            activeTab === 'requests'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>طلبات الصداقة</span>
          {friendRequests.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {friendRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: INCOMING FRIEND REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-2.5">
          {friendRequests.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800/80">
              <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">لا توجد طلبات صداقة معلقة</h4>
              <p className="text-[11px] text-slate-400">
                عندما يرسل لك أي مستخدم طلب صداقة عبر الـ ID، سيظهر هنا لقبوله أو رفضه فوراً.
              </p>
            </div>
          ) : (
            friendRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={req.fromUser.avatar}
                    alt={req.fromUser.name}
                    className="w-11 h-11 rounded-full object-cover ring-1 ring-blue-500"
                  />
                  <div>
                    <h4 className="text-xs font-black text-white">{req.fromUser.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-mono text-amber-300 font-bold">
                        ID: {req.fromUser.accountId || req.fromUser.id}
                      </span>
                      <span>• {req.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAcceptFriendRequest(req);
                      sounds.playFriendAdded();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow active:scale-95 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>قبول</span>
                  </button>

                  <button
                    onClick={() => onDeclineFriendRequest(req.id)}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                    title="رفض الطلب"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: FRIENDS LIST & ACTIVE CONVERSATIONS */}
      {activeTab === 'friends' && (
        <div className="flex-1 space-y-2">
          
          {/* Quick Filter */}
          {friends.length > 3 && (
            <div className="mb-2">
              <input
                type="text"
                value={friendsFilter}
                onChange={(e) => setFriendsFilter(e.target.value)}
                placeholder="تصفية الأصدقاء بالاسم أو الـ ID..."
                className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {filteredFriends.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800/80">
              <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">قائمة الأصدقاء فارغة</h4>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                ابحث عن أصدقائك عبر معرف الحساب (ID) في الأعلى أو أضفهم مباشرة من داخل الغرف الصوتية!
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const lastMsg = getLastMessage(friend.id);

              return (
                <div
                  key={friend.id}
                  onClick={() => onOpenPrivateChat(friend)}
                  className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 hover:border-blue-500/40 flex items-center justify-between gap-3 shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-slate-700 group-hover:ring-blue-500 transition-all"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-black text-white truncate max-w-[140px]">
                          {friend.name}
                        </h4>
                        {friend.badge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                            {friend.badge}
                          </span>
                        )}
                      </div>

                      {/* ID and Last message preview */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 truncate">
                        <span className="font-mono text-sky-400 font-bold text-[10px] shrink-0">
                          ID: {friend.accountId || friend.id}
                        </span>
                        <span>•</span>
                        {lastMsg ? (
                          <span className="truncate text-slate-300 text-[11px]">
                            {lastMsg.type === 'voice'
                              ? '🎙️ رسالة صوتية'
                              : lastMsg.text}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">انقر لبدء المحادثة</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Admin Recharge Shortcut if Admin */}
                    {isAdmin && onOpenAdminRecharge && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenAdminRecharge(friend.accountId);
                        }}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors"
                        title={`شحن رصيد ${friend.name} (Admin Only)`}
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPrivateChat(friend);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow active:scale-95 transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>دردشة</span>
                    </button>

                    {onRemoveFriend && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirmDeleteFriendId === friend.id) {
                            onRemoveFriend(friend.id);
                            setConfirmDeleteFriendId(null);
                          } else {
                            setConfirmDeleteFriendId(friend.id);
                            setTimeout(() => {
                              setConfirmDeleteFriendId((prev) => (prev === friend.id ? null : prev));
                            }, 4000);
                          }
                        }}
                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                          confirmDeleteFriendId === friend.id
                            ? 'bg-rose-600 text-white animate-pulse border border-rose-400 ring-2 ring-rose-500/50'
                            : 'bg-slate-800 hover:bg-rose-950/70 border border-slate-700/60 hover:border-rose-700/60 text-slate-400 hover:text-rose-300'
                        }`}
                        title={confirmDeleteFriendId === friend.id ? 'اضغط لتأكيد حذف الصديق' : 'حذف الصديق نهائياً'}
                      >
                        <UserMinus className="w-4 h-4" />
                        {confirmDeleteFriendId === friend.id && <span className="text-[10px]">تأكيد الحذف؟</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
