import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import {
  ApiResponse,
  ApiData,
} from '../../common/interfaces/api-response.interface';
import { User } from './entities/user.entity';
import { Messages } from '../../common/constants/messages.constants';
import { ResponseService } from '../../common/services/response.service';
import { FileUploadService } from '../../common/services/file-upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly responseService: ResponseService,
    private readonly fileUploadService: FileUploadService,
  ) {}
  @Post('create')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      console.log('📝 Creating user with data:', {
        ...createUserDto,
        password: '***HIDDEN***',
      });
      console.log('🔑 Password length:', createUserDto.password?.length);
      const user = await this.usersService.create(createUserDto);
      console.log('✅ User created successfully:', user.email);
      return this.responseService.success(Messages.USER.CREATED, user);
    } catch (error) {
      console.log('❌ Error creating user:', error.message);
      return this.responseService.error(error.message, null);
    }
  }
  @Get('get-all')
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('id') id?: string,
    @Query('firstName') firstName?: string,
    @Query('lastName') lastName?: string,
    @Query('email') email?: string,
    @Query('username') username?: string,
    @Query('phone') phone?: string,
    @Query('address') address?: string,
    @Query('isActive') isActive?: string,
    @Query('isLocked') isLocked?: string,
    @Query('roleId') roleId?: string,
    @Query('companyId') companyId?: string,
    @Query('debt') debt?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ): Promise<ApiResponse<ApiData<User[]>>> {
    try {
      const filter = {
        id: id ? parseInt(id) : undefined,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email || undefined,
        phone: phone || undefined,
        username: username || undefined,
        address: address || undefined,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        isLocked: isLocked !== undefined ? isLocked === 'true' : undefined,
        roleId: roleId ? parseInt(roleId) : undefined,
        companyId: companyId ? parseInt(companyId) : undefined,
        debt: debt !== undefined ? debt === 'true' : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      const [users, total] = await this.usersService.findAll(
        page,
        limit,
        filter,
      );
      return this.responseService.successWithPagination(
        Messages.USER.LIST_RETRIEVED,
        users,
        total,
        page,
        limit,
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.findOne(id);
      return this.responseService.success(Messages.USER.RETRIEVED, user);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update-user/:id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return this.responseService.success(Messages.USER.UPDATED, user);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Patch('update-profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePhoto'))
  async updateProfile(
    @GetUser() currentUser: User,
    @Body() updateData: any,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<User>> {
    try {
      let updateUserDto = {};
      if (updateData && Object.keys(updateData).length > 0) {
        updateUserDto = updateData;
      }
      if (file) {
        const imageUrl = await this.fileUploadService.saveUserProfileImage(
          file,
          currentUser.id,
        );
        updateUserDto = { ...updateUserDto, profilePhoto: imageUrl };
      }
      const user = await this.usersService.update(
        currentUser.id,
        updateUserDto,
      );
      return this.responseService.success(Messages.USER.UPDATED, user);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.changePassword(
        changePasswordDto.id,
        changePasswordDto.newPassword,
      );
      return this.responseService.success(Messages.USER.PASSWORD_CHANGED, user);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Put('toggle-status/:id')
  async toggleUserStatus(@Param('id') id: number): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.toggleUserStatus(id);
      return this.responseService.success(Messages.USER.STATUS_TOGGLED, user);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Put('toggle-lock/:id')
  async toggleLockStatus(@Param('id') id: number): Promise<ApiResponse<User>> {
    try {
      const user = await this.usersService.toggleLockStatus(id);
      return this.responseService.success(Messages.USER.STATUS_TOGGLED, user);
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
  @Post('upload-profile-image/:id')
  @UseInterceptors(FileInterceptor('profileImage'))
  async uploadProfileImage(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ApiResponse<{ imageUrl: string }>> {
    try {
      if (!file) {
        return this.responseService.error('No file uploaded', null);
      }
      const imageUrl = await this.fileUploadService.saveUserProfileImage(
        file,
        id,
      );
      await this.usersService.update(id, { profilePhoto: imageUrl });
      return this.responseService.success(
        'Profile image uploaded successfully',
        {
          imageUrl,
        },
      );
    } catch (error) {
      return this.responseService.error(error.message, null);
    }
  }
}
