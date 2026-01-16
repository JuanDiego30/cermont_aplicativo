import { OrderNumero } from '../order-numero.vo';

describe('OrderNumero Value Object', () => {
  describe('create', () => {
    it('debe crear OrderNumero con secuencia 1', () => {
      const numero = OrderNumero.create(1);
      expect(numero.value).toBe('ORD-000001');
    });

    it('debe crear OrderNumero con secuencia 123456', () => {
      const numero = OrderNumero.create(123456);
      expect(numero.value).toBe('ORD-123456');
    });

    it('debe ser inmutable (Object.freeze)', () => {
      const numero = OrderNumero.create(1);
      expect(Object.isFrozen(numero)).toBe(true);
    });
  });

  describe('fromString', () => {
    it('debe crear OrderNumero desde string válido', () => {
      const numero = OrderNumero.fromString('ORD-123456');
      expect(numero).not.toBeNull();
      expect(numero!.value).toBe('ORD-123456');
    });

    it('debe retornar null con formato inválido', () => {
      expect(OrderNumero.fromString('INVALID')).toBeNull();
      expect(OrderNumero.fromString('ORD-12345')).toBeNull(); // 5 dígitos
      expect(OrderNumero.fromString('ORD-1234567')).toBeNull(); // 7 dígitos
      expect(OrderNumero.fromString('ORDER-123456')).toBeNull();
    });
  });

  describe('isValid', () => {
    it('debe validar formato correcto', () => {
      expect(OrderNumero.isValid('ORD-123456')).toBe(true);
      expect(OrderNumero.isValid('ORD-000001')).toBe(true);
    });

    it('debe rechazar formato incorrecto', () => {
      expect(OrderNumero.isValid('invalid')).toBe(false);
      expect(OrderNumero.isValid('ORD-12345')).toBe(false);
      expect(OrderNumero.isValid('')).toBe(false);
    });
  });

  describe('getSequence', () => {
    it('debe extraer secuencia numérica', () => {
      const numero = OrderNumero.create(42);
      expect(numero.getSequence()).toBe(42);
    });
  });

  describe('equals', () => {
    it('debe comparar dos OrderNumero iguales', () => {
      const n1 = OrderNumero.create(100);
      const n2 = OrderNumero.create(100);
      expect(n1.equals(n2)).toBe(true);
    });

    it('debe comparar dos OrderNumero diferentes', () => {
      const n1 = OrderNumero.create(100);
      const n2 = OrderNumero.create(200);
      expect(n1.equals(n2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('debe retornar string representation', () => {
      const numero = OrderNumero.create(999);
      expect(numero.toString()).toBe('ORD-000999');
    });
  });
});
