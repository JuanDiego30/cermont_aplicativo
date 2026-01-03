import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-user-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit, OnDestroy {
    private readonly adminService = inject(AdminService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly destroy$ = new Subject<void>();

    user = signal<User | null>(null);
    loading = signal(true);
    error = signal<string | null>(null);

    // Modales
    showRevokeModal = signal(false);
    revokeReason = signal('');

    readonly UserRole = UserRole;

    ngOnInit(): void {
        const userId = this.route.snapshot.paramMap.get('id');
        if (userId) {
            this.loadUser(userId);
        } else {
            this.error.set('ID de usuario no válido');
            this.loading.set(false);
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadUser(id: string): void {
        this.loading.set(true);
        this.error.set(null);

        this.adminService.getUserById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (user) => {
                    this.user.set(user);
                    this.loading.set(false);
                },
                error: () => {
                    this.error.set('Error al cargar el usuario');
                    this.loading.set(false);
                }
            });
    }

    toggleUserStatus(): void {
        const user = this.user();
        if (!user) return;

        const action = user.active ? 'desactivar' : 'activar';
        if (!confirm(`¿Estás seguro de ${action} a ${user.name}?`)) return;

        const observable = user.active
            ? this.adminService.deactivateUser(user.id)
            : this.adminService.activateUser(user.id);

        observable
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.loadUser(user.id);
                },
                error: (err) => {
                    alert(err.message || `Error al ${action} usuario`);
                }
            });
    }

    openRevokeModal(): void {
        this.revokeReason.set('');
        this.showRevokeModal.set(true);
    }

    closeRevokeModal(): void {
        this.showRevokeModal.set(false);
        this.revokeReason.set('');
    }

    revokeTokens(): void {
        const user = this.user();
        const reason = this.revokeReason();

        if (!user || !reason.trim()) {
            alert('Por favor proporciona una razón');
            return;
        }

        this.adminService.revokeUserTokens(user.id, reason)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (result) => {
                    alert(`${result.tokensRevoked} tokens revocados exitosamente`);
                    this.closeRevokeModal();
                },
                error: (err) => {
                    alert(err.message || 'Error al revocar tokens');
                }
            });
    }

    navigateToEdit(): void {
        const user = this.user();
        if (user) {
            this.router.navigate(['/admin/users', user.id, 'editar']);
        }
    }

    getRoleBadgeColor(role: UserRole): string {
        const colors: Record<UserRole, string> = {
            [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            [UserRole.SUPERVISOR]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            [UserRole.TECNICO]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }

    formatDate(date: string | undefined): string {
        if (!date) return 'No disponible';
        return new Date(date).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    isUserLocked(user: User): boolean {
        if (!user.lockedUntil) return false;
        return new Date(user.lockedUntil) > new Date();
    }

    getLockedTimeRemaining(user: User): string {
        if (!user.lockedUntil) return '';
        const now = new Date();
        const lockedUntil = new Date(user.lockedUntil);
        const diff = lockedUntil.getTime() - now.getTime();
        const minutes = Math.ceil(diff / 60000);
        return `${minutes} minutos`;
    }

    getDaysActive(): number {
        const user = this.user();
        if (!user) return 0;
        return Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    }
}
