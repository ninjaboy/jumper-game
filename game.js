class Game {
    constructor() {
        // Version tracking
        this.version = '1.2.7';
        this.versionNotes = [
            'v1.2.7 - Enhancement: Particles now physics-based, spray opposite to movement direction',
            'v1.2.6 - Enhancement: Particles now red/orange with glow effects for better visibility',
            'v1.2.5 - New Feature: Particle splash effects when jumping and landing',
            'v1.2.4 - UI/UX: Victory screen with firework celebration effects, integrated instructions',
            'v1.2.3 - UI/UX: Show double/triple jump status persistently in Active Effects panel',
            'v1.2.2 - UI/UX: Version on start screen, death instructions integrated with animation',
            'v1.2.1 - Bug Fix: Version number position corrected to top-left corner',
            'v1.2.0 - New Feature: Start screen with animated GROUNDED logo restored + Consumables',
            'v1.1.6 - Bug Fix: Explicitly configure Vercel for static hosting',
            'v1.1.0 - Consumable System: Double/Triple Jump, Speed Boost, Extra Life',
            'v1.0.0 - Base Game: Multiple jump mechanics, hazards, lives system'
        ];

        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.physics = new Physics();
        this.currentSeed = null;
        this.platforms = new PlatformManager();
        this.consumables = new ConsumableManager();
        this.player = new Player(100, this.physics.groundLevel - 40);

        // Spawn initial consumables
        this.consumables.spawnRandomConsumables(3000, this.platforms.rng);

        this.updateSeedDisplay();
        
        // Camera system for side-scrolling
        this.camera = {
            x: 0,
            y: 0,
            followPlayer: true,
            levelWidth: 3000 // Total level width
        };
        
        // Game state
        this.gameState = 'start_screen'; // 'start_screen', 'settings', 'playing', 'finished', 'game_over'
        
        // Start screen and menu system
        this.selectedMenuItem = 0;
        this.menuItems = ['Start Game', 'Settings'];
        this.settingsVisible = false;
        
        // Logo animation system
        this.logoAnimationTimer = 0;
        this.logoGlitchTimer = 0;
        this.logoParticles = [];
        this.maxLogoParticles = 50;

        // Victory celebration system
        this.victoryParticles = [];
        this.victoryTimer = 0;

        this.lastTime = 0;
        this.isRunning = false;
        
        this.setupEventListeners();
        this.setupPhysicsControls();
        this.setupJumpModes();
        this.setupLevelControls();
    }

    setupEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            
            // Handle start screen navigation
            if (this.gameState === 'start_screen') {
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
                if (e.code === 'Escape' || e.code === 'Backspace') {
                    this.gameState = 'start_screen';
                }
                return;
            }
            
            // Handle restart and new level
            if (this.gameState === 'finished' || this.gameState === 'game_over') {
                if (e.code === 'KeyR') {
                    this.restart();
                    return;
                } else if (e.code === 'KeyN') {
                    this.generateNewLevel();
                    return;
                }
            }
            
            // Only pass keys to player if actually playing
            if (this.gameState === 'playing') {
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
            case 1: // Settings
                this.gameState = 'settings';
                break;
        }
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
        this.platforms = new PlatformManager(seed);
        this.updateSeedDisplay();

        // Reset and respawn consumables for new level
        this.consumables.reset();
        this.consumables.spawnRandomConsumables(3000, this.platforms.rng);

        this.restart();
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
            this.platforms.update();

            // Update consumables (handles pickup collision, active effects)
            this.consumables.update(this.player, this);

            const playerResult = this.player.update(this.physics, this.platforms);

            // Handle player death animation completion
            if (playerResult === 'death_complete') {
                this.gameState = 'game_over';
                return;
            }

            this.updateCamera();

            // Check if player finished the level or died
            const collisionResult = this.platforms.checkCollisions(this.player);
            if (collisionResult === 'finish') {
                this.gameState = 'finished';
                this.victoryTimer = 0; // Reset victory animation timer
            } else if (collisionResult === 'game_over') {
                // Death animation will start, game over will be handled by player update
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
        this.gameState = 'playing';
        this.player.x = 100;
        this.player.y = this.physics.groundLevel - 40;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.onGround = true;
        this.player.resetLives(); // Reset lives to 3

        // Reset consumable effects on player
        this.player.maxJumps = 1;
        this.player.jumpsRemaining = 1;
        if (this.player.originalMoveSpeed !== null) {
            this.player.moveSpeed = this.player.originalMoveSpeed;
            this.player.originalMoveSpeed = null;
        }

        // Clear victory particles
        this.victoryParticles = [];
        this.victoryTimer = 0;

        this.camera.x = 0;
        this.camera.y = 0;
    }

    updateCamera() {
        if (this.camera.followPlayer) {
            // Center camera on player horizontally
            this.camera.x = this.player.x - this.canvas.width / 2;
            
            // Clamp camera to level bounds
            this.camera.x = Math.max(0, Math.min(this.camera.x, this.camera.levelWidth - this.canvas.width));
            
            // Keep camera y position stable (slight following vertically)
            const targetY = Math.max(0, this.player.y - this.canvas.height * 0.7);
            this.camera.y += (targetY - this.camera.y) * 0.1;
        }
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
        // Dark background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.fillText('SETTINGS', this.canvas.width/2, 100);
        
        this.ctx.fillStyle = '#bdc3c7';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Settings will be implemented here!', this.canvas.width/2, this.canvas.height/2);
        this.ctx.fillText('For now, you can adjust settings in-game', this.canvas.width/2, this.canvas.height/2 + 40);
        
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press ESC or BACKSPACE to return', this.canvas.width/2, this.canvas.height - 50);
        
        this.ctx.textAlign = 'left';
    }
    
    renderGameScreen() {
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
        
        // Draw UI elements (fixed position)
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(5, 5, 300, 120);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('WASD/Arrow Keys: Move | Space: Jump', 10, 25);
        this.ctx.fillText(`Mode: ${this.player.jumpMode.toUpperCase()}`, 10, 45);
        this.ctx.fillText(`Position: ${Math.round(this.player.x)}/${this.camera.levelWidth}`, 10, 65);
        
        // Draw lives
        this.ctx.fillText('Lives:', 10, 85);
        for (let i = 0; i < this.player.maxLives; i++) {
            if (i < this.player.lives) {
                this.ctx.fillStyle = '#FF0000'; // Red heart for remaining lives
                this.ctx.fillText('♥', 60 + i * 20, 85);
            } else {
                this.ctx.fillStyle = '#444444'; // Dark heart for lost lives
                this.ctx.fillText('♥', 60 + i * 20, 85);
            }
        }
        this.ctx.fillStyle = 'white';
        
        // Show progress bar
        const progress = this.player.x / this.camera.levelWidth;
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.fillRect(10, 105, 200, 10);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(10, 105, progress * 200, 10);
        
        // Show jump mechanics info
        this.ctx.font = '12px Arial';
        if (this.player.jumpMode === 'hollow' || this.player.jumpMode === 'celeste') {
            this.ctx.fillText(`Hold jump for variable height!`, 10, 125);
        } else if (this.player.jumpMode === 'sonic') {
            this.ctx.fillText(`Run faster to jump higher!`, 10, 125);
        } else if (this.player.jumpMode === 'megaman') {
            this.ctx.fillText(`Fixed arc - plan your jumps!`, 10, 125);
        }

        // Render consumables UI (active effects, notifications)
        this.consumables.renderUI(this.ctx, this.canvas, this.player);

        // Show version number in top-left corner (small gray text)
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`v${this.version}`, 320, 20);

        // Show victory celebration and instructions if game is finished
        if (this.gameState === 'finished') {
            this.showVictoryInstructions();
        }

        // Show restart instructions during and after final death animation (not separate screen)
        if (this.gameState === 'game_over' || (this.player.finalDeath && this.player.isDying)) {
            this.showDeathInstructions();
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