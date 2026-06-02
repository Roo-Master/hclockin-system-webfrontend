import { Injectable } from '@nestjs/common';
import { db } from '@chronos/database';

@Injectable()
export class DatabaseService {
  readonly client = db;
}
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }
}
