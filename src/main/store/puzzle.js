const fs = require('fs');
const path = require('path');

const filepath = path.join(process.cwd(), 'storage/puzzles.json');


const save = (data) => {
    const content = getFileContent();
    if (!Array.isArray(content.boards)) {
        content.boards = [];
    }
    
    content.boards.push(data);
    fs.writeFileSync(filepath, JSON.stringify(content, null, 4));
    return content;
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

