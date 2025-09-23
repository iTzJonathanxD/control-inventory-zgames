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
@Entity('whatsapp_configs')
export class WhatsAppConfig {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'text' })
  debtMessageTemplate: string;
  @Column({ type: 'text', nullable: true })
  welcomeMessageTemplate: string;
  @Column({ type: 'text', nullable: true })
  orderConfirmationTemplate: string;
  @Column({ default: true })
  sendDebtReminders: boolean;
  @Column({ default: 7 })
  debtReminderDays: number;
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
