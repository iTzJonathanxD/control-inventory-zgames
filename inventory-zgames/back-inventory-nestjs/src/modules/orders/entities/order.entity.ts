import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Payment } from 'src/modules/payments/entities/payment.entity';
import { User } from 'src/modules/users/entities/user.entity';
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true, nullable: true })
  orderNumber: string;
  @Column()
  userId: number;
  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  taxAmount: number;
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  shippingAmount: number;
  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;
  @Column('json', { nullable: true })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  @Column('json', { nullable: true })
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  @Column('text', { nullable: true })
  notes: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];
  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}
