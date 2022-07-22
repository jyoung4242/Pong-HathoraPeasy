import { Ball, GameStates, Player, Vector } from "../api/types";
import { InternalState } from "./impl";

export function detectCollisions(state: InternalState) {
  let obj1;
  let obj2;

  // Reset collision state of all objects
  for (let i = 0; i < state.Balls.length; i++) {
    state.Balls[i].isColliding = false;
  }

  // Start checking for collisions
  for (let i = 0; i < state.Balls.length; i++) {
    obj1 = state.Balls[i];
    for (let j = i; j < state.Players.length; j++) {
      obj2 = state.Players[j];

      // Compare object1 with object2
      if (
        rectIntersect(
          obj1.position.x,
          obj1.position.y,
          obj1.radius,
          obj1.radius,
          obj2.position.x,
          obj2.position.y,
          obj2.size.x,
          obj2.size.y
        )
      ) {
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

export function resetGame(state: InternalState, side: "left" | "right") {
  state.Balls.length = 0;
  //create first ball

  let startPosition: Vector;
  if (side == "left") startPosition = { x: state.Players[0].position.x + 12, y: state.Players[0].position.y + 12 };
  else startPosition = { x: state.Players[1].position.x - 12, y: state.Players[1].position.y + 12 };

  state.Balls.push({
    position: startPosition,
    velocity: { x: 0, y: 0 },
    radius: 15,
    isColliding: false,
  });

  //update Gamestate
  state.gameState = GameStates.WaitingToStartRound;
}

export function changeVelocity(obj1: Ball, obj2: "top" | "bottom" | Player) {
  //top or bottom
  if (obj2 == "top") {
    obj1.velocity.y = Math.abs(obj1.velocity.y);
  } else if (obj2 == "bottom") {
    obj1.velocity.y = -obj1.velocity.y;
  } else {
    obj1.velocity.x = -obj1.velocity.x;
    obj2.isColliding = false;
  }
  obj1.isColliding = false;
}

export function toRads(anl: number): number {
  return (anl * Math.PI) / 180;
}
