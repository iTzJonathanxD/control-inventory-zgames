import { Company } from 'src/modules/company/entities/company.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
export enum InstanceStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  OPEN = 'open',
  CLOSE = 'close',
}
@Entity('whatsapp_instances')
export class WhatsAppInstance {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  instanceName: string;
  @Column()
  instanceKey: string;
  @Column()
  phoneNumber: string;
  @Column({
    type: 'enum',
    enum: InstanceStatus,
    default: InstanceStatus.DISCONNECTED,
  })
  status: InstanceStatus;
  @Column({ default: false })
  isPrimary: boolean;
  @Column({ type: 'longtext', nullable: true })
  qrCode: string;
  @Column({ nullable: true })
  profilePictureUrl: string;
  @Column({ nullable: true })
  displayName: string;
  @Column({ type: 'json', nullable: true })
  webhookEvents: string[];
  @Column({ default: true })
  isActive: boolean;
  @Column()
  companyId: number;
  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
