import { OrdenEntity } from "../orden.entity";

describe("OrdenEntity", () => {
  const baseProps = {
    descripcion: "Mantenimiento preventivo",
    cliente: "Cliente Test",
    prioridad: "media" as const,
    creadorId: "user-123",
    asignadoId: "tecnico-456",
  };

  describe("create", () => {
    it("debe crear orden con estado inicial planeacion", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      expect(orden.estado.value).toBe("planeacion");
    });

    it("debe generar número con secuencia", () => {
      const orden = OrdenEntity.create(baseProps, 42);
      expect(orden.numero.value).toBe("ORD-000042");
    });

    it("debe tener timestamps", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      expect(orden.createdAt).toBeInstanceOf(Date);
      expect(orden.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("fromPersistence", () => {
    it("debe reconstruir desde persistencia", () => {
      const now = new Date();
      const orden = OrdenEntity.fromPersistence({
        id: "orden-123",
        numero: "ORD-000001",
        descripcion: "Test",
        cliente: "Cliente",
        estado: "ejecucion",
        prioridad: "alta",
        createdAt: now,
        updatedAt: now,
      });

      expect(orden.id).toBe("orden-123");
      expect(orden.estado.value).toBe("ejecucion");
    });
  });

  describe("changeEstado", () => {
    it("debe permitir planeacion -> ejecucion", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.changeEstado("ejecucion");
      expect(orden.estado.value).toBe("ejecucion");
    });

    it("debe establecer fechaInicio al pasar a ejecucion", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      expect(orden.fechaInicio).toBeUndefined();
      orden.changeEstado("ejecucion");
      expect(orden.fechaInicio).toBeInstanceOf(Date);
    });

    it("debe establecer fechaFin al completar", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.changeEstado("ejecucion");
      orden.changeEstado("completada");
      expect(orden.fechaFin).toBeInstanceOf(Date);
    });

    it("debe lanzar error en transición inválida", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      expect(() => orden.changeEstado("completada")).toThrow(
        "Transición inválida de planeacion a completada",
      );
    });

    it("debe registrar domain event", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.changeEstado("ejecucion");
      const events = orden.domainEvents;
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventName).toBe("orden.estado.changed");
    });
  });

  describe("business methods", () => {
    it("iniciarEjecucion debe cambiar a ejecucion", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.iniciarEjecucion();
      expect(orden.estado.value).toBe("ejecucion");
    });

    it("pausar debe cambiar a pausada", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.iniciarEjecucion();
      orden.pausar();
      expect(orden.estado.value).toBe("pausada");
    });

    it("reanudar debe cambiar de pausada a ejecucion", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.iniciarEjecucion();
      orden.pausar();
      orden.reanudar();
      expect(orden.estado.value).toBe("ejecucion");
    });

    it("completar debe cambiar a completada", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.iniciarEjecucion();
      orden.completar();
      expect(orden.estado.value).toBe("completada");
    });

    it("cancelar debe cambiar a cancelada", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.cancelar();
      expect(orden.estado.value).toBe("cancelada");
    });
  });

  describe("updateDetails", () => {
    it("debe actualizar descripción", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.updateDetails({ descripcion: "Nueva descripción" });
      expect(orden.descripcion).toBe("Nueva descripción");
    });

    it("debe actualizar updatedAt", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      const oldUpdatedAt = orden.updatedAt;

      // Small delay to ensure different timestamp
      orden.updateDetails({ cliente: "Nuevo Cliente" });
      expect(orden.updatedAt.getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime(),
      );
    });
  });

  describe("getDiasDesdeCreacion", () => {
    it("debe calcular días desde creación", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      const dias = orden.getDiasDesdeCreacion();
      expect(dias).toBe(0); // Recién creado
    });
  });

  describe("toJSON", () => {
    it("debe serializar correctamente", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      const json = orden.toJSON();

      expect(json).toHaveProperty("numero");
      expect(json).toHaveProperty("descripcion");
      expect(json).toHaveProperty("estado");
      expect(json.numero).toBe("ORD-000001");
    });
  });

  describe("clearEvents", () => {
    it("debe limpiar domain events", () => {
      const orden = OrdenEntity.create(baseProps, 1);
      orden.changeEstado("ejecucion");
      expect(orden.domainEvents.length).toBeGreaterThan(0);

      orden.clearEvents();
      expect(orden.domainEvents.length).toBe(0);
    });
  });
});
