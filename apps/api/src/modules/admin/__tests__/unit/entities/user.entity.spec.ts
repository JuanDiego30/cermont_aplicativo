/**
 * @test UserEntity Unit Tests
 */

import { UserEntity } from '../../../domain/entities/user.entity';

describe('UserEntity', () => {
  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan Pérez',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
        phone: '+57 3001234567',
      });

      expect(user.email.getValue()).toBe('test@cermont.com');
      expect(user.name).toBe('Juan Pérez');
      expect(user.role.getValue()).toBe('tecnico');
      expect(user.isActive).toBe(true);
      expect(user.phone).toBe('+57 3001234567');
      expect(user.id).toBeDefined();
    });

    it('should emit UserCreatedEvent', async () => {
      const user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan Pérez',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
        createdBy: 'admin-id',
      });

      const events = user.getDomainEvents();
      
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('UserCreatedEvent');
    });

    it('should throw error for short name', async () => {
      await expect(
        UserEntity.create({
          email: 'test@cermont.com',
          name: 'A',
          plainPassword: 'SecurePass123!',
          role: 'tecnico',
        }),
      ).rejects.toThrow('Nombre debe tener al menos 2 caracteres');
    });

    it('should throw error for name too long', async () => {
      await expect(
        UserEntity.create({
          email: 'test@cermont.com',
          name: 'A'.repeat(101),
          plainPassword: 'SecurePass123!',
          role: 'tecnico',
        }),
      ).rejects.toThrow('Nombre no puede exceder 100 caracteres');
    });

    it('should throw error for invalid phone', async () => {
      await expect(
        UserEntity.create({
          email: 'test@cermont.com',
          name: 'Juan Pérez',
          plainPassword: 'SecurePass123!',
          role: 'tecnico',
          phone: 'invalid-phone',
        }),
      ).rejects.toThrow('Formato de teléfono inválido');
    });
  });

  describe('update', () => {
    let user: UserEntity;

    beforeEach(async () => {
      user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan Pérez',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
      });
      user.clearDomainEvents();
    });

    it('should update name', () => {
      user.update({ name: 'Juan Actualizado' });

      expect(user.name).toBe('Juan Actualizado');
      expect(user.getDomainEvents()).toHaveLength(1);
      expect(user.getDomainEvents()[0].eventName).toBe('UserUpdatedEvent');
    });

    it('should update phone', () => {
      user.update({ phone: '+57 3009876543' });

      expect(user.phone).toBe('+57 3009876543');
    });

    it('should not emit event if nothing changed', () => {
      user.update({});

      expect(user.getDomainEvents()).toHaveLength(0);
    });

    it('should throw error for invalid update data', () => {
      expect(() => user.update({ name: 'A' })).toThrow(
        'Nombre debe tener al menos 2 caracteres',
      );
    });
  });

  describe('changeRole', () => {
    let user: UserEntity;

    beforeEach(async () => {
      user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan Pérez',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
      });
      user.clearDomainEvents();
    });

    it('should change role', () => {
      user.changeRole('supervisor', 'admin-id');

      expect(user.role.getValue()).toBe('supervisor');
      expect(user.getDomainEvents()).toHaveLength(1);
      expect(user.getDomainEvents()[0].eventName).toBe('RoleChangedEvent');
    });

    it('should throw error when changing to same role', () => {
      expect(() => user.changeRole('tecnico', 'admin-id')).toThrow(
        'El usuario ya tiene ese rol',
      );
    });
  });

  describe('activate/deactivate', () => {
    let user: UserEntity;

    beforeEach(async () => {
      user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan Pérez',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
      });
      user.clearDomainEvents();
    });

    it('should deactivate user', () => {
      user.deactivate('admin-id', 'Reason');

      expect(user.isActive).toBe(false);
      expect(user.getDomainEvents()).toHaveLength(1);
      expect(user.getDomainEvents()[0].eventName).toBe('UserDeactivatedEvent');
    });

    it('should throw error when deactivating already inactive user', () => {
      user.deactivate('admin-id');
      user.clearDomainEvents();

      expect(() => user.deactivate('admin-id')).toThrow(
        'El usuario ya está desactivado',
      );
    });

    it('should activate inactive user', () => {
      user.deactivate('admin-id');
      user.clearDomainEvents();
      
      user.activate();

      expect(user.isActive).toBe(true);
    });

    it('should throw error when activating already active user', () => {
      expect(() => user.activate()).toThrow('El usuario ya está activo');
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
      });

      const isValid = await user.verifyPassword('SecurePass123!');

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
      });

      const isValid = await user.verifyPassword('WrongPassword123!');

      expect(isValid).toBe(false);
    });
  });

  describe('toPersistence', () => {
    it('should convert to persistence format', async () => {
      const user = await UserEntity.create({
        email: 'test@cermont.com',
        name: 'Juan Pérez',
        plainPassword: 'SecurePass123!',
        role: 'tecnico',
        phone: '+57 3001234567',
      });

      const persistence = user.toPersistence();

      expect(persistence.id).toBeDefined();
      expect(persistence.email).toBe('test@cermont.com');
      expect(persistence.name).toBe('Juan Pérez');
      expect(persistence.passwordHash).toBeDefined();
      expect(persistence.role).toBe('tecnico');
      expect(persistence.phone).toBe('+57 3001234567');
      expect(persistence.active).toBe(true);
    });
  });
});
