// Web Audio API Synthesizer for Interactive Room Audio Effects

class SoundManager {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 🎲 Dice roll sound
  playDiceRoll() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200 + Math.random() * 300, now + i * 0.06);
      gain.gain.setValueAtTime(0.2, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.05);
    }
  }

  // 🌸 Gentle / Simple Gift Chime (< 10,000 coins)
  playGentleGiftChime() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.12, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.35);
    });
  }

  // ✨ Gift Shimmer sound
  playGiftMagic() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.18, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  // 🦁 Lion Roar Sound Effect
  playLionRoar() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Deep rumbling growl + roar
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(70, now + 1.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);

    // Regal triumph fanfare chord after roar
    const fanfare = [392, 523.25, 659.25, 783.99];
    fanfare.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, now + 0.5 + i * 0.08);
      g.gain.setValueAtTime(0.2, now + 0.5 + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.5 + i * 0.08 + 0.6);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now + 0.5 + i * 0.08);
      o.stop(now + 0.5 + i * 0.08 + 0.6);
    });
  }

  // 🏎️ Supercar / Rolls Royce Acceleration Rev
  playSupercarRev() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(70, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(140, now + 1.0);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.1);
  }

  // 🐉 Dragon Fire Breath & Chime
  playDragonFire() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // White noise / fiery swoosh
    for (let i = 0; i < 8; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150 + Math.random() * 200, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.2);
    }
  }

  // 🌌 Cosmic Galactic Chime (Whale & Planet)
  playCosmicChime() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 830.61, 987.77, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      gain.gain.setValueAtTime(0.18, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.8);
    });
  }

  // 🎆 Fireworks Explosion (Castle)
  playFireworks() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let burst = 0; burst < 3; burst++) {
      const time = now + burst * 0.35;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.25);
      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + 0.3);
    }
  }

  // 👏 Crowd Applause sound
  playApplause() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 15; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(80 + Math.random() * 200, now + i * 0.04);
      gain.gain.setValueAtTime(0.08, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.08);
    }
  }

  // 🚨 Warning Buzzer for Safety Moderation
  playWarningBuzzer() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(120, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // 🏆 Victory Chime
  playVictory() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const melody = [440, 554.37, 659.25, 880];
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.2, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.3);
    });
  }

  // 🚪 User Join / Room transition chime
  playJoin() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [329.63, 493.88]; // E4, B4
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }

  // 👑 VIP Luxurious Entrance Sounds (Levels 1 to 5)
  playVipEntrance(level: number) {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (level === 1) {
      // Crystal chime - Sapphire
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.1 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.6);
      });
    } else if (level === 2) {
      // Emerald Brass Fanfare
      const notes = [392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        gain.gain.setValueAtTime(0.22, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.45);
      });
    } else if (level === 3) {
      // Diamond Falcon soaring fanfare
      const melody = [587.33, 880, 1174.66, 1760];
      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.25, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.7);
      });
    } else if (level === 4) {
      // Supercar Rev & Imperial Roar
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(330, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.8);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.2);

      // Add horn/victory fanfare after the rev
      const melody = [440, 554.37, 659.25, 880];
      melody.forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.setValueAtTime(f, now + 0.6 + i * 0.1);
        g.gain.setValueAtTime(0.2, now + 0.6 + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.01, now + 0.6 + i * 0.1 + 0.5);
        o.connect(g);
        g.connect(ctx.destination);
        o.start(now + 0.6 + i * 0.1);
        o.stop(now + 0.6 + i * 0.1 + 0.5);
      });
    } else {
      // Cosmic Celestial - Royal Trumpets & Orchestral Symphony
      const chord = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.22, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 1.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 1.1);
      });
    }
  }

  // 🗣️ Speak text in Arabic using Browser Speech Synthesis if available
  speakArabic(text: string, onEnd?: () => void) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        if (onEnd) {
          utterance.onend = onEnd;
          utterance.onerror = onEnd;
        }
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis not allowed or supported', e);
        if (onEnd) onEnd();
      }
    } else {
      if (onEnd) onEnd();
    }
  }

  // 💬 Message sent 'whoosh/pop'
  playMessageSent() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  // 🔔 Message received chime
  playMessageReceived() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [659.25, 880]; // E5 to A5
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.1);
      gain.gain.setValueAtTime(0.18, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.25);
    });
  }

  // 🤝 Friend request accepted celebration
  playFriendAdded() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5]; // C major triad + octave
    chord.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.07);
      gain.gain.setValueAtTime(0.18, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.35);
    });
  }

  playFriendAccepted() {
    this.playFriendAdded();
  }

  playVoiceSent() {
    this.playMessageSent();
  }

  // 🔔 Gentle notification sound
  playNotice() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // 🎙️ Voice record start beep
  playVoiceRecordStart() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 🎶 Voice note synthesizer playback for devices without TTS
  playVoiceNoteTone(durationSeconds: number = 3, onFinish?: () => void) {
    const ctx = this.initCtx();
    if (!ctx) {
      if (onFinish) onFinish();
      return;
    }
    const now = ctx.currentTime;
    const steps = Math.floor(durationSeconds * 4);
    for (let i = 0; i < steps; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const freq = 220 + (Math.sin(i * 0.8) * 90) + Math.random() * 40;
      osc.frequency.setValueAtTime(freq, now + i * 0.25);
      gain.gain.setValueAtTime(0.12, now + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.25 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.22);
    }
    if (onFinish) {
      setTimeout(onFinish, durationSeconds * 1000);
    }
  }

  // 🏆 Level Up Fanfare
  playLevelUp() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Ascending victory chord: C4, E4, G4, C5, E5, G5, C6
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === freqs.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now + idx * 0.07);
      gain.gain.setValueAtTime(0.2, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + (idx === freqs.length - 1 ? 0.6 : 0.25));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + (idx === freqs.length - 1 ? 0.6 : 0.25));
    });
  }

  // ⚡ Zeus Imperial Thunder & Lightning
  playThunder() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Initial sharp lightning crackle (white-noise-like rapid bursts)
    for (let i = 0; i < 12; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400 + Math.random() * 800, now + i * 0.02);
      gain.gain.setValueAtTime(0.3, now + i * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.02 + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.02);
      osc.stop(now + i * 0.02 + 0.04);
    }

    // Heavy rolling thunder rumble (deep low frequencies)
    const rumble = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumble.type = 'triangle';
    rumble.frequency.setValueAtTime(80, now + 0.1);
    rumble.frequency.exponentialRampToValueAtTime(35, now + 1.8);
    rumbleGain.gain.setValueAtTime(0.4, now + 0.1);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    rumble.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumble.start(now + 0.1);
    rumble.stop(now + 1.8);
  }

  // 🌌 TikTok / Yalla Universe Supreme Fanfare
  playUniverseFanfare() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Cosmic ascending scale
    const universeMelody = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    universeMelody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.6);
    });

    // Grand majestic synth chords
    const chord = [523.25, 659.25, 783.99, 1046.5];
    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.7);
      gain.gain.setValueAtTime(0.25, now + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.7);
      osc.stop(now + 2.2);
    });
  }

  // ⭐ TikTok Stars Cosmic Swirl & Arpeggio
  playEpicStars() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const arpeggio = [587.33, 739.99, 880, 1174.66, 1479.98, 1760];
    arpeggio.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.15, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }

  // 💎 Treasure Box Unlocking & Cascading Gold Coins
  playTreasureChest() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Key click & chest lid open creak
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(600, now);
    clickGain.gain.setValueAtTime(0.2, now);
    clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start(now);
    click.stop(now + 0.08);

    // Shower of coins chiming (bright metallic ping bursts)
    const coinPitches = [1200, 1400, 1600, 1800, 2000, 2200, 1750, 1950, 2300, 2600];
    coinPitches.forEach((p, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(p, now + 0.15 + idx * 0.06);
      gain.gain.setValueAtTime(0.15, now + 0.15 + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + idx * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.15 + idx * 0.06);
      osc.stop(now + 0.15 + idx * 0.06 + 0.35);
    });
  }

  // 🦍 Giant Gorilla Chest Thumps & Roar
  playGorillaRoar() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 4 heavy chest thump sub-bass booms
    [0, 0.2, 0.4, 0.6].forEach((t) => {
      const thump = ctx.createOscillator();
      const thumpGain = ctx.createGain();
      thump.type = 'sine';
      thump.frequency.setValueAtTime(120, now + t);
      thump.frequency.exponentialRampToValueAtTime(45, now + t + 0.15);
      thumpGain.gain.setValueAtTime(0.4, now + t);
      thumpGain.gain.exponentialRampToValueAtTime(0.01, now + t + 0.18);
      thump.connect(thumpGain);
      thumpGain.connect(ctx.destination);
      thump.start(now + t);
      thump.stop(now + t + 0.18);
    });

    // Deep mountain roar
    const roar = ctx.createOscillator();
    const roarGain = ctx.createGain();
    roar.type = 'sawtooth';
    roar.frequency.setValueAtTime(80, now + 0.8);
    roar.frequency.exponentialRampToValueAtTime(140, now + 1.2);
    roar.frequency.exponentialRampToValueAtTime(50, now + 2.0);
    roarGain.gain.setValueAtTime(0.35, now + 0.8);
    roarGain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
    roar.connect(roarGain);
    roarGain.connect(ctx.destination);
    roar.start(now + 0.8);
    roar.stop(now + 2.0);
  }

  // 💥 Superhero Fight Clash & Laser Shockwave
  playSuperheroClash() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Laser swoosh
    const laser = ctx.createOscillator();
    const laserGain = ctx.createGain();
    laser.type = 'sawtooth';
    laser.frequency.setValueAtTime(850, now);
    laser.frequency.exponentialRampToValueAtTime(150, now + 0.25);
    laserGain.gain.setValueAtTime(0.3, now);
    laserGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    laser.connect(laserGain);
    laserGain.connect(ctx.destination);
    laser.start(now);
    laser.stop(now + 0.25);

    // Clash impact explosion
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = 'triangle';
    boom.frequency.setValueAtTime(220, now + 0.22);
    boom.frequency.exponentialRampToValueAtTime(40, now + 0.9);
    boomGain.gain.setValueAtTime(0.4, now + 0.22);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    boom.connect(boomGain);
    boomGain.connect(ctx.destination);
    boom.start(now + 0.22);
    boom.stop(now + 0.9);
  }

  // 🐋 Whale & Ocean Waves Song
  playWhaleOceanSong() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Smooth ethereal whale vocal tone glides
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.6);
    osc.frequency.exponentialRampToValueAtTime(320, now + 1.2);
    osc.frequency.exponentialRampToValueAtTime(440, now + 1.8);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 2.0);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 2.0);

    // Sparkle splash
    const splash = [600, 800, 1000, 1200];
    splash.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(f, now + 0.5 + i * 0.08);
      g.gain.setValueAtTime(0.12, now + 0.5 + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + i * 0.08 + 0.4);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now + 0.5 + i * 0.08);
      o.stop(now + 0.5 + i * 0.08 + 0.4);
    });
  }

  // 🎯 Cupid Love Arrow Hit Bulls-Eye
  playCupidArrowHit() {
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Arrow whistle
    const arrow = ctx.createOscillator();
    const arrowGain = ctx.createGain();
    arrow.type = 'sine';
    arrow.frequency.setValueAtTime(400, now);
    arrow.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    arrowGain.gain.setValueAtTime(0.2, now);
    arrowGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    arrow.connect(arrowGain);
    arrowGain.connect(ctx.destination);
    arrow.start(now);
    arrow.stop(now + 0.16);

    // Heart chime impact
    const chord = [659.25, 830.61, 987.77, 1318.51];
    chord.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.16 + i * 0.05);
      gain.gain.setValueAtTime(0.18, now + 0.16 + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16 + i * 0.05 + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + 0.16 + i * 0.05);
      osc.stop(now + 0.16 + i * 0.05 + 0.6);
    });
  }
}

export const sounds = new SoundManager();
