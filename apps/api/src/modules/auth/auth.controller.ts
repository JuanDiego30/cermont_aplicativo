import { Controller, Post, Get, Body, Res, Req, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login user' })
    async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(dto, req.ip, req.get('user-agent'));
        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
        return { message: 'Login exitoso', token: result.token, user: result.user };
    }

    @Post('register')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register new user' })
    async register(@Body() dto: RegisterDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.register(dto, req.ip, req.get('user-agent'));
        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
        return { message: 'Usuario registrado exitosamente', token: result.token, user: result.user };
    }

    @Post('refresh')
    @Public()
    @HttpCode(HttpStatus.OK)
    async refresh(@Req() req: Request, @Body() body: { refreshToken?: string }, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refreshToken || body.refreshToken;
        if (!refreshToken) throw new Error('Refresh token requerido');
        const result = await this.authService.refresh(refreshToken, req.ip, req.get('user-agent'));
        res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
        return { token: result.accessToken };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async logout(@Req() req: Request, @Body() body: { refreshToken?: string }, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.refreshToken || body.refreshToken;
        const accessToken = req.headers.authorization?.replace('Bearer ', '');
        await this.authService.logout(accessToken, refreshToken);
        res.clearCookie('refreshToken', { path: '/' });
        return { message: 'Sesion cerrada exitosamente' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    async me(@CurrentUser() user: JwtPayload) {
        const userData = await this.authService.findUserById(user.userId);
        if (!userData) throw new Error('Usuario no encontrado');
        return { user: { id: userData.id, email: userData.email, name: userData.name, role: userData.role, avatar: userData.avatar, phone: userData.phone } };
    }
}
