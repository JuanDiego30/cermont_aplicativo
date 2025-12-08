// ============================================
// KITS TÍPICOS SERVICE - Cermont FSM
// ============================================

import { kitsRepository } from './kits.repository.js';
import { AppError } from '../../shared/errors/AppError.js';
import type { CreateKitInput, UpdateKitInput, KitFilters } from './kits.types.js';

export class KitsService {
    
    /**
     * Obtener todos los kits con filtros
     */
    async findAll(filters: KitFilters) {
        return kitsRepository.findAll(filters);
    }

    /**
     * Obtener kit por ID
     */
    async findById(id: string) {
        const kit = await kitsRepository.findById(id);
        
        if (!kit) {
            throw new AppError('Kit no encontrado', 404);
        }
        
        return kit;
    }

    /**
     * Obtener solo kits activos (para dropdowns)
     */
    async findAllActive() {
        return kitsRepository.findAllActive();
    }

    /**
     * Crear nuevo kit
     */
    async create(data: CreateKitInput) {
        // Verificar nombre único
        const existing = await kitsRepository.findByNombre(data.nombre);
        if (existing) {
            throw new AppError('Ya existe un kit con ese nombre', 400);
        }

        return kitsRepository.create(data);
    }

    /**
     * Actualizar kit
     */
    async update(id: string, data: UpdateKitInput) {
        // Verificar que existe
        const kit = await kitsRepository.findById(id);
        if (!kit) {
            throw new AppError('Kit no encontrado', 404);
        }

        // Si se está cambiando el nombre, verificar que sea único
        if (data.nombre && data.nombre !== kit.nombre) {
            const existing = await kitsRepository.findByNombre(data.nombre);
            if (existing) {
                throw new AppError('Ya existe un kit con ese nombre', 400);
            }
        }

        return kitsRepository.update(id, data);
    }

    /**
     * Activar kit
     */
    async activate(id: string) {
        const kit = await kitsRepository.findById(id);
        if (!kit) {
            throw new AppError('Kit no encontrado', 404);
        }

        return kitsRepository.update(id, { activo: true });
    }

    /**
     * Desactivar kit (soft delete)
     */
    async deactivate(id: string) {
        const kit = await kitsRepository.findById(id);
        if (!kit) {
            throw new AppError('Kit no encontrado', 404);
        }

        return kitsRepository.deactivate(id);
    }

    /**
     * Eliminar kit permanentemente
     */
    async delete(id: string) {
        const kit = await kitsRepository.findById(id);
        if (!kit) {
            throw new AppError('Kit no encontrado', 404);
        }

        // Verificar que no tenga planeaciones
        const hasPlaneaciones = await kitsRepository.hasPlaneaciones(id);
        if (hasPlaneaciones) {
            throw new AppError(
                'No se puede eliminar el kit porque tiene planeaciones asociadas. Desactívelo en su lugar.',
                400
            );
        }

        return kitsRepository.delete(id);
    }

    /**
     * Duplicar kit con nuevo nombre
     */
    async duplicate(id: string, nuevoNombre: string) {
        const kit = await kitsRepository.findById(id);
        if (!kit) {
            throw new AppError('Kit no encontrado', 404);
        }

        // Verificar nombre único
        const existing = await kitsRepository.findByNombre(nuevoNombre);
        if (existing) {
            throw new AppError('Ya existe un kit con ese nombre', 400);
        }

        return kitsRepository.create({
            nombre: nuevoNombre,
            descripcion: kit.descripcion,
            herramientas: kit.herramientas as any,
            equipos: kit.equipos as any,
            documentos: kit.documentos,
            checklistItems: kit.checklistItems,
            duracionEstimadaHoras: kit.duracionEstimadaHoras,
            costoEstimado: kit.costoEstimado,
        });
    }
}

export const kitsService = new KitsService();
