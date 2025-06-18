import { User } from "../user";

export interface ITokenPayload {
  token: string,
  user: User,
}