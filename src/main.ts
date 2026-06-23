import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { PinoLogger } from 'nestjs-pino';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new PinoLogger({
    pinoHttp: {},
    renameContext: 'nestContext',
  });
  app.use(helmet(), hpp(), cookieParser());
  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('api');
  logger.info(`server is running... on 3000`);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
