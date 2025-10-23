// Simple seeded random number generator
class SimpleRNG {
    constructor(seed) {
        this.seed = seed;
    }
    
    random() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    randomInt(min, max) {
        return Math.floor(this.random() * (max - min + 1)) + min;
    }
    
    randomFloat(min, max) {
        return this.random() * (max - min) + min;
    }
    
    choice(array) {
        return array[this.randomInt(0, array.length - 1)];
    }
}

// Physics-based platform metrics
// All measurements derive from player jump capabilities
class PlatformMetrics {
    constructor() {
        // Player physics constants (from player.js and physics.js)
        this.PLAYER_SIZE = 40;      // Player width/height
        this.MOVE_SPEED = 5;        // px per frame
        this.JUMP_POWER = 15;       // Initial upward velocity
        this.GRAVITY = 0.8;         // Downward acceleration

        // Calculated maximum jump distance
        // Air time = 2 * (jumpPower / gravity) = 2 * (15 / 0.8) = 37.5 frames
        // Max distance = moveSpeed * airTime = 5 * 37.5 = 187.5px
        this.MAX_JUMP_DISTANCE = 190; // With safety margin

        // Platform widths (multiples of player size - must be landable)
        this.PLATFORM = {
            TINY: this.PLAYER_SIZE * 1.5,   // 60px - minimum safe landing
            SMALL: this.PLAYER_SIZE * 2.5,  // 100px
            MEDIUM: this.PLAYER_SIZE * 4,   // 160px
            LARGE: this.PLAYER_SIZE * 6     // 240px
        };

        // Gap widths (fractions of max jump - must be jumpable)
        this.GAP = {
            MIN: this.PLAYER_SIZE,                    // 40px - minimum (player width)
            SMALL: this.MAX_JUMP_DISTANCE * 0.3,      // 57px - easy
            MEDIUM: this.MAX_JUMP_DISTANCE * 0.5,     // 95px - moderate
            LARGE: this.MAX_JUMP_DISTANCE * 0.7,      // 133px - challenging
            MAX: this.MAX_JUMP_DISTANCE * 0.85        // 161px - very challenging
        };

        // Vertical measurements
        this.PLATFORM_HEIGHT = 20; // Standard platform thickness
        this.LADDER_WIDTH = 40;    // Same as player width
    }
}

class Platform {
    constructor(x, y, width, height, type = 'normal') {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.color = this.getColorByType();
        this.moveTimer = 0;
        this.moveSpeed = 1;
        this.moveRange = 100;
    }

    getColorByType() {
        switch (this.type) {
            case 'normal': return '#8B4513';
            case 'ice': return '#B0E0E6';
            case 'moving': return '#FF6B6B';
            case 'crumbling': return '#DEB887';
            case 'spring': return '#90EE90';
            default: return '#8B4513';
        }
    }

    update() {
        if (this.type === 'moving') {
            const oldX = this.x;
            this.moveTimer += 0.02;
            this.x = this.originalX + Math.sin(this.moveTimer) * this.moveRange;
            this.deltaX = this.x - oldX; // Track how much the platform moved
        } else {
            this.deltaX = 0;
        }
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add visual details based on type
        switch (this.type) {
            case 'ice':
                ctx.fillStyle = '#E6F3FF';
                ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
                break;
            case 'moving':
                ctx.fillStyle = '#FF8E8E';
                ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, this.height - 8);
                break;
            case 'spring':
                ctx.fillStyle = '#B5FFB5';
                ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);
                // Spring coil effect
                ctx.strokeStyle = '#32CD32';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const springY = this.y + (i * this.height / 3) + this.height / 6;
                    ctx.moveTo(this.x + 5, springY);
                    ctx.lineTo(this.x + this.width - 5, springY);
                }
                ctx.stroke();
                break;
        }
        
        // Platform border
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

// Ladder class - climbable vertical structures
class Ladder {
    constructor(x, y, height) {
        this.x = x;
        this.y = y;
        this.width = 40; // Fixed width for ladders
        this.height = height;
        this.rungSpacing = 25; // Space between rungs
    }

    render(ctx) {
        // Draw vertical rails
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, 8, this.height); // Left rail
        ctx.fillRect(this.x + this.width - 8, this.y, 8, this.height); // Right rail

        // Draw horizontal rungs
        ctx.fillStyle = '#A0522D';
        const rungCount = Math.floor(this.height / this.rungSpacing);
        for (let i = 0; i <= rungCount; i++) {
            const rungY = this.y + (i * this.rungSpacing);
            if (rungY <= this.y + this.height) {
                ctx.fillRect(this.x, rungY, this.width, 6);

                // Add wood grain effect
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(this.x + 5, rungY + 1, 2, 4);
                ctx.fillRect(this.x + this.width - 7, rungY + 1, 2, 4);
                ctx.fillStyle = '#A0522D';
            }
        }

        // Add shadow/depth
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.x + 2, this.y, 4, this.height);
        ctx.fillRect(this.x + this.width - 6, this.y, 4, this.height);
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }

    isPlayerOnLadder(player) {
        // Check if player is overlapping with ladder
        return player.x + player.width > this.x + 5 &&
               player.x < this.x + this.width - 5 &&
               player.y + player.height > this.y &&
               player.y < this.y + this.height;
    }
}

// Pit class - gaps in the ground with varying depths
class Pit {
    constructor(x, width, depth) {
        this.x = x;
        this.width = width;
        this.depth = depth; // How deep the pit goes (for rendering)
        this.groundLevel = 520; // Standard ground level
        this.y = this.groundLevel; // Pits start at ground level
    }

