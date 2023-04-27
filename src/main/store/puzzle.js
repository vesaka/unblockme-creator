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
    data.solution = solve(data.blocks).map(serialize);
    data.blocks = data.blocks.map(serialize);
    if (!data.name) {
        data.name = `game${content.boards.length}`
    }    

    content.boards.push(data);

    fs.writeFileSync(filepath, JSON.stringify(content, null, 4));
    return {
        moves: data.solution.length
    };
};

const load = (data) => {
    const content = getFileContent();

    content.boards.map(board => {
        board.blocks = board.blocks.map(unserialize);

        return board;

    });

    return content.boards;
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
            direction: block.orientation.charAt(0).toUpperCase(),
            position: [block.row, block.col],
            isTarget: block.id === 1
        });
    }

    const game = new solver.Game({ size: 6, blocks: list });
    const solution = solver.solve(game);


    return solution;
};

const serialize = (obj) => {
    const arr = [];
    for (let k in obj) {
        arr.push(`${k}:${obj[k]}`);
    }
    return arr.join(',');
};

const unserialize = (str) => {
    const o = {};
    str.split(',').forEach(f => {
        const [k, v] = f.split(':');
        o[k] = !isNaN(v) ? Number(v) : v;
    });
    return o;
};

const updateBoards = () => {
    const content = getFileContent();

    let counter = 0;
    const stopAt = 3;
    content.boards = content.boards.map(board => {
        if (!board.solution && counter < stopAt) {
            const blocks = board.blocks.map(unserialize);
            console.log(blocks);
            //board.solution = solve(blocks).map(serialize);
            // console.log(board.solution);
            counter++;
        }
        
        return board;
    });

    //fs.writeFileSync(filepath, JSON.stringify(content, null, 4));
    return [];
}

module.exports = { save, load, solve };

