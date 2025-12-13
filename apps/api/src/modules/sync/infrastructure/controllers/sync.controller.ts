/**
 * @controller SyncController
 */
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ProcessSyncBatchUseCase, GetPendingSyncUseCase } from '../../application/use-cases';
import { SyncBatchSchema } from '../../application/dto';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(
    private readonly processBatch: ProcessSyncBatchUseCase,
    private readonly getPending: GetPendingSyncUseCase,
  ) {}

  @Post()
  async sync(@Body() body: unknown, @Req() req: any) {
    const result = SyncBatchSchema.safeParse(body);
    if (!result.success) throw new BadRequestException(result.error.flatten());
    return this.processBatch.execute(req.user.id, result.data);
  }

  @Get('pending')
  async pending(@Req() req: any) {
    return this.getPending.execute(req.user.id);
  }
}
