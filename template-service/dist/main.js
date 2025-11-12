"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Template Service API')
        .setDescription('CRUD endpoints for notification templates and their version history.')
        .setVersion('1.0')
        .addTag('Templates', 'Manage templates and their revision history')
        .addTag('Health', 'Service health endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Template Service running on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map