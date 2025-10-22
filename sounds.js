class SoundManager {
    constructor() {
        // Initialize AudioContext (handle browser prefixes)
        this.audioContext = null;
        this.masterVolume = 0.3; // Default volume (0.0 to 1.0)
        this.sfxVolume = 1.0;
        this.musicVolume = 0.4; // Background music slightly quieter
        this.muted = false;

        // Initialize on first user interaction (browser requirement)
        this.initialized = false;

        // Background music state
        this.backgroundMusic = null;
        this.musicPlaying = false;

        // Ambient sound state (for proximity-based sounds)
        this.ambientSounds = new Map(); // hazardId -> {oscillator, gainNode, currentVolume}
    }

    // Initialize AudioContext (must be called after user interaction)
    init() {
        if (this.initialized) return;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.initialized = true;
            console.log('SoundManager initialized successfully');
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    // Ensure AudioContext is ready
    ensureContext() {
        if (!this.initialized) {
            this.init();
        }

        // Resume context if it's suspended (browser autoplay policy)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Get effective volume (considering master volume, SFX volume, and mute)
    getVolume() {
        if (this.muted || !this.initialized) return 0;
        return this.masterVolume * this.sfxVolume;
    }

    // Get music volume
    getMusicVolume() {
        if (this.muted || !this.initialized) return 0;
        return this.masterVolume * this.musicVolume;
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;

        // When muting, also stop all ambient sounds
        if (this.muted) {
            this.stopAllAmbient();
        }

        return this.muted;
    }

    // Set master volume (0.0 to 1.0)
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    // === SOUND EFFECTS ===

    /**
     * Play jump sound - rising pitch sweep for upward motion feel
     * Creates a pleasant "boing" effect with sine wave
     */
    playJump() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.1; // 100ms

        // Create oscillator for the tone
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        // Connect nodes: oscillator -> gain -> destination
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Use sine wave for smooth, pleasant sound
        oscillator.type = 'sine';

        // Frequency sweep: 200Hz -> 600Hz (rising pitch = going up!)
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(600, now + duration);

        // Volume envelope: quick fade out to avoid clicks
        const volume = this.getVolume() * 0.2; // Jump is relatively quiet
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        // Play the sound
        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play landing sound - low frequency thud
     * Creates impact feeling with short burst
     */
    playLand() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.08; // 80ms - quick thud

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Use triangle wave for slightly harder edge
        oscillator.type = 'triangle';

        // Low frequency thud: 100Hz -> 40Hz (descending)
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.exponentialRampToValueAtTime(40, now + duration);

        // Quick attack, fast decay
        const volume = this.getVolume() * 0.15;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play death sound - descending pitch with noise
     * Creates a "falling" or "dying" effect
     */
    playDeath() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.5; // 500ms - longer for dramatic effect

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Use sawtooth for harsher sound
        oscillator.type = 'sawtooth';

        // Descending pitch: 400Hz -> 50Hz
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + duration);

        // Volume envelope
        const volume = this.getVolume() * 0.25;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play collect/pickup sound - ascending arpeggio
     * Creates positive reinforcement with pleasant tones
     */
    playCollect() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Play a quick 3-note ascending arpeggio
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (C major chord)
        const noteLength = 0.08;

        notes.forEach((freq, index) => {
            const startTime = now + (index * noteLength);

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, startTime);

            // Quick envelope
            const volume = this.getVolume() * 0.2;
            gainNode.gain.setValueAtTime(volume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteLength);

            oscillator.start(startTime);
            oscillator.stop(startTime + noteLength);
        });
    }

    /**
     * Play victory sound - triumphant fanfare
     * Longer, more complex sound for level completion
     */
    playVictory() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Play a victory fanfare: C5 -> E5 -> G5 -> C6
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C major scale up
        const noteLength = 0.15;

        notes.forEach((freq, index) => {
            const startTime = now + (index * noteLength * 0.8); // Slight overlap

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, startTime);

            const volume = this.getVolume() * 0.25;
            gainNode.gain.setValueAtTime(volume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteLength);

            oscillator.start(startTime);
            oscillator.stop(startTime + noteLength);
        });
    }

    /**
     * Play spring bounce sound - boing!
     * Quick frequency wobble for spring platform
     */
    playSpring() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.15;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.type = 'sine';

        // Create "boing" effect with frequency modulation
        // Quick rise then fall: 300Hz -> 800Hz -> 400Hz
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(800, now + duration * 0.3);
        oscillator.frequency.exponentialRampToValueAtTime(400, now + duration);

        const volume = this.getVolume() * 0.25;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Play saw blade hit sound - metallic grinding
     */
    playSawHit() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.2;

        // Use white noise for metallic grinding effect
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate white noise
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000; // High frequency for metallic sound

        const gainNode = this.audioContext.createGain();

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const volume = this.getVolume() * 0.3;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.start(now);
        noise.stop(now + duration);
    }

    /**
     * Play lava sizzle sound - bubbling/burning effect
     */
    playLavaSizzle() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.3;

        // Create bubbling effect with filtered noise
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800; // Lower frequency for bubbling

        const gainNode = this.audioContext.createGain();

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const volume = this.getVolume() * 0.25;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.start(now);
        noise.stop(now + duration);
    }

    /**
     * Play poison cloud hiss - toxic gas effect
     */
    playPoisonHiss() {
        this.ensureContext();
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.25;

        // Use pink noise for softer hiss
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Generate pink noise (softer than white)
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99765 * b0 + white * 0.0990460;
            b1 = 0.96300 * b1 + white * 0.2965164;
            b2 = 0.57000 * b2 + white * 1.0526913;
            data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.11;
        }

        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;

        const gainNode = this.audioContext.createGain();

        noise.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        const volume = this.getVolume() * 0.2;
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

        noise.start(now);
        noise.stop(now + duration);
    }

    // === AMBIENT SOUNDS ===

    /**
     * Start or update ambient hazard sound based on proximity
     * @param {string} hazardId - Unique identifier for the hazard
     * @param {string} hazardType - Type of hazard ('saw', 'lava', 'poison')
     * @param {number} proximity - Distance factor (0.0 = far, 1.0 = very close)
     */
    updateAmbientHazard(hazardId, hazardType, proximity) {
        this.ensureContext();
        if (!this.audioContext) return;

        // If proximity is too low, stop the sound
        if (proximity < 0.01) {
            this.stopAmbientHazard(hazardId);
            return;
        }

        // Check if this hazard already has an ambient sound
        if (!this.ambientSounds.has(hazardId)) {
            // Create new ambient sound
            this.startAmbientHazard(hazardId, hazardType);
        }

        // Update volume based on proximity
        const ambient = this.ambientSounds.get(hazardId);
        if (ambient && ambient.gainNode) {
            try {
                const targetVolume = proximity * this.getVolume() * 0.15; // Quiet ambient
                ambient.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
                ambient.gainNode.gain.linearRampToValueAtTime(
                    targetVolume,
                    this.audioContext.currentTime + 0.1
                );
            } catch (e) {
                // Gain node might be disconnected, remove from map
                this.ambientSounds.delete(hazardId);
            }
        }
    }

    /**
     * Start ambient sound for a hazard
     */
    startAmbientHazard(hazardId, hazardType) {
        this.ensureContext();
        if (!this.audioContext) return;

        let oscillator, gainNode;

        switch (hazardType) {
            case 'saw':
                // Grinding/whirring sound
                oscillator = this.audioContext.createOscillator();
                oscillator.type = 'sawtooth';
                oscillator.frequency.value = 120 + Math.random() * 40;
                break;

            case 'lava':
                // Low bubbling rumble
                oscillator = this.audioContext.createOscillator();
                oscillator.type = 'triangle';
                oscillator.frequency.value = 60 + Math.random() * 20;
                break;

            case 'poison':
                // High pitched hiss
                oscillator = this.audioContext.createOscillator();
                oscillator.type = 'sine';
                oscillator.frequency.value = 400 + Math.random() * 200;
                break;

            default:
                return;
        }

        gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0; // Start silent

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();

        this.ambientSounds.set(hazardId, {
            oscillator,
            gainNode,
            type: hazardType
        });
    }

    /**
     * Stop ambient sound for a hazard
     */
    stopAmbientHazard(hazardId) {
        if (!this.ambientSounds.has(hazardId)) return;

        const ambient = this.ambientSounds.get(hazardId);

        // Immediately remove from map to prevent re-entry
        this.ambientSounds.delete(hazardId);

        // Fade out before stopping
        if (ambient.gainNode && this.audioContext) {
            try {
                ambient.gainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
                ambient.gainNode.gain.linearRampToValueAtTime(
                    0.01,
                    this.audioContext.currentTime + 0.2
                );
            } catch (e) {
                // Gain node might be disconnected, just continue
            }

            setTimeout(() => {
                if (ambient.oscillator) {
                    try {
                        ambient.oscillator.stop();
                        ambient.oscillator.disconnect();
                    } catch (e) {
                        // Oscillator might already be stopped
                    }
                }
                if (ambient.gainNode) {
                    try {
                        ambient.gainNode.disconnect();
                    } catch (e) {
                        // Already disconnected
                    }
                }
            }, 250);
        }
    }

    /**
     * Stop all ambient sounds
     */
    stopAllAmbient() {
        for (let [hazardId] of this.ambientSounds) {
            this.stopAmbientHazard(hazardId);
        }
    }

    // === BACKGROUND MUSIC ===

    /**
     * Start background music - simple looping melody
     */
    startBackgroundMusic() {
        this.ensureContext();
        if (!this.audioContext || this.musicPlaying) return;

        this.musicPlaying = true;
        this.playMusicLoop();
    }

    /**
     * Stop background music
     */
    stopBackgroundMusic() {
        this.musicPlaying = false;
        // Music will naturally stop after current loop
    }

    /**
     * Play a looping melody for background music
     */
    playMusicLoop() {
        if (!this.musicPlaying || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // Simple melody - ambient platformer tune
        // C major scale melody: C - E - G - A - G - F - E - D
        const melody = [
            { freq: 261.63, duration: 0.4 }, // C4
            { freq: 329.63, duration: 0.4 }, // E4
            { freq: 392.00, duration: 0.4 }, // G4
            { freq: 440.00, duration: 0.6 }, // A4 (longer)
            { freq: 392.00, duration: 0.4 }, // G4
            { freq: 349.23, duration: 0.4 }, // F4
            { freq: 329.63, duration: 0.4 }, // E4
            { freq: 293.66, duration: 0.6 }, // D4 (longer)
        ];

        let startTime = now;

        melody.forEach((note) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.value = note.freq;

            // Soft envelope
            const volume = this.getMusicVolume() * 0.12; // Very quiet
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + note.duration - 0.05);
            gainNode.gain.linearRampToValueAtTime(0.01, startTime + note.duration);

            oscillator.start(startTime);
            oscillator.stop(startTime + note.duration);

            startTime += note.duration;
        });

        // Calculate total melody duration and schedule next loop
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);

        if (this.musicPlaying) {
            setTimeout(() => this.playMusicLoop(), totalDuration * 1000);
        }
    }
}
