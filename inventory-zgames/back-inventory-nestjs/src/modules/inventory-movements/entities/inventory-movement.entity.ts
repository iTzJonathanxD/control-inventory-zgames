import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../../core/base-entity"
import { Product } from "../../products/entities/products.entity"
import { User } from "../../users/entities/user.entity"
export enum MovementType {
  ENTRY = "entry",
  EXIT = "exit",
  ADJUSTMENT = "adjustment",
}
@Entity("inventory_movements")
export class InventoryMovement extends BaseEntity {
  @Column({ name: "movement_type", type: "enum", enum: MovementType })
  movementType: MovementType
  @Column({ type: "int" })
  quantity: number
  @Column({ name: "previous_stock", type: "int" })
  previousStock: number
  @Column({ name: "new_stock", type: "int" })
  newStock: number
  @Column({ type: "text", nullable: true })
  reason: string
  @Column({ type: "text", nullable: true })
  provider: string
  @Column({ name: "unit_cost", type: "decimal", precision: 10, scale: 2, nullable: true })
  unitCost: number
  @Column({ name: "total_cost", type: "decimal", precision: 10, scale: 2, nullable: true })
  totalCost: number
  @Column({ name: "product_id" })
  productId: number
  @Column({ name: "user_id" })
  userId: number
  @ManyToOne(
    () => Product,
    (product) => product.movements,
  )
  @JoinColumn({ name: "product_id" })
  product: Product
  @ManyToOne(
    () => User,
    (user) => user.movements,
  )
  @JoinColumn({ name: "user_id" })
  user: User
}
