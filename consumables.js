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
        this.rarity = config.rarity || 'common'; // 'common', 'uncommon', 'rare', 'cursed'

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
            name: 'Extra Jump',
            description: 'Adds +1 mid-air jump! (Stacks)',
            x: x,
            y: y,
            color: '#00CED1',
            glowColor: '#00FFFF',
            icon: '⬆',
            duration: 0, // Permanent
            effectType: 'passive',
            rarity: 'uncommon', // More common now (was rare)
            onPickup: (player, consumable, game) => {
                player.maxJumps += 1; // Add one jump instead of setting to 2
                player.consumableEffects.doubleJump = true;
            }
        });
    }
}

class TripleJumpConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'triple_jump',
            name: 'Extra Jump x2',
            description: 'Adds +2 mid-air jumps! (Stacks)',
            x: x,
            y: y,
            color: '#9370DB',
            glowColor: '#DA70D6',
            icon: '⬆⬆',
            duration: 0, // Permanent
            effectType: 'passive',
            rarity: 'rare',
            onPickup: (player, consumable, game) => {
                player.maxJumps += 2; // Add two jumps instead of setting to 3
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
            duration: 1200, // 20 seconds at 60fps
            effectType: 'active',
            rarity: 'common',
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
            rarity: 'common',
            onPickup: (player, consumable, game) => {
                // Increase both current lives and max lives (no cap!)
                player.lives++;
                player.maxLives = Math.max(player.maxLives, player.lives);
            }
        });
    }
}

// ============================================================================
// GRAVITY & PHYSICS CONSUMABLES
// ============================================================================

class FeatherConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'feather',
            name: 'Feather of Falling',
            description: 'Reduced gravity - float like a feather!',
            x: x,
            y: y,
            color: '#E6E6FA',
            glowColor: '#DDA0DD',
            icon: '🪶',
            duration: 900, // 15 seconds
            effectType: 'active',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                if (player.originalGravity === null) {
                    player.originalGravity = game.physics.gravity;
                }
                player.gravity = player.originalGravity * 0.5;
            },
            onExpire: (player, consumable, game) => {
                player.gravity = null; // Revert to physics default
                player.originalGravity = null;
            }
        });
    }
}

class AnvilCurseConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'anvil',
            name: 'Anvil Curse',
            description: 'HEAVY! Increased gravity!',
            x: x,
            y: y,
            color: '#696969',
            glowColor: '#2F4F4F',
            icon: '⚓',
            duration: 720, // 12 seconds
            effectType: 'active',
            rarity: 'cursed',
            onPickup: (player, consumable, game) => {
                if (player.originalGravity === null) {
                    player.originalGravity = game.physics.gravity;
                }
                player.gravity = player.originalGravity * 2.0;
            },
            onExpire: (player, consumable, game) => {
                player.gravity = null; // Revert to physics default
                player.originalGravity = null;
            }
        });
    }
}

class RocketBootsConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'rocket_boots',
            name: 'Rocket Boots',
            description: 'Jump MUCH higher!',
            x: x,
            y: y,
            color: '#FF8C00',
            glowColor: '#FF4500',
            icon: '🚀',
            duration: 900, // 15 seconds
            effectType: 'active',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                if (player.originalJumpPower === null) {
                    player.originalJumpPower = player.jumpPower;
                }
                player.jumpPower = player.originalJumpPower * 1.8;
            },
            onExpire: (player, consumable, game) => {
                player.jumpPower = player.originalJumpPower;
                player.originalJumpPower = null;
            }
        });
    }
}

class SpringShoesConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'spring_shoes',
            name: 'Spring Shoes',
            description: 'Bounce on landing!',
            x: x,
            y: y,
            color: '#32CD32',
            glowColor: '#00FF00',
            icon: '👟',
            duration: 900, // 15 seconds
            effectType: 'active',
            rarity: 'common',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.springShoes = true;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.springShoes = false;
            }
        });
    }
}

// ============================================================================
// SIZE MODIFICATION CONSUMABLES
// ============================================================================

class GiantMushroomConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'giant_mushroom',
            name: 'Giant Mushroom',
            description: 'Grow bigger! (Permanent, stacks)',
            x: x,
            y: y,
            width: 30,
            height: 35,
            color: '#FF0000',
            glowColor: '#FF6347',
            icon: '🍄',
            duration: 0, // Permanent effect
            effectType: 'permanent',
            rarity: 'uncommon', // More common now
            onPickup: (player, consumable, game) => {
                // Permanent 1.5x size increase (stacks multiplicatively)
                player.applySizeMultiplier(1.5);
                player.consumableEffects.giant = true;
            }
        });
    }

    // Custom render to look like a mushroom growing on platform
    render(ctx) {
        if (this.collected) return;

        const displayY = this.y + this.floatOffset;

        // Draw glow particles
        for (let particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = this.glowColor;
            ctx.globalAlpha = alpha * 0.6;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Mushroom stem (white/cream)
        const stemWidth = 12;
        const stemHeight = 18;
        const stemX = this.x + this.width/2 - stemWidth/2;
        const stemY = displayY + this.height - stemHeight;

        ctx.fillStyle = '#F5F5DC';
        ctx.fillRect(stemX, stemY, stemWidth, stemHeight);
        ctx.strokeStyle = '#DDD';
        ctx.lineWidth = 1;
        ctx.strokeRect(stemX, stemY, stemWidth, stemHeight);

        // Mushroom cap (red with white spots)
        const capWidth = this.width;
        const capHeight = 20;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.glowColor;

        // Red cap (rounded top)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, displayY + 10, capWidth/2, capHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // White spots on cap
        ctx.fillStyle = 'white';
        const spots = [
            {x: this.x + this.width/2, y: displayY + 8, size: 4},
            {x: this.x + this.width/2 - 8, y: displayY + 12, size: 3},
            {x: this.x + this.width/2 + 8, y: displayY + 12, size: 3},
        ];
        for (let spot of spots) {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw name below
        ctx.font = '10px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width/2, displayY + this.height + 12);
        ctx.textAlign = 'left';
    }
}

class ShrinkMushroomConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'shrink_mushroom',
            name: 'Shrink Mushroom',
            description: 'Get smaller! (Permanent, stacks)',
            x: x,
            y: y,
            width: 30,
            height: 35,
            color: '#6A5ACD',
            glowColor: '#9370DB',
            icon: '🍄',
            duration: 0, // Permanent effect
            effectType: 'permanent',
            rarity: 'uncommon', // More common now
            onPickup: (player, consumable, game) => {
                // Permanent 0.67x size decrease (1/1.5, stacks multiplicatively)
                player.applySizeMultiplier(0.67);
                player.consumableEffects.tiny = true;
            }
        });
    }

    // Custom render to look like a mushroom growing on platform
    render(ctx) {
        if (this.collected) return;

        const displayY = this.y + this.floatOffset;

        // Draw glow particles
        for (let particle of this.particles) {
            const alpha = particle.life / particle.maxLife;
            ctx.fillStyle = this.glowColor;
            ctx.globalAlpha = alpha * 0.6;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Mushroom stem (white/cream)
        const stemWidth = 10;
        const stemHeight = 16;
        const stemX = this.x + this.width/2 - stemWidth/2;
        const stemY = displayY + this.height - stemHeight;

        ctx.fillStyle = '#E6E6FA';
        ctx.fillRect(stemX, stemY, stemWidth, stemHeight);
        ctx.strokeStyle = '#CCC';
        ctx.lineWidth = 1;
        ctx.strokeRect(stemX, stemY, stemWidth, stemHeight);

        // Mushroom cap (purple/blue)
        const capWidth = this.width;
        const capHeight = 20;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.glowColor;

        // Purple cap (rounded top)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, displayY + 10, capWidth/2, capHeight/2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Lighter purple spots on cap
        ctx.fillStyle = '#9370DB';
        const spots = [
            {x: this.x + this.width/2, y: displayY + 8, size: 3},
            {x: this.x + this.width/2 - 7, y: displayY + 12, size: 2.5},
            {x: this.x + this.width/2 + 7, y: displayY + 12, size: 2.5},
        ];
        for (let spot of spots) {
            ctx.beginPath();
            ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw name below
        ctx.font = '10px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width/2, displayY + this.height + 12);
        ctx.textAlign = 'left';
    }
}

// ============================================================================
// DEFENSIVE & UTILITY CONSUMABLES
// ============================================================================

class ShieldAmuletConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'shield',
            name: 'Shield Amulet',
            description: 'Protects from one hazard hit!',
            x: x,
            y: y,
            color: '#4169E1',
            glowColor: '#1E90FF',
            icon: '🛡️',
            duration: 0,
            effectType: 'passive',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.shieldCharges = (player.consumableEffects.shieldCharges || 0) + 1;
            }
        });
    }
}

class GhostPotionConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'ghost',
            name: 'Ghost Potion',
            description: 'Phase through hazards!',
            x: x,
            y: y,
            color: '#F0F8FF',
            glowColor: '#B0C4DE',
            icon: '👻',
            duration: 600, // 10 seconds
            effectType: 'active',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.ghostMode = true;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.ghostMode = false;
            }
        });
    }
}

class MagnetRingConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'magnet',
            name: 'Magnet Ring',
            description: 'Attracts nearby items!',
            x: x,
            y: y,
            color: '#C0C0C0',
            glowColor: '#A9A9A9',
            icon: '🧲',
            duration: 1200, // 20 seconds
            effectType: 'active',
            rarity: 'common',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.magnetRadius = 150;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.magnetRadius = 0;
            }
        });
    }
}

class StickyGlovesConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'sticky_gloves',
            name: 'Sticky Gloves',
            description: 'Better grip on ice!',
            x: x,
            y: y,
            color: '#FFD700',
            glowColor: '#FFA500',
            icon: '🧤',
            duration: 900, // 15 seconds
            effectType: 'active',
            rarity: 'common',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.stickyGloves = true;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.stickyGloves = false;
            }
        });
    }
}

// ============================================================================
// LEVEL MODIFICATION CONSUMABLES
// ============================================================================

class BombConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'bomb',
            name: 'TNT Bomb',
            description: 'Destroys nearby hazards!',
            x: x,
            y: y,
            color: '#8B0000',
            glowColor: '#FF0000',
            icon: '💣',
            duration: 0,
            effectType: 'instant',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                // Destroy hazards within 300px radius
                const blastRadius = 300;
                const platforms = game.platforms;

                platforms.sawBlades = platforms.sawBlades.filter(saw => {
                    const dist = Math.hypot(saw.x - player.x, saw.y - player.y);
                    return dist > blastRadius;
                });

                platforms.poisonClouds = platforms.poisonClouds.filter(cloud => {
                    const dist = Math.hypot(cloud.x - player.x, cloud.y - player.y);
                    return dist > blastRadius;
                });

                platforms.blackHoles = platforms.blackHoles.filter(hole => {
                    const dist = Math.hypot(hole.x - player.x, hole.y - player.y);
                    return dist > blastRadius;
                });
            }
        });
    }
}

class IceSpellConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'ice_spell',
            name: 'Ice Spell',
            description: 'Freezes moving hazards!',
            x: x,
            y: y,
            color: '#00FFFF',
            glowColor: '#87CEEB',
            icon: '❄️',
            duration: 900, // 15 seconds
            effectType: 'active',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.freezeHazards = true;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.freezeHazards = false;
            }
        });
    }
}

class TimeSlowConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'time_slow',
            name: 'Time Hourglass',
            description: 'Slows moving hazards!',
            x: x,
            y: y,
            color: '#DAA520',
            glowColor: '#FFD700',
            icon: '⏳',
            duration: 1200, // 20 seconds
            effectType: 'active',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.slowTime = true;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.slowTime = false;
            }
        });
    }
}

class ChaosDiceConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'chaos_dice',
            name: 'Chaos Dice',
            description: 'Randomizes nearby platforms!',
            x: x,
            y: y,
            color: '#FF1493',
            glowColor: '#FF69B4',
            icon: '🎲',
            duration: 0,
            effectType: 'instant',
            rarity: 'rare',
            onPickup: (player, consumable, game) => {
                // Randomize platforms within 400px radius
                const chaosRadius = 400;
                const platforms = game.platforms;

                platforms.platforms.forEach(platform => {
                    const dist = Math.hypot(platform.x - player.x, platform.y - player.y);
                    if (dist < chaosRadius && platform.y !== 520) { // Don't move ground platforms
                        platform.y += (Math.random() - 0.5) * 100;
                        platform.y = Math.max(100, Math.min(480, platform.y));
                    }
                });
            }
        });
    }
}

// ============================================================================
// CURSED & CHAOTIC CONSUMABLES
// ============================================================================

class ReverseControlsConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'reverse_controls',
            name: 'Confusion Scroll',
            description: 'Controls reversed!',
            x: x,
            y: y,
            color: '#8B008B',
            glowColor: '#9400D3',
            icon: '🔄',
            duration: 480, // 8 seconds
            effectType: 'active',
            rarity: 'cursed',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.reversedControls = true;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.reversedControls = false;
            }
        });
    }
}

class DrunkPotionConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'drunk',
            name: 'Ale of Confusion',
            description: 'Wobbly movement!',
            x: x,
            y: y,
            color: '#CD853F',
            glowColor: '#D2691E',
            icon: '🍺',
            duration: 720, // 12 seconds
            effectType: 'active',
            rarity: 'cursed',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.drunk = true;
                player.consumableEffects.drunkTimer = 0;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.drunk = false;
            }
        });
    }
}

class LuckyCloverConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'lucky_clover',
            name: 'Lucky Clover',
            description: 'Better loot drops!',
            x: x,
            y: y,
            color: '#00FF00',
            glowColor: '#32CD32',
            icon: '🍀',
            duration: 1800, // 30 seconds
            effectType: 'active',
            rarity: 'common',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.luckBoost = 2.0;
            },
            onExpire: (player, consumable, game) => {
                player.consumableEffects.luckBoost = 1.0;
            }
        });
    }
}

// ============================================================================
// ADVANCED MOVEMENT CONSUMABLES
// ============================================================================

class DashScrollConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'dash',
            name: 'Dash Scroll',
            description: 'Press Shift to dash! (3 charges)',
            x: x,
            y: y,
            color: '#FF6347',
            glowColor: '#FF4500',
            icon: '💨',
            duration: 0,
            effectType: 'passive',
            rarity: 'uncommon',
            onPickup: (player, consumable, game) => {
                player.consumableEffects.dashCharges = (player.consumableEffects.dashCharges || 0) + 3;
            }
        });
    }
}

class WingsConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'wings',
            name: 'Wings of Icarus',
            description: 'Hold jump to glide! (Permanent)',
            x: x,
            y: y,
            color: '#FFE4B5',
            glowColor: '#FFD700',
            icon: '🪽',
            duration: 0, // Permanent effect
            effectType: 'permanent',
            rarity: 'uncommon', // More common now since permanent
            onPickup: (player, consumable, game) => {
                player.consumableEffects.wings = true;
            }
        });
    }
}

class CoffeeConsumable extends Consumable {
    constructor(x, y) {
        super({
            id: 'coffee',
            name: 'Coffee Bean',
            description: 'Extra speed burst!',
            x: x,
            y: y,
            color: '#6F4E37',
            glowColor: '#8B4513',
            icon: '☕',
            duration: 600, // 10 seconds
            effectType: 'active',
            rarity: 'common',
            onPickup: (player, consumable, game) => {
                if (!player.originalMoveSpeed) {
                    player.originalMoveSpeed = player.moveSpeed;
                }
                player.moveSpeed = player.originalMoveSpeed * 1.8;
            },
            onExpire: (player, consumable, game) => {
                if (player.originalMoveSpeed) {
                    player.moveSpeed = player.originalMoveSpeed;
                }
            }
        });
    }
}

// ============================================================================
// CONSUMABLE MANAGER
// ============================================================================

class ConsumableManager {
    constructor(soundManager = null) {
        this.consumables = [];
        this.activeEffects = [];
        this.pickupNotifications = [];
        this.soundManager = soundManager;
        this.screenFlash = null; // { color, alpha, duration }
        this.pickupParticles = []; // Enhanced pickup particles
    }

    // Spawn a consumable
    spawnConsumable(consumableClass, x, y) {
        const consumable = new consumableClass(x, y);
        this.consumables.push(consumable);
        return consumable;
    }

