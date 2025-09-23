import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/modules/products/entities/products.entity';
@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  orderId: number;
  @Column()
  productId: number;
  @Column()
  quantity: number;
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;
  @Column()
  productName: string;
  @Column('json', { nullable: true })
  productSnapshot: {
    id: number;
    name: string;
    price: number;
    image?: string;
    category: string;
    sku?: string;
  };
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
