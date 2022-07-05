import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { Vector, Ball, Player, PlayerState, UserId, IInitializeRequest, IJoinGameRequest, IStartGameRequest, IStartRoundRequest, GameStates, IUpdatePlayerVelocityRequest, ServerState } from '../api/types';
import { changeVelocity, detectCollisions, resetGame, toRads } from './helper';

type InternalState = ServerState;
export const screenHeight = 400;
const screenWidth = 600;
const firstPlayerX = 15;
const secondPlayerX = 575;
const ballSpeed = 20;

export class Impl implements Methods<InternalState> {
    initialize(ctx: Context, request: IInitializeRequest): InternalState {
        return {
            Players: [],
            Balls: [],
            gameState: GameStates.PlayersJoining,
        };
    }

    startGame(state: InternalState, userId: string, ctx: Context, request: IStartGameRequest): Response {
        if (state.Players.length != 2) return Response.error('Invalid number of players');
        if (state.gameState != GameStates.WaitingToStartGame) return Response.error('Not ready to start game');
        //create first ball
        state.Balls.push({
            position: { x: 24, y: 24 },
            velocity: { x: 0, y: 0 },
            radius: 15,
            isColliding: false,
        });

        //update Gamestate
        state.gameState = GameStates.WaitingToStartRound;
        return Response.ok();
    }

    joinGame(state: InternalState, userId: string, ctx: Context, request: IJoinGameRequest): Response {
        console.log(`join game called`);
        if (state.gameState != GameStates.PlayersJoining) return Response.error('Cannot allow players to join');
        if (state.Players.length >= 2) return Response.error('This game has maximum amount of players');
        let startingposition: number;

        if (state.Players.length == 1) startingposition = secondPlayerX;
        else startingposition = firstPlayerX;

        state.Players.push({
            id: userId,
            lives: 3,
            velocity: { x: 0, y: 0 },
            position: { x: startingposition, y: 0 },
            size: { x: 10, y: 48 },
            isColliding: false,
        });

        if (state.Players.length == 2) state.gameState = GameStates.WaitingToStartGame;
        return Response.ok();
    }

    startRound(state: InternalState, userId: string, ctx: Context, request: IStartRoundRequest): Response {
        //gaurd conditions
        if (state.gameState != GameStates.WaitingToStartRound) return Response.error('Cannot start round');

        //set starting angle, by which side your on
        //if left side, angle will be between
        let startingAngle: number;
        if (state.Balls[0].position.x < 300) startingAngle = ctx.chance.integer({ min: -89, max: 89 });
        else startingAngle = ctx.chance.integer({ min: 91, max: 269 });
        let magnitude: number = ballSpeed;
        console.log(`starting angle: `, startingAngle);
        let xComponent = magnitude * Math.cos(toRads(startingAngle));
        let yComponent = magnitude * Math.sin(toRads(startingAngle));
        state.Balls[0].velocity = { x: xComponent, y: yComponent };
        console.log('changing gamestate');
        state.gameState = GameStates.InProgress;
        return Response.ok();
    }

    updatePlayerVelocity(state: InternalState, userId: string, ctx: Context, request: IUpdatePlayerVelocityRequest): Response {
        console.log(`Getting velocity update`);
        let pIndex = 0;
        if (state.Players[1]) {
            if (userId == state.Players[1].id) pIndex = 1;
        }

        state.Players[pIndex].velocity = request.velocity;
        return Response.ok();
    }

    getUserState(state: InternalState, userId: UserId): PlayerState {
        let clientState: PlayerState = {
            player1position: state.Players[0] ? state.Players[0].position : { x: 0, y: 0 },
            player2position: state.Players[1] ? state.Players[1].position : { x: 0, y: 0 },
            ballposition: state.Balls[0] ? state.Balls[0].position : { x: 0, y: 0 },
            player1Lives: state.Players[0] ? state.Players[0].lives : 3,
            player2Lives: state.Players[1] ? state.Players[1].lives : 3,
        };

        return clientState;
    }

    onTick(state: InternalState, ctx: Context, timeDelta: number): void {
        //player movement

        for (const player of state.Players) {
            //check for players being at 'top' and 'bottom of screen
            const hittingTop = player.position.y - player.size.y <= 0;
            const hittingBottom = player.position.y >= screenHeight;
            if (!hittingTop && !hittingBottom) player.position.y += player.velocity.y * timeDelta;
        }

        //ball movement
        if (state.gameState == GameStates.InProgress) {
            //set each ball movement
            for (const ball of state.Balls) {
                ball.position.x += ball.velocity.x * timeDelta;
                ball.position.y += ball.velocity.y * timeDelta;
            }

            //check for collisions with players
            detectCollisions(state);

            for (const player of state.Players) {
                if (player.isColliding) {
                    console.log(`hit player`);
                    for (const ball of state.Balls) {
                        if (ball.isColliding) {
                            //depending on player, change balls velocity accordingly
                            changeVelocity(ball, player);
                        }
                    }
                }
            }

            //check for balls being at 'top' and 'bottom of screen
            for (const ball of state.Balls) {
                const hittingTop = ball.position.y - ball.radius <= 0;
                const hittingBottom = ball.position.y + ball.radius >= screenHeight;
                if (hittingTop) {
                    console.log('hit top');
                    //updateVelocity
                    changeVelocity(ball, 'top');
                } else if (hittingBottom) {
                    //updateVelocity
                    console.log(`hit bottom`);
                    changeVelocity(ball, 'bottom');
                }
            }

            //check for ball leaving screen on left/right
            for (const ball of state.Balls) {
                const hittingLeft = ball.position.x - ball.radius <= 0;
                const hittingRight = ball.position.x + ball.radius >= screenHeight;
                if (hittingLeft) {
                    console.log(`hit left side`);
                    //player left decrement lives
                    state.Players[0].lives -= 1;
                    //if lives 0, game over
                    if (state.Players[0].lives == 0) state.gameState = GameStates.GameOver;
                    //else, reset game
                    resetGame(state, 'left');
                } else if (hittingRight) {
                    console.log(`hit right side`);
                    //player right decrement lives
                    state.Players[1].lives -= 1;
                    //if lives 0 game over
                    if (state.Players[1].lives == 0) state.gameState = GameStates.GameOver;
                    //else reset game
                    resetGame(state, 'right');
                }
            }
        }
    }
}
