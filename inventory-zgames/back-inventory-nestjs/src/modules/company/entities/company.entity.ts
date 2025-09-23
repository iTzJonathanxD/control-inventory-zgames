import { BaseEntity } from 'src/core/base-entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
@Entity()
export class Company extends BaseEntity {
  @Column()
  companyName: string;
  @Column({ nullable: true })
  description?: string;
  @Column({ default: true })
  isActive?: boolean;
  @Column({ nullable: true })
  logoUrl?: string;
  @OneToMany(() => User, (user) => user.companyId)
  users: User[];
}
