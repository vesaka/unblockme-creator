const {save, load} = require('./store/puzzle.js');
module.exports = [
    {
        name: 'save-puzzle',
        action: save
    },
    {
        name: 'load-puzzle',
        action: load
    }
];

