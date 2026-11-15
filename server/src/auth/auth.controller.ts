import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthenticatedRequest, JwtAuthGuard } from './auth.guard';

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
  @UseGuards(JwtAuthGuard)
  async getMe(@Query('id') id: string, @Req() request: AuthenticatedRequest) {
    this.assertOwnAccount(request, id);
    if (!id) {
      return { user: null };
    }
    const user = await this.authService.getUser(id);
    return { user };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Body()
    body: {
      userId: string;
      name?: string;
      email?: string;
      phone?: string;
    },
    @Req() request: AuthenticatedRequest
  ) {
    this.assertOwnAccount(request, body.userId);
    const user = await this.authService.updateProfile(body.userId, {
      name: body.name,
      email: body.email,
      phone: body.phone,
    });
    return { success: true, user };
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  async getAddresses(@Query('userId') userId: string, @Req() request: AuthenticatedRequest) {
    this.assertOwnAccount(request, userId);
    const addresses = await this.authService.getAddresses(userId);
    return { addresses };
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
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
    },
    @Req() request: AuthenticatedRequest
  ) {
    this.assertOwnAccount(request, body.userId);
    const address = await this.authService.addAddress(body.userId, body);
    return { success: true, address };
  }

  @Put('addresses/:id')
  @UseGuards(JwtAuthGuard)
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
    },
    @Req() request: AuthenticatedRequest
  ) {
    this.assertOwnAccount(request, body.userId);
    const address = await this.authService.updateAddress(id, body.userId, body);
    return { success: true, address };
  }

  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Req() request: AuthenticatedRequest
  ) {
    this.assertOwnAccount(request, userId);
    await this.authService.deleteAddress(id, userId);
    return { success: true };
  }

  private assertOwnAccount(request: AuthenticatedRequest, userId: string) {
    if (request.user.role !== 'admin' && request.user.sub !== userId) {
      throw new ForbiddenException('You can only access your own account.');
    }
  }
}
