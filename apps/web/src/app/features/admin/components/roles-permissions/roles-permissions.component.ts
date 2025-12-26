import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin.service';
import { RolePermissions } from '../../../../core/models/user.model';

@Component({
    selector: 'app-roles-permissions',
    standalone: true,
    imports: [CommonModule, KeyValuePipe],
    templateUrl: './roles-permissions.component.html',
    styleUrls: ['./roles-permissions.component.css']
})
export class RolesPermissionsComponent implements OnInit {
    private readonly adminService = inject(AdminService);

    roles = signal<RolePermissions[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    selectedRole = signal<RolePermissions | null>(null);

    // Resources for matrix
    readonly resources = ['Users', 'Ordenes', 'Reportes', 'Configuración'];

    ngOnInit(): void {
        this.loadRoles();
    }

    loadRoles(): void {
        this.loading.set(true);
        this.error.set(null);

        this.adminService.getAllRolesPermissions().subscribe({
            next: (roles) => {
                this.roles.set(roles);
                if (roles.length > 0) {
                    this.selectedRole.set(roles[0]);
                }
                this.loading.set(false);
            },
            error: () => {
                this.error.set('Error al cargar roles y permisos');
                this.loading.set(false);
            }
        });
    }

    selectRole(role: RolePermissions): void {
        this.selectedRole.set(role);
    }

    getRoleBadgeColor(role: string): string {
        const colors: Record<string, string> = {
            'admin': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            'supervisor': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'tecnico': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
        return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }

    getRoleIcon(role: string): string {
        const icons: Record<string, string> = {
            'admin': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            'supervisor': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            'tecnico': 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
        };
        return icons[role] || 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
    }

    groupPermissionsByResource(): Map<string, Array<{ resource: string; action: string }>> {
        const selected = this.selectedRole();
        if (!selected) return new Map();

        const grouped = new Map<string, Array<{ resource: string; action: string }>>();

        selected.permissions.forEach(perm => {
            if (!grouped.has(perm.resource)) {
                grouped.set(perm.resource, []);
            }
            grouped.get(perm.resource)!.push(perm);
        });

        return grouped;
    }

    getResourceIcon(resource: string): string {
        const icons: Record<string, string> = {
            'users': 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
            'ordenes': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
            'reportes': 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            'configuracion': 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        };
        return icons[resource.toLowerCase()] || 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z';
    }

    roleHasResourcePermission(role: RolePermissions, resourceName: string): boolean {
        return role.permissions.some(p => p.resource.toLowerCase() === resourceName.toLowerCase());
    }
}
