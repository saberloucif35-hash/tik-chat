import { socketService } from './socketService';

class RealtimeVoiceService {
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private isCapturing = false;
  private currentRoomId: string | null = null;
  private currentSeatIndex: number | null = null;
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  private animFrameId: number | null = null;

  // Audio Playback queue for incoming voice streams
  private playbackContext: AudioContext | null = null;
  private speakingListeners: Set<(seatIndex: number, audioLevel: number, isSpeaking: boolean) => void> = new Set();
  private cleanupVoiceChunkSub: (() => void) | null = null;
  private cleanupVoiceStopSub: (() => void) | null = null;

  constructor() {
    this.initIncomingAudioListener();
  }

  private initIncomingAudioListener() {
    if (typeof window === 'undefined') return;

    this.cleanupVoiceChunkSub = socketService.onVoiceChunk((data) => {
      // Don't play own voice
      if (this.currentUserId && data.senderId === this.currentUserId) return;

      this.playAudioChunk(data.audioData);
      this.notifySpeaking(data.seatIndex, data.audioLevel, data.audioLevel > 5);
    });

    this.cleanupVoiceStopSub = socketService.onVoiceStop((data) => {
      this.notifySpeaking(data.seatIndex, 0, false);
    });
  }

  private getPlaybackContext(): AudioContext {
    if (!this.playbackContext || this.playbackContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.playbackContext = new AudioCtx();
    }
    if (this.playbackContext.state === 'suspended') {
      this.playbackContext.resume().catch(() => {});
    }
    return this.playbackContext;
  }

  // Play audio chunk safely across different networks & devices
  private async playAudioChunk(base64Data: string) {
    try {
      const audioCtx = this.getPlaybackContext();
      // Decode base64 to arraybuffer
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Try decoding audio data
      try {
        const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      } catch {
        // Fallback: HTML5 Audio element with Blob URL
        const blob = new Blob([bytes], { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.volume = 1.0;
        audio.play()
          .then(() => {
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          })
          .catch(() => {
            URL.revokeObjectURL(url);
          });
      }
    } catch (err) {
      console.warn('[RealtimeVoice] Audio playback failed', err);
    }
  }

  // Start broadcasting microphone voice to the room
  public async startBroadcasting(
    roomId: string,
    seatIndex: number,
    userId: string,
    userName: string
  ): Promise<boolean> {
    if (this.isCapturing) {
      this.stopBroadcasting();
    }

    this.currentRoomId = roomId;
    this.currentSeatIndex = seatIndex;
    this.currentUserId = userId;
    this.currentUserName = userName;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaStream = stream;
      this.isCapturing = true;

      // Setup audio level analyzer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      // Start volume level loop
      this.monitorAudioLevel();

      // Setup MediaRecorder for streaming audio chunks
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0 && this.isCapturing && this.currentRoomId !== null) {
          const buffer = await e.data.arrayBuffer();
          // Convert arrayBuffer to base64
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const chunkLen = bytes.byteLength;
          for (let i = 0; i < chunkLen; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = window.btoa(binary);

          const level = this.getAudioLevel();
          socketService.sendVoiceChunk(
            this.currentRoomId,
            userId,
            userName,
            seatIndex,
            base64,
            level
          );
        }
      };

      // Emit chunk every 350ms for low-latency live audio
      this.mediaRecorder.start(350);
      return true;
    } catch (err) {
      console.warn('[RealtimeVoice] Could not access microphone:', err);
      this.isCapturing = false;
      return false;
    }
  }

  // Calculate volume level from AnalyserNode
  private getAudioLevel(): number {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    // Map 0-255 to 0-100
    return Math.min(100, Math.round((avg / 128) * 100));
  }

  private monitorAudioLevel() {
    if (!this.isCapturing) return;

    const level = this.getAudioLevel();
    if (this.currentSeatIndex !== null) {
      this.notifySpeaking(this.currentSeatIndex, level, level > 8);
    }

    this.animFrameId = requestAnimationFrame(() => this.monitorAudioLevel());
  }

  // Stop broadcasting
  public stopBroadcasting() {
    this.isCapturing = false;

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    if (this.currentRoomId && this.currentSeatIndex !== null) {
      socketService.sendVoiceStop(this.currentRoomId, this.currentSeatIndex);
      this.notifySpeaking(this.currentSeatIndex, 0, false);
    }

    this.currentRoomId = null;
    this.currentSeatIndex = null;
  }

  // Listener for speaking visual effects
  public onSpeakingChange(listener: (seatIndex: number, audioLevel: number, isSpeaking: boolean) => void) {
    this.speakingListeners.add(listener);
    return () => this.speakingListeners.delete(listener);
  }

  private notifySpeaking(seatIndex: number, audioLevel: number, isSpeaking: boolean) {
    this.speakingListeners.forEach((fn) => fn(seatIndex, audioLevel, isSpeaking));
  }
}

export const realtimeVoiceService = new RealtimeVoiceService();
