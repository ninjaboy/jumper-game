// ============================================================================
// CONSUMABLE SYSTEM - Scalable architecture supporting hundreds of consumables
// ============================================================================

// Base Consumable class - All consumables extend this
class Consumable {
    constructor(config) {
        // Core properties
        this.id = config.id;
        this.name = config.name;
        this.description = config.description;

        // Position and size
        this.x = config.x;
        this.y = config.y;
        this.width = config.width || 30;
        this.height = config.height || 30;

        // Visual properties
        this.color = config.color || '#FFD700';
        this.icon = config.icon || '?';
        this.glowColor = config.glowColor || this.color;

        // Effect properties
        this.duration = config.duration || 0; // 0 = permanent, >0 = temporary (in frames)
        this.effectType = config.effectType || 'passive'; // 'passive', 'active', 'instant'

        // State
        this.collected = false;
        this.animationTimer = 0;
        this.floatOffset = 0;
        this.particles = [];

        // Callbacks
        this.onPickupCallback = config.onPickup;
        this.onExpireCallback = config.onExpire;
        this.onUpdateCallback = config.onUpdate;
    }

    update() {
        if (this.collected) return;

        // Floating animation
        this.animationTimer += 0.05;
        this.floatOffset = Math.sin(this.animationTimer) * 5;

        // Generate particles
        if (Math.random() < 0.3) {
            this.particles.push({
                x: this.x + this.width / 2 + (Math.random() - 0.5) * this.width,
                y: this.y + this.height / 2 + (Math.random() - 0.5) * this.height,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2,
                life: 30,
                maxLife: 30,
                size: Math.random() * 3 + 1
            });
        }

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });

        // Custom update logic
        if (this.onUpdateCallback) {
            this.onUpdateCallback(this);
        }
    }

    render(ctx) {
        if (this.collected) return;

        const displayY = this.y + this.floatOffset;

        // Draw particles
        for (let particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = this.glowColor;
            ctx.globalAlpha = alpha * 0.6;
            ctx.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
        }
        ctx.globalAlpha = 1;

        // Draw glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.glowColor;

        // Draw consumable box
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, displayY, this.width, this.height);

        // Draw border
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, displayY, this.width, this.height);

        // Draw icon
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x + this.width/2, displayY + this.height/2);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        // Draw name below
        ctx.font = '10px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width/2, displayY + this.height + 12);
        ctx.textAlign = 'left';
    }

    checkCollision(player) {
        if (this.collected) return false;

        return player.x + player.width > this.x &&
               player.x < this.x + this.width &&
               player.y + player.height > this.y &&
               player.y < this.y + this.height + 10;
    }

    onPickup(player, game) {
        if (this.collected) return;

        this.collected = true;

        // Call custom pickup logic
        if (this.onPickupCallback) {
            this.onPickupCallback(player, this, game);
        }

        return {
            name: this.name,
            description: this.description,
            duration: this.duration,
            icon: this.icon,
            consumable: this
        };
    }

    onExpire(player, game) {
        // Call custom expire logic
        if (this.onExpireCallback) {
            this.onExpireCallback(player, this, game);
        }
    }
}

// ============================================================================
// SPECIFIC CONSUMABLE TYPES
// ============================================================================

class DoubleJumpConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'double_jump',
            name: 'Double Jump',
            description: 'Jump again in mid-air!',
            x: x,
            y: y,
            color: '#00CED1',
            glowColor: '#00FFFF',
            icon: '⬆',
            duration: 0, // Permanent
            effectType: 'passive',
            onPickup: (player, consumable, game) => {
                player.maxJumps = 2;
                player.consumableEffects.doubleJump = true;
            }
        });
    }
}

class TripleJumpConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'triple_jump',
            name: 'Triple Jump',
            description: 'Jump three times in mid-air!',
            x: x,
            y: y,
            color: '#9370DB',
            glowColor: '#DA70D6',
            icon: '⬆⬆',
            duration: 0, // Permanent
            effectType: 'passive',
            onPickup: (player, consumable, game) => {
                player.maxJumps = 3;
                player.consumableEffects.tripleJump = true;
            }
        });
    }
}

class SpeedBoostConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'speed_boost',
            name: 'Speed Boost',
            description: 'Move faster for 10 seconds!',
            x: x,
            y: y,
            color: '#FF6347',
            glowColor: '#FF4500',
            icon: '⚡',
            duration: 600, // 10 seconds at 60fps
            effectType: 'active',
            onPickup: (player, consumable, game) => {
                if (!player.originalMoveSpeed) {
                    player.originalMoveSpeed = player.moveSpeed;
                }
                player.moveSpeed = player.originalMoveSpeed * 1.5;
            },
            onExpire: (player, consumable, game) => {
                if (player.originalMoveSpeed) {
                    player.moveSpeed = player.originalMoveSpeed;
                    player.originalMoveSpeed = null;
                }
            }
        });
    }
}

class HealthConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'health',
            name: 'Extra Life',
            description: 'Gain one extra life!',
            x: x,
            y: y,
            color: '#FF69B4',
            glowColor: '#FF1493',
            icon: '♥',
            duration: 0,
            effectType: 'instant',
            onPickup: (player, consumable, game) => {
                player.lives = Math.min(player.lives + 1, player.maxLives);
            }
        });
    }
}

// ============================================================================
// CONSUMABLE MANAGER
// ============================================================================

class ConsumableManager {
    constructor() {
        this.consumables = [];
        this.activeEffects = [];
        this.pickupNotifications = [];
    }

    // Spawn a consumable
    spawnConsumable(consumableClass, x, y) {
        const consumable = new consumableClass(x, y);
        this.consumables.push(consumable);
        return consumable;
    }

    // Spawn random consumables in level
    spawnRandomConsumables(levelWidth, rng) {
        const consumableTypes = [
            DoubleJumpConsumable,
            TripleJumpConsumable,
            SpeedBoostConsumable,
            HealthConsumable
        ];

        // Spawn 5-10 consumables throughout the level
        const count = rng.randomInt(5, 10);

        for (let i = 0; i < count; i++) {
            const x = rng.randomInt(300, levelWidth - 300);
            const y = rng.randomInt(250, 400);
            const ConsumableClass = rng.choice(consumableTypes);

            this.spawnConsumable(ConsumableClass, x, y);
        }
    }

    update(player, game) {
        // Update all consumables
        for (let consumable of this.consumables) {
            consumable.update();

            // Check collision with player
            if (!consumable.collected && consumable.checkCollision(player)) {
                const pickupInfo = consumable.onPickup(player, game);

                // Add to active effects if it has a duration
                if (consumable.duration > 0) {
                    this.activeEffects.push({
                        consumable: consumable,
                        timeRemaining: consumable.duration,
                        info: pickupInfo
                    });
                }

                // Create pickup notification
                this.createPickupNotification(pickupInfo, player);
            }
        }

        // Update active effects
        this.activeEffects = this.activeEffects.filter(effect => {
            effect.timeRemaining--;

            if (effect.timeRemaining <= 0) {
                effect.consumable.onExpire(player, game);
                return false;
            }
            return true;
        });

        // Update pickup notifications
        this.pickupNotifications = this.pickupNotifications.filter(notification => {
            notification.life--;
            notification.y -= 1;
            notification.scale = Math.min(1, notification.life / 10);
            return notification.life > 0;
        });
    }

    createPickupNotification(pickupInfo, player) {
        this.pickupNotifications.push({
            text: `+${pickupInfo.name}`,
            icon: pickupInfo.icon,
            x: player.x + player.width / 2,
            y: player.y - 20,
            life: 90, // 1.5 seconds
            maxLife: 90,
            scale: 0
        });
    }

    render(ctx, camera) {
        // Render consumables (with camera translation)
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        for (let consumable of this.consumables) {
            consumable.render(ctx);
        }

        ctx.restore();

        // Render pickup notifications (fixed position, but track world position)
        for (let notification of this.pickupNotifications) {
            const screenX = notification.x - camera.x;
            const screenY = notification.y - camera.y;

            const alpha = notification.life / notification.maxLife;
            ctx.globalAlpha = alpha;

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.scale(notification.scale, notification.scale);

            // Draw background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(-60, -15, 120, 30);

            // Draw text
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(notification.text, 0, 0);

            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }

    renderUI(ctx, canvas, player) {
        // Display active effects in UI
        const hasActiveEffects = this.activeEffects.length > 0;
        const hasJumpUpgrade = player && player.maxJumps > 1;

        if (!hasActiveEffects && !hasJumpUpgrade) return;

        const startY = 140;
        let currentY = startY;

        // Calculate total height needed
        let totalHeight = 30;
        if (hasActiveEffects) totalHeight += this.activeEffects.length * 25;
        if (hasJumpUpgrade) totalHeight += 25;

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(5, startY, 250, totalHeight);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('Active Effects:', 10, startY + 20);
        currentY = startY + 40;

        // Show jump upgrade (permanent)
        if (hasJumpUpgrade) {
            ctx.font = '12px Arial';
            if (player.maxJumps === 2) {
                ctx.fillStyle = '#00CED1';
                ctx.fillText('⬆ Double Jump', 15, currentY);
            } else if (player.maxJumps === 3) {
                ctx.fillStyle = '#9370DB';
                ctx.fillText('⬆⬆ Triple Jump', 15, currentY);
            }
            ctx.fillStyle = 'white';
            ctx.fillText('∞', 200, currentY);
            currentY += 25;
        }

        // Show temporary effects
        ctx.font = '12px Arial';
        for (let i = 0; i < this.activeEffects.length; i++) {
            const effect = this.activeEffects[i];
            const timeLeft = Math.ceil(effect.timeRemaining / 60);

            ctx.fillStyle = effect.consumable.color;
            ctx.fillText(`${effect.info.icon} ${effect.info.name}`, 15, currentY);
            ctx.fillStyle = 'white';
            ctx.fillText(`${timeLeft}s`, 200, currentY);
            currentY += 25;
        }
    }

    reset() {
        this.consumables = [];
        this.activeEffects = [];
        this.pickupNotifications = [];
    }
}
