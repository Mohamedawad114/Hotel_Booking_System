import { Sys_Role } from '../enums';

export interface IToken {
  id: number;
  name: string;
  role: Sys_Role;
}
export interface IDecodedToken {
  id: number;
  name: string;
  role: Sys_Role;
  jti?: string;
}
