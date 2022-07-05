import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { Vector, Ball, Player, PlayerState, UserId, IInitializeRequest, IJoinGameRequest, IStartGameRequest, IStartRoundRequest, GameStates, IUpdatePlayerVelocityRequest, ServerState } from '../api/types';
import { changeVelocity, detectCollisions, resetGame, toRads } from './helper';

type InternalState = ServerState;
const screenHeight = 400;
const screenWidth = 600;
const firstPlayerX = 15;
const secondPlayerX = 575;
const ballSpeed = 100;
let ballspeedAdjustment = 0;
const paddlespeed = 20;
let vollies = 0;

export class Impl implements Methods<InternalState> {
    initialize(ctx: Context, request: IInitializeRequest): InternalState {
        return {
            Players: [],
            Balls: [],
            gameState: GameStates.PlayersJoining,
        };
    }

    /**********************************************************
     * joinGame - Remote Procedure Call
     * adds user to list of Players array[]
     * sends clients broadcast events to let them know player
     * joining, and if we hit our player limit, gamestate
     * changes to ready to start
     *********************************************************/

    joinGame(state: InternalState, userId: string, ctx: Context, request: IJoinGameRequest): Response {
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

        if (state.Players.length == 2) {
            state.gameState = GameStates.WaitingToStartGame;
            ctx.broadcastEvent('P2');
        } else if (state.Players.length == 1) {
            ctx.broadcastEvent('P1');
        }
        return Response.ok();
    }

    /**********************************************************
     * startGame - Remote Procedure Call
     * adds ball to list of Balls array[]
     * sends clients broadcast events to let them know ball
     * can be displayed, changes gamestate ready for waiting
     * to start
     *********************************************************/

    startGame(state: InternalState, userId: string, ctx: Context, request: IStartGameRequest): Response {
        if (state.Players.length != 2) return Response.error('Invalid number of players');
        if (state.gameState != GameStates.WaitingToStartGame) return Response.error('Not ready to start game');

        //create first ball
        const startPosition = { x: state.Players[0].position.x + 12, y: state.Players[0].position.y + 12 };
        state.Balls.push({
            position: startPosition,
            velocity: { x: 0, y: 0 },
            radius: 15,
            isColliding: false,
        });

        //update Gamestate
        state.gameState = GameStates.WaitingToStartRound;
        ctx.broadcastEvent('Ball');
        return Response.ok();
    }

    /**********************************************************
     * startRound - Remote Procedure Call
     * creates initial velocity for ball to leave player
     * changes gamestate so that onTick will manage movement
     *********************************************************/

    startRound(state: InternalState, userId: string, ctx: Context, request: IStartRoundRequest): Response {
        //gaurd conditions
        if (state.gameState != GameStates.WaitingToStartRound) return Response.error('Cannot start round');

        //set starting angle, by which side your on
        //if left side, angle will be between
        let startingAngle: number;
        if (state.Balls[0].position.x < 300) startingAngle = ctx.chance.integer({ min: -75, max: 75 });
        else startingAngle = ctx.chance.integer({ min: 115, max: 255 });
        let magnitude: number = ballSpeed;

        let xComponent = magnitude * Math.cos(toRads(startingAngle));
        let yComponent = magnitude * Math.sin(toRads(startingAngle));
        state.Balls[0].velocity = { x: xComponent, y: yComponent };
        state.gameState = GameStates.InProgress;
        return Response.ok();
    }

    /**********************************************************
     * updatePlayerVelocity - Remote Procedure Call
     * modifies the state value for a players velocity parameter
     *********************************************************/

    updatePlayerVelocity(state: InternalState, userId: string, ctx: Context, request: IUpdatePlayerVelocityRequest): Response {
        if (state.gameState != GameStates.InProgress && state.gameState != GameStates.WaitingToStartRound && state.gameState != GameStates.WaitingToStartGame) return Response.error('Cannot update velocity');

        let pIndex = 0;
        if (state.Players[1]) {
            if (userId == state.Players[1].id) pIndex = 1;
        }

        state.Players[pIndex].velocity = request.velocity;
        return Response.ok();
    }