    render(ctx) {
        // Draw pit opening
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.depth);
        gradient.addColorStop(0, '#3D2817');
        gradient.addColorStop(0.3, '#2A1810');
        gradient.addColorStop(0.7, '#1A0F08');
        gradient.addColorStop(1, '#000000');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.depth);

        // Add edge shadows
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.x, this.y, 10, this.depth); // Left edge
        ctx.fillRect(this.x + this.width - 10, this.y, 10, this.depth); // Right edge

        // Add some depth lines
        ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            const lineY = this.y + (this.depth / 5) * i;
            ctx.beginPath();
            ctx.moveTo(this.x + 5, lineY);
            ctx.lineTo(this.x + this.width - 5, lineY);
            ctx.stroke();
        }

        // Top edge highlight
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.stroke();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.depth
        };
    }

    isPlayerInPit(player) {
        // Check if player has fallen into the pit
        return player.x + player.width > this.x &&
               player.x < this.x + this.width &&
               player.y + player.height > this.y;
    }
}

// Hazard classes
class SawBlade {
    constructor(x, y, radius = 20) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.rotation = 0;
        this.rotationSpeed = 0.1;
    }

    update() {
        this.rotation += this.rotationSpeed;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Draw saw blade
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw saw teeth
        ctx.fillStyle = '#666666';
        const teeth = 8;
        for (let i = 0; i < teeth; i++) {
            const angle = (i / teeth) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.radius, Math.sin(angle) * this.radius);
            ctx.lineTo(Math.cos(angle + 0.2) * (this.radius + 5), Math.sin(angle + 0.2) * (this.radius + 5));
            ctx.lineTo(Math.cos(angle + 0.4) * this.radius, Math.sin(angle + 0.4) * this.radius);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.radius - 5,
            y: this.y - this.radius - 5,
            width: (this.radius + 5) * 2,
            height: (this.radius + 5) * 2
        };
    }
}

class AnimatedSpike {
    constructor(x, y, width = 30, height = 40, cycleTime = 120) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.maxHeight = height;
        this.cycleTime = cycleTime; // Frames for full cycle (on + off)
        this.timer = 0;
        this.isActive = true;
        this.currentHeight = height;
        this.warningTimer = 30; // Warning phase before activation
    }

    update() {
        this.timer++;

        // Cycle: Active (60f) → Warning (30f) → Retracted (60f) → Warning (30f)
        const phase = this.timer % this.cycleTime;

        if (phase < 60) {
            // Active phase - spikes fully extended
            this.isActive = true;
            this.currentHeight = this.maxHeight;
        } else if (phase < 90) {
            // Warning phase - spikes retracting
            this.isActive = true;
            const retractProgress = (phase - 60) / 30;
            this.currentHeight = this.maxHeight * (1 - retractProgress);
        } else if (phase < 150) {
            // Retracted phase - safe
            this.isActive = false;
            this.currentHeight = 0;
        } else {
            // Warning phase - spikes extending
            this.isActive = false;
            const extendProgress = (phase - 150) / 30;
            this.currentHeight = this.maxHeight * extendProgress;
        }
    }

    render(ctx) {
        if (this.currentHeight === 0) return; // Don't draw when fully retracted

        // Base plate
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y + this.maxHeight, this.width, 5);

        // Spike body
        const alpha = this.isActive ? 1 : 0.5;
        ctx.fillStyle = this.isActive ? '#FF4444' : '#FFAA44';
        ctx.globalAlpha = alpha;
        ctx.fillRect(this.x, this.y + (this.maxHeight - this.currentHeight), this.width, this.currentHeight);

        // Draw spike triangles
        ctx.fillStyle = this.isActive ? '#CC0000' : '#FF8800';
        ctx.beginPath();
        const numSpikes = Math.floor(this.width / 6);
        for (let i = 0; i < numSpikes; i++) {
            const spikeX = this.x + i * 6;
            const spikeBase = this.y + this.maxHeight - this.currentHeight;
            const spikeTop = this.y + (this.maxHeight - this.currentHeight);

            ctx.moveTo(spikeX, this.y + this.maxHeight);
            ctx.lineTo(spikeX + 3, spikeTop);
            ctx.lineTo(spikeX + 6, this.y + this.maxHeight);
        }
        ctx.fill();
        ctx.globalAlpha = 1;

        // Warning glow when about to activate
        if (!this.isActive && this.currentHeight > 0) {
            ctx.strokeStyle = '#FF8800';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x - 2, this.y, this.width + 4, this.maxHeight + 5);
        }
    }

    getBounds() {
        if (!this.isActive || this.currentHeight === 0) {
            return null; // No collision when retracted or warning
        }

        return {
            x: this.x,
            y: this.y + (this.maxHeight - this.currentHeight),
            width: this.width,
            height: this.currentHeight
        };
    }
}

