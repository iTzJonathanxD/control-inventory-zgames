export interface PaymentTableColumn {
  field: string
  header: string
  sortable: boolean
  visible: boolean
  type: 'text' | 'date' | 'currency' | 'badge' | 'image' | 'actions'
  width?: string
}
export const PAYMENT_TABLE_COLUMNS: PaymentTableColumn[] = [
  {
    field: 'id',
    header: 'PAYMENT.TABLE.ID',
    sortable: true,
    visible: true,
    type: 'text',
    width: '80px',
  },
  {
    field: 'order.orderNumber',
    header: 'PAYMENT.TABLE.ORDER_NUMBER',
    sortable: true,
    visible: true,
    type: 'text',
    width: '150px',
  },
  {
    field: 'order.user.firstName',
    header: 'PAYMENT.TABLE.CUSTOMER',
    sortable: true,
    visible: true,
    type: 'text',
    width: '180px',
  },
  {
    field: 'amount',
    header: 'PAYMENT.TABLE.AMOUNT',
    sortable: true,
    visible: true,
    type: 'currency',
    width: '120px',
  },
  {
    field: 'method',
    header: 'PAYMENT.TABLE.METHOD',
    sortable: true,
    visible: true,
    type: 'text',
    width: '150px',
  },
  {
    field: 'status',
    header: 'PAYMENT.TABLE.STATUS',
    sortable: true,
    visible: true,
    type: 'badge',
    width: '120px',
  },
  {
    field: 'transactionId',
    header: 'PAYMENT.TABLE.TRANSACTION_ID',
    sortable: false,
    visible: true,
    type: 'text',
    width: '150px',
  },
  {
    field: 'evidenceImages',
    header: 'PAYMENT.TABLE.EVIDENCE',
    sortable: false,
    visible: true,
    type: 'image',
    width: '100px',
  },
  {
    field: 'createdAt',
    header: 'PAYMENT.TABLE.DATE_CREATED',
    sortable: true,
    visible: true,
    type: 'date',
    width: '150px',
  },
  {
    field: 'processedAt',
    header: 'PAYMENT.TABLE.DATE_PROCESSED',
    sortable: true,
    visible: true,
    type: 'date',
    width: '150px',
  },
  {
    field: 'actions',
    header: 'PAYMENT.TABLE.ACTIONS',
    sortable: false,
    visible: true,
    type: 'actions',
    width: '200px',
  },
]
export const PAYMENT_BUTTONS_PERMISSIONS = {
  VIEW: 'PAYMENT_VIEW',
  EDIT: 'PAYMENT_EDIT',
  DELETE: 'PAYMENT_DELETE',
  PROCESS: 'PAYMENT_PROCESS',
  REJECT: 'PAYMENT_REJECT',
  REFUND: 'PAYMENT_REFUND',
  CREATE: 'PAYMENT_CREATE',
} as const
