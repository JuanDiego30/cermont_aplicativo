/**
 * @controller AdminController
 * 
 * Endpoints para gestión de usuarios y configuración.
 * Requiere: Rol admin.
 */
import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import {
    CreateUserDto,
    UpdateUserDto,
    UpdateUserRoleDto,
    AdminChangePasswordDto,
    ToggleUserActiveDto,
    ListUsersQueryDto,
    UserResponseDto,
    AdminActionResponseDto,
    ListUsersResponseDto,
} from './dto/admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // ============================================
    // USUARIOS
    // ============================================

    @Post('users')
    @Roles('admin')
    @ApiOperation({ summary: 'Crear nuevo usuario' })
    @ApiResponse({ status: 201, type: AdminActionResponseDto })
    async createUser(
        @Body() dto: CreateUserDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<AdminActionResponseDto> {
        const newUser = await this.adminService.createUser(dto, user.userId);
        return {
            success: true,
            message: 'Usuario creado exitosamente',
            data: newUser,
        };
    }

    @Get('users')
    @Roles('admin')
    @ApiOperation({ summary: 'Listar todos los usuarios' })
    @ApiResponse({ status: 200, type: ListUsersResponseDto })
    async getAllUsers(@Query() query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
        return await this.adminService.getAllUsers(query);
    }

    @Get('users/:id')
    @Roles('admin')
    @ApiOperation({ summary: 'Obtener usuario por ID' })
    @ApiParam({ name: 'id', description: 'UUID del usuario' })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
        return await this.adminService.getUserById(id);
    }

    @Patch('users/:id')
    @Roles('admin')
    @ApiOperation({ summary: 'Actualizar información de usuario' })
    @ApiParam({ name: 'id', description: 'UUID del usuario' })
    @ApiResponse({ status: 200, type: AdminActionResponseDto })
    async updateUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateUserDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<AdminActionResponseDto> {
        const updatedUser = await this.adminService.updateUser(id, dto, user.userId);
        return {
            success: true,
            message: 'Usuario actualizado exitosamente',
            data: updatedUser,
        };
    }

    @Patch('users/:id/role')
    @Roles('admin')
    @ApiOperation({ summary: 'Cambiar rol de usuario' })
    @ApiParam({ name: 'id', description: 'UUID del usuario' })
    @ApiResponse({ status: 200, type: AdminActionResponseDto })
    async updateRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: UpdateUserRoleDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<AdminActionResponseDto> {
        const updatedUser = await this.adminService.updateUserRole(id, dto, user.userId);
        return {
            success: true,
            message: `Rol actualizado a ${dto.role}`,
            data: updatedUser,
        };
    }

    @Patch('users/:id/toggle-active')
    @Roles('admin')
    @ApiOperation({ summary: 'Activar/Desactivar usuario' })
    @ApiParam({ name: 'id', description: 'UUID del usuario' })
    @ApiResponse({ status: 200, type: AdminActionResponseDto })
    async toggleActive(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: ToggleUserActiveDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<{ success: boolean; message: string }> {
        return await this.adminService.toggleUserActive(id, dto.active, user.userId);
    }

    @Patch('users/:id/password')
    @Roles('admin')
    @ApiOperation({ summary: 'Cambiar contraseña de usuario (admin)' })
    @ApiParam({ name: 'id', description: 'UUID del usuario' })
    @ApiResponse({ status: 200 })
    async adminChangePassword(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AdminChangePasswordDto,
        @CurrentUser() user: JwtPayload,
    ): Promise<{ success: boolean; message: string }> {
        return await this.adminService.adminChangePassword(id, dto.newPassword, user.userId);
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================

    @Get('stats/users')
    @Roles('admin')
    @ApiOperation({ summary: 'Obtener estadísticas de usuarios' })
    async getUserStats(): Promise<{
        total: number;
        activos: number;
        porRol: Record<string, number>;
    }> {
        return await this.adminService.getUserStats();
    }

    // ============================================
    // PERMISOS
    // ============================================

    @Get('permissions/:role')
    @Roles('admin', 'supervisor')
    @ApiOperation({ summary: 'Obtener permisos de un rol' })
    @ApiParam({ name: 'role', description: 'Rol a consultar' })
    async getPermissions(@Param('role') role: 'admin' | 'supervisor' | 'tecnico') {
        return this.adminService.getUserPermissions(role);
    }
}
