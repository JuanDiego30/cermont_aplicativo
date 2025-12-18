/**
 * @repository ITecnicoRepository
 * @description Repository interface for Tecnico persistence
 * @layer Domain
 */
import { TecnicoEntity, TecnicoProps } from '../entities/tecnico.entity';

export interface TecnicoFilters {
    disponibilidad?: string;
    especialidad?: string;
    active?: boolean;
    search?: string;
}

export interface ITecnicoRepository {
    /**
     * Find a technician by ID
     */
    findById(id: string): Promise<TecnicoEntity | null>;

    /**
     * Find a technician by user ID
     */
    findByUserId(userId: string): Promise<TecnicoEntity | null>;

    /**
     * Find all technicians with optional filters
     */
    findAll(filters?: TecnicoFilters): Promise<TecnicoEntity[]>;

    /**
     * Find available technicians for assignment
     */
    findAvailable(): Promise<TecnicoEntity[]>;

    /**
     * Save or update a technician
     */
    save(tecnico: TecnicoEntity): Promise<TecnicoEntity>;

    /**
     * Delete a technician
     */
    delete(id: string): Promise<void>;

    /**
     * Count technicians matching filters
     */
    count(filters?: TecnicoFilters): Promise<number>;
}

export const TECNICO_REPOSITORY = Symbol('ITecnicoRepository');
