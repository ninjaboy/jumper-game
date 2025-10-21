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
        // Only apply gravity if not on ground or if moving upward
        if (entity.y + entity.height < this.groundLevel || entity.velocityY < 0) {
            entity.velocityY += this.gravity;
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

        // Keep player within level bounds
        if (entity.x < 0) {
            entity.x = 0;
            entity.velocityX = 0;
        }
        if (entity.x + entity.width > 3000) {
            entity.x = 3000 - entity.width;
            entity.velocityX = 0;
        }
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