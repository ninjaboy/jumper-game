class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.color = '#e74c3c';
        
        // Configurable properties
        this.moveSpeed = 5;
        this.jumpPower = 15;
        
        // Jump mechanics
        this.jumpMode = 'mario';
        this.jumpHeld = false;
        this.jumpTimer = 0;
        this.maxJumpTime = 20; // frames for variable height jumps
        this.coyoteTime = 0;
        this.maxCoyoteTime = 6; // frames of coyote time
        
        // Life system
        this.lives = 3;
        this.maxLives = 3;
        this.isDying = false;
        this.deathAnimationTimer = 0;
        this.maxDeathAnimationTime = 480; // Much longer - 8 seconds at 60fps
        this.invulnerable = false;
        this.invulnerabilityTimer = 0;
        this.maxInvulnerabilityTime = 120; // 2 seconds at 60fps
        
        // Input state
        this.keys = {
            left: false,
            right: false,
            up: false,
            jump: false
        };
    }

    updateMoveSpeed(value) {
        this.moveSpeed = parseFloat(value);
    }

    updateJumpPower(value) {
        this.jumpPower = parseFloat(value);
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
        
        // Horizontal movement with better air control
        if (this.keys.left) {
            if (this.onGround) {
                this.velocityX = -this.moveSpeed;
            } else {
                // Air control - gradually adjust velocity
                this.velocityX += -this.moveSpeed * 0.3;
                this.velocityX = Math.max(this.velocityX, -this.moveSpeed);
            }
        } else if (this.keys.right) {
            if (this.onGround) {
                this.velocityX = this.moveSpeed;
            } else {
                // Air control - gradually adjust velocity
                this.velocityX += this.moveSpeed * 0.3;
                this.velocityX = Math.min(this.velocityX, this.moveSpeed);
            }
        } else if (!this.onGround) {
            // Air drag when no input
            this.velocityX *= 0.95;
        }

        // Handle different jump mechanics
        this.handleJumpMechanics();
    }

    handleJumpMechanics() {
        // Update coyote time
        if (this.onGround) {
            this.coyoteTime = this.maxCoyoteTime;
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
        // Classic fixed-height jump
        if (jumpPressed && (this.onGround || this.coyoteTime > 0)) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.coyoteTime = 0;
        }
    }

    handleHollowKnightJump(jumpPressed) {
        // Initial jump with minimum height
        if (jumpPressed && (this.onGround || this.coyoteTime > 0)) {
            this.velocityY = -this.jumpPower * 0.4; // Start with minimum jump
            this.jumpTimer = this.maxJumpTime;
            this.onGround = false;
            this.coyoteTime = 0;
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
        // Precise variable height with quick release
        if (jumpPressed && (this.onGround || this.coyoteTime > 0)) {
            this.velocityY = -this.jumpPower * 0.6; // Start with lower power
            this.jumpTimer = this.maxJumpTime;
            this.onGround = false;
            this.coyoteTime = 0;
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
        // Momentum-based jumping
        const speedMultiplier = Math.abs(this.velocityX) / this.moveSpeed;
        const jumpBoost = 1 + speedMultiplier * 0.3;
        
        if (jumpPressed && (this.onGround || this.coyoteTime > 0)) {
            this.velocityY = -this.jumpPower * jumpBoost;
            this.onGround = false;
            this.coyoteTime = 0;
        }
    }

    handleMegaManJump(jumpPressed) {
        // Fixed arc jump - no air control
        if (jumpPressed && (this.onGround || this.coyoteTime > 0)) {
            this.velocityY = -this.jumpPower;
            this.onGround = false;
            this.coyoteTime = 0;
        }
        
        // Reduce air control
        if (!this.onGround) {
            this.velocityX *= 0.98;
        }
    }

    update(physics, platforms) {
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
        
        physics.applyGravity(this);
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
        
        return 'playing';
    }

    render(ctx) {
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
        // Normal player rendering
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add a simple face
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 8, this.y + 8, 6, 6);  // Left eye
        ctx.fillRect(this.x + 26, this.y + 8, 6, 6); // Right eye
        
        // Simple mouth
        ctx.fillStyle = 'black';
        ctx.fillRect(this.x + 12, this.y + 25, 16, 3);
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
        
        // Extended phase-based rendering (8 seconds total)
        if (timeLeft > 360) {
            // Phase 1: Flaming zigzag hero (3 seconds)
            this.renderFlamingHero(ctx, progress);
        } else if (timeLeft > 240) {
            // Phase 2: Growing with intense flames (2 seconds)
            this.renderGrowingFlames(ctx, progress);
        } else if (timeLeft > 120) {
            // Phase 3: Expanding explosion (2 seconds)
            this.renderExpandingExplosion(ctx, progress);
        } else {
            // Phase 4: Final glitchy cross with instructions (2 seconds)
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

    renderGlitchyInstructions(ctx) {
        const instructions = [
            "PRESS R TO RESTART",
            "PRESS N FOR NEW LEVEL",
            "SYSTEM FAILURE...",
            "REALITY.EXE STOPPED"
        ];
        
        const baseX = this.x + this.width/2;
        const baseY = this.y + this.height + 80;
        
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < instructions.length; i++) {
            const text = instructions[i];
            const yOffset = i * 35; // Increased line spacing
            
            // Heavy glitch effect
            const glitchIntensity = Math.sin(this.glitchTimer * 3 + i) * 8;
            const pixelShift = Math.random() > 0.7 ? Math.floor(Math.random() * 6) - 3 : 0;
            
            // Randomize character corruption (less corruption for readability)
            let corruptedText = "";
            for (let j = 0; j < text.length; j++) {
                if (Math.random() > 0.92) { // Reduced corruption frequency
                    // Random glitch characters
                    const glitchChars = "!@#$%^&*(){}[]|\\:;\"'<>?,./~`";
                    corruptedText += glitchChars[Math.floor(Math.random() * glitchChars.length)];
                } else {
                    corruptedText += text[j];
                }
            }
            
            // Multiple color passes for RGB split effect - much brighter
            const colors = ['#FF4444', '#44FF44', '#4444FF', '#FFFFFF'];
            for (let c = 0; c < colors.length; c++) {
                ctx.fillStyle = colors[c];
                ctx.globalAlpha = 0.95 - c * 0.05; // Much brighter - starts at 95% opacity
                
                const xShift = pixelShift + (c - 1) * 3; // Increased shift for more dramatic effect
                const yShift = Math.sin(this.glitchTimer * 2 + c) * 3;
                
                ctx.fillText(
                    corruptedText,
                    baseX + glitchIntensity + xShift,
                    baseY + yOffset + yShift
                );
            }
            
            // Add a bright white outline for extra visibility
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.8;
            ctx.strokeText(
                corruptedText,
                baseX + glitchIntensity,
                baseY + yOffset
            );
        }
        
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
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

    renderExpandingExplosion(ctx, progress) {
        // Phase 3: Massive expanding explosion
        const explosionSize = this.originalSize * (5 + progress * 15); // Grows to 20x size
        const rotationSpeed = progress * Math.PI * 8;
        
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        
        // Create explosive rings
        for (let ring = 0; ring < 5; ring++) {
            const ringProgress = (progress * 5 - ring);
            if (ringProgress <= 0) continue;
            
            const ringSize = explosionSize * ringProgress * (1 - ring * 0.2);
            const alpha = Math.max(0, 1 - ringProgress);
            
            ctx.save();
            ctx.rotate(rotationSpeed * (ring % 2 === 0 ? 1 : -1));
            ctx.globalAlpha = alpha;
            
            // Explosion colors - white hot center to red edges
            const colors = ['#FFFFFF', '#FFFF00', '#FF8800', '#FF0000', '#CC0000'];
            ctx.fillStyle = colors[ring] || '#CC0000';
            ctx.fillRect(-ringSize/2, -ringSize/2, ringSize, ringSize);
            
            // Add some spiky edges
            for (let spike = 0; spike < 8; spike++) {
                const angle = (spike / 8) * Math.PI * 2;
                const spikeLength = ringSize * 0.3;
                const spikeX = Math.cos(angle) * ringSize * 0.6;
                const spikeY = Math.sin(angle) * ringSize * 0.6;
                
                ctx.fillRect(spikeX - 3, spikeY - 3, 6, spikeLength);
            }
            
            ctx.restore();
        }
        
        // Screen shake effect simulation with white flash
        if (progress > 0.8) {
            ctx.fillStyle = `rgba(255, 255, 255, ${(progress - 0.8) * 2})`;
            ctx.fillRect(-400, -300, 800, 600);
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
        
        // Render glitchy "Divided by zero" text and instructions
        if (this.deathAnimationTimer < 80) {
            this.renderGlitchText(ctx);
        }
        
        // Add glitchy instructions text that appears near the end
        if (this.deathAnimationTimer < 60) {
            this.renderGlitchyInstructions(ctx);
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
        }
    }
}