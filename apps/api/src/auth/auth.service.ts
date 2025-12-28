import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { PinoLoggerService } from '../common/logging/pino-logger.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private logger: PinoLoggerService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    try {
      const { email, password } = loginDto;

      // 1. Buscar usuario por email
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      // 2. Validar que existe el usuario
      if (!user) {
        this.logger.warn(`Login attempt failed - User not found: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // 3. Validar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Login attempt failed - Invalid password: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // 4. Validar que el usuario esté activo
      if (user.status !== 'ACTIVE') {
        this.logger.warn(`Login attempt failed - User inactive: ${email}`);
        throw new UnauthorizedException('User account is inactive');
      }

      // 5. Generar JWT token
      const token = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          expiresIn: '24h',
        },
      );

      this.logger.info(`User logged in successfully: ${email}`);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`);
      throw error;
    }
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const { email, password, name } = registerDto;

      // 1. Validar que no exista usuario con ese email
      const existingUser = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(`Registration failed - Email already exists: ${email}`);
        throw new BadRequestException('Email already registered');
      }

      // 2. Hash de la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Crear usuario
      const user = await this.prismaService.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'USER',
          status: 'ACTIVE',
        },
      });

      // 4. Generar JWT token
      const token = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        {
          expiresIn: '24h',
        },
      );

      this.logger.info(`User registered successfully: ${email}`);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`);
      throw error;
    }
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Validate user error: ${error.message}`);
      return null;
    }
  }

  async validateJwt(payload: any) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'ACTIVE') {
        return null;
      }

      return user;
    } catch (error) {
      this.logger.error(`Validate JWT error: ${error.message}`);
      return null;
    }
  }
}
