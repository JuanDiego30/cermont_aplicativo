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
  ForbiddenException,
  Inject,
  Logger,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { Response, Request } from "express";
import { randomUUID } from "crypto";
// Application - Use Cases (direct imports to avoid circular dependency)
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { RefreshTokenUseCase } from "../../application/use-cases/refresh-token.use-case";
import { LogoutUseCase } from "../../application/use-cases/logout.use-case";
import { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case";
import { LoginDto } from "../../application/dto/login.dto";
import { RegisterDto } from "../../application/dto/register.dto";
import { Public } from "../../../../common/decorators/public.decorator";
import {
  CurrentUser,
  JwtPayload,
} from "../../../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../../../common/guards/jwt-auth.guard";
import { AUTH_CONSTANTS } from "../../auth.constants";
import { ThrottleAuth } from "../../../../common/decorators/throttle.decorator";

type RequestWithCookies = Request & { cookies?: Record<string, string> };

function createRefreshCookieOptions(days: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: days * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function createCsrfCookieOptions(days: number) {
  return {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: days * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function assertCsrf(req: Request) {
  const cookieToken = (req as RequestWithCookies).cookies?.[
    AUTH_CONSTANTS.CSRF_COOKIE_NAME
  ];
  const headerToken = req.header(AUTH_CONSTANTS.CSRF_HEADER_NAME);
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new ForbiddenException("CSRF token requerido");
  }
}

@ApiTags("Auth")
@Controller("auth")
export class AuthControllerRefactored {
  private readonly logger = new Logger(AuthControllerRefactored.name);

  constructor(
    @Inject(LoginUseCase) private readonly loginUseCase: LoginUseCase,
    @Inject(RegisterUseCase) private readonly registerUseCase: RegisterUseCase,
    @Inject(RefreshTokenUseCase)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(LogoutUseCase) private readonly logoutUseCase: LogoutUseCase,
    @Inject(GetCurrentUserUseCase)
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
  ) {
    this.logger.log(
      "[AuthController] Constructor - all use cases injected successfully",
    );
  }

  @Post("login")
  @Public()
  @ThrottleAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Iniciar sesión" })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      // Regla 6: no loguear email ni secretos
      this.logger.log("Login request received");

      const context = { ip: req.ip, userAgent: req.get("user-agent") };
      const result = await this.loginUseCase.execute(dto, context);

      if ("requires2FA" in result && result.requires2FA) {
        return {
          message: result.message,
          requires2FA: true,
          expiresIn: result.expiresIn,
        };
      }

      const refreshDays = dto.rememberMe
        ? AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_REMEMBER
        : AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_DEFAULT;

      res.cookie(
        "refreshToken",
        result.refreshToken,
        createRefreshCookieOptions(refreshDays),
      );

      // Regla 5: CSRF (double submit cookie)
      const csrfToken = randomUUID();
      res.cookie(
        AUTH_CONSTANTS.CSRF_COOKIE_NAME,
        csrfToken,
        createCsrfCookieOptions(refreshDays),
      );

      return {
        message: result.message,
        token: result.token,
        csrfToken,
        user: result.user,
      };
    } catch (error) {
      // Log del error para debugging
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        this.logger.warn(`Login ${error.constructor.name}: ${error.message}`);
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Login error: ${errorMessage}`, errorStack);
      throw error;
    }
  }

  @Post("register")
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Registrar nuevo usuario" })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const context = { ip: req.ip, userAgent: req.get("user-agent") };

    const result = await this.registerUseCase.execute(dto, context);

    res.cookie(
      "refreshToken",
      result.refreshToken,
      createRefreshCookieOptions(AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_DEFAULT),
    );

    const csrfToken = randomUUID();
    res.cookie(
      AUTH_CONSTANTS.CSRF_COOKIE_NAME,
      csrfToken,
      createCsrfCookieOptions(AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_DEFAULT),
    );

    return {
      message: result.message,
      token: result.token,
      csrfToken,
      user: result.user,
    };
  }

  @Post("refresh")
  @Public()
  @ThrottleAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refrescar access token" })
  async refresh(
    @Req() req: Request,
    @Body() body: { refreshToken?: string } = {},
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      (req as RequestWithCookies).cookies?.refreshToken || body?.refreshToken;

    if ((req as RequestWithCookies).cookies?.refreshToken) {
      assertCsrf(req);
    }

    if (!refreshToken) {
      throw new BadRequestException("Refresh token requerido");
    }

    const context = { ip: req.ip, userAgent: req.get("user-agent") };
    const result = await this.refreshTokenUseCase.execute(
      refreshToken,
      context,
    );

    // RefreshTokenUseCase rota la sesión con expiración fija (default)
    res.cookie(
      "refreshToken",
      result.refreshToken,
      createRefreshCookieOptions(AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_DEFAULT),
    );

    // Rotar CSRF token junto con refresh
    const csrfToken = randomUUID();
    res.cookie(
      AUTH_CONSTANTS.CSRF_COOKIE_NAME,
      csrfToken,
      createCsrfCookieOptions(AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_DEFAULT),
    );

    return { token: result.token, csrfToken };
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Cerrar sesión" })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
    @Body() body: { refreshToken?: string } = {},
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      (req as RequestWithCookies).cookies?.refreshToken || body?.refreshToken;

    if ((req as RequestWithCookies).cookies?.refreshToken) {
      assertCsrf(req);
    }

    const result = await this.logoutUseCase.execute(
      user.userId,
      refreshToken,
      req.ip,
      user.jti,
      user.exp,
    );

    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie(AUTH_CONSTANTS.CSRF_COOKIE_NAME, { path: "/" });

    return result;
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Obtener usuario actual" })
  async me(@CurrentUser() user: JwtPayload) {
    if (!user || !user.userId) {
      throw new BadRequestException("Usuario no autenticado");
    }
    if (!this.getCurrentUserUseCase) {
      throw new BadRequestException("GetCurrentUserUseCase no está disponible");
    }
    return this.getCurrentUserUseCase.execute(user.userId);
  }
}
