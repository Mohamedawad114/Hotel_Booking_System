import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PinoLogger } from 'nestjs-pino';
import {
  notificationContent,
  redis,
  redisKeys,
  redisSub,
  TokenServices,
  UserRepository,
} from 'src/common';
import { NotificationTitle, Sys_Role } from 'src/common/enums';
import { NotificationService } from '../notification/notification.service';

@Injectable()
@WebSocketGateway({ namespace: `public`, cors: { origin: '*' } })
export class Gateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    OnModuleInit
{
  @WebSocketServer()
  private readonly server: Server;
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: PinoLogger,
    private readonly tokenService: TokenServices,
    private readonly userRepo: UserRepository,
  ) {}

  afterInit(server: Server) {
    this.logger.info('WebSocket server initialized');
  }
  async handleConnection(client: Socket) {
    let auth =
      client.handshake.auth?.authorization ||
      client.handshake.headers?.authorization;
    if (!auth) {
      this.logger.warn('Missing accessToken');
      client.disconnect();
      throw new WsException('forbidden must provide accessToken');
    }
    if (auth.startsWith('Bearer ')) {
      auth = auth.split(' ')[1];
    }
    const decoded = this.tokenService.VerifyAccessToken(auth);
    const user = await this.userRepo.findById(decoded.id);
    client.data.user = user;
    if (user.role === Sys_Role.Admin) {
      client.join('admins');
      await redis.sadd(redisKeys.admins(), user.id);
    }
    await redis.sadd(redisKeys.socketKey(user.id), client.id);
    this.logger.info(`Client connected: ${client.id}`);
  }
  async handleDisconnect(client: Socket) {
    const user = client.data.user;
    await redis.srem(redisKeys.socketKey(user.id), client.id);
    this.logger.info(`Client disconnected: ${client.id}`);
  }
  async sendNotification(
    userId: number,
    bookingNumber: string,
    totalPrice: number,
  ) {
    userId;
    const Ids = await redis.smembers(redisKeys.socketKey(userId));
    for (const socketId of Ids) {
      const client = this.server.to(socketId);
      if (!client) {
        await redis.srem(redisKeys.socketKey(userId), socketId);
        continue;
      }
      const notification = await this.notificationService.createNotification(
        userId,
        NotificationTitle.confirmedBooking,
        bookingNumber,
        totalPrice,
      );
      this.server.to(socketId).emit('notification', {
        title: notification.title,
        content: notification.content,
      });
    }
  }

  async sendNotificationAdmin(
    bookingNumber: string,
    totalPrice: number,
    title: NotificationTitle,
    userEmail: string,
  ) {
    const admins = await redis.smembers(redisKeys.admins());
    const ids = admins.map((id) => Number(id));
    await this.notificationService.createNotificationAdmins(
      ids,
      title,
      bookingNumber,
      totalPrice,
      userEmail,
    );
    this.server.to('admins').emit('notification', {
      title: title,
      content: notificationContent[title](bookingNumber, totalPrice, userEmail),
    });
  }
  async onModuleInit() {
    const subscriber = redisSub.duplicate()
    await subscriber.subscribe('bookingConfirmed');
    subscriber.on('message', async (channel, message) => {
      if (channel !== 'bookingConfirmed') return;
      const data = JSON.parse(message);
      await this.sendNotification(
        data.userId,
        data.bookingNumber,
        data.totalPrice,
      );
      await this.sendNotificationAdmin(
        data.bookingNumber,
        data.totalPrice,
        NotificationTitle.confirmedBookingAdmin,
        data.to,
      );
    });
  }
}
