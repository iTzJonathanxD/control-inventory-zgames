import { Order } from 'src/modules/orders/entities/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  orderId: number;
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;
  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  method: PaymentMethod;
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;
  @Column({ nullable: true })
  transactionId: string;
  @Column('json', { nullable: true })
  metadata: Record<string, any>;
  @Column('simple-array', { nullable: true })
  evidenceImages: string[];
  @Column('text', { nullable: true })
  evidenceNotes: string;
  @Column({ nullable: true })
  processedAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Order, (order) => order.payments)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
