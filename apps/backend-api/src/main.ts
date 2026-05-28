// Location: backend-api/src/main.ts
import { NestFactory } from '@nestjs/core'; // 🛡️ CRITICAL: This line fixes the error
import { AppModule } from './app.module';
import { TenantInterceptor } from './database/tenant.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enforce data isolation globally across all request endpoints
  app.useGlobalInterceptors(new TenantInterceptor());
  
  // Run backend explicitly on port 3001 to avoid Next.js port 3000 collisions
  await app.listen(3001);
  console.log('🚀 NestJS Backend API running safely on http://localhost:3001');
}
bootstrap();