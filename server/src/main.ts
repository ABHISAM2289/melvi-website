import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Increase body size limit to 50MB for direct base64 image storage in database
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS for frontend Vite client
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');
  console.log(`🍫 Melvi Chocolatier NestJS API running on: http://127.0.0.1:${PORT}/api`);
}

bootstrap();
