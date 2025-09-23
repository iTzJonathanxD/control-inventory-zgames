import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { RolePermissionsService } from '../role-permissions/role-permissions.service';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolePermissionsService: RolePermissionsService,
  ) {}
  async validateUser(email: string, password: string): Promise<User> {
    try {
      console.log('🔍 Validating user with email:', email);
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        console.log('❌ User not found for email:', email);
        throw new UnauthorizedException('Usuario no encontrado');
      }
      console.log('✅ User found:', user.email);
      console.log('🔑 Attempting password validation...');
      if (!(await user.validatePassword(password))) {
        console.log('❌ Password validation failed');
        throw new UnauthorizedException('Contraseña incorrecta');
      }
      console.log('✅ Password validation successful');
      if (!user.isActive) {
        console.log('❌ User is inactive');
        throw new UnauthorizedException('Usuario inactivo');
      }
      if (user.isLocked) {
        console.log('❌ User is locked');
        throw new UnauthorizedException('Usuario bloqueado');
      }
      console.log('✅ User validation successful');
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      console.log('❌ Unexpected error during validation:', error.message);
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.roleName,
    };
    return {
      token: this.jwtService.sign(payload),
      user,
    };
  }
  async unlock(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return { user };
  }
  async getProfile(user: User): Promise<{ user: User; permissions: any[] }> {
    const foundUser = await this.usersService.findOne(user.id);
    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }
    const userRolePermissions =
      await this.rolePermissionsService.getUserRolePermissions(foundUser.id);
    const permissions = (userRolePermissions.permissions || [])
      .filter((p) => p.isActive && p.isActiveForRole)
      .map((p) => p.permissionName);
    return { user: foundUser, permissions };
  }
}
