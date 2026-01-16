import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { renderEmailTemplate } from './email-templates';
import { EmailService } from './email.service';
import type { SendEmailInput } from './email.types';

// BullMQ types (local interfaces to avoid hard dependency)
interface BullQueue {
  add: (name: string, data: EmailJobPayload, opts?: unknown) => Promise<unknown>;
  close: () => Promise<void>;
}

interface BullWorker {
  close: () => Promise<void>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface BullQueueEvents {
  close: () => Promise<void>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
}

interface BullJob {
  id?: string;
  data: EmailJobPayload;
  attemptsMade?: number;
  opts?: {
    attempts?: number;
  };
}

type BullQueueConstructor = new (name: string, opts?: unknown) => BullQueue;
type BullWorkerConstructor = new (
  name: string,
  processor: (job: BullJob) => Promise<void>,
  opts?: unknown
) => BullWorker;
type BullQueueEventsConstructor = new (name: string, opts?: unknown) => BullQueueEvents;

let QueueCtor: BullQueueConstructor | null = null;
let WorkerCtor: BullWorkerConstructor | null = null;
let QueueEventsCtor: BullQueueEventsConstructor | null = null;

const loadBullmqConstructors = async (): Promise<void> => {
  if (QueueCtor && WorkerCtor && QueueEventsCtor) return;

  try {
    const bullmq = await import('bullmq');
    const bullmqRecord = bullmq as Record<string, unknown>;

    QueueCtor = bullmqRecord.Queue as BullQueueConstructor;
    WorkerCtor = bullmqRecord.Worker as BullWorkerConstructor;
    QueueEventsCtor = bullmqRecord.QueueEvents as BullQueueEventsConstructor;
  } catch (error) {
    Logger.warn('BullMQ no está instalado. EmailQueueService usará implementación mock.');
  }
};

type EmailJobPayload = {
  email: SendEmailInput;
};

@Injectable()
export class EmailQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailQueueService.name);

  private queue: BullQueue | null = null;
  private worker: BullWorker | null = null;
  private queueEvents: BullQueueEvents | null = null;
  private deadLetterQueue: BullQueue | null = null;
  private useBullMQ = false;

  constructor(
    private readonly config: ConfigService,
    private readonly emailService: EmailService
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.initializeQueue();
      this.logger.log('EmailQueueService inicializado');
    } catch (error) {
      this.logger.error('Error inicializando EmailQueueService', error);
      // No lanzar para permitir que la app inicie sin Redis
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async enqueueBatch(emails: SendEmailInput[]): Promise<void> {
    for (const email of emails) {
      await this.enqueue(email);
    }
  }

  async enqueue(email: SendEmailInput): Promise<void> {
    const attempts = email.maxAttempts ?? this.getDefaultAttempts();

    if (this.useBullMQ) {
      if (!this.queue) {
        this.useBullMQ = false;
        this.logger.warn('BullMQ marcado como activo pero queue no inicializada; usando mock.');
      } else {
        await this.queue.add('send-email', { email } satisfies EmailJobPayload, {
          attempts,
          backoff: {
            type: 'exponential',
            delay: this.getBackoffBaseDelayMs(),
          },
          removeOnComplete: true,
          removeOnFail: false,
        });

        this.logger.debug('Email encolado', {
          to: email.to,
          subject: email.subject,
        });
        return;
      }
    }

    // Mock: procesar inmediatamente
    try {
      await this.processJob({ data: { email } });
      this.logger.debug('[Queue Mock] Email procesado inmediatamente', {
        to: email.to,
        subject: email.subject,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn('[Queue Mock] Email falló', {
        to: email.to,
        subject: email.subject,
        error: errorMessage,
      });
      // DLQ mock: no persistente; solo log.
    }
  }

  private getDefaultAttempts(): number {
    const raw = this.config.get<string>('EMAIL_MAX_ATTEMPTS') || '3';
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 3;
  }

  private getBackoffBaseDelayMs(): number {
    const raw = this.config.get<string>('EMAIL_RETRY_DELAY_MS') || '500';
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 500;
  }

  private async initializeQueue(): Promise<void> {
    await loadBullmqConstructors();
    if (QueueCtor && WorkerCtor && QueueEventsCtor) {
      this.useBullMQ = true;
      this.initializeBullMQ();
    } else {
      this.useBullMQ = false;
      this.initializeMockQueue();
    }
  }

  private initializeBullMQ(): void {
    const redisConfig = {
      host: this.config.get('REDIS_HOST') || 'localhost',
      port: Number.parseInt(this.config.get('REDIS_PORT') || '6379', 10),
      password: this.config.get('REDIS_PASSWORD') || undefined,
      maxRetriesPerRequest: null,
    };

    if (!QueueCtor || !WorkerCtor || !QueueEventsCtor) {
      this.useBullMQ = false;
      this.initializeMockQueue();
      return;
    }

    this.queue = new QueueCtor('emails', { connection: redisConfig });
    this.deadLetterQueue = new QueueCtor('emails-dead-letter', {
      connection: redisConfig,
    });

    this.worker = new WorkerCtor('emails', this.processJob.bind(this), {
      connection: redisConfig,
      concurrency: 5,
      removeOnComplete: {
        age: 3600,
        count: 1000,
      },
      removeOnFail: {
        age: 86400,
      },
    });

    this.queueEvents = new QueueEventsCtor('emails', {
      connection: redisConfig,
    });

    this.setupEventListeners();
    this.logger.log('✅ BullMQ inicializado para emails');
  }

  private initializeMockQueue(): void {
    this.logger.warn('EmailQueueService usando implementación mock (sin Redis/BullMQ).');

    this.queue = {
      add: async (_name: string, payload: EmailJobPayload) => {
        const mockJob: BullJob = {
          data: payload,
          attemptsMade: 0,
          opts: { attempts: 3 },
          id: 'mock-' + Date.now(),
        };

        await this.processJob(mockJob);
      },
      close: async () => {},
    };
  }

  private setupEventListeners(): void {
    if (!this.queueEvents || !this.worker) return;

    this.queueEvents.on('completed', (...args: unknown[]) => {
      const payload = (args[0] ?? {}) as { jobId?: unknown };
      const jobId = typeof payload.jobId === 'string' ? payload.jobId : undefined;
      if (jobId) this.logger.debug(`✅ Email job ${jobId} completado`);
    });

    this.queueEvents.on('failed', (...args: unknown[]) => {
      const payload = (args[0] ?? {}) as {
        jobId?: unknown;
        failedReason?: unknown;
      };
      const jobId = typeof payload.jobId === 'string' ? payload.jobId : 'unknown';
      const failedReason =
        typeof payload.failedReason === 'string' ? payload.failedReason : 'unknown';
      this.logger.error(`❌ Email job ${jobId} falló: ${failedReason}`);
    });

    this.worker.on('failed', async (...args: unknown[]) => {
      const job = args[0] as BullJob | undefined;
      const err =
        args[1] instanceof Error ? args[1] : new Error(String(args[1] ?? 'unknown error'));

      if (!job) {
        this.logger.error('❌ Email job falló sin job asociado', {
          error: err.message,
        });
        return;
      }
      try {
        const attempts = job?.opts?.attempts ?? 1;
        const attemptsMade = job?.attemptsMade ?? 0;

        // DLQ: sólo cuando ya agotó intentos
        if (attemptsMade >= attempts) {
          await this.deadLetterQueue?.add('dead-email', job.data, {
            removeOnComplete: true,
            removeOnFail: false,
          });

          this.logger.error('📦 Email enviado a DLQ (emails-dead-letter)', {
            jobId: job?.id,
            error: err.message,
          });
        }
      } catch (dlqError) {
        this.logger.error('Error moviendo job a DLQ', dlqError);
      }
    });
  }

  private async processJob(job: BullJob): Promise<void> {
    const payload = job.data;

    const input = payload.email;

    // Permite encolar por plantilla sin acoplar a controllers/handlers.
    if (input.template && !input.html && !input.text) {
      const rendered = renderEmailTemplate(input.template, input.templateData ?? {});
      await this.emailService.sendEmail({
        ...input,
        html: rendered.html,
        text: rendered.text,
      });
      return;
    }

    await this.emailService.sendEmail(input);
  }

  private async close(): Promise<void> {
    try {
      if (this.worker) await this.worker.close();
      if (this.queueEvents) await this.queueEvents.close();
      if (this.queue) await this.queue.close();
      if (this.deadLetterQueue) await this.deadLetterQueue.close();
    } catch (error) {
      this.logger.error('Error cerrando EmailQueueService', error);
    }
  }
}
