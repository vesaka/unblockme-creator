#!/usr/bin/python
import json
import sys
from unblockme import *
V = "vertical"
H = "horizontal"
if __name__ == '__main__':
    input = json.loads(sys.stdin.read())
    blocks = input[0]
    goal = tuple(input[1])

    for block in blocks:
        block[3] = tuple(block[3])


    print(blocks, goal)
    beginner_board_1 = make_init_state(
        [["B1", 3, V, (0, 0)],
         ["B2", 2, H, (0, 1)],
         ["B3", 2, V, (3, 0)],
         ["B4", 2, H, (4, 1)],
         ["B5", 3, V, (1, 3)], 
         ["B6", 3, H, (5, 2)],
         ["B7", 3, V, (3, 5)]
         ], (2, 1))

    beginner_board_2 = make_init_state(
        [["B1", 3, H, (0, 0)],
         ["B2", 3, V, (1, 2)],
         ["B3", 2, V, (3, 0)],
         ["B4", 3, H, (5, 0)],
         ["B5", 2, H, (3, 4)],
         ["B6", 2, V, (4, 4)]
         ], (2, 0))

    
    expert_board_1 = make_init_state(
        [["B1", 2, H, (3, 0)],
         ["B2", 2, H, (4, 0)],
         ["B3", 2, H, (5, 0)],
         ["B4", 2, H, (1, 2)],
         ["B5", 2, V, (2, 2)], 
         ["B6", 2, V, (4, 2)],
         ["B7", 2, V, (2, 3)],
         ["B8", 2, H, (0, 3)],
         ["B9", 2, V, (1, 4)],
         ["B10", 3, V, (0, 5)],
         ["B11", 2, H, (3, 4)],
         ["B12", 3, H, (4, 3)],
         ["B13", 3, H, (5, 3)]
         ], (2, 0))
    
    board = make_init_state(blocks, goal)
    se = SearchEngine('astar', 'full')
    #se.search(expert_board_1, unblockme_goal_fn, heur_num_blocks_blocking)
    se.search(board, unblockme_goal_fn, heur_num_blocks_blocking)
    #print(blocks)
    #print("\n\n\nAll boards have been tested!")
    #sys.stderr.flush()
       