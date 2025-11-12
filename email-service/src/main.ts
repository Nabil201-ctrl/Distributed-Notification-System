import { NestFactory } from '@nestjs/core';
import { EmailModule } from './modules/email.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const port = Number(process.env.PORT ?? 3003);

  const app = await NestFactory.create(EmailModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Email Worker')
    .setDescription('Testing endpoints for the email worker (health + manual trigger)')
    .setVersion('1.0')
    .addTag('Health')
    .addTag('Test')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
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
