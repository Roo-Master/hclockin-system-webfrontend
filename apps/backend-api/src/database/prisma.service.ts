// Location: apps/backend-api/src/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { db } from '@chronos/database';
import { getTenantId } from './tenant-context';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly baseClient = db;

  /**
   * Automated Multi-Tenant Isolation Engine.
   * Maps context structures safely through an abstracted argument proxy to avoid Union type collisions.
   */
  public readonly client = this.baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const tenantId = getTenantId();

          if (tenantId) {
            // Cast to an open object to manipulate fields without Union type conflicts
            const queryArgs = (args || {}) as any;

            // 🛡️ Vector A: Direct Collection Reads & Single-Record Selectors
            const filterOps = [
              'findMany', 'findFirst', 'updateMany', 'deleteMany', 
              'count', 'aggregate', 'groupBy', 'update', 'delete'
            ];
            
            if (filterOps.includes(operation)) {
              queryArgs.where = queryArgs.where || {};
              queryArgs.where['hospitalId'] = tenantId;
            }

            // 🛡️ Vector B: Normalizing Single Lookups into isolated First-Matches
            if (['findUnique', 'findUniqueOrThrow'].includes(operation)) {
              operation = 'findFirst';
              queryArgs.where = queryArgs.where || {};
              queryArgs.where['hospitalId'] = tenantId;
            }

            // 🛡️ Vector C: Single Record Inserts
            if (operation === 'create') {
              queryArgs.data = queryArgs.data || {};
              queryArgs.data['hospitalId'] = tenantId;
            }

            // 🛡️ Vector D: Bulk Payload Inserts
            if (operation === 'createMany') {
              queryArgs.data = queryArgs.data || {};
              if (Array.isArray(queryArgs.data)) {
                queryArgs.data.forEach((item: any) => {
                  if (item && typeof item === 'object') item['hospitalId'] = tenantId;
                });
              } else if (queryArgs.data && typeof queryArgs.data === 'object') {
                queryArgs.data['hospitalId'] = tenantId;
              }
            }

            // 🛡️ Vector E: Dual-Path Mutations (Upserts)
            if (operation === 'upsert') {
              queryArgs.create = queryArgs.create || {};
              queryArgs.create['hospitalId'] = tenantId;

              queryArgs.update = queryArgs.update || {};
              queryArgs.update['hospitalId'] = tenantId;
              
              queryArgs.where = queryArgs.where || {};
              queryArgs.where['hospitalId'] = tenantId;
            }

            // Forward the mutated arguments back to the execution proxy safely
            return (db as any)[model][operation](queryArgs);
          }

          // Fall back to standard pipeline execution if no context tenant is loaded
          return query(args);
        },
      },
    },
  });

  async onModuleInit() {
    await this.baseClient.$connect();
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }
}