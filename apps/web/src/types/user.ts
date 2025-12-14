/**
 * ARCHIVO: user.ts
 * FUNCION: Define tipos de usuario, roles y autenticación
 * IMPLEMENTACION: Interfaces TypeScript sincronizadas con backend
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: UserRole, User, AuthResponse, UserPublic, LoginCredentials, RegisterData, UpdateUserData
 */
export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'administrativo';

/**
 * Representa un usuario del sistema
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Respuesta de autenticación del servidor
 */
export interface AuthResponse {
  user: UserPublic;
  token: string;
}

/**
 * Usuario público (sin datos sensibles)
 */
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

/**
 * Credenciales para iniciar sesión
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Datos para registrar un nuevo usuario
 */
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  phone?: string;
}

/**
 * Datos para actualizar un usuario
 */
export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  phone?: string;
  active?: boolean;
  avatar?: string;
}
