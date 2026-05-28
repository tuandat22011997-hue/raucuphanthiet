import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /** Đăng ký tài khoản mới */
  async register(dto: RegisterDto) {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Hash password với bcrypt (saltRounds = 12)
    const hashedPassword = await bcrypt.hash(dto.password, 12);

    // Tạo user mới
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
        role: 'CUSTOMER',
        addresses: {
          create: {
            fullName: dto.name,
            phone: dto.phone || '',
            address: dto.address,
            isDefault: true,
            label: 'Nhà riêng',
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    // Tạo JWT token ngay sau khi đăng ký
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user,
      ...tokens,
      message: 'Đăng ký thành công! Chào mừng bạn đến với Rau Củ Phan Thiết 🥬',
    };
  }

  /** Đăng nhập */
  async login(dto: LoginDto) {
    // Tìm user theo email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    // So sánh password với hash
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    const { password: _, ...userWithoutPassword } = user;

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: userWithoutPassword,
      ...tokens,
      message: 'Đăng nhập thành công!',
    };
  }

  /** Lấy lại mật khẩu */
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email, deletedAt: null },
    });

    if (!user || user.phone !== dto.phone) {
      throw new UnauthorizedException('Email hoặc số điện thoại không trùng khớp');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { message: 'Mật khẩu đã được đặt lại thành công!' };
  }

  /** Lấy thông tin profile của user đang đăng nhập */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) throw new NotFoundException('Không tìm thấy tài khoản');
    return user;
  }

  /** Tạo cặp access token + refresh token */
  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN') || '7d',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '30d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
