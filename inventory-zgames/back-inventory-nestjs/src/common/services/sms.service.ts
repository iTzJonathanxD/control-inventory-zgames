import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {}

  async sendOrderConfirmation(
    phoneNumber: string,
    orderNumber: string,
    totalAmount: number,
  ): Promise<boolean> {
    try {
      const message = `¡Gracias por tu compra! Tu orden ${orderNumber} por $${totalAmount} ha sido recibida y está siendo procesada. Te notificaremos cuando esté lista.`;

      // Aquí integrarías con un proveedor de SMS como Twilio, AWS SNS, etc.
      // Por ahora simularemos el envío
      this.logger.log(`SMS enviado a ${phoneNumber}: ${message}`);

      // Simulación de envío exitoso
      return true;
    } catch (error) {
      this.logger.error(`Error enviando SMS a ${phoneNumber}:`, error);
      return false;
    }
  }

  async sendPaymentConfirmation(
    phoneNumber: string,
    orderNumber: string,
  ): Promise<boolean> {
    try {
      const message = `Tu pago para la orden ${orderNumber} ha sido confirmado. ¡Gracias por tu compra!`;

      this.logger.log(`SMS enviado a ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando SMS a ${phoneNumber}:`, error);
      return false;
    }
  }

  async sendPaymentRejected(
    phoneNumber: string,
    orderNumber: string,
  ): Promise<boolean> {
    try {
      const message = `Tu pago para la orden ${orderNumber} ha sido rechazado. Por favor, contacta con soporte.`;

      this.logger.log(`SMS enviado a ${phoneNumber}: ${message}`);
      return true;
    } catch (error) {
      this.logger.error(`Error enviando SMS a ${phoneNumber}:`, error);
      return false;
    }
  }
}
