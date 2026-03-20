import { Injectable, UnauthorizedException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) { }

  async register(username: string, email: string, password: string) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await this.prisma.user.create({
        data: { username, email, password: hashedPassword },
      });
      return { id: user.id, username: user.username, email: user.email, role: user.role };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Username or Email already exists');
        }
      }
      console.error('Registration error details:', error);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(username: string, password: string) {
    // Allows login with either username or email
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    });
    if (!user){
      throw new UnauthorizedException('Account not registered');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, username: user.username, role: user.role };
    return { 
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    };
  }
}