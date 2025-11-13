"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const email_module_1 = require("./modules/email.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const port = Number(process.env.PORT ?? 3003);
    const app = await core_1.NestFactory.create(email_module_1.EmailModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Email Worker')
        .setDescription('Testing endpoints for the email worker (health + manual trigger)')
        .setVersion('1.0')
        .addTag('Health')
        .addTag('Test')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    await app.listen(port);
    console.log(`Email worker HTTP server running on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
}
bootstrap().catch((error) => {
    console.error('Failed to start email worker', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map