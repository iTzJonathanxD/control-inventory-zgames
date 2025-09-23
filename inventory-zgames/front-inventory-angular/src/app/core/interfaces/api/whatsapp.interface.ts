export enum InstanceStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  OPEN = 'open',
  CLOSE = 'close',
}
export interface WhatsAppInstance {
  id: number
  instanceName: string
  instanceKey: string
  phoneNumber: string
  status: InstanceStatus
  isPrimary: boolean
  qrCode?: string
  profilePictureUrl?: string
  displayName?: string
  webhookEvents?: string[]
  isActive: boolean
  companyId: number
  createdAt: Date | string
  updatedAt: Date | string
}
export interface WhatsAppConfig {
  id: number
  debtMessageTemplate: string
  welcomeMessageTemplate?: string
  orderConfirmationTemplate?: string
  sendDebtReminders: boolean
  debtReminderDays: number
  isActive: boolean
  companyId: number
  createdAt: Date | string
  updatedAt: Date | string
}
export interface CreateInstanceDto {
  instanceName: string
  phoneNumber: string
  webhookEvents?: string[]
  isPrimary?: boolean
}
export interface UpdateInstanceDto {
  instanceName?: string
  phoneNumber?: string
  isPrimary?: boolean
  isActive?: boolean
}
export interface CreateWhatsAppConfigDto {
  debtMessageTemplate: string
  welcomeMessageTemplate?: string
  orderConfirmationTemplate?: string
  sendDebtReminders?: boolean
  debtReminderDays?: number
}
export interface UpdateWhatsAppConfigDto {
  debtMessageTemplate?: string
  welcomeMessageTemplate?: string
  orderConfirmationTemplate?: string
  sendDebtReminders?: boolean
  debtReminderDays?: number
  isActive?: boolean
}
export interface SendDebtMessageDto {
  userId: number
  customMessage?: string
}
export interface SendCustomMessageDto {
  phoneNumber: string
  message: string
}
export interface QRCodeResponse {
  qrCode: string
}
