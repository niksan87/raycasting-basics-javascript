const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const PRIMARY_COLOR = "#222";
const SECONDARY_COLOR = "#fff";

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 1;
const NUM_OF_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

const MINIMAP_SCALE_FACTOR = 0.25;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }

    hasWallAt(x, y) {
        if (x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT) {
            return true;
        }
        const mapGridIndexX = Math.floor(x / TILE_SIZE);
        const mapGridIndexY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] === 1;
    }

    render() {
        for (let i = 0; i < MAP_NUM_ROWS; i++) {
            for (let j = 0; j < MAP_NUM_COLS; j++) {
                const tileX = j * TILE_SIZE;
                const tileY = i * TILE_SIZE;
                const tileColor = this.grid[i][j] ? PRIMARY_COLOR : SECONDARY_COLOR;
                stroke(PRIMARY_COLOR);
                fill(tileColor);
                rect(MINIMAP_SCALE_FACTOR * tileX,
                     MINIMAP_SCALE_FACTOR * tileY,
                     MINIMAP_SCALE_FACTOR * TILE_SIZE,
                     MINIMAP_SCALE_FACTOR * TILE_SIZE
                );
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 7;
        this.radius = 4;
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if bacl, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 4.0;
        this.rotationSpeed = 3 * (Math.PI / 180);
    }

    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        const moveStep = this.walkDirection * this.moveSpeed;
        const newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        const newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;
        if (!grid.hasWallAt(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }
    }

    render() {
        noStroke();
        fill("blue");
        circle(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.radius
        );
        stroke("red");
        line(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 30),
            MINIMAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 30)
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;
        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;
        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }

    cast(columnId) {
        let xintercept, yintercept;
        let xstep, ystep;
        // Horizontal ray grid intersection
        let foundHorzWallHit = false;
        let horzWallHitX = 0;
        let horzWallHitY = 0;
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;
        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;
        let nextHorzTouchX = xintercept;
        let nextHorzTouchY = yintercept;

        while (
            nextHorzTouchX >= 0 &&
            nextHorzTouchX <= WINDOW_WIDTH &&
            nextHorzTouchY >= 0 &&
            nextHorzTouchY <= WINDOW_HEIGHT
            ) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        // Vertical ray grid intersection
        let foundVertWallHit = false;
        let vertWallHitX = 0;
        let vertWallHitY = 0;
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;
        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;
        let nextVertTouchX = xintercept;
        let nextVertTouchY = yintercept;

        while (
            nextVertTouchX >= 0 &&
            nextVertTouchX <= WINDOW_WIDTH &&
            nextVertTouchY >= 0 &&
            nextVertTouchY <= WINDOW_HEIGHT
            ) {
            if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        const horzHitDistance = 
            foundHorzWallHit
            ? distanceBetweenPoints(player.x, player.y, horzWallHitX, horzWallHitY)
            : Number.MAX_VALUE;

        const vertHitDistance = 
            foundVertWallHit
            ? distanceBetweenPoints(player.x, player.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;

        this.wallHitX = (horzHitDistance < vertHitDistance) ? horzWallHitX : vertWallHitX;
        this.wallHitY = (horzHitDistance < vertHitDistance) ? horzWallHitY : vertWallHitY;
        this.distance = (horzHitDistance < vertHitDistance) ? horzHitDistance : vertHitDistance;
        this.wasHitVertical = vertHitDistance < horzHitDistance;
    }

    render() {
        stroke("orange");
        line(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY
        )
    }
}

const grid = new Map();
const player = new Player();
let rays = [];

function keyPressed() {
    if (keyCode === UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode === DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode === RIGHT_ARROW) {
        player.turnDirection = +1;
    } else if (keyCode === LEFT_ARROW) {
        player.turnDirection = -1;
    }
}

function keyReleased() {
    if (keyCode === UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode === DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode === RIGHT_ARROW) {
        player.turnDirection = 0;
    } else if (keyCode === LEFT_ARROW) {
        player.turnDirection = 0;
    }  
}

function castAllRays() {
    let columnId = 0;
    let rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];
    for (let i = 0; i < NUM_OF_RAYS; i++) {
    //for (let i = 0; i < 1; i++) {
        const ray = new Ray(rayAngle);
        ray.cast(columnId);
        rays.push(ray);
        rayAngle += FOV_ANGLE / NUM_OF_RAYS;
        columnId++;
    }
}

function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}

function render3DProjectedWalls() {
    for (let i = 0; i < NUM_OF_RAYS; i++) {
        const ray = rays[i];
        const correctWallDistance = ray.distance * Math.cos(ray.rayAngle - player.rotationAngle);
        const distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(FOV_ANGLE / 2);
        const wallStripHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;
        const alpha = 1.0; // (250 / correctWallDistance);
        const color = ray.wasHitVertical ? 255 : 220;
        fill(`rgba(${color}, ${color}, ${color}, ${alpha})`);
        noStroke();
        rect(
            i * WALL_STRIP_WIDTH,
            (WINDOW_HEIGHT / 2) - (wallStripHeight / 2),
            WALL_STRIP_WIDTH,
            wallStripHeight
        );
    }
}

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    clear("#212121");
    update();
    render3DProjectedWalls();
    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}
