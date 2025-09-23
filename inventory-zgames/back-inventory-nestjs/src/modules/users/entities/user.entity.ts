import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../../../core/base-entity';
import { Role } from '../../roles/entities/role.entity';
import { InventoryMovement } from '../../inventory-movements/entities/inventory-movement.entity';
import { Company } from 'src/modules/company/entities/company.entity';
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  username: string;
  @Column({ name: 'first_name' })
  firstName: string;
  @Column({ name: 'last_name' })
  lastName: string;
  @Column()
  @Exclude()
  password: string;
  @Column({ unique: true })
  email: string;
  @Column({ nullable: true })
  address: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  debt: number;
  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;
  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @Column({ name: 'role_id' })
  roleId: number;
  @Column({ name: 'company_id' })
  companyId: number;
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id' })
  role: Role;
  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: 'company_id' })
  company: Company;
  @Column({ name: 'profile_photo', nullable: true })
  profilePhoto: string;
  @OneToMany(() => InventoryMovement, (movement) => movement.user)
  movements: InventoryMovement[];
  @BeforeInsert()
  async hashPasswordOnInsert() {
    if (this.password) {
      console.log('🔑 Hashing password on insert:', this.password);
      this.password = await bcrypt.hash(this.password, 10);
      console.log('🔐 Password hashed successfully on insert');
    }
  }
  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password && !this.password.startsWith('$2b$')) {
      console.log('🔑 Hashing password on update:', this.password);
      this.password = await bcrypt.hash(this.password, 10);
      console.log('🔐 Password hashed successfully on update');
    }
  }
  async validatePassword(password: string): Promise<boolean> {
    console.log('🔍 Validating password...');
    console.log('🔍 Plain password:', password);
    console.log('🔍 Hashed password:', this.password);
    const isValid = await bcrypt.compare(password, this.password);
    console.log('🔍 Password validation result:', isValid);
    return isValid;
  }
}
