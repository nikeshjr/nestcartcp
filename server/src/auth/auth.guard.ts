import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY, ROLES_KEY } from './auth.decorator';

/**
 * JWT Strategy: Configures how Passport extracts and validates JWT tokens
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultsecret',
    });
  }

  // Runs after the token is verified; attaches return value to request.user
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}

/**
 * JWT Auth Guard: Protects routes by requiring a valid JWT unless marked as @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest(err, user) {
    if (err || !user) throw err || new UnauthorizedException('Authentication required');
    return user;
  }
}

/**
 * Roles Guard: Restricts access to routes based on specific user roles (e.g., @Roles('admin'))
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return user && requiredRoles.some(role => user.role === role);
  }
}
