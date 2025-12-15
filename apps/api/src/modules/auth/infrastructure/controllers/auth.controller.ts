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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import {
  LoginUseCase,
  RegisterUseCase,
  RefreshTokenUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from '../../application/use-cases';
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
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  async login(
    @Body() body: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const context = { ip: req.ip, userAgent: req.get('user-agent') };

    const loginResult = await this.loginUseCase.execute(parsed.data, context);

    res.cookie('refreshToken', loginResult.refreshToken, COOKIE_OPTIONS);

    return {
      message: loginResult.message,
      token: loginResult.token,
      user: loginResult.user,
    };
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
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const context = { ip: req.ip, userAgent: req.get('user-agent') };

    const registerResult = await this.registerUseCase.execute(parsed.data, context);

    res.cookie('refreshToken', registerResult.refreshToken, COOKIE_OPTIONS);

    return {
      message: registerResult.message,
      token: registerResult.token,
      user: registerResult.user,
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
    return this.getCurrentUserUseCase.execute(user.userId);
  }
}
