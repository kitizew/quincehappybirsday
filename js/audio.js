// Web Audio API sound effects and music synthesizer
class SoundManager {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.isPlayingMusic = false;
        this.musicInterval = null;
        this.currentNoteIndex = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play a single synthesized tone with ADSR envelope
    playTone(freq, type = 'sine', duration = 0.3, volume = 0.2, delay = 0) {
        if (this.isMuted) return;
        this.init();

        const startTime = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.05);
    }

    // Balloon pop sound effect
    playPop() {
        if (this.isMuted) return;
        this.init();

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);

        // Add a burst of noise
        this.playNoise(0.06, 0.25);
    }

    // Gift Unbox Fanfare
    playFanfare() {
        if (this.isMuted) return;
        this.init();

        const notes = [
            { f: 523.25, d: 0.15 }, // C5
            { f: 659.25, d: 0.15 }, // E5
            { f: 783.99, d: 0.15 }, // G5
            { f: 1046.50, d: 0.45 } // C6
        ];

        let timeOffset = 0;
        notes.forEach((n) => {
            this.playTone(n.f, 'triangle', n.d, 0.25, timeOffset);
            this.playTone(n.f * 1.005, 'sine', n.d, 0.15, timeOffset);
            timeOffset += n.d * 0.85;
        });
    }

    // Candle blow whoosh sound
    playBlowSound() {
        if (this.isMuted) return;
        this.init();
        this.playNoise(0.5, 0.3, true);
    }

    // Scratch sound effect
    playScratch() {
        if (this.isMuted) return;
        this.init();
        this.playNoise(0.04, 0.1);
    }

    // Magic sparkle sound
    playSparkle() {
        if (this.isMuted) return;
        this.init();
        const freqs = [1200, 1500, 1800, 2200, 2600];
        freqs.forEach((f, i) => {
            this.playTone(f, 'sine', 0.15, 0.08, i * 0.04);
        });
    }

    // Countdown Beep
    playCountdownBeep(freq = 600, duration = 0.15) {
        if (this.isMuted) return;
        this.init();
        this.playTone(freq, 'sine', duration, 0.3);
    }

    // Grand Finale Mega Explosion Sound Effect
    playMegaExplosion() {
        if (this.isMuted) return;
        this.init();

        const now = this.ctx.currentTime;

        // 1. Sub-bass boom
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.6);

        // 2. Heavy Noise Blast
        this.playNoise(1.2, 0.6, true);

        // 3. Cascading fireworks pops
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.playPop();
            }, 200 + i * 140);
        }

        // 4. Grand celebratory fanfare
        setTimeout(() => {
            this.playFanfare();
        }, 800);
    }

    // Background Melodic "Happy Birthday" Theme Chiptune / Synth
    toggleMusic(onStateChange) {
        this.init();
        if (this.isPlayingMusic) {
            this.stopMusic();
            if (onStateChange) onStateChange(false);
        } else {
            this.startMusic();
            if (onStateChange) onStateChange(true);
        }
    }

    startMusic() {
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;

        // "Happy Birthday to You" notes and durations (in beats)
        // C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25, D5=587.33, Bb4=466.16
        const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23,
              G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25, D5 = 587.33;

        const melody = [
            { f: C4, d: 0.35, pause: 0.1 },
            { f: C4, d: 0.35, pause: 0.05 },
            { f: D4, d: 0.6, pause: 0.05 },
            { f: C4, d: 0.6, pause: 0.05 },
            { f: F4, d: 0.6, pause: 0.05 },
            { f: E4, d: 1.1, pause: 0.2 },

            { f: C4, d: 0.35, pause: 0.1 },
            { f: C4, d: 0.35, pause: 0.05 },
            { f: D4, d: 0.6, pause: 0.05 },
            { f: C4, d: 0.6, pause: 0.05 },
            { f: G4, d: 0.6, pause: 0.05 },
            { f: F4, d: 1.1, pause: 0.2 },

            { f: C4, d: 0.35, pause: 0.1 },
            { f: C4, d: 0.35, pause: 0.05 },
            { f: C5, d: 0.6, pause: 0.05 },
            { f: A4, d: 0.6, pause: 0.05 },
            { f: F4, d: 0.6, pause: 0.05 },
            { f: E4, d: 0.6, pause: 0.05 },
            { f: D4, d: 0.9, pause: 0.2 },

            { f: Bb4, d: 0.35, pause: 0.1 },
            { f: Bb4, d: 0.35, pause: 0.05 },
            { f: A4, d: 0.6, pause: 0.05 },
            { f: F4, d: 0.6, pause: 0.05 },
            { f: G4, d: 0.6, pause: 0.05 },
            { f: F4, d: 1.2, pause: 0.6 }
        ];

        let index = 0;
        const tempo = 1.1; // Speed multiplier

        const playNextNote = () => {
            if (!this.isPlayingMusic) return;
            const note = melody[index];
            const duration = note.d * tempo;
            const pause = note.pause * tempo;

            // Harmonized chime sound
            this.playTone(note.f, 'sine', duration, 0.18);
            this.playTone(note.f * 0.5, 'triangle', duration, 0.12); // Warm bass octave
            this.playTone(note.f * 2, 'sine', duration * 0.6, 0.05); // Sparkle overtone

            index = (index + 1) % melody.length;
            this.musicTimeout = setTimeout(playNextNote, (duration + pause) * 1000);
        };

        playNextNote();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        if (this.musicTimeout) {
            clearTimeout(this.musicTimeout);
            this.musicTimeout = null;
        }
    }
}

window.soundManager = new SoundManager();
