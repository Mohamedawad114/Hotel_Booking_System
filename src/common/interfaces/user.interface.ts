import { Sys_Role } from '../enums';

export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string;
  customer_id?: string;
  city: string;
  isTwoFA?:boolean
  street: string;
  phone: string;
  photo?: string;
  isConfirmed: boolean;
  role?: Sys_Role;
  date_birth: Date;
  updatedAt: Date;
  createdAt: Date;
}
