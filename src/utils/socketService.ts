import { VoiceRoom, VoiceSeat, ChatMessage, PrivateMessage } from '../types';

type Listener<T> = (data: T) => void;

interface VoiceChunkData {
  roomId: string;
  senderId: string;
  senderName: string;
  seatIndex: number;
  audioData: string; // base64 encoded audio
  audioLevel: number;
}

class SocketService {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private currentRoomId: string | null = null;
  private currentUser: any = null;

  // Listeners
  private roomsUpdateListeners: Set<Listener<VoiceRoom[]>> = new Set();
  private roomSyncListeners: Set<Listener<{ roomId: string; messages: ChatMessage[]; seats: VoiceSeat[]; room?: VoiceRoom }>> = new Set();
  private roomMessageListeners: Set<Listener<{ roomId: string; message: ChatMessage }>> = new Set();
  private seatsUpdateListeners: Set<Listener<{ roomId: string; seats: VoiceSeat[] }>> = new Set();
  private voiceChunkListeners: Set<Listener<VoiceChunkData>> = new Set();
  private voiceStopListeners: Set<Listener<{ roomId: string; seatIndex: number }>> = new Set();
  private reactionListeners: Set<Listener<{ roomId: string; emoji: string; senderName: string }>> = new Set();
  private giftListeners: Set<Listener<{ roomId: string; giftPayload: any }>> = new Set();
  private privateMessageListeners: Set<Listener<PrivateMessage>> = new Set();
  private profileUpdateListeners: Set<Listener<any>> = new Set();
  private micsLockListeners: Set<Listener<{ roomId: string; micsLocked: boolean; lockedByName: string; seats?: VoiceSeat[] }>> = new Set();

