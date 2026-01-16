import { Orderstado } from '../order-estado.vo';

describe('Orderstado Value Object', () => {
  describe('create', () => {
    it('debe crear Orderstado planeacion', () => {
      const estado = Orderstado.create('planeacion');
      expect(estado.value).toBe('planeacion');
    });

    it('debe crear con factory methods', () => {
      expect(Orderstado.planeacion().value).toBe('planeacion');
      expect(Orderstado.ejecucion().value).toBe('ejecucion');
      expect(Orderstado.pausada().value).toBe('pausada');
      expect(Orderstado.completada().value).toBe('completada');
      expect(Orderstado.cancelada().value).toBe('cancelada');
    });

    it('debe ser inmutable', () => {
      const estado = Orderstado.planeacion();
      expect(Object.isFrozen(estado)).toBe(true);
    });
  });

  describe('isActive', () => {
    it('planeacion, ejecucion, pausada son activos', () => {
      expect(Orderstado.planeacion().isActive).toBe(true);
      expect(Orderstado.ejecucion().isActive).toBe(true);
      expect(Orderstado.pausada().isActive).toBe(true);
    });

    it('completada, cancelada NO son activos', () => {
      expect(Orderstado.completada().isActive).toBe(false);
      expect(Orderstado.cancelada().isActive).toBe(false);
    });
  });

  describe('isFinal', () => {
    it('completada y cancelada son finales', () => {
      expect(Orderstado.completada().isFinal).toBe(true);
      expect(Orderstado.cancelada().isFinal).toBe(true);
    });

    it('planeacion, ejecucion NO son finales', () => {
      expect(Orderstado.planeacion().isFinal).toBe(false);
      expect(Orderstado.ejecucion().isFinal).toBe(false);
    });
  });

  describe('canTransitionTo', () => {
    it('planeacion -> ejecucion: válido', () => {
      const estado = Orderstado.planeacion();
      expect(estado.canTransitionTo('ejecucion')).toBe(true);
    });

    it('planeacion -> cancelada: válido', () => {
      const estado = Orderstado.planeacion();
      expect(estado.canTransitionTo('cancelada')).toBe(true);
    });

    it('planeacion -> completada: INV��LIDO', () => {
      const estado = Orderstado.planeacion();
      expect(estado.canTransitionTo('completada')).toBe(false);
    });

    it('ejecucion -> completada: válido', () => {
      const estado = Orderstado.ejecucion();
      expect(estado.canTransitionTo('completada')).toBe(true);
    });

    it('ejecucion -> pausada: válido', () => {
      const estado = Orderstado.ejecucion();
      expect(estado.canTransitionTo('pausada')).toBe(true);
    });

    it('pausada -> ejecucion: válido', () => {
      const estado = Orderstado.pausada();
      expect(estado.canTransitionTo('ejecucion')).toBe(true);
    });

    it('completada -> cualquier: INV��LIDO', () => {
      const estado = Orderstado.completada();
      expect(estado.canTransitionTo('planeacion')).toBe(false);
      expect(estado.canTransitionTo('ejecucion')).toBe(false);
      expect(estado.canTransitionTo('cancelada')).toBe(false);
    });
  });

  describe('transitionTo', () => {
    it('debe retornar nuevo estado si transición válida', () => {
      const estado = Orderstado.planeacion();
      const nuevo = estado.transitionTo('ejecucion');
      expect(nuevo.value).toBe('ejecucion');
    });

    it('debe lanzar error si transición inválida', () => {
      const estado = Orderstado.planeacion();
      expect(() => estado.transitionTo('completada')).toThrow(
        'Transición inválida de planeacion a completada'
      );
    });
  });

  describe('getAllowedTransitions', () => {
    it('planeacion puede ir a ejecucion o cancelada', () => {
      const transitions = Orderstado.planeacion().getAllowedTransitions();
      expect(transitions).toContain('ejecucion');
      expect(transitions).toContain('cancelada');
      expect(transitions).toHaveLength(2);
    });

    it('completada no tiene transiciones', () => {
      const transitions = Orderstado.completada().getAllowedTransitions();
      expect(transitions).toHaveLength(0);
    });
  });

  describe('equals', () => {
    it('debe comparar estados iguales', () => {
      const e1 = Orderstado.ejecucion();
      const e2 = Orderstado.ejecucion();
      expect(e1.equals(e2)).toBe(true);
    });

    it('debe comparar estados diferentes', () => {
      const e1 = Orderstado.ejecucion();
      const e2 = Orderstado.pausada();
      expect(e1.equals(e2)).toBe(false);
    });
  });
});
