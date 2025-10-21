class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.physics = new Physics();
        this.currentSeed = null;
        this.platforms = new PlatformManager();
        this.player = new Player(100, this.physics.groundLevel - 40);
        this.updateSeedDisplay();
        
        // Camera system for side-scrolling
        this.camera = {
            x: 0,
            y: 0,
            followPlayer: true,
            levelWidth: 3000 // Total level width
        };
        
        // Game state
        this.gameState = 'playing'; // 'playing', 'finished'
        
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
            
            this.player.setKeyState(e.code, true);
        });

        document.addEventListener('keyup', (e) => {
            e.preventDefault();
            this.player.setKeyState(e.code, false);
        });

        // Prevent default behavior for space and arrow keys
        document.addEventListener('keydown', (e) => {
            if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
                e.preventDefault();
            }
        }, false);
        
        // Mobile touch controls
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        // Detect mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile || isTouch) {
            const mobileControls = document.getElementById('mobileControls');
            const mobileHint = document.querySelector('.mobile-hint');
            mobileControls.classList.add('visible');
            mobileHint.style.display = 'block';
            
            // Get control buttons
            const leftBtn = document.getElementById('leftBtn');
            const rightBtn = document.getElementById('rightBtn');
            const upBtn = document.getElementById('upBtn');
            const jumpBtn = document.getElementById('jumpBtn');
            
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
        this.restart();
    }

    regenerateCurrentLevel() {
        this.generateNewLevel(this.currentSeed);
    }

    update(deltaTime) {
        if (this.gameState === 'playing') {
            this.platforms.update();
            
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
            } else if (collisionResult === 'game_over') {
                // Death animation will start, game over will be handled by player update
            }
        }
    }

    showVictoryMessage() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FFD700';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('LEVEL COMPLETE!', this.canvas.width/2, this.canvas.height/2 - 70);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Mode: ${this.player.jumpMode.toUpperCase()}`, this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.fillText(`Seed: ${this.currentSeed}`, this.canvas.width/2, this.canvas.height/2 + 10);
        this.ctx.fillText('Press R to restart or N for new level!', this.canvas.width/2, this.canvas.height/2 + 50);
        
        this.ctx.textAlign = 'left';
    }

    showGameOverMessage() {
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 70);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.fillText(`Mode: ${this.player.jumpMode.toUpperCase()}`, this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.fillText(`Seed: ${this.currentSeed}`, this.canvas.width/2, this.canvas.height/2 + 10);
        this.ctx.fillText('Press R to restart or N for new level!', this.canvas.width/2, this.canvas.height/2 + 50);
        
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
        
        // Show victory screen if game is finished
        if (this.gameState === 'finished') {
            this.showVictoryMessage();
        }
        
        // Show game over screen if player died
        if (this.gameState === 'game_over') {
            this.showGameOverMessage();
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