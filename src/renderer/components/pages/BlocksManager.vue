<template>
    <Transition>
        <div class="flex flex-col">
            <div class="flex flex-row py-1" id="buttons" ref="buttons">
                <button v-for="btn in actionButtons"
                        id="btn.id"
                        class="btn btn-primary"
                        @click="btn.action"
                        type="button" v-html="btn.title"></button>
            </div>
            <div id="main" class="flex flex-row">
                <div id="board" ref="board" class="relative">
                    <div id="bTop" class="box" ref="bTop"></div>
                    <div id="bMid" class="box" ref="bMid"></div>
                    <div id="bBot" class="box" ref="bBot"></div>
                    <div v-for="(block, index) in allBlocks"
                         class="block"
                         @mousedown.prevent="ev => onStartMove(ev, block)"
                         @mousemove.prevent="ev => onMove(ev, block)"
                         :style="block.style" :id="`block${index}`"></div>
                </div>
                <div id="right">
                    <div v-if="false">
                        <span v-html="padZero(stopwatch.minutes)"></span>
                        :<span v-html="padZero(stopwatch.seconds)"></span>
                    </div>
                    <div id="msg">
                        <p v-for="note in notes" v-html="note"></p>
                    </div>
                </div>
            </div>
            <Modal id="save-as" ref="saveAs">
                <div class="input-group mb-3">
                    <span class="input-group-text" id="basic-addon1">Save As</span>
                    <input type="text" class="form-control" placeholder="Username"  aria-label="Save Name" aria-describedby="basic-addon1" v-model="input.name">
                   
                </div>
                 <p class="text text-danger" v-html="errors.name"></p>
                <div class="d-flex flex-row justify-content-center">
                    <button class="btn btn-primary pr-2" @click="saveGame">Save</button>
                    <button class="btn btn-secondary" @click="saveModal.hide()">Close</button>
                </div>
            </Modal>
        </div>
    </Transition>
