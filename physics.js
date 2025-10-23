class Physics {
    constructor() {
        this.gravity = 0.8;
        this.friction = 0.8;
        this.groundLevel = 500;
    }

    updateGravity(value) {
        this.gravity = parseFloat(value);
    }

    updateFriction(value) {
        this.friction = parseFloat(value);
    }

    applyGravity(entity) {
        // Use entity's gravity if it has one, otherwise use physics gravity
        const gravity = entity.gravity !== null && entity.gravity !== undefined ? entity.gravity : this.gravity;

        // Only apply gravity if not on ground or if moving upward
        if (entity.y + entity.height < this.groundLevel || entity.velocityY < 0) {
            entity.velocityY += gravity;
            entity.onGround = false;
        } else {
            // Only snap to ground if moving downward
            if (entity.velocityY >= 0) {
                entity.y = this.groundLevel - entity.height;
                entity.velocityY = 0;
                entity.onGround = true;
            }
        }
    }

    applyFriction(entity) {
        if (entity.onGround) {
            entity.velocityX *= this.friction;
        }
    }

    updatePosition(entity) {
        entity.x += entity.velocityX;
        entity.y += entity.velocityY;

        // Note: Boundary checks removed to allow screen wrapping
        // Wrapping is handled in game.js after camera update
    }

    checkCollisions(entity) {
        // Simple ground collision
        if (entity.y + entity.height >= this.groundLevel) {
            entity.y = this.groundLevel - entity.height;
            entity.velocityY = 0;
            entity.onGround = true;
        } else {
            entity.onGround = false;
        }
    }
}