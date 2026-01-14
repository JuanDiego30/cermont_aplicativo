/**
 * @useCase GetPendingSyncUseCase
 */
import { Injectable, Inject } from "@nestjs/common";
import { SYNC_REPOSITORY, ISyncRepository, PendingSync } from "../dto";

@Injectable()
export class GetPendingSyncUseCase {
  constructor(
    @Inject(SYNC_REPOSITORY)
    private readonly repo: ISyncRepository,
  ) {}

  async execute(userId: string): Promise<{ pending: PendingSync[] }> {
    const pending = await this.repo.getPendingByUser(userId);
    return { pending };
  }
}
