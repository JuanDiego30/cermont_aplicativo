import * as cron from 'node-cron';
import { ArchiveOrdersJob } from './ArchiveOrdersJob';
import { TokenCleanupJob } from './TokenCleanupJob';
import { CleanupAuditLogsJob } from './CleanupAuditLogsJob';
import { logger } from '../shared/utils/logger';

/**
 * Programador de jobs
 * Gestiona la ejecución periódica de tareas del sistema
 */
export class JobScheduler {
  private static jobs = [
    {
      name: 'ArchiveOrdersJob',
      job: ArchiveOrdersJob,
      cronExpression: ArchiveOrdersJob.getCronExpression(),
    },
    {
      name: 'TokenCleanupJob',
      job: TokenCleanupJob,
      cronExpression: TokenCleanupJob.getCronExpression(),
    },
    {
      name: 'CleanupAuditLogsJob',
      job: CleanupAuditLogsJob,
      cronExpression: CleanupAuditLogsJob.getCronExpression(),
    },
  ];

  /**
   * Inicia todos los jobs programados
   */
  static startAll(): void {
    logger.info('🚀 Starting all scheduled jobs...');

    for (const { name, job, cronExpression } of this.jobs) {
      try {
        cron.schedule(cronExpression, async () => {
          try {
            await job.run();
          } catch (error: any) {
            logger.error(`Job ${name} failed`, { error: error.message });
          }
        });
        logger.info(`✅ ${name} scheduled with cron: ${cronExpression}`);
      } catch (error: any) {
        logger.error(`❌ Failed to schedule ${name}`, {
          error: error.message,
        });
      }
    }
  }

  static getStatus() {
    const jobs = [
      {
        name: 'ArchiveOrdersJob',
        status: ArchiveOrdersJob.getStatus(),
        schedule: ArchiveOrdersJob.getCronExpression(),
      },
      {
        name: 'TokenCleanupJob',
        status: TokenCleanupJob.getStatus(),
        schedule: TokenCleanupJob.getCronExpression(),
      },
      {
        name: 'CleanupAuditLogsJob',
        status: CleanupAuditLogsJob.getStatus(),
        schedule: CleanupAuditLogsJob.getCronExpression(),
      },
    ];

    return jobs;
  }

  static async runJob(jobName: string) {
    const job = this.jobs.find((j) => j.name === jobName);

    if (!job) {
      throw new Error(`Job not found: ${jobName}`);
    }

    logger.info(`🏃 Running job manually: ${jobName}`);

    const result = await job.job.run();

    logger.info(`✅ Job ${jobName} completed`, result);

    return result;
  }
}