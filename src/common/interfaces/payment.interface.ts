import { IUser } from "./user.interface";

export interface IPaymentGateway {
    pay(dto: any, user: IUser);
    refund(paymentId: string, amount?: number): Promise<any>;
}