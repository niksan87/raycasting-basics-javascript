const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const PRIMARY_COLOR = "#222";
const SECONDARY_COLOR = "#fff";

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
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3;
        this.turnDirection = 0; // -1 if left, +1 if right
        this.walkDirection = 0; // -1 if bacl, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2 * (Math.PI / 180);
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
        fill("red");
        circle(this.x, this.y, this.radius);
        stroke("red");
        line(
            this.x,
            this.y,
            this.x + Math.cos(this.rotationAngle) * 30,
            this.y + Math.sin(this.rotationAngle) * 30
        );
    }
}

const grid = new Map();
const player = new Player();

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

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
}

function draw() {
    update();
    grid.render();
    player.render();
}

