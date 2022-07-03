import { Methods, Context } from './.hathora/methods';
import { Response } from '../api/base';
import { Vector, Ball, Player, PlayerState, UserId, IInitializeRequest, IUpdatePlayerPositionRequest, IJoinGameRequest, IStartGameRequest } from '../api/types';

type InternalState = PlayerState;

export class Impl implements Methods<InternalState> {
    initialize(ctx: Context, request: IInitializeRequest): InternalState {
        return {
            Players: [],
            Balls: [],
        };
    }

    startGame(state: PlayerState, userId: string, ctx: Context, request: IStartGameRequest): Response {
        if (state.Players.length != 2) return Response.error('Invalid number of players');
        return Response.ok();
    }

    joinGame(state: PlayerState, userId: string, ctx: Context, request: IJoinGameRequest): Response {
        if (state.Players.length >= 2) return Response.error('This game has maximum amount of players');
        state.Players.push({
            id: userId,
            lives: 3,
            yPosition: 0,
            height: 25,
        });
        return Response.ok();
    }

    updatePlayerPosition(state: InternalState, userId: UserId, ctx: Context, request: IUpdatePlayerPositionRequest): Response {
        //find player index, there are only two, so if not 0, then 1
        let pIndex = 0;
        if (state.Players[1]) {
            if (userId == state.Players[1].id) pIndex = 1;
        }

        state.Players[pIndex].height = request.yPosition;
        return Response.ok();
    }
    getUserState(state: InternalState, userId: UserId): PlayerState {
        return state;
    }
    onTick(state: InternalState, ctx: Context, timeDelta: number): void {}
}
