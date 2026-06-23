import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PinoLogger } from 'nestjs-pino';
import { HashingService } from '../Utils';
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly logger: PinoLogger,
    private readonly hashService: HashingService,
  ) {
    super();
    const hashingService = this.hashService;
    Object.assign(
      this,
      this.$extends({
        query: {
          user: {
            async create({ args, query }) {
              if (args.data.password) {
                args.data.password = await hashingService.generateHash(
                  args.data.password as string,
                );
              }
              return query(args);
            },
            async update({ args, query }) {
              if (args.data.password) {
                if (typeof args.data.password === 'string') {
                  args.data.password = await hashingService.generateHash(
                    args.data.password,
                  );
                } else if (args.data.password.set) {
                  args.data.password.set = await hashingService.generateHash(
                    args.data.password.set,
                  );
                }
              }
              return query(args);
            },
          },
        },
      }),
    );
  }
  onModuleInit() {
    this.logger.info('PrismaService has been initialized.');
    this.$connect();
    this.logger.info('PrismaService connected to database.');
  }
  onModuleDestroy() {
    this.$disconnect();
  }
}
