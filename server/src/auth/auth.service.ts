import { Injectable, UnauthorizedException, BadRequestException, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

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
  label: string; // 'Home' | 'Work' | 'Other'
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state?: string;
  pincode: string;
  isDefault: boolean;
  createdAt?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'melvi_jwt_secret_key_2026_haute_chocolaterie_luxury';

@Injectable()
export class AuthService {
  private inMemoryUsers: User[] = [];
  private inMemoryAddresses: UserAddress[] = [];

  constructor(@Inject(DatabaseService) private readonly db: DatabaseService) {
    // Seed default admin with hashed password
    const adminPassHash = bcrypt.hashSync('admin123', 10);
    this.inMemoryUsers.push({
      id: 'usr-admin-1',
      name: 'Melvi Master Chocolatier',
      username: 'admin',
      email: 'admin@melvi.com',
      password: adminPassHash,
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: '/images/melvi-official-logo.png',
    });

  }

  generateToken(user: Omit<User, 'password'>): string {
    return jwt.sign(
      {
        sub: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new UnauthorizedException('Session expired or invalid token. Please sign in again.');
    }
  }

  async register(data: {
    name: string;
    username?: string;
    email: string;
    password?: string;
    phone?: string;
    role?: 'admin' | 'customer';
  }): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const cleanUsername = (data.username || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '');

    if (!cleanEmail || !data.password) {
      throw new BadRequestException('Email and password are required for registration.');
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new BadRequestException('Username must be at least 3 characters (letters, numbers, underscores).');
    }

    const assignedRole = data.role || (cleanEmail.includes('admin') || cleanUsername.includes('admin') ? 'admin' : 'customer');
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Check DB
    if (this.db.isConnected) {
      try {
        const existing = await this.db.query(
          'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2',
          [cleanEmail, cleanUsername]
        );
        if (existing.rows.length > 0) {
          const row = existing.rows[0];
          if (row.email?.toLowerCase() === cleanEmail) {
            throw new BadRequestException('This email is already registered. Please sign in with your password.');
          }
          if (row.username?.toLowerCase() === cleanUsername) {
            throw new BadRequestException('This username is already taken. Please choose another username.');
          }
        }

        const newUser: User = {
          id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: data.name || cleanUsername,
          username: cleanUsername,
          email: cleanEmail,
          password: hashedPassword,
          phone: data.phone || '',
          role: assignedRole,
          avatar: '/images/melvi-official-logo.jpg',
        };

        await this.db.query(
          `INSERT INTO users (id, name, username, email, password, role, phone, avatar) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [newUser.id, newUser.name, newUser.username, newUser.email, newUser.password, newUser.role, newUser.phone, newUser.avatar]
        );

        this.inMemoryUsers.push(newUser);
        const { password, ...safeUser } = newUser;
        const token = this.generateToken(safeUser);
        return { token, user: safeUser };
      } catch (err) {
        if (err instanceof BadRequestException) throw err;
        console.warn('DB register notice, using in-memory fallback:', err.message);
      }
    }

    // In-memory fallback
    const existingMem = this.inMemoryUsers.find(
      u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername
    );
    if (existingMem) {
      throw new BadRequestException('This email or username is already registered. Please sign in.');
    }

    const newUser: User = {
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

  async login(
    identifier: string,
    password?: string,
    expectedRole?: 'admin' | 'customer'
  ): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const cleanId = (identifier || '').toLowerCase().trim();
    if (!cleanId || !password) {
      throw new BadRequestException('Please provide both your email/username and password.');
    }

    let foundUser: User | undefined;

    // Check PostgreSQL
    if (this.db.isConnected) {
      try {
        const res = await this.db.query(
          'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1',
          [cleanId]
        );
        if (res.rows.length > 0) {
          foundUser = res.rows[0];
        }
      } catch (err) {
        console.warn('DB login notice, using fallback:', err.message);
      }
    }

    if (!foundUser) {
      foundUser = this.inMemoryUsers.find(
        u => u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId
      );
    }

    if (!foundUser) {
      throw new UnauthorizedException('No account found with this email or username. Please create an account.');
    }

    if (foundUser.password) {
      const match = await bcrypt.compare(password, foundUser.password);
      if (!match) {
        throw new UnauthorizedException('Incorrect password. Please try again.');
      }
    }

    if (expectedRole && foundUser.role !== expectedRole) {
      if (expectedRole === 'admin') {
        throw new UnauthorizedException('This account does not have platform administrator privileges.');
      }
    }

    const { password: _, ...safeUser } = foundUser;
    const token = this.generateToken(safeUser);
    return { token, user: safeUser };
  }

  async getUser(id: string): Promise<Omit<User, 'password'> | undefined> {
    if (this.db.isConnected) {
      try {
        const res = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const { password, ...safe } = res.rows[0];
          return safe;
        }
      } catch (err) {
        console.warn('DB getUser notice:', err.message);
      }
    }

    const mem = this.inMemoryUsers.find(u => u.id === id);
    if (!mem) return undefined;
    const { password, ...safe } = mem;
    return safe;
  }

  // Update Customer Contact & Profile Details
  async updateProfile(userId: string, data: { name?: string; email?: string; phone?: string }): Promise<Omit<User, 'password'>> {
    if (!userId) {
      throw new BadRequestException('User ID is required to update profile.');
    }

    let updated: Omit<User, 'password'> | undefined;

    if (this.db.isConnected) {
      try {
        const res = await this.db.query(
          `UPDATE users 
           SET name = COALESCE(NULLIF($1, ''), name),
               email = COALESCE(NULLIF($2, ''), email),
               phone = COALESCE($3, phone)
           WHERE id = $4
           RETURNING id, name, username, email, role, phone, avatar`,
          [data.name?.trim(), data.email?.toLowerCase().trim(), data.phone?.trim(), userId]
        );
        if (res.rows.length > 0) {
          updated = res.rows[0];
        }
      } catch (err) {
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

  // Get User Addresses (Clean - No auto-seeded dummy data)
  async getAddresses(userId: string): Promise<UserAddress[]> {
    if (!userId) return [];

    if (this.db.isConnected) {
      try {
        const res = await this.db.query(
          `SELECT id, user_id as "userId", label, recipient_name as "recipientName", phone,
                  address_line as "addressLine", city, state, pincode, is_default as "isDefault", created_at as "createdAt"
           FROM user_addresses
           WHERE user_id = $1
           ORDER BY is_default DESC, created_at DESC`,
          [userId]
        );
        return res.rows;
      } catch (err) {
        console.warn('DB getAddresses error, fallback to memory:', err.message);
      }
    }

    return this.inMemoryAddresses.filter(a => a.userId === userId);
  }

  async addAddress(userId: string, data: Partial<UserAddress>): Promise<UserAddress> {
    if (!userId || !data.addressLine) {
      throw new BadRequestException('Address line and user ID are required.');
    }

    const newId = `addr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const isDefault = Boolean(data.isDefault);

    if (this.db.isConnected) {
      try {
        if (isDefault) {
          await this.db.query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [userId]);
        }
        await this.db.query(
          `INSERT INTO user_addresses (id, user_id, label, recipient_name, phone, address_line, city, state, pincode, is_default)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [
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
          ]
        );
      } catch (err) {
        console.warn('DB addAddress notice:', err.message);
      }
    }

    if (isDefault) {
      this.inMemoryAddresses.forEach(a => {
        if (a.userId === userId) a.isDefault = false;
      });
    }

    const created: UserAddress = {
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

  // Update an Existing Delivery Address
  async updateAddress(id: string, userId: string, data: Partial<UserAddress>): Promise<UserAddress> {
    if (!id || !userId) {
      throw new BadRequestException('Address ID and user ID are required.');
    }

    const isDefault = Boolean(data.isDefault);

    if (this.db.isConnected) {
      try {
        if (isDefault) {
          await this.db.query('UPDATE user_addresses SET is_default = false WHERE user_id = $1', [userId]);
        }
        const res = await this.db.query(
          `UPDATE user_addresses
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
                     address_line as "addressLine", city, state, pincode, is_default as "isDefault"`,
          [
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
          ]
        );
        if (res.rows.length > 0) {
          return res.rows[0];
        }
      } catch (err) {
        console.warn('DB updateAddress notice:', err.message);
      }
    }

    const idx = this.inMemoryAddresses.findIndex(a => a.id === id && a.userId === userId);
    if (idx >= 0) {
      if (isDefault) {
        this.inMemoryAddresses.forEach(a => {
          if (a.userId === userId) a.isDefault = false;
        });
      }
      this.inMemoryAddresses[idx] = {
        ...this.inMemoryAddresses[idx],
        ...data,
      };
      return this.inMemoryAddresses[idx];
    }

    throw new BadRequestException('Address not found or unauthorized.');
  }

  // Delete a Delivery Address
  async deleteAddress(id: string, userId: string): Promise<{ success: boolean }> {
    if (this.db.isConnected) {
      try {
        await this.db.query('DELETE FROM user_addresses WHERE id = $1 AND user_id = $2', [id, userId]);
      } catch (err) {
        console.warn('DB deleteAddress notice:', err.message);
      }
    }

    this.inMemoryAddresses = this.inMemoryAddresses.filter(a => !(a.id === id && a.userId === userId));
    return { success: true };
  }
}
