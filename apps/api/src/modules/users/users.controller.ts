/**
 * @controller UsersController
 * @description Endpoints de autoservicio para perfil de usuario (no admin)
 *
 * ENDPOINTS:
 * - PATCH /users/:id - Update own profile
 * - POST /upload/avatar - Upload avatar image
 */
import {
    Controller,
    Patch,
    Post,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseUUIDPipe,
    ForbiddenException,
    BadRequestException,
    NotFoundException,
    Logger,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import * as fs from "fs";
import { Prisma } from "@prisma/client";
import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiConsumes,
    ApiBody,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import {
    CurrentUser,
    JwtPayload,
} from "../../common/decorators/current-user.decorator";
import { Throttle, THROTTLE_PRESETS } from "../../common/decorators/throttle.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { PasswordService } from "../../lib/services/password.service";
import type { Express } from "express";

const AVATAR_MIME_TO_EXTENSION: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
};

// DTO for profile update
class UpdateProfileDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}

// DTO for password change
class ChangePasswordDto {
    @IsString()
    @MinLength(1)
    currentPassword!: string;

    @IsString()
    @MinLength(8)
    newPassword!: string;
}

@ApiTags("Users")
@Controller("users")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly passwordService: PasswordService,
    ) { }

    /**
     * Update user profile (self-service)
     * User can only update their own profile
     */
    @Patch(":id")
    @ApiOperation({ summary: "Update user profile (self-service)" })
    @ApiResponse({ status: 200, description: "Profile updated successfully" })
    @ApiResponse({
        status: 403,
        description: "Cannot edit other user profiles",
    })
    @ApiResponse({ status: 404, description: "User not found" })
    async updateProfile(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateProfileDto,
        @CurrentUser() currentUser: JwtPayload,
    ) {
        this.logger.log(`Update profile request for user ${id}`);

        // Check if user is updating their own profile
        if (currentUser.userId !== id) {
            throw new ForbiddenException("Cannot edit other user profiles");
        }

        try {
            const updated = await this.prisma.user.update({
                where: { id },
                data: {
                    ...(dto.name !== undefined ? { name: dto.name } : {}),
                    ...(dto.email !== undefined ? { email: dto.email } : {}),
                    ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
                    ...(dto.avatar !== undefined ? { avatar: dto.avatar } : {}),
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            // El frontend espera el usuario plano (sin wrapper)
            return updated;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === "P2002") {
                    throw new BadRequestException("Email ya existe");
                }
                if (error.code === "P2025") {
                    throw new NotFoundException("User not found");
                }
            }
            this.logger.error("Error updating profile", {
                message: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }

    /**
     * Change password (self-service)
     */
    @Post("change-password")
    @ApiOperation({ summary: "Change own password" })
    @ApiResponse({ status: 200, description: "Password changed successfully" })
    async changePassword(
        @Body() dto: ChangePasswordDto,
        @CurrentUser() currentUser: JwtPayload,
    ) {
        this.logger.log(`Password change request for user ${currentUser.userId}`);

        if (!dto.currentPassword || !dto.newPassword) {
            throw new BadRequestException("Current and new password are required");
        }

        // 1. Get user with password
        const user = await this.prisma.user.findUnique({
            where: { id: currentUser.userId },
        });

        if (!user) {
            throw new ForbiddenException("User not found");
        }

        // 2. Verify current password
        if (!user.password) {
            throw new BadRequestException("El usuario no tiene contraseña configurada. Use recuperación de contraseña.");
        }

        const isValid = await this.passwordService.compare(
            dto.currentPassword,
            user.password,
        );

        if (!isValid) {
            throw new BadRequestException("Contraseña actual incorrecta");
        }

        // 3. Validate new password strength
        const validation = this.passwordService.validate(dto.newPassword);
        if (!validation.isValid) {
            throw new BadRequestException(validation.errors.join(", "));
        }

        // 4. Hash new password
        const hashedPassword = await this.passwordService.hash(dto.newPassword);

        // 5. Update user
        await this.prisma.user.update({
            where: { id: currentUser.userId },
            data: { password: hashedPassword },
        });

        return { success: true, message: "Contraseña actualizada exitosamente" };
    }
}

/**
 * Uploads Controller - Avatar upload
 * Separate controller for file uploads with /upload prefix
 */
@ApiTags("Uploads")
@Controller("upload")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
    private readonly logger = new Logger(UploadsController.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Upload avatar image for current user
     */
    @Post("avatar")
    @ApiOperation({ summary: "Upload avatar image" })
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                file: {
                    type: "string",
                    format: "binary",
                },
            },
        },
    })
    @ApiResponse({ status: 200, description: "Avatar uploaded successfully" })
    @ApiResponse({ status: 400, description: "Invalid file or no file uploaded" })
    @Throttle(THROTTLE_PRESETS.UPLOAD)
    @UseInterceptors(
        FileInterceptor("file", {
            storage: diskStorage({
                destination: (_req, _file, cb) => {
                    const dir = "./uploads/avatars";
                    try {
                        fs.mkdirSync(dir, { recursive: true });
                    } catch {
                        // ignore mkdir race
                    }
                    cb(null, dir);
                },
                filename: (_req, file, cb) => {
                    const uniqueSuffix =
                        Date.now() + "-" + Math.round(Math.random() * 1e9);
                    const ext = AVATAR_MIME_TO_EXTENSION[file.mimetype ?? ""] ?? ".bin";
                    cb(null, `avatar-${uniqueSuffix}${ext}`);
                },
            }),
            limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
            fileFilter: (_req, file, cb) => {
                if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.mimetype)) {
                    return cb(
                        new BadRequestException("Only JPEG, PNG, WebP files are allowed"),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @CurrentUser() currentUser: JwtPayload,
    ) {
        this.logger.log(`Avatar upload request from user ${currentUser.userId}`);

        if (!file) {
            throw new BadRequestException("No file uploaded");
        }

        // Build avatar URL (ServeStaticModule expone /uploads/*)
        const url = `/uploads/avatars/${file.filename}`;

        // Update user's avatar in database
        try {
            await this.prisma.user.update({
                where: { id: currentUser.userId },
                data: { avatar: url },
            });

            // El frontend espera { url, filename, size }
            return {
                url,
                filename: file.filename,
                size: file.size,
            };
        } catch (error) {
            this.logger.error("Error saving avatar", {
                message: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
}
