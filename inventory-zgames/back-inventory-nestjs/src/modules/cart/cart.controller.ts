import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}
  @Get()
  getUserCart(@Request() req) {
    return this.cartService.getUserCart(req.user.id);
  }
  @Post('add')
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }
  @Patch('items/:id')
  updateCartItem(
    @Request() req,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, +id, updateCartItemDto);
  }
  @Delete('items/:id')
  removeCartItem(@Request() req, @Param('id') id: string) {
    return this.cartService.removeCartItem(req.user.id, +id);
  }
  @Delete('clear')
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.id);
  }
  @Post('fix-inconsistencies')
  fixCartInconsistencies(@Request() req) {
    return this.cartService.fixCartInconsistencies(req.user.id);
  }
}
