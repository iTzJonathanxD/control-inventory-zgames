import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../core/base-entity';
import { Category } from '../../category/entities/category.entity';
import { InventoryMovement } from '../../inventory-movements/entities/inventory-movement.entity';
import { User } from '../../users/entities/user.entity';
@Entity('products')
export class Product extends BaseEntity {
  @Column({ name: 'product_name' })
  productName: string;
  @Column({ name: 'code_name', unique: true })
  codeName: string;
  @Column({ type: 'text' })
  description: string;
  @Column({ name: 'stock_min', type: 'int' })
  stockMin: number;
  @Column({ name: 'stock_current', type: 'int' })
  stockCurrent: number;
  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  unitPrice: number;
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
  @Column({ nullable: true })
  image: string;
  @Column('decimal', { precision: 2, scale: 1, nullable: true })
  rating: number;
  @Column('decimal', { precision: 8, scale: 2, nullable: true })
  weight: number;
  @Column('json', { nullable: true })
  specifications: Record<string, any>;
  @Column({ name: 'created_by_id', nullable: true })
  createdById: number;
  @Column({ name: 'category_id' })
  categoryId: number;
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;
  @OneToMany(() => InventoryMovement, (movement) => movement.product)
  movements: InventoryMovement[];
}
