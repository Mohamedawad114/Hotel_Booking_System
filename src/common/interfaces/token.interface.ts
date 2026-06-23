import { Sys_Role } from "../enums";

export interface IToken {
  id: number;
  username: string;
  role: Sys_Role;
}
export interface IDecodedToken {
  id: number;
  username: string;
  role: Sys_Role;
}
