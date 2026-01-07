import { UserRole } from '../models/user.model';

export function getRoleBadgeColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    [UserRole.SUPERVISOR]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    [UserRole.TECNICO]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    [UserRole.ADMINISTRATIVO]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    [UserRole.GERENTE]: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  };

  return colors[role] || 'bg-gray-100 text-gray-800';
}