</template>
<script setup>
    import { ref, reactive, computed, watchEffect, onBeforeMount, onMounted, onBeforeUnmount, nextTick } from 'vue';
    import Modal from '../ui/Modal.vue';
    import ValidationError from '$root/lib/validation-error.js';
    import { useTimer, useStopwatch } from 'vue-timer-hook';
    const timer = useTimer();
    const stopwatch = useStopwatch();
    const IDLE = 'idle';
    const READY = 'ready';
    const CHECKING = 'checking';
    const EDITING = 'editing';
    
    let saveModal = null;
    const errors = reactive({});
    const input = reactive({});

    const BOARD_SIZE = 6;
    const BLOCK_SIZE = 100;
    const BLOCK_PADDING = 5;
    const MAX_BLOCKS = 14;
    const NCELLS = BOARD_SIZE * BOARD_SIZE;
    const FREE_CELLS = NCELLS - BOARD_SIZE;
    const BOARD_SIZE_POWER = Math.pow(BOARD_SIZE * 2, 2);
    const yDim = [1, 1, 2, 3];
    const xDim = [2, 3, 1, 1];
    const inc1Bl = [1, 1, BOARD_SIZE, BOARD_SIZE];               // a block is at [bp, bp+i1, bp+i2]
    const inc2Bl = [1, 2, BOARD_SIZE, BOARD_SIZE * 2];              // next second place for this block
    const end1Bl = [2, 3, BOARD_SIZE * 2, BOARD_SIZE * 3];             // Next space after this block
    const hvBl = [true, true, false, false]; // True for horizontal block
    const delBlk = null;

    const GOAL = [16, 0];
    const DIG_MAX = 1000000;

    let tipsMode = false;
    let status = IDLE;
    let messages = [];

    let graph = [];
    let digCount = DIG_MAX;
    let lvlMax = 50000;
    let lvlCount = 0;
    let nodeMax = 100000;
    let nodeCount = 0;
    let winCount = 0;
    let pathLen = 0;
    let editMode = false;
    let firstEdit = true;
    let moveCount;
    /**
     * Refs
     */
    const board = ref(null);
    const buttons = ref(null);

    let blocks = [];
    let activeBlock;
    const allBlocks = ref(blocks);
    const notes = ref([]);

    watchEffect(() => notes.value = messages);
    /**
     * Methods
     */
    const start = () => {
        blocks = createFromString('200 002 011 422 120 232 432 042 052 242 252 440 540');
        renderBoard(blocks);
        checkBoard();
    };

    const loading = ref(false);

    const renderBoard = (blocks) => {
        allBlocks.value = blocks;
    };

    const renderMessages = () => {
        notes.value = messages;
    };

    const padZero = v => {
        return String(v.value).padStart(2, '0');
    };

    const actionButtons = computed(() => {
        return [
            {id: 'check', title: 'Analyze', action: checkBoard},
            {id: 'reset', title: 'Reset', action: resetBoard},
            {id: 'createGame', title: 'Create Game', action: createGame},
            {id: 'newGame', title: 'New Game', action: newGame},
            {id: 'saveGame', title: 'Save', action: () => saveModal.show()}
        ];
    });

    const createBlock = (block, index = 0) => {
        if (isNaN(block[0])) {
            throw new Error('NaN index found');
        }
        const bp = block[0];
        const bt = block[1];
        const col = bp % BOARD_SIZE;
        const line = (bp - col) / BOARD_SIZE;
        const top = BLOCK_SIZE * line;
        const left = BLOCK_SIZE * col;
        return {
            bp, bt, col,
            bn: index,
            sTop: top,
            sLeft: left,
            style: {
                width: (BLOCK_SIZE * xDim[bt] - BLOCK_PADDING) + 'px',
                height: (BLOCK_SIZE * yDim[bt] - BLOCK_PADDING) + 'px',
                backgroundColor: 1 === index ? 'red' : (bt < 2 ? 'green' : 'blue'),
                top: `${top}px`,
                left: `${left}px`
            }
        };
    };
    const createFromString = (str) => {
        const asg = str.split(" ");
        const blocks = [];
        for (let i = 0; i < asg.length; i++) {
            if (asg[i].length === 3) {
                var bt = Math.min(3, Number(asg[i].charAt(2)));
                var line = Number(asg[i].charAt(0));
                var col = Number(asg[i].charAt(1));
                blocks.push(createBlock([BOARD_SIZE * line + col, bt], blocks.length + 1));
            }
        }

        return blocks;
    };

    const onStartMove = (ev, block) => {
        const {bt, bn, bp} = block;
        const div = ev.target;
        block.deltaX = div.offsetLeft - ev.clientX;
        block.deltaY = div.offsetTop - ev.clientY;
        block.div = ev.target;
        const minMax = minMaxPos(bp, bt, blocks);

        if (bt < 2) {
            block.min = BLOCK_SIZE * (minMax[0] % BOARD_SIZE);
            block.max = BLOCK_SIZE * (minMax[1] % BOARD_SIZE);
        } else {
            block.min = BLOCK_SIZE * Math.floor(minMax[0] / BOARD_SIZE);
            block.max = BLOCK_SIZE * Math.floor(minMax[1] / BOARD_SIZE);
        }

        block.moving = true;
    };

    const onMove = (ev) => {
        const block = blocks.find(b => b.moving);
        if (!block)
            return;

        const {bt, bn, bp, sTop, sLeft, min, max, deltaX, deltaY, div} = block;

        if (bt < 2) {
            block.left = Math.min(max, Math.max(min, ev.clientX + deltaX));
            div.style.left = block.left + 'px';
        } else {
            block.top = Math.min(max, Math.max(min, ev.clientY + deltaY));
            div.style.top = block.top + 'px';
        }
    };

    const onEndMove = () => {
        const block = blocks.find(b => b.moving);
        if (!block)
            return;

        const {bt, bp, bn, left, top, div} = block;
        let line, col;

        if (bt < 2) {
            line = (bp - bp % BOARD_SIZE) / BOARD_SIZE;

            col = Math.round(left / BLOCK_SIZE);
            block.left = (BLOCK_SIZE * col);
            div.style.left = block.left + 'px';
        } else {
            col = bp % BOARD_SIZE;
            line = Math.round(top / BLOCK_SIZE);
            block.top = (BLOCK_SIZE * line);
            div.style.top = block.top + 'px';
        }

        block.bp = BOARD_SIZE * line + col;
        block.moving = false;
        block.div = null;
        if (bn === 1 && block.bp === 16) {
            console.log('YOU WIN');
            //document.getElementById("msg").innerHTML = "YOU WIN !!";
        } else {
            //showTips();
        }
    };

