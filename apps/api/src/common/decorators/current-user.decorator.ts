/**
 * Current User Decorator
 * Extracts authenticated user from request
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export const CurrentUser = createParamDecorator(
    (data: keyof JwtPayload | undefined, ctx: ExecutionContext): JwtPayload | any => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as JwtPayload;

        if (data) {
            return user?.[data];
        }

        return user;
    },
);