class LavaPit {
    constructor(x, y, width, height = 30) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.bubbleTimer = 0;
        this.bubbles = [];
    }

    update() {
        this.bubbleTimer += 0.1;
        
        // Create bubbles
        if (Math.random() < 0.3) {
            this.bubbles.push({
                x: this.x + Math.random() * this.width,
                y: this.y + this.height,
                size: Math.random() * 8 + 4,
                life: 60
            });
        }
        
        // Update bubbles
        this.bubbles = this.bubbles.filter(bubble => {
            bubble.y -= 1;
            bubble.life--;
            return bubble.life > 0;
        });
    }

    render(ctx) {
        // Draw lava
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Draw lava glow effect
        ctx.fillStyle = '#FF6500';
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        
        // Draw bubbles
        for (let bubble of this.bubbles) {
            ctx.fillStyle = `rgba(255, 100, 0, ${bubble.life / 60})`;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

class PoisonCloud {
    constructor(x, y, radius = 40) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.originalRadius = radius;
        this.pulseTimer = 0;
        this.particles = [];
        
        // Create poison particles
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * radius * 2 - radius,
                y: Math.random() * radius * 2 - radius,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: Math.random() * 100 + 50
            });
        }
    }

    update() {
        this.pulseTimer += 0.05;
        this.radius = this.originalRadius + Math.sin(this.pulseTimer) * 5;
        
        // Update particles
        for (let particle of this.particles) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            // Respawn particles
            if (particle.life <= 0) {
                particle.x = Math.random() * this.radius * 2 - this.radius;
                particle.y = Math.random() * this.radius * 2 - this.radius;
                particle.life = Math.random() * 100 + 50;
            }
        }
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw poison cloud
        ctx.fillStyle = 'rgba(128, 0, 128, 0.6)';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw particles
        for (let particle of this.particles) {
            const alpha = particle.life / 150;
            ctx.fillStyle = `rgba(128, 0, 128, ${alpha * 0.8})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x - this.radius,
            y: this.y - this.radius,
            width: this.radius * 2,
            height: this.radius * 2
        };
    }
}

class PlatformManager {
    constructor(seed = null, bias = 'normal', level = 1, soundManager = null) {
        this.platforms = [];
        this.ladders = []; // NEW: Climbable structures
        this.pits = []; // NEW: Ground gaps with depth
        this.spikes = [];
        this.sawBlades = [];
        this.lavaPits = [];
        this.poisonClouds = [];
        this.blackHoles = [];
        this.seed = seed || Math.floor(Math.random() * 1000000);
        this.rng = new SimpleRNG(this.seed);
        this.bias = bias;
        this.level = level;
        this.soundManager = soundManager;

        // Physics-based platform sizing system
        this.metrics = new PlatformMetrics();

        // Mathematical constants for beautiful design
        this.PHI = 1.618033988749895; // Golden ratio
        this.GOLDEN_ANGLE = 137.5; // Golden angle in degrees

        this.generateFibonacciLevel(); // NEW: Use Fibonacci-based generation
    }

    update(player = null) {
        for (let platform of this.platforms) {
            platform.update();
        }

        // Check if hazards should be frozen or slowed
        const freezeHazards = player && player.consumableEffects && player.consumableEffects.freezeHazards;
        const slowTime = player && player.consumableEffects && player.consumableEffects.slowTime;

        // Update all hazards (skip if frozen, slow if time slowed)
        if (!freezeHazards) {
            for (let sawBlade of this.sawBlades) {
                if (slowTime) {
                    // Store original speeds if not already stored
                    if (!sawBlade.originalSpeed) {
                        sawBlade.originalSpeed = sawBlade.speed;
                    }
                    sawBlade.speed = sawBlade.originalSpeed * 0.3; // 30% speed
                } else {
                    // Restore original speed if was slowed
                    if (sawBlade.originalSpeed) {
                        sawBlade.speed = sawBlade.originalSpeed;
                        sawBlade.originalSpeed = null;
                    }
                }
                sawBlade.update();
            }
        } else {
            // Frozen - restore speeds but don't update
            for (let sawBlade of this.sawBlades) {
                if (sawBlade.originalSpeed) {
                    sawBlade.speed = sawBlade.originalSpeed;
                    sawBlade.originalSpeed = null;
                }
            }
        }

        // Always update visual effects
        for (let lavaPit of this.lavaPits) {
            lavaPit.update();
        }
        for (let poisonCloud of this.poisonClouds) {
            poisonCloud.update();
        }
    }

    /**
     * Update ambient sounds based on player proximity to hazards
     */
    updateAmbientSounds(player) {
        if (!this.soundManager) return;

        const maxDistance = 400; // Maximum distance to hear ambient sounds

        // Update saw blade ambient sounds
        this.sawBlades.forEach((sawBlade, index) => {
            const bounds = sawBlade.getBounds();
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;

            const distance = Math.sqrt(
                Math.pow(player.x + player.width / 2 - centerX, 2) +
                Math.pow(player.y + player.height / 2 - centerY, 2)
            );

            const proximity = Math.max(0, 1 - (distance / maxDistance));
            this.soundManager.updateAmbientHazard(`saw_${index}`, 'saw', proximity);
        });

        // Update lava pit ambient sounds
        this.lavaPits.forEach((lavaPit, index) => {
            const bounds = lavaPit.getBounds();
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;

            const distance = Math.sqrt(
                Math.pow(player.x + player.width / 2 - centerX, 2) +
                Math.pow(player.y + player.height / 2 - centerY, 2)
            );

            const proximity = Math.max(0, 1 - (distance / maxDistance));
            this.soundManager.updateAmbientHazard(`lava_${index}`, 'lava', proximity);
        });

        // Update poison cloud ambient sounds
        this.poisonClouds.forEach((poisonCloud, index) => {
            const bounds = poisonCloud.getBounds();
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;

            const distance = Math.sqrt(
                Math.pow(player.x + player.width / 2 - centerX, 2) +
                Math.pow(player.y + player.height / 2 - centerY, 2)
            );

            const proximity = Math.max(0, 1 - (distance / maxDistance));
            this.soundManager.updateAmbientHazard(`poison_${index}`, 'poison', proximity);
        });
    }

    // ====================
    // FIBONACCI & GOLDEN RATIO METHODS
    // ====================

    /**
     * Generate Fibonacci sequence up to n terms
     */
    generateFibonacci(n) {
        const fib = [1, 1];
        for (let i = 2; i < n; i++) {
            fib.push(fib[i-1] + fib[i-2]);
        }
        return fib;
    }

    /**
     * Get golden ratio divisions of a value
     * Returns { major, minor } where major/minor = φ
     */
    goldenDivision(value) {
        return {
            major: value / this.PHI, // ~0.618 of value
            minor: value - (value / this.PHI) // ~0.382 of value
        };
    }

    /**
     * Generate chunk-based roguelike level using Fibonacci and Golden Ratio
     * Proper architecture with meaningful chunks, not random platforms
     */
    generateFibonacciLevel() {
        const levelWidth = 3000;
        const groundLevel = 520;

        // Fibonacci sequence for chunk composition
        const fib = this.generateFibonacci(12); // [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144]

        // Golden ratio height layers
        const heights = {
            veryHigh: groundLevel * 0.15,
            high: groundLevel * 0.30,
            midHigh: groundLevel * 0.45,
            mid: groundLevel * 0.55,
            midLow: groundLevel * 0.70,
            low: groundLevel * 0.85
        };

        // ====================
        // CHUNK-BASED LEVEL GENERATION
        // ====================

        let currentX = 0;
        let currentHeight = groundLevel; // Track where we are vertically

        // Start platform
        this.platforms.push(new Platform(0, groundLevel, 200, 80, 'normal'));
        currentX = 220;

        // Generate chunks until we reach the end
        const chunkTypes = ['ground', 'pit', 'climb', 'gap', 'ladder', 'cluster'];

        while (currentX < levelWidth - 600) {
            // Choose chunk type (weighted selection)
            const roll = this.rng.random();
            let chunkType;

            if (roll < 0.25) chunkType = 'ground';
            else if (roll < 0.40) chunkType = 'pit';
            else if (roll < 0.55) chunkType = 'climb';
            else if (roll < 0.70) chunkType = 'gap';
            else if (roll < 0.85) chunkType = 'ladder';
            else chunkType = 'cluster';

            // Generate the chosen chunk
            const chunkResult = this.generateChunk(chunkType, currentX, currentHeight, fib, heights, groundLevel);
            currentX = chunkResult.exitX;
            currentHeight = chunkResult.exitHeight;
        }

        // Final safe platform and finish
        this.platforms.push(new Platform(levelWidth - 300, groundLevel, 300, 80, 'normal'));
        this.startFlag = {x: 50, y: groundLevel - 100, width: 20, height: 100};
        this.finishFlag = {x: levelWidth - 150, y: groundLevel - 100, width: 20, height: 100};

        // Add hazards last (so they don't interfere with chunk logic)
        const biasParams = this.getBiasParameters();
        this.generateHazards(levelWidth);
        this.generateAdvancedHazards(levelWidth, biasParams);
    }

    /**
     * Generate a specific chunk type
     * Returns {exitX, exitHeight} for next chunk connection
     */
    generateChunk(type, startX, startHeight, fib, heights, groundLevel) {
        switch(type) {
            case 'ground':
                return this.generateGroundChunk(startX, startHeight, fib, groundLevel);
            case 'pit':
                return this.generatePitChunk(startX, startHeight, fib, groundLevel);
            case 'climb':
                return this.generateClimbChunk(startX, startHeight, fib, heights, groundLevel);
            case 'gap':
                return this.generateGapChunk(startX, startHeight, fib, groundLevel);
            case 'ladder':
                return this.generateLadderChunk(startX, startHeight, fib, heights, groundLevel);
            case 'cluster':
                return this.generateClusterChunk(startX, startHeight, fib, heights, groundLevel);
            default:
                return this.generateGroundChunk(startX, startHeight, fib, groundLevel);
        }
    }

    /**
     * GROUND CHUNK: Simple horizontal ground platform
     */
    generateGroundChunk(startX, startHeight, fib, groundLevel) {
        // Platform width: TINY to LARGE - full range for variety
        const widths = [
            this.metrics.PLATFORM.TINY,
            this.metrics.PLATFORM.SMALL,
            this.metrics.PLATFORM.MEDIUM,
            this.metrics.PLATFORM.LARGE
        ];
        const width = widths[this.rng.randomInt(0, widths.length - 1)];
        this.platforms.push(new Platform(startX, groundLevel, width, this.metrics.PLATFORM_HEIGHT, 'normal'));

        // Random gap size: MIN to MEDIUM
        const gaps = [this.metrics.GAP.MIN, this.metrics.GAP.SMALL, this.metrics.GAP.MEDIUM];
        const gap = gaps[this.rng.randomInt(0, gaps.length - 1)];

        return {
            exitX: startX + width + gap,
            exitHeight: groundLevel
        };
    }

    /**
     * PIT CHUNK: Ground platform, pit, ground platform
     */
    generatePitChunk(startX, startHeight, fib, groundLevel) {
        // Left platform - TINY to SMALL (varied)
        const leftWidths = [this.metrics.PLATFORM.TINY, this.metrics.PLATFORM.SMALL];
        const leftWidth = leftWidths[this.rng.randomInt(0, leftWidths.length - 1)];
        this.platforms.push(new Platform(startX, groundLevel, leftWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

        // Pit in middle - SMALL to LARGE gap (57-133px) for variety
        const pitWidths = [this.metrics.GAP.SMALL, this.metrics.GAP.MEDIUM, this.metrics.GAP.LARGE];
        const pitWidth = pitWidths[this.rng.randomInt(0, pitWidths.length - 1)];
        const pitDepth = this.rng.randomInt(60, 180); // Varied visual depth
        const pitX = startX + leftWidth;
        this.pits.push(new Pit(pitX, pitWidth, pitDepth));

        // Right platform - TINY to SMALL (varied)
        const rightX = pitX + pitWidth;
        const rightWidths = [this.metrics.PLATFORM.TINY, this.metrics.PLATFORM.SMALL];
        const rightWidth = rightWidths[this.rng.randomInt(0, rightWidths.length - 1)];
        this.platforms.push(new Platform(rightX, groundLevel, rightWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

        // Random exit gap
        const exitGaps = [this.metrics.GAP.MIN, this.metrics.GAP.SMALL];
        const exitGap = exitGaps[this.rng.randomInt(0, exitGaps.length - 1)];

        return {
            exitX: rightX + rightWidth + exitGap,
            exitHeight: groundLevel
        };
    }

    /**
     * CLIMB CHUNK: Ascending staircase of platforms
     */
    generateClimbChunk(startX, startHeight, fib, heights, groundLevel) {
        const steps = this.rng.randomInt(3, 6); // 3-6 steps for variety
        let currentX = startX;
        let currentY = groundLevel;

        for (let i = 0; i < steps; i++) {
            // Random step width: TINY to SMALL
            const stepWidths = [this.metrics.PLATFORM.TINY, this.metrics.PLATFORM.SMALL];
            const stepWidth = stepWidths[this.rng.randomInt(0, stepWidths.length - 1)];

            // Random step height: 50-80px
            const stepUp = this.rng.randomInt(50, 80);

            currentY -= stepUp;
            this.platforms.push(new Platform(currentX, currentY, stepWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

            // Random spacing between steps
            const stepGaps = [this.metrics.GAP.MIN, this.metrics.GAP.SMALL];
            const stepGap = stepGaps[this.rng.randomInt(0, stepGaps.length - 1)];
            currentX += stepWidth + stepGap;
        }

        return {
            exitX: currentX,
            exitHeight: currentY
        };
    }

    /**
     * GAP CHUNK: Wide horizontal gap requiring jump
     */
    generateGapChunk(startX, startHeight, fib, groundLevel) {
        // Left platform - TINY to MEDIUM for variety
        const leftWidths = [this.metrics.PLATFORM.TINY, this.metrics.PLATFORM.SMALL, this.metrics.PLATFORM.MEDIUM];
        const leftWidth = leftWidths[this.rng.randomInt(0, leftWidths.length - 1)];
        this.platforms.push(new Platform(startX, startHeight, leftWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

        // Gap (no pit, just empty space) - MEDIUM to MAX for challenge variety
        const gapWidths = [this.metrics.GAP.MEDIUM, this.metrics.GAP.LARGE, this.metrics.GAP.MAX];
        const gapWidth = gapWidths[this.rng.randomInt(0, gapWidths.length - 1)];

        // Right platform - TINY to MEDIUM
        const rightX = startX + leftWidth + gapWidth;
        const rightWidths = [this.metrics.PLATFORM.TINY, this.metrics.PLATFORM.SMALL, this.metrics.PLATFORM.MEDIUM];
        const rightWidth = rightWidths[this.rng.randomInt(0, rightWidths.length - 1)];
        this.platforms.push(new Platform(rightX, startHeight, rightWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

        // Random exit gap
        const exitGaps = [this.metrics.GAP.MIN, this.metrics.GAP.SMALL, this.metrics.GAP.MEDIUM];
        const exitGap = exitGaps[this.rng.randomInt(0, exitGaps.length - 1)];

        return {
            exitX: rightX + rightWidth + exitGap,
            exitHeight: startHeight
        };
    }

    /**
     * LADDER CHUNK: Vertical ladder connecting heights
     */
    generateLadderChunk(startX, startHeight, fib, heights, groundLevel) {
        // Platform at bottom - SMALL to MEDIUM (varied)
        const bottomWidths = [this.metrics.PLATFORM.SMALL, this.metrics.PLATFORM.MEDIUM];
        const bottomWidth = bottomWidths[this.rng.randomInt(0, bottomWidths.length - 1)];
        this.platforms.push(new Platform(startX, groundLevel, bottomWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

        // Ladder in middle - uses LADDER_WIDTH (40px, same as player)
        const ladderX = startX + bottomWidth/2 - this.metrics.LADDER_WIDTH/2;

        // Random target height from multiple layers
        const targetHeights = [heights.high, heights.midHigh, heights.mid];
        const targetHeight = targetHeights[this.rng.randomInt(0, targetHeights.length - 1)];
        const ladderHeight = groundLevel - targetHeight;
        this.ladders.push(new Ladder(ladderX, targetHeight, ladderHeight));

        // Platform at top - SMALL to MEDIUM
        const topWidths = [this.metrics.PLATFORM.SMALL, this.metrics.PLATFORM.MEDIUM];
        const topWidth = topWidths[this.rng.randomInt(0, topWidths.length - 1)];
        const topX = startX + bottomWidth/2 - topWidth/2;
        this.platforms.push(new Platform(topX, targetHeight - this.metrics.PLATFORM_HEIGHT, topWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

        // Random exit gap
        const exitGaps = [this.metrics.GAP.SMALL, this.metrics.GAP.MEDIUM];
        const exitGap = exitGaps[this.rng.randomInt(0, exitGaps.length - 1)];

        return {
            exitX: topX + topWidth + exitGap,
            exitHeight: targetHeight - this.metrics.PLATFORM_HEIGHT
        };
    }

    /**
     * CLUSTER CHUNK: Group of platforms in Fibonacci count
     */
    generateClusterChunk(startX, startHeight, fib, heights, groundLevel) {
        const count = this.rng.randomInt(3, 6); // 3-6 platforms for more variety
        let currentX = startX;
        const heightOptions = [heights.veryHigh, heights.high, heights.midHigh, heights.mid, heights.midLow, heights.low];

        for (let i = 0; i < count; i++) {
            // Platform width: TINY to MEDIUM for full variety
            const widths = [this.metrics.PLATFORM.TINY, this.metrics.PLATFORM.SMALL, this.metrics.PLATFORM.MEDIUM];
            const platformWidth = widths[this.rng.randomInt(0, widths.length - 1)];

            // Random height selection (not sequential)
            const platformY = heightOptions[this.rng.randomInt(0, heightOptions.length - 1)];

            this.platforms.push(new Platform(currentX, platformY, platformWidth, this.metrics.PLATFORM_HEIGHT, 'normal'));

            // Random gap between platforms
            const gaps = [this.metrics.GAP.SMALL, this.metrics.GAP.MEDIUM];
            const gap = gaps[this.rng.randomInt(0, gaps.length - 1)];
            currentX += platformWidth + gap;
        }

        return {
            exitX: currentX,
            exitHeight: heightOptions[this.rng.randomInt(0, heightOptions.length - 1)]
        };
    }

    /**
     * Generate height layers using golden ratio divisions
     * Creates aesthetically pleasing vertical sections
     */
    generateGoldenHeightLayers(groundLevel) {
        const layers = [];

        // Divide total height (0 to groundLevel) using golden ratio
        // Layer 1 (highest): 0 to groundLevel * 0.382
        layers.push(groundLevel * 0.15); // Very high
        layers.push(groundLevel * 0.30); // High

        // Layer 2 (mid-high): groundLevel * 0.382 to groundLevel * 0.618
        layers.push(groundLevel * 0.45); // Mid-high
        layers.push(groundLevel * 0.55); // Mid

        // Layer 3 (mid-low): groundLevel * 0.618 to groundLevel
        layers.push(groundLevel * 0.70); // Mid-low
        layers.push(groundLevel * 0.82); // Low

        return layers;
    }

    // Removed old generateFibonacciLadders - now using chunk-based generation

    generateRandomLevel() {
        const levelWidth = 3000;
        const groundLevel = 520;
        const platformTypes = ['normal', 'ice', 'moving', 'spring'];

        // Get bias parameters
        const biasParams = this.getBiasParameters();

        // Always start with a safe platform at ground
        this.platforms.push(new Platform(0, groundLevel, 200, 80, 'normal'));

        // Generate ground segments with some gaps
        let currentX = 250;
        while (currentX < levelWidth - 500) {
            const segmentWidth = this.rng.randomInt(biasParams.platformWidth.min, biasParams.platformWidth.max);
            const gapSize = this.rng.randomInt(biasParams.gapSize.min, biasParams.gapSize.max);

            this.platforms.push(new Platform(currentX, groundLevel, segmentWidth, 80, 'normal'));
            currentX += segmentWidth + gapSize;
        }

        // Generate random floating platforms with more vertical variety
        this.generateRandomFloatingPlatforms(levelWidth, groundLevel, platformTypes, biasParams);

        // Generate hazards
        this.generateHazards(levelWidth);
        this.generateAdvancedHazards(levelWidth, biasParams);

        // Set start and finish flags
        this.startFlag = {x: 50, y: groundLevel - 100, width: 20, height: 100};
        this.finishFlag = {x: levelWidth - 150, y: groundLevel - 100, width: 20, height: 100};

        // Final platform at the end
        this.platforms.push(new Platform(levelWidth - 300, groundLevel, 300, 80, 'normal'));
    }

    generateRandomFloatingPlatforms(levelWidth, groundLevel, platformTypes, biasParams) {
        // Divide level into sections for distribution
        const sections = 10;
        const sectionWidth = levelWidth / sections;

        for (let section = 1; section < sections - 1; section++) {
            const sectionStart = section * sectionWidth;
            const sectionEnd = (section + 1) * sectionWidth;

            // Generate multiple platforms per section at random heights
            const platformCount = this.rng.randomInt(
                biasParams.platformsPerSection.min,
                biasParams.platformsPerSection.max + 2
            );

            for (let i = 0; i < platformCount; i++) {
                // Random X within section
                const x = this.rng.randomInt(sectionStart + 30, sectionEnd - 100);

                // Random Y with wider range for more vertical variety
                // Range from 100 to 480 (allows platforms high up and mid-level)
                const y = this.rng.randomInt(100, 480);

                // Smaller platform widths to reduce overlap
                const width = this.rng.randomInt(60, 100);
                const height = 20;

                // Weight platform types - mostly normal
                let type = 'normal';
                const typeRoll = this.rng.random();
                if (typeRoll < 0.12) type = 'ice';
                else if (typeRoll < 0.20) type = 'moving';
                else if (typeRoll < 0.28) type = 'spring';

                this.platforms.push(new Platform(x, y, width, height, type));
            }
        }

        // Add some high platforms for advanced routes (scattered randomly)
        const highPlatformCount = this.rng.randomInt(
            biasParams.highPlatforms.min,
            biasParams.highPlatforms.max
        );

        for (let i = 0; i < highPlatformCount; i++) {
            const x = this.rng.randomInt(400, levelWidth - 400);
            const y = this.rng.randomInt(50, 200); // Very high platforms
            const width = this.rng.randomInt(70, 100);

            this.platforms.push(new Platform(x, y, width, 20, 'normal'));
        }
    }

    getBiasParameters() {
        // Progressive difficulty scaling: each level increases difficulty by 10%
        const difficultyScale = 1 + ((this.level - 1) * 0.1);
        const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

        switch (this.bias) {
            case 'wide_gap':
                return {
                    name: 'Wide Gap',
                    gapSize: {
                        min: Math.floor(100 + (this.level - 1) * 10), // Gaps get wider
                        max: Math.floor(250 + (this.level - 1) * 15)
                    },
                    platformWidth: {
                        min: Math.floor(100 - (this.level - 1) * 5), // Platforms get narrower
                        max: Math.floor(200 - (this.level - 1) * 8)
                    },
                    platformsPerSection: { min: 2, max: 4 },
                    hazardChance: clamp(0.7 + (this.level - 1) * 0.05, 0, 1),
                    highPlatforms: { min: 4, max: 8 }
                };
            case 'hazard_heavy':
                return {
                    name: 'Hazard Heavy',
                    gapSize: { min: 50, max: 150 },
                    platformWidth: { min: 150, max: 250 },
                    platformsPerSection: { min: 2, max: 4 },
                    hazardChance: clamp(0.95 + (this.level - 1) * 0.02, 0, 1.5), // More hazards spawn
                    highPlatforms: { min: 4, max: 8 }
                };
            case 'safe_zone':
                return {
                    name: 'Safe Zone',
                    gapSize: {
                        min: Math.floor(40 + (this.level - 1) * 5), // Gets slightly harder
                        max: Math.floor(120 + (this.level - 1) * 8)
                    },
                    platformWidth: {
                        min: Math.floor(Math.max(100, 180 - (this.level - 1) * 5)),
                        max: Math.floor(Math.max(150, 280 - (this.level - 1) * 8))
                    },
                    platformsPerSection: { min: 3, max: 5 },
                    hazardChance: clamp(0.3 + (this.level - 1) * 0.03, 0, 0.7), // Slowly adds hazards
                    highPlatforms: { min: 4, max: 8 }
                };
            case 'high_route':
                return {
                    name: 'High Route',
                    gapSize: { min: 50, max: 150 },
                    platformWidth: { min: 150, max: 250 },
                    platformsPerSection: { min: 2, max: 4 },
                    hazardChance: clamp(0.6 + (this.level - 1) * 0.05, 0, 1),
                    highPlatforms: {
                        min: 8 + Math.floor((this.level - 1) * 1), // More high platforms
                        max: 14 + Math.floor((this.level - 1) * 2)
                    },
                    higherY: Math.max(50, 150 - (this.level - 1) * 5) // Platforms spawn higher up
                };
            case 'tight_spaces':
                return {
                    name: 'Tight Spaces',
                    gapSize: {
                        min: Math.floor(Math.max(20, 30 - (this.level - 1) * 2)), // Tighter gaps
                        max: Math.floor(Math.max(40, 80 - (this.level - 1) * 4))
                    },
                    platformWidth: {
                        min: Math.floor(Math.max(60, 120 - (this.level - 1) * 5)), // Narrower platforms
                        max: Math.floor(Math.max(100, 200 - (this.level - 1) * 8))
                    },
                    platformsPerSection: {
                        min: 3 + Math.floor((this.level - 1) * 0.2), // More platforms
                        max: 5 + Math.floor((this.level - 1) * 0.3)
                    },
                    hazardChance: clamp(0.7 + (this.level - 1) * 0.05, 0, 1),
                    highPlatforms: { min: 4, max: 8 }
                };
            default: // normal
                return {
                    name: 'Normal',
                    gapSize: {
                        min: Math.floor(50 + (this.level - 1) * 5),
                        max: Math.floor(150 + (this.level - 1) * 10)
                    },
                    platformWidth: {
                        min: Math.floor(Math.max(80, 150 - (this.level - 1) * 3)),
                        max: Math.floor(Math.max(120, 250 - (this.level - 1) * 5))
                    },
                    platformsPerSection: { min: 2, max: 4 },
                    hazardChance: clamp(0.7 + (this.level - 1) * 0.04, 0, 1),
                    highPlatforms: { min: 4, max: 8 }
                };
        }
    }


    generateHazards(levelWidth) {
        // Generate spikes in gaps between ground platforms
        for (let i = 1; i < this.platforms.length - 1; i++) {
            const prevPlatform = this.platforms[i - 1];
            const nextPlatform = this.platforms[i];
            
            // Only add spikes between ground platforms
            if (prevPlatform.y === 520 && nextPlatform.y === 520) {
                const gapStart = prevPlatform.x + prevPlatform.width;
                const gapEnd = nextPlatform.x;
                const gapWidth = gapEnd - gapStart;
                
                // 50% chance to add spikes in larger gaps
                if (gapWidth > 80 && this.rng.random() < 0.5) {
                    const spikeX = gapStart + (gapWidth / 2) - 15;
                    this.spikes.push({x: spikeX, y: 480, width: 30, height: 40});
                }
            }
        }
    }

    generateAdvancedHazards(levelWidth, biasParams) {
        const sections = 6;
        const sectionWidth = levelWidth / sections;

        for (let section = 1; section < sections - 1; section++) {
            const sectionStart = section * sectionWidth;
            const sectionEnd = (section + 1) * sectionWidth;

            // Randomly choose hazard type for this section based on bias
            const hazardRoll = this.rng.random();

            if (hazardRoll < 0.3 * biasParams.hazardChance) {
                // Add saw blades
                const sawCount = this.rng.randomInt(1, 3);
                for (let i = 0; i < sawCount; i++) {
                    const x = this.rng.randomInt(sectionStart + 50, sectionEnd - 50);
                    const y = this.rng.randomInt(350, 450);
                    this.sawBlades.push(new SawBlade(x, y, this.rng.randomInt(15, 25)));
                }
            } else if (hazardRoll < 0.5 * biasParams.hazardChance) {
                // Add lava pits
                const lavaCount = this.rng.randomInt(1, 2);
                for (let i = 0; i < lavaCount; i++) {
                    const x = this.rng.randomInt(sectionStart + 30, sectionEnd - 100);
                    const width = this.rng.randomInt(60, 120);
                    this.lavaPits.push(new LavaPit(x, 490, width));
                }
            } else if (hazardRoll < biasParams.hazardChance) {
                // Add poison clouds
                const poisonCount = this.rng.randomInt(1, 2);
                for (let i = 0; i < poisonCount; i++) {
                    const x = this.rng.randomInt(sectionStart + 50, sectionEnd - 50);
                    const y = this.rng.randomInt(300, 400);
                    this.poisonClouds.push(new PoisonCloud(x, y, this.rng.randomInt(30, 50)));
                }
            }
        }
    }


    checkCollisions(player) {
        for (let platform of this.platforms) {
            // Check if player is landing on top of platform
            if (player.velocityY >= 0 && 
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height <= platform.y + 10 &&
                player.y + player.height >= platform.y - 10) {
                
                // Land on platform
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;

                // Move player with moving platforms
                if (platform.type === 'moving' && platform.deltaX) {
                    player.x += platform.deltaX;
                }

                // Apply friction based on platform type
                switch (platform.type) {
                    case 'ice':
                        // Less friction on ice (unless sticky gloves active)
                        if (player.consumableEffects && player.consumableEffects.stickyGloves) {
                            player.velocityX *= 0.8; // Normal friction with sticky gloves
                        } else {
                            player.velocityX *= 0.95; // Slippery without gloves
                        }
                        break;
                    case 'spring':
                        // Spring boost
                        if (player.velocityY >= 0) {
                            player.velocityY = -player.jumpPower * 1.5;
                            player.onGround = false;

                            // Play spring sound
                            if (player.soundManager) {
                                player.soundManager.playSpring();
                            }
                        } else {
                            // Normal friction when not bouncing
                            player.velocityX *= 0.8;
                        }
                        break;
                    case 'moving':
                        // Normal friction for moving platforms
                        player.velocityX *= 0.8;
                        break;
                    default:
                        // Normal friction for regular platforms
                        player.velocityX *= 0.8;
                        break;
                }
                return;
            }

            // Check side collisions
            if (player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                player.y + player.height > platform.y &&
                player.y < platform.y + platform.height) {
                
                // Left or right collision
                if (player.velocityX > 0 && player.x < platform.x) {
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                } else if (player.velocityX < 0 && player.x > platform.x) {
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                }
                
                // Bottom collision (hitting platform from below)
                if (player.velocityY < 0 && player.y > platform.y) {
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                }
            }
        }

        // Check ladder collisions
        for (let ladder of this.ladders) {
            if (ladder.isPlayerOnLadder(player)) {
                // Player is touching ladder
                if (player.keys.up || player.keys.down) {
                    // Player wants to climb - attach to ladder
                    player.onLadder = true;
                    player.currentLadder = ladder;
                    player.velocityY = 0; // Stop falling
                }
                break;
            } else if (player.currentLadder === ladder) {
                // Player left the ladder
                player.onLadder = false;
                player.currentLadder = null;
            }
        }

        // Check pit collisions (falling into pit = death)
        for (let pit of this.pits) {
            if (pit.isPlayerInPit(player)) {
                // Player fell into pit - respawn
                return this.respawnPlayer(player);
            }
        }

        // Check all hazard collisions
        const hazardResult = this.checkHazardCollisions(player);
        if (hazardResult) {
            return hazardResult;
        }

        // Check finish line
        if (player.x + player.width > this.finishFlag.x &&
            player.x < this.finishFlag.x + this.finishFlag.width &&
            player.y + player.height > this.finishFlag.y &&
            player.y < this.finishFlag.y + this.finishFlag.height) {
            
            return 'finish'; // Signal that player reached the end
        }

        return 'playing';
    }

    checkHazardCollisions(player) {
        // Skip collision check if player is invulnerable or dying
        if (player.invulnerable || player.isDying) return null;

        // Ghost mode - phase through all hazards
        if (player.consumableEffects && player.consumableEffects.ghostMode) {
            return null;
        }

        // Check spike collisions
        for (let spike of this.spikes) {
            if (player.x + player.width > spike.x &&
                player.x < spike.x + spike.width &&
                player.y + player.height > spike.y &&
                player.y < spike.y + spike.height) {
                return this.respawnPlayer(player);
            }
        }

        // Check saw blade collisions
        for (let sawBlade of this.sawBlades) {
            const bounds = sawBlade.getBounds();
            if (player.x + player.width > bounds.x &&
                player.x < bounds.x + bounds.width &&
                player.y + player.height > bounds.y &&
                player.y < bounds.y + bounds.height) {
                // Play saw hit sound
                if (this.soundManager) {
                    this.soundManager.playSawHit();
                }
                return this.respawnPlayer(player);
            }
        }

        // Check lava pit collisions
        for (let lavaPit of this.lavaPits) {
            const bounds = lavaPit.getBounds();
            if (player.x + player.width > bounds.x &&
                player.x < bounds.x + bounds.width &&
                player.y + player.height > bounds.y &&
                player.y < bounds.y + bounds.height) {
                // Play lava sizzle sound
                if (this.soundManager) {
                    this.soundManager.playLavaSizzle();
                }
                return this.respawnPlayer(player);
            }
        }

        // Check poison cloud collisions
        for (let poisonCloud of this.poisonClouds) {
            const bounds = poisonCloud.getBounds();
            if (player.x + player.width > bounds.x &&
                player.x < bounds.x + bounds.width &&
                player.y + player.height > bounds.y &&
                player.y < bounds.y + bounds.height) {
                // Play poison hiss sound
                if (this.soundManager) {
                    this.soundManager.playPoisonHiss();
                }
                return this.respawnPlayer(player);
            }
        }
        
        return null;
    }

    respawnPlayer(player) {
        // Check for shield charges - consume one instead of taking damage
        if (player.consumableEffects && player.consumableEffects.shieldCharges > 0) {
            player.consumableEffects.shieldCharges--;
            // Make player briefly invulnerable
            player.invulnerable = true;
            setTimeout(() => {
                player.invulnerable = false;
            }, 1000);
            return null; // No damage taken
        }

        const result = player.takeDamage();

        if (result === 'respawn') {
            // Reset player position (respawn at start with remaining lives)
            player.x = 100;
            player.y = this.platforms[0].y - player.height;
            player.velocityX = 0;
            player.velocityY = 0;
            player.onGround = true;
        }

        return result; // 'respawn' or 'game_over'
    }

    renderHazards(ctx) {
        // Render spikes
        for (let spike of this.spikes) {
            ctx.fillStyle = '#FF4444';
            ctx.fillRect(spike.x, spike.y, spike.width, spike.height);
            
            // Draw spike triangles
            ctx.fillStyle = '#CC0000';
            ctx.beginPath();
            for (let i = 0; i < spike.width; i += 6) {
                ctx.moveTo(spike.x + i, spike.y + spike.height);
                ctx.lineTo(spike.x + i + 3, spike.y);
                ctx.lineTo(spike.x + i + 6, spike.y + spike.height);
                ctx.closePath();
            }
            ctx.fill();
        }

        // Render saw blades
        for (let sawBlade of this.sawBlades) {
            sawBlade.render(ctx);
        }

        // Render lava pits
        for (let lavaPit of this.lavaPits) {
            lavaPit.render(ctx);
        }

        // Render poison clouds
        for (let poisonCloud of this.poisonClouds) {
            poisonCloud.render(ctx);
        }
    }

    render(ctx, camera) {
        ctx.save();
        ctx.translate(-camera.x, -camera.y);

        // Render pits first (they're behind everything)
        for (let pit of this.pits) {
            pit.render(ctx);
        }

        // Render platforms
        for (let platform of this.platforms) {
            platform.render(ctx);
        }

        // Render ladders (over platforms, behind player)
        for (let ladder of this.ladders) {
            ladder.render(ctx);
        }

        // Render all hazards
        this.renderHazards(ctx);
        
        // Render start flag
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(this.startFlag.x, this.startFlag.y, this.startFlag.width, this.startFlag.height);
        ctx.fillStyle = '#008800';
        ctx.fillRect(this.startFlag.x + 5, this.startFlag.y + 10, 10, 30);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('START', this.startFlag.x - 10, this.startFlag.y - 5);
        
        // Render finish flag
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.finishFlag.x, this.finishFlag.y, this.finishFlag.width, this.finishFlag.height);
        ctx.fillStyle = '#FF8800';
        ctx.fillRect(this.finishFlag.x + 5, this.finishFlag.y + 10, 10, 30);
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText('FINISH', this.finishFlag.x - 10, this.finishFlag.y - 5);
        
        ctx.restore();
    }
}