import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: { role?: string; active?: boolean }) {
        const where: any = {};
        if (filters.role) where.role = filters.role;
        if (filters.active !== undefined) where.active = filters.active;
        const usuarios = await this.prisma.user.findMany({ where, select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, active: true, lastLogin: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
        return { data: usuarios, total: usuarios.length };
    }

    async findOne(id: string) {
        const usuario = await this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true, name: true, role: true, phone: true, avatar: true, active: true, lastLogin: true, createdAt: true, updatedAt: true } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        return usuario;
    }

    async create(dto: any) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('El email ya esta registrado');
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const usuario = await this.prisma.user.create({ data: { ...dto, password: hashedPassword }, select: { id: true, email: true, name: true, role: true, phone: true, active: true, createdAt: true } });
        return { message: 'Usuario creado exitosamente', data: usuario };
    }

    async update(id: string, dto: any) {
        await this.findOne(id);
        const updateData: any = { ...dto };
        if (dto.password) updateData.password = await bcrypt.hash(dto.password, 12);
        const usuario = await this.prisma.user.update({ where: { id }, data: updateData, select: { id: true, email: true, name: true, role: true, phone: true, active: true, updatedAt: true } });
        return { message: 'Usuario actualizado exitosamente', data: usuario };
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.prisma.user.update({ where: { id }, data: { active: false } });
        return { message: 'Usuario desactivado exitosamente' };
    }
}