    // Spawn random consumables in level with rarity system
    spawnRandomConsumables(levelWidth, rng, player = null, platforms = []) {
        // Define consumable pools by rarity
        const rarityPools = {
            rare: [
                ChaosDiceConsumable
            ],
            uncommon: [
                DoubleJumpConsumable, // Now more common!
                TripleJumpConsumable, // Now more common!
                GiantMushroomConsumable,
                ShrinkMushroomConsumable,
                WingsConsumable,
                FeatherConsumable,
                RocketBootsConsumable,
                ShieldAmuletConsumable,
                GhostPotionConsumable,
                BombConsumable,
                IceSpellConsumable,
                TimeSlowConsumable,
                DashScrollConsumable
            ],
            common: [
                SpeedBoostConsumable,
                HealthConsumable,
                CoffeeConsumable,
                StickyGlovesConsumable,
                SpringShoesConsumable,
                MagnetRingConsumable,
                LuckyCloverConsumable
            ],
            cursed: [
                AnvilCurseConsumable,
                ReverseControlsConsumable,
                DrunkPotionConsumable
            ]
        };

        // Lucky Clover effect - better loot!
        const luckBoost = (player && player.consumableEffects && player.consumableEffects.luckBoost) || 1.0;

        // Spawn 4-8 total consumables (reduced for scarcity)
        const totalCount = rng.randomInt(4, 8);

        // Rarity limits per level (boosted by luck)
        const rareLimit = Math.min(3, Math.floor(1 * luckBoost)); // Max 1-3 rare
        const uncommonLimit = Math.min(8, Math.floor(4 * luckBoost)); // Max 4-8 uncommon
        const cursedChance = 0.15 / luckBoost; // Luck reduces cursed items!

        let rareCount = 0;
        let uncommonCount = 0;

        for (let i = 0; i < totalCount; i++) {
            // For vertical tower (800px wide), spawn across the width
            const x = rng.randomInt(100, levelWidth - 100);
            // For vertical levels, spawn throughout the height (going up from ground at 520)
            const y = rng.randomInt(-5000, 480); // Negative Y = higher up

            // Determine rarity based on roll and limits (luck boosts better items)
            let ConsumableClass;
            const roll = rng.random();
            const rareChance = 0.05 * luckBoost; // Luck increases rare chance!
            const uncommonChance = 0.25 * luckBoost; // Luck increases uncommon chance!

            if (roll < rareChance && rareCount < rareLimit) {
                // 5-10% chance for rare (boosted by luck)
                ConsumableClass = rng.choice(rarityPools.rare);
                rareCount++;
            } else if (roll < uncommonChance && uncommonCount < uncommonLimit) {
                // 20-40% chance for uncommon (boosted by luck)
                ConsumableClass = rng.choice(rarityPools.uncommon);
                uncommonCount++;
            } else if (roll < uncommonChance + cursedChance) {
                // 15-7.5% chance for cursed (reduced by luck)
                ConsumableClass = rng.choice(rarityPools.cursed);
            } else {
                // Rest are common
                ConsumableClass = rng.choice(rarityPools.common);
            }

            this.spawnConsumable(ConsumableClass, x, y);
        }

        // Special mushroom spawning: Place 1-3 mushrooms on platform surfaces
        if (platforms && platforms.length > 0) {
            const mushroomCount = rng.randomInt(1, 3);
            const mushroomTypes = [GiantMushroomConsumable, ShrinkMushroomConsumable];

            for (let i = 0; i < mushroomCount; i++) {
                // Pick a random platform
                const platform = rng.choice(platforms);

                // Place mushroom on top of platform
                const mushroomX = platform.x + rng.randomInt(10, platform.width - 40);
                const mushroomY = platform.y - 35; // Position on top of platform

                // Randomly choose giant or shrink mushroom
                const MushroomClass = rng.choice(mushroomTypes);
                this.spawnConsumable(MushroomClass, mushroomX, mushroomY);
            }
        }
    }

