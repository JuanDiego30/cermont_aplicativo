/**
 * Domain Exceptions for Kits Module
 */
import { BusinessRuleViolationError } from '../../../../common/domain/exceptions';

export class KitNoDisponibleException extends BusinessRuleViolationError {
    constructor(message: string = 'Kit no está disponible') {
        super(message);
        this.name = 'KitNoDisponibleException';
    }
}

export class StockInsuficienteException extends BusinessRuleViolationError {
    constructor(
        public readonly itemId: string,
        public readonly requerido: number,
        public readonly disponible: number,
    ) {
        super(`Stock insuficiente para item ${itemId}. Requerido: ${requerido}, Disponible: ${disponible}`);
        this.name = 'StockInsuficienteException';
    }
}

export class KitYaAsignadoException extends BusinessRuleViolationError {
    constructor(kitId: string) {
        super(`Kit ${kitId} ya está asignado`);
        this.name = 'KitYaAsignadoException';
    }
}

export class ItemNoEncontradoException extends BusinessRuleViolationError {
    constructor(itemId: string) {
        super(`Item ${itemId} no encontrado en el kit`);
        this.name = 'ItemNoEncontradoException';
    }
}

export class CodigoDuplicadoException extends BusinessRuleViolationError {
    constructor(codigo: string) {
        super(`Ya existe un kit con el código ${codigo}`);
        this.name = 'CodigoDuplicadoException';
    }
}

export class KitEnUsoException extends BusinessRuleViolationError {
    constructor(kitId: string) {
        super(`Kit ${kitId} está en uso y no puede modificarse`);
        this.name = 'KitEnUsoException';
    }
}
