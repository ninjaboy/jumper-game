class Player {
    constructor(x, y, soundManager = null) {
        this.x = x;
        this.y = y;
        this.baseWidth = 40;
        this.baseHeight = 40;
        this.sizeMultiplier = 1.0; // Track cumulative size changes from mushrooms
        this.targetSizeMultiplier = 1.0; // Target size for smooth transitions
        this.sizeTransitionSpeed = 0.1; // How fast to transition (0-1, higher = faster)
        this.width = 40;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.color = '#e74c3c';
        this.soundManager = soundManager;

        // Configurable properties
        this.moveSpeed = 5;
        this.baseJumpPower = 15;
        this.jumpPower = 15;
        this.gravity = null; // Will use physics.gravity if null
        this.originalMoveSpeed = null; // For temporary speed boosts
        this.originalJumpPower = null; // For temporary jump boosts
        this.originalGravity = null; // For temporary gravity changes

        // Jump mechanics
        this.jumpMode = 'mario';
        this.jumpHeld = false;
        this.jumpTimer = 0;
        this.maxJumpTime = 20; // frames for variable height jumps
        this.coyoteTime = 0;
        this.maxCoyoteTime = 6; // frames of coyote time

        // Multi-jump system (for consumables)
        this.maxJumps = 1; // Default: single jump
        this.jumpsRemaining = 1;

        // Consumable effects tracking
        this.consumableEffects = {
            doubleJump: false,
            tripleJump: false
        };

        // Life system
        this.lives = 3;
        this.maxLives = 3;
        this.isDying = false;
        this.deathAnimationTimer = 0;
        this.maxDeathAnimationTime = 60; // frames
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.maxInvulnerabilityTime = 120; // 2 seconds at 60fps

        // Input state
        this.keys = {
            left: false,
            right: false,
            up: false,
            jump: false,
            shift: false
        };
        this.dashCooldown = 0;

        // Particle system for jump/landing effects
        this.particles = [];
        this.wasOnGround = false; // Track landing

        // Ladder climbing system
        this.onLadder = false;
        this.currentLadder = null;
        this.climbSpeed = 3; // Vertical climb speed
    }

    updateMoveSpeed(value) {
        this.moveSpeed = parseFloat(value);
    }

    updateJumpPower(value) {
        this.jumpPower = parseFloat(value);
    }

    applySizeMultiplier(multiplier) {
        // Apply the multiplier to the target size (for smooth transition)
        this.targetSizeMultiplier *= multiplier;

        // Clamp to reasonable limits (0.1x to 10x)
        this.targetSizeMultiplier = Math.max(0.1, Math.min(10, this.targetSizeMultiplier));

        // Note: Actual size will be smoothly interpolated in updateSizeTransition()
        // Jump power will also be updated there based on current (not target) size
    }

    updateSizeTransition() {
        // Smoothly interpolate current size towards target size
        if (Math.abs(this.sizeMultiplier - this.targetSizeMultiplier) > 0.01) {
            // Lerp towards target size
            this.sizeMultiplier += (this.targetSizeMultiplier - this.sizeMultiplier) * this.sizeTransitionSpeed;

            // Update actual dimensions based on current (transitioning) size
            this.width = this.baseWidth * this.sizeMultiplier;
            this.height = this.baseHeight * this.sizeMultiplier;

            // Scale jump power with size: bigger = stronger jumps
            // Use square root scaling so it's not too extreme
            this.jumpPower = this.baseJumpPower * Math.pow(this.sizeMultiplier, 0.5);
        } else if (this.sizeMultiplier !== this.targetSizeMultiplier) {
            // Snap to target when very close
            this.sizeMultiplier = this.targetSizeMultiplier;
            this.width = this.baseWidth * this.sizeMultiplier;
            this.height = this.baseHeight * this.sizeMultiplier;
            this.jumpPower = this.baseJumpPower * Math.pow(this.sizeMultiplier, 0.5);
        }
    }

    setJumpMode(mode) {
        this.jumpMode = mode;
    }

    takeDamage() {
        if (this.invulnerable || this.isDying) return false;
        
        this.lives--;
        if (this.lives <= 0) {
            this.startDeathAnimation();
            return 'game_over';
        } else {
            this.startInvulnerability();
            return 'respawn';
        }
    }

    startDeathAnimation() {
        this.isDying = true;

        // Play death sound and stop all ambient sounds
        if (this.soundManager) {
            this.soundManager.playDeath();
            this.soundManager.stopAllAmbient();
        }

        // Different death animations based on lives remaining
        if (this.lives === 0) {
            // Final death - epic animation
            this.maxDeathAnimationTime = 180; // 3 seconds
            this.deathAnimationTimer = this.maxDeathAnimationTime;
            this.finalDeath = true;
            this.originalSize = this.width;
            this.zigzagTimer = 0;
            this.flameParticles = [];
            this.glitchTimer = 0;
            this.velocityX = 0;
            this.velocityY = -12;
        } else {
            // Regular death animation
            this.maxDeathAnimationTime = 60; // 1 second
            this.deathAnimationTimer = this.maxDeathAnimationTime;
            this.finalDeath = false;
            this.velocityX = 0;
            this.velocityY = -8;
        }
    }

    startInvulnerability() {
        this.invulnerable = true;
        this.invulnerabilityTimer = this.maxInvulnerabilityTime;
    }

    resetLives() {
        this.lives = this.maxLives;
        this.isDying = false;
        this.invulnerable = false;
        this.deathAnimationTimer = 0;
        this.invulnerabilityTimer = 0;
        this.finalDeath = false;
        this.width = this.originalSize || 40;
        this.height = this.originalSize || 40;
    }

    updateFinalDeathAnimation() {
        const progress = 1 - (this.deathAnimationTimer / this.maxDeathAnimationTime);
        
        // Phase 1: Zigzag movement (first 60 frames)
        if (this.deathAnimationTimer > 120) {
            this.zigzagTimer += 0.3;
            this.velocityX = Math.sin(this.zigzagTimer) * 8;
            this.velocityY = -5 + Math.cos(this.zigzagTimer * 0.5) * 3;
        }
        
        // Phase 2: Size increase (frames 60-120)
        else if (this.deathAnimationTimer > 60) {
            const sizeProgress = (120 - this.deathAnimationTimer) / 60;
            this.width = this.originalSize * (1 + sizeProgress * 2);
            this.height = this.originalSize * (1 + sizeProgress * 2);
            this.velocityX *= 0.9; // Slow down
            this.velocityY *= 0.95;
        }
        
        // Phase 3: Final explosion and cross (last 60 frames)
        else {
            this.velocityX = 0;
            this.velocityY = 0;
        }
        
        // Create flame particles throughout
        if (Math.random() < 0.8) {
            this.flameParticles.push({
                x: this.x + this.width/2 + (Math.random() - 0.5) * this.width,
                y: this.y + this.height/2 + (Math.random() - 0.5) * this.height,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                size: Math.random() * 8 + 4
            });
        }
        
        // Update flame particles
        this.flameParticles = this.flameParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravity
            particle.life--;
            return particle.life > 0;
        });
        
        // Update glitch effect
        this.glitchTimer += 0.5;
    }

    handleInput() {
        // Don't handle input during death animation
        if (this.isDying) return;

        // Handle ladder climbing
        if (this.onLadder) {
            // Vertical movement on ladder
            if (this.keys.up) {
                this.velocityY = -this.climbSpeed;
                this.velocityX = 0; // No horizontal movement while climbing
            } else if (this.keys.down) {
                this.velocityY = this.climbSpeed;
                this.velocityX = 0;
            } else {
                this.velocityY = 0; // Stay in place on ladder
            }

            // Allow dismount via left/right or jump
            if (this.keys.left || this.keys.right || this.keys.jump) {
                this.onLadder = false;
                this.currentLadder = null;
                // If jumping, give upward velocity
                if (this.keys.jump) {
                    this.velocityY = -this.jumpPower * 0.8;
                    if (this.soundManager) {
                        this.soundManager.playJump();
                    }
                }
            }

            return; // Don't process normal movement while on ladder
        }

        // Check for reversed controls
        const reversedControls = this.consumableEffects && this.consumableEffects.reversedControls;
        const leftPressed = reversedControls ? this.keys.right : this.keys.left;
        const rightPressed = reversedControls ? this.keys.left : this.keys.right;

        // Drunk effect - add wobble to movement
        let drunkOffset = 0;
        if (this.consumableEffects && this.consumableEffects.drunk) {
            this.consumableEffects.drunkTimer = (this.consumableEffects.drunkTimer || 0) + 0.1;
            drunkOffset = Math.sin(this.consumableEffects.drunkTimer) * 0.5;
        }

        // Dash ability (Shift key)
        if (this.keys.shift && !this.dashCooldown && this.consumableEffects && this.consumableEffects.dashCharges > 0) {
            this.consumableEffects.dashCharges--;
            this.dashCooldown = 30; // 0.5 second cooldown
            const dashDirection = leftPressed ? -1 : (rightPressed ? 1 : (this.velocityX < 0 ? -1 : 1));
            this.velocityX = dashDirection * this.moveSpeed * 3;
            this.velocityY = 0; // Horizontal dash
        }

        // Update dash cooldown
        if (this.dashCooldown > 0) {
            this.dashCooldown--;
        }

        // Horizontal movement with better air control (with drunk wobble)
        const moveSpeedMod = 1 + drunkOffset;
        if (leftPressed) {
            if (this.onGround) {
                this.velocityX = -this.moveSpeed * moveSpeedMod;
            } else {
                // Air control - gradually adjust velocity
                this.velocityX += -this.moveSpeed * 0.3 * moveSpeedMod;
                this.velocityX = Math.max(this.velocityX, -this.moveSpeed * moveSpeedMod);
            }
        } else if (rightPressed) {
            if (this.onGround) {
                this.velocityX = this.moveSpeed * moveSpeedMod;
            } else {
                // Air control - gradually adjust velocity
                this.velocityX += this.moveSpeed * 0.3 * moveSpeedMod;
                this.velocityX = Math.min(this.velocityX, this.moveSpeed * moveSpeedMod);
            }
        } else if (!this.onGround) {
            // Air drag when no input
            this.velocityX *= 0.95;
        }

        // Handle different jump mechanics
        this.handleJumpMechanics();
    }

    handleJumpMechanics() {
        // Reset jumps when landing
        if (this.onGround) {
            this.jumpsRemaining = this.maxJumps;
            this.coyoteTime = this.maxCoyoteTime;

            // Spring shoes effect - bounce on landing
            if (this.consumableEffects && this.consumableEffects.springShoes && this.velocityY > 5) {
                this.velocityY = -this.jumpPower * 0.7; // 70% bounce
                this.onGround = false;
            }
        } else if (this.coyoteTime > 0) {
            this.coyoteTime--;
        }

        // Check if jump was just pressed (transition from not pressed to pressed)
        const jumpPressed = this.keys.jump && !this.jumpHeld;

        // Update jump held state AFTER checking for press
        this.jumpHeld = this.keys.jump;

        switch (this.jumpMode) {
            case 'mario':
                this.handleMarioJump(jumpPressed);
                break;
            case 'hollow':
                this.handleHollowKnightJump(jumpPressed);
                break;
            case 'celeste':
                this.handleCelesteJump(jumpPressed);
                break;
            case 'sonic':
                this.handleSonicJump(jumpPressed);
                break;
            case 'megaman':
                this.handleMegaManJump(jumpPressed);
                break;
            default:
                this.handleMarioJump(jumpPressed);
        }
    }

    handleMarioJump(jumpPressed) {
        // Classic fixed-height jump with multi-jump support
        if (jumpPressed && this.jumpsRemaining > 0) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.coyoteTime = 0;
            this.jumpsRemaining--;
            this.spawnJumpParticles();

            // Play jump sound
            if (this.soundManager) {
                this.soundManager.playJump();
            }
        }
    }

    handleHollowKnightJump(jumpPressed) {
        // Initial jump with minimum height and multi-jump support
        if (jumpPressed && this.jumpsRemaining > 0) {
            this.velocityY = -this.jumpPower * 0.4; // Start with minimum jump
            this.jumpTimer = this.maxJumpTime;
            this.onGround = false;
            this.coyoteTime = 0;
            this.jumpsRemaining--;
            this.spawnJumpParticles();

            // Play jump sound
            if (this.soundManager) {
                this.soundManager.playJump();
            }
        }

        // Continue adding upward velocity while holding jump
        if (this.keys.jump && this.jumpTimer > 0 && this.velocityY < 0) {
            this.velocityY -= 0.4; // Continuous lift while holding
            this.jumpTimer--;
        }

        // If jump is released early, reduce upward velocity for quick descent
        if (!this.keys.jump && this.velocityY < -2) {
            this.velocityY *= 0.6; // Quick fall when releasing early
        }
    }

    handleCelesteJump(jumpPressed) {
        // Precise variable height with quick release and multi-jump support
        if (jumpPressed && this.jumpsRemaining > 0) {
            this.velocityY = -this.jumpPower * 0.6; // Start with lower power
            this.jumpTimer = this.maxJumpTime;
            this.onGround = false;
            this.coyoteTime = 0;
            this.jumpsRemaining--;
            this.spawnJumpParticles();

            // Play jump sound
            if (this.soundManager) {
                this.soundManager.playJump();
            }
        }

        // Build up jump power while holding
        if (this.keys.jump && this.jumpTimer > 0 && this.velocityY < 0) {
            this.velocityY -= 0.5;
            this.jumpTimer--;
        }

        // Quick fall when releasing
        if (!this.keys.jump && this.velocityY < 0) {
            this.velocityY *= 0.7;
        }
    }

    handleSonicJump(jumpPressed) {
        // Momentum-based jumping with multi-jump support
        const speedMultiplier = Math.abs(this.velocityX) / this.moveSpeed;
        const jumpBoost = 1 + speedMultiplier * 0.3;

        if (jumpPressed && this.jumpsRemaining > 0) {
            this.velocityY = -this.jumpPower * jumpBoost;
            this.onGround = false;
            this.coyoteTime = 0;
            this.jumpsRemaining--;
            this.spawnJumpParticles();

            // Play jump sound
            if (this.soundManager) {
                this.soundManager.playJump();
            }
        }
    }

    handleMegaManJump(jumpPressed) {
        // Fixed arc jump with multi-jump support - no air control
        if (jumpPressed && this.jumpsRemaining > 0) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.coyoteTime = 0;
            this.jumpsRemaining--;
            this.spawnJumpParticles();

            // Play jump sound
            if (this.soundManager) {
                this.soundManager.playJump();
            }
        }

        // Reduce air control
        if (!this.onGround) {
            this.velocityX *= 0.98;
        }
    }

    spawnJumpParticles() {
        // Spawn particles when jumping - spray opposite to movement direction (light/subtle)
        const particleCount = 6; // Fewer particles for lighter effect
        const colors = ['#FF8888', '#FFAA88', '#FFCC88', '#FFE0AA']; // Lighter orange/peach tones

        for (let i = 0; i < particleCount; i++) {
            // Spray downward and opposite to player's horizontal movement
            const baseAngle = Math.PI / 2; // Downward
            const spread = (Math.random() - 0.5) * Math.PI * 0.8; // Wide spread
            const angle = baseAngle + spread;

            const speed = Math.random() * 3 + 2; // Slower speed
            // Push particles opposite to player velocity
            const vx = Math.cos(angle) * speed - this.velocityX * 0.5;
            const vy = Math.abs(Math.sin(angle) * speed); // Always downward

            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                y: this.y + this.height,
                vx: vx,
                vy: vy,
                life: 20 + Math.random() * 10, // Shorter lifespan
                maxLife: 20 + Math.random() * 10,
                size: Math.random() * 3 + 2, // Smaller particles
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    spawnLandingParticles() {
        // Spawn particles when landing - spray forward based on landing velocity
        const particleCount = 18;
        const colors = ['#FF0000', '#FF3333', '#FF6666', '#FF8800']; // Bright reds and orange

        // Impact intensity based on landing velocity
        const impactForce = Math.abs(this.velocityY) * 0.3;

        for (let i = 0; i < particleCount; i++) {
            // Spray forward and to the sides based on movement direction
            const baseAngle = Math.PI / 2; // Start downward/sideways
            const spread = (Math.random() - 0.5) * Math.PI; // Full spread
            const angle = baseAngle + spread;

            const speed = Math.random() * 5 + 3 + impactForce;
            // Push particles forward with player velocity
            const vx = Math.cos(angle) * speed + this.velocityX * 0.8;
            const vy = Math.abs(Math.sin(angle) * speed * 0.3); // Mostly sideways

            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                y: this.y + this.height,
                vx: vx,
                vy: vy,
                life: 35 + Math.random() * 20,
                maxLife: 35 + Math.random() * 20,
                size: Math.random() * 6 + 3 + impactForce * 0.5,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    updateParticles() {
        // Update and remove dead particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.vx *= 0.98; // Air resistance
            p.life--;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    update(physics, platforms) {
        // Update smooth size transitions from mushrooms
        this.updateSizeTransition();

        // Update timers
        if (this.isDying) {
            this.deathAnimationTimer--;

            // Handle final death animation with special effects
            if (this.finalDeath) {
                this.updateFinalDeathAnimation();
            }

            if (this.deathAnimationTimer <= 0) {
                return 'death_complete';
            }
        }

        if (this.invulnerable) {
            this.invulnerabilityTimer--;
            if (this.invulnerabilityTimer <= 0) {
                this.invulnerable = false;
            }
        }

        this.handleInput();

        // Apply gravity only when not on a ladder
        if (!this.onLadder) {
            physics.applyGravity(this);

            // Wings glide mechanic - reduce fall speed when holding jump in air
            if (this.consumableEffects && this.consumableEffects.wings && !this.onGround && this.keys.jump && this.velocityY > 0) {
                this.velocityY *= 0.5; // Reduce fall speed by 50%
            }
        }

        physics.updatePosition(this);

        // Check platform collisions first
        if (platforms) {
            platforms.checkCollisions(this);
            // Apply friction only if we're on ground and not on a platform
            if (this.onGround && this.y + this.height >= physics.groundLevel - 5) {
                physics.applyFriction(this);
            }
        } else {
            // Fallback to ground collision and friction
            physics.checkCollisions(this);
            physics.applyFriction(this);
        }

        // Detect landing and spawn particles
        if (this.onGround && !this.wasOnGround) {
            this.spawnLandingParticles();

            // Play landing sound
            if (this.soundManager) {
                this.soundManager.playLand();
            }
        }
        this.wasOnGround = this.onGround;

        // Update particles
        this.updateParticles();

        return 'playing';
    }

    render(ctx) {
        // Render particles first (behind player) with glow
        for (let p of this.particles) {
            const alpha = p.life / p.maxLife;

            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;

            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }

        // Reset shadow and alpha
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Flicker effect during invulnerability
        if (this.invulnerable && Math.floor(this.invulnerabilityTimer / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.isDying) {
            if (this.finalDeath) {
                this.renderFinalDeath(ctx);
            } else {
                this.renderRegularDeath(ctx);
            }
        } else {
            this.renderNormal(ctx);
        }

        // Reset alpha
        ctx.globalAlpha = 1;

        // Show velocity info (only when alive)
        if (!this.isDying) {
            ctx.fillStyle = 'black';
            ctx.font = '12px Arial';
            ctx.fillText(`vX: ${this.velocityX.toFixed(1)}`, this.x, this.y - 20);
            ctx.fillText(`vY: ${this.velocityY.toFixed(1)}`, this.x, this.y - 5);
            ctx.fillText(this.onGround ? 'Grounded' : 'Airborne', this.x, this.y + this.height + 15);
        }
    }

    renderNormal(ctx) {
        // Add glow effect when size is transitioning
        const isTransitioning = Math.abs(this.sizeMultiplier - this.targetSizeMultiplier) > 0.01;
        if (isTransitioning) {
            const isGrowing = this.targetSizeMultiplier > this.sizeMultiplier;
            ctx.shadowBlur = 20;
            ctx.shadowColor = isGrowing ? '#FFD700' : '#9370DB'; // Gold for growing, purple for shrinking
        }

        // Normal player rendering
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Reset shadow
        ctx.shadowBlur = 0;

        // Add a simple face (scaled to player size)
        const eyeSize = Math.max(4, this.width * 0.15);
        const eyeOffset = Math.max(6, this.width * 0.2);
        const eyeY = Math.max(6, this.height * 0.2);

        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + eyeOffset, this.y + eyeY, eyeSize, eyeSize);  // Left eye
        ctx.fillRect(this.x + this.width - eyeOffset - eyeSize, this.y + eyeY, eyeSize, eyeSize); // Right eye

        // Simple mouth (scaled)
        const mouthWidth = Math.max(12, this.width * 0.4);
        const mouthHeight = Math.max(2, this.height * 0.075);
        const mouthY = Math.max(20, this.height * 0.625);
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + (this.width - mouthWidth) / 2, this.y + mouthY, mouthWidth, mouthHeight);
    }

    renderRegularDeath(ctx) {
        // Regular death animation - simple spin and fade
        if (this.deathAnimationTimer < 20) {
            const alpha = this.deathAnimationTimer / 20;
            ctx.globalAlpha = alpha;
        }
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate((this.maxDeathAnimationTime - this.deathAnimationTimer) * 0.2);
        ctx.translate(-this.width/2, -this.height/2);
        
        // Death color - red
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, this.width, this.height);
        
        // X eyes for death
        ctx.fillStyle = 'white';
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(8, 8);
        ctx.lineTo(14, 14);
        ctx.moveTo(14, 8);
        ctx.lineTo(8, 14);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(26, 8);
        ctx.lineTo(32, 14);
        ctx.moveTo(32, 8);
        ctx.lineTo(26, 14);
        ctx.stroke();
        
        ctx.restore();
        
        // Simple particles
        const particleCount = Math.floor((this.maxDeathAnimationTime - this.deathAnimationTimer) / 3);
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const dist = (this.maxDeathAnimationTime - this.deathAnimationTimer) * 2;
            const px = this.x + this.width/2 + Math.cos(angle) * dist;
            const py = this.y + this.height/2 + Math.sin(angle) * dist;
            
            ctx.fillStyle = `rgba(255, 0, 0, ${this.deathAnimationTimer / this.maxDeathAnimationTime})`;
            ctx.fillRect(px - 2, py - 2, 4, 4);
        }
    }

    renderFinalDeath(ctx) {
        const timeLeft = this.deathAnimationTimer;
        const progress = 1 - (timeLeft / this.maxDeathAnimationTime);
        
        // Phase-based rendering
        if (timeLeft > 120) {
            // Phase 1: Flaming zigzag hero
            this.renderFlamingHero(ctx, progress);
        } else if (timeLeft > 60) {
            // Phase 2: Growing with intense flames
            this.renderGrowingFlames(ctx, progress);
        } else {
            // Phase 3: Final explosion and glitchy cross
            this.renderFinalExplosion(ctx, progress);
        }
        
        // Render flame particles
        for (let particle of this.flameParticles) {
            const alpha = particle.life / particle.maxLife;
            const colors = ['#FF0000', '#FF8800', '#FFAA00', '#FFFF00'];
            const colorIndex = Math.floor((1 - alpha) * (colors.length - 1));
            
            ctx.fillStyle = colors[colorIndex];
            ctx.globalAlpha = alpha;
            ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        }
        
        ctx.globalAlpha = 1;
    }

    renderFlamingHero(ctx, progress) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.zigzagTimer * 0.3);
        
        // Flaming hero body - orange to red gradient
        ctx.fillStyle = '#FF4400';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Flame outline
        ctx.strokeStyle = '#FF8800';
        ctx.lineWidth = 3;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Determined eyes (still fighting)
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(-12, -8, 6, 6);
        ctx.fillRect(6, -8, 6, 6);
        
        ctx.restore();
    }

    renderGrowingFlames(ctx, progress) {
        const sizeMultiplier = 1 + (progress - 0.33) * 6; // Size grows dramatically
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(progress * Math.PI * 4);
        
        // Massive flaming form
        const renderSize = this.originalSize * sizeMultiplier;
        ctx.fillStyle = '#CC0000';
        ctx.fillRect(-renderSize/2, -renderSize/2, renderSize, renderSize);
        
        // Multiple flame layers
        for (let i = 0; i < 3; i++) {
            const layerSize = renderSize * (0.8 - i * 0.2);
            const colors = ['#FF0000', '#FF6600', '#FFAA00'];
            ctx.fillStyle = colors[i];
            ctx.fillRect(-layerSize/2, -layerSize/2, layerSize, layerSize);
        }
        
        ctx.restore();
    }

    renderFinalExplosion(ctx, progress) {
        // Glitch effect on position
        const glitchX = Math.sin(this.glitchTimer) * 5;
        const glitchY = Math.cos(this.glitchTimer * 1.3) * 3;
        
        ctx.save();
        ctx.translate(this.x + this.width/2 + glitchX, this.y + this.height/2 + glitchY);
        
        // Final form - pure energy
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
        
        // Glitchy RGB split effect
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(-this.width/2 + 2, -this.height/2, this.width, this.height);
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(-this.width/2 - 1, -this.height/2 + 1, this.width, this.height);
        ctx.fillStyle = '#0000FF';
        ctx.fillRect(-this.width/2 - 1, -this.height/2 - 1, this.width, this.height);
        ctx.globalCompositeOperation = 'source-over';
        
        // Giant glitchy death cross
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.8 + Math.sin(this.glitchTimer * 2) * 0.2;
        
        // Cross with glitch offsets
        const crossSize = this.width * 0.8;
        ctx.beginPath();
        ctx.moveTo(-crossSize/2, -crossSize/2);
        ctx.lineTo(crossSize/2 + Math.sin(this.glitchTimer) * 3, crossSize/2);
        ctx.moveTo(crossSize/2, -crossSize/2);
        ctx.lineTo(-crossSize/2 + Math.cos(this.glitchTimer * 1.5) * 3, crossSize/2);
        ctx.stroke();
        
        ctx.restore();
        
        // Render glitchy "Divided by zero" text
        if (this.deathAnimationTimer < 50) {
            this.renderGlitchText(ctx);
        }
    }

    renderGlitchText(ctx) {
        const text = "DIVIDED BY ZERO";
        const baseX = this.x + this.width/2;
        const baseY = this.y - 40;
        
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        
        // Multiple glitchy layers
        for (let i = 0; i < 5; i++) {
            const glitchOffsetX = (Math.random() - 0.5) * 8;
            const glitchOffsetY = (Math.random() - 0.5) * 4;
            const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
            
            ctx.fillStyle = colors[i];
            ctx.globalAlpha = 0.3 + Math.random() * 0.4;
            
            // Sometimes skip letters for glitch effect
            let glitchedText = "";
            for (let j = 0; j < text.length; j++) {
                if (Math.random() > 0.2) {
                    glitchedText += text[j];
                } else {
                    glitchedText += String.fromCharCode(33 + Math.floor(Math.random() * 94));
                }
            }
            
            ctx.fillText(glitchedText, baseX + glitchOffsetX, baseY + glitchOffsetY);
        }
        
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    }

    setKeyState(key, pressed) {
        switch(key) {
            case 'ArrowLeft':
            case 'KeyA':
                this.keys.left = pressed;
                break;
            case 'ArrowRight':
            case 'KeyD':
                this.keys.right = pressed;
                break;
            case 'ArrowUp':
            case 'KeyW':
            case 'Space':
                this.keys.jump = pressed;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.keys.shift = pressed;
                break;
        }
    }
}