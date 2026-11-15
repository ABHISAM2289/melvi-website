"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let AuthService = class AuthService {
    constructor(db) {
        this.db = db;
        this.inMemoryUsers = [];
        this.inMemoryAddresses = [];
        const configuredSecret = process.env.JWT_SECRET;
        if (process.env.NODE_ENV === 'production' && (!configuredSecret || configuredSecret.length < 32)) {
            throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
        }
        this.jwtSecret = configuredSecret || 'local-development-only-jwt-secret';
    }
    generateToken(user) {
        return jwt.sign({
            sub: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
        }, this.jwtSecret, { expiresIn: '7d' });
    }
    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        }
        catch {
            throw new common_1.UnauthorizedException('Session expired or invalid token. Please sign in again.');
        }
    }
    async register(data) {
        const cleanEmail = (data.email || '').toLowerCase().trim();
        const cleanUsername = (data.username || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
        if (!cleanEmail || !data.password) {
            throw new common_1.BadRequestException('Email and password are required for registration.');
        }
        if (!cleanUsername || cleanUsername.length < 3) {
            throw new common_1.BadRequestException('Username must be at least 3 characters (letters, numbers, underscores).');
        }
        const assignedRole = 'customer';
        const hashedPassword = await bcrypt.hash(data.password, 10);
        if (this.db.isConnected) {
            try {
                const existing = await this.db.query('SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2', [cleanEmail, cleanUsername]);
                if (existing.rows.length > 0) {
                    const row = existing.rows[0];
                    if (row.email?.toLowerCase() === cleanEmail) {
                        throw new common_1.BadRequestException('This email is already registered. Please sign in with your password.');
                    }
                    if (row.username?.toLowerCase() === cleanUsername) {
                        throw new common_1.BadRequestException('This username is already taken. Please choose another username.');
                    }
                }
                const newUser = {
                    id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    name: data.name || cleanUsername,
                    username: cleanUsername,
                    email: cleanEmail,
                    password: hashedPassword,
                    phone: data.phone || '',
                    role: assignedRole,
                    avatar: '/images/melvi-official-logo.jpg',
                };
                await this.db.query(`INSERT INTO users (id, name, username, email, password, role, phone, avatar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [newUser.id, newUser.name, newUser.username, newUser.email, newUser.password, newUser.role, newUser.phone, newUser.avatar]);
                this.inMemoryUsers.push(newUser);
                const { password, ...safeUser } = newUser;
                const token = this.generateToken(safeUser);
                return { token, user: safeUser };
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException)
                    throw err;
                console.warn('DB register notice, using in-memory fallback:', err.message);
            }
        }
        const existingMem = this.inMemoryUsers.find(u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername);
        if (existingMem) {
            throw new common_1.BadRequestException('This email or username is already registered. Please sign in.');
        }
        const newUser = {
            id: `usr-${Date.now()}`,
            name: data.name || cleanUsername,
            username: cleanUsername,
            email: cleanEmail,
            password: hashedPassword,
            phone: data.phone || '',
            role: assignedRole,
            avatar: '/images/melvi-official-logo.jpg',
        };
        this.inMemoryUsers.push(newUser);
        const { password, ...safeUser } = newUser;
        const token = this.generateToken(safeUser);
        return { token, user: safeUser };
    }
    async login(identifier, password, expectedRole) {
        const cleanId = (identifier || '').toLowerCase().trim();
        if (!cleanId || !password) {
            throw new common_1.BadRequestException('Please provide both your email/username and password.');
        }
        let foundUser;
        if (this.db.isConnected) {
            try {
                const res = await this.db.query('SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1', [cleanId]);
                if (res.rows.length > 0) {
                    foundUser = res.rows[0];
                }
            }
            catch (err) {
                console.warn('DB login notice, using fallback:', err.message);
            }
        }
        if (!foundUser) {
            foundUser = this.inMemoryUsers.find(u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId);
        }
        if (!foundUser) {
            throw new common_1.UnauthorizedException('No account found with this email or username. Please create an account.');
        }
        if (foundUser.password) {
            const match = await bcrypt.compare(password, foundUser.password);
            if (!match) {
                throw new common_1.UnauthorizedException('Incorrect password. Please try again.');
            }
        }
        if (expectedRole && foundUser.role !== expectedRole) {
            throw new common_1.UnauthorizedException(expectedRole === 'admin'
                ? 'This account does not have platform administrator privileges.'
                : 'Please sign in with a customer account.');
        }
        const { password: _, ...safeUser } = foundUser;
        const token = this.generateToken(safeUser);
        return { token, user: safeUser };
    }
    async getUser(id) {
        if (this.db.isConnected) {
            try {
                const res = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
                if (res.rows.length > 0) {
                    const { password, ...safe } = res.rows[0];
                    return safe;
                }
            }
            catch (err) {
                console.warn('DB getUser notice:', err.message);
            }
        }
        const mem = this.inMemoryUsers.find(u => u.id === id);
        if (!mem)
            return undefined;
        const { password, ...safe } = mem;
        return safe;
    }
    async updateProfile(userId, data) {
        if (!userId) {
            throw new common_1.BadRequestException('User ID is required to update profile.');
        }
        let updated;
        if (this.db.isConnected) {
            try {
                const res = await this.db.query(`UPDATE users 
           SET name = COALESCE(NULLIF($1, ''), name),
               email = COALESCE(NULLIF($2, ''), email),
               phone = COALESCE($3, phone)
           WHERE id = $4
           RETURNING id, name, username, email, role, phone, avatar`, [data.name?.trim(), data.email?.toLowerCase().trim(), data.phone?.trim(), userId]);
                if (res.rows.length > 0) {
                    updated = res.rows[0];
                }
            }
            catch (err) {
                console.warn('DB updateProfile error, fallback to memory:', err.message);
            }
        }
        const memIdx = this.inMemoryUsers.findIndex(u => u.id === userId);
        if (memIdx >= 0) {
            const u = this.inMemoryUsers[memIdx];
            this.inMemoryUsers[memIdx] = {
                ...u,
                name: data.name?.trim() || u.name,
                email: data.email?.toLowerCase().trim() || u.email,
                phone: data.phone !== undefined ? data.phone.trim() : u.phone,
            };
            if (!updated) {
                const { password, ...safe } = this.inMemoryUsers[memIdx];
                updated = safe;
            }
        }
        if (!updated) {
            updated = {
                id: userId,
                name: data.name || 'Melvi Connoisseur',
                username: data.email ? data.email.split('@')[0] : 'user',
                email: data.email || 'customer@melvi.com',
                role: 'customer',
                phone: data.phone || '',
                avatar: '/images/melvi-official-logo.jpg',
            };
        }
        return updated;
    }
    async getAddresses(userId) {
        if (!userId)
            return [];
        if (this.db.isConnected) {
            try {
                const res = await this.db.query(`SELECT id, user_id as "userId", label, recipient_name as "recipientName", phone,
                  address_line as "addressLine", city, state, pincode, is_default as "isDefault", created_at as "createdAt"
           FROM user_addresses
           WHERE user_id = $1
           ORDER BY is_default DESC, created_at DESC`, [userId]);
                return res.rows;
            }
            catch (err) {
                console.warn('DB getAddresses error, fallback to memory:', err.message);
            }
        }
        return this.inMemoryAddresses.filter(a => a.userId === userId);
    }
    async addAddress(userId, data) {
        if (!userId || !data.addressLine) {
            throw new common_1.BadRequestException('Address line and user ID are required.');
        }
        const newId = `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const isDefault = Boolean(data.isDefault);
        if (this.db.isConnected) {
            try {
                if (isDefault) {
                    await this.db.query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [userId]);
                }
                await this.db.query(`INSERT INTO user_addresses (id, user_id, label, recipient_name, phone, address_line, city, state, pincode, is_default)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [
                    newId,
                    userId,
                    data.label || 'Home',
                    data.recipientName || '',
                    data.phone || '',
                    data.addressLine.trim(),
                    data.city?.trim() || 'Mumbai',
                    data.state?.trim() || 'Maharashtra',
                    data.pincode?.trim() || '400050',
                    isDefault,
                ]);
            }
            catch (err) {
                console.warn('DB addAddress notice:', err.message);
            }
        }
        if (isDefault) {
            this.inMemoryAddresses.forEach(a => {
                if (a.userId === userId)
                    a.isDefault = false;
            });
        }
        const created = {
            id: newId,
            userId,
            label: data.label || 'Home',
            recipientName: data.recipientName || '',
            phone: data.phone || '',
            addressLine: data.addressLine.trim(),
            city: data.city?.trim() || 'Mumbai',
            state: data.state?.trim() || 'Maharashtra',
            pincode: data.pincode?.trim() || '400050',
            isDefault,
            createdAt: new Date().toISOString(),
        };
        this.inMemoryAddresses.unshift(created);
        return created;
    }
    async updateAddress(id, userId, data) {
        if (!id || !userId) {
            throw new common_1.BadRequestException('Address ID and user ID are required.');
        }
        const isDefault = Boolean(data.isDefault);
        if (this.db.isConnected) {
            try {
                if (isDefault) {
                    await this.db.query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [userId]);
                }
                const res = await this.db.query(`UPDATE user_addresses
           SET label = COALESCE($1, label),
               recipient_name = COALESCE($2, recipient_name),
               phone = COALESCE($3, phone),
               address_line = COALESCE($4, address_line),
               city = COALESCE($5, city),
               state = COALESCE($6, state),
               pincode = COALESCE($7, pincode),
               is_default = COALESCE($8, is_default),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $9 AND user_id = $10
           RETURNING id, user_id as "userId", label, recipient_name as "recipientName", phone, 
                     address_line as "addressLine", city, state, pincode, is_default as "isDefault"`, [
                    data.label,
                    data.recipientName,
                    data.phone,
                    data.addressLine,
                    data.city,
                    data.state,
                    data.pincode,
                    data.isDefault,
                    id,
                    userId,
                ]);
                if (res.rows.length > 0) {
                    return res.rows[0];
                }
            }
            catch (err) {
                console.warn('DB updateAddress notice:', err.message);
            }
        }
        const idx = this.inMemoryAddresses.findIndex(a => a.id === id && a.userId === userId);
        if (idx >= 0) {
            if (isDefault) {
                this.inMemoryAddresses.forEach(a => {
                    if (a.userId === userId)
                        a.isDefault = false;
                });
            }
            this.inMemoryAddresses[idx] = {
                ...this.inMemoryAddresses[idx],
                ...data,
            };
            return this.inMemoryAddresses[idx];
        }
        throw new common_1.BadRequestException('Address not found or unauthorized.');
    }
    async deleteAddress(id, userId) {
        if (this.db.isConnected) {
            try {
                await this.db.query('DELETE FROM user_addresses WHERE id = $1 AND user_id = $2', [id, userId]);
            }
            catch (err) {
                console.warn('DB deleteAddress notice:', err.message);
            }
        }
        this.inMemoryAddresses = this.inMemoryAddresses.filter(a => !(a.id === id && a.userId === userId));
        return { success: true };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(database_service_1.DatabaseService)),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map