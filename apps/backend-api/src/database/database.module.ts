// Location: apps/backend/src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
<<<<<<< HEAD
  providers: [DatabaseService],
  exports: [DatabaseService],
=======
  providers: [PrismaService],
  exports: [PrismaService],
>>>>>>> origin/main
})
export class DatabaseModule {}
