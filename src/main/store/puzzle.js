// const ValidationError = require('../../lib/validation-error.js');
const fs = require('fs');
const path = require('path');
const filepath = path.join(process.cwd(), 'storage/puzzles.json');
const solver = require('rush-hour-solver').default;
const save = (data) => {
    const content = getFileContent();
    if (!Array.isArray(content.boards)) {
        content.boards = [];
    }

    fs.writeFileSync(filepath, JSON.stringify(content, null, 4));
    return 'Saved';
};

const load = (data) => {
    const content = getFileContent();
    
};

const getFileContent = () => {
    if (!fs.existsSync(filepath)) {
        fs.writeFileSync(filepath, JSON.stringify({
            version: '1.0.0',
            modes: ['Peasent', 'Noble', 'Sientist', 'Einstein'],
            boards: []
        }, null, 4));
    }
    
    return JSON.parse(fs.readFileSync(filepath));
}

const solve = blocks => {
    const list = [];
    for (const block of blocks) {
        list.push({
            length: block.size,
            direction: block.orientation === 'horizontal' ? 'H' : 'V',
            position: [block.row, block.col],
            isTarget: block.id === 1
        });
    }

    
    const game = new solver.Game({ size: 6, blocks: list});
    const solution = solver.solve(game);
};

module.exports = {save, load, solve};

