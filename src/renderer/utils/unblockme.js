class UnblockMe {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.goalPosition = {x: this.width - 1, y: Math.floor(this.height / 2)};
        this.grid = this.generateGrid();
    }

    generateGrid() {
        // Create an empty grid
        const grid = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(0);
            }
            grid.push(row);
        }

        // Add the goal block to the grid
        grid[this.goalPosition.y][this.goalPosition.x] = 1;

        // Add random blocks to the grid
        const numBlocks = Math.floor(Math.random() * (this.width + this.height) / 2);
        const blockPositions = []; // Keep track of block positions for checking solvability
        for (let i = 0; i < numBlocks; i++) {
            const x = Math.floor(Math.random() * this.width);
            const y = Math.floor(Math.random() * this.height);
            if (grid[y][x] === 0) {
                grid[y][x] = 2;
                blockPositions.push({x, y});
            } else {
                i--; // Retry placing the block
            }
        }

        // Add the player block to the grid
        let playerPosition = {x: -1, y: -1};
        while (playerPosition.x === -1 || playerPosition.y === -1 || grid[playerPosition.y][playerPosition.x] !== 0) {
            playerPosition = {x: Math.floor(Math.random() * this.width), y: Math.floor(Math.random() * this.height)};
        }
        grid[playerPosition.y][playerPosition.x] = 3;

        // Check if the puzzle is solvable
        const emptyPositions = this.findEmptyPositions(grid);
        const isSolvable = this.isSolvable(blockPositions, playerPosition, emptyPositions);
        if (!isSolvable) {
            // If the puzzle is not solvable, regenerate it
            return this.generateGrid();
        }

        return grid;
    }

    findEmptyPositions(grid) {
        // Find all empty positions on the grid
        const emptyPositions = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (grid[y][x] === 0) {
                    emptyPositions.push({x, y});
                }
            }
        }
        return emptyPositions;
    }

    isSolvable(blockPositions, playerPosition, emptyPositions) {
        // Check if the puzzle is solvable using a modified depth-first search
        const visitedPositions = new Set();
        const stack = [playerPosition];
        while (stack.length > 0) {
            const currentPosition = stack.pop();
            if (currentPosition.x === this.goalPosition.x && currentPosition.y === this.goalPosition.y) {
                return true; // Puzzle is solvable
            }
            if (visitedPositions.has(`${currentPosition.x},${currentPosition.y}`)) {
                continue; // Already visited this position
            }
            visitedPositions.add(`${currentPosition.x},${currentPosition.y}`);
            for (const direction of ['up', 'down', 'left', 'right']) {
                const newPosition = this.moveBlock(currentPosition, direction);
                if (this.isValidPosition(newPosition, emptyPositions) && !visitedPositions.has(`${newPosition.x},${newPosition.y}`)) {
// Check if the moved block is a solution
                    let isSolution = true;
                    for (const blockPosition of blockPositions) {
                        if (blockPosition.x === playerPosition.x && blockPosition.y === playerPosition.y) {
                            continue; // Skip the player block
                        }
                        if (!this.isValidPosition(this.moveBlock(blockPosition, direction), emptyPositions)) {
                            isSolution = false;
                            break;
                        }
                    }
                    if (isSolution) {
                        stack.push(newPosition);
                    }
                }
            }
        }
        return false; // Puzzle is not solvable
    }

    isValidPosition(position, emptyPositions) {
// Check if a block position is valid (i.e., within the grid and not blocked by other blocks)
        return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.height &&
                emptyPositions.some(emptyPosition => emptyPosition.x === position.x && emptyPosition.y === position.y);
    }

    moveBlock(position, direction) {
// Move a block in a certain direction
        switch (direction) {
            case 'up':
                return {x: position.x, y: position.y - 1};
            case 'down':
                return {x: position.x, y: position.y + 1};
            case 'left':
                return {x: position.x - 1, y: position.y};
            case 'right':
                return {x: position.x + 1, y: position.y};
        }
    }
}
