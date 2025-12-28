/**
 * @controller AuthController (Refactorizado)
 * @description Controlador de autenticación con Clean Architecture
 * @layer Infrastructure
 */
import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
// Application - Use Cases (direct imports to avoid circular dependency)
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';
import { LoginSchema, RegisterSchema } from '../../application/dto';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthControllerRefactored {
  private readonly logger = new Logger(AuthControllerRefactored.name);

  constructor(
    @Inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @Inject(RegisterUseCase) private readonly registerUseCase: RegisterUseCase,
    @Inject(RefreshTokenUseCase) private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(LogoutUseCase) private readonly logoutUseCase: LogoutUseCase,
    @Inject(GetCurrentUserUseCase) private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {
    this.logger.log('[AuthController] Constructor - all use cases injected successfully');
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // ✅ Log del body recibido (sin password)
      const bodyPreview = { ...(body as Record<string, unknown>) };
      if (bodyPreview.password) bodyPreview.password = '***';
      this.logger.log(`Login request received: ${JSON.stringify(bodyPreview)}`);

      // Validar body con Zod
      const parseResult = LoginSchema.safeParse(body);
      if (!parseResult.success) {
        const errors = parseResult.error.issues.map(i => {
          const path = i.path.length > 0 ? i.path.join('.') : 'root';
          return `${path}: ${i.message}`;
        }).join(', ');
        this.logger.warn(`❌ Login validation failed: ${errors}`, { body: bodyPreview });
        throw new BadRequestException(`Validación fallida: ${errors}`);
      }

      const dto = parseResult.data;
      const context = { ip: req.ip, userAgent: req.get('user-agent') };

      this.logger.log(`✅ Login validation passed for: ${dto.email} | rememberMe: ${dto.rememberMe}`);
      const result = await this.loginUseCase.execute(dto, context);

      res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

      return {
        message: result.message,
        token: result.token,
        user: result.user,
      };
    } catch (error) {
      // Log del error para debugging
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        this.logger.warn(`Login ${error.constructor.name}: ${error.message}`, { body });
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Login error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  async register(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = RegisterSchema.parse(body);
    const context = { ip: req.ip, userAgent: req.get('user-agent') };

    const result = await this.registerUseCase.execute(dto, context);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    return {
      message: result.message,
      token: result.token,
      user: result.user,
    };
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar access token' })
  async refresh(
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken || body.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token requerido');
    }

    const context = { ip: req.ip, userAgent: req.get('user-agent') };
    const result = await this.refreshTokenUseCase.execute(refreshToken, context);

    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);

    return { token: result.token };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Body() body: { refreshToken?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken || body.refreshToken;

    const result = await this.logoutUseCase.execute(
      user.userId,
      refreshToken,
      req.ip,
    );

    res.clearCookie('refreshToken', { path: '/' });

    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario actual' })
  async me(@CurrentUser() user: JwtPayload) {
    if (!user || !user.userId) {
      throw new BadRequestException('Usuario no autenticado');
    }
    if (!this.getCurrentUserUseCase) {
      throw new BadRequestException('GetCurrentUserUseCase no está disponible');
    }
    return this.getCurrentUserUseCase.execute(user.userId);
  }
}
