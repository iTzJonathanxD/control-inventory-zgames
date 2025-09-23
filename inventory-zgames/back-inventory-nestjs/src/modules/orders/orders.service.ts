import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from '../users/entities/user.entity';
import { ProductsService } from '../products/products.service';
import { UserDebtService } from '../users/services/user-debt.service';
import { InventoryMovementsService } from '../inventory-movements/inventory-movements.service';
import { MovementType } from '../inventory-movements/entities/inventory-movement.entity';
@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cartService: CartService,
    @Inject(forwardRef(() => ProductsService))
    private readonly productsService: ProductsService,
    private readonly userDebtService: UserDebtService,
    @Inject(forwardRef(() => InventoryMovementsService))
    private readonly inventoryMovementsService: InventoryMovementsService,
  ) {}
  async createFromCart(
    userId: number,
    createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    const cart = await this.cartService.getUserCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create order from empty cart');
    }
    const order = this.orderRepository.create({
      userId,
      subtotal: cart.totalAmount,
      totalAmount: cart.totalAmount, // Inicialmente igual al subtotal
      status: OrderStatus.PENDING,
      ...createOrderDto,
    });
    let savedOrder = await this.orderRepository.save(order);
    savedOrder.orderNumber = `ORD-${savedOrder.id.toString().padStart(6, '0')}`;
    savedOrder = await this.orderRepository.save(savedOrder);
    const orderItems = await Promise.all(
      cart.items.map(async (cartItem) => {
        const product = await this.productsService.findOne(cartItem.productId);
        if (product.stockCurrent < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product: ${product.productName}`,
          );
        }
        await this.productsService.update(product.id, {
          stockCurrent: product.stockCurrent - cartItem.quantity,
        });
        try {
          await this.inventoryMovementsService.create(
            {
              movementType: MovementType.EXIT,
              quantity: cartItem.quantity,
              productId: product.id,
              reason: `Venta - Orden ${savedOrder.orderNumber}`,
              unitCost: product.unitPrice, // Usar el precio unitario del producto como referencia
            },
            userId,
          );
        } catch (error) {
          console.error(
            `Error creating inventory movement for product ${product.id}:`,
            error,
          );
        }
        const orderItem = this.orderItemRepository.create({
          orderId: savedOrder.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          unitPrice: cartItem.unitPrice,
          totalPrice: cartItem.totalPrice,
          productName: product.productName,
          productSnapshot: {
            id: product.id,
            name: product.productName,
            price: product.unitPrice,
            image: product.image,
            category: product.category.categoryName,
          },
        });
        return this.orderItemRepository.save(orderItem);
      }),
    );
    await this.userDebtService.addDebt(userId, savedOrder.totalAmount);
    return this.findOne(savedOrder.id);
  }
  async findAll(userId?: number): Promise<Order[]> {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    queryBuilder
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.payments', 'payments');
    if (userId) {
      queryBuilder.where('order.userId = :userId', { userId });
    }
    queryBuilder.orderBy('order.createdAt', 'DESC');
    return queryBuilder.getMany();
  }
  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'payments'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
  async findByUser(userId: number): Promise<Order[]> {
    return this.findAll(userId);
  }
  async updateStatus(
    id: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.status = updateOrderStatusDto.status;
    return this.orderRepository.save(order);
  }
  async cancel(id: number): Promise<Order> {
    const order = await this.findOne(id);
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }
    await Promise.all(
      order.items.map(async (item) => {
        const product = await this.productsService.findOne(item.productId);
        await this.productsService.update(product.id, {
          stockCurrent: product.stockCurrent + item.quantity,
        });
        try {
          await this.inventoryMovementsService.create(
            {
              movementType: MovementType.ENTRY,
              quantity: item.quantity,
              productId: product.id,
              reason: `Cancelación de orden - ${order.orderNumber}`,
              unitCost: item.unitPrice,
            },
            order.userId, // Usar el userId de la orden
          );
        } catch (error) {
          console.error(
            `Error creating inventory movement for cancelled order item ${item.id}:`,
            error,
          );
        }
      }),
    );
    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }
}
