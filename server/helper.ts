import { PlayerState } from '../api/types';

export function detectCollisions(state: PlayerState) {
    let obj1;
    let obj2;

    // Reset collision state of all objects
    for (let i = 0; i < state.Balls.length; i++) {
        state.Balls[i].isColliding = false;
    }

    // Start checking for collisions
    for (let i = 0; i < state.Balls.length; i++) {
        obj1 = state.Balls[i];
        for (let j = i + 1; j < state.Players.length; j++) {
            obj2 = state.Players[j];

            // Compare object1 with object2
            if (rectIntersect(obj1.position.x, obj1.position.y, obj1.radius, obj1.radius, obj2.position.x, obj2.position.y, obj2.size.x, obj2.size.y)) {
                obj1.isColliding = true;
                obj2.isColliding = true;
            }
        }
    }
}

function rectIntersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
    // Check x and y for overlap
    if (x2 > w1 + x1 || x1 > w2 + x2 || y2 > h1 + y1 || y1 > h2 + y2) {
        return false;
    }
    return true;
}
