import { OrderEstado } from '../order-estado.vo';

describe('OrderEstado Value Object', () => {
  describe('create', () => {
    it('debe crear OrderEstado planeacion', () => {
      const estado = OrderEstado.create('planeacion');
      expect(estado.value).toBe('planeacion');
    });

    it('debe crear con factory methods', () => {
      expect(OrderEstado.planeacion().value).toBe('planeacion');
      expect(OrderEstado.ejecucion().value).toBe('ejecucion');
      expect(OrderEstado.pausada().value).toBe('pausada');
      expect(OrderEstado.completada().value).toBe('completada');
      expect(OrderEstado.cancelada().value).toBe('cancelada');
    });

    it('debe ser inmutable', () => {
      const estado = OrderEstado.planeacion();
      expect(Object.isFrozen(estado)).toBe(true);
    });
  });

  describe('isActive', () => {
    it('planeacion, ejecucion, pausada son activos', () => {
      expect(OrderEstado.planeacion().isActive).toBe(true);
      expect(OrderEstado.ejecucion().isActive).toBe(true);
      expect(OrderEstado.pausada().isActive).toBe(true);
    });

    it('completada, cancelada NO son activos', () => {
      expect(OrderEstado.completada().isActive).toBe(false);
      expect(OrderEstado.cancelada().isActive).toBe(false);
    });
  });

  describe('isFinal', () => {
    it('completada y cancelada son finales', () => {
      expect(OrderEstado.completada().isFinal).toBe(true);
      expect(OrderEstado.cancelada().isFinal).toBe(true);
    });

    it('planeacion, ejecucion NO son finales', () => {
      expect(OrderEstado.planeacion().isFinal).toBe(false);
      expect(OrderEstado.ejecucion().isFinal).toBe(false);
    });
  });

  describe('canTransitionTo', () => {
    it('planeacion -> ejecucion: válido', () => {
      const estado = OrderEstado.planeacion();
      expect(estado.canTransitionTo('ejecucion')).toBe(true);
    });

    it('planeacion -> cancelada: válido', () => {
      const estado = OrderEstado.planeacion();
      expect(estado.canTransitionTo('cancelada')).toBe(true);
    });

    it('planeacion -> completada: INV��LIDO', () => {
      const estado = OrderEstado.planeacion();
      expect(estado.canTransitionTo('completada')).toBe(false);
    });

    it('ejecucion -> completada: válido', () => {
      const estado = OrderEstado.ejecucion();
      expect(estado.canTransitionTo('completada')).toBe(true);
    });

    it('ejecucion -> pausada: válido', () => {
      const estado = OrderEstado.ejecucion();
      expect(estado.canTransitionTo('pausada')).toBe(true);
    });

    it('pausada -> ejecucion: válido', () => {
      const estado = OrderEstado.pausada();
      expect(estado.canTransitionTo('ejecucion')).toBe(true);
    });

    it('completada -> cualquier: INV��LIDO', () => {
      const estado = OrderEstado.completada();
      expect(estado.canTransitionTo('planeacion')).toBe(false);
      expect(estado.canTransitionTo('ejecucion')).toBe(false);
      expect(estado.canTransitionTo('cancelada')).toBe(false);
    });
  });

  describe('transitionTo', () => {
    it('debe retornar nuevo estado si transición válida', () => {
      const estado = OrderEstado.planeacion();
      const nuevo = estado.transitionTo('ejecucion');
      expect(nuevo.value).toBe('ejecucion');
    });

    it('debe lanzar error si transición inválida', () => {
      const estado = OrderEstado.planeacion();
      expect(() => estado.transitionTo('completada')).toThrow(
        'Transición inválida de planeacion a completada'
      );
    });
  });

  describe('getAllowedTransitions', () => {
    it('planeacion puede ir a ejecucion o cancelada', () => {
      const transitions = OrderEstado.planeacion().getAllowedTransitions();
      expect(transitions).toContain('ejecucion');
      expect(transitions).toContain('cancelada');
      expect(transitions).toHaveLength(2);
    });

    it('completada no tiene transiciones', () => {
      const transitions = OrderEstado.completada().getAllowedTransitions();
      expect(transitions).toHaveLength(0);
    });
  });

  describe('equals', () => {
    it('debe comparar estados iguales', () => {
      const e1 = OrderEstado.ejecucion();
      const e2 = OrderEstado.ejecucion();
      expect(e1.equals(e2)).toBe(true);
    });

    it('debe comparar estados diferentes', () => {
      const e1 = OrderEstado.ejecucion();
      const e2 = OrderEstado.pausada();
      expect(e1.equals(e2)).toBe(false);
    });
  });
});
