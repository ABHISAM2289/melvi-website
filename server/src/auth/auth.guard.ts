import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

export interface AuthenticatedUser {
  sub: string;
  role: 'admin' | 'customer';
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const match = authorization?.match(/^Bearer\s+(.+)$/i);

    if (!match) {
      throw new UnauthorizedException('A valid bearer token is required.');
    }

    const payload = this.authService.verifyToken(match[1]);
    if (
      typeof payload.sub !== 'string' ||
      !['admin', 'customer'].includes(payload.role)
    ) {
      throw new UnauthorizedException('The access token is invalid.');
    }

    request.user = payload as AuthenticatedUser;
    return true;
  }
}

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Administrator access is required.');
    }
    return true;
  }
}
