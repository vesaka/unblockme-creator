const ValidationError = require('../lib/validation-error.js');
const fs = require('fs');
const path = require('path');
const filepath = path.join(process.cwd(), 'storage/puzzles.json');


const save = (data) => {
    const content = getFileContent();
    if (!Array.isArray(content.boards)) {
        content.boards = [];
    }
    
    if (!data.name) {
        throw new ValidationError('Name is required');
    }
    
    for (let board of content.boards) {
        if (board.name === data.name) {
            throw new ValidationError('Name is taken');
        }
    }    
    
    fs.writeFileSync(filepath, JSON.stringify(content, null, 4));
    return 'Saved';
};

const load = (name) => {
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

module.exports = {save, load};

