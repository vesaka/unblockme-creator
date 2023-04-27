const {save, load, solve} = require('./store/puzzle.js');
module.exports = [
    {
        name: 'save-puzzle',
        action: save
    },
    {
        name: 'load-puzzles',
        action: load
    },
    {
        name: 'solve-puzzle',
        action: solve
    }
];

