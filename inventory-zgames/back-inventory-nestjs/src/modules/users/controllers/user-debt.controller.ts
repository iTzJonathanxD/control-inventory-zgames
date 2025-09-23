import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UserDebtService } from '../services/user-debt.service';
@Controller('users/debt')
export class UserDebtController {
  constructor(private readonly userDebtService: UserDebtService) {}
  @Get(':id')
  async getUserDebt(@Param('id') id: string) {
    const debt = await this.userDebtService.getUserDebt(+id);
    return { userId: +id, debt };
  }
  @Get()
  async getUsersWithDebt() {
    return this.userDebtService.getUsersWithDebt();
  }
  @Post(':id/add')
  async addDebt(
    @Param('id') id: string,
    @Body() body: { amount: number; reason?: string },
  ) {
    const user = await this.userDebtService.addDebt(+id, body.amount);
    return {
      message: 'Debt added successfully',
      userId: +id,
      newDebt: user.debt,
      reason: body.reason,
    };
  }
  @Post(':id/reduce')
  async reduceDebt(
    @Param('id') id: string,
    @Body() body: { amount: number; reason?: string },
  ) {
    const user = await this.userDebtService.reduceDebt(+id, body.amount);
    return {
      message: 'Debt reduced successfully',
      userId: +id,
      newDebt: user.debt,
      reason: body.reason,
    };
  }
  @Patch(':id/clear')
  async clearDebt(@Param('id') id: string) {
    const user = await this.userDebtService.clearDebt(+id);
    return {
      message: 'Debt cleared successfully',
      userId: +id,
      debt: user.debt,
    };
  }
}
