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
     * Enhanced multi-layered composition with melody, harmony, and bass
     */
    playMusicLoop() {
        if (!this.musicPlaying || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const beatDuration = 0.35; // Duration of one beat

        // === CHORD PROGRESSION ===
        // I - V - vi - IV (C - G - Am - F) - classic pop progression
        const chordProgression = [
            { root: 261.63, notes: [261.63, 329.63, 392.00], duration: beatDuration * 4 }, // C major (C-E-G)
            { root: 196.00, notes: [196.00, 246.94, 293.66], duration: beatDuration * 4 }, // G major (G-B-D)
            { root: 220.00, notes: [220.00, 261.63, 329.63], duration: beatDuration * 4 }, // A minor (A-C-E)
            { root: 174.61, notes: [174.61, 220.00, 261.63], duration: beatDuration * 4 }, // F major (F-A-C)
        ];

        // === MELODY ===
        // Section A: Uplifting melodic phrase
        const melodyA = [
            { freq: 523.25, duration: beatDuration * 0.75 },    // C5
            { freq: 587.33, duration: beatDuration * 0.75 },    // D5
            { freq: 659.25, duration: beatDuration * 0.5 },     // E5
            { freq: 523.25, duration: beatDuration * 1 },       // C5
            { freq: 659.25, duration: beatDuration * 0.75 },    // E5
            { freq: 783.99, duration: beatDuration * 0.75 },    // G5
            { freq: 659.25, duration: beatDuration * 0.5 },     // E5
            { freq: 587.33, duration: beatDuration * 2 },       // D5 (hold)

            { freq: 587.33, duration: beatDuration * 0.75 },    // D5
            { freq: 659.25, duration: beatDuration * 0.75 },    // E5
            { freq: 587.33, duration: beatDuration * 0.5 },     // D5
            { freq: 523.25, duration: beatDuration * 1 },       // C5
            { freq: 440.00, duration: beatDuration * 1 },       // A4
            { freq: 523.25, duration: beatDuration * 1 },       // C5
            { freq: 587.33, duration: beatDuration * 1 },       // D5
            { freq: 523.25, duration: beatDuration * 2 },       // C5 (hold)
        ];

        // Section B: Contrasting bridge phrase
        const melodyB = [
            { freq: 659.25, duration: beatDuration * 1 },       // E5
            { freq: 783.99, duration: beatDuration * 1 },       // G5
            { freq: 880.00, duration: beatDuration * 1 },       // A5
            { freq: 783.99, duration: beatDuration * 1 },       // G5
            { freq: 659.25, duration: beatDuration * 1 },       // E5
            { freq: 587.33, duration: beatDuration * 1 },       // D5
            { freq: 523.25, duration: beatDuration * 1 },       // C5
            { freq: 587.33, duration: beatDuration * 1 },       // D5

            { freq: 659.25, duration: beatDuration * 0.75 },    // E5
            { freq: 587.33, duration: beatDuration * 0.75 },    // D5
            { freq: 523.25, duration: beatDuration * 0.5 },     // C5
            { freq: 440.00, duration: beatDuration * 1 },       // A4
            { freq: 523.25, duration: beatDuration * 1.5 },     // C5
            { freq: 587.33, duration: beatDuration * 1.5 },     // D5
            { freq: 523.25, duration: beatDuration * 2 },       // C5 (hold)
        ];

        // Alternate between sections: A-A-B-A pattern
        if (!this.musicSection) this.musicSection = 0;
        const sections = ['A', 'A', 'B', 'A'];
        const currentSection = sections[this.musicSection % sections.length];
        const melody = currentSection === 'A' ? melodyA : melodyB;
        this.musicSection++;

        let melodyStartTime = now;
        let harmonyStartTime = now;
        let bassStartTime = now;

        // === PLAY MELODY (Lead) ===
        melody.forEach((note) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'triangle'; // Triangle for softer, warmer lead
            oscillator.frequency.value = note.freq;

            // Soft envelope for smooth melody
            const volume = this.getMusicVolume() * 0.15;
            gainNode.gain.setValueAtTime(0, melodyStartTime);
            gainNode.gain.linearRampToValueAtTime(volume, melodyStartTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(volume * 0.8, melodyStartTime + note.duration - 0.05);
            gainNode.gain.linearRampToValueAtTime(0.01, melodyStartTime + note.duration);

            oscillator.start(melodyStartTime);
            oscillator.stop(melodyStartTime + note.duration);

            melodyStartTime += note.duration;
        });

        // === PLAY HARMONY (Arpeggiated Chords) ===
        chordProgression.forEach((chord) => {
            // Arpeggiate each chord (play notes in sequence)
            const arpDuration = chord.duration / (chord.notes.length * 2); // Each note gets a fraction of chord duration

            for (let i = 0; i < 2; i++) { // Play arpeggio twice per chord
                chord.notes.forEach((freq) => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);

                    oscillator.type = 'sine'; // Sine for clean harmony
                    oscillator.frequency.value = freq;

                    // Gentle envelope
                    const volume = this.getMusicVolume() * 0.08; // Quieter than melody
                    gainNode.gain.setValueAtTime(0, harmonyStartTime);
                    gainNode.gain.linearRampToValueAtTime(volume, harmonyStartTime + 0.02);
                    gainNode.gain.linearRampToValueAtTime(0.01, harmonyStartTime + arpDuration);

                    oscillator.start(harmonyStartTime);
                    oscillator.stop(harmonyStartTime + arpDuration);

                    harmonyStartTime += arpDuration;
                });
            }
        });

        // === PLAY BASS LINE ===
        chordProgression.forEach((chord) => {
            // Play root note as bass
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sawtooth'; // Sawtooth for rich bass
            oscillator.frequency.value = chord.root / 2; // Octave lower

            // Bass envelope - punchy attack
            const volume = this.getMusicVolume() * 0.12;
            gainNode.gain.setValueAtTime(volume, bassStartTime);
            gainNode.gain.exponentialRampToValueAtTime(volume * 0.3, bassStartTime + chord.duration * 0.9);
            gainNode.gain.linearRampToValueAtTime(0.01, bassStartTime + chord.duration);

            oscillator.start(bassStartTime);
            oscillator.stop(bassStartTime + chord.duration);

            bassStartTime += chord.duration;
        });

        // === ADD SUBTLE PERCUSSION (Hi-hat pattern) ===
        for (let i = 0; i < 16; i++) { // 16 beats
            const hitTime = now + (i * beatDuration);

            // Create short noise burst for hi-hat
            const bufferSize = this.audioContext.sampleRate * 0.05;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);

            for (let j = 0; j < bufferSize; j++) {
                data[j] = Math.random() * 2 - 1;
            }

            const noise = this.audioContext.createBufferSource();
            noise.buffer = buffer;

            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 6000; // High frequency for hi-hat

            const gainNode = this.audioContext.createGain();

            noise.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Accent on beats 1 and 3 (stronger), softer on 2 and 4
            const isAccent = (i % 4 === 0 || i % 4 === 2);
            const volume = this.getMusicVolume() * (isAccent ? 0.06 : 0.03);

            gainNode.gain.setValueAtTime(volume, hitTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, hitTime + 0.05);

            noise.start(hitTime);
        }

        // Calculate total duration and schedule next loop
        const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);

        if (this.musicPlaying) {
            setTimeout(() => this.playMusicLoop(), totalDuration * 1000);
        }
    }
}
