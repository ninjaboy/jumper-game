class Game {
    constructor() {
        // Version tracking
        this.version = '2.7.0';
        // Full changelog available in changelog.js - check start menu!

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Initialize sound system
        this.soundManager = new SoundManager();

        this.physics = new Physics();
        this.currentSeed = null;
        this.currentLevel = 1;
        this.currentBias = 'normal';
        this.platforms = new PlatformManager(null, this.currentBias, this.currentLevel, this.soundManager);
        this.consumables = new ConsumableManager(this.soundManager);
        // Center player on tower (centerX = 400, player width ~30)
        this.player = new Player(385, this.physics.groundLevel - 40, this.soundManager);

        // Spawn initial consumables (tower width = 800)
        this.consumables.spawnRandomConsumables(800, this.platforms.rng, this.player, this.platforms.platforms);

        this.updateSeedDisplay();
        
        // Camera system for vertical climbing
        this.camera = {
            x: 0,
            y: 0,
            followPlayer: true,
            levelWidth: 800 // Tower width for vertical levels
        };
        
        // Game state
        this.gameState = 'start_screen'; // 'start_screen', 'settings', 'playing', 'paused', 'finished', 'game_over', 'feedback'
        this.isPaused = false;

        // Feedback system - now using HTML overlay
        this.feedbackOverlay = document.getElementById('feedbackOverlay');
        this.feedbackTextarea = document.getElementById('feedbackText');
        this.feedbackStats = document.getElementById('feedbackStats');
        this.feedbackStatus = document.getElementById('feedbackStatus');
        this.feedbackButtons = document.getElementById('feedbackButtons');

        // Setup feedback event listeners
        this.setupFeedbackListeners();

        // Start screen and menu system
        this.selectedMenuItem = 0;
        this.menuItems = ['Start Game', 'Changelog', 'Settings', 'Submit Feedback'];
        this.settingsVisible = false;
        this.changelogVisible = false;
        this.changelogScroll = 0;
        this.changelogMaxScroll = 0;

        // Pause menu system
        this.pauseMenuItems = ['Resume', 'Settings', 'Restart', 'Quit to Menu'];
        this.selectedPauseMenuItem = 0;

        // Settings system
        this.settings = {
            // Audio settings
            masterVolume: 1.0,
            musicVolume: 1.0,
            sfxVolume: 1.0,

            // Visual settings
            retroMode: false,
            pixelSize: 4, // How many screen pixels = 1 game pixel (higher = more pixelated)
            scanlines: true,
            colorPalette: 'normal', // 'normal', 'gameboy', 'crt'

            // Rendering
            showFPS: false
        };

        // Settings menu state
        this.settingsMenuItems = [
            { name: 'Master Volume', type: 'slider', key: 'masterVolume', min: 0, max: 1, step: 0.1 },
            { name: 'Music Volume', type: 'slider', key: 'musicVolume', min: 0, max: 1, step: 0.1 },
            { name: 'SFX Volume', type: 'slider', key: 'sfxVolume', min: 0, max: 1, step: 0.1 },
            { name: 'Retro Mode', type: 'toggle', key: 'retroMode' },
            { name: 'Pixel Size', type: 'slider', key: 'pixelSize', min: 1, max: 8, step: 1 },
            { name: 'Scanlines', type: 'toggle', key: 'scanlines' },
            { name: 'Color Palette', type: 'cycle', key: 'colorPalette', values: ['normal', 'gameboy', 'crt'] },
            { name: 'Show FPS', type: 'toggle', key: 'showFPS' },
            { name: 'Back', type: 'button' }
        ];
        this.selectedSettingsItem = 0;

        // Retro mode rendering buffers
        this.retroCanvas = null;
        this.retroCtx = null;
        
        // Logo animation system
        this.logoAnimationTimer = 0;
        this.logoGlitchTimer = 0;
        this.logoParticles = [];
        this.maxLogoParticles = 50;

        // Victory celebration system
        this.victoryParticles = [];
        this.victoryTimer = 0;

        // Narrative message system (PKD-inspired)
        this.narrativeMessage = null; // Current message being displayed
        this.narrativeTimer = 0; // Display duration
        this.narrativeMaxDuration = 180; // 3 seconds at 60fps (short, non-distracting)
        this.totalDeaths = 0; // Track deaths across all levels
        this.totalConsumables = 0; // Track total consumables collected
        this.maxHeightReached = 0; // Track max height for triggers

        this.lastTime = 0;
        this.isRunning = false;

        this.setupEventListeners();
        this.setupPhysicsControls();
        this.setupJumpModes();
        this.setupLevelControls();
    }

    setupEventListeners() {
        // Initialize sound on first user interaction and start background music
        document.addEventListener('keydown', () => {
            this.soundManager.init();
            this.soundManager.startBackgroundMusic();
        }, { once: true });

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            // Don't trigger game controls if user is typing in an input field
            const isTypingInElement = e.target.tagName === 'INPUT' ||
                                     e.target.tagName === 'TEXTAREA' ||
                                     e.target.isContentEditable;

            // Feedback screen has its own text input handling
            const isFeedbackScreen = this.gameState === 'feedback';

            // Allow M and B keys without preventDefault for audio controls
            const isAudioControl = e.code === 'KeyM' || e.code === 'KeyB';
            if (!isAudioControl && !isTypingInElement && !isFeedbackScreen) {
                e.preventDefault();
            }

            // Don't trigger audio controls if user is typing
            if (isTypingInElement || isFeedbackScreen) {
                // In feedback screen, let the feedback handler deal with input
                if (isFeedbackScreen) {
                    // Skip to feedback handler below
                } else {
                    return;
                }
            } else {
                // Global audio controls (work in any state except feedback)
                if (e.code === 'KeyM') {
                    // Toggle mute
                    const muted = this.soundManager.toggleMute();
                    console.log(`Audio ${muted ? 'muted' : 'unmuted'}`);
                    return;
                } else if (e.code === 'KeyB') {
                    // Toggle background music
                    if (this.soundManager.musicPlaying) {
                        this.soundManager.stopBackgroundMusic();
                        console.log('Background music stopped');
                    } else {
                        this.soundManager.startBackgroundMusic();
                        console.log('Background music started');
                    }
                    return;
                }
            }

            // Handle start screen navigation
            if (this.gameState === 'start_screen') {
                // Handle changelog viewing
                if (this.changelogVisible) {
                    if (e.code === 'KeyB' || e.code === 'Escape' || e.code === 'Backspace') {
                        this.changelogVisible = false;
                    } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                        this.changelogScroll = Math.max(0, this.changelogScroll - 1);
                    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                        this.changelogScroll = Math.min(this.changelogMaxScroll, this.changelogScroll + 1);
                    }
                    return;
                }

                // Handle menu navigation
                if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                    this.selectedMenuItem = Math.max(0, this.selectedMenuItem - 1);
                } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                    this.selectedMenuItem = Math.min(this.menuItems.length - 1, this.selectedMenuItem + 1);
                } else if (e.code === 'Space' || e.code === 'Enter') {
                    this.handleMenuSelection();
                }
                return;
            }
            
            // Handle settings menu
            if (this.gameState === 'settings') {
                this.handleSettingsInput(e);
                return;
            }
            
            // Handle feedback screen - now uses HTML form with own event listeners
            // No keyboard handling needed here

            // Handle restart and next level
            if (this.gameState === 'finished' || this.gameState === 'game_over') {
                if (e.code === 'KeyR') {
                    this.restart();
                    return;
                } else if (e.code === 'KeyN') {
                    if (this.gameState === 'finished') {
                        this.nextLevel();
                    } else {
                        this.generateNewLevel();
                    }
                    return;
                } else if (e.code === 'Space' && this.gameState === 'finished') {
                    // Allow space to advance to next level on victory
                    this.nextLevel();
                    return;
                }
            }

            // Handle pause menu
            if (this.gameState === 'paused') {
                if (this.settingsVisible) {
                    this.handleSettingsInput(e);
                } else {
                    // Pause menu navigation
                    if (e.code === 'Escape' || e.code === 'KeyP') {
                        this.togglePause();
                    } else if (e.code === 'KeyW' || e.code === 'ArrowUp') {
                        this.selectedPauseMenuItem = Math.max(0, this.selectedPauseMenuItem - 1);
                    } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
                        this.selectedPauseMenuItem = Math.min(this.pauseMenuItems.length - 1, this.selectedPauseMenuItem + 1);
                    } else if (e.code === 'Space' || e.code === 'Enter') {
                        this.handlePauseMenuSelection();
                    }
                }
                return;
            }

            // Handle playing state
            if (this.gameState === 'playing') {
                // ESC or P key toggles pause
                if (e.code === 'Escape' || e.code === 'KeyP') {
                    this.togglePause();
                    return;
                }
                // Pass other keys to player
                this.player.setKeyState(e.code, true);
            }
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            // Only pass key releases to player if actually playing
            if (this.gameState === 'playing') {
                this.player.setKeyState(e.code, false);
            }
        });

        // Prevent default behavior for space and arrow keys
        document.addEventListener('keydown', (e) => {
            if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
    }
    
    setupMobileControls() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        console.log('Mobile detection:', { isMobile, isTouch, userAgent: navigator.userAgent });
        console.log('Screen dimensions:', { width: window.screen.width, height: window.screen.height });
        console.log('Viewport dimensions:', { width: window.innerWidth, height: window.innerHeight });
        
        // Show controls on mobile OR if screen is small (force mobile for testing)
        const showMobileControls = true; // Force show for testing
        console.log('Should show mobile controls:', showMobileControls);
        console.log('Forcing mobile controls to show for debugging');
        
        if (showMobileControls) {
            const mobileControls = document.getElementById('mobileControls');
            const mobileHint = document.querySelector('.mobile-hint');
            
            // Check if elements exist before accessing them
            if (!mobileControls) {
                console.warn('Mobile controls element not found');
                return;
            }
            
            console.log('Found mobile controls element, making visible');
            mobileControls.classList.add('visible');
            mobileControls.style.display = 'flex'; // Force display
            
            if (mobileHint) {
                mobileHint.style.display = 'block';
                console.log('Mobile hint updated');
            }
            
            // Get control buttons
            const leftBtn = document.getElementById('leftBtn');
            const rightBtn = document.getElementById('rightBtn');
            const upBtn = document.getElementById('upBtn');
            const jumpBtn = document.getElementById('jumpBtn');
            
            // Check if all buttons exist
            if (!leftBtn || !rightBtn || !upBtn || !jumpBtn) {
                console.warn('Some mobile control buttons not found');
                return;
            }
            
            // Helper function to handle touch events
            const handleTouchStart = (e, action) => {
                e.preventDefault();
                e.stopPropagation();
                action();
            };
            
            const handleTouchEnd = (e, action) => {
                e.preventDefault();
                e.stopPropagation();
                action();
            };
            
            // Left button
            leftBtn.addEventListener('touchstart', (e) => handleTouchStart(e, () => {
                this.player.setKeyState('ArrowLeft', true);
                this.player.setKeyState('KeyA', true);
            }));
            leftBtn.addEventListener('touchend', (e) => handleTouchEnd(e, () => {
                this.player.setKeyState('ArrowLeft', false);
                this.player.setKeyState('KeyA', false);
            }));
            
            // Right button
            rightBtn.addEventListener('touchstart', (e) => handleTouchStart(e, () => {
                this.player.setKeyState('ArrowRight', true);
                this.player.setKeyState('KeyD', true);
            }));
            rightBtn.addEventListener('touchend', (e) => handleTouchEnd(e, () => {
                this.player.setKeyState('ArrowRight', false);
                this.player.setKeyState('KeyD', false);
            }));
            
            // Up button (alternative jump)
            upBtn.addEventListener('touchstart', (e) => handleTouchStart(e, () => {
                this.player.setKeyState('ArrowUp', true);
                this.player.setKeyState('KeyW', true);
            }));
            upBtn.addEventListener('touchend', (e) => handleTouchEnd(e, () => {
                this.player.setKeyState('ArrowUp', false);
                this.player.setKeyState('KeyW', false);
            }));
            
            // Jump button
            jumpBtn.addEventListener('touchstart', (e) => handleTouchStart(e, () => {
                this.player.setKeyState('Space', true);
            }));
            jumpBtn.addEventListener('touchend', (e) => handleTouchEnd(e, () => {
                this.player.setKeyState('Space', false);
            }));
            
            // Prevent context menu on long press
            [leftBtn, rightBtn, upBtn, jumpBtn].forEach(btn => {
                btn.addEventListener('contextmenu', (e) => e.preventDefault());
            });
        }
    }
    
    handleMenuSelection() {
        switch (this.selectedMenuItem) {
            case 0: // Start Game
                this.startGame();
                break;
            case 1: // Changelog
                if (typeof CHANGELOG === 'undefined') {
                    console.error('CHANGELOG not loaded! Make sure changelog.js is included.');
                    return;
                }
                this.changelogVisible = true;
                this.changelogScroll = 0;
                // Calculate max scroll based on changelog length
                const lines = CHANGELOG.split('\n').length;
                this.changelogMaxScroll = Math.max(0, lines - 25); // Show ~25 lines at a time
                break;
            case 2: // Settings
                this.gameState = 'settings';
                break;
            case 3: // Submit Feedback
                this.showFeedbackForm();
                break;
        }
    }

    setupFeedbackListeners() {
        // Submit button
        document.getElementById('submitFeedbackBtn').addEventListener('click', () => {
            this.submitFeedback();
        });

        // Skip button
        document.getElementById('skipFeedbackBtn').addEventListener('click', () => {
            this.hideFeedbackForm();
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.feedbackOverlay.style.display === 'flex') {
                this.hideFeedbackForm();
            }
        });
    }

    showFeedbackForm() {
        // Update stats
        this.feedbackStats.textContent = `Level ${this.currentLevel} • ${this.player.jumpMode.toUpperCase()} • Seed: ${this.currentSeed}`;

        // Clear previous feedback
        this.feedbackTextarea.value = '';
        this.feedbackStatus.textContent = '';
        this.feedbackStatus.className = 'status';

        // Show overlay
        this.feedbackOverlay.style.display = 'flex';

        // Focus textarea
        setTimeout(() => this.feedbackTextarea.focus(), 100);

        // Pause game
        this.gameState = 'feedback';
    }

    hideFeedbackForm() {
        this.feedbackOverlay.style.display = 'none';
        this.gameState = 'start_screen';
    }

    startGame() {
        this.gameState = 'playing';
        this.restart(); // Reset player position and generate level
    }

    setupPhysicsControls() {
        // Gravity control
        const gravitySlider = document.getElementById('gravity');
        const gravityValue = document.getElementById('gravityValue');
        gravitySlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.physics.updateGravity(value);
            gravityValue.textContent = value;
        });

        // Jump power control
        const jumpPowerSlider = document.getElementById('jumpPower');
        const jumpPowerValue = document.getElementById('jumpPowerValue');
        jumpPowerSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.player.updateJumpPower(value);
            jumpPowerValue.textContent = value;
        });

        // Move speed control
        const moveSpeedSlider = document.getElementById('moveSpeed');
        const moveSpeedValue = document.getElementById('moveSpeedValue');
        moveSpeedSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.player.updateMoveSpeed(value);
            moveSpeedValue.textContent = value;
        });

        // Friction control
        const frictionSlider = document.getElementById('friction');
        const frictionValue = document.getElementById('frictionValue');
        frictionSlider.addEventListener('input', (e) => {
            const value = e.target.value;
            this.physics.updateFriction(value);
            frictionValue.textContent = value;
        });
    }

    setupJumpModes() {
        const jumpModeSelect = document.getElementById('jumpMode');
        const modeDescription = document.getElementById('modeDescription');

        const jumpModes = {
            mario: {
                gravity: 0.8,
                jumpPower: 15,
                moveSpeed: 5,
                friction: 0.8,
                description: '<strong>Super Mario:</strong> Classic platformer jump with moderate gravity and fixed jump height. Simple and predictable - press to jump, release has no effect on height.'
            },
            hollow: {
                gravity: 0.6,
                jumpPower: 14,
                moveSpeed: 4,
                friction: 0.7,
                description: '<strong>Hollow Knight:</strong> Variable height jumps based on hold duration. Tap for short hops, hold longer for higher jumps. Release early to fall faster. Creates precise, floaty movement perfect for tight platforming.'
            },
            celeste: {
                gravity: 0.9,
                jumpPower: 18,
                moveSpeed: 6,
                friction: 0.9,
                description: '<strong>Celeste:</strong> Variable height jumps with quick release mechanics. Hold for max height, release early to fall faster. Perfect for tight, precise platforming challenges.'
            },
            sonic: {
                gravity: 0.7,
                jumpPower: 16,
                moveSpeed: 7,
                friction: 0.6,
                description: '<strong>Sonic:</strong> Momentum-based jumping - the faster you move, the higher you jump! Emphasizes maintaining speed and flow through levels.'
            },
            megaman: {
                gravity: 1.0,
                jumpPower: 17,
                moveSpeed: 4,
                friction: 0.95,
                description: '<strong>Mega Man:</strong> Fixed arc jumps with reduced air control. Once you jump, you commit to the arc. Requires careful timing and positioning before jumping.'
            },
            custom: {
                gravity: null,
                jumpPower: null,
                moveSpeed: null,
                friction: null,
                description: '<strong>Custom:</strong> Use the sliders below to create your own jump mechanics! Experiment with different combinations to discover new feels.'
            }
        };

        // Auto-apply mode when selection changes
        jumpModeSelect.addEventListener('change', () => {
            const selectedMode = jumpModeSelect.value;
            const mode = jumpModes[selectedMode];
            
            // Update description
            modeDescription.innerHTML = mode.description;
            
            // Auto-apply the mode
            this.player.setJumpMode(selectedMode);
            
            if (selectedMode !== 'custom') {
                // Update physics
                this.physics.updateGravity(mode.gravity);
                this.player.updateJumpPower(mode.jumpPower);
                this.player.updateMoveSpeed(mode.moveSpeed);
                this.physics.updateFriction(mode.friction);
                
                // Update sliders
                document.getElementById('gravity').value = mode.gravity;
                document.getElementById('gravityValue').textContent = mode.gravity;
                document.getElementById('jumpPower').value = mode.jumpPower;
                document.getElementById('jumpPowerValue').textContent = mode.jumpPower;
                document.getElementById('moveSpeed').value = mode.moveSpeed;
                document.getElementById('moveSpeedValue').textContent = mode.moveSpeed;
                document.getElementById('friction').value = mode.friction;
                document.getElementById('frictionValue').textContent = mode.friction;
            }
        });
    }

    setupLevelControls() {
        const newLevelBtn = document.getElementById('newLevel');
        const sameSeedBtn = document.getElementById('sameSeed');

        newLevelBtn.addEventListener('click', () => {
            this.generateNewLevel();
        });

        sameSeedBtn.addEventListener('click', () => {
            this.regenerateCurrentLevel();
        });
    }

    updateSeedDisplay() {
        this.currentSeed = this.platforms.seed;
        document.getElementById('currentSeed').textContent = this.currentSeed;
    }

    generateNewLevel(seed = null) {
        // Stop all ambient sounds before generating new level
        if (this.soundManager) {
            this.soundManager.stopAllAmbient();
        }

        this.currentLevel = 1;
        this.currentBias = this.getRandomBias();
        this.platforms = new PlatformManager(seed, this.currentBias, this.currentLevel, this.soundManager);
        this.updateSeedDisplay();

        // Update music mood to match new level bias
        if (this.soundManager) {
            this.soundManager.setMusicMood(this.currentBias);
        }

        // Reset and respawn consumables for new level
        this.consumables.reset();
        this.consumables.spawnRandomConsumables(800, this.platforms.rng, this.player, this.platforms.platforms);

        this.restart();
    }

    // Trigger narrative message display
    triggerNarrativeMessage(trigger, value) {
        if (typeof NARRATIVE === 'undefined') return;

        const message = NARRATIVE.getNextMessage(trigger, value);
        if (message) {
            this.narrativeMessage = message;
            this.narrativeTimer = 0;
        }
    }

    nextLevel() {
        // Stop all ambient sounds before going to next level
        if (this.soundManager) {
            this.soundManager.stopAllAmbient();
        }

        // Save player's PERMANENT effects
        const savedMaxJumps = this.player.maxJumps;
        const savedMoveSpeed = this.player.moveSpeed;
        const savedOriginalMoveSpeed = this.player.originalMoveSpeed;

        // Save size (permanent mushroom effect)
        const savedSizeMultiplier = this.player.sizeMultiplier;
        const savedTargetSizeMultiplier = this.player.targetSizeMultiplier;

        // Save only PERMANENT consumable effects (wings)
        const savedWings = this.player.consumableEffects.wings;

        // Increment level and generate new level
        this.currentLevel++;
        this.currentBias = this.getRandomBias();
        this.platforms = new PlatformManager(null, this.currentBias, this.currentLevel, this.soundManager);
        this.updateSeedDisplay();

        // Trigger narrative message for level progression
        this.triggerNarrativeMessage('level', this.currentLevel);

        // Update music mood to match new level bias
        if (this.soundManager) {
            this.soundManager.setMusicMood(this.currentBias);
        }

        // Reset and respawn consumables for new level
        this.consumables.reset();
        this.consumables.spawnRandomConsumables(800, this.platforms.rng, this.player, this.platforms.platforms);

        // Reset player position but keep powerups
        this.gameState = 'playing';
        // Center player on tower starting platform (tower centerX = 400)
        this.player.x = 400 - this.player.width / 2;
        this.player.y = this.physics.groundLevel - 40;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.player.resetLives(); // Reset lives to 3

        // Reset all key states to prevent auto-movement
        this.player.keys.left = false;
        this.player.keys.right = false;
        this.player.keys.up = false;
        this.player.keys.jump = false;
        this.player.keys.shift = false;

        // Reset ALL consumable effects to defaults (clears temporary effects)
        this.player.consumableEffects = {
            wings: false,
            doubleJump: false,
            tripleJump: false,
            springShoes: false,
            ghostMode: false,
            magnetRadius: 0,
            stickyGloves: false,
            freezeHazards: false,
            slowTime: false,
            luckBoost: 1.0,
            shieldCharges: 0,
            dashCharges: 0,
            reversedControls: false,
            drunk: false,
            drunkTimer: 0,
            giant: false,
            shrink: false,
            tiny: false
        };

        // Restore ONLY permanent effects
        this.player.maxJumps = savedMaxJumps;
        this.player.jumpsRemaining = savedMaxJumps;
        this.player.moveSpeed = savedMoveSpeed;
        this.player.originalMoveSpeed = savedOriginalMoveSpeed;

        // Restore permanent size from mushrooms
        this.player.sizeMultiplier = savedSizeMultiplier;
        this.player.targetSizeMultiplier = savedTargetSizeMultiplier;
        this.player.width = this.player.baseWidth * this.player.sizeMultiplier;
        this.player.height = this.player.baseHeight * this.player.sizeMultiplier;
        this.player.jumpPower = this.player.baseJumpPower * Math.pow(this.player.sizeMultiplier, 0.5);

        // Restore wings (permanent)
        this.player.consumableEffects.wings = savedWings;

        // Clear victory particles
        this.victoryParticles = [];
        this.victoryTimer = 0;

        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.levelWidth = 800; // Ensure camera knows about new level width
    }

    getRandomBias() {
        const biases = ['normal', 'wide_gap', 'hazard_heavy', 'safe_zone', 'high_route', 'tight_spaces'];
        return biases[Math.floor(Math.random() * biases.length)];
    }

    regenerateCurrentLevel() {
        this.generateNewLevel(this.currentSeed);
    }

    update(deltaTime) {
        // Update logo animations on start screen
        if (this.gameState === 'start_screen') {
            this.updateLogoAnimations();
        }

        if (this.gameState === 'playing') {
            this.platforms.update(this.player);

            // Update consumables (handles pickup collision, active effects)
            this.consumables.update(this.player, this);

            const playerResult = this.player.update(this.physics, this.platforms);

            // Handle player death animation completion
            if (playerResult === 'death_complete') {
                // Track death and trigger narrative
                this.totalDeaths++;
                this.triggerNarrativeMessage('death', this.totalDeaths);

                // Go straight to game over screen
                this.gameState = 'game_over';
                return;
            }

            // Update ambient hazard sounds based on proximity (but not during death animation)
            if (!this.player.isDying) {
                this.platforms.updateAmbientSounds(this.player);
            }

            this.updateCamera();

            // Check if player finished the level or died
            const collisionResult = this.platforms.checkCollisions(this.player);
            if (collisionResult === 'finish') {
                this.gameState = 'finished';
                this.victoryTimer = 0; // Reset victory animation timer

                // Play victory sound
                this.soundManager.playVictory();
            } else if (collisionResult === 'game_over') {
                // Death animation will start, game over will be handled by player update
            }

            // Track max height for narrative triggers
            const currentHeight = this.physics.groundLevel - this.player.y;
            if (currentHeight > this.maxHeightReached) {
                this.maxHeightReached = currentHeight;
                this.triggerNarrativeMessage('height', this.maxHeightReached);
            }
        }

        // Update narrative message timer
        if (this.narrativeMessage) {
            this.narrativeTimer++;
            if (this.narrativeTimer > this.narrativeMaxDuration) {
                this.narrativeMessage = null;
                this.narrativeTimer = 0;
            }
        }

        // Update victory celebration effects
        if (this.gameState === 'finished') {
            this.updateVictoryCelebration();
        }
    }
    
    updateLogoAnimations() {
        // Update animation timers
        this.logoAnimationTimer++;
        this.logoGlitchTimer += 0.15;
        
        // Add new particles randomly
        if (Math.random() < 0.3 && this.logoParticles.length < this.maxLogoParticles) {
            this.logoParticles.push({
                x: this.canvas.width/2 + (Math.random() - 0.5) * 400,
                y: this.canvas.height/3 + (Math.random() - 0.5) * 100,
                velocityX: (Math.random() - 0.5) * 4,
                velocityY: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 1,
                life: Math.random() * 60 + 30,
                maxLife: Math.random() * 60 + 30,
                color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'][Math.floor(Math.random() * 6)]
            });
        }
        
        // Update existing particles
        for (let i = this.logoParticles.length - 1; i >= 0; i--) {
            const particle = this.logoParticles[i];
            particle.x += particle.velocityX;
            particle.y += particle.velocityY;
            particle.life--;
            
            // Add some drift and fade
            particle.velocityX *= 0.99;
            particle.velocityY *= 0.99;
            
            // Remove dead particles
            if (particle.life <= 0) {
                this.logoParticles.splice(i, 1);
            }
        }
    }

    updateVictoryCelebration() {
        this.victoryTimer++;

        // Spawn firework particles
        if (this.victoryTimer % 10 === 0) {
            const colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB', '#32CD32'];
            for (let i = 0; i < 5; i++) {
                this.victoryParticles.push({
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height,
                    vx: (Math.random() - 0.5) * 8,
                    vy: -Math.random() * 15 - 10,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    life: Math.random() * 80 + 40,
                    maxLife: Math.random() * 80 + 40,
                    size: Math.random() * 4 + 2,
                    gravity: 0.3
                });
            }
        }

        // Update particles
        for (let i = this.victoryParticles.length - 1; i >= 0; i--) {
            const p = this.victoryParticles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= 0.99;
            p.life--;

            if (p.life <= 0) {
                this.victoryParticles.splice(i, 1);
            }
        }

        // Limit particle count
        if (this.victoryParticles.length > 200) {
            this.victoryParticles.splice(0, this.victoryParticles.length - 200);
        }
    }

    showVictoryInstructions() {
        // Render celebration particles
        for (let p of this.victoryParticles) {
            const alpha = p.life / p.maxLife;
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
        this.ctx.globalAlpha = 1;

        // Show instructions overlaid on game (celebrating!)
        this.ctx.textAlign = 'center';

        // Pulsing celebration effect
        const pulse = Math.sin(this.victoryTimer / 10) * 0.3 + 0.7;
        const bounce = Math.abs(Math.sin(this.victoryTimer / 15)) * 20;

        // Large, golden "LEVEL COMPLETE!" text
        this.ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
        this.ctx.font = 'bold 56px Arial';
        this.ctx.shadowColor = '#FFA500';
        this.ctx.shadowBlur = 30;
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width/2, 120 - bounce);
        this.ctx.shadowBlur = 0;

        // Celebration emoji/stars
        this.ctx.font = '40px Arial';
        const starPulse = Math.sin(this.victoryTimer / 8) * 0.5 + 0.5;
        this.ctx.globalAlpha = starPulse;
        this.ctx.fillText('⭐', this.canvas.width/2 - 150, 120 - bounce);
        this.ctx.fillText('⭐', this.canvas.width/2 + 150, 120 - bounce);
        this.ctx.globalAlpha = 1;

        // Large, bright instruction text
        this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('Press SPACE or N for next level!', this.canvas.width/2, this.canvas.height - 150);
        this.ctx.shadowBlur = 0;

        // Mode and seed info below (smaller)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Mode: ${this.player.jumpMode.toUpperCase()} • Seed: ${this.currentSeed}`, this.canvas.width/2, this.canvas.height - 100);

        // Version at bottom
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`v${this.version}`, this.canvas.width/2, this.canvas.height - 60);

        this.ctx.textAlign = 'left';
    }

    showDeathInstructions() {
        // Show instructions overlaid on death animation (big and bright)
        this.ctx.textAlign = 'center';

        // Make instructions very visible - pulsing brightness
        const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;

        // Large, bright instruction text
        this.ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        this.ctx.font = 'bold 36px Arial';
        this.ctx.shadowColor = '#FF0000';
        this.ctx.shadowBlur = 20;
        this.ctx.fillText('Press R to restart or N for new level!', this.canvas.width/2, this.canvas.height - 150);
        this.ctx.shadowBlur = 0;

        // Mode and seed info below (smaller)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Mode: ${this.player.jumpMode.toUpperCase()} • Seed: ${this.currentSeed}`, this.canvas.width/2, this.canvas.height - 100);

        // Version at bottom
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`v${this.version}`, this.canvas.width/2, this.canvas.height - 60);

        this.ctx.textAlign = 'left';
    }

    restart() {
        // Stop all ambient sounds when restarting
        if (this.soundManager) {
            this.soundManager.stopAllAmbient();
        }

        this.gameState = 'playing';
        // Center player on tower starting platform (tower centerX = 400)
        this.player.x = 400 - this.player.width / 2;
        this.player.y = this.physics.groundLevel - 40;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.player.resetLives(); // Reset lives to 3

        // Reset ALL consumable effects (both permanent and temporary)
        this.player.maxJumps = 1;
        this.player.jumpsRemaining = 1;
        if (this.player.originalMoveSpeed !== null) {
            this.player.moveSpeed = this.player.originalMoveSpeed;
            this.player.originalMoveSpeed = null;
        }

        // Reset ALL consumable effects to defaults
        this.player.consumableEffects = {
            wings: false,
            doubleJump: false,
            tripleJump: false,
            springShoes: false,
            ghostMode: false,
            magnetRadius: 0,
            stickyGloves: false,
            freezeHazards: false,
            slowTime: false,
            luckBoost: 1.0,
            shieldCharges: 0,
            dashCharges: 0,
            reversedControls: false,
            drunk: false,
            drunkTimer: 0,
            giant: false,
            shrink: false,
            tiny: false
        };

        // Reset size multiplier (mushrooms) to normal
        this.player.sizeMultiplier = 1.0;
        this.player.targetSizeMultiplier = 1.0;
        this.player.width = this.player.baseWidth;
        this.player.height = this.player.baseHeight;
        this.player.jumpPower = this.player.baseJumpPower;

        // Clear victory particles
        this.victoryParticles = [];
        this.victoryTimer = 0;

        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.levelWidth = 800; // Ensure camera knows about level width
    }

    updateCamera() {
        if (this.camera.followPlayer) {
            // Check if this is a vertical tower level (has exitDoor)
            const isVerticalLevel = this.platforms && this.platforms.exitDoor;

            if (isVerticalLevel) {
                // Vertical tower level camera (centered horizontally, follows player vertically)
                this.camera.x = (800 - this.canvas.width) / 2; // Center on 800px wide tower
                this.camera.x = Math.max(0, this.camera.x);

                // Vertical camera follows player closely
                const targetY = this.player.y - this.canvas.height * 0.5;
                this.camera.y += (targetY - this.camera.y) * 0.2; // Faster response

                // Clamp vertically - allow viewing entire tower (30 floors * 180px = 5400px)
                const minCameraY = -6000; // High enough to see top of tallest tower
                const maxCameraY = 520 - this.canvas.height + 100;
                this.camera.y = Math.max(minCameraY, Math.min(maxCameraY, this.camera.y));
            } else {
                // Horizontal level camera (standard behavior)
                this.camera.x = this.player.x - this.canvas.width / 2;
                this.camera.x = Math.max(0, Math.min(this.camera.x, this.camera.levelWidth - this.canvas.width));

                // Vertical following for multi-floor platforming
                const targetY = this.player.y - this.canvas.height * 0.5;
                this.camera.y += (targetY - this.camera.y) * 0.15;

                // Clamp camera vertically
                const minCameraY = -200;
                const maxCameraY = 520 - this.canvas.height + 100;
                this.camera.y = Math.max(minCameraY, Math.min(maxCameraY, this.camera.y));
            }
        }
    }

    renderAudioControls() {
        // Draw audio control indicators at bottom-left
        const x = 10;
        const y = this.canvas.height - 40;

        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(x, y, 160, 30);

        // Audio status
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = '11px Arial';

        // Mute status
        const muteIcon = this.soundManager.muted ? '🔇' : '🔊';
        this.ctx.fillText(`M: ${muteIcon} ${this.soundManager.muted ? 'Muted' : 'Sound'}`, x + 5, y + 12);

        // Music status
        const musicIcon = this.soundManager.musicPlaying ? '🎵' : '🔕';
        this.ctx.fillText(`B: ${musicIcon} ${this.soundManager.musicPlaying ? 'Music' : 'No Music'}`, x + 5, y + 24);
    }

    renderLevelBadge() {
        // Draw a prominent level badge in the top-right corner
        const badgeX = this.canvas.width - 120;
        const badgeY = 15;
        const badgeWidth = 110;
        const badgeHeight = 50;

        // Badge background with gradient
        const gradient = this.ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeHeight);
        gradient.addColorStop(0, '#3498db');
        gradient.addColorStop(1, '#2980b9');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);

        // Badge border
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(badgeX, badgeY, badgeWidth, badgeHeight);

        // "LEVEL" text (small)
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL', badgeX + badgeWidth / 2, badgeY + 18);

        // Level number (large)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.shadowColor = '#000000';
        this.ctx.shadowBlur = 3;
        this.ctx.fillText(this.currentLevel, badgeX + badgeWidth / 2, badgeY + 42);
        this.ctx.shadowBlur = 0;

        // Reset text align
        this.ctx.textAlign = 'left';
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render different screens based on game state
        switch (this.gameState) {
            case 'start_screen':
                this.renderStartScreen();
                break;
            case 'settings':
                this.renderSettingsScreen();
                break;
            case 'playing':
            case 'finished':
            case 'game_over':
                this.renderGameScreen();
                break;
            case 'feedback':
                this.renderGameScreen(); // Render game in background
                // Feedback form is now HTML overlay, no canvas rendering needed
                break;
            case 'paused':
                this.renderGameScreen(); // Render game in background
                this.renderPauseMenu(); // Overlay pause menu
                break;
        }
    }
    
    renderStartScreen() {
        // Dark background with subtle gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2c3e50');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render background particles
        this.renderLogoParticles();
        
        // Animated "GROUNDED" logo with effects
        this.renderAnimatedLogo();
        
        // Subtitle with glow effect
        this.ctx.textAlign = 'center';
        const subtitlePulse = Math.sin(this.logoGlitchTimer) * 0.3 + 0.7;
        this.ctx.fillStyle = `rgba(189, 195, 199, ${subtitlePulse})`;
        this.ctx.font = '20px Arial';
        
        // Add glow effect to subtitle
        this.ctx.shadowColor = '#3498db';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('Master the Art of Jumping', this.canvas.width/2, this.canvas.height/3 + 80);
        this.ctx.shadowBlur = 0;

        // Menu items with enhanced effects
        const startY = this.canvas.height/2 + 50;
        for (let i = 0; i < this.menuItems.length; i++) {
            const isSelected = i === this.selectedMenuItem;
            
            if (isSelected) {
                // Animated selection with glow
                const selectionPulse = Math.sin(this.logoGlitchTimer * 2) * 0.5 + 0.5;
                this.ctx.fillStyle = `rgba(52, 152, 219, ${0.8 + selectionPulse * 0.2})`;
                this.ctx.font = 'bold 32px Arial';
                
                // Add glow effect to selected item
                this.ctx.shadowColor = '#3498db';
                this.ctx.shadowBlur = 15;
                this.ctx.fillText('> ' + this.menuItems[i] + ' <', this.canvas.width/2, startY + i * 60);
                this.ctx.shadowBlur = 0;
            } else {
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.font = '28px Arial';
                this.ctx.fillText(this.menuItems[i], this.canvas.width/2, startY + i * 60);
            }
        }
        
        // Controls hint with subtle animation
        const hintAlpha = Math.sin(this.logoGlitchTimer * 0.5) * 0.2 + 0.8;
        this.ctx.fillStyle = `rgba(149, 165, 166, ${hintAlpha})`;
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Use W/S or ↑/↓ to navigate • SPACE/ENTER to select', this.canvas.width/2, this.canvas.height - 50);

        // Version number at bottom
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`v${this.version}`, this.canvas.width/2, this.canvas.height - 20);

        this.ctx.textAlign = 'left';

        // Render changelog if visible (overlays everything)
        if (this.changelogVisible) {
            this.renderChangelog();
        }
    }

    renderChangelog() {
        // Safety check
        if (typeof CHANGELOG === 'undefined') {
            this.changelogVisible = false;
            console.error('CHANGELOG not available');
            return;
        }

        // Dark semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Changelog window background
        const margin = 40;
        const windowX = margin;
        const windowY = margin;
        const windowWidth = this.canvas.width - margin * 2;
        const windowHeight = this.canvas.height - margin * 2;

        // Window background with border
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(windowX, windowY, windowWidth, windowHeight);
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(windowX, windowY, windowWidth, windowHeight);

        // Header
        this.ctx.fillStyle = '#3498db';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CHANGELOG', this.canvas.width / 2, windowY + 35);

        // Render changelog content
        const changelogLines = CHANGELOG.split('\n');
        const lineHeight = 18;
        const startY = windowY + 60;
        const maxLines = Math.floor((windowHeight - 100) / lineHeight);

        this.ctx.textAlign = 'left';
        this.ctx.font = '12px monospace';

        for (let i = 0; i < maxLines; i++) {
            const lineIndex = this.changelogScroll + i;
            if (lineIndex >= changelogLines.length) break;

            const line = changelogLines[lineIndex];
            const yPos = startY + i * lineHeight;

            // Color code different line types
            if (line.startsWith('v')) {
                // Version headers
                this.ctx.fillStyle = '#3498db';
                this.ctx.font = 'bold 13px monospace';
            } else if (line.includes('═') || line.includes('─')) {
                // Separators
                this.ctx.fillStyle = '#7f8c8d';
                this.ctx.font = '12px monospace';
            } else if (line.startsWith('•') || line.startsWith('  -')) {
                // Bullet points
                this.ctx.fillStyle = '#bdc3c7';
                this.ctx.font = '12px monospace';
            } else if (line.match(/^[A-Z ]+:/)) {
                // Section headers (CRITICAL FIXES:, etc.)
                this.ctx.fillStyle = '#e74c3c';
                this.ctx.font = 'bold 12px monospace';
            } else {
                // Normal text
                this.ctx.fillStyle = '#ecf0f1';
                this.ctx.font = '12px monospace';
            }

            this.ctx.fillText(line, windowX + 20, yPos);
        }

        // Scroll indicators
        this.ctx.textAlign = 'center';
        this.ctx.font = '16px Arial';

        if (this.changelogScroll > 0) {
            // Up arrow
            this.ctx.fillStyle = '#3498db';
            this.ctx.fillText('▲ MORE', this.canvas.width / 2, startY - 15);
        }

        if (this.changelogScroll < this.changelogMaxScroll) {
            // Down arrow
            this.ctx.fillStyle = '#3498db';
            this.ctx.fillText('▼ MORE', this.canvas.width / 2, windowY + windowHeight - 30);
        }

        // Instructions at bottom
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('↑/↓ to scroll • B to close', this.canvas.width / 2, windowY + windowHeight - 10);

        this.ctx.textAlign = 'left';
    }

    renderLogoParticles() {
        // Render background particle effects
        for (let particle of this.logoParticles) {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
            this.ctx.globalAlpha = alpha;
            
            // Create glowing particle effect
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = particle.size * 2;
            this.ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        }
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    renderAnimatedLogo() {
        const centerX = this.canvas.width/2;
        const centerY = this.canvas.height/3;
        
        this.ctx.textAlign = 'center';
        this.ctx.font = 'bold 72px Arial';
        
        // Create multiple layers for depth and glitch effect
        const layers = [
            { offset: { x: 0, y: 0 }, color: '#ffffff', blur: 0 },
            { offset: { x: Math.sin(this.logoGlitchTimer) * 3, y: 0 }, color: '#ff0044', blur: 5 },
            { offset: { x: Math.cos(this.logoGlitchTimer * 1.2) * -2, y: Math.sin(this.logoGlitchTimer * 0.8) }, color: '#0044ff', blur: 3 },
            { offset: { x: Math.sin(this.logoGlitchTimer * 1.5) * 4, y: Math.cos(this.logoGlitchTimer) * 2 }, color: '#44ff00', blur: 4 }
        ];
        
        // Render each layer with effects
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const alpha = i === 0 ? 1 : 0.3 + Math.sin(this.logoGlitchTimer + i) * 0.2;
            
            this.ctx.fillStyle = layer.color;
            this.ctx.globalAlpha = alpha;
            
            // Add glitch blur effect
            if (layer.blur > 0) {
                this.ctx.shadowColor = layer.color;
                this.ctx.shadowBlur = layer.blur;
            }
            
            // Glitch effect - occasionally corrupt characters
            let text = 'GROUNDED';
            if (i > 0 && Math.random() < 0.1) {
                // Random character corruption
                const glitchChars = '@#$%^&*(){}[]|\\:;\"\'<>?,./~`';
                const glitchPos = Math.floor(Math.random() * text.length);
                text = text.substring(0, glitchPos) + 
                       glitchChars[Math.floor(Math.random() * glitchChars.length)] + 
                       text.substring(glitchPos + 1);
            }
            
            // Scale effect - slight pulsing
            const scale = 1 + Math.sin(this.logoGlitchTimer * 0.5) * 0.05;
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.scale(scale, scale);
            
            this.ctx.fillText(text, layer.offset.x, layer.offset.y);
            
            this.ctx.restore();
            this.ctx.shadowBlur = 0;
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    renderSettingsScreen() {
        // Dark background with gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1a1a1a');
        gradient.addColorStop(1, '#2c3e50');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Settings title
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.shadowColor = '#3498db';
        this.ctx.shadowBlur = 10;
        this.ctx.fillText('SETTINGS', this.canvas.width / 2, 100);
        this.ctx.shadowBlur = 0;

        // Settings items
        const startY = 180;
        const lineHeight = 50;

        for (let i = 0; i < this.settingsMenuItems.length; i++) {
            const item = this.settingsMenuItems[i];
            const isSelected = i === this.selectedSettingsItem;
            const y = startY + i * lineHeight;

            // Item name
            if (isSelected) {
                this.ctx.fillStyle = '#3498db';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.shadowColor = '#3498db';
                this.ctx.shadowBlur = 8;
            } else {
                this.ctx.fillStyle = '#95a5a6';
                this.ctx.font = '22px Arial';
            }

            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.name + ':', 100, y);
            this.ctx.shadowBlur = 0;

            // Item value/control
            this.ctx.textAlign = 'right';
            if (item.type === 'slider') {
                const value = this.settings[item.key];
                const percentage = Math.round(((value - item.min) / (item.max - item.min)) * 100);
                this.ctx.fillText(`${percentage}%`, this.canvas.width - 100, y);

                // Draw slider bar
                if (isSelected) {
                    const barWidth = 200;
                    const barX = this.canvas.width - 100 - barWidth - 20;
                    const barY = y - 15;

                    // Background
                    this.ctx.fillStyle = '#34495e';
                    this.ctx.fillRect(barX, barY, barWidth, 20);

                    // Border
                    this.ctx.strokeStyle = '#555';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(barX, barY, barWidth, 20);

                    // Fill
                    this.ctx.fillStyle = '#3498db';
                    this.ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * ((value - item.min) / (item.max - item.min)), 16);
                }
            } else if (item.type === 'toggle') {
                const value = this.settings[item.key];
                this.ctx.fillStyle = value ? '#27ae60' : '#c0392b';
                this.ctx.fillText(value ? 'ON' : 'OFF', this.canvas.width - 100, y);
            } else if (item.type === 'cycle') {
                const value = this.settings[item.key];
                this.ctx.fillText(value.toUpperCase(), this.canvas.width - 100, y);
            }
        }

        // Controls hint
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('W/S or ↑/↓: Navigate • A/D or ←/→: Adjust • SPACE: Toggle • ESC: Back', this.canvas.width / 2, this.canvas.height - 50);

        this.ctx.textAlign = 'left';
    }
    
    renderGameScreen() {
        // Draw sky background using level style
        const skyColor = this.platforms.style ? this.platforms.style.sky : '#87CEEB';
        this.ctx.fillStyle = skyColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw scrolling background
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // Draw extended ground
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, this.physics.groundLevel, this.camera.levelWidth, this.canvas.height - this.physics.groundLevel + this.camera.y);

        // Draw ground line
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.physics.groundLevel);
        this.ctx.lineTo(this.camera.levelWidth, this.physics.groundLevel);
        this.ctx.stroke();

        this.ctx.restore();
        
        // Draw platforms (handles its own camera translation)
        this.platforms.render(this.ctx, this.camera);

        // Draw consumables with camera translation
        this.consumables.render(this.ctx, this.camera);

        // Draw player with camera translation
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        this.player.render(this.ctx);
        this.ctx.restore();
        
        // Draw UI elements (fixed position) - expand box for multiple heart rows
        const heartsPerRow = 10; // Max hearts per row
        const heartsRows = Math.ceil(this.player.maxLives / heartsPerRow);
        const uiHeight = 115 + (heartsRows - 1) * 18; // Expand for multiple rows
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(5, 5, 300, uiHeight);

        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('WASD/Arrow Keys: Move | Space: Jump', 10, 25);
        this.ctx.fillText(`Mode: ${this.player.jumpMode.toUpperCase()} | Level: ${this.currentLevel}`, 10, 45);

        // Show level bias and style
        const biasName = this.platforms.getBiasParameters().name;
        const styleName = this.platforms.style ? this.platforms.style.name : 'Classic';
        this.ctx.fillText(`Type: ${biasName} | Style: ${styleName}`, 10, 60);

        this.ctx.fillText(`Position: ${Math.round(this.player.x)}/${this.camera.levelWidth}`, 10, 75);

        // Draw lives (support unlimited with multiple rows)
        this.ctx.fillText('Lives:', 10, 95);

        for (let i = 0; i < this.player.maxLives; i++) {
            const row = Math.floor(i / heartsPerRow);
            const col = i % heartsPerRow;
            const x = 60 + col * 20;
            const y = 95 + row * 18;

            if (i < this.player.lives) {
                this.ctx.fillStyle = '#FF0000'; // Red heart for remaining lives
                this.ctx.fillText('♥', x, y);
            } else {
                this.ctx.fillStyle = '#444444'; // Dark heart for lost lives
                this.ctx.fillText('♥', x, y);
            }
        }
        this.ctx.fillStyle = 'white';

        // Show jump counter (current/max jumps)
        const jumpY = 95 + heartsRows * 18 + 5;
        this.ctx.font = '14px Arial';

        // Color code based on jumps remaining
        if (this.player.jumpsRemaining === 0) {
            this.ctx.fillStyle = '#FF4444'; // Red when no jumps
        } else if (this.player.jumpsRemaining === this.player.maxJumps) {
            this.ctx.fillStyle = '#00FF00'; // Green when full
        } else {
            this.ctx.fillStyle = '#FFAA00'; // Orange when partial
        }

        this.ctx.fillText('Jumps:', 10, jumpY);
        this.ctx.fillText(`${this.player.jumpsRemaining}/${this.player.maxJumps}`, 70, jumpY);

        // Visual jump indicators (circles)
        for (let i = 0; i < this.player.maxJumps; i++) {
            const jumpX = 130 + i * 15;
            if (i < this.player.jumpsRemaining) {
                this.ctx.fillStyle = '#00FF00'; // Available jumps
                this.ctx.beginPath();
                this.ctx.arc(jumpX, jumpY - 5, 5, 0, Math.PI * 2);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = '#444444'; // Used jumps
                this.ctx.beginPath();
                this.ctx.arc(jumpX, jumpY - 5, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.fillStyle = 'white';

        // Show progress bar (adjust position based on heart rows and jump counter)
        const progressY = jumpY + 20;

        const progress = this.player.x / this.camera.levelWidth;
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.fillRect(10, progressY, 200, 10);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(10, progressY, progress * 200, 10);

        // Show jump mechanics info
        this.ctx.font = '12px Arial';
        const infoY = progressY + 20;
        if (this.player.jumpMode === 'hollow' || this.player.jumpMode === 'celeste') {
            this.ctx.fillText(`Hold jump for variable height!`, 10, infoY);
        } else if (this.player.jumpMode === 'sonic') {
            this.ctx.fillText(`Run faster to jump higher!`, 10, infoY);
        } else if (this.player.jumpMode === 'megaman') {
            this.ctx.fillText(`Fixed arc - plan your jumps!`, 10, infoY);
        }

        // Render consumables UI (active effects, notifications)
        this.consumables.renderUI(this.ctx, this.canvas, this.player);

        // Show version number in top-left corner (small gray text)
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`v${this.version}`, 320, 20);

        // Draw audio controls indicator (bottom-left)
        this.renderAudioControls();

        // Draw prominent level badge in top-right corner
        this.renderLevelBadge();

        // Show victory celebration and instructions if game is finished
        if (this.gameState === 'finished') {
            this.showVictoryInstructions();
        }

        // Show restart instructions during and after final death animation (not separate screen)
        if (this.gameState === 'game_over' || (this.player.finalDeath && this.player.isDying)) {
            this.showDeathInstructions();
        }

        // Render narrative message (PKD-inspired overlay)
        if (this.narrativeMessage && this.gameState === 'playing') {
            this.renderNarrativeMessage();
        }
    }

    // ===== NARRATIVE MESSAGE RENDERING =====

    renderNarrativeMessage() {
        // Terminal/glitch effect styling
        const fadeIn = Math.min(this.narrativeTimer / 30, 1); // Fade in over 0.5s
        const fadeOut = this.narrativeTimer > this.narrativeMaxDuration - 30 ?
            (this.narrativeMaxDuration - this.narrativeTimer) / 30 : 1;
        const alpha = Math.min(fadeIn, fadeOut);

        // Glitch effect on text
        const glitch = Math.sin(this.narrativeTimer * 0.3) * 2;

        // Semi-transparent dark box (terminal style)
        this.ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * alpha})`;
        this.ctx.fillRect(50, this.canvas.height - 180, this.canvas.width - 100, 130);

        // Border with scanline effect
        this.ctx.strokeStyle = `rgba(0, 255, 100, ${0.6 * alpha})`;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(50, this.canvas.height - 180, this.canvas.width - 100, 130);

        // Terminal-style text
        this.ctx.fillStyle = `rgba(0, 255, 100, ${alpha})`;
        this.ctx.font = '16px monospace';
        this.ctx.textAlign = 'left';

        // Split message into lines and render
        const lines = this.narrativeMessage.split('\n');
        const lineHeight = 22;
        const startY = this.canvas.height - 160;

        for (let i = 0; i < lines.length; i++) {
            // Add subtle glitch offset
            const offset = i % 2 === 0 ? glitch : -glitch;
            this.ctx.fillText(lines[i], 70 + offset, startY + i * lineHeight);
        }

        // Blinking cursor effect at end
        if (Math.floor(this.narrativeTimer / 20) % 2 === 0) {
            const lastLineY = startY + (lines.length - 1) * lineHeight;
            const lastLineWidth = this.ctx.measureText(lines[lines.length - 1]).width;
            this.ctx.fillText('█', 70 + lastLineWidth + 5, lastLineY);
        }

        this.ctx.textAlign = 'center'; // Reset
    }

    // ===== PAUSE MENU RENDERING =====

    renderPauseMenu() {
        // Semi-transparent dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.settingsVisible) {
            this.renderPauseSettings();
            return;
        }

        // Pause menu title
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, 150);

        // Menu items
        const startY = 250;
        for (let i = 0; i < this.pauseMenuItems.length; i++) {
            const isSelected = i === this.selectedPauseMenuItem;

            if (isSelected) {
                this.ctx.fillStyle = '#3498db';
                this.ctx.font = 'bold 32px Arial';
                this.ctx.shadowColor = '#3498db';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText('> ' + this.pauseMenuItems[i] + ' <', this.canvas.width / 2, startY + i * 60);
                this.ctx.shadowBlur = 0;
            } else {
                this.ctx.fillStyle = '#95a5a6';
                this.ctx.font = '28px Arial';
                this.ctx.fillText(this.pauseMenuItems[i], this.canvas.width / 2, startY + i * 60);
            }
        }

        // Controls hint
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('W/S or ↑/↓ to navigate • SPACE/ENTER to select • ESC to resume', this.canvas.width / 2, this.canvas.height - 50);

        this.ctx.textAlign = 'left';
    }

    renderPauseSettings() {
        // Settings title
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.fillText('SETTINGS', this.canvas.width / 2, 100);

        // Settings items
        const startY = 180;
        const lineHeight = 50;

        for (let i = 0; i < this.settingsMenuItems.length; i++) {
            const item = this.settingsMenuItems[i];
            const isSelected = i === this.selectedSettingsItem;
            const y = startY + i * lineHeight;

            // Item name
            if (isSelected) {
                this.ctx.fillStyle = '#3498db';
                this.ctx.font = 'bold 24px Arial';
            } else {
                this.ctx.fillStyle = '#95a5a6';
                this.ctx.font = '22px Arial';
            }

            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.name + ':', 100, y);

            // Item value/control
            this.ctx.textAlign = 'right';
            if (item.type === 'slider') {
                const value = this.settings[item.key];
                const percentage = Math.round(((value - item.min) / (item.max - item.min)) * 100);
                this.ctx.fillText(`${percentage}%`, this.canvas.width - 100, y);

                // Draw slider bar
                if (isSelected) {
                    const barWidth = 200;
                    const barX = this.canvas.width - 100 - barWidth - 20;
                    const barY = y - 15;
                    this.ctx.strokeStyle = '#555';
                    this.ctx.lineWidth = 2;
                    this.ctx.strokeRect(barX, barY, barWidth, 20);
                    this.ctx.fillStyle = '#3498db';
                    this.ctx.fillRect(barX, barY, barWidth * ((value - item.min) / (item.max - item.min)), 20);
                }
            } else if (item.type === 'toggle') {
                const value = this.settings[item.key];
                this.ctx.fillStyle = value ? '#27ae60' : '#c0392b';
                this.ctx.fillText(value ? 'ON' : 'OFF', this.canvas.width - 100, y);
            } else if (item.type === 'cycle') {
                const value = this.settings[item.key];
                this.ctx.fillText(value.toUpperCase(), this.canvas.width - 100, y);
            }
        }

        // Controls hint
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('W/S: Navigate • A/D: Adjust • SPACE: Toggle • ESC: Back', this.canvas.width / 2, this.canvas.height - 50);

        this.ctx.textAlign = 'left';
    }

    // ===== PAUSE MENU SYSTEM =====

    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.isPaused = true;
            this.selectedPauseMenuItem = 0;
        } else if (this.gameState === 'paused' && !this.settingsVisible) {
            this.gameState = 'playing';
            this.isPaused = false;
        }
    }

    handlePauseMenuSelection() {
        const selected = this.pauseMenuItems[this.selectedPauseMenuItem];

        switch (selected) {
            case 'Resume':
                this.togglePause();
                break;
            case 'Settings':
                this.settingsVisible = true;
                this.selectedSettingsItem = 0;
                break;
            case 'Restart':
                this.restart();
                this.isPaused = false;
                break;
            case 'Quit to Menu':
                this.gameState = 'start_screen';
                this.isPaused = false;
                this.settingsVisible = false;
                break;
        }
    }

    handleSettingsInput(e) {
        const item = this.settingsMenuItems[this.selectedSettingsItem];

        if (e.code === 'Escape' || e.code === 'Backspace') {
            // Return to appropriate screen based on where we came from
            if (this.gameState === 'settings') {
                this.gameState = 'start_screen';
            } else {
                this.settingsVisible = false;
            }
            return;
        }

        if (e.code === 'KeyW' || e.code === 'ArrowUp') {
            this.selectedSettingsItem = Math.max(0, this.selectedSettingsItem - 1);
        } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
            this.selectedSettingsItem = Math.min(this.settingsMenuItems.length - 1, this.selectedSettingsItem + 1);
        } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
            this.adjustSetting(item, -1);
        } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
            this.adjustSetting(item, 1);
        } else if ((e.code === 'Space' || e.code === 'Enter') && item.type === 'button') {
            // "Back" button
            if (this.gameState === 'settings') {
                this.gameState = 'start_screen';
            } else {
                this.settingsVisible = false;
            }
        } else if ((e.code === 'Space' || e.code === 'Enter') && item.type === 'toggle') {
            this.settings[item.key] = !this.settings[item.key];
            this.applySettings();
        }
    }

    adjustSetting(item, direction) {
        if (item.type === 'slider') {
            const current = this.settings[item.key];
            const step = item.step || 0.1;
            const newValue = current + (direction * step);
            this.settings[item.key] = Math.max(item.min, Math.min(item.max, newValue));
            this.applySettings();
        } else if (item.type === 'cycle') {
            const values = item.values;
            const currentIndex = values.indexOf(this.settings[item.key]);
            const newIndex = (currentIndex + direction + values.length) % values.length;
            this.settings[item.key] = values[newIndex];
            this.applySettings();
        } else if (item.type === 'toggle') {
            this.settings[item.key] = !this.settings[item.key];
            this.applySettings();
        }
    }

    applySettings() {
        // Apply audio settings
        if (this.soundManager) {
            this.soundManager.setMasterVolume(this.settings.masterVolume);
            this.soundManager.sfxVolume = this.settings.sfxVolume;
            this.soundManager.musicVolume = this.settings.musicVolume;
        }

        // Apply retro mode
        if (this.settings.retroMode && !this.retroCanvas) {
            this.initRetroMode();
        }
    }

    initRetroMode() {
        // Create offscreen canvas for retro rendering
        this.retroCanvas = document.createElement('canvas');
        this.retroCtx = this.retroCanvas.getContext('2d');
        this.retroCtx.imageSmoothingEnabled = false;

        // Set retro canvas to lower resolution
        const scale = this.settings.pixelSize;
        this.retroCanvas.width = Math.floor(this.canvas.width / scale);
        this.retroCanvas.height = Math.floor(this.canvas.height / scale);
    }

    // ===== FEEDBACK SYSTEM =====

    renderFeedbackScreen() {
        // Dark semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Feedback form container
        const formWidth = 600;
        const formHeight = 400;
        const formX = (this.canvas.width - formWidth) / 2;
        const formY = (this.canvas.height - formHeight) / 2;

        // Form background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(formX, formY, formWidth, formHeight);
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(formX, formY, formWidth, formHeight);

        // Title
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.fillText('How was your run?', this.canvas.width / 2, formY + 50);

        // Show stats
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.fillText(`Level ${this.currentLevel} • ${this.player.jumpMode.toUpperCase()} • Seed: ${this.currentSeed}`, this.canvas.width / 2, formY + 100);

        // Text area
        const textAreaX = formX + 40;
        const textAreaY = formY + 140;
        const textAreaWidth = formWidth - 80;
        const textAreaHeight = 120;

        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(textAreaX, textAreaY, textAreaWidth, textAreaHeight);
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(textAreaX, textAreaY, textAreaWidth, textAreaHeight);

        // Feedback text or placeholder
        this.ctx.textAlign = 'left';
        this.ctx.font = '16px Arial';
        if (this.feedbackText.length === 0) {
            this.ctx.fillStyle = '#7f8c8d';
            this.ctx.fillText('Share your thoughts (optional)...', textAreaX + 10, textAreaY + 30);
        } else {
            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.fillText(this.feedbackText.substring(0, 150), textAreaX + 10, textAreaY + 30);
        }

        // Status/Buttons
        const buttonY = textAreaY + textAreaHeight + 50;
        this.ctx.textAlign = 'center';

        if (this.feedbackSubmitted) {
            this.ctx.fillStyle = '#27ae60';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.fillText('✓ Thank you!', this.canvas.width / 2, buttonY);
            this.ctx.fillStyle = '#95a5a6';
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Press ESC or ENTER to return to menu', this.canvas.width / 2, buttonY + 35);
        } else if (this.feedbackSubmitting) {
            this.ctx.fillStyle = '#3498db';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Submitting...', this.canvas.width / 2, buttonY);
        } else {
            this.ctx.fillStyle = '#95a5a6';
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Press ENTER to submit • ESC to skip', this.canvas.width / 2, buttonY);
        }

        this.ctx.textAlign = 'left';
    }

    handleFeedbackInput(e) {
        if (this.feedbackSubmitted) {
            // Return to start menu after submitting
            if (e.code === 'Escape' || e.code === 'Enter') {
                this.gameState = 'start_screen';
            }
            return;
        }

        if (this.feedbackSubmitting) return;

        if (e.code === 'Escape') {
            this.gameState = 'start_screen';
            return;
        }

        if (e.code === 'Enter') {
            this.submitFeedback();
            return;
        }

        if (e.code === 'Backspace') {
            this.feedbackText = this.feedbackText.slice(0, -1);
        } else if (e.code === 'Space') {
            this.feedbackText += ' ';
        } else if (e.key.length === 1 && this.feedbackText.length < 200) {
            this.feedbackText += e.key;
        }
    }

    async submitFeedback() {
        // Show submitting status
        this.feedbackStatus.textContent = 'Submitting...';
        this.feedbackStatus.className = 'status submitting';
        this.feedbackButtons.style.display = 'none';

        const feedbackData = {
            timestamp: Date.now(),
            level: this.currentLevel,
            seed: this.currentSeed,
            jumpMode: this.player.jumpMode,
            levelBias: this.currentBias,
            progress: Math.round((this.player.x / this.camera.levelWidth) * 100),
            comment: this.feedbackTextarea.value.trim()
        };

        try {
            const response = await fetch('/api/submit-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });

            const result = await response.json();
            console.log('Feedback submitted:', result);

            // Show success
            this.feedbackStatus.textContent = '✓ Thank you!';
            this.feedbackStatus.className = 'status success';

            // Close after 1.5 seconds
            setTimeout(() => {
                this.hideFeedbackForm();
                this.feedbackButtons.style.display = 'flex';
            }, 1500);
        } catch (error) {
            console.error('Error submitting feedback:', error);

            // Show error
            this.feedbackStatus.textContent = '✓ Saved (offline)';
            this.feedbackStatus.className = 'status success';

            // Close after 1.5 seconds
            setTimeout(() => {
                this.hideFeedbackForm();
                this.feedbackButtons.style.display = 'flex';
            }, 1500);
        }
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    stop() {
        this.isRunning = false;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
    
    console.log('Jumper Game Started!');
    console.log('Controls:');
    console.log('- WASD or Arrow Keys: Move left/right');
    console.log('- Space: Jump');
    console.log('- Use sliders to experiment with different jump mechanics!');
});