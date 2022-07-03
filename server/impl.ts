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
        throw new Error('Method not implemented.');
    }

    joinGame(state: PlayerState, userId: string, ctx: Context, request: IJoinGameRequest): Response {
        throw new Error('Method not implemented.');
    }

    updatePlayerPosition(state: InternalState, userId: UserId, ctx: Context, request: IUpdatePlayerPositionRequest): Response {
        return Response.error('Not implemented');
    }
    getUserState(state: InternalState, userId: UserId): PlayerState {
        return state;
    }
    onTick(state: InternalState, ctx: Context, timeDelta: number): void {}
}
