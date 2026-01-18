/**
 * @module OrdersModule
 * @description Simple Orders module - MVP Architecture
 *
 * Controller -> Service -> Prisma
 * No DDD, no events, no mappers, no CQRS
 */

import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