  public connect(user?: any) {
    if (user) {
      this.currentUser = user;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }

        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.send({ type: 'ping' });
          }
        }, 20000);

        // Authenticate socket
        if (this.currentUser) {
          this.send({
            type: 'auth',
            user: {
              id: this.currentUser.id,
              name: this.currentUser.name,
              avatar: this.currentUser.avatar,
              accountId: this.currentUser.accountId,
            },
          });
        }

        // Rejoin room if was in room
        if (this.currentRoomId && this.currentUser) {
          this.send({
            type: 'join_room',
            roomId: this.currentRoomId,
            user: this.currentUser,
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingMessage(data);
        } catch (e) {
          console.error('[Socket] Failed to parse message', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.isConnected = false;
        try {
          this.ws?.close();
        } catch {}
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  private send(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(payload));
      } catch (e) {
        console.error('[Socket] Send error', e);
      }
    }
  }

  private handleIncomingMessage(msg: any) {
    switch (msg.type) {
      case 'rooms:update':
        this.roomsUpdateListeners.forEach((fn) => fn(msg.rooms));
        break;

      case 'room:sync':
        this.roomSyncListeners.forEach((fn) => fn(msg));
        break;

      case 'room:message':
        this.roomMessageListeners.forEach((fn) => fn(msg));
        break;

      case 'room:seats_update':
        this.seatsUpdateListeners.forEach((fn) => fn(msg));
        break;

      case 'room:voice_chunk':
        this.voiceChunkListeners.forEach((fn) => fn(msg));
        break;

      case 'room:voice_stop':
        this.voiceStopListeners.forEach((fn) => fn(msg));
        break;

      case 'room:reaction':
        this.reactionListeners.forEach((fn) => fn(msg));
        break;

      case 'room:gift':
        this.giftListeners.forEach((fn) => fn(msg));
        break;

      case 'private:message':
        this.privateMessageListeners.forEach((fn) => fn(msg.message));
        break;

      case 'user:profile_update':
        if (msg.profile) {
          this.profileUpdateListeners.forEach((fn) => fn(msg.profile));
        }
        break;

      case 'room:mics_lock_state':
        this.micsLockListeners.forEach((fn) => fn(msg));
        break;
    }
  }

  // Profile Update Real-time Broadcast
  public broadcastProfileUpdate(profile: any) {
    this.send({
      type: 'user:profile_update',
      profile,
    });
  }

  public onProfileUpdate(listener: Listener<any>) {
    this.profileUpdateListeners.add(listener);
    return () => {
      this.profileUpdateListeners.delete(listener);
    };
  }

  // API Methods
  public setUser(user: any) {
    this.currentUser = user;
    if (this.isConnected) {
      this.send({
        type: 'auth',
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          accountId: user.accountId,
        },
      });
    }
  }

  public joinRoom(roomId: string, user: any) {
    this.currentRoomId = roomId;
    this.currentUser = user;
    this.send({
      type: 'join_room',
      roomId,
      user,
    });
  }

  public leaveRoom(roomId: string, userId: string) {
    if (this.currentRoomId === roomId) {
      this.currentRoomId = null;
    }
    this.send({
      type: 'leave_room',
      roomId,
      userId,
    });
  }

  public sendRoomMessage(roomId: string, message: ChatMessage) {
    this.send({
      type: 'room:message',
      roomId,
      message,
    });
  }

  public takeSeat(roomId: string, seatIndex: number, user: any) {
    this.send({
      type: 'room:seat_take',
      roomId,
      seatIndex,
      user,
    });
  }

  public leaveSeat(roomId: string, seatIndex: number, userId: string) {
    this.send({
      type: 'room:seat_leave',
      roomId,
      seatIndex,
      userId,
    });
  }

  public setSeatMute(roomId: string, seatIndex: number, isMuted: boolean) {
    this.send({
      type: 'room:seat_mute',
      roomId,
      seatIndex,
      isMuted,
    });
  }

  public lockAllRoomMics(roomId: string, isMuted: boolean, lockedByName: string) {
    this.send({
      type: 'room:lock_all_mics',
      roomId,
      isMuted,
      lockedByName,
    });
  }

  public sendVoiceChunk(roomId: string, senderId: string, senderName: string, seatIndex: number, audioData: string, audioLevel: number) {
    this.send({
      type: 'room:voice_chunk',
      roomId,
      senderId,
      senderName,
      seatIndex,
      audioData,
      audioLevel,
    });
  }

  public sendVoiceStop(roomId: string, seatIndex: number) {
    this.send({
      type: 'room:voice_stop',
      roomId,
      seatIndex,
    });
  }

  public sendReaction(roomId: string, emoji: string, senderName: string) {
    this.send({
      type: 'room:reaction',
      roomId,
      emoji,
      senderName,
    });
  }

  public sendGift(roomId: string, giftPayload: any) {
    this.send({
      type: 'room:gift',
      roomId,
      giftPayload,
    });
  }

  public sendPrivateMessage(message: PrivateMessage) {
    this.send({
      type: 'private:message',
      message,
    });
  }

  public broadcastRoomCreated(room: VoiceRoom) {
    this.send({
      type: 'room:create',
      room,
    });
  }

  public broadcastRoomDeleted(roomId: string) {
    this.send({
      type: 'room:delete',
      roomId,
    });
  }

  public broadcastRoomUpdated(room: VoiceRoom) {
    this.send({
      type: 'room:update',
      room,
    });
  }

  // Subscription management
  public onRoomsUpdate(listener: Listener<VoiceRoom[]>) {
    this.roomsUpdateListeners.add(listener);
    return () => this.roomsUpdateListeners.delete(listener);
  }

  public onRoomSync(listener: Listener<{ roomId: string; messages: ChatMessage[]; seats: VoiceSeat[]; room?: VoiceRoom }>) {
    this.roomSyncListeners.add(listener);
    return () => this.roomSyncListeners.delete(listener);
  }

  public onRoomMessage(listener: Listener<{ roomId: string; message: ChatMessage }>) {
    this.roomMessageListeners.add(listener);
    return () => this.roomMessageListeners.delete(listener);
  }

  public onSeatsUpdate(listener: Listener<{ roomId: string; seats: VoiceSeat[] }>) {
    this.seatsUpdateListeners.add(listener);
    return () => this.seatsUpdateListeners.delete(listener);
  }

  public onVoiceChunk(listener: Listener<VoiceChunkData>) {
    this.voiceChunkListeners.add(listener);
    return () => this.voiceChunkListeners.delete(listener);
  }

  public onVoiceStop(listener: Listener<{ roomId: string; seatIndex: number }>) {
    this.voiceStopListeners.add(listener);
    return () => this.voiceStopListeners.delete(listener);
  }

  public onReaction(listener: Listener<{ roomId: string; emoji: string; senderName: string }>) {
    this.reactionListeners.add(listener);
    return () => this.reactionListeners.delete(listener);
  }

  public onGift(listener: Listener<{ roomId: string; giftPayload: any }>) {
    this.giftListeners.add(listener);
    return () => this.giftListeners.delete(listener);
  }

  public onPrivateMessage(listener: Listener<PrivateMessage>) {
    this.privateMessageListeners.add(listener);
    return () => this.privateMessageListeners.delete(listener);
  }

  public onMicsLockState(listener: Listener<{ roomId: string; micsLocked: boolean; lockedByName: string; seats?: VoiceSeat[] }>) {
    this.micsLockListeners.add(listener);
    return () => this.micsLockListeners.delete(listener);
  }
}

export const socketService = new SocketService();
