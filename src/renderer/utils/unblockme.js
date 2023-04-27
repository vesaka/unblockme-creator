class UnblockMe {
    constructor(size) {
        this.size = size;
        this.goalPosition = {x: this.size - 1, y: Math.floor(this.size / 2)};
        //this.grid = this.generateGrid();
    }

    generateGrid() {
        let isSolvable = false;
        let grid; 
        
        while (!isSolvable) {
          // Create an empty grid
          grid = [];
          for (let y = 0; y < this.size; y++) {
            const row = [];
            for (let x = 0; x < this.size; x++) {
              row.push(0);
            }
            grid.push(row);
          }
      
          // Add the goal block to the grid
          grid[this.goalPosition.y][this.goalPosition.x] = 1;
      
          // Add random blocks to the grid
          const numBlocks = Math.floor(Math.random() * (this.size + this.size) / 2);
          const blockPositions = []; // Keep track of block positions for checking solvability
          for (let i = 0; i < numBlocks; i++) {
            let blockAdded = false;
            while (!blockAdded) {
              const x = Math.floor(Math.random() * this.size);
              const y = Math.floor(Math.random() * this.size);
              if (grid[y][x] === 0) {
                grid[y][x] = 2;
                blockPositions.push({x, y});
                blockAdded = true;
              }
            }
          }
      
          // Add the player block to the grid
          let playerPosition = {x: -1, y: -1};
          while (playerPosition.x === -1 || playerPosition.y === -1 || grid[playerPosition.y][playerPosition.x] !== 0) {
            playerPosition = {x: Math.floor(Math.random() * this.size), y: Math.floor(Math.random() * this.size)};
          }
          grid[playerPosition.y][playerPosition.x] = 3;
      
          // Check if the puzzle is solvable
          const emptyPositions = this.findEmptyPositions(grid);
          isSolvable = this.isSolvable(blockPositions, playerPosition, emptyPositions);
        }
      
        return grid;
      }
      

    findEmptyPositions(grid) {
        // Find all empty positions on the grid
        const emptyPositions = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
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
        return position.x >= 0 && position.x < this.size && position.y >= 0 && position.y < this.size &&
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

export default UnblockMe;
