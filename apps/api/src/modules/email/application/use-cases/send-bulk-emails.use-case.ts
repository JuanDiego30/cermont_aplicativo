
import { Injectable, Inject } from '@nestjs/common';
import { SendEmailDto } from '../dto/send-email.dto';
import { SendEmailUseCase } from './send-email.use-case';

@Injectable()
export class SendBulkEmailsUseCase {
    constructor(
        private readonly sendEmailUseCase: SendEmailUseCase,
    ) { }

    async execute(dtos: SendEmailDto[]): Promise<void> {
        // Ejecutar secuencialmente o en paralelo controlado
        // Promise.allSettled para que uno fallido no detenga a los demás
        const results = await Promise.allSettled(
            dtos.map(dto => this.sendEmailUseCase.execute(dto))
        );

        // Logging de errores si es necesario
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                const email = dtos[index].to;
                console.error(`Error enviando a ${email}: `, result.reason);
            }
        });
    }
}
