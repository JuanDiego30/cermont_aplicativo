/**
 * @test UserRole Value Object Unit Tests
 */

import { UserRole, USER_ROLES } from '../../../domain/value-objects/user-role.vo';

describe('UserRole Value Object', () => {
  describe('create', () => {
    it('should create valid roles', () => {
      USER_ROLES.forEach((role) => {
        const userRole = UserRole.create(role);
        expect(userRole.getValue()).toBe(role);
      });
    });

    it('should normalize role to lowercase', () => {
      const userRole = UserRole.create('ADMIN');
      expect(userRole.getValue()).toBe('admin');
    });

    it('should throw error for invalid role', () => {
      expect(() => UserRole.create('invalid_role')).toThrow('Rol inválido');
      expect(() => UserRole.create('')).toThrow('Rol inválido');
    });
  });

  describe('role checks', () => {
    it('should identify admin role', () => {
      const role = UserRole.create('admin');
      
      expect(role.isAdmin()).toBe(true);
      expect(role.isSupervisor()).toBe(false);
      expect(role.isTecnico()).toBe(false);
      expect(role.isAdministrativo()).toBe(false);
    });

    it('should identify supervisor role', () => {
      const role = UserRole.create('supervisor');
      
      expect(role.isAdmin()).toBe(false);
      expect(role.isSupervisor()).toBe(true);
    });

    it('should identify tecnico role', () => {
      const role = UserRole.create('tecnico');
      
      expect(role.isTecnico()).toBe(true);
    });

    it('should identify administrativo role', () => {
      const role = UserRole.create('administrativo');
      
      expect(role.isAdministrativo()).toBe(true);
    });
  });

  describe('hierarchy', () => {
    it('should return correct hierarchy levels', () => {
      const admin = UserRole.create('admin');
      const supervisor = UserRole.create('supervisor');
      const tecnico = UserRole.create('tecnico');
      const administrativo = UserRole.create('administrativo');

      expect(admin.getHierarchyLevel()).toBe(4);
      expect(supervisor.getHierarchyLevel()).toBe(3);
      expect(tecnico.getHierarchyLevel()).toBe(2);
      expect(administrativo.getHierarchyLevel()).toBe(1);
    });

    it('should correctly compare hierarchy', () => {
      const admin = UserRole.create('admin');
      const supervisor = UserRole.create('supervisor');
      const tecnico = UserRole.create('tecnico');

      expect(admin.isHigherThan(supervisor)).toBe(true);
      expect(supervisor.isHigherThan(tecnico)).toBe(true);
      expect(tecnico.isHigherThan(admin)).toBe(false);
    });

    it('should correctly compare equal or higher', () => {
      const admin1 = UserRole.create('admin');
      const admin2 = UserRole.create('admin');
      const supervisor = UserRole.create('supervisor');

      expect(admin1.isHigherOrEqualTo(admin2)).toBe(true);
      expect(admin1.isHigherOrEqualTo(supervisor)).toBe(true);
      expect(supervisor.isHigherOrEqualTo(admin1)).toBe(false);
    });
  });

  describe('canAssignRole', () => {
    it('admin should be able to assign any role', () => {
      const admin = UserRole.create('admin');
      
      expect(admin.canAssignRole(UserRole.create('admin'))).toBe(true);
      expect(admin.canAssignRole(UserRole.create('supervisor'))).toBe(true);
      expect(admin.canAssignRole(UserRole.create('tecnico'))).toBe(true);
      expect(admin.canAssignRole(UserRole.create('administrativo'))).toBe(true);
    });

    it('supervisor should only assign lower roles', () => {
      const supervisor = UserRole.create('supervisor');
      
      expect(supervisor.canAssignRole(UserRole.create('admin'))).toBe(false);
      expect(supervisor.canAssignRole(UserRole.create('supervisor'))).toBe(false);
      expect(supervisor.canAssignRole(UserRole.create('tecnico'))).toBe(true);
      expect(supervisor.canAssignRole(UserRole.create('administrativo'))).toBe(true);
    });

    it('tecnico should not be able to assign roles', () => {
      const tecnico = UserRole.create('tecnico');
      
      expect(tecnico.canAssignRole(UserRole.create('tecnico'))).toBe(false);
      expect(tecnico.canAssignRole(UserRole.create('administrativo'))).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal roles', () => {
      const role1 = UserRole.create('admin');
      const role2 = UserRole.create('admin');
      
      expect(role1.equals(role2)).toBe(true);
    });

    it('should return false for different roles', () => {
      const role1 = UserRole.create('admin');
      const role2 = UserRole.create('supervisor');
      
      expect(role1.equals(role2)).toBe(false);
    });
  });

  describe('getAllRoles', () => {
    it('should return all valid roles', () => {
      const roles = UserRole.getAllRoles();
      
      expect(roles).toEqual(['admin', 'supervisor', 'tecnico', 'administrativo']);
    });
  });
});
