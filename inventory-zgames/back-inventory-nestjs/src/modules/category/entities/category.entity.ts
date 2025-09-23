import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntity } from "../../../core/base-entity"
import { Product } from "../../products/entities/products.entity"
@Entity("categories")
export class Category extends BaseEntity {
  @Column({ name: "category_name", unique: true })
  categoryName: string
  @Column({ type: "text", nullable: true })
  description: string
  @Column({ name: "is_active", default: true })
  isActive: boolean
  @OneToMany(
    () => Product,
    (product) => product.category,
  )
  products: Product[]
}
