/**
 * Tests unitarios para OrderStateMachine
 */

import { OrderStateMachine, OrderStateTransitionError } from '../../../domain/services/OrderStateMachine';
import { OrderState } from '../../../domain/entities/Order';

describe('OrderStateMachine', () => {
  let stateMachine: OrderStateMachine;

  beforeEach(() => {
    stateMachine = new OrderStateMachine();
  });

  describe('canTransition', () => {
    it('debería permitir transición SOLICITUD -> VISITA', () => {
      expect(stateMachine.canTransition(OrderState.SOLICITUD, OrderState.VISITA)).toBe(true);
    });

    it('debería permitir transición VISITA -> PO', () => {
      expect(stateMachine.canTransition(OrderState.VISITA, OrderState.PO)).toBe(true);
    });

    it('debería permitir transición hacia atrás VISITA -> SOLICITUD', () => {
      expect(stateMachine.canTransition(OrderState.VISITA, OrderState.SOLICITUD)).toBe(true);
    });

    it('debería rechazar transición inválida SOLICITUD -> PO', () => {
      expect(stateMachine.canTransition(OrderState.SOLICITUD, OrderState.PO)).toBe(false);
    });

    it('debería rechazar transición saltando estados', () => {
      expect(stateMachine.canTransition(OrderState.SOLICITUD, OrderState.EJECUCION)).toBe(false);
    });

    it('no debería permitir transiciones desde PAGO (estado final)', () => {
      expect(stateMachine.canTransition(OrderState.PAGO, OrderState.SOLICITUD)).toBe(false);
      expect(stateMachine.canTransition(OrderState.PAGO, OrderState.FACTURA)).toBe(false);
    });
  });

  describe('validateTransition', () => {
    it('no debería lanzar error para transición válida', () => {
      expect(() => {
        stateMachine.validateTransition(OrderState.SOLICITUD, OrderState.VISITA);
      }).not.toThrow();
    });

    it('debería lanzar OrderStateTransitionError para transición inválida', () => {
      expect(() => {
        stateMachine.validateTransition(OrderState.SOLICITUD, OrderState.PAGO);
      }).toThrow(OrderStateTransitionError);
    });

    it('el error debería contener información de estados', () => {
      try {
        stateMachine.validateTransition(OrderState.SOLICITUD, OrderState.PAGO);
        fail('Debería haber lanzado error');
      } catch (error) {
        expect(error).toBeInstanceOf(OrderStateTransitionError);
        expect((error as OrderStateTransitionError).currentState).toBe(OrderState.SOLICITUD);
        expect((error as OrderStateTransitionError).attemptedState).toBe(OrderState.PAGO);
        expect((error as OrderStateTransitionError).allowedStates).toContain(OrderState.VISITA);
      }
    });
  });

  describe('getNextState', () => {
    it('debería retornar VISITA como siguiente estado de SOLICITUD', () => {
      expect(stateMachine.getNextState(OrderState.SOLICITUD)).toBe(OrderState.VISITA);
    });

    it('debería retornar PO como siguiente estado de VISITA', () => {
      expect(stateMachine.getNextState(OrderState.VISITA)).toBe(OrderState.PO);
    });

    it('debería retornar null para PAGO (estado final)', () => {
      expect(stateMachine.getNextState(OrderState.PAGO)).toBeNull();
    });
  });

  describe('isFinalState', () => {
    it('debería retornar true para PAGO', () => {
      expect(stateMachine.isFinalState(OrderState.PAGO)).toBe(true);
    });

    it('debería retornar false para SOLICITUD', () => {
      expect(stateMachine.isFinalState(OrderState.SOLICITUD)).toBe(false);
    });

    it('debería retornar false para estados intermedios', () => {
      expect(stateMachine.isFinalState(OrderState.EJECUCION)).toBe(false);
      expect(stateMachine.isFinalState(OrderState.FACTURA)).toBe(false);
    });
  });

  describe('getProgress', () => {
    it('debería retornar 0% para SOLICITUD', () => {
      expect(stateMachine.getProgress(OrderState.SOLICITUD)).toBe(0);
    });

    it('debería retornar 100% para PAGO', () => {
      expect(stateMachine.getProgress(OrderState.PAGO)).toBe(100);
    });

    it('debería retornar progreso intermedio para estados medios', () => {
      const progress = stateMachine.getProgress(OrderState.EJECUCION);
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);
    });

    it('progreso debería aumentar secuencialmente', () => {
      const progressSolicitud = stateMachine.getProgress(OrderState.SOLICITUD);
      const progressVisita = stateMachine.getProgress(OrderState.VISITA);
      const progressPO = stateMachine.getProgress(OrderState.PO);
      
      expect(progressVisita).toBeGreaterThan(progressSolicitud);
      expect(progressPO).toBeGreaterThan(progressVisita);
    });
  });

  describe('isBefore', () => {
    it('SOLICITUD debería estar antes que VISITA', () => {
      expect(stateMachine.isBefore(OrderState.SOLICITUD, OrderState.VISITA)).toBe(true);
    });

    it('PAGO no debería estar antes que SOLICITUD', () => {
      expect(stateMachine.isBefore(OrderState.PAGO, OrderState.SOLICITUD)).toBe(false);
    });

    it('mismo estado no debería estar antes de sí mismo', () => {
      expect(stateMachine.isBefore(OrderState.VISITA, OrderState.VISITA)).toBe(false);
    });
  });

  describe('flujo completo', () => {
    it('debería poder recorrer todo el flujo de trabajo', () => {
      const states = [
        OrderState.SOLICITUD,
        OrderState.VISITA,
        OrderState.PO,
        OrderState.PLANEACION,
        OrderState.EJECUCION,
        OrderState.INFORME,
        OrderState.ACTA,
        OrderState.SES,
        OrderState.FACTURA,
        OrderState.PAGO,
      ];

      for (let i = 0; i < states.length - 1; i++) {
        expect(stateMachine.canTransition(states[i], states[i + 1])).toBe(true);
      }
    });
  });
});
