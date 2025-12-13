/**
 * @repository IUsuarioRepository
 * @description Interface del repositorio de usuarios
 * @layer Domain
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
