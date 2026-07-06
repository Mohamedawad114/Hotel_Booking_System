import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Hotel Booking System API')
  .setDescription('API documentation for the Hotel Booking System')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'access-token',
      in: 'header',
    },
    'access-token',
  )
  .build();
