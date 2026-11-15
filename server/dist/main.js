"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    const configuredOrigins = process.env.CORS_ORIGINS
        ?.split(',')
        .map(origin => origin.trim())
        .filter(Boolean);
    if (process.env.NODE_ENV === 'production' && !configuredOrigins?.length) {
        throw new Error('CORS_ORIGINS must contain the deployed frontend origin in production.');
    }
    app.enableCors({
        origin: configuredOrigins?.length ? configuredOrigins : '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: false,
    });
    app.setGlobalPrefix('api');
    const PORT = process.env.PORT || 3001;
    await app.listen(PORT, '0.0.0.0');
    console.log(`🍫 Melvi Chocolatier NestJS API running on: http://127.0.0.1:${PORT}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map