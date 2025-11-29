
import 'dotenv/config';
import 'module-alias/register';
import { CreateKitUseCase } from '../src/app/kits/use-cases/CreateKit.js';
import { kitRepository } from '../src/infra/db/repositories/KitRepository.js';
import { auditLogRepository } from '../src/infra/db/repositories/AuditLogRepository.js';
import { KitCategory } from '../src/domain/entities/Kit.js';
import prisma from '../src/infra/db/prisma.js';
import { AuditService } from '../src/domain/services/AuditService.js';

const auditService = new AuditService(auditLogRepository);

async function main() {
    try {
        console.log('🔍 Finding root user...');
        const user = await prisma.user.findUnique({ where: { email: 'root@cermont.com' } });

        if (!user) {
            console.error('❌ Root user not found');
            return;
        }
        console.log('✅ Root user found:', user.id);

        console.log('🔍 Attempting to create kit via Use Case...');
        const createKit = new CreateKitUseCase(kitRepository, auditService);

        const kit = await createKit.execute({
            name: 'Debug Kit ' + Date.now(),
            description: 'Created via debug script',
            category: KitCategory.MANTENIMIENTO,
            tools: ['Debug Tool'],
            equipment: ['Debug Equipment'],
            documents: [],
            active: true,
            userId: user.id,
            ip: '127.0.0.1',
            userAgent: 'Debug Script'
        });

        console.log('✅ Kit created successfully:', kit);
    } catch (error) {
        console.error('❌ Error creating kit:', error);
        if (error instanceof Error) {
            console.error('Stack:', error.stack);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
