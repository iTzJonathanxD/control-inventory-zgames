import { Injectable, NotFoundException } from "@nestjs/common"
import { CreateUserDto } from "./dto/create-user.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UsersRepository } from "./users.repository"
@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}
  create(createUserDto: CreateUserDto) {
    return this.usersRepository.createUser(createUserDto);
  }
  findAll(page: number, limit: number, filter: any) {
    return this.usersRepository.findAllUsers(page, limit, filter);
  }
  findOne(id: number) {
    return this.usersRepository.findUserById(id);
  }
  findByEmail(email: string) {
    return this.usersRepository.findUserByEmail(email);
  }
  update(id: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.updateUser(id, updateUserDto);
  }
  changePassword(id: number, newPassword: string) {
    return this.usersRepository.changePassword(id, newPassword);
  }
  delete(id: number) {
    return this.usersRepository.deleteUser(id);
  }
  toggleUserStatus(id: number) {
    return this.usersRepository.toggleUserStatus(id);
  }
  toggleLockStatus(id: number) {
    return this.usersRepository.toggleUserLockStatus(id);
  }
}
