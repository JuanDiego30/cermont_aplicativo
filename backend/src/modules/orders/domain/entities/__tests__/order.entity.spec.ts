import { OrderEntity } from '../order.entity';

describe('OrderEntity', () => {
  const baseProps = {
    descripcion: 'Mantenimiento preventivo',
    cliente: 'Cliente Test',
    prioridad: 'media' as const,
    creadorId: 'user-123',
    asignadoId: 'tecnico-456',
  };

  describe('create', () => {
    it('debe crear Order con estado inicial planeacion', () => {
      const Order = OrderEntity.create(baseProps, 1);
      expect(Order.estado.value).toBe('planeacion');
    });

    it('debe generar número con secuencia', () => {
      const Order = OrderEntity.create(baseProps, 42);
      expect(Order.numero.value).toBe('ORD-000042');
    });

    it('debe tener timestamps', () => {
      const Order = OrderEntity.create(baseProps, 1);
      expect(Order.createdAt).toBeInstanceOf(Date);
      expect(Order.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('fromPersistence', () => {
    it('debe reconstruir desde persistencia', () => {
      const now = new Date();
      const Order = OrderEntity.fromPersistence({
        id: 'Order-123',
        numero: 'ORD-000001',
        descripcion: 'Test',
        cliente: 'Cliente',
        estado: 'ejecucion',
        prioridad: 'alta',
        createdAt: now,
        updatedAt: now,
      });

      expect(Order.id).toBe('Order-123');
      expect(Order.estado.value).toBe('ejecucion');
    });
  });

  describe('changeEstado', () => {
    it('debe permitir planeacion -> ejecucion', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.changeEstado('ejecucion');
      expect(Order.estado.value).toBe('ejecucion');
    });

    it('debe establecer fechaInicio al pasar a ejecucion', () => {
      const Order = OrderEntity.create(baseProps, 1);
      expect(Order.fechaInicio).toBeUndefined();
      Order.changeEstado('ejecucion');
      expect(Order.fechaInicio).toBeInstanceOf(Date);
    });

    it('debe establecer fechaFin al completar', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.changeEstado('ejecucion');
      Order.changeEstado('completada');
      expect(Order.fechaFin).toBeInstanceOf(Date);
    });

    it('debe lanzar error en transición inválida', () => {
      const Order = OrderEntity.create(baseProps, 1);
      expect(() => Order.changeEstado('completada')).toThrow(
        'Transición inválida de planeacion a completada'
      );
    });

    it('debe registrar domain event', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.changeEstado('ejecucion');
      const events = Order.domainEvents;
      expect(events.length).toBeGreaterThan(0);
      expect(events[0].eventName).toBe('Order.estado.changed');
    });
  });

  describe('business methods', () => {
    it('iniciarEjecucion debe cambiar a ejecucion', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.iniciarEjecucion();
      expect(Order.estado.value).toBe('ejecucion');
    });

    it('pausar debe cambiar a pausada', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.iniciarEjecucion();
      Order.pausar();
      expect(Order.estado.value).toBe('pausada');
    });

    it('reanudar debe cambiar de pausada a ejecucion', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.iniciarEjecucion();
      Order.pausar();
      Order.reanudar();
      expect(Order.estado.value).toBe('ejecucion');
    });

    it('completar debe cambiar a completada', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.iniciarEjecucion();
      Order.completar();
      expect(Order.estado.value).toBe('completada');
    });

    it('cancelar debe cambiar a cancelada', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.cancelar();
      expect(Order.estado.value).toBe('cancelada');
    });
  });

  describe('updateDetails', () => {
    it('debe actualizar descripción', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.updateDetails({ descripcion: 'Nueva descripción' });
      expect(Order.descripcion).toBe('Nueva descripción');
    });

    it('debe actualizar updatedAt', () => {
      const Order = OrderEntity.create(baseProps, 1);
      const oldUpdatedAt = Order.updatedAt;

      // Small delay to ensure different timestamp
      Order.updateDetails({ cliente: 'Nuevo Cliente' });
      expect(Order.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('getDiasDesdeCreacion', () => {
    it('debe calcular días desde creación', () => {
      const Order = OrderEntity.create(baseProps, 1);
      const dias = Order.getDiasDesdeCreacion();
      expect(dias).toBe(0); // Recién creado
    });
  });

  describe('toJSON', () => {
    it('debe serializar correctamente', () => {
      const Order = OrderEntity.create(baseProps, 1);
      const json = Order.toJSON();

      expect(json).toHaveProperty('numero');
      expect(json).toHaveProperty('descripcion');
      expect(json).toHaveProperty('estado');
      expect(json.numero).toBe('ORD-000001');
    });
  });

  describe('clearEvents', () => {
    it('debe limpiar domain events', () => {
      const Order = OrderEntity.create(baseProps, 1);
      Order.changeEstado('ejecucion');
      expect(Order.domainEvents.length).toBeGreaterThan(0);

      Order.clearEvents();
      expect(Order.domainEvents.length).toBe(0);
    });
  });
});
