import { Logger } from '@config/logger.config';

export interface DebtItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface DebtOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: DebtItem[];
  totalAmount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid';
}

export class DebtMessageService {
  private logger = new Logger(DebtMessageService.name);

  /**
   * Genera un mensaje de deuda con el detalle de items
   */
  public generateDebtMessage(order: DebtOrder): string {
    this.logger.log(`Generando mensaje de deuda para orden: ${order.orderId}`);

    const header = this.generateHeader(order);
    const itemsList = this.generateItemsList(order.items);
    const summary = this.generateSummary(order);
    const footer = this.generateFooter(order);

    return `${header}\n\n${itemsList}\n\n${summary}\n\n${footer}`;
  }

  /**
   * Genera el encabezado del mensaje
   */
  private generateHeader(order: DebtOrder): string {
    const statusEmoji = order.status === 'overdue' ? '🚨' : '📋';
    const statusText = order.status === 'overdue' ? 'VENCIDA' : 'PENDIENTE';

    return (
      `${statusEmoji} *DEUDA ${statusText}*\n` +
      `👤 Cliente: *${order.customerName}*\n` +
      `📞 Teléfono: *${order.customerPhone}*\n` +
      `🆔 Orden: *#${order.orderId}*\n` +
      `📅 Fecha vencimiento: *${order.dueDate}*`
    );
  }

  /**
   * Genera la lista detallada de items
   */
  private generateItemsList(items: DebtItem[]): string {
    let itemsList = '📦 *PRODUCTOS COMPRADOS:*\n';
    itemsList += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';

    items.forEach((item, index) => {
      itemsList += `${index + 1}. 🛍️ *${item.name}*\n`;
      itemsList += `   📊 Cantidad: ${item.quantity}\n`;
      itemsList += `   💰 Precio unit: $${item.price.toFixed(2)}\n`;
      itemsList += `   💵 Subtotal: $${item.total.toFixed(2)}\n`;
      if (index < items.length - 1) {
        itemsList += '   ─────────────────────────────────────\n';
      }
    });

    return itemsList;
  }

  /**
   * Genera el resumen de la deuda
   */
  private generateSummary(order: DebtOrder): string {
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
      `📊 *RESUMEN:*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 Total de productos: ${totalItems}\n` +
      `💰 *TOTAL A PAGAR: $${order.totalAmount.toFixed(2)}*`
    );
  }

  /**
   * Genera el pie del mensaje
   */
  private generateFooter(order: DebtOrder): string {
    const paymentMethods = [
      '💳 Tarjeta de crédito/débito',
      '💸 Transferencia bancaria',
      '💵 Efectivo',
      '📱 Pago móvil',
    ];

    let footer = '💳 *MÉTODOS DE PAGO DISPONIBLES:*\n';
    footer += paymentMethods.join('\n') + '\n\n';

    if (order.status === 'overdue') {
      footer += '⚠️ *ATENCIÓN: Esta deuda está vencida*\n';
      footer += '📞 Contáctanos inmediatamente para evitar recargos\n\n';
    }

    footer += '📞 Para realizar el pago o consultas:\n';
    footer += '🕐 Horario: Lunes a Viernes 9:00 AM - 6:00 PM\n';
    footer += '📧 Email: pagos@empresa.com\n';
    footer += '☎️ WhatsApp: +1234567890';

    return footer;
  }

  /**
   * Genera un mensaje corto de recordatorio de deuda
   */
  public generateReminderMessage(order: DebtOrder): string {
    const statusEmoji = order.status === 'overdue' ? '🚨' : '⏰';

    return (
      `${statusEmoji} *RECORDATORIO DE PAGO*\n\n` +
      `Hola ${order.customerName},\n\n` +
      `Te recordamos que tienes una deuda pendiente:\n` +
      `🆔 Orden: *#${order.orderId}*\n` +
      `💰 Monto: *$${order.totalAmount.toFixed(2)}*\n` +
      `📅 Vencimiento: *${order.dueDate}*\n\n` +
      `💬 Responde "DETALLE" para ver el desglose completo\n` +
      `💳 Responde "PAGAR" para opciones de pago`
    );
  }

  /**
   * Formatea un item individual para mostrar
   */
  public formatSingleItem(item: DebtItem): string {
    return `🛍️ ${item.name} (x${item.quantity}) - $${item.total.toFixed(2)}`;
  }
}
