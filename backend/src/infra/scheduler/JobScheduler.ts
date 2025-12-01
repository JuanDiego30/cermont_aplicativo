import * as cron from 'node-cron';
import { ArchiveOrdersJob } from './ArchiveOrdersJob.js';
import { TokenCleanupJob } from './TokenCleanupJob.js';
import { CleanupAuditLogsJob } from './CleanupAuditLogsJob.js';
import { NotifyOverdueReportsJob } from './NotifyOverdueReportsJob.js';
import { getCertificationExpiryAlertJob } from '../../jobs/CertificationExpiryAlertJob.js';
import { logger } from '../../shared/utils/logger.js';

interface JobDefinition {
  name: string;
  job: any; // Idealmente una interfaz común IJob
  cronExpression: string;
}

/**
 * Programador de jobs
 * Gestiona la ejecución periódica de tareas del sistema
 */
export class JobScheduler {
  private static readonly jobs: JobDefinition[] = [
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
    {
      name: 'NotifyOverdueReportsJob',
      job: NotifyOverdueReportsJob,
      cronExpression: NotifyOverdueReportsJob.getCronExpression(),
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
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            logger.error(`Job ${name} failed during execution`, { error: message });
          }
        });
        
        logger.info(`✅ ${name} scheduled with cron: ${cronExpression}`);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error(`❌ Failed to schedule ${name}`, { error: message });
      }
    }

    // Iniciar job de certificaciones (nuevo sistema)
    try {
      const certificationJob = getCertificationExpiryAlertJob();
      certificationJob.start();
      logger.info('✅ CertificationExpiryAlertJob scheduled (6:00 AM daily)');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('❌ Failed to schedule CertificationExpiryAlertJob', { error: message });
    }
  }

  static getStatus() {
    return this.jobs.map((j) => ({
      name: j.name,
      status: j.job.getStatus(),
      schedule: j.cronExpression,
    }));
  }

  static async runJob(jobName: string): Promise<any> {
    // Si es el job de certificaciones, manejarlo de forma especial
    if (jobName === 'CertificationExpiryAlertJob') {
      logger.info('🏃 Running job manually: CertificationExpiryAlertJob');
      try {
        const certificationJob = getCertificationExpiryAlertJob();
        await certificationJob.execute();
        logger.info('✅ Job CertificationExpiryAlertJob completed');
        return { success: true, message: 'Job executed successfully' };
      } catch (error) {
        logger.error('❌ Manual execution of CertificationExpiryAlertJob failed', { error });
        throw error;
      }
    }

    const jobDef = this.jobs.find((j) => j.name === jobName);

    if (!jobDef) {
      throw new Error(`Job not found: ${jobName}`);
    }

    logger.info(`🏃 Running job manually: ${jobName}`);

    try {
      const result = await jobDef.job.run();
      logger.info(`✅ Job ${jobName} completed`, result);
      return result;
    } catch (error) {
      logger.error(`❌ Manual execution of ${jobName} failed`, { error });
      throw error;
    }
  }
}