//Creating puzzle
    const minMaxPos = (bp, bt, blocks) => {
        const from = (hvBl[bt]) ? (bp - bp % BOARD_SIZE) : bp % BOARD_SIZE;  // First and last cell Line/col
        const to = from + inc1Bl[bt] * (BOARD_SIZE - 1);
        const inc = inc1Bl[bt];
        let min = bp - inc;

        while (from <= min && isEmpty(min, blocks)) {
            min -= inc;
        }
        min += inc;
        let max = bp + end1Bl[bt];
        while (max <= to && isEmpty(max, blocks)) {
            max += inc;
        }
        max -= end1Bl[bt];
        return [min, max];
    };

    const isEmpty = (p, blocks) => {
        var empty = true;
        for (var i = 0; i < blocks.length && empty; i++) {
            const {bp, bt} = blocks[i];
            empty = (bp === delBlk) || (p !== bp && p !== (bp + inc1Bl[bt]) && p !== (bp + inc2Bl[bt]));
        }
        return empty;
    };

    const resetBoard = () => {
        const cb = copy(blocks);
        renderBoard(cb);
    };

    const checkBoard = () => {
        const cb = copy(blocks);
        winCount = 0;
        digCount = DIG_MAX;
        nodeCount = 0;
        lvlCount = 0;
        graph = [];
        messages = reactive([]);
        messages.push('Start Digging!');
        const t0 = performance.now();
        digDownPath(blocks);
        const t1 = performance.now();

        if (sameBlocks(cb)) {
            messages.push(`Successful Digging in ${Math.round(t1 - t0)} ms
                            with ${nodeCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} nodes`);
            messages.push(winCount ? `We have ${winCount} solutions(s)` : "No winning solutions found");
        } else {
            messages.push('Something went wrong');
        }
        renderMessages();
        if (winCount) {
            messages.push('Start analysing path');
            createShortPath();
            blocks = cb;
            messages.push(`Longest path is ${pathLen}`);
            const keys = getKeysFromBlocks(blocks);
            moveCount = graph[keys[0]][keys[1]] - 1;
            messages.push(`Nb moves to win is ${moveCount}`);
            messages.push(`End analysing path`);

        } else {
            messages.push(`No path to analyse`);
        }

        renderMessages();

        console.log(Object.values(Object.values(graph)[0]).length);

    };

    const newGame = () => {

    };

    const createGame = () => {
        loading.value = true;
        let fblocks = createNewBoard();
        let currLen = -1;
        let lastLen = 0;
        let loopCount = 10;
        let maxLen = -1;
        let maxKey = [];
        messages = reactive([]);
        messages.push('Start Digging...');

        do {

            lastLen = maxLen;

            for (let ib = 1; ib < blocks.length; ib++) {
                blocks = fblocks.slice(0, ib).concat(fblocks.slice(ib + 1))
                createPathFromBlocks(blocks);
                markWin(blocks.length);
                createShortPath();
                const keys = findLongestPath();
                const currLen = graph[keys[0]][keys[1]];
                if (currLen > maxLen) {
                    messages.push("Found a " + currLen + " move(s) path");
                    maxLen = currLen;
                    maxKey = keys;
                }
            }
            messages.push(`Best path is ${maxLen}`);
            fblocks = getBlocksFromKeys(maxKey, blocks.length);
            if (maxLen > lastLen) {
                messages.push(`Trying to make it better`);
            }
        } while (maxLen > lastLen && loopCount--);

        !loopCount && console.log("LOOP COUNT REACH 0");
        blocks = fblocks;
        messages.push(`End digging with ${maxLen}`);
        return blocks;
        renderBoard(blocks);
        checkBoard();

    };

    const createNewBoard = () => {
        const blocks = [createBlock(GOAL, 1)];
        let moves = createPossibleBlocks(blocks);
        let loopCount = FREE_CELLS;

        while (moves.length && blocks.length < MAX_BLOCKS && loopCount--) {
            const oneMove = moves[Math.floor(moves.length * Math.random())];

            if (Math.floor(oneMove[0] / BOARD_SIZE) !== 2 || 1 < oneMove[1]) {
                blocks.push(createBlock(oneMove, blocks.length + 1));
                moves = createPossibleBlocks(blocks);
            } else {
                moves = (moves.length === 1) ? [] : createPossibleBlocks(blocks);
            }
        }
        return blocks;

    };

    const createPossibleBlocks = (blocks) => {
        var bps = [];
        for (var bp = 0; bp < NCELLS; bp++) {
            if (isEmpty(bp, blocks)) {
                for (var bt = 0; bt < 4; bt++) {
                    if (isPlacable(bp, bt, blocks) && isEmptyBlock(bp, bt, blocks)) {
                        bps.push([bp, bt]);
                    }
                }
            }
        }
        return bps;
    };

    const isPlacable = (bp, bt) => {
        return (bt < 2 && (bp % BOARD_SIZE + bt % 2) < (BOARD_SIZE - 1))
                || (1 < bt && (bp + BOARD_SIZE * (bt % 2)) < FREE_CELLS);
    };

    const isEmptyBlock = (p, bt, blocks) => {
        return blocks.length
                && isEmpty(p, blocks)
                && isEmpty(p + inc1Bl[bt], blocks)
                && isEmpty(p + inc2Bl[bt], blocks);
        var empty = blocks.length;
        if (empty) {
            empty = isEmpty(p, blocks) && isEmpty(p + inc1Bl[bt], blocks) && isEmpty(p + inc2Bl[bt], blocks);
        }
        return empty;
    };

    const createPathFromBlocks = (blocks) => {
        graph = [];
        addBlocksToGraph(blocks, 1);
        let foundOne = true, lvl;
        for (lvl = 1; lvl < 1000 && foundOne; lvl++) {
            foundOne = false;
            for (let i in graph) {
                for (let j in graph[i]) {
                    if (graph[i][j] === lvl) {
                        foundOne = true;
                        blocks = getBlocksFromKeys([i, j], blocks.length);
                        // Move all blocks
                        for (let ib = 0; ib < blocks.length; ib++) {
                            const ap = posBegEnd(ib, blocks);
                            const bp = blocks[ib].bp;
                            for (let ip = 0; ip < ap.length; ip++) {
                                blocks[ib].bp = ap[ip];
                                addBlocksToGraph(blocks, lvl + 1);
                            }
                            blocks[ib].bp = bp;
                        }
                    }
                }
            }
        }
        pathLen = lvl - 3;
        return pathLen;
    };

    const isKey = (keys) => {
        return (undefined !== graph[keys[0]]) && (undefined !== graph[keys[0]][keys[1]]);
    };

    const addBlocksToGraph = (blocks, v) => {
        const keys = getKeysFromBlocks(blocks);

        if (undefined === graph[keys[0]]) {
            graph[keys[0]] = [];
        }
        const isNew = !isKey(keys);
        if (isNew) {
            nodeCount++;
            graph[keys[0]][keys[1]] = v;
            (v === 1) && winCount++;
        }
        return isNew;
    };

    const getBlocksFromKeys = (keys, nb) => {
        const blocks = [];
        const ks = [parseInt(keys[0]), parseInt(keys[1])];
        for (var k = 0; k < 2; k++) {
            while (ks[k]) {
                const bt = ks[k] % 4;
                const ps4 = (ks[k] - bt) % 144;
                ks[k] = (ks[k] - ps4 - bt) / 144;
                blocks.push(createBlock([ps4 / 4, bt], blocks.length + 1));
            }
        }
        // We can mist the last block if it is 000
        if (blocks.length < nb) {
            blocks.push(createBlock([0, 0], blocks.length + 1));
        }
        return blocks;
    };

    const getKeysFromBlocks = (blocks) => {
        let k1 = 0, k2 = 0, split = Math.floor((blocks.length + 1) / 2);
        for (let i = split - 1; 0 <= i; i--) {
            if (blocks[i].bp !== delBlk) {  // deleted block = null
                k1 = 144 * k1 + 4 * blocks[i].bp + blocks[i].bt;
            }
        }
        for (let i = blocks.length - 1; split <= i; i--) {
            if (blocks[i].bp !== delBlk) {   // deleted block = null
                k2 = 144 * k2 + 4 * blocks[i].bp + blocks[i].bt;
            }
        }
        return [k1, k2];
    };

    const posBegEnd = (bn, blocks) => {
        const bps = [];
        if (bn < blocks.length) {
            const {bp, bt} = blocks[bn];
            if (bt < 2) {
                0 < (bp % BOARD_SIZE) && isEmpty(bp - 1, blocks) && bps.push(bp - 1);
                ((bp % BOARD_SIZE) + end1Bl[bt]) < BOARD_SIZE && isEmpty(bp + end1Bl[bt], blocks) && bps.push(bp + inc1Bl[bt]);
            } else {
                (BOARD_SIZE - 1) < bp && isEmpty(bp - BOARD_SIZE, blocks) && bps.push(bp - BOARD_SIZE);
                bp + end1Bl[bt] < NCELLS && isEmpty(bp + end1Bl[bt], blocks) && bps.push(bp + inc1Bl[bt]);
            }
        }
        return bps;
    };

    const findLongestPath = () => {
        let longest = 0, keys = [];
        for (var i in graph) {
            for (var j in graph[i]) {
                if (longest < graph[i][j]) {
                    keys = [i, j];
                    longest = graph[i][j];
                }
            }
        }
        return keys;
    };

    const createShortPath = () => {
        let foundOne = true;
        let lvl = 1;
        for (lvl = 1; lvl < 1000 && foundOne; lvl++) {
            foundOne = false;
            for (let i in graph) {
                for (var j in graph[i]) {
                    if (graph[i][j] === lvl) {
                        blocks = getBlocksFromKeys([i, j], blocks.length);
                        foundOne = true;
                        // Find all board on Graph from this nove
                        for (let ib = 0; ib < blocks.length; ib++) {
                            const ap = posBegEnd(ib, blocks);
                            if (ap.length) {
                                const bp = blocks[ib].bp;
                                for (let ip = 0; ip < ap.length; ip++) {
                                    blocks[ib].bp = ap[ip];
                                    var keys = getKeysFromBlocks(blocks);
                                    if (isKey(keys)) {
                                        var g = graph[keys[0]][keys[1]];
                                        if (g === 0 || g > lvl + 1) {
                                            graph[keys[0]][keys[1]] = lvl + 1;
                                        }
                                    } else {
                                        console.log("Not in Graph !!");
                                    }
                                }
                                blocks[ib].bp = bp;
                            }
                        }
                    }
                }
            }
        }
        pathLen = lvl - 3;
    };

    const markWin = bBl => {
        winCount = 0;
        for (let i in graph) {
            for (let j in graph[i]) {
                const blocks = getBlocksFromKeys([i, j], bBl);
                if (blocks[0].bp === GOAL[0]) {
                    graph[i][j] = 1;
                    winCount++;
                } else {
                    graph[i][j] = 0;
                }
            }
        }
    };

//Analyse
    const digDownPath = (blocks) => {
        createPathFromBlocks(blocks);
        markWin(blocks.length);
    };

    const copy = (blocks) => {
        const nb = [];
        for (let i = 0; i < blocks.length; i++) {
            nb[i] = blocks[i];
        }
        return nb;
    }

    const sameBlocks = (cb) => {
        let same = true;
        for (let i = 0; i < blocks.length && same; i++) {
            same = cb[i].bp === blocks[i].bp && cb[i].bt === blocks[i].bt;
        }
        return same;
    }

    const tipsBoard = () => {
        tipsMode = !tipsMode;
        showTips();
    };

    const showTips = () => {
        if (tipsMode) {
            messages = reactive([]);
            const keys = getKeysFromBlocks(blocks);
            if (isKey(keys)) {
                moveCount = graph[keys[0]][keys[1]];
                if (moveCount) {
                    messages.push(`${(graph[keys[0]][keys[1]] - 1)} moves before you win`);
                } else {
                    messages.push(`No winning move`);
                }
            } else {
                messages.push(`Something Wrong!`);
            }
        }
    };

    const transformBlocks = () => {
        const list = [];
        for (const block of blocks) {
            const t = block.bp % BOARD_SIZE;
            list.push({
                id: block.bn,
                orientation: block.bt < 2 ? 'horizontal' : 'vertical',
                size: Math.max(xDim[block.bt], yDim[block.bt]),
                row: t,
                col: (block.bp - t) / BOARD_SIZE
            });
        }

        return list;
    };


    const saveGame = () => {
        electronAPI.post('save-puzzle', { 
                    blocks: transformBlocks(),
                    name: input.name,
                    moves: moveCount
                })
                .then((res) => {})
                .catch(err => {
                    if (err instanceof ValidationError) {
                        errors.name = err.message;
                    }
                });
    };

    onMounted(() => {
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEndMove);
        start();
        saveModal = new bootstrap.Modal(document.getElementById('save-as'), {
            keyboard: false
          });
    });

    onBeforeUnmount(() => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onEndMove);
    });


</script>
<style>
    #board      {
        width:600px;
        height:600px;
    }
    #editBlocks {
        display: none;
        width:400px;
        height:300px;
    }
    #main {
        position: relative;
    }
    #editBorder {
        width: 100%;
        height: 100%;
        border: 2px solid black;
    }
    #board .box  {
        width: 100%;
        border: 2px solid black;
    }
    #board #bTop {
        height: 200px;
        border-bottom: none;
    }
    #board #bMid {
        height: 100px;
        border-bottom: none;
        border-top: none;
        border-right: none;
    }
    #board #bBot {
        height: 300px;
        border-top: none;
    }
    #board img, #editBlocks img, #board .block, #editBlocks .block {
        position: absolute;
        padding: 5px;
    }
    #board, #right, #editBlocks, #msg {
        float: left;
    }
    #right {
        margin-left: 20px;
    }
    #msg {
        height: 295px;
    }
    #msg, textarea, button {
        margin-top: 5px;
    }
    #msg, #editBlocks {
        clear: both;
    }
</style>