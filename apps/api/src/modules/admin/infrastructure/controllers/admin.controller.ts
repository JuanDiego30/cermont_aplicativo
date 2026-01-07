/**
 * @controller AdminController (Refactorizado)
 *
 * Controller delgado que solo coordina las peticiones HTTP.
 * La lógica de negocio está en los Use Cases.
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UsePipes,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";

// Guards y Decorators
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../../../common/guards/roles.guard";
import { Roles } from "../../../../common/decorators/roles.decorator";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";

// Use Cases
import {
  CreateUserUseCase,
  UpdateUserUseCase,
  ChangeUserRoleUseCase,
  ToggleUserActiveUseCase,
  ResetPasswordUseCase,
  ListUsersUseCase,
  GetUserByIdUseCase,
  GetUserStatsUseCase,
} from "../../application/use-cases";

// DTOs
import {
  CreateUserDto,
  UpdateUserDto,
  ChangeRoleDto,
  ChangePasswordDto,
  ToggleActiveDto,
  UserQueryDto,
  UserResponseDto,
  ActionResponseDto,
  PaginatedUsersResponseDto,
  UserStatsResponseDto,
} from "../../application/dto";

// Validation Pipe con Zod
import { ZodValidationPipe } from "../../../../common/pipes/zod-validation.pipe";
import { CreateUserSchema } from "../../application/dto/create-user.dto";
import { UpdateUserSchema } from "../../application/dto/update-user.dto";
import { ChangeRoleSchema } from "../../application/dto/change-role.dto";
import { ChangePasswordSchema } from "../../application/dto/change-password.dto";
import { ToggleActiveSchema } from "../../application/dto/toggle-active.dto";

@ApiTags("Admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly changeUserRoleUseCase: ChangeUserRoleUseCase,
    private readonly toggleUserActiveUseCase: ToggleUserActiveUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase,
  ) { }

  // ============================================
  // USUARIOS - CRUD
  // ============================================

  @Post("users")
  @Roles("admin")
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  @ApiOperation({ summary: "Crear nuevo usuario" })
  @ApiResponse({ status: 201, type: ActionResponseDto })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 409, description: "Email ya existe" })
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ActionResponseDto<UserResponseDto>> {
    const user = await this.createUserUseCase.execute({
      ...dto,
      createdBy: currentUser.userId,
    });

    return {
      success: true,
      message: "Usuario creado exitosamente",
      data: user,
    };
  }

  @Get("users")
  @Roles("admin")
  @ApiOperation({ summary: "Listar todos los usuarios" })
  @ApiResponse({ status: 200, type: PaginatedUsersResponseDto })
  async listUsers(
    @Query() query: UserQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    return this.listUsersUseCase.execute({
      role: query.role,
      active: query.active,
      search: query.search,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 10,
    });
  }

  @Get("users/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener usuario por ID" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async getUserById(
    @Param("id", ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.getUserByIdUseCase.execute(id);
  }

  @Patch("users/:id")
  @Roles("admin")
  @UsePipes(new ZodValidationPipe(UpdateUserSchema))
  @ApiOperation({ summary: "Actualizar información de usuario" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200, type: ActionResponseDto })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async updateUser(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ActionResponseDto<UserResponseDto>> {
    const user = await this.updateUserUseCase.execute({
      userId: id,
      ...dto,
      updatedBy: currentUser.userId,
    });

    return {
      success: true,
      message: "Usuario actualizado exitosamente",
      data: user,
    };
  }

  // ============================================
  // USUARIOS - ROL
  // ============================================

  @Patch("users/:id/role")
  @Roles("admin")
  @UsePipes(new ZodValidationPipe(ChangeRoleSchema))
  @ApiOperation({ summary: "Cambiar rol de usuario" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200, type: ActionResponseDto })
  @ApiResponse({ status: 400, description: "Operación no permitida" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async changeRole(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<ActionResponseDto<UserResponseDto>> {
    const user = await this.changeUserRoleUseCase.execute({
      userId: id,
      newRole: dto.role,
      changedBy: currentUser.userId,
    });

    return {
      success: true,
      message: `Rol actualizado a ${dto.role}`,
      data: user,
    };
  }

  // ============================================
  // USUARIOS - ESTADO (BACKWARD COMPAT)
  // ============================================

  @Patch("users/:id/status")
  @Roles("admin")
  @ApiOperation({ summary: "Cambiar estado de usuario (activo/inactivo)" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async updateStatus(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: { active: boolean },
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<{ success: boolean; message: string }> {
    return this.toggleUserActiveUseCase.execute({
      userId: id,
      active: body.active,
      reason: `Estado cambiado por ${currentUser.userId}`,
      changedBy: currentUser.userId,
    });
  }

  @Delete("users/:id")
  @Roles("admin")
  @ApiOperation({ summary: "Eliminar usuario (soft delete)" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async deleteUser(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<{ success: boolean; message: string }> {
    await this.toggleUserActiveUseCase.execute({
      userId: id,
      active: false,
      reason: `Usuario eliminado por ${currentUser.userId}`,
      changedBy: currentUser.userId,
    });

    return {
      success: true,
      message: 'Usuario eliminado exitosamente (desactivado)',
    };
  }

  // ============================================
  // USUARIOS - ACTIVACIÓN
  // ============================================

  @Patch("users/:id/toggle-active")
  @Roles("admin")
  @UsePipes(new ZodValidationPipe(ToggleActiveSchema))
  @ApiOperation({ summary: "Activar/Desactivar usuario" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: "Operación no permitida" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async toggleActive(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ToggleActiveDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<{ success: boolean; message: string }> {
    return this.toggleUserActiveUseCase.execute({
      userId: id,
      active: dto.active,
      reason: dto.reason,
      changedBy: currentUser.userId,
    });
  }

  // ============================================
  // USUARIOS - PASSWORD
  // ============================================

  @Patch("users/:id/password")
  @Roles("admin")
  @UsePipes(new ZodValidationPipe(ChangePasswordSchema))
  @ApiOperation({ summary: "Cambiar contraseña de usuario (admin)" })
  @ApiParam({ name: "id", description: "UUID del usuario" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async resetPassword(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<{ success: boolean; message: string }> {
    return this.resetPasswordUseCase.execute({
      userId: id,
      newPassword: dto.newPassword,
      resetBy: currentUser.userId,
    });
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  @Get("stats/users")
  @Roles("admin")
  @ApiOperation({ summary: "Obtener estadísticas de usuarios" })
  @ApiResponse({ status: 200, type: UserStatsResponseDto })
  async getUserStats(): Promise<UserStatsResponseDto> {
    return this.getUserStatsUseCase.execute();
  }
}
