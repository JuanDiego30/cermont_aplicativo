// Auth Feature Module
// Este módulo agrupa todos los componentes, hooks y APIs relacionados con autenticación

export { LoginForm } from '@/components/forms/LoginForm';
export { RegisterForm } from '@/components/forms/RegisterForm';
export { useAuth } from '@/hooks/useAuth';
export { useAuthStore } from '@/stores/authStore';
export type { 
  User, 
  UserPublic,
  UserRole, 
  AuthResponse, 
  LoginCredentials, 
  RegisterData,
  UpdateUserData
} from '@/types/user';
