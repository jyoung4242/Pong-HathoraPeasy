import jwtDecode from "jwt-decode";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import getRandomValues from "get-random-values";
import { Reader, Writer } from "bin-serde";
import axios from "axios";

import {
  decodeStateSnapshot,
  decodeStateUpdate,
  PlayerState as UserState,
  IInitializeRequest,
  IUpdatePlayerVelocityRequest,
  IStartRoundRequest,
  IJoinGameRequest,
  IStartGameRequest,
} from "../../api/types";
import { UserData, Response, Method, COORDINATOR_HOST, MATCHMAKER_HOST } from "../../api/base";

import { HathoraTransport, TCPHathoraTransport, TransportType, WebSocketHathoraTransport } from "./transport";
import { computePatch } from "./patch";
import { ConnectionFailure, transformCoordinatorFailure } from "./failures";

export type StateId = string;
export type UpdateArgs = { stateId: StateId; state: UserState; updatedAt: number; events: string[] };
export type UpdateCallback = (updateArgs: UpdateArgs) => void;
export type ErrorCallback = (error: ConnectionFailure) => void;

export class HathoraClient {
  public appId = "90aa622a1663da446f8566eca014d8d93b66b63ff0479900c32dbc3e356648e9";

  public static getUserFromToken(token: string): UserData {
    return jwtDecode(token);
  }

  public async loginAnonymous(): Promise<string> {
    const res = await axios.post(`https://${COORDINATOR_HOST}/${this.appId}/login/anonymous`);
    return res.data.token;
  }

  public async create(token: string, request: IInitializeRequest): Promise<string> {
    const res = await axios.post(
      `https://${COORDINATOR_HOST}/${this.appId}/create`,
      IInitializeRequest.encode(request).toBuffer(),
      { headers: { Authorization: token, "Content-Type": "application/octet-stream" } }
    );
    return res.data.stateId;
  }

  public async connect(
    token: string,
    stateId: StateId,
    onUpdate?: UpdateCallback,
    onError?: ErrorCallback,
    transportType?: TransportType
  ): Promise<HathoraConnection> {
    const connection = new HathoraConnection(this.appId, stateId, token, onUpdate, onError, transportType);
    await connection.connect();
    return connection;
  }

  public async findMatch(
    token: string,
    request: IInitializeRequest,
    numPlayers: number,
    onUpdate: (playersFound: number) => void
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const socket = new WebSocket(`wss://${MATCHMAKER_HOST}/${this.appId}`);
      socket.binaryType = "arraybuffer";
      socket.onclose = reject;
      socket.onopen = () =>
        socket.send(
          new Writer()
            .writeString(token)
            .writeUVarint(numPlayers)
            .writeBuffer(IInitializeRequest.encode(request).toBuffer())
            .toBuffer()
        );
      socket.onmessage = ({ data }) => {
        const reader = new Reader(new Uint8Array(data as ArrayBuffer));
        const type = reader.readUInt8();
        if (type === 0) {
          onUpdate(reader.readUVarint());
        } else if (type === 1) {
          resolve(reader.readString());
        } else {
          console.error("Unknown message type", type);
        }
      };
    });
  }
}

export class HathoraConnection {
  private callbacks: Record<string, (response: Response) => void> = {};
  private changedAt = 0;
  private updateListeners: UpdateCallback[] = [];
  private errorListeners: ErrorCallback[] = [];
  private transport: HathoraTransport;
  private internalState: UserState | undefined;

  constructor(
    private appId: string,
    private stateId: StateId,
    private token: string,
    onUpdate?: UpdateCallback,
    onError?: ErrorCallback,
    transportType?: TransportType
  ) {
    this.stateId = stateId;
    this.token = token;

    if (transportType === undefined || transportType === TransportType.WebSocket) {
      this.transport = new WebSocketHathoraTransport(appId);
    } else if (transportType === TransportType.TCP) {
      this.transport = new TCPHathoraTransport(appId);
    } else {
      throw new Error("Unknown transport type");
    }

    if (onUpdate !== undefined) {
      this.onUpdate(onUpdate);
    }
    if (onError !== undefined) {
      this.onError(onError);
    }
  }

  public async connect(): Promise<void> {
    await this.transport.connect(this.stateId, this.token, this.handleData, this.handleClose);
  }

  public get state(): UserState {
    if (this.internalState === undefined) {
      throw new Error("Must wait on HathoraConnection.connect() before looking up state");
    }
    return this.internalState;
  }

  public onUpdate(listener: UpdateCallback) {
    this.updateListeners.push(listener);
  }

  public onError(listener: ErrorCallback) {
    this.errorListeners.push(listener);
  }

  public removeAllListeners() {
    this.updateListeners = [];
    this.errorListeners = [];
  }

  public updatePlayerVelocity(request: IUpdatePlayerVelocityRequest): Promise<Response> {
    return this.callMethod(Method.UPDATE_PLAYER_VELOCITY, IUpdatePlayerVelocityRequest.encode(request).toBuffer());
  }

  public startRound(request: IStartRoundRequest): Promise<Response> {
    return this.callMethod(Method.START_ROUND, IStartRoundRequest.encode(request).toBuffer());
  }

  public joinGame(request: IJoinGameRequest): Promise<Response> {
    return this.callMethod(Method.JOIN_GAME, IJoinGameRequest.encode(request).toBuffer());
  }

  public startGame(request: IStartGameRequest): Promise<Response> {
    return this.callMethod(Method.START_GAME, IStartGameRequest.encode(request).toBuffer());
  }

  public disconnect(code?: number): void {
    this.transport.disconnect(code);
  }

  private callMethod(method: Method, request: Uint8Array): Promise<Response> {
    return new Promise((resolve, reject) => {
      if (!this.transport.isReady()) {
        reject("Connection not open");
      } else {
        const msgId: Uint8Array = getRandomValues(new Uint8Array(4));
        this.transport.write(new Uint8Array([...new Uint8Array([method]), ...msgId, ...request]));
        this.callbacks[new DataView(msgId.buffer).getUint32(0)] = resolve;
      }
    });
  }

  private handleData = (data: Buffer) => {
    const reader = new Reader(new Uint8Array(data as ArrayBuffer));
    const type = reader.readUInt8();
    if (type === 0) {
      this.internalState = decodeStateSnapshot(reader);
      this.changedAt = 0;
      this.updateListeners.forEach((listener) =>
        listener({
          stateId: this.stateId,
          state: JSON.parse(JSON.stringify(this.internalState)),
          updatedAt: 0,
          events: [],
        })
      );
    } else if (type === 1) {
      const { stateDiff, changedAtDiff, responses, events } = decodeStateUpdate(reader);
      if (stateDiff !== undefined) {
        this.internalState = computePatch(this.internalState!, stateDiff);
      }
      this.changedAt += changedAtDiff;
      this.updateListeners.forEach((listener) =>
        listener({
          stateId: this.stateId,
          state: JSON.parse(JSON.stringify(this.internalState)),
          updatedAt: this.changedAt,
          events: events.map((e) => e.event),
        })
      );
      responses.forEach(({ msgId, response }) => {
        if (msgId in this.callbacks) {
          this.callbacks[msgId](response);
          delete this.callbacks[msgId];
        }
      });
    } else if (type === 2) {
      this.transport.disconnect(4004);
    } else if (type === 3) {
      this.transport.pong();
    } else {
      console.error("Unknown message type", type);
    }
  };

  private handleClose = (e: { code: number; reason: string }) => {
    console.error("Connection closed", e);
    this.errorListeners.forEach((listener) => listener(transformCoordinatorFailure(e)));
  };
}
