// const ValidationError = require('../../lib/validation-error.js');
const fs = require('fs');
const path = require('path');
const { PythonShell } = require('python-shell');
const filepath = path.join(process.cwd(), 'storage/puzzles.json');


const save = (data) => {
    const content = getFileContent();
    if (!Array.isArray(content.boards)) {
        content.boards = [];
    }
    
    // if (!data.name) {
    //     throw new ValidationError('Name is required');
    // }
    
    // for (let board of content.boards) {
    //     if (board.name === data.name) {
    //         throw new ValidationError('Name is taken');
    //     }
    // }    
    // console.log(data);
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

const solve = (blocks) => {
    
    const goal = blocks.shift();
    const list = [];
    for (const block of blocks) {
        list.push([`B${block.id-1}`, block.size, block.orientation, [block.col, block.row]]);
    }
console.log([goal.col, goal.row]);
    let pyshell = new PythonShell(process.cwd() + '/src/main/solver/run.py');
    pyshell.send(JSON.stringify([list, [goal.col, goal.row]]));

    pyshell.on('message', function (message) {
        // received a message sent from the Python script (a simple "print" statement)
        console.log(message);
      });

      pyshell.end(function (err,code,signal) {
        if (err) throw err;
        console.log('The exit code was: ' + code);
        console.log('The exit signal was: ' + signal);
        console.log('finished');
      });

    // const py = spawn('python', [path.join(process.cwd(), 'src/main/solver/run.py'), JSON.stringify(list)]);
    // py.stdout.on('data', (data) => {
    //     console.log(`stdout: ${data}`);
    // });    

    // py.stderr.on('data', (data) => {
    //     console.log(`stderr: ${data}`);
    // }); 



    return list;
}

module.exports = {save, load, solve};

