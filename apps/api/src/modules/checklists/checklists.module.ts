import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChecklistsController } from './infrastructure/controllers';
import { ChecklistsService } from './checklists.service';
import { CHECKLIST_REPOSITORY } from './application/dto';
import { ChecklistRepository } from './infrastructure/persistence';

@Module({
  imports: [PrismaModule],
  controllers: [ChecklistsController],
  providers: [
    {
      provide: CHECKLIST_REPOSITORY,
      useClass: ChecklistRepository,
    },
    ChecklistsService,
  ],
  exports: [ChecklistsService, CHECKLIST_REPOSITORY],
})
export class ChecklistsModule { }

