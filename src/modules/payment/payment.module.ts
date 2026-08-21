import { Module } from "@nestjs/common";
import { notificationModel } from "src/common/DB";
import { PaymentController } from "./paymnet.controller";
import { PaymentService } from "./payment.service";

@Module({
    providers: [PaymentService],
    controllers: [PaymentController],
    imports:[notificationModel]
})
export class PaymentModule{}  