    /**********************************************************
     * getUserState - Hathora method
     * this code runs prior to pushing state changes down to
     * clients, gives opportunity to 'remap' state data to a
     * client state, in case you want to hide some of the data
     * from each user
     *********************************************************/

    getUserState(state: InternalState, userId: UserId): PlayerState {
        let clientState: PlayerState = {
            player1position: state.Players[0] ? state.Players[0].position : { x: 15, y: 10 },
            player2position: state.Players[1] ? state.Players[1].position : { x: 575, y: 10 },
            ballposition: state.Balls[0] ? state.Balls[0].position : { x: 25, y: 25 },
            player1Lives: state.Players[0] ? state.Players[0].lives : 3,
            player2Lives: state.Players[1] ? state.Players[1].lives : 3,
        };

        return clientState;
    }

    /**********************************************************
     * onTick - Hathora method
     * as specified in hathora.yml, this runs on a 50ms timer
     * and its job is to update the position of each entity based
     * on velocity parameters, and then check for collisions
     *********************************************************/

    onTick(state: InternalState, ctx: Context, timeDelta: number): void {
        //player movement
        if (vollies % 5 == 1) {
            ballspeedAdjustment += 0.5;
        }

        for (const player of state.Players) {
            //check for players being at 'top' and 'bottom of screen
            const hittingTop = player.position.y < 0;
            const hittingBottom = player.position.y + player.size.y >= screenHeight;

            const pixelsToMove = paddlespeed * timeDelta;
            if (!hittingTop && player.velocity.y < 0) {
                player.position.y += player.velocity.y * pixelsToMove;
            } else if (!hittingBottom && player.velocity.y > 0) {
                player.position.y += player.velocity.y * pixelsToMove;
            }
            if (state.gameState == GameStates.WaitingToStartRound) {
                if (state.Balls[0].position.x < 300) {
                    //left player
                    if (player.id == state.Players[0].id) state.Balls[0].position.y += state.Players[0].velocity.y * pixelsToMove;
                } else {
                    //right player
                    if (player.id == state.Players[1].id) state.Balls[0].position.y += state.Players[1].velocity.y * pixelsToMove;
                }
            }
        }

        //ball movement
        if (state.gameState == GameStates.InProgress) {
            //set each ball movement
            for (const ball of state.Balls) {
                if (ball.velocity.x >= 0) ball.position.x += (ball.velocity.x + ballspeedAdjustment) * timeDelta;
                else ball.position.x += (ball.velocity.x - ballspeedAdjustment) * timeDelta;
                if (ball.velocity.y >= 0) ball.position.y += (ball.velocity.y + ballspeedAdjustment) * timeDelta;
                else ball.position.y += (ball.velocity.y - ballspeedAdjustment) * timeDelta;
            }

            //check for collisions with players
            detectCollisions(state);

            for (const player of state.Players) {
                if (player.isColliding) {
                    vollies += 1;
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
                const hittingTop = ball.position.y <= 0;
                const hittingBottom = ball.position.y + ball.radius >= screenHeight;
                if (hittingTop) {
                    //updateVelocity
                    vollies += 1;
                    changeVelocity(ball, 'top');
                } else if (hittingBottom) {
                    //updateVelocity
                    vollies += 1;
                    changeVelocity(ball, 'bottom');
                }
            }

            //check for ball leaving screen on left/right
            for (const ball of state.Balls) {
                const hittingLeft = ball.position.x <= 0;
                const hittingRight = ball.position.x + ball.radius >= screenWidth;
                if (hittingLeft) {
                    //player left decrement lives
                    state.Players[0].lives -= 1;
                    //if lives 0, game over
                    if (state.Players[0].lives == 0) {
                        ctx.broadcastEvent('Game Over');
                        state.gameState = GameStates.GameOver;
                    } else resetGame(state, 'left');
                } else if (hittingRight) {
                    //player right decrement lives
                    state.Players[1].lives -= 1;
                    if (state.Players[1].lives == 0) {
                        ctx.broadcastEvent('Game Over');
                        state.gameState = GameStates.GameOver;
                    } else resetGame(state, 'right');
                }
            }
        }
    }
}
