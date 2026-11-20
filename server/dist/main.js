"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const express = require("express");
const path = require("path");
const fs = require("fs");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    app.setGlobalPrefix('api');
    if (hasBundledFrontend) {
        const expressApp = app.getHttpAdapter().getInstance();
        expressApp.use(express.static(clientDistPath));
        expressApp.get(/^\/(?!api).*/, (_req, res) => {
            res.sendFile(path.join(clientDistPath, 'index.html'));
        });
    }
    const PORT = process.env.PORT || 3001;
    await app.listen(PORT, '0.0.0.0');
    console.log(`🍫 Melvi Chocolatier NestJS API running on: http://127.0.0.1:${PORT}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map