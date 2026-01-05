import { Monto, OrdenNumero, OrdenEstado } from "../index";

/**
 * REGLA 5: Tests unitarios con >70% coverage
 * Validar Value Objects con casos edge
 */

describe("Monto Value Object", () => {
  describe("create", () => {
    it("debe crear Monto válido", () => {
      const monto = Monto.create(100.5);
      expect(monto.getValue()).toBe(100.5);
    });

    it("debe redondear a 2 decimales", () => {
      const monto = Monto.create(100.556);
      expect(monto.getValue()).toBe(100.56);
    });

    it("debe lanzar error para valores negativos", () => {
      expect(() => Monto.create(-10)).toThrow("Monto no puede ser negativo");
    });

    it("debe lanzar error para valores muy grandes", () => {
      expect(() => Monto.create(1000000000)).toThrow(
        "Monto excede límite máximo permitido",
      );
    });
  });

  describe("operaciones", () => {
    it("debe sumar montos correctamente", () => {
      const m1 = Monto.create(100);
      const m2 = Monto.create(50);
      const resultado = m1.add(m2);
      expect(resultado.getValue()).toBe(150);
    });

    it("debe restar montos correctamente", () => {
      const m1 = Monto.create(100);
      const m2 = Monto.create(30);
      const resultado = m1.subtract(m2);
      expect(resultado.getValue()).toBe(70);
    });

    it("debe multiplicar correctamente", () => {
      const m = Monto.create(50);
      const resultado = m.multiply(2);
      expect(resultado.getValue()).toBe(100);
    });
  });

  describe("validaciones", () => {
    it("debe identificar montos positivos", () => {
      const monto = Monto.create(100);
      expect(monto.isPositivo()).toBe(true);
    });

    it("debe rechazar montos negativos (regla de dominio)", () => {
      expect(() => Monto.create(-50)).toThrow("Monto no puede ser negativo");
    });
  });
});

describe("OrdenNumero Value Object", () => {
  describe("create", () => {
    it("debe crear OrdenNumero válido", () => {
      const numero = OrdenNumero.create("ORD-123456");
      expect(numero.getValue()).toBe("ORD-123456");
    });

    it("debe convertir a mayúsculas", () => {
      const numero = OrdenNumero.create("ord-123456");
      expect(numero.getValue()).toBe("ORD-123456");
    });

    it("debe lanzar error para formato inválido", () => {
      expect(() => OrdenNumero.create("INVALID")).toThrow(
        "Formato inválido: debe ser ORD-XXXXXX",
      );
    });

    it("debe lanzar error para string vacío", () => {
      expect(() => OrdenNumero.create("")).toThrow(
        "OrdenNumero no puede ser vacío",
      );
    });
  });

  describe("generar", () => {
    it("debe generar OrdenNumero único", () => {
      const num1 = OrdenNumero.generar();
      const num2 = OrdenNumero.generar();
      expect(num1.getValue()).not.toBe(num2.getValue());
    });
  });
});

describe("OrdenEstado Value Object", () => {
  describe("create", () => {
    it("debe crear estado válido", () => {
      const estado = OrdenEstado.create("PENDIENTE");
      expect(estado.getValue()).toBe("PENDIENTE");
    });

    it("debe lanzar error para estado inválido", () => {
      expect(() => OrdenEstado.create("INVALIDO")).toThrow(
        "Estado inválido: INVALIDO",
      );
    });
  });

  describe("transiciones", () => {
    it("debe permitir transición PENDIENTE -> EN_PROCESO", () => {
      expect(OrdenEstado.esTransicionValida("PENDIENTE", "EN_PROCESO")).toBe(
        true,
      );
    });

    it("debe permitir transición PENDIENTE -> CANCELADA", () => {
      expect(OrdenEstado.esTransicionValida("PENDIENTE", "CANCELADA")).toBe(
        true,
      );
    });

    it("debe rechazar transición COMPLETADA -> EN_PROCESO", () => {
      expect(OrdenEstado.esTransicionValida("COMPLETADA", "EN_PROCESO")).toBe(
        false,
      );
    });
  });
});
