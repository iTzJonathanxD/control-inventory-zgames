import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { OrdersService } from '../orders/orders.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { SmsService } from '../../common/services/sms.service';
import { FileUploadService } from '../../common/services/file-upload.service';
import { User } from '../users/entities/user.entity';
import { UserDebtService } from '../users/services/user-debt.service';
import { CartService } from '../cart/cart.service';
@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly ordersService: OrdersService,
    private readonly smsService: SmsService,
    private readonly fileUploadService: FileUploadService,
    private readonly userDebtService: UserDebtService,
    private readonly cartService: CartService,
  ) {}
  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const { orderId, amount } = createPaymentDto;
    const order = await this.ordersService.findOne(orderId);
    const tolerance = 0.01; // Tolerancia de 1 centavo
    if (Math.abs(amount - order.totalAmount) > tolerance) {
      throw new BadRequestException(
        `Payment amount (${amount}) does not match order total (${order.totalAmount})`,
      );
    }
    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: PaymentStatus.PENDING, // Siempre pendiente hasta que se apruebe
    });
    const savedPayment = await this.paymentRepository.save(payment);
    if (order.userId) {
      await this.cartService.clearCart(order.userId);
    }
    if (order.user?.phone) {
      await this.smsService.sendOrderConfirmation(
        order.user.phone,
        order.orderNumber,
        order.totalAmount,
      );
    }
    return savedPayment;
  }
  async createWithEvidence(
    createPaymentDto: CreatePaymentDto,
    evidenceFiles?: Express.Multer.File[],
  ): Promise<Payment> {
    const payment = await this.create(createPaymentDto);
    if (evidenceFiles && evidenceFiles.length > 0) {
      const savedImages =
        await this.fileUploadService.saveMultipleEvidenceImages(
          evidenceFiles,
          payment.id,
        );
      payment.evidenceImages = savedImages;
      await this.paymentRepository.save(payment);
    }
    return payment;
  }
  async findAll(queryParams?: any): Promise<Payment[]> {
    console.log('🔍 Service - Processing query params:', queryParams);
    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product');
    if (queryParams?.status && queryParams.status !== 'all') {
      queryBuilder.andWhere('payment.status = :status', {
        status: queryParams.status,
      });
      console.log('🔍 Applied status filter:', queryParams.status);
    }
    if (queryParams?.method && queryParams.method !== 'all') {
      queryBuilder.andWhere('payment.method = :method', {
        method: queryParams.method,
      });
      console.log('🔍 Applied method filter:', queryParams.method);
    }
    if (queryParams?.amountFrom) {
      queryBuilder.andWhere('payment.amount >= :amountFrom', {
        amountFrom: Number(queryParams.amountFrom),
      });
      console.log('🔍 Applied amountFrom filter:', queryParams.amountFrom);
    }
    if (queryParams?.amountTo) {
      queryBuilder.andWhere('payment.amount <= :amountTo', {
        amountTo: Number(queryParams.amountTo),
      });
      console.log('🔍 Applied amountTo filter:', queryParams.amountTo);
    }
    if (queryParams?.dateFrom) {
      queryBuilder.andWhere('payment.createdAt >= :dateFrom', {
        dateFrom: queryParams.dateFrom,
      });
      console.log('🔍 Applied dateFrom filter:', queryParams.dateFrom);
    }
    if (queryParams?.dateTo) {
      queryBuilder.andWhere('payment.createdAt <= :dateTo', {
        dateTo: queryParams.dateTo,
      });
      console.log('🔍 Applied dateTo filter:', queryParams.dateTo);
    }
    queryBuilder.orderBy('payment.createdAt', 'DESC');
    if (queryParams?.page && queryParams?.limit) {
      const page = parseInt(queryParams.page) || 1;
      const limit = parseInt(queryParams.limit) || 10;
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
      console.log(
        `🔍 Applied pagination: page=${page}, limit=${limit}, skip=${skip}`,
      );
    }
    const payments = await queryBuilder.getMany();
    console.log(`🔍 Service - Found ${payments.length} payments`);
    return payments;
  }
  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['order', 'order.user', 'order.items', 'order.items.product'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }
  async findByOrder(orderId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
  async findUserPayments(userId: number): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: {
        order: { userId },
      },
      relations: ['order'],
      order: { createdAt: 'DESC' },
    });
  }
  async update(
    id: number,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    this.paymentRepository.merge(payment, updatePaymentDto);
    return this.paymentRepository.save(payment);
  }
  async processPayment(id: number): Promise<Payment> {
    const payment = await this.findOne(id);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Cannot process payment with status: ${payment.status}`,
      );
    }
    payment.status = PaymentStatus.COMPLETED;
    payment.processedAt = new Date();
    const savedPayment = await this.paymentRepository.save(payment);
    if (payment.order?.userId) {
      await this.userDebtService.reduceDebt(
        payment.order.userId,
        payment.amount,
      );
      await this.cartService.clearCart(payment.order.userId);
    }
    if (payment.order?.user?.phone) {
      await this.smsService.sendPaymentConfirmation(
        payment.order.user.phone,
        payment.order.orderNumber,
      );
    }
    return savedPayment;
  }
  async rejectPayment(id: number, reason?: string): Promise<Payment> {
    const payment = await this.findOne(id);
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject payment with status: ${payment.status}`,
      );
    }
    payment.status = PaymentStatus.FAILED;
    payment.metadata = {
      ...payment.metadata,
      rejectionReason: reason || 'Payment rejected by admin',
      rejectedAt: new Date(),
    };
    const savedPayment = await this.paymentRepository.save(payment);
    if (payment.order?.user?.phone) {
      await this.smsService.sendPaymentRejected(
        payment.order.user.phone,
        payment.order.orderNumber,
      );
    }
    return savedPayment;
  }
  async refund(id: number): Promise<Payment> {
    const payment = await this.findOne(id);
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot refund payment with status: ${payment.status}`,
      );
    }
    const refundPayment = this.paymentRepository.create({
      orderId: payment.orderId,
      amount: -payment.amount, // Monto negativo para el reembolso
      method: payment.method,
      status: PaymentStatus.REFUNDED,
      transactionId: `REFUND-${payment.transactionId}`,
      metadata: {
        originalPaymentId: payment.id,
        refundReason: 'Customer request',
      },
    });
    return this.paymentRepository.save(refundPayment);
  }
  async getPaymentEvidence(id: number): Promise<{
    payment: Payment;
    evidenceUrls: string[];
  }> {
    const payment = await this.findOne(id);
    const evidenceUrls =
      payment.evidenceImages?.map((imagePath) =>
        this.fileUploadService.getFileUrl(imagePath),
      ) || [];
    return {
      payment,
      evidenceUrls,
    };
  }
}
