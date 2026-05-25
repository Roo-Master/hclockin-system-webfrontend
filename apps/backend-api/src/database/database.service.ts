import { Injectable } from '@nestjs/common';
import { db } from '@chronos/database';

@Injectable()
export class DatabaseService {
  readonly client = db;
}
