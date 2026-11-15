import { AuthService } from './auth.service';
import { AuthenticatedRequest } from './auth.guard';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: {
        identifier?: string;
        email?: string;
        username?: string;
        password?: string;
        role?: 'admin' | 'customer';
    }): Promise<{
        token: string;
        user: Omit<import("./auth.service").User, "password">;
    }>;
    register(body: {
        name: string;
        username?: string;
        email: string;
        password?: string;
        phone?: string;
        role?: 'admin' | 'customer';
    }): Promise<{
        token: string;
        user: Omit<import("./auth.service").User, "password">;
    }>;
    getMe(id: string, request: AuthenticatedRequest): Promise<{
        user: Omit<import("./auth.service").User, "password">;
    }>;
    updateProfile(body: {
        userId: string;
        name?: string;
        email?: string;
        phone?: string;
    }, request: AuthenticatedRequest): Promise<{
        success: boolean;
        user: Omit<import("./auth.service").User, "password">;
    }>;
    getAddresses(userId: string, request: AuthenticatedRequest): Promise<{
        addresses: import("./auth.service").UserAddress[];
    }>;
    addAddress(body: {
        userId: string;
        label?: string;
        recipientName?: string;
        phone?: string;
        addressLine: string;
        city?: string;
        state?: string;
        pincode?: string;
        isDefault?: boolean;
    }, request: AuthenticatedRequest): Promise<{
        success: boolean;
        address: import("./auth.service").UserAddress;
    }>;
    updateAddress(id: string, body: {
        userId: string;
        label?: string;
        recipientName?: string;
        phone?: string;
        addressLine?: string;
        city?: string;
        state?: string;
        pincode?: string;
        isDefault?: boolean;
    }, request: AuthenticatedRequest): Promise<{
        success: boolean;
        address: import("./auth.service").UserAddress;
    }>;
    deleteAddress(id: string, userId: string, request: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    private assertOwnAccount;
}
