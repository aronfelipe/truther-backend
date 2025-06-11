import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

import { User, UserStatus } from '../users/entities/user.entity';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto/auth.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, phone, avatar } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      name,
      email,
      password,
      phone,
      avatar,
    });

    try {
      const savedUser = await this.userRepository.save(user);
      
      // Generate tokens
      const tokens = await this.generateTokens(savedUser);
      
      // Save refresh token
      await this.saveRefreshToken(savedUser.id, tokens.refreshToken);

      // Emit user registered event
      this.eventEmitter.emit('user.registered', {
        userId: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
      });

      this.logger.log(`User registered successfully: ${savedUser.email}`);

      return {
        ...tokens,
        user: this.sanitizeUser(savedUser),
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw new BadRequestException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user with password
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'status', 'avatar', 'phone', 'createdAt', 'lastLoginAt', 'emailVerifiedAt'],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive()) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    user.updateLastLogin();
    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Save refresh token
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    // Emit login event
    this.eventEmitter.emit('user.login', {
      userId: user.id,
      email: user.email,
      timestamp: new Date(),
    });

    this.logger.log(`User logged in successfully: ${user.email}`);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // Find user
      const user = await this.userRepository.findOne({
        where: { 
          id: payload.sub,
          refreshToken,
        },
      });

      if (!user || !user.isActive()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);
      
      // Save new refresh token
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, {
      refreshToken: null,
      refreshTokenExpiresAt: null,
    });

    this.eventEmitter.emit('user.logout', { userId });
    this.logger.log(`User logged out: ${userId}`);
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const expiresIn = 3600; // 1 hour

    user.setResetPasswordToken(resetToken, expiresIn);
    await this.userRepository.save(user);

    // Emit forgot password event
    this.eventEmitter.emit('user.forgotPassword', {
      userId: user.id,
      email: user.email,
      resetToken,
    });

    this.logger.log(`Password reset requested for: ${email}`);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.isResetPasswordTokenValid()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.clearResetPasswordToken();
    user.clearRefreshToken();

    await this.userRepository.save(user);

    // Emit password reset event
    this.eventEmitter.emit('user.passwordReset', {
      userId: user.id,
      email: user.email,
    });

    this.logger.log(`Password reset successfully for: ${user.email}`);
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    user.clearRefreshToken();

    await this.userRepository.save(user);

    // Emit password changed event
    this.eventEmitter.emit('user.passwordChanged', {
      userId: user.id,
      email: user.email,
    });

    this.logger.log(`Password changed successfully for: ${user.email}`);
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive()) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessTokenExpiration = this.configService.get<number>('JWT_EXPIRES_IN', 3600);
    const refreshTokenExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: accessTokenExpiration,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenExpiration,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessTokenExpiration,
    };
  }

  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const refreshTokenExpiration = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800);
    
    await this.userRepository.update(userId, {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + refreshTokenExpiration * 1000),
    });
  }

  private sanitizeUser(user: User): any {
    const { password, refreshToken, refreshTokenExpiresAt, resetPasswordToken, resetPasswordExpiresAt, ...sanitizedUser } = user;
    
    return {
      ...sanitizedUser,
      isEmailVerified: user.isEmailVerified(),
    };
  }
}