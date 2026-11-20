import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Increase body size limit to 50MB for direct base64 image storage in database
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const configuredOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  const hasBundledFrontend = fs.existsSync(path.join(clientDistPath, 'index.html'));

  if (process.env.NODE_ENV === 'production' && !configuredOrigins?.length && !hasBundledFrontend) {
    throw new Error('CORS_ORIGINS must contain the deployed frontend origin in production.');
  }

  app.enableCors({
    origin: configuredOrigins?.length ? configuredOrigins : (process.env.NODE_ENV === 'production' ? false : '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Serve bundled React frontend in unified single-container deployments (e.g. Cloud Run)
  if (hasBundledFrontend) {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.use(express.static(clientDistPath));
    expressApp.get(/^\/(?!api).*/, (_req: express.Request, res: express.Response) => {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3001;
  await app.listen(PORT, '0.0.0.0');
  console.log(`🍫 Melvi Chocolatier NestJS API running on: http://127.0.0.1:${PORT}/api`);
}

bootstrap();
