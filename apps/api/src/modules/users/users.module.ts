/**
 * @module UsersModule
 * @description User profile management endpoints (self-service)
 *
 * Endpoints:
 * - PATCH /users/:id - Update own profile
 * - POST /upload/avatar - Upload avatar image
 *
 * NOTE: Admin user management is in AdminModule (/admin/users/*)
 */
import { Module } from "@nestjs/common";
import { UsersController, UploadsController } from "./users.controller";
import { PrismaModule } from "../../prisma/prisma.module";
import { PasswordService } from "../../lib/services/password.service";

@Module({
    imports: [PrismaModule],
    controllers: [UsersController, UploadsController],
    providers: [PasswordService],
    exports: [],
})
export class UsersModule { }
