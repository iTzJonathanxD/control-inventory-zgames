import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { ApiResponse } from '../../common/interfaces/api-response.interface';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly responseService: ResponseService,
    private readonly rolePermissionsService: RolePermissionsService,
  ) {}
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    try {
      const user = await this.authService.login(loginDto);
      const userRolePermissions =
        await this.rolePermissionsService.getUserRolePermissions(user.user.id);
      const permissions: string[] = (userRolePermissions.permissions || [])
        .filter((p) => p.isActive && p.isActiveForRole)
        .map((p) => p.permissionName);
      return this.responseService.success(Messages.AUTH.LOGIN_SUCCESS, {
        token: user.token,
        user: user.user,
        permissions,
      });
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Public()
  @Post('unlock')
  async unlock(@Body() loginDto: LoginDto): Promise<ApiResponse<any>> {
    try {
      const result = await this.authService.unlock(loginDto);
      return this.responseService.success('Sesión desbloqueada exitosamente', {
        user: result.user,
      });
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-me-user')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: User): Promise<ApiResponse<any>> {
    try {
      const result = await this.authService.getProfile(user);
      return this.responseService.success(Messages.USER.RETRIEVED, {
        ...result.user,
        permissions: result.permissions,
      });
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('user-permissions')
  @UseGuards(JwtAuthGuard)
  async getUserPermissions(@GetUser() user: User): Promise<ApiResponse<any[]>> {
    try {
      const permissions = await this.rolePermissionsService.getUserPermissions(
        user.id,
      );
      return this.responseService.success(
        Messages.USER.PERMISSIONS_RETRIEVED,
        permissions,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('user-modules-permissions')
  @UseGuards(JwtAuthGuard)
  async getUserModulesAndPermissions(
    @GetUser() user: User,
  ): Promise<ApiResponse<any[]>> {
    try {
      const modulesAndPermissions =
        await this.rolePermissionsService.getUserModulesAndPermissions(user.id);
      return this.responseService.success(
        Messages.USER.MODULES_PERMISSIONS_RETRIEVED,
        modulesAndPermissions,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('user-role-permission')
  @UseGuards(JwtAuthGuard)
  async getUserRolePermission(
    @GetUser() user: User,
  ): Promise<ApiResponse<any>> {
    try {
      const userRolePermissions =
        await this.rolePermissionsService.getUserRolePermissions(user.id);
      return this.responseService.success(
        Messages.USER.ROLE_PERMISSIONS_RETRIEVED,
        userRolePermissions,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-role-permissions')
  @UseGuards(JwtAuthGuard)
  async getRolePermissions(@GetUser() user: User): Promise<ApiResponse<any>> {
    try {
      const userRolePermissions =
        await this.rolePermissionsService.getUserRolePermissions(user.id);
      const permissions = (userRolePermissions.permissions || [])
        .filter((p) => p.isActive && p.isActiveForRole)
        .map((p) => p.permissionName);
      return this.responseService.success(
        'Permisos del rol obtenidos',
        permissions,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
