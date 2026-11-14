import { DatabaseService } from '../database/database.service';
export interface User {
    id: string;
    name: string;
    username: string;
    email: string;
    password?: string;
    role: 'admin' | 'customer';
    avatar?: string;
    phone?: string;
}
export interface UserAddress {
    id: string;
    userId: string;
    label: string;
    recipientName: string;
    phone: string;
    addressLine: string;
    city: string;
    state?: string;
    pincode: string;
    isDefault: boolean;
    createdAt?: string;
}
export declare class AuthService {
    private readonly db;
    private inMemoryUsers;
    private inMemoryAddresses;
    constructor(db: DatabaseService);
    generateToken(user: Omit<User, 'password'>): string;
    verifyToken(token: string): any;
    register(data: {
        name: string;
        username?: string;
        email: string;
        password?: string;
        phone?: string;
        role?: 'admin' | 'customer';
    }): Promise<{
        token: string;
        user: Omit<User, 'password'>;
    }>;
    login(identifier: string, password?: string, expectedRole?: 'admin' | 'customer'): Promise<{
        token: string;
        user: Omit<User, 'password'>;
    }>;
    getUser(id: string): Promise<Omit<User, 'password'> | undefined>;
    updateProfile(userId: string, data: {
        name?: string;
        email?: string;
        phone?: string;
    }): Promise<Omit<User, 'password'>>;
    getAddresses(userId: string): Promise<UserAddress[]>;
    addAddress(userId: string, data: Partial<UserAddress>): Promise<UserAddress>;
    updateAddress(id: string, userId: string, data: Partial<UserAddress>): Promise<UserAddress>;
    deleteAddress(id: string, userId: string): Promise<{
        success: boolean;
    }>;
}
