import { AuthService } from './auth.service';
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
    getMe(id: string): Promise<{
        user: Omit<import("./auth.service").User, "password">;
    }>;
    updateProfile(body: {
        userId: string;
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<{
        success: boolean;
        user: Omit<import("./auth.service").User, "password">;
    }>;
    getAddresses(userId: string): Promise<{
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
    }): Promise<{
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
    }): Promise<{
        success: boolean;
        address: import("./auth.service").UserAddress;
    }>;
    deleteAddress(id: string, userId: string): Promise<{
        success: boolean;
    }>;
}
