import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  WhatsAppInstance,
  InstanceStatus,
} from './entities/whatsapp-instance.entity';
import { WhatsAppConfig } from './entities/whatsapp-config.entity';
import {
  CreateInstanceDto,
  UpdateInstanceDto,
} from './dto/create-instance.dto';
import {
  CreateWhatsAppConfigDto,
  UpdateWhatsAppConfigDto,
  SendDebtMessageDto,
} from './dto/whatsapp-config.dto';
import {
  EvolutionApiService,
  EvolutionApiConfig,
} from './services/evolution-api.service';
import { UsersService } from '../users/users.service';
@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  constructor(
    @InjectRepository(WhatsAppInstance)
    private readonly instanceRepository: Repository<WhatsAppInstance>,
    @InjectRepository(WhatsAppConfig)
    private readonly configRepository: Repository<WhatsAppConfig>,
    private readonly evolutionApiService: EvolutionApiService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}
  private getEvolutionApiConfig(): EvolutionApiConfig {
    const evolutionApiUrl = this.configService.get<string>('evolutionApi.url');
    const evolutionApiKey = this.configService.get<string>('evolutionApi.key');
    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new BadRequestException(
        'Evolution API configuration not found in environment variables',
      );
    }
    return { evolutionApiUrl, evolutionApiKey };
  }
  async createConfig(
    companyId: number,
    createConfigDto: CreateWhatsAppConfigDto,
  ): Promise<WhatsAppConfig> {
    const existingConfig = await this.configRepository.findOne({
      where: { companyId },
    });
    if (existingConfig) {
      throw new BadRequestException(
        'WhatsApp configuration already exists for this company',
      );
    }
    const config = this.configRepository.create({
      ...createConfigDto,
      companyId,
    });
    return await this.configRepository.save(config);
  }
  async updateConfig(
    companyId: number,
    updateConfigDto: UpdateWhatsAppConfigDto,
  ): Promise<WhatsAppConfig> {
    const config = await this.configRepository.findOne({
      where: { companyId },
    });
    if (!config) {
      throw new NotFoundException('WhatsApp configuration not found');
    }
    Object.assign(config, updateConfigDto);
    return await this.configRepository.save(config);
  }
  async getConfig(companyId: number): Promise<WhatsAppConfig> {
    let config = await this.configRepository.findOne({
      where: { companyId },
    });
    if (!config) {
      config = this.configRepository.create({
        companyId,
        debtMessageTemplate:
          'Estimado {firstName} {lastName}, tienes una deuda pendiente de {debtAmount}. Por favor realiza el pago lo antes posible.',
        welcomeMessageTemplate:
          'Hola {firstName}, ¡Bienvenido! Gracias por registrarte con nosotros.',
        orderConfirmationTemplate:
          'Hola {firstName}, tu pedido #{orderNumber} ha sido confirmado por un total de {totalAmount}.',
        sendDebtReminders: true,
        debtReminderDays: 7,
        isActive: true,
      });
      config = await this.configRepository.save(config);
      this.logger.log(
        `Created default WhatsApp configuration for company ${companyId}`,
      );
    }
    return config;
  }
  async createInstance(
    companyId: number,
    createInstanceDto: CreateInstanceDto,
  ): Promise<WhatsAppInstance> {
    const evolutionConfig = this.getEvolutionApiConfig();
    const instanceName = `${createInstanceDto.instanceName}_${Date.now()}`;
    try {
      const evolutionResponse = await this.evolutionApiService.createInstance(
        evolutionConfig,
        instanceName,
        createInstanceDto.webhookEvents,
      );
      if (createInstanceDto.isPrimary) {
        await this.instanceRepository.update(
          { companyId, isPrimary: true },
          { isPrimary: false },
        );
      }
      const instance = this.instanceRepository.create({
        instanceName,
        instanceKey: evolutionResponse.data?.key || instanceName,
        phoneNumber: createInstanceDto.phoneNumber,
        status: InstanceStatus.CONNECTING,
        isPrimary: createInstanceDto.isPrimary || false,
        webhookEvents: createInstanceDto.webhookEvents || [],
        companyId,
      });
      const savedInstance = await this.instanceRepository.save(instance);
      try {
        const qrResponse = await this.evolutionApiService.getQRCode(
          evolutionConfig,
          instanceName,
        );
        if (qrResponse.base64) {
          savedInstance.qrCode = qrResponse.base64;
          try {
            await this.instanceRepository.save(savedInstance);
            this.logger.log(
              `QR code saved successfully for instance: ${instanceName}`,
            );
          } catch (saveError) {
            this.logger.error(
              `Failed to save QR code for instance ${instanceName}:`,
              saveError.message,
            );
          }
        }
      } catch (error) {
        this.logger.warn('Could not get QR code immediately:', error.message);
      }
      return savedInstance;
    } catch (error) {
      this.logger.error('Error creating WhatsApp instance:', error.message);
      throw new BadRequestException('Failed to create WhatsApp instance');
    }
  }
  async getInstances(companyId: number): Promise<WhatsAppInstance[]> {
    const instances = await this.instanceRepository.find({
      where: { companyId },
      order: { isPrimary: 'DESC', createdAt: 'DESC' },
    });
    const evolutionConfig = this.getEvolutionApiConfig();
    this.logger.debug(`🔄 Syncing status for ${instances.length} instances`);
    for (const instance of instances) {
      try {
        const instanceAge = Date.now() - new Date(instance.createdAt).getTime();
        const isVeryRecent = instanceAge < 30000; // 30 seconds
        if (isVeryRecent && instance.status === InstanceStatus.CONNECTING) {
          this.logger.debug(
            `⏰ Skipping status sync for recent instance: ${instance.instanceName} (age: ${Math.round(instanceAge / 1000)}s)`,
          );
          continue;
        }
        this.logger.debug(
          `🔍 Checking status for instance: ${instance.instanceName} (current: ${instance.status}, age: ${Math.round(instanceAge / 1000)}s)`,
        );
        const instanceStatus = await this.evolutionApiService.getInstanceStatus(
          evolutionConfig,
          instance.instanceName,
        );
        this.logger.debug(
          `📡 Evolution API returned status: ${instanceStatus.state} for ${instance.instanceName}`,
        );
        const mappedStatus = this.mapEvolutionStatusToInstanceStatus(
          instanceStatus.state,
        );
        if (instance.status !== mappedStatus) {
          this.logger.log(
            `🔄 Instance ${instance.instanceName} status changed from ${instance.status} to ${mappedStatus}`,
          );
          const oldStatus = instance.status;
          instance.status = mappedStatus;
          if (
            mappedStatus === InstanceStatus.OPEN ||
            mappedStatus === InstanceStatus.DISCONNECTED
          ) {
            if (instance.qrCode) {
              this.logger.log(
                `🗑️ Clearing QR code for instance ${instance.instanceName} (status: ${mappedStatus})`,
              );
              instance.qrCode = null;
            }
          }
          await this.instanceRepository.save(instance);
          this.logger.log(
            `💾 Status saved: ${instance.instanceName} (${oldStatus} → ${mappedStatus})`,
          );
        } else {
          this.logger.debug(
            `⏸️ No status change for instance: ${instance.instanceName} (${instance.status})`,
          );
        }
      } catch (error) {
        this.logger.warn(
          `❌ Failed to sync status for instance ${instance.instanceName}: ${error.message}`,
        );
      }
    }
    return instances;
  }
  async getInstance(
    companyId: number,
    instanceId: number,
  ): Promise<WhatsAppInstance> {
    const instance = await this.instanceRepository.findOne({
      where: { id: instanceId, companyId },
    });
    if (!instance) {
      throw new NotFoundException('WhatsApp instance not found');
    }
    return instance;
  }
  async updateInstance(
    companyId: number,
    instanceId: number,
    updateInstanceDto: UpdateInstanceDto,
  ): Promise<WhatsAppInstance> {
    const instance = await this.getInstance(companyId, instanceId);
    if (updateInstanceDto.isPrimary) {
      await this.instanceRepository.update(
        { companyId, isPrimary: true },
        { isPrimary: false },
      );
    }
    Object.assign(instance, updateInstanceDto);
    return await this.instanceRepository.save(instance);
  }
  async deleteInstance(companyId: number, instanceId: number): Promise<void> {
    const instance = await this.getInstance(companyId, instanceId);
    const evolutionConfig = this.getEvolutionApiConfig();
    try {
      await this.evolutionApiService.deleteInstance(
        evolutionConfig,
        instance.instanceName,
      );
    } catch (error) {
      this.logger.warn(
        'Could not delete instance from Evolution API:',
        error.message,
      );
    }
    await this.instanceRepository.remove(instance);
  }
  async getQRCode(companyId: number, instanceId: number): Promise<string> {
    const instance = await this.getInstance(companyId, instanceId);
    const evolutionConfig = this.getEvolutionApiConfig();
    try {
      const qrResponse = await this.evolutionApiService.getQRCode(
        evolutionConfig,
        instance.instanceName,
      );
      if (qrResponse.base64) {
        instance.qrCode = qrResponse.base64;
        try {
          await this.instanceRepository.save(instance);
          this.logger.log(
            `QR code updated successfully for instance: ${instance.instanceName}`,
          );
        } catch (saveError) {
          this.logger.error(
            `Failed to save QR code to database for instance ${instance.instanceName}:`,
            saveError.message,
          );
        }
        return qrResponse.base64;
      } else {
        this.logger.warn(
          `QR code not available from Evolution API for instance: ${instance.instanceName}`,
        );
        throw new BadRequestException(
          'QR code not available from Evolution API',
        );
      }
    } catch (error) {
      if (error.message.includes('QR code not available')) {
        this.logger.warn(
          `QR code expired or not available for instance: ${instance.instanceName}`,
        );
      } else {
        this.logger.error(
          `Error getting QR code for instance ${instance.instanceName}:`,
          error.message,
        );
      }
      throw new BadRequestException('QR code not available from Evolution API');
    }
  }
  async setPrimaryInstance(
    companyId: number,
    instanceId: number,
  ): Promise<WhatsAppInstance> {
    const instance = await this.getInstance(companyId, instanceId);
    try {
      const evolutionConfig = this.getEvolutionApiConfig();
      const instanceStatus = await this.evolutionApiService.getInstanceStatus(
        evolutionConfig,
        instance.instanceName,
      );
      const mappedStatus = this.mapEvolutionStatusToInstanceStatus(
        instanceStatus.state,
      );
      if (instance.status !== mappedStatus) {
        instance.status = mappedStatus;
        this.logger.log(
          `Updated instance ${instance.instanceName} status from ${instance.status} to ${mappedStatus}`,
        );
      }
      if (mappedStatus !== InstanceStatus.OPEN) {
        throw new BadRequestException(
          `Cannot set instance as primary. Instance is not connected. Current status: ${mappedStatus}. Please connect the instance using QR code first.`,
        );
      }
    } catch (statusError) {
      this.logger.warn(
        `Could not verify instance status for ${instance.instanceName}: ${statusError.message}`,
      );
      if (instance.status !== InstanceStatus.OPEN) {
        throw new BadRequestException(
          `Cannot set instance as primary. Instance appears to be disconnected. Current status: ${instance.status}. Please connect the instance using QR code first.`,
        );
      }
    }
    await this.instanceRepository.update(
      { companyId, isPrimary: true },
      { isPrimary: false },
    );
    instance.isPrimary = true;
    return await this.instanceRepository.save(instance);
  }
  async removePrimaryInstance(
    companyId: number,
    instanceId: number,
  ): Promise<WhatsAppInstance> {
    const instance = await this.getInstance(companyId, instanceId);
    if (!instance.isPrimary) {
      throw new BadRequestException('Instance is not set as primary');
    }
    instance.isPrimary = false;
    return await this.instanceRepository.save(instance);
  }
  async getPrimaryInstance(
    companyId: number,
  ): Promise<WhatsAppInstance | null> {
    return await this.instanceRepository.findOne({
      where: { companyId, isPrimary: true, isActive: true },
    });
  }
  async sendDebtMessage(
    companyId: number,
    sendDebtMessageDto: SendDebtMessageDto,
  ): Promise<any> {
    try {
      const config = await this.getConfig(companyId);
      const evolutionConfig = this.getEvolutionApiConfig();
      const primaryInstance = await this.getPrimaryInstance(companyId);
      if (!primaryInstance) {
        throw new BadRequestException(
          'No primary WhatsApp instance configured. Please create and configure a WhatsApp instance first.',
        );
      }
      try {
        const instanceStatus = await this.evolutionApiService.getInstanceStatus(
          evolutionConfig,
          primaryInstance.instanceName,
        );
        const mappedStatus = this.mapEvolutionStatusToInstanceStatus(
          instanceStatus.state,
        );
        if (primaryInstance.status !== mappedStatus) {
          primaryInstance.status = mappedStatus;
          await this.instanceRepository.save(primaryInstance);
          this.logger.log(
            `Updated instance ${primaryInstance.instanceName} status from ${primaryInstance.status} to ${mappedStatus}`,
          );
        }
      } catch (statusError) {
        this.logger.warn(
          `Could not verify instance status for ${primaryInstance.instanceName}: ${statusError.message}`,
        );
      }
      if (primaryInstance.status !== InstanceStatus.OPEN) {
        throw new BadRequestException(
          `WhatsApp instance is not connected. Current status: ${primaryInstance.status}. Please connect the instance using QR code.`,
        );
      }
      const user = await this.usersService.findOne(sendDebtMessageDto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (!user.phone) {
        throw new BadRequestException('User does not have a phone number');
      }
      if (parseFloat(user.debt.toString()) <= 0) {
        throw new BadRequestException('User does not have any debt');
      }
      if (
        !evolutionConfig.evolutionApiUrl ||
        !evolutionConfig.evolutionApiKey
      ) {
        throw new BadRequestException(
          'Evolution API is not properly configured. Please check your environment variables.',
        );
      }
      const message =
        sendDebtMessageDto.customMessage ||
        this.evolutionApiService.formatDebtMessage(
          config.debtMessageTemplate,
          user,
          parseFloat(user.debt.toString()),
        );
      const result = await this.evolutionApiService.sendMessage(
        evolutionConfig,
        primaryInstance.instanceName,
        user.phone,
        message,
      );
      this.logger.log(
        `Debt message sent successfully to ${user.phone} for user ${user.id}`,
      );
      return result;
    } catch (error) {
      this.logger.error(`Error sending debt message: ${error.message}`);
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to send debt message: ${error.message}`,
      );
    }
  }
  async sendCustomMessage(
    companyId: number,
    phoneNumber: string,
    message: string,
  ): Promise<any> {
    const evolutionConfig = this.getEvolutionApiConfig();
    const primaryInstance = await this.getPrimaryInstance(companyId);
    if (!primaryInstance) {
      throw new BadRequestException('No primary WhatsApp instance configured');
    }
    try {
      const instanceStatus = await this.evolutionApiService.getInstanceStatus(
        evolutionConfig,
        primaryInstance.instanceName,
      );
      const mappedStatus = this.mapEvolutionStatusToInstanceStatus(
        instanceStatus.state,
      );
      if (primaryInstance.status !== mappedStatus) {
        primaryInstance.status = mappedStatus;
        await this.instanceRepository.save(primaryInstance);
        this.logger.log(
          `Updated instance ${primaryInstance.instanceName} status from ${primaryInstance.status} to ${mappedStatus}`,
        );
      }
    } catch (statusError) {
      this.logger.warn(
        `Could not verify instance status for ${primaryInstance.instanceName}: ${statusError.message}`,
      );
    }
    if (primaryInstance.status !== InstanceStatus.OPEN) {
      throw new BadRequestException(
        `WhatsApp instance is not connected. Current status: ${primaryInstance.status}. Please connect the instance using QR code.`,
      );
    }
    return await this.evolutionApiService.sendMessage(
      evolutionConfig,
      primaryInstance.instanceName,
      phoneNumber,
      message,
    );
  }
  async testEvolutionApiConnection(): Promise<any> {
    try {
      const evolutionConfig = this.getEvolutionApiConfig();
      const response =
        await this.evolutionApiService.testConnection(evolutionConfig);
      return {
        status: 'success',
        url: evolutionConfig.evolutionApiUrl,
        message: 'Evolution API is accessible',
        data: response,
      };
    } catch (error) {
      return {
        status: 'error',
        url: this.configService.get<string>('evolutionApi.url'),
        message: error.message,
        error: error.response?.data || error.message,
      };
    }
  }
  async refreshInstanceStatuses(companyId: number): Promise<{
    updated: number;
    errors: any[];
  }> {
    const instances = await this.getInstances(companyId);
    const evolutionConfig = this.getEvolutionApiConfig();
    let updated = 0;
    const errors: any[] = [];
    for (const instance of instances) {
      try {
        const instanceStatus = await this.evolutionApiService.getInstanceStatus(
          evolutionConfig,
          instance.instanceName,
        );
        const mappedStatus = this.mapEvolutionStatusToInstanceStatus(
          instanceStatus.state,
        );
        if (instance.status !== mappedStatus) {
          instance.status = mappedStatus;
          await this.instanceRepository.save(instance);
          updated++;
          this.logger.log(
            `Updated instance ${instance.instanceName} status from ${instance.status} to ${mappedStatus}`,
          );
          if (instance.isPrimary && mappedStatus !== InstanceStatus.OPEN) {
            instance.isPrimary = false;
            await this.instanceRepository.save(instance);
            this.logger.warn(
              `Removed primary status from ${instance.instanceName} as it is no longer connected`,
            );
          }
        }
      } catch (error) {
        errors.push({
          instanceName: instance.instanceName,
          error: error.message,
        });
        this.logger.error(
          `Failed to refresh status for instance ${instance.instanceName}: ${error.message}`,
        );
      }
    }
    return { updated, errors };
  }
  async handleWebhook(instanceName: string, data: any): Promise<void> {
    const instance = await this.instanceRepository.findOne({
      where: { instanceName },
    });
    if (!instance) {
      this.logger.warn(
        `Webhook received for unknown instance: ${instanceName}`,
      );
      return;
    }
    if (data.event === 'connection.update') {
      const status = this.mapEvolutionStatusToInstanceStatus(data.state);
      instance.status = status;
      if (data.profilePictureUrl) {
        instance.profilePictureUrl = data.profilePictureUrl;
      }
      if (data.displayName) {
        instance.displayName = data.displayName;
      }
      await this.instanceRepository.save(instance);
    }
  }
  private mapEvolutionStatusToInstanceStatus(
    evolutionStatus: string,
  ): InstanceStatus {
    this.logger.debug(`🗂️ Mapping Evolution status: "${evolutionStatus}"`);
    switch (evolutionStatus?.toLowerCase()) {
      case 'open':
        return InstanceStatus.OPEN;
      case 'connecting':
      case 'qr':
        return InstanceStatus.CONNECTING;
      case 'close':
      case 'closed':
        return InstanceStatus.CLOSE;
      case 'disconnected':
      case 'logout':
        return InstanceStatus.DISCONNECTED;
      default:
        this.logger.warn(
          `🚨 Unknown Evolution status: "${evolutionStatus}", defaulting to DISCONNECTED`,
        );
        return InstanceStatus.DISCONNECTED;
    }
  }
}
