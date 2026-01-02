import { Injectable } from '@nestjs/common';

/**
 * Cola en memoria para serializar generación de PDFs.
 * Evita picos de CPU/RAM por múltiples instancias de Puppeteer generando en paralelo.
 * Nota: en despliegues con múltiples pods, la cola es por instancia.
 */
@Injectable()
export class PdfGenerationQueueService {
    private tail: Promise<void> = Promise.resolve();

    enqueue<T>(task: () => Promise<T>): Promise<T> {
        const run = this.tail.then(task, task);

        // Mantener la cola viva incluso si una tarea falla
        this.tail = run.then(
            () => undefined,
            () => undefined,
        );

        return run;
    }
}
