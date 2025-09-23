import { Request, Response } from 'express';
import { DebtMessageService, DebtOrder } from '@api/services/debt-message.service';
import { WAMonitoringService } from '@api/services/monitor.service';
import { Logger } from '@config/logger.config';

export class DebtController {
  constructor(
    private readonly waMonitor: WAMonitoringService,
    private readonly debtService: DebtMessageService = new DebtMessageService(),
  ) {}

  private logger = new Logger(DebtController.name);

  /**
   * Envía un mensaje de deuda detallado
   */
  public async sendDebtMessage(req: Request, res: Response) {
    try {
      const { instanceName, customerPhone } = req.params;
      const debtOrder: DebtOrder = req.body;

      this.logger.log(`Enviando mensaje de deuda a ${customerPhone} desde instancia ${instanceName}`);

      // Generar el mensaje
      const message = this.debtService.generateDebtMessage(debtOrder);

      // Obtener la instancia de WhatsApp
      const instance = this.waMonitor.waInstances[instanceName];

      if (!instance) {
        return res.status(404).json({
          error: 'Instance not found',
          message: `La instancia ${instanceName} no existe o no está activa`,
        });
      }

      // Enviar el mensaje
      const result = await instance.textMessage({
        number: customerPhone,
        text: message,
      });

      return res.status(200).json({
        success: true,
        message: 'Mensaje de deuda enviado exitosamente',
        data: {
          orderId: debtOrder.orderId,
          customerPhone,
          messageId: result.key.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error('Error enviando mensaje de deuda:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }

  /**
   * Envía un recordatorio de deuda
   */
  public async sendDebtReminder(req: Request, res: Response) {
    try {
      const { instanceName, customerPhone } = req.params;
      const debtOrder: DebtOrder = req.body;

      this.logger.log(`Enviando recordatorio de deuda a ${customerPhone}`);

      // Generar el mensaje de recordatorio
      const message = this.debtService.generateReminderMessage(debtOrder);

      // Obtener la instancia de WhatsApp
      const instance = this.waMonitor.waInstances[instanceName];

      if (!instance) {
        return res.status(404).json({
          error: 'Instance not found',
          message: `La instancia ${instanceName} no existe o no está activa`,
        });
      }

      // Enviar el mensaje
      const result = await instance.textMessage({
        number: customerPhone,
        text: message,
      });

      return res.status(200).json({
        success: true,
        message: 'Recordatorio de deuda enviado exitosamente',
        data: {
          orderId: debtOrder.orderId,
          customerPhone,
          messageId: result.key.id,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      this.logger.error('Error enviando recordatorio de deuda:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }

  /**
   * Obtiene el formato esperado para una orden de deuda
   */
  public getDebtOrderSchema(req: Request, res: Response) {
    const schema = {
      orderId: 'string - ID único de la orden',
      customerName: 'string - Nombre del cliente',
      customerPhone: 'string - Teléfono del cliente (ej: 1234567890)',
      items: [
        {
          name: 'string - Nombre del producto',
          quantity: 'number - Cantidad comprada',
          price: 'number - Precio unitario',
          total: 'number - Total del item (quantity * price)',
        },
      ],
      totalAmount: 'number - Monto total de la deuda',
      dueDate: 'string - Fecha de vencimiento (ej: 2025-08-20)',
      status: "string - Estado: 'pending' | 'overdue' | 'paid'",
    };

    const example = {
      orderId: 'ORD-2025-001',
      customerName: 'Juan Pérez',
      customerPhone: '1234567890',
      items: [
        {
          name: 'Laptop HP Pavilion',
          quantity: 1,
          price: 750.0,
          total: 750.0,
        },
        {
          name: 'Mouse Inalámbrico',
          quantity: 2,
          price: 25.5,
          total: 51.0,
        },
      ],
      totalAmount: 801.0,
      dueDate: '2025-08-25',
      status: 'pending',
    };

    return res.status(200).json({
      message: 'Esquema para crear mensajes de deuda',
      schema,
      example,
    });
  }

  /**
   * Envía múltiples recordatorios de deuda
   */
  public async sendBulkDebtReminders(req: Request, res: Response) {
    try {
      const { instanceName } = req.params;
      const { orders }: { orders: DebtOrder[] } = req.body;

      this.logger.log(`Enviando ${orders.length} recordatorios de deuda masivos`);

      const instance = this.waMonitor.waInstances[instanceName];

      if (!instance) {
        return res.status(404).json({
          error: 'Instance not found',
          message: `La instancia ${instanceName} no existe o no está activa`,
        });
      }

      const results = [];
      const errors = [];

      for (const order of orders) {
        try {
          const message = this.debtService.generateReminderMessage(order);

          const result = await instance.textMessage({
            number: order.customerPhone,
            text: message,
          });

          results.push({
            orderId: order.orderId,
            customerPhone: order.customerPhone,
            success: true,
            messageId: result.key.id,
          });

          // Esperar 2 segundos entre envíos para evitar límites de rate
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          errors.push({
            orderId: order.orderId,
            customerPhone: order.customerPhone,
            success: false,
            error: error.message,
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Proceso completado. ${results.length} enviados, ${errors.length} errores`,
        data: {
          successful: results,
          failed: errors,
          summary: {
            total: orders.length,
            sent: results.length,
            failed: errors.length,
          },
        },
      });
    } catch (error) {
      this.logger.error('Error en envío masivo de recordatorios:', error);
      return res.status(500).json({
        error: 'Internal server error',
        message: error.message,
      });
    }
  }
}
