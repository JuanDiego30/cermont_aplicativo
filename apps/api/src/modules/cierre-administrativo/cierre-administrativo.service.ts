import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CierreAdministrativoService {
    constructor(private readonly prisma: PrismaService) { }

    async findByOrden(ordenId: string) {
        const [cierre, acta, ses, factura] = await Promise.all([
            this.prisma.cierreAdministrativo.findUnique({ where: { ordenId } }),
            this.prisma.acta.findUnique({ where: { ordenId } }),
            this.prisma.sES.findUnique({ where: { ordenId } }),
            this.prisma.factura.findUnique({ where: { ordenId } })
        ]);
        return { cierre, acta, ses, factura };
    }

    async createActa(ordenId: string, dto: any) {
        const a = await this.prisma.acta.upsert({
            where: { ordenId },
            update: dto,
            create: { orden: { connect: { id: ordenId } }, ...dto }
        });
        return { message: 'Acta guardada', data: a };
    }

    async createSes(ordenId: string, dto: any) {
        const s = await this.prisma.sES.upsert({
            where: { ordenId },
            update: dto,
            create: { orden: { connect: { id: ordenId } }, ...dto }
        });
        return { message: 'SES guardada', data: s };
    }

    async createFactura(ordenId: string, dto: any) {
        const f = await this.prisma.factura.upsert({
            where: { ordenId },
            update: dto,
            create: { orden: { connect: { id: ordenId } }, ...dto }
        });
        return { message: 'Factura guardada', data: f };
    }

    async completar(ordenId: string, userId: string) {
        const c = await this.prisma.cierreAdministrativo.upsert({
            where: { ordenId },
            update: { completado: true, fechaCompletado: new Date() } as any,
            create: { orden: { connect: { id: ordenId } }, completado: true, fechaCompletado: new Date() } as any
        });
        return { message: 'Cierre completado', data: c };
    }
}
