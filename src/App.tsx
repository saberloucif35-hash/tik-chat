import React, { useState, useEffect } from 'react';
import { User as UserIcon, LogIn, Lock, Radio, Plus } from 'lucide-react';
import { MobileShell } from './components/MobileShell';
import { MobileVoiceRoom } from './components/VoiceRoom/MobileVoiceRoom';
import { MobileProfile } from './components/MobileProfile';
import { VipSubscriptionSection } from './components/VipSubscriptionSection';
import { LudoGameModal } from './components/VoiceRoom/LudoGameModal';
import { TriviaQuizModal } from './components/VoiceRoom/TriviaQuizModal';
import { GiftStoreModal } from './components/VoiceRoom/GiftStoreModal';
import { GiftAnimationOverlay } from './components/VoiceRoom/GiftAnimationOverlay';
import { ExploreRooms } from './components/ExploreRooms';
import { CreateRoomModal } from './components/VoiceRoom/CreateRoomModal';
import { AuthModal } from './components/AuthModal';
import { AdminControlModal } from './components/AdminControlModal';
import { UserRechargeModal } from './components/UserRechargeModal';
import { DailyRewardModal } from './components/DailyRewardModal';
import { dailyRewardService } from './utils/dailyRewardService';
import { FriendsView } from './components/FriendsAndChat/FriendsView';
import { PrivateChatModal } from './components/FriendsAndChat/PrivateChatModal';
import { 
  currentUser as defaultUser, 
  sampleSeats, 
  initialRooms, 
  initialMessages, 
  virtualGifts, 
  initialModerators,
  initialAllUsers,
  initialFriends,
  initialFriendRequests,
  initialPrivateMessages,
  initialRechargeHistory,
  adminUser
} from './data/mockData';
import { 
  User, VoiceSeat, VoiceRoom, ChatMessage, VirtualGift, 
  FunctionCallLog, ModerationResult, ModeratorAccount,
  FriendRequest, PrivateMessage, RechargeRecord
} from './types';
import { sounds } from './utils/audioEffects';
import { authService } from './utils/authService';
import { socketService } from './utils/socketService';
import { formatCoins, formatDiamonds } from './utils/numberFormat';
import { realtimeVoiceService } from './utils/realtimeVoiceService';
import { 
  awardGiftSupportXp, 
  awardMicTimeXp, 
  getXpRequiredForAccountLevel, 
  getXpRequiredForSupporterLevel, 
  MAX_LEVEL 
} from './utils/levelService';

