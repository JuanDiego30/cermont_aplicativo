import { OrdenEstado, EstadoOrden } from '../orden-estado.vo';

describe('OrdenEstado Value Object', () => {
    describe('create', () => {
        it('debe crear OrdenEstado planeacion', () => {
            const estado = OrdenEstado.create('planeacion');
            expect(estado.value).toBe('planeacion');
        });

        it('debe crear con factory methods', () => {
            expect(OrdenEstado.planeacion().value).toBe('planeacion');
            expect(OrdenEstado.ejecucion().value).toBe('ejecucion');
            expect(OrdenEstado.pausada().value).toBe('pausada');
            expect(OrdenEstado.completada().value).toBe('completada');
            expect(OrdenEstado.cancelada().value).toBe('cancelada');
        });

        it('debe ser inmutable', () => {
            const estado = OrdenEstado.planeacion();
            expect(Object.isFrozen(estado)).toBe(true);
        });
    });

    describe('isActive', () => {
        it('planeacion, ejecucion, pausada son activos', () => {
            expect(OrdenEstado.planeacion().isActive).toBe(true);
            expect(OrdenEstado.ejecucion().isActive).toBe(true);
            expect(OrdenEstado.pausada().isActive).toBe(true);
        });

        it('completada, cancelada NO son activos', () => {
            expect(OrdenEstado.completada().isActive).toBe(false);
            expect(OrdenEstado.cancelada().isActive).toBe(false);
        });
    });

    describe('isFinal', () => {
        it('completada y cancelada son finales', () => {
            expect(OrdenEstado.completada().isFinal).toBe(true);
            expect(OrdenEstado.cancelada().isFinal).toBe(true);
        });

        it('planeacion, ejecucion NO son finales', () => {
            expect(OrdenEstado.planeacion().isFinal).toBe(false);
            expect(OrdenEstado.ejecucion().isFinal).toBe(false);
        });
    });

    describe('canTransitionTo', () => {
        it('planeacion -> ejecucion: válido', () => {
            const estado = OrdenEstado.planeacion();
            expect(estado.canTransitionTo('ejecucion')).toBe(true);
        });

        it('planeacion -> cancelada: válido', () => {
            const estado = OrdenEstado.planeacion();
            expect(estado.canTransitionTo('cancelada')).toBe(true);
        });

        it('planeacion -> completada: INVÁLIDO', () => {
            const estado = OrdenEstado.planeacion();
            expect(estado.canTransitionTo('completada')).toBe(false);
        });

        it('ejecucion -> completada: válido', () => {
            const estado = OrdenEstado.ejecucion();
            expect(estado.canTransitionTo('completada')).toBe(true);
        });

        it('ejecucion -> pausada: válido', () => {
            const estado = OrdenEstado.ejecucion();
            expect(estado.canTransitionTo('pausada')).toBe(true);
        });

        it('pausada -> ejecucion: válido', () => {
            const estado = OrdenEstado.pausada();
            expect(estado.canTransitionTo('ejecucion')).toBe(true);
        });

        it('completada -> cualquier: INVÁLIDO', () => {
            const estado = OrdenEstado.completada();
            expect(estado.canTransitionTo('planeacion')).toBe(false);
            expect(estado.canTransitionTo('ejecucion')).toBe(false);
            expect(estado.canTransitionTo('cancelada')).toBe(false);
        });
    });

    describe('transitionTo', () => {
        it('debe retornar nuevo estado si transición válida', () => {
            const estado = OrdenEstado.planeacion();
            const nuevo = estado.transitionTo('ejecucion');
            expect(nuevo.value).toBe('ejecucion');
        });

        it('debe lanzar error si transición inválida', () => {
            const estado = OrdenEstado.planeacion();
            expect(() => estado.transitionTo('completada')).toThrow(
                'Transición inválida de planeacion a completada',
            );
        });
    });

    describe('getAllowedTransitions', () => {
        it('planeacion puede ir a ejecucion, pendiente, cancelada o pausada', () => {
            const transitions = OrdenEstado.planeacion().getAllowedTransitions();
            expect(transitions).toContain('ejecucion');
            expect(transitions).toContain('cancelada');
            expect(transitions).toContain('pendiente');
            expect(transitions).toContain('pausada');
            expect(transitions).toHaveLength(4);
        });

        it('completada puede volver a pendiente', () => {
            const transitions = OrdenEstado.completada().getAllowedTransitions();
            expect(transitions).toContain('pendiente');
            expect(transitions).toHaveLength(1);
        });
    });

    describe('equals', () => {
        it('debe comparar estados iguales', () => {
            const e1 = OrdenEstado.ejecucion();
            const e2 = OrdenEstado.ejecucion();
            expect(e1.equals(e2)).toBe(true);
        });

        it('debe comparar estados diferentes', () => {
            const e1 = OrdenEstado.ejecucion();
            const e2 = OrdenEstado.pausada();
            expect(e1.equals(e2)).toBe(false);
        });
    });
});
