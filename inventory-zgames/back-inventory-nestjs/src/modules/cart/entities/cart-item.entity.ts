import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from 'src/modules/products/entities/products.entity';
@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  cartId: number;
  @Column()
  productId: number;
  @Column()
  quantity: number;
  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => Cart, (cart) => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cartId' })
  cart: Cart;
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;
}
