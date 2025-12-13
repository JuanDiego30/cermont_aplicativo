import { Module } from '@nestjs/common';
import { ChecklistsController } from './checklists.controller';
import { ChecklistsService } from './checklists.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ChecklistsController],
  providers: [ChecklistsService, PrismaService],
  exports: [ChecklistsService],
})
export class ChecklistsModule { }
