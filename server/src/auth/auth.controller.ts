import { Body, Controller, Get, Post, Put, Delete, Param, Query, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body()
    body: {
      identifier?: string;
      email?: string;
      username?: string;
      password?: string;
      role?: 'admin' | 'customer';
    }
  ) {
    const id = body.identifier || body.email || body.username || '';
    return this.authService.login(id, body.password, body.role);
  }

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      username?: string;
      email: string;
      password?: string;
      phone?: string;
      role?: 'admin' | 'customer';
    }
  ) {
    return this.authService.register(body);
  }

  @Get('me')
  async getMe(@Query('id') id: string) {
    if (!id) {
      return { user: null };
    }
    const user = await this.authService.getUser(id);
    return { user };
  }

  @Put('profile')
  async updateProfile(
    @Body()
    body: {
      userId: string;
      name?: string;
      email?: string;
      phone?: string;
    }
  ) {
    const user = await this.authService.updateProfile(body.userId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
    });
    return { success: true, user };
  }

  @Get('addresses')
  async getAddresses(@Query('userId') userId: string) {
    const addresses = await this.authService.getAddresses(userId);
    return { addresses };
  }

  @Post('addresses')
  async addAddress(
    @Body()
    body: {
      userId: string;
      label?: string;
      recipientName?: string;
      phone?: string;
      addressLine: string;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    }
  ) {
    const address = await this.authService.addAddress(body.userId, body);
    return { success: true, address };
  }

  @Put('addresses/:id')
  async updateAddress(
    @Param('id') id: string,
    @Body()
    body: {
      userId: string;
      label?: string;
      recipientName?: string;
      phone?: string;
      addressLine?: string;
      city?: string;
      state?: string;
      pincode?: string;
      isDefault?: boolean;
    }
  ) {
    const address = await this.authService.updateAddress(id, body.userId, body);
    return { success: true, address };
  }

  @Delete('addresses/:id')
  async deleteAddress(
    @Param('id') id: string,
    @Query('userId') userId: string
  ) {
    await this.authService.deleteAddress(id, userId);
    return { success: true };
  }
}
