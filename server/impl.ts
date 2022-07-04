import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { Vector, Ball, Player, PlayerState, UserId, IInitializeRequest, IJoinGameRequest, IStartGameRequest, IStartRoundRequest, GameStates, IUpdatePlayerVelocityRequest } from '../api/types';

type InternalState = PlayerState;
const screenHeight = 400;
const screenWidth = 600;
const firstPlayerX = 15;
const secondPlayerX = 575;

export class Impl implements Methods<InternalState> {
    initialize(ctx: Context, request: IInitializeRequest): InternalState {
        return {
            Players: [],
            Balls: [],
            gameState: GameStates.PlayersJoining,
        };
    }

    startGame(state: PlayerState, userId: string, ctx: Context, request: IStartGameRequest): Response {
        if (state.Players.length != 2) return Response.error('Invalid number of players');
        if (state.gameState != GameStates.WaitingToStartGame) return Response.error('Not ready to staRt game');
        //create first ball
        state.Balls.push({
            position: { x: 24, y: 12 },
            velocity: { x: 0, y: 0 },
            radius: 15,
            isColliding: false,
        });

        //update Gamestate
        state.gameState = GameStates.WaitingToStartRound;
        return Response.ok();
    }

    joinGame(state: PlayerState, userId: string, ctx: Context, request: IJoinGameRequest): Response {
        if (state.gameState != GameStates.PlayersJoining) return Response.error('Cannot allow players to join');
        if (state.Players.length >= 2) return Response.error('This game has maximum amount of players');
        state.Players.push({
            id: userId,
            lives: 3,
            velocity: { x: 0, y: 0 },
            position: { x: 0, y: 0 },
            size: { x: 10, y: 24 },
            isColliding: false,
        });
        if (state.Players.length == 2) state.gameState = GameStates.WaitingToStartGame;
        return Response.ok();
    }

    startRound(state: PlayerState, userId: string, ctx: Context, request: IStartRoundRequest): Response {
        throw new Error('Method not implemented.');
    }

    updatePlayerVelocity(state: PlayerState, userId: string, ctx: Context, request: IUpdatePlayerVelocityRequest): Response {
        let pIndex = 0;
        if (state.Players[1]) {
            if (userId == state.Players[1].id) pIndex = 1;
        }

        state.Players[pIndex].velocity = request.velocity;
        return Response.ok();
    }

    getUserState(state: InternalState, userId: UserId): PlayerState {
        return state;
    }

    onTick(state: InternalState, ctx: Context, timeDelta: number): void {
        for (const player of state.Players) {
            player.position.y += Math.floor(player.velocity.y * timeDelta);
        }
        if (state.gameState == GameStates.InProgress) {
            //set each ball movement
            for (const ball of state.Balls) {
                ball.position.x += Math.floor(ball.velocity.x * timeDelta);
                ball.position.y += Math.floor(ball.velocity.y * timeDelta);
            }

            //check for collisions with players
        }
    }
}
