import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChecklistsController } from './infrastructure/controllers';
import { ChecklistsService } from './checklists.service';

@Module({
  controllers: [ChecklistsController],
  providers: [ChecklistsService, PrismaService],
  exports: [ChecklistsService],
})
export class ChecklistsModule { }
