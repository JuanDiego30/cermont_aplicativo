/**
 * ARCHIVO: usuario.repository.interface.ts
 * FUNCION: Contrato de repositorio para persistencia de usuarios (Domain Layer)
 * IMPLEMENTACION: Define interface IUsuarioRepository y token de inyección Symbol
 * DEPENDENCIAS: Ninguna (capa de dominio pura)
 * EXPORTS: USUARIO_REPOSITORY (Symbol), IUsuarioRepository, UsuarioData
 */
export const USUARIO_REPOSITORY = Symbol('USUARIO_REPOSITORY');

export interface UsuarioData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUsuarioRepository {
  findAll(filters: {
    role?: string;
    active?: boolean;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: UsuarioData[]; total: number }>;

  findById(id: string): Promise<UsuarioData | null>;

  findByEmail(email: string): Promise<UsuarioData | null>;

  create(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    avatar?: string;
  }): Promise<UsuarioData>;

  update(
    id: string,
    data: Partial<{
      email: string;
      password: string;
      name: string;
      role: string;
      phone: string;
      avatar: string;
      active: boolean;
    }>,
  ): Promise<UsuarioData>;

  deactivate(id: string): Promise<void>;

  activate(id: string): Promise<void>;
}
