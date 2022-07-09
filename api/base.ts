import axios from "axios";
import * as T from "./types";

export const COORDINATOR_HOST = process.env.COORDINATOR_HOST!;
export const MATCHMAKER_HOST = process.env.MATCHMAKER_HOST!;

export const NO_DIFF = Symbol("NODIFF");
export type DeepPartial<T> = T extends string | number | boolean | undefined
  ? T
  : T extends Array<infer ArrayType>
  ? Array<DeepPartial<ArrayType> | typeof NO_DIFF> | typeof NO_DIFF
  : T extends { type: string; val: any }
  ? { type: T["type"]; val: DeepPartial<T["val"] | typeof NO_DIFF> }
  : { [K in keyof T]: DeepPartial<T[K]> | typeof NO_DIFF };

export enum Method {
  UPDATE_PLAYER_VELOCITY,
  START_ROUND,
  JOIN_GAME,
  START_GAME,
}

export type OkResponse = { type: "ok" };
export type ErrorResponse = { type: "error"; error: string };
export type Response = OkResponse | ErrorResponse;
export const Response: { ok: () => OkResponse; error: (error: string) => ErrorResponse } = {
  ok: () => ({ type: "ok" }),
  error: (error) => ({ type: "error", error }),
};

export type ResponseMessage = { type: "response"; msgId: number; response: Response };
export type EventMessage = { type: "event"; event: string };
export type Message = ResponseMessage | EventMessage;
export const Message: {
  response: (msgId: number, response: Response) => ResponseMessage;
  event: (event: string) => EventMessage;
} = {
  response: (msgId, response) => ({ type: "response", msgId, response }),
  event: (event) => ({ type: "event", event }),
};

export interface AnonymousUserData {
  type: "anonymous";
  id: string;
  name: string;
}
export type UserData = AnonymousUserData;

export function lookupUser(userId: T.UserId): Promise<UserData> {
  return axios.get<UserData>(`https://${COORDINATOR_HOST}/users/${userId}`).then((res) => res.data);
}

export function getUserDisplayName(user: UserData) {
  switch (user.type) {
    case "anonymous":
      return user.name;
  }
}
