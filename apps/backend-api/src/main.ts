import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = Number(process.env.PORT ?? 3001);

  const app = await NestFactory.create(AppModule);

  // 1. Cross-Origin Resource Sharing
  app.enableCors();

  // 2. Strict Payload Ingestion & Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen(port);

  logger.log(`🚀 NestJS Backend API running safely on http://localhost:${port}`);
  logger.log('Routes use controller-level /api prefixes; no global prefix is configured.');
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error('Backend API failed to start', error instanceof Error ? error.stack : String(error));
  process.exit(1);
});