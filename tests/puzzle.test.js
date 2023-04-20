const { asert } = require('chai');
const { save, load } = require('../src/main/store/puzzle.js');
describe('Puzzle', () => {
    it('finds a file data.json', () => {
        save({ name: 'test-board', grid: [], blocks: []});
    });
});
