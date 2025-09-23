import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartStatus } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';
@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly productsService: ProductsService,
  ) {}
  async getUserCart(userId: number): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId, status: CartStatus.ACTIVE },
      relations: ['items', 'items.product'],
    });
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        status: CartStatus.ACTIVE,
        totalAmount: 0,
      });
      await this.cartRepository.save(cart);
    } else {
      let needsUpdate = false;
      if (!cart.items || cart.items.length === 0) {
        if (cart.totalAmount !== 0) {
          cart.totalAmount = 0;
          needsUpdate = true;
        }
      } else {
        if (cart.totalAmount === 0) {
          console.log(
            `Cart inconsistency detected for user ${userId}: totalAmount is 0 but has ${cart.items.length} items. Cleaning...`,
          );
          await this.cartRepository.manager.transaction(async (manager) => {
            await manager.delete(CartItem, { cartId: cart.id });
          });
          cart.items = [];
          needsUpdate = true;
        }
      }
      if (needsUpdate) {
        await this.cartRepository.save(cart);
      }
    }
    return cart;
  }
  async addToCart(userId: number, addToCartDto: AddToCartDto): Promise<Cart> {
    const { productId, quantity } = addToCartDto;
    const product = await this.productsService.findOne(productId);
    const cart = await this.getUserCart(userId);
    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, productId },
    });
    const totalQuantityInCart = cartItem
      ? cartItem.quantity + quantity
      : quantity;
    if (product.stockCurrent < totalQuantityInCart) {
      throw new BadRequestException(
        `Stock insuficiente. Stock disponible: ${product.stockCurrent}, cantidad en carrito: ${cartItem?.quantity || 0}`,
      );
    }
    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.totalPrice = cartItem.quantity * product.unitPrice;
      await this.cartItemRepository.save(cartItem);
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        productId,
        quantity,
        unitPrice: product.unitPrice,
        totalPrice: quantity * product.unitPrice,
      });
      await this.cartItemRepository.save(cartItem);
    }
    await this.updateCartTotal(cart.id);
    return this.getUserCart(userId);
  }
  async updateCartItem(
    userId: number,
    itemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    const cart = await this.getUserCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
      relations: ['product'],
    });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }
    if (updateCartItemDto.quantity) {
      if (updateCartItemDto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }
      if (cartItem.product.stockCurrent < updateCartItemDto.quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Stock disponible: ${cartItem.product.stockCurrent}`,
        );
      }
      cartItem.quantity = updateCartItemDto.quantity;
      cartItem.totalPrice = cartItem.quantity * cartItem.unitPrice;
      await this.cartItemRepository.save(cartItem);
    }
    await this.updateCartTotal(cart.id);
    return this.getUserCart(userId);
  }
  async removeCartItem(userId: number, itemId: number): Promise<Cart> {
    const cart = await this.getUserCart(userId);
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cartId: cart.id },
    });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found`);
    }
    await this.cartItemRepository.remove(cartItem);
    await this.updateCartTotal(cart.id);
    return this.getUserCart(userId);
  }
  async clearCart(userId: number): Promise<Cart> {
    return this.cartRepository.manager.transaction(async (manager) => {
      const cart = await manager.findOne(Cart, {
        where: { userId, status: CartStatus.ACTIVE },
      });
      if (!cart) {
        throw new NotFoundException('Cart not found');
      }
      await manager.delete(CartItem, { cartId: cart.id });
      await manager.update(Cart, cart.id, { totalAmount: 0 });
      const clearedCart = await manager.findOne(Cart, {
        where: { id: cart.id },
        relations: ['items', 'items.product'],
      });
      if (clearedCart) {
        clearedCart.items = [];
        clearedCart.totalAmount = 0;
      }
      return clearedCart || cart;
    });
  }
  async fixCartInconsistencies(userId: number): Promise<Cart> {
    const cart = await this.getUserCart(userId);
    if (cart.totalAmount === 0 && cart.items && cart.items.length > 0) {
      console.log(
        `Fixing cart inconsistency for user ${userId}: totalAmount is 0 but has ${cart.items.length} items`,
      );
      return this.clearCart(userId);
    }
    return cart;
  }
  private async updateCartTotal(cartId: number): Promise<void> {
    const result = await this.cartItemRepository
      .createQueryBuilder('cartItem')
      .select('SUM(cartItem.totalPrice)', 'total')
      .where('cartItem.cartId = :cartId', { cartId })
      .getRawOne();
    const totalAmount = result.total || 0;
    await this.cartRepository.update(cartId, { totalAmount });
  }
}
