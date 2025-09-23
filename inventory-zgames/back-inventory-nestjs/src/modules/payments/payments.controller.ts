import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Request,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @Post()
  @UseInterceptors(FilesInterceptor('evidence', 5)) // Máximo 5 archivos
  create(
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFiles() evidenceFiles?: Express.Multer.File[],
  ) {
    return this.paymentsService.createWithEvidence(
      createPaymentDto,
      evidenceFiles,
    );
  }
  @Get('user')
  findUserPayments(@Request() req: any) {
    return this.paymentsService.findUserPayments(req.user.id);
  }
  @Get()
  findAll(@Query() query: any) {
    console.log('🔍 Controller - Received query params:', query);
    return this.paymentsService.findAll(query);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }
  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrder(+orderId);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }
  @Post(':id/process')
  processPayment(@Param('id') id: string) {
    return this.paymentsService.processPayment(+id);
  }
  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.paymentsService.refund(+id);
  }
  @Post(':id/reject')
  rejectPayment(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.paymentsService.rejectPayment(+id, body.reason);
  }
  @Get(':id/evidence')
  getPaymentEvidence(@Param('id') id: string) {
    return this.paymentsService.getPaymentEvidence(+id);
  }
}
