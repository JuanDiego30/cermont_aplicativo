/**
 * @repository PrismaTecnicoRepository
 * @description Prisma implementation of ITecnicoRepository
 * @layer Infrastructure
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ITecnicoRepository, TecnicoFilters } from '../../domain/repositories';
import { TecnicoEntity, TecnicoProps } from '../../domain/entities';

@Injectable()
export class PrismaTecnicoRepository implements ITecnicoRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<TecnicoEntity | null> {
        const user = await this.prisma.user.findUnique({
            where: { id, role: 'tecnico' },
        });

        if (!user) return null;

        return this.mapToEntity(user);
    }

    async findByUserId(userId: string): Promise<TecnicoEntity | null> {
        return this.findById(userId);
    }

    async findAll(filters?: TecnicoFilters): Promise<TecnicoEntity[]> {
        const where: any = { role: 'tecnico' };

        if (filters?.active !== undefined) {
            where.active = filters.active;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const users = await this.prisma.user.findMany({
            where,
            orderBy: { name: 'asc' },
        });

        return users.map(u => this.mapToEntity(u));
    }

    async findAvailable(): Promise<TecnicoEntity[]> {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'tecnico',
                active: true,
            },
            orderBy: { name: 'asc' },
        });

        return users
            .map(u => this.mapToEntity(u))
            .filter(t => t.isAvailableForAssignment);
    }

    async save(tecnico: TecnicoEntity): Promise<TecnicoEntity> {
        const data = {
            name: tecnico.nombre,
            phone: tecnico.telefono,
            active: tecnico.active,
            updatedAt: new Date(),
        };

        const user = await this.prisma.user.update({
            where: { id: tecnico.id },
            data,
        });

        return this.mapToEntity(user);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { active: false },
        });
    }

    async count(filters?: TecnicoFilters): Promise<number> {
        const where: any = { role: 'tecnico' };

        if (filters?.active !== undefined) {
            where.active = filters.active;
        }
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        return this.prisma.user.count({ where });
    }

    private mapToEntity(user: any): TecnicoEntity {
        const props: TecnicoProps = {
            id: user.id,
            userId: user.id,
            nombre: user.name || '',
            email: user.email,
            telefono: user.phone || undefined,
            disponibilidad: user.active ? 'disponible' : 'baja',
            especialidades: ['general'],
            ordenesActivas: 0,
            ordenesCompletadas: 0,
            calificacionPromedio: undefined,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };

        return TecnicoEntity.fromPersistence(props);
    }
}
