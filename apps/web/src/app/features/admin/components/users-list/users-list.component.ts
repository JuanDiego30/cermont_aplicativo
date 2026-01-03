import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { User, UserRole } from '../../../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-users-list',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './users-list.component.html',
    styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit, OnDestroy {
    private readonly adminService = inject(AdminService);
    private readonly destroy$ = new Subject<void>();

    users = signal<User[]>([]);
    total = signal(0);
    loading = signal(true);
    error = signal<string | null>(null);

    // Filters
    searchTerm = signal('');
    roleFilter = signal<UserRole | ''>('');
    currentPage = signal(1);
    pageSize = signal(10);

    readonly UserRole = UserRole;

    ngOnInit(): void {
        this.loadUsers();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    loadUsers(): void {
        this.loading.set(true);
        this.error.set(null);

        this.adminService.getUsers({
            page: this.currentPage(),
            limit: this.pageSize(),
            search: this.searchTerm() || undefined,
            role: this.roleFilter() || undefined
        })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.users.set(response.data);
                    this.total.set(response.total);
                    this.loading.set(false);
                },
                error: () => {
                    this.error.set('Error al cargar usuarios');
                    this.loading.set(false);
                }
            });
    }

    onSearch(): void {
        this.currentPage.set(1);
        this.loadUsers();
    }

    onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadUsers();
    }

    getRoleBadgeColor(role: UserRole): string {
        const colors: Record<UserRole, string> = {
            [UserRole.ADMIN]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
            [UserRole.SUPERVISOR]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            [UserRole.TECNICO]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        };
        return colors[role] || 'bg-gray-100 text-gray-800';
    }
}