export default function App() {
  const [activeTab, setActiveTab] = useState<'room' | 'explore' | 'friends' | 'vip' | 'profile'>('explore');
  const [rooms, setRooms] = useState<VoiceRoom[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('yalla_real_rooms_v4');
      if (stored) {
        const parsed: VoiceRoom[] = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });
  const [currentRoom, setCurrentRoom] = useState<VoiceRoom | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('yalla_real_rooms_v4');
        if (stored) {
          const parsed: VoiceRoom[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
      } catch {}
    }
    return null;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const active = authService.getActiveSession();
    return active || defaultUser;
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const active = authService.getActiveSession();
    return Boolean(active && active.id !== 'guest_user');
  });
  const [seats, setSeats] = useState<VoiceSeat[]>(sampleSeats);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  
  // Modals & Overlays
  const [isLudoOpen, setIsLudoOpen] = useState<boolean>(false);
  const [isTriviaOpen, setIsTriviaOpen] = useState<boolean>(false);
  const [isGiftStoreOpen, setIsGiftStoreOpen] = useState<boolean>(false);
  const [isUserRechargeOpen, setIsUserRechargeOpen] = useState<boolean>(false);
  const [isDailyRewardOpen, setIsDailyRewardOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState<boolean>(false);
  const [banNotice, setBanNotice] = useState<string | null>(null);
  const [moderators, setModerators] = useState<ModeratorAccount[]>(initialModerators);

  // Social: Friends, Requests, Private Chat, Admin Recharge
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const registered = authService.getRegisteredAccounts().map(acc => authService.mapAccountToUser(acc));
    const combinedMap = new Map<string, User>();
    initialAllUsers.forEach(u => combinedMap.set(u.id, u));
    registered.forEach(u => combinedMap.set(u.id, u));
    return Array.from(combinedMap.values());
  });
  const [friends, setFriends] = useState<User[]>(initialFriends);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>(initialPrivateMessages);
  const [activePrivateChatFriend, setActivePrivateChatFriend] = useState<User | null>(null);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>(initialRechargeHistory);
  const [targetRechargeAccountId, setTargetRechargeAccountId] = useState<string | undefined>(undefined);
  const [adminPanelTab, setAdminPanelTab] = useState<'recharge_id' | 'funds' | 'moderators' | 'levels' | 'profile'>('recharge_id');
  
  // VIP Entrance Animation State
  const [activeVipEntrance, setActiveVipEntrance] = useState<{
    user: User;
    level: number;
    message: string;
  } | null>(null);

  // Virtual Gift Animation State
  const [activeGiftEffect, setActiveGiftEffect] = useState<{
    gift: VirtualGift;
    sender: User;
    receiver: User;
  } | null>(null);

  // Bot Speech & Audio Synthesis (Disabled)
  const [botSpeechBubble, setBotSpeechBubble] = useState<string | null>(null);
  const [isAudioVoiceActive, setIsAudioVoiceActive] = useState<boolean>(false);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);

  // Seat state
  const [userSeatIndex, setUserSeatIndex] = useState<number | null>(null);
  const [isUserMuted, setIsUserMuted] = useState<boolean>(false);

  // Function Call Activity Logs
  const [functionLogs, setFunctionLogs] = useState<FunctionCallLog[]>([]);

  // Health check for API key
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setHasApiKey(Boolean(data.hasApiKey)))
      .catch(() => setHasApiKey(false));

    // Connect to Realtime WebSocket server
    socketService.connect(currentUser);

    // 1. Fetch initial rooms list from server API (ensuring rooms appear on all devices)
    fetch('/api/rooms')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.rooms)) {
          setRooms(data.rooms);
          try {
            localStorage.setItem('yalla_real_rooms_v4', JSON.stringify(data.rooms));
          } catch {}
        }
      })
      .catch(() => {});

    // 2. Fetch private messages for current user
    if (currentUser?.id) {
      fetch(`/api/private-messages?userId=${encodeURIComponent(currentUser.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && Array.isArray(data.messages) && data.messages.length > 0) {
            setPrivateMessages((prev) => {
              const map = new Map<string, PrivateMessage>();
              prev.forEach((m) => map.set(m.id, m));
              data.messages.forEach((m: PrivateMessage) => map.set(m.id, m));
              return Array.from(map.values());
            });
          }
        })
        .catch(() => {});
    }

    // 3. Listen for live room updates across networks
    const unsubRooms = socketService.onRoomsUpdate((updatedRooms) => {
      if (Array.isArray(updatedRooms)) {
        setRooms(updatedRooms);
        try {
          localStorage.setItem('yalla_real_rooms_v4', JSON.stringify(updatedRooms));
        } catch {}
      }
    });

    // 4. Listen for room state synchronization (seats, messages, info)
    const unsubSync = socketService.onRoomSync((syncData) => {
      if (currentRoom && syncData.roomId === currentRoom.id) {
        if (syncData.seats && Array.isArray(syncData.seats)) {
          setSeats(syncData.seats);
          const myIndex = syncData.seats.findIndex((s) => s.user?.id === currentUser.id);
          setUserSeatIndex(myIndex !== -1 ? myIndex : null);
        }
        if (syncData.messages && Array.isArray(syncData.messages)) {
          setMessages(syncData.messages);
        }
        if (syncData.room) {
          setCurrentRoom(syncData.room);
        }
      }
    });

    // 5. Listen for incoming room chat messages
    const unsubMsg = socketService.onRoomMessage((data) => {
      if (currentRoom && data.roomId === currentRoom.id && data.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === data.message.id)) return prev;
          return [...prev, data.message];
        });
      }
    });

    // 6. Listen for seat updates (who took a seat or left or muted)
    const unsubSeats = socketService.onSeatsUpdate((data) => {
      if (currentRoom && data.roomId === currentRoom.id && data.seats) {
        setSeats(data.seats);
        const myIndex = data.seats.findIndex((s) => s.user?.id === currentUser.id);
        setUserSeatIndex(myIndex !== -1 ? myIndex : null);
      }
    });

    // 7. Listen for live gifts sent across different networks
    const unsubGift = socketService.onGift((data) => {
      if (currentRoom && data.roomId === currentRoom.id && data.giftPayload) {
        setActiveGiftEffect(data.giftPayload);
        const { gift, receiver, sender } = data.giftPayload;
        if (gift && receiver && sender && sender.id !== currentUser.id) {
          const giftPrice = Number(gift.price) || 0;
          const receiverShare = Math.floor(giftPrice * 0.5);
          const adminShare = Math.max(0, giftPrice - receiverShare);

          const isReceiver = currentUser.id === receiver.id || currentUser.accountId === receiver.accountId;
          const isOwner = currentUser.role === 'owner' || currentUser.isOwner || currentUser.email === 'vip666bitcoin@gmail.com' || currentUser.id === 'owner_vip_account';

          let addCoins = 0;
          if (isReceiver) addCoins += receiverShare;
          if (isOwner) addCoins += adminShare;

          if (addCoins > 0) {
            setCurrentUser((prev) => {
              const updatedCoins = (prev.coins || 0) + addCoins;
              authService.updateAccountBalance(prev.accountId || prev.id, updatedCoins, prev.diamonds || 0);
              const next = { ...prev, coins: updatedCoins };
              authService.saveSession(next);
              return next;
            });
          }
        }
      }
    });

    // 8. Listen for private messages in real-time
    const unsubPrivate = socketService.onPrivateMessage((msg) => {
      setPrivateMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      sounds.playNotice();
    });

    // 9. Real-time microphone audio speaking indicator animation
    const unsubSpeaking = realtimeVoiceService.onSpeakingChange((seatIndex, audioLevel, isSpeaking) => {
      setSeats((prev) => {
        if (!prev[seatIndex]) return prev;
        if (prev[seatIndex].audioLevel === (isSpeaking ? audioLevel : 0)) return prev;
        const copy = [...prev];
        copy[seatIndex] = {
          ...copy[seatIndex],
          audioLevel: isSpeaking ? Math.max(35, audioLevel) : 0,
        };
        return copy;
      });
    });

    // 10. Real-time authoritative profile updates across all clients
    const unsubProfile = socketService.onProfileUpdate((profile: any) => {
      if (!profile) return;
      const isMe = profile.id === currentUser.id || (currentUser.accountId && profile.accountId === currentUser.accountId);
      if (isMe) {
        setCurrentUser((prev) => ({
          ...prev,
          name: profile.name || prev.name,
          avatar: profile.avatar || prev.avatar,
          coins: typeof profile.coins === 'number' ? profile.coins : prev.coins,
          diamonds: typeof profile.diamonds === 'number' ? profile.diamonds : prev.diamonds,
        }));
      }
      setAllUsers((prev) =>
        prev.map((u) =>
          u.id === profile.id || (profile.accountId && u.accountId === profile.accountId)
            ? { ...u, name: profile.name || u.name, avatar: profile.avatar || u.avatar }
            : u
        )
      );
      setSeats((prev) =>
        prev.map((s) =>
          s.user && (s.user.id === profile.id || (profile.accountId && s.user.accountId === profile.accountId))
            ? {
                ...s,
                user: {
                  ...s.user,
                  name: profile.name || s.user.name,
                  avatar: profile.avatar || s.user.avatar,
                },
              }
            : s
        )
      );
      setRooms((prev) =>
        prev.map((r) =>
          r.host && (r.host.id === profile.id || (profile.accountId && r.host.accountId === profile.accountId))
            ? {
                ...r,
                host: {
                  ...r.host,
                  name: profile.name || r.host.name,
                  avatar: profile.avatar || r.host.avatar,
                },
              }
            : r
        )
      );
    });

    // 11. Listen for room mics locked state
    const unsubMicsLock = socketService.onMicsLockState((data) => {
      if (currentRoom && data.roomId === currentRoom.id) {
        setCurrentRoom((prev) =>
          prev
            ? { ...prev, areMicsLocked: data.micsLocked, micsLockedByName: data.lockedByName }
            : null
        );
        if (data.seats && Array.isArray(data.seats)) {
          setSeats(data.seats);
          const myIndex = data.seats.findIndex((s) => s.user?.id === currentUser.id);
          setUserSeatIndex(myIndex !== -1 ? myIndex : null);
          const isOwner = authService.isOwner(currentUser);
          if (myIndex !== -1 && data.micsLocked && !isOwner) {
            setIsUserMuted(true);
            realtimeVoiceService.stopBroadcasting();
          }
        }
        if (data.micsLocked) {
          sounds.playNotice();
        } else {
          sounds.playLevelUp();
        }
      }
    });

    return () => {
      unsubRooms();
      unsubSync();
      unsubMsg();
      unsubSeats();
      unsubGift();
      unsubPrivate();
      unsubSpeaking();
      unsubProfile();
      unsubMicsLock();
    };
  }, [currentUser.id, currentRoom?.id]);

  // Load persistent profile from server upon mount
  useEffect(() => {
    const key = currentUser.id || currentUser.accountId || currentUser.email;
    if (!key) return;

    fetch(`/api/users/profile/${encodeURIComponent(key)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.profile) {
          const p = data.profile;
          if (p.name || p.avatar) {
            setCurrentUser((prev) => {
              const updated = {
                ...prev,
                name: p.name || prev.name,
                avatar: p.avatar || prev.avatar,
                coins: typeof p.coins === 'number' ? p.coins : prev.coins,
                diamonds: typeof p.diamonds === 'number' ? p.diamonds : prev.diamonds,
              };
              authService.saveSession(updated);
              return updated;
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Real-time Mic Time & Voice Room Activity XP Tracking (Levels up to 100)
  useEffect(() => {
    if (!isLoggedIn || userSeatIndex === null || !currentRoom) return;

    const micInterval = setInterval(() => {
      // 10 seconds baseline; 15 seconds credit if unmuted and actively broadcasting voice
      const secondsCredit = isUserMuted ? 10 : 15;
      setCurrentUser((prevUser) => {
        const res = awardMicTimeXp(prevUser, secondsCredit);
        if (res.leveledUp) {
          sounds.playLevelUp();
          const lvlMsg: ChatMessage = {
            id: 'miclvl_' + Date.now(),
            user: res.updatedUser,
            text: `🎙️ ترقية استحقاق! ارتقى ${res.updatedUser.name} إلى المستوى العام Lv.${res.newLevel} / ${MAX_LEVEL} 🌟 بفضل تفاعله المستمر في المايك!`,
            timestamp: 'الآن',
            isSystem: true,
          };
          setMessages((prev) => [...prev, lvlMsg]);
          if (currentRoom) {
            socketService.sendRoomMessage(currentRoom.id, lvlMsg);
          }
        }
        authService.updateAccountLevel(
          res.updatedUser.accountId || res.updatedUser.id,
          res.updatedUser.level,
          res.updatedUser.supporterLevel,
          res.updatedUser.xp,
          res.updatedUser.supporterXp,
          res.updatedUser.micTimeSeconds,
          res.updatedUser.totalCoinsSent
        );
        authService.saveSession(res.updatedUser);
        return res.updatedUser;
      });
    }, 10000);

    return () => clearInterval(micInterval);
  }, [isLoggedIn, userSeatIndex, currentRoom, isUserMuted]);

  // Coin Recharge Flow - Accessible to sovereign Owner and Admins
  const handleAddCoins = () => {
    const isOwner = Boolean(
      currentUser.isOwner ||
      currentUser.role === 'owner' ||
      currentUser.role === 'admin' ||
      currentUser.isAppAdmin ||
      currentUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' ||
      currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com'
    );
    if (isOwner || currentUser.role === 'admin' || currentUser.isAppAdmin) {
      setTargetRechargeAccountId(undefined);
      setIsAdminPanelOpen(true);
      sounds.playLevelUp();
    } else {
      setIsUserRechargeOpen(true);
    }
  };

  // Social & Recharge Handlers
  const handleAcceptFriendRequest = (request: FriendRequest) => {
    sounds.playFriendAccepted();
    setFriends((prev) => {
      if (prev.some((f) => f.id === request.fromUser.id)) return prev;
      return [request.fromUser, ...prev];
    });
    setFriendRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'accepted' as const } : r))
    );
    const welcomeMsg: PrivateMessage = {
      id: 'pm_' + Date.now(),
      senderId: request.fromUser.id,
      receiverId: currentUser.id,
      type: 'text',
      text: `أهلاً وسهلاً بك يا ${currentUser.name}! تم قبول طلب الصداقة، سعيد بالتواصل معك 🌟`,
      timestamp: 'الآن',
      isRead: false,
    };
    setPrivateMessages((prev) => [...prev, welcomeMsg]);
  };

  const handleDeclineFriendRequest = (requestId: string) => {
    // Permanent deletion: deleted items are removed permanently
    setFriendRequests((prev) => prev.filter((r) => r.id !== requestId));
    sounds.playNotice();
  };

  const handleSendFriendRequest = (targetUser: User) => {
    if (!isLoggedIn) {
      setBanNotice('⚠️ يرجى تسجيل الدخول أو فتح حساب لإرسال طلبات الصداقة.');
      setTimeout(() => setBanNotice(null), 4000);
      setIsAuthOpen(true);
      return;
    }
    if (friends.some((f) => f.id === targetUser.id)) return;
    if (friendRequests.some((r) => r.toUserId === targetUser.id && r.fromUser.id === currentUser.id)) return;
    sounds.playMessageSent();
    const newReq: FriendRequest = {
      id: 'req_' + Date.now(),
      fromUser: currentUser,
      toUserId: targetUser.id,
      timestamp: 'الآن',
      status: 'pending',
    };
    setFriendRequests((prev) => [newReq, ...prev]);
  };

  // Real Private Message Sending (Real-time cross-network)
  const handleSendPrivateMessage = (receiverId: string, text: string) => {
    if (!isLoggedIn) {
      setBanNotice('⚠️ يرجى تسجيل الدخول أو فتح حساب للتواصل بالرسائل الخاصة.');
      setTimeout(() => setBanNotice(null), 4000);
      setIsAuthOpen(true);
      return;
    }
    sounds.playMessageSent();
    const newMsg: PrivateMessage = {
      id: 'pm_' + Date.now(),
      senderId: currentUser.id,
      receiverId,
      type: 'text',
      text,
      timestamp: 'الآن',
      isRead: true,
    };
    setPrivateMessages((prev) => [...prev, newMsg]);

    // Send to backend and WebSocket for cross-network instant delivery
    fetch('/api/private-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newMsg }),
    }).catch(() => {});
    socketService.sendPrivateMessage(newMsg);
  };

  // Real Voice Message Sending (Real-time cross-network)
  const handleSendPrivateVoiceMessage = (
    receiverId: string,
    durationSeconds: number,
    transcription: string
  ) => {
    sounds.playVoiceSent();
    const newVoiceMsg: PrivateMessage = {
      id: 'pm_v_' + Date.now(),
      senderId: currentUser.id,
      receiverId,
      type: 'voice',
      timestamp: 'الآن',
      audioDurationSeconds: durationSeconds,
      audioWaveform: [30, 60, 85, 45, 90, 70, 40, 65, 80, 50, 75, 95, 40, 20],
      audioTranscription: transcription,
      isRead: true,
    };
    setPrivateMessages((prev) => [...prev, newVoiceMsg]);

    // Send to backend and WebSocket for cross-network instant delivery
    fetch('/api/private-messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: newVoiceMsg }),
    }).catch(() => {});
    socketService.sendPrivateMessage(newVoiceMsg);
  };

  // Permanent Deletion Handlers (Any deleted item is gone permanently and cannot return)
  const handleDeleteRoomMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    sounds.playNotice();
  };

  const handleDeletePrivateMessage = (messageId: string) => {
    setPrivateMessages((prev) => prev.filter((m) => m.id !== messageId));
    sounds.playNotice();
  };

  const handleClearPrivateChat = (friendId: string) => {
    setPrivateMessages((prev) =>
      prev.filter(
        (m) =>
          !(
            (m.senderId === currentUser.id && m.receiverId === friendId) ||
            (m.senderId === friendId && m.receiverId === currentUser.id)
          )
      )
    );
    sounds.playNotice();
  };

  const handleRemoveFriend = (friendId: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== friendId));
    if (activePrivateChatFriend?.id === friendId) {
      setActivePrivateChatFriend(null);
    }
    sounds.playNotice();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(defaultUser);
    authService.clearSession();
    authService.clearOtp();
    if (activeTab === 'profile') {
      setActiveTab('room');
    }
    sounds.playJoin();
  };

  const handleRechargeUser = (
    accountId: string,
    coins: number,
    diamonds: number,
    note?: string
  ): boolean => {
    const isOwner = Boolean(
      currentUser.isOwner ||
      currentUser.role === 'owner' ||
      currentUser.role === 'admin' ||
      currentUser.isAppAdmin ||
      currentUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' ||
      currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
      currentUser.email?.toLowerCase() === 'moissanite.watch2025@gmail.com'
    );
    if (!isOwner && currentUser.role !== 'admin' && !currentUser.isAppAdmin) {
      return false;
    }

    const target = allUsers.find(
      (u) =>
        u.accountId?.toLowerCase() === accountId.toLowerCase() ||
        u.id.toLowerCase() === accountId.toLowerCase()
    );

    if (!target) return false;

    // Update in allUsers
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === target.id
          ? {
              ...u,
              coins: Math.max(0, (u.coins || 0) + coins),
              diamonds: Math.max(0, (u.diamonds || 0) + diamonds),
            }
          : u
      )
    );

    // Update in friends list if present
    setFriends((prev) =>
      prev.map((u) =>
        u.id === target.id
          ? {
              ...u,
              coins: Math.max(0, (u.coins || 0) + coins),
              diamonds: Math.max(0, (u.diamonds || 0) + diamonds),
            }
          : u
      )
    );

    const targetCoins = Math.max(0, (target.coins || 0) + coins);
    const targetDiamonds = Math.max(0, (target.diamonds || 0) + diamonds);
    authService.updateAccountBalance(target.accountId || target.id, targetCoins, targetDiamonds);

    // If target is current user
    if (target.id === currentUser.id) {
      setCurrentUser((prev) => {
        const next = {
          ...prev,
          coins: targetCoins,
          diamonds: targetDiamonds,
        };
        authService.saveSession(next);
        return next;
      });
    }

    // Add recharge record
    const isAddition = coins >= 0;
    const newRecord: RechargeRecord = {
      id: 'rec_' + Date.now(),
      adminId: currentUser.id,
      targetAccountId: target.accountId || target.id,
      targetUserName: target.name,
      amountCoins: coins,
      amountDiamonds: diamonds,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      note: note || (isAddition ? 'شحن رصيد رسمي مجاني بواسطة المدير العام' : 'خصم رصيد رسمي بواسطة المدير العام'),
    };
    setRechargeHistory((prev) => [newRecord, ...prev]);

    // Send confirmation in private chat
    const rechargeNotification: PrivateMessage = {
      id: 'pm_rec_' + Date.now(),
      senderId: currentUser.id,
      receiverId: target.id,
      type: 'text',
      text: isAddition
        ? `⚡ إشعار شحن رسمي: تم شحن رصيد حسابك (ID: ${target.accountId || target.id}) بمبلغ +${formatCoins(coins)} عملة ذهبية${diamonds !== 0 ? ` و +${formatDiamonds(diamonds)} ألماسة` : ''} بواسطة المدير العام 👑`
        : `🔻 إشعار خصم رسمي: تم خصم ${formatCoins(Math.abs(coins))} عملة ذهبية${diamonds !== 0 ? ` و ${formatDiamonds(Math.abs(diamonds))} ألماسة` : ''} من حسابك (ID: ${target.accountId || target.id}) بواسطة المدير العام.`,
      timestamp: 'الآن',
      isRead: false,
    };
    setPrivateMessages((prev) => [...prev, rechargeNotification]);

    sounds.playLevelUp();
    return true;
  };

  // Public Package Purchase (Paid recharge for all standard users)
  const handlePurchasePublicPackage = (
    coins: number,
    diamonds: number,
    packageName: string,
    priceStr: string
  ) => {
    setCurrentUser((prev) => {
      const nextCoins = (prev.coins || 0) + coins;
      const nextDiamonds = (prev.diamonds || 0) + diamonds;
      authService.updateAccountBalance(prev.accountId || prev.id, nextCoins, nextDiamonds);
      const next = {
        ...prev,
        coins: nextCoins,
        diamonds: nextDiamonds,
      };
      authService.saveSession(next);
      return next;
    });

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              coins: (u.coins || 0) + coins,
              diamonds: (u.diamonds || 0) + diamonds,
            }
          : u
      )
    );

    // Send transaction confirmation in private chat notification
    const purchaseNotification: PrivateMessage = {
      id: 'pm_rec_' + Date.now(),
      senderId: 'sys_payment',
      receiverId: currentUser.id,
      type: 'text',
      text: `💳 إشعار دفع وشحن ناجح: تم شحن باقة ${packageName} (+${formatCoins(coins)} عملة ذهبية${diamonds > 0 ? ` و +${formatDiamonds(diamonds)} ألماسة` : ''}) بقيمة ${priceStr} لحسابك (ID: ${currentUser.accountId || currentUser.id}) بنجاح. شكراً لدعمك!`,
      timestamp: 'الآن',
      isRead: false,
    };
    setPrivateMessages((prev) => [...prev, purchaseNotification]);
    sounds.playLevelUp();
  };

  const handleOpenAdminRechargeWithId = (accountId?: string) => {
    setTargetRechargeAccountId(accountId);
    setAdminPanelTab('recharge_id');
    setIsAdminPanelOpen(true);
  };

  const handleOpenAdminLevelEditorWithId = (accountId?: string) => {
    setTargetRechargeAccountId(accountId);
    setAdminPanelTab('levels');
    setIsAdminPanelOpen(true);
  };

  // Main Admin/Owner Level Adjustment Authority (Max level 100)
  const handleUpdateUserLevel = (
    accountIdOrId: string,
    newLevel: number,
    newSupporterLevel?: number
  ): boolean => {
    const isOwner = Boolean(
      currentUser.isOwner ||
      currentUser.role === 'owner' ||
      currentUser.role === 'admin' ||
      currentUser.isAppAdmin ||
      currentUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' ||
      currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
      currentUser.email?.toLowerCase() === 'moissanite.watch2025@gmail.com'
    );
    if (!isOwner && currentUser.role !== 'admin' && !currentUser.isAppAdmin) {
      return false;
    }

    const targetAccId = accountIdOrId.trim();
    const cleanLevel = Math.min(MAX_LEVEL, Math.max(1, Math.floor(newLevel)));
    const cleanSupporter = Math.min(MAX_LEVEL, Math.max(1, Math.floor(newSupporterLevel ?? cleanLevel)));

    const accXp = getXpRequiredForAccountLevel(cleanLevel);
    const supXp = getXpRequiredForSupporterLevel(cleanSupporter);

    // Persist to localStorage / authService
    authService.updateAccountLevel(
      targetAccId, 
      cleanLevel, 
      cleanSupporter, 
      accXp, 
      supXp
    );

    // Update allUsers in local state
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (
          u.accountId?.toLowerCase() === targetAccId.toLowerCase() ||
          u.id.toLowerCase() === targetAccId.toLowerCase()
        ) {
          return {
            ...u,
            level: cleanLevel,
            supporterLevel: cleanSupporter,
            xp: accXp,
            supporterXp: supXp,
          };
        }
        return u;
      })
    );

    // If target is current user
    if (
      currentUser.accountId?.toLowerCase() === targetAccId.toLowerCase() ||
      currentUser.id.toLowerCase() === targetAccId.toLowerCase()
    ) {
      setCurrentUser((prev) => {
        const next = {
          ...prev,
          level: cleanLevel,
          supporterLevel: cleanSupporter,
          xp: accXp,
          supporterXp: supXp,
        };
        authService.saveSession(next);
        return next;
      });
    }

    // Update current room seats
    setSeats((prev) =>
      prev.map((s) => {
        if (
          s.user &&
          (s.user.accountId?.toLowerCase() === targetAccId.toLowerCase() ||
           s.user.id.toLowerCase() === targetAccId.toLowerCase())
        ) {
          return {
            ...s,
            user: {
              ...s.user,
              level: cleanLevel,
              supporterLevel: cleanSupporter,
              xp: accXp,
              supporterXp: supXp,
            },
          };
        }
        return s;
      })
    );

    // Announce level adjustment in chat
    const adminLvlMsg: ChatMessage = {
      id: 'sys_lvl_' + Date.now(),
      user: currentUser,
      text: `👑 أمر إداري: تم ترقية وتعديل مستوى الحساب (${targetAccId}) إلى المستوى العام Lv.${cleanLevel} ومستوى الداعمين Lv.${cleanSupporter} ⚡`,
      timestamp: 'الآن',
      isSystem: true,
    };
    setMessages((prev) => [...prev, adminLvlMsg]);
    if (currentRoom) {
      socketService.sendRoomMessage(currentRoom.id, adminLvlMsg);
    }

    return true;
  };

  // Take Mic Seat on Stage (Gated for registered users)
  const handleTakeSeat = (seatIndex: number) => {
    if (!isLoggedIn) {
      setBanNotice('⚠️ عفواً، لا يمكن للزائر الصعود إلى المايك. يرجى فتح حساب أو تسجيل الدخول أولاً!');
      setTimeout(() => setBanNotice(null), 4500);
      setIsAuthOpen(true);
      return;
    }

    if (userSeatIndex !== null) {
      // Leave old seat first
      handleLeaveSeat();
    }
    sounds.playApplause();
    setSeats((prev) => {
      const updated = [...prev];
      updated[seatIndex] = {
        ...updated[seatIndex],
        user: currentUser,
        isMuted: false,
        audioLevel: 50,
      };
      return updated;
    });
    setUserSeatIndex(seatIndex);
    setIsUserMuted(false);

    // Relay seat take & start real microphone voice broadcasting
    if (currentRoom) {
      socketService.takeSeat(currentRoom.id, seatIndex, currentUser);
      realtimeVoiceService.startBroadcasting(currentRoom.id, seatIndex, currentUser.id, currentUser.name);
    }

    // Announce in chat
    const seatMsg: ChatMessage = {
      id: 'sys_' + Date.now(),
      user: currentUser,
      text: `صعد ${currentUser.name} إلى المايك رقم ${seatIndex + 1} 🎙️`,
      timestamp: 'الآن',
      isSystem: true,
    };
    setMessages((prev) => [...prev, seatMsg]);
    if (currentRoom) {
      socketService.sendRoomMessage(currentRoom.id, seatMsg);
    }
  };

  // Leave Mic Seat
  const handleLeaveSeat = () => {
    if (userSeatIndex === null) return;
    const prevSeatIndex = userSeatIndex;
    setSeats((prev) => {
      const updated = [...prev];
      updated[prevSeatIndex] = {
        ...updated[prevSeatIndex],
        user: null,
        audioLevel: 0,
      };
      return updated;
    });
    setUserSeatIndex(null);

    // Stop microphone broadcasting and notify peers via WebSocket
    realtimeVoiceService.stopBroadcasting();
    if (currentRoom) {
      socketService.leaveSeat(currentRoom.id, prevSeatIndex, currentUser.id);
    }
  };

  // Toggle User Mute
  const handleToggleUserMute = () => {
    const isOwner = authService.isOwner(currentUser);
    const isHost = currentRoom && (currentRoom.host?.id === currentUser.id || currentRoom.host?.accountId === currentUser.accountId);

    // If room mics are locked and user is attempting to unmute:
    if (currentRoom?.areMicsLocked && isUserMuted && !isOwner && !isHost) {
      alert("⚠️ مايكات الغرفة مقفلة حالياً من قبل صاحب الغرفة! فقط صاحب الغرفة والمالك الرئيسي يمكنهم التحدث.");
      sounds.playNotice();
      return;
    }

    const nextMuted = !isUserMuted;
    setIsUserMuted(nextMuted);
    if (userSeatIndex !== null) {
      setSeats((prev) => {
        const updated = [...prev];
        updated[userSeatIndex] = {
          ...updated[userSeatIndex],
          isMuted: nextMuted,
          audioLevel: nextMuted ? 0 : 40,
        };
        return updated;
      });

      if (currentRoom) {
        socketService.setSeatMute(currentRoom.id, userSeatIndex, nextMuted);
        if (nextMuted) {
          realtimeVoiceService.stopBroadcasting();
        } else {
          realtimeVoiceService.startBroadcasting(currentRoom.id, userSeatIndex, currentUser.id, currentUser.name);
        }
      }
    }
  };

  // Toggle Room Mics Lock (for Room Host & Sovereign Owner)
  const handleToggleRoomMicsLock = (shouldLock: boolean) => {
    if (!currentRoom) return;
    const isOwner = authService.isOwner(currentUser);
    const isHost = currentRoom.host?.id === currentUser.id || currentRoom.host?.accountId === currentUser.accountId;

    if (!isHost && !isOwner) {
      alert("عذراً، فقط صاحب الغرفة أو المالك الرئيسي يملك صلاحية قفل أو فتح مايكات الغرفة.");
      return;
    }

    // Update local currentRoom state
    setCurrentRoom((prev) =>
      prev ? { ...prev, areMicsLocked: shouldLock, micsLockedByName: currentUser.name } : null
    );

    if (shouldLock) {
      setSeats((prev) =>
        prev.map((s) => {
          if (!s.user) return s;
          const isSeatOwner = authService.isOwner(s.user);
          if (isSeatOwner) return s; // Sovereign owner is NEVER muted!
          return { ...s, isMuted: true, audioLevel: 0 };
        })
      );
      if (userSeatIndex !== null && !isOwner) {
        setIsUserMuted(true);
        realtimeVoiceService.stopBroadcasting();
      }
      sounds.playNotice();
    } else {
      sounds.playLevelUp();
    }

    // Broadcast across socket network
    socketService.lockAllRoomMics(currentRoom.id, shouldLock, currentUser.name);
  };

  // Send Virtual Gift (Gated for registered users and exclusively inside voice rooms)
  const handleSendGift = (gift: VirtualGift, receiver: User) => {
    if (!isLoggedIn) {
      setBanNotice('⚠️ عفواً، لا يمكن للزائر إرسال الهدايا. يرجى فتح حساب أو تسجيل الدخول أولاً!');
      setTimeout(() => setBanNotice(null), 4500);
      setIsAuthOpen(true);
      return;
    }

    // Gifting is strictly room-exclusive
    if (!currentRoom) {
      setBanNotice('⚠️ إرسال الهدايا متاح حصرياً داخل الغرف الصوتية فقط على المسرح، وغير متاح في الخاص!');
      setTimeout(() => setBanNotice(null), 4500);
      return;
    }

    const giftPrice = gift.price;
    if (currentUser.coins < giftPrice) {
      setBanNotice(`⚠️ رصيدك من العملات غير كافٍ لإرسال ${gift.nameAr}! يلزمك ${formatCoins(giftPrice)} عملة.`);
      setTimeout(() => setBanNotice(null), 4500);
      setIsUserRechargeOpen(true);
      return;
    }

    const isOwner = 
      currentUser.role === 'owner' || 
      currentUser.isOwner || 
      currentUser.role === 'admin' ||
      currentUser.isAppAdmin ||
      currentUser.email?.toLowerCase() === 'vip666bitcoin@gmail.com' || 
      currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
      currentUser.email?.toLowerCase() === 'motanow000@gmail.com' ||
      currentUser.id === 'owner_vip_account' ||
      currentUser.id === 'admin_shadow' ||
      currentUser.accountId === '77777' ||
      currentUser.accountId === '10001';
    
    // Distribute 50% to receiver and 50% to main admin account
    const { receiverShare, adminShare } = authService.distributeGiftSplit(receiver.accountId || receiver.id, giftPrice);

    // Support Leveling System: Award supporter XP and account XP based on coins sent
    const levelResult = awardGiftSupportXp(currentUser, giftPrice);
    const updatedSender = levelResult.updatedUser;

    // Deduct coins & credit admin share if sender is owner & update levels
    setCurrentUser((prev) => {
      let remainingCoins = Math.max(0, prev.coins - giftPrice);
      if (isOwner) {
        remainingCoins += adminShare;
      }
      authService.updateAccountBalance(prev.accountId || prev.id, remainingCoins, prev.diamonds || 0);
      authService.updateAccountLevel(
        prev.accountId || prev.id,
        updatedSender.level,
        updatedSender.supporterLevel,
        updatedSender.xp,
        updatedSender.supporterXp,
        updatedSender.micTimeSeconds,
        updatedSender.totalCoinsSent
      );
      const next = {
        ...prev,
        ...updatedSender,
        coins: remainingCoins,
      };
      authService.saveSession(next);
      return next;
    });

    // Update allUsers in local state
    setAllUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === currentUser.id || u.accountId === currentUser.accountId) {
          return {
            ...u,
            ...updatedSender,
          };
        }
        if (u.id === receiver.id || u.accountId === receiver.accountId) {
          return { ...u, coins: (u.coins || 0) + receiverShare };
        }
        const isUserAdmin = 
          u.isOwner || 
          u.role === 'owner' || 
          u.role === 'admin' ||
          u.isAppAdmin ||
          u.email?.toLowerCase() === 'vip666bitcoin@gmail.com' || 
          u.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
          u.email?.toLowerCase() === 'motanow000@gmail.com' ||
          u.id === 'owner_vip_account' ||
          u.id === 'admin_shadow' ||
          u.accountId === '77777' ||
          u.accountId === '10001';
        if (isUserAdmin) {
          return { ...u, coins: (u.coins || 0) + adminShare };
        }
        return u;
      })
    );

    // If supporter level increased, announce celebratory message
    if (levelResult.supporterLeveledUp) {
      sounds.playLevelUp();
      const supLevelMsg: ChatMessage = {
        id: 'suplvl_' + Date.now(),
        user: updatedSender,
        text: `💎 ارتقاء تاريخي للداعمين! صعد ${updatedSender.name} إلى مستوى الداعمين Lv.${levelResult.newSupporterLevel} / ${MAX_LEVEL} 👑 شكراً لدعمك المتواصل!`,
        timestamp: 'الآن',
        isSystem: true,
      };
      setMessages((prev) => [...prev, supLevelMsg]);
      if (currentRoom) {
        socketService.sendRoomMessage(currentRoom.id, supLevelMsg);
      }
    }

    // Trigger full screen animation locally
    setActiveGiftEffect({
      gift,
      sender: updatedSender,
      receiver,
    });

    // Announce in chat with 50/50 split celebration
    const giftMsg: ChatMessage = {
      id: 'gift_' + Date.now(),
      user: updatedSender,
      text: `أرسل ${gift.nameAr} (${gift.icon}) بقيمة ${formatCoins(gift.price)} عملة إلى ${receiver.name}! (المستلم +${formatCoins(receiverShare)} عملة 🪙 والأدمن الرئيسي +${formatCoins(adminShare)} عملة 👑)`,
      timestamp: 'الآن',
      giftPayload: {
        gift,
        receiver,
      },
    };
    setMessages((prev) => [...prev, giftMsg]);

    // Broadcast gift effect, sound, and chat announcement to everyone in room via WebSocket
    if (currentRoom) {
      socketService.sendGift(currentRoom.id, {
        gift,
        sender: updatedSender,
        receiver,
      });
    }

    // Log function call
    setFunctionLogs((prev) => [
      {
        id: 'call_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        toolName: 'send_virtual_gift',
        arguments: {
          sender_id: currentUser.id,
          receiver_id: receiver.id,
          gift_id: gift.id,
          amount: gift.price,
        },
        result: {
          status: 'success',
          messageAr: `تم خصم ${gift.price} عملة وإرسال ${gift.nameAr} إلى ${receiver.name}`,
        },
        initiatedBy: 'manual_test',
      },
      ...prev,
    ]);
  };

  // Room sound reaction broadcast (Gated for registered users)
  const handleSendRoomReaction = (emoji: string, soundType: 'applause' | 'dice' | 'victory') => {
    if (!isLoggedIn) {
      setBanNotice('⚠️ يرجى فتح حساب أو تسجيل الدخول للتفاعل في الغرفة.');
      setTimeout(() => setBanNotice(null), 4000);
      setIsAuthOpen(true);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'reaction_' + Date.now(),
        user: currentUser,
        text: `أرسل تفاعلاً في الغرفة: ${emoji}`,
        timestamp: 'الآن',
        isSystem: true,
      },
    ]);
  };

  // Trigger Games from UI
  const handleTriggerGame = (gameName: 'ludo' | 'trivia' | 'truth_dare') => {
    if (gameName === 'ludo') {
      setIsLudoOpen(true);
    } else if (gameName === 'trivia') {
      setIsTriviaOpen(true);
    }

    setFunctionLogs((prev) => [
      {
        id: 'call_' + Date.now(),
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        toolName: 'start_game',
        arguments: {
          game_name: gameName,
          room_id: currentRoom.id,
        },
        result: {
          status: 'success',
          messageAr: `تم إطلاق لعبة ${gameName === 'ludo' ? 'اللودو' : 'المسابقات'} داخل الغرفة`,
        },
        initiatedBy: 'ai_host',
      },
      ...prev,
    ]);
  };

  // Handle User Chat Message in Voice Room
  const handleSendMessage = (text: string) => {
    if (!isLoggedIn) {
      setBanNotice('⚠️ عفواً، لا يمكن للزائر إرسال رسائل. يرجى فتح حساب أو تسجيل الدخول أولاً!');
      setTimeout(() => setBanNotice(null), 4500);
      setIsAuthOpen(true);
      return;
    }

    const userMsgId = 'msg_' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      user: currentUser,
      text,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    // Append immediately to local state and broadcast via Socket to everyone in room
    setMessages((prev) => [...prev, newUserMsg]);
    if (currentRoom) {
      socketService.sendRoomMessage(currentRoom.id, newUserMsg);
    }
  };

  // Trigger VIP Entrance in current room (Pure Kill Message on side of screen only - NO CHAT SPAM)
  const handleTriggerRoomVipEntrance = (user: User, level: number, message: string) => {
    setActiveVipEntrance({ user, level, message });
  };

  // Switch Room from Explore
  const handleJoinRoom = (room: VoiceRoom) => {
    // Check if user is banned from this room (App admins and the user himself are immune)
    const isImmune = Boolean(
      currentUser.isAppAdmin ||
      currentUser.role === 'admin' ||
      currentUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
      currentUser.isImmune
    );

    if (!isImmune && room.bannedUsers) {
      const activeBan = room.bannedUsers.find((b) => {
        if (b.userId === currentUser.id) {
          if (b.isPermanent) return true;
          if (b.expiresAt && b.expiresAt > Date.now()) return true;
        }
        return false;
      });

      if (activeBan) {
        setBanNotice(
          activeBan.isPermanent
            ? '⛔ أنت محظور بشكل دائم من دخول هذه الغرفة بأمر مشرف الغرفة.'
            : '⛔ أنت مطرود ومحظور مؤقتاً من هذه الغرفة، يرجى الانتظار حتى انتهاء مدة الحظر.'
        );
        sounds.playWarningBuzzer();
        setTimeout(() => setBanNotice(null), 4500);
        return;
      }
    }

    if (currentRoom && currentRoom.id !== room.id) {
      socketService.leaveRoom(currentRoom.id, currentUser.id);
      realtimeVoiceService.stopBroadcasting();
      setUserSeatIndex(null);
    }

    setCurrentRoom(room);
    setActiveTab('room');
    socketService.joinRoom(room.id, currentUser);

    // Fetch initial room state (seats, messages) from server API
    fetch(`/api/rooms/${room.id}/state`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          if (data.seats && Array.isArray(data.seats)) {
            setSeats(data.seats);
            const myIdx = data.seats.findIndex((s: any) => s.user?.id === currentUser.id);
            setUserSeatIndex(myIdx !== -1 ? myIdx : null);
          }
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
        }
      })
      .catch(() => {});

    // Silent VIP Kill Message on Screen Side (NO SOUND EFFECTS, NO CHAT TEXT)
    if (currentUser.vipSubscription?.active) {
      const sub = currentUser.vipSubscription;
      const msg = sub.customMessage || `👑 رحبوا بقدوم سمو ${currentUser.name}!`;
      setActiveVipEntrance({
        user: currentUser,
        level: sub.level,
        message: msg,
      });
    }

    setMessages([
      {
        id: 'sys_' + Date.now(),
        user: room.host,
        text: `مرحباً بك في غرفة "${room.title}"! تم الربط مع البث الصوتي. 🎙️`,
        timestamp: 'الآن',
        isSystem: true,
      },
    ]);
  };

  // Room Moderation System Handlers (Mute, Drop, Kick, Room Info)
  const isUserImmuneTarget = (targetUser: User) => {
    return Boolean(
      targetUser.isAppAdmin ||
      targetUser.role === 'admin' ||
      targetUser.email?.toLowerCase() === 'shadow008btc@gmail.com' ||
      targetUser.isImmune
    );
  };

  const handleMuteRoomUser = (targetUser: User) => {
    if (isUserImmuneTarget(targetUser)) return;

    const seatIdx = seats.findIndex((s) => s.user?.id === targetUser.id);
    if (seatIdx !== -1) {
      const currentMuted = seats[seatIdx].isMuted;
      setSeats((prev) => {
        const u = [...prev];
        u[seatIdx] = {
          ...u[seatIdx],
          isMuted: !currentMuted,
          audioLevel: !currentMuted ? 0 : 40,
        };
        return u;
      });

      // Update room muted user list
      setCurrentRoom((prev) => {
        const currentList = prev.mutedUserIds || [];
        const isNowMuted = !currentMuted;
        return {
          ...prev,
          mutedUserIds: isNowMuted
            ? [...currentList.filter((id) => id !== targetUser.id), targetUser.id]
            : currentList.filter((id) => id !== targetUser.id),
        };
      });

      setMessages((prev) => [
        ...prev,
        {
          id: 'sys_' + Date.now(),
          user: currentUser,
          text: !currentMuted
            ? `🔇 قام مشرف الغرفة بكتم المايك عن ${targetUser.name}`
            : `🎙️ قام مشرف الغرفة بإلغاء كتم المايك عن ${targetUser.name}`,
          timestamp: 'الآن',
          isSystem: true,
        },
      ]);
    }
  };

  const handleDropUserFromMic = (targetUser: User) => {
    if (isUserImmuneTarget(targetUser)) return;

    const seatIdx = seats.findIndex((s) => s.user?.id === targetUser.id);
    if (seatIdx !== -1) {
      setSeats((prev) => {
        const u = [...prev];
        u[seatIdx] = {
          ...u[seatIdx],
          user: null,
          audioLevel: 0,
        };
        return u;
      });

      if (currentUser.id === targetUser.id) {
        setUserSeatIndex(null);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'sys_' + Date.now(),
          user: currentUser,
          text: `⬇️ قام مشرف الغرفة بإنزال ${targetUser.name} من المايك إلى قائمة المستمعين`,
          timestamp: 'الآن',
          isSystem: true,
        },
      ]);
    }
  };

  const handleKickRoomUser = (targetUser: User, durationMinutes?: number, isPermanent?: boolean) => {
    if (isUserImmuneTarget(targetUser)) return;

    // Drop from seat if seated
    const seatIdx = seats.findIndex((s) => s.user?.id === targetUser.id);
    if (seatIdx !== -1) {
      setSeats((prev) => {
        const u = [...prev];
        u[seatIdx] = {
          ...u[seatIdx],
          user: null,
          audioLevel: 0,
        };
        return u;
      });
    }

    const newBan = {
      userId: targetUser.id,
      userName: targetUser.name,
      userAvatar: targetUser.avatar,
      bannedAt: new Date().toISOString(),
      bannedBy: currentUser.name,
      isPermanent: Boolean(isPermanent),
      durationMinutes: durationMinutes || 15,
      expiresAt: isPermanent ? undefined : Date.now() + (durationMinutes || 15) * 60 * 1000,
      reason: 'طرد بواسطة مشرف الغرفة',
    };

    setCurrentRoom((prev) => ({
      ...prev,
      bannedUsers: [
        ...(prev.bannedUsers || []).filter((b) => b.userId !== targetUser.id),
        newBan,
      ],
    }));

    if (currentUser.id === targetUser.id) {
      setUserSeatIndex(null);
      setActiveTab('explore');
    }

    setMessages((prev) => [
      ...prev,
      {
        id: 'sys_' + Date.now(),
        user: currentUser,
        text: isPermanent
          ? `🚫 قام المشرف بطرد وحظر ${targetUser.name} من الغرفة بشكل دائم`
          : `⏱️ قام المشرف بطرد ${targetUser.name} من الغرفة مؤقتاً لمدة ${durationMinutes || 15} دقيقة`,
        timestamp: 'الآن',
        isSystem: true,
      },
    ]);
  };

  const handleUpdateRoomInfo = (title: string, coverImage: string) => {
    setCurrentRoom((prev) => {
      if (!prev) return null;
      const updated = {
        ...prev,
        title,
        coverImage,
      };
      setRooms((rList) => {
        const nextRooms = rList.map((r) => (r.id === prev.id ? updated : r));
        try {
          localStorage.setItem('yalla_real_rooms_v4', JSON.stringify(nextRooms));
        } catch {}
        return nextRooms;
      });
      return updated;
    });

    setMessages((prev) => [
      ...prev,
      {
        id: 'sys_' + Date.now(),
        user: currentUser,
        text: `🎨 قام مسؤول الغرفة بتحديث معلومات الغرفة وغلافها إلى "${title}"`,
        timestamp: 'الآن',
        isSystem: true,
      },
    ]);
  };

  const handleUnbanRoomUser = (userId: string) => {
    setCurrentRoom((prev) => (prev ? {
      ...prev,
      bannedUsers: (prev.bannedUsers || []).filter((b) => b.userId !== userId),
    } : null));

    setMessages((prev) => [
      ...prev,
      {
        id: 'sys_' + Date.now(),
        user: currentUser,
        text: `✅ تم رفع الحظر عن العضو والسماح له بالدخول مجدداً إلى الغرفة`,
        timestamp: 'الآن',
        isSystem: true,
      },
    ]);
  };

  const handleCreateRoom = (newRoom: VoiceRoom) => {
    // Persist to server API and broadcast to all connected devices
    fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRoom),
    }).catch(() => {});
    socketService.broadcastRoomCreated(newRoom);

    setRooms((prev) => {
      const updated = [newRoom, ...prev.filter((r) => r.id !== newRoom.id)];
      try {
        localStorage.setItem('yalla_real_rooms_v4', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setCurrentRoom(newRoom);
    setActiveTab('room');
    socketService.joinRoom(newRoom.id, currentUser);
    sounds.playJoin();
  };

  const handleDeleteRoom = (roomId: string) => {
    // Delete on server API and broadcast to all connected devices
    fetch(`/api/rooms/${roomId}`, { method: 'DELETE' }).catch(() => {});
    socketService.broadcastRoomDeleted(roomId);

    setRooms((prev) => {
      const updated = prev.filter((r) => r.id !== roomId);
      try {
        localStorage.setItem('yalla_real_rooms_v4', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentRoom?.id === roomId) {
      socketService.leaveRoom(roomId, currentUser.id);
      realtimeVoiceService.stopBroadcasting();
      setCurrentRoom(null);
      setActiveTab('explore');
    }
    sounds.playNotice();
  };

  // Admin & Moderator Management Handlers
  const handleUpdateCurrentUser = (updated: Partial<User>) => {
    if (updated.name || updated.avatar) {
      authService.updateProfile(currentUser.accountId || currentUser.id, {
        name: updated.name,
        avatar: updated.avatar,
      });
    }
    if (typeof updated.coins === 'number' || typeof updated.diamonds === 'number') {
      authService.updateAccountBalance(
        currentUser.accountId || currentUser.id,
        typeof updated.coins === 'number' ? updated.coins : currentUser.coins,
        typeof updated.diamonds === 'number' ? updated.diamonds : currentUser.diamonds
      );
    }
    setCurrentUser((prev) => {
      const merged = { ...prev, ...updated };
      authService.saveSession(merged);
      return merged;
    });
    setAllUsers((prev) =>
      prev.map((u) => (u.id === currentUser.id ? { ...u, ...updated } : u))
    );
    setSeats((prev) =>
      prev.map((s) =>
        s.user?.id === currentUser.id
          ? { ...s, user: { ...s.user, ...updated } }
          : s
      )
    );
    setFriends((prev) =>
      prev.map((f) => (f.id === currentUser.id ? { ...f, ...updated } : f))
    );

    // Sync host in current room and rooms list
    setCurrentRoom((prev) => {
      if (!prev) return null;
      if (
        prev.host &&
        (prev.host.id === currentUser.id ||
          (currentUser.accountId && prev.host.accountId === currentUser.accountId))
      ) {
        return {
          ...prev,
          host: {
            ...prev.host,
            name: updated.name || prev.host.name,
            avatar: updated.avatar || prev.host.avatar,
          },
        };
      }
      return prev;
    });

    setRooms((prev) =>
      prev.map((r) => {
        if (
          r.host &&
          (r.host.id === currentUser.id ||
            (currentUser.accountId && r.host.accountId === currentUser.accountId))
        ) {
          return {
            ...r,
            host: {
              ...r.host,
              name: updated.name || r.host.name,
              avatar: updated.avatar || r.host.avatar,
            },
          };
        }
        return r;
      })
    );

    // Broadcast across live WebSocket connection
    socketService.broadcastProfileUpdate({
      id: currentUser.id,
      accountId: currentUser.accountId,
      email: currentUser.email,
      name: updated.name || currentUser.name,
      avatar: updated.avatar || currentUser.avatar,
    });

    // Sync to backend persistent store
    const userIdentifier = currentUser.email || currentUser.accountId || currentUser.id;
    authService.updateProfile(userIdentifier, {
      name: updated.name,
      avatar: updated.avatar,
    });

    // Direct REST API sync
    fetch('/api/users/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentUser.id,
        accountId: currentUser.accountId,
        email: currentUser.email,
        name: updated.name || currentUser.name,
        avatar: updated.avatar || currentUser.avatar,
      }),
    }).catch(() => {});
  };

  const handleAddModerator = (modData: Omit<ModeratorAccount, 'id' | 'assignedAt'>) => {
    const newMod: ModeratorAccount = {
      ...modData,
      id: 'mod_' + Date.now(),
      assignedAt: new Date().toISOString().split('T')[0],
      hasDashboardAccess: false,
    };
    setModerators((prev) => [newMod, ...prev]);
  };

  const handleRemoveModerator = (id: string) => {
    setModerators((prev) => prev.filter((m) => m.id !== id));
  };

  // Daily login reward auto-welcoming popup on load / login (once per 24h)
  useEffect(() => {
    if (!isLoggedIn) return;
    const timer = setTimeout(() => {
      const eligibility = dailyRewardService.checkEligibility(currentUser.id);
      if (eligibility.canClaim) {
        setIsDailyRewardOpen(true);
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [currentUser.id, isLoggedIn]);

  // Handle claiming daily login reward
  const handleClaimDailyReward = (
    coinsEarned: number,
    diamondsEarned: number,
    badgeEarned?: string
  ) => {
    setCurrentUser((prev) => {
      const nextCoins = (prev.coins || 0) + coinsEarned;
      const nextDiamonds = (prev.diamonds || 0) + diamondsEarned;
      authService.updateAccountBalance(prev.accountId || prev.id, nextCoins, nextDiamonds);
      const next = {
        ...prev,
        coins: nextCoins,
        diamonds: nextDiamonds,
        badge: badgeEarned || prev.badge,
      };
      authService.saveSession(next);
      return next;
    });

    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              coins: (u.coins || 0) + coinsEarned,
              diamonds: (u.diamonds || 0) + diamondsEarned,
              badge: badgeEarned || u.badge,
            }
          : u
      )
    );

    // Announce in room chat
    setMessages((prev) => [
      ...prev,
      {
        id: 'daily_' + Date.now(),
        user: currentUser,
        text: `استلم ${currentUser.name} مكافأة الحضور اليومي: +${formatCoins(coinsEarned)} عملة ذهبية${diamondsEarned > 0 ? ` و +${formatDiamonds(diamondsEarned)} ألماسة` : ''}! 🎁✨`,
        timestamp: 'الآن',
        isSystem: true,
      },
    ]);

    // Send private system message confirming the credit
    const dailyNotification: PrivateMessage = {
      id: 'pm_daily_' + Date.now(),
      senderId: 'sys_daily',
      receiverId: currentUser.id,
      type: 'text',
      text: `🎁 تم استلام مكافأة تسجيل الدخول اليومي بنجاح: تم إيداع +${formatCoins(coinsEarned)} عملة ذهبية${diamondsEarned > 0 ? ` و +${formatDiamonds(diamondsEarned)} ألماسة` : ''} في محفظتك. حافظ على حضورك اليومي لمضاعفة أرباحك!`,
      timestamp: 'الآن',
      isRead: false,
    };
    setPrivateMessages((prev) => [...prev, dailyNotification]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Cairo',sans-serif]">
      {/* Non-blocking Floating Ban Notification */}
      {banNotice && (
        <div className="fixed top-4 inset-x-4 z-50 max-w-md mx-auto p-4 rounded-2xl bg-rose-950/95 border border-rose-500/50 text-rose-100 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="text-lg">⛔</span>
            <span>{banNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setBanNotice(null)}
            className="p-1 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-bold cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      <MobileShell
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'profile' && !isLoggedIn) {
            setIsAuthOpen(true);
            return;
          }
          setActiveTab(tab);
        }}
        currentUser={currentUser}
        isLoggedIn={isLoggedIn}
        onAddCoins={handleAddCoins}
        hasApiKey={hasApiKey}
        isAiProcessing={isAiProcessing}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenAdminRecharge={(accountId) => handleOpenAdminRechargeWithId(accountId)}
        onOpenUserRecharge={() => setIsUserRechargeOpen(true)}
        onOpenDailyReward={() => setIsDailyRewardOpen(true)}
        isDailyRewardClaimable={dailyRewardService.checkEligibility(currentUser.id).canClaim}
        unreadFriendsCount={(friendRequests || []).filter((r) => r && r.toUserId === currentUser?.id && r.status === 'pending').length}
      >
      {/* TAB 1: LIVE VOICE ROOM (MOBILE APP INTERFACE) */}
      {activeTab === 'room' && (
        currentRoom ? (
          <MobileVoiceRoom
            room={currentRoom}
            seats={seats}
            currentUser={currentUser}
            isUserOnSeat={userSeatIndex !== null}
            userSeatIndex={userSeatIndex}
            onTakeSeat={handleTakeSeat}
            onLeaveSeat={handleLeaveSeat}
            isUserMuted={isUserMuted}
            onToggleUserMute={handleToggleUserMute}
            onToggleRoomMicsLock={handleToggleRoomMicsLock}
            messages={messages}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteRoomMessage}
            isAiProcessing={isAiProcessing}
            botSpeechBubble={botSpeechBubble}
            isAudioVoiceActive={isAudioVoiceActive}
            onToggleAudioVoice={() => setIsAudioVoiceActive((v) => !v)}
            onOpenLudo={() => setIsLudoOpen(true)}
            onOpenTrivia={() => setIsTriviaOpen(true)}
            onOpenGiftStore={() => setIsGiftStoreOpen(true)}
            onSendReaction={handleSendRoomReaction}
            onExitRoom={() => setActiveTab('explore')}
            activeVipEntrance={activeVipEntrance}
            onDismissVipEntrance={() => setActiveVipEntrance(null)}
            onMuteUser={handleMuteRoomUser}
            onDropFromMic={handleDropUserFromMic}
            onKickUser={handleKickRoomUser}
            onUpdateRoomInfo={handleUpdateRoomInfo}
            onUnbanUser={handleUnbanRoomUser}
            onTriggerVipEntrance={handleTriggerRoomVipEntrance}
            onNavigateToSubscriptions={() => setActiveTab('aistudio')}
            isFriend={(targetUser) => friends.some((f) => f.id === targetUser.id)}
            onSendFriendRequest={handleSendFriendRequest}
            onOpenPrivateChat={(targetUser) => setActivePrivateChatFriend(targetUser)}
            onOpenAdminRecharge={handleOpenAdminRechargeWithId}
            onOpenAdminLevelEditor={handleOpenAdminLevelEditorWithId}
            onDeleteRoom={handleDeleteRoom}
          />
        ) : (
          <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 animate-pulse">
              <Radio className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h3 className="text-base font-black text-white">لم تنضم لأي غرفة صوتية حالياً</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                تمت إزالة الغرف التجريبية السابقة. يمكنك الآن استكشاف الساحة أو تصميم غرفتك الخاصة (حتى 3 غرف لكل شخص).
              </p>
            </div>
            <div className="flex flex-col gap-2.5 w-full max-w-xs pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsAuthOpen(true);
                    return;
                  }
                  setIsCreateRoomOpen(true);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>تصميم غرفة صوتية جديدة</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('explore')}
                className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>استكشاف الغرف المتوفرة</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* TAB 2: EXPLORE ROOMS & AI RECOMMENDATIONS */}
      {activeTab === 'explore' && (
        <div className="p-3 pb-24 overflow-y-auto h-full scrollbar-none">
          <ExploreRooms 
            rooms={rooms}
            currentUser={currentUser}
            isLoggedIn={isLoggedIn}
            onJoinRoom={handleJoinRoom}
            onOpenCreateRoomModal={() => {
              if (!isLoggedIn) {
                setIsAuthOpen(true);
                return;
              }
              setIsCreateRoomOpen(true);
            }}
            onOpenAuthModal={() => setIsAuthOpen(true)}
            onDeleteRoom={handleDeleteRoom}
          />
        </div>
      )}

      {/* TAB 3: FRIENDS & SOCIAL MESSAGING (ID SEARCH, REQUESTS & PRIVATE CHAT) */}
      {activeTab === 'friends' && (
        <div className="p-3 pb-24 overflow-y-auto h-full scrollbar-none">
          <FriendsView
            currentUser={currentUser}
            allUsers={allUsers}
            friends={friends}
            friendRequests={friendRequests}
            messages={privateMessages}
            onSendFriendRequest={handleSendFriendRequest}
            onAcceptFriendRequest={handleAcceptFriendRequest}
            onDeclineFriendRequest={handleDeclineFriendRequest}
            onOpenPrivateChat={(friend) => setActivePrivateChatFriend(friend)}
            onRemoveFriend={handleRemoveFriend}
            onOpenAdminRecharge={handleOpenAdminRechargeWithId}
          />
        </div>
      )}

      {/* TAB 4: SUBSCRIPTION STORE (متجر الاشتراكات الملكية والباقات) */}
      {activeTab === 'vip' && (
        <div className="p-3 pb-24 overflow-y-auto h-full scrollbar-none">
          <VipSubscriptionSection
            currentUser={currentUser}
            onUpdateUser={handleUpdateCurrentUser}
            onOpenRecharge={() => setIsUserRechargeOpen(true)}
            onOpenAdminChat={() => {
              setActivePrivateChatFriend(adminUser);
            }}
            onTestEntranceInRoom={(tierLevel, message) => {
              setActiveVipEntrance({
                user: currentUser,
                level: tierLevel,
                message,
              });
              setActiveTab('room');
            }}
          />
        </div>
      )}

      {/* TAB 5: USER PROFILE, WALLET & SETTINGS */}
      {activeTab === 'profile' && (
        <MobileProfile
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          onUpdateUser={handleUpdateCurrentUser}
          onOpenUserRecharge={() => setIsUserRechargeOpen(true)}
          onOpenAdminRecharge={() => handleOpenAdminRechargeWithId(currentUser.accountId || currentUser.id)}
          onOpenAdminPanel={() => {
            setAdminPanelTab('levels');
            setIsAdminPanelOpen(true);
          }}
          onOpenVipStore={() => setActiveTab('vip')}
          onOpenAuthModal={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
      )}
    </MobileShell>

      {/* Authentication Modal (Real Email & Phone with OTP, Social Media, Admin login) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => {
          setIsLoggedIn(true);
          setCurrentUser(user);
          authService.saveSession(user);
          setAllUsers((prev) => {
            const exists = prev.some((u) => u.id === user.id);
            if (exists) {
              return prev.map((u) => (u.id === user.id ? { ...u, ...user } : u));
            }
            return [user, ...prev];
          });
          sounds.playLevelUp();
          if (user.role === 'admin' || user.isAppAdmin) {
            setIsAdminPanelOpen(true);
          }
          // Welcome daily reward modal check on login
          setTimeout(() => {
            const eligibility = dailyRewardService.checkEligibility(user.id);
            if (eligibility.canClaim) {
              setIsDailyRewardOpen(true);
            }
          }, 600);
        }}
      />

      {/* Daily Reward Welcoming Modal */}
      <DailyRewardModal
        isOpen={isDailyRewardOpen}
        onClose={() => setIsDailyRewardOpen(false)}
        currentUser={currentUser}
        onClaimSuccess={handleClaimDailyReward}
      />

      {/* Admin Control Panel Modal (Funds, Recharge by Account ID, Moderators, Profile/Password) */}
      <AdminControlModal
        isOpen={isAdminPanelOpen}
        onClose={() => {
          setIsAdminPanelOpen(false);
          setTargetRechargeAccountId(undefined);
        }}
        currentUser={currentUser}
        onUpdateCurrentUser={handleUpdateCurrentUser}
        moderators={moderators}
        onAddModerator={handleAddModerator}
        onRemoveModerator={handleRemoveModerator}
        allUsers={allUsers}
        onRechargeUser={handleRechargeUser}
        onUpdateUserLevel={handleUpdateUserLevel}
        rechargeHistory={rechargeHistory}
        initialTargetAccountId={targetRechargeAccountId}
        initialTab={adminPanelTab}
      />

      {/* Public User Recharge Modal (Available for all members) */}
      <UserRechargeModal
        isOpen={isUserRechargeOpen}
        onClose={() => setIsUserRechargeOpen(false)}
        currentUser={currentUser}
        onPurchasePackage={handlePurchasePublicPackage}
        onOpenAdminFreeRecharge={() => {
          setIsUserRechargeOpen(false);
          setIsAdminPanelOpen(true);
        }}
        onOpenAdminChat={() => {
          setIsUserRechargeOpen(false);
          setActivePrivateChatFriend(adminUser);
        }}
      />

      {/* Private 1-on-1 Chat Modal (Text & Voice Notes) */}
      {activePrivateChatFriend && (
        <PrivateChatModal
          isOpen={Boolean(activePrivateChatFriend)}
          onClose={() => setActivePrivateChatFriend(null)}
          currentUser={currentUser}
          friend={activePrivateChatFriend}
          messages={(privateMessages || []).filter(
            (m) =>
              m &&
              ((m.senderId === currentUser.id && m.receiverId === activePrivateChatFriend.id) ||
              (m.senderId === activePrivateChatFriend.id && m.receiverId === currentUser.id))
          )}
          onSendMessage={(text) => handleSendPrivateMessage(activePrivateChatFriend.id, text)}
          onSendVoiceMessage={(duration, transcription) =>
            handleSendPrivateVoiceMessage(activePrivateChatFriend.id, duration, transcription)
          }
          onDeleteMessage={handleDeletePrivateMessage}
          onClearChat={handleClearPrivateChat}
          onRemoveFriend={handleRemoveFriend}
          onOpenAdminRecharge={handleOpenAdminRechargeWithId}
        />
      )}

      {/* Mini-Games Modals */}
      <LudoGameModal
        isOpen={isLudoOpen}
        onClose={() => setIsLudoOpen(false)}
        onAnnounceInRoom={(msg) => {
          setMessages((prev) => [
            ...prev,
            {
              id: 'sys_' + Date.now(),
              user: currentUser,
              text: msg,
              timestamp: 'الآن',
              isSystem: true,
            },
          ]);
        }}
      />

      <TriviaQuizModal
        isOpen={isTriviaOpen}
        onClose={() => setIsTriviaOpen(false)}
        onAnnounceInRoom={(msg) => {
          setMessages((prev) => [
            ...prev,
            {
              id: 'sys_' + Date.now(),
              user: currentUser,
              text: msg,
              timestamp: 'الآن',
              isSystem: true,
            },
          ]);
        }}
      />

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        currentUser={currentUser}
        userCreatedRoomsCount={rooms.filter((r) => r.host.id === currentUser.id).length}
        maxRoomsAllowed={3}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onCreateRoom={handleCreateRoom}
      />

      {/* Gift Store Modal */}
      <GiftStoreModal
        isOpen={isGiftStoreOpen}
        onClose={() => setIsGiftStoreOpen(false)}
        currentUser={currentUser}
        seats={seats}
        roomHost={currentRoom?.host}
        onSendGift={handleSendGift}
        onPreviewGift={(gift) => {
          setActiveGiftEffect({
            gift,
            sender: currentUser,
            receiver: currentUser,
          });
        }}
        onOpenRecharge={() => setIsUserRechargeOpen(true)}
      />

      {/* Full-screen Animated Gift Shower Effect */}
      <GiftAnimationOverlay
        gift={activeGiftEffect?.gift || null}
        sender={activeGiftEffect?.sender || null}
        receiver={activeGiftEffect?.receiver || null}
        onFinished={() => setActiveGiftEffect(null)}
      />

    </div>
  );
}