    update(player, game) {
        // Get magnet radius if active
        const magnetRadius = (player.consumableEffects && player.consumableEffects.magnetRadius) || 0;

        // Update all consumables
        for (let consumable of this.consumables) {
            consumable.update();

            // Magnet effect - pull consumables towards player
            if (!consumable.collected && magnetRadius > 0) {
                const dx = player.x + player.width / 2 - (consumable.x + consumable.width / 2);
                const dy = player.y + player.height / 2 - (consumable.y + consumable.height / 2);
                const distance = Math.hypot(dx, dy);

                if (distance < magnetRadius && distance > 0) {
                    // Pull towards player
                    const pullStrength = 0.15;
                    consumable.x += (dx / distance) * pullStrength * (magnetRadius - distance) / magnetRadius * 5;
                    consumable.y += (dy / distance) * pullStrength * (magnetRadius - distance) / magnetRadius * 5;
                }
            }

            // Check collision with player
            if (!consumable.collected && consumable.checkCollision(player)) {
                const pickupInfo = consumable.onPickup(player, game);

                // Play collect sound
                if (this.soundManager) {
                    this.soundManager.playCollect();
                }

                // Track consumable collection for narrative system
                if (game && game.totalConsumables !== undefined) {
                    game.totalConsumables++;
                    game.triggerNarrativeMessage('consumables', game.totalConsumables);
                }

                // Create screen flash effect based on rarity
                this.createScreenFlash(consumable);

                // Create enhanced pickup particles
                this.createPickupParticles(consumable, player);

                // Add to active effects if it has a duration
                if (consumable.duration > 0) {
                    // Check if this effect is already active (by ID) - STACKING LOGIC
                    const existingEffect = this.activeEffects.find(e => e.consumable.id === consumable.id);

                    if (existingEffect) {
                        // Stack the effect - extend duration instead of replacing
                        existingEffect.timeRemaining += consumable.duration;

                        // Update notification to show stacking
                        this.createPickupNotification({
                            ...pickupInfo,
                            name: pickupInfo.name + ' +TIME'
                        }, player);
                    } else {
                        // New effect - add it
                        this.activeEffects.push({
                            consumable: consumable,
                            timeRemaining: consumable.duration,
                            info: pickupInfo
                        });

                        this.createPickupNotification(pickupInfo, player);
                    }
                } else {
                    // Instant or passive effect - just show notification
                    this.createPickupNotification(pickupInfo, player);
                }
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

        // Update screen flash
        if (this.screenFlash) {
            this.screenFlash.duration--;
            this.screenFlash.alpha *= 0.92; // Fade out
            if (this.screenFlash.duration <= 0 || this.screenFlash.alpha < 0.01) {
                this.screenFlash = null;
            }
        }

        // Update pickup particles
        this.pickupParticles = this.pickupParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3; // Gravity
            p.vx *= 0.98; // Drag
            p.life--;
            return p.life > 0;
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

    createScreenFlash(consumable) {
        // Different flash colors based on rarity
        const flashColors = {
            rare: '#9370DB',
            uncommon: '#4169E1',
            common: '#FFD700',
            cursed: '#8B0000'
        };

        this.screenFlash = {
            color: flashColors[consumable.rarity] || consumable.glowColor,
            alpha: 0.3,
            duration: 15 // frames
        };
    }

    createPickupParticles(consumable, player) {
        // Create explosive particles on pickup
        const particleCount = consumable.rarity === 'rare' ? 30 : consumable.rarity === 'uncommon' ? 20 : 15;

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 6 + 4;

            this.pickupParticles.push({
                x: consumable.x + consumable.width / 2,
                y: consumable.y + consumable.height / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 40 + Math.random() * 20,
                maxLife: 40 + Math.random() * 20,
                color: consumable.glowColor,
                size: Math.random() * 6 + 3
            });
        }
    }

    render(ctx, camera) {
        // Render consumables (with camera translation)
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        for (let consumable of this.consumables) {
            consumable.render(ctx);
        }

        // Render pickup particles (with camera translation)
        for (let p of this.pickupParticles) {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha * 0.8;
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

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

    renderScreenFlash(ctx, canvas) {
        // Render screen flash effect (fullscreen)
        if (this.screenFlash) {
            ctx.fillStyle = this.screenFlash.color;
            ctx.globalAlpha = this.screenFlash.alpha;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
        }
    }

    renderUI(ctx, canvas, player) {
        // Render screen flash first (fullscreen effect)
        this.renderScreenFlash(ctx, canvas);

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
            const extraJumps = player.maxJumps - 1; // -1 because base jump doesn't count
            const arrows = '⬆'.repeat(Math.min(extraJumps, 5)); // Max 5 arrows to display
            const jumpText = extraJumps === 1 ? 'Extra Jump' :
                            extraJumps === 2 ? 'Triple Jump' :
                            `${extraJumps + 1}x Jump`;

            // Color based on jump count
            if (extraJumps >= 5) {
                ctx.fillStyle = '#FFD700'; // Gold for 5+
            } else if (extraJumps >= 3) {
                ctx.fillStyle = '#FF1493'; // Pink for 3-4
            } else if (extraJumps === 2) {
                ctx.fillStyle = '#9370DB'; // Purple for 2
            } else {
                ctx.fillStyle = '#00CED1'; // Cyan for 1
            }
            ctx.fillText(`${arrows} ${jumpText} (${player.maxJumps}x)`, 15, currentY);
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
        this.screenFlash = null;
        this.pickupParticles = [];
    }
}
