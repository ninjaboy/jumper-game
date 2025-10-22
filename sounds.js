class SoundManager {
    constructor() {
        // Initialize AudioContext (handle browser prefixes)
        this.audioContext = null;
        this.masterVolume = 0.3; // Default volume (0.0 to 1.0)
        this.sfxVolume = 1.0;
        this.musicVolume = 1.0;
        this.muted = false;

        // Initialize on first user interaction (browser requirement)
        this.initialized = false;
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

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
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
}
