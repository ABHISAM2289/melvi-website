import { CanActivate, ExecutionContext } from '@nestjs/common';
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
export declare class JwtAuthGuard implements CanActivate {
    private readonly authService;
    constructor(authService: AuthService);
    canActivate(context: ExecutionContext): boolean;
}
export declare class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
