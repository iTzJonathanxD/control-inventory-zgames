import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
export interface EvolutionApiConfig {
  evolutionApiUrl: string;
  evolutionApiKey: string;
}
export interface EvolutionApiResponse {
  success: boolean;
  data?: any;
  message?: string;
}
export interface QRCodeResponse {
  base64: string;
  code: string;
}
export interface InstanceInfo {
  instanceName: string;
  status: string;
  serverUrl: string;
  apikey: string;
}
@Injectable()
export class EvolutionApiService {
  private readonly logger = new Logger(EvolutionApiService.name);
  constructor(private readonly httpService: HttpService) {}
  async createInstance(
    config: EvolutionApiConfig,
    instanceName: string,
    webhookEvents: string[] = [],
  ): Promise<EvolutionApiResponse> {
    try {
      const payload = {
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      };
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${config.evolutionApiUrl}/instance/create`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              apikey: config.evolutionApiKey,
            },
          },
        ),
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Error creating instance:');
      this.logger.error('Status:', error.response?.status);
      this.logger.error('Data:', JSON.stringify(error.response?.data, null, 2));
      this.logger.error('Config URL:', config.evolutionApiUrl);
      this.logger.error('WebhookEvents received:', webhookEvents);
      throw new BadRequestException(
        `Failed to create WhatsApp instance: ${error.response?.data?.response?.message || error.response?.data?.message || error.message}`,
      );
    }
  }
  async getQRCode(
    config: EvolutionApiConfig,
    instanceName: string,
  ): Promise<QRCodeResponse> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(
          `${config.evolutionApiUrl}/instance/connect/${instanceName}`,
          {
            headers: {
              apikey: config.evolutionApiKey,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Error getting QR code:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to get QR code');
    }
  }
  async getInstanceInfo(
    config: EvolutionApiConfig,
    instanceName: string,
  ): Promise<InstanceInfo> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(
          `${config.evolutionApiUrl}/instance/fetchInstances`,
          {
            headers: {
              apikey: config.evolutionApiKey,
            },
            params: {
              instanceName,
            },
          },
        ),
      );
      return response.data;
    } catch (error) {
      this.logger.error(
        'Error getting instance info:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to get instance info');
    }
  }
  async getInstanceStatus(
    config: EvolutionApiConfig,
    instanceName: string,
  ): Promise<{ state: string; status?: string }> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(
          `${config.evolutionApiUrl}/instance/connectionState/${instanceName}`,
          {
            headers: {
              apikey: config.evolutionApiKey,
            },
          },
        ),
      );
      const state =
        response.data.instance?.state ||
        response.data.state ||
        response.data.status ||
        'disconnected';
      this.logger.debug(
        `Evolution API connectionState response for ${instanceName}:`,
        {
          rawInstanceState: response.data.instance?.state,
          rawState: response.data.state,
          rawStatus: response.data.status,
          finalState: state,
          fullResponse: response.data,
        },
      );
      return {
        state: state,
        status: response.data.status,
      };
    } catch (error) {
      this.logger.warn(
        `Could not get connection state for ${instanceName}, trying instance info:`,
        error.response?.data || error.message,
      );
      try {
        const instanceInfo = await this.getInstanceInfo(config, instanceName);
        this.logger.debug(
          `Evolution API instanceInfo fallback for ${instanceName}:`,
          {
            status: instanceInfo.status,
            fullInfo: instanceInfo,
          },
        );
        return {
          state: instanceInfo.status || 'disconnected',
        };
      } catch (infoError) {
        this.logger.error(
          `Failed to get status for instance ${instanceName}:`,
          infoError.response?.data || infoError.message,
        );
        return { state: 'disconnected' };
      }
    }
  }
  async sendMessage(
    config: EvolutionApiConfig,
    instanceName: string,
    phoneNumber: string,
    message: string,
  ): Promise<EvolutionApiResponse> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      const payload = {
        number: formattedPhone,
        text: message,
      };
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.post(
          `${config.evolutionApiUrl}/message/sendText/${instanceName}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              apikey: config.evolutionApiKey,
            },
          },
        ),
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error(
        'Error sending message:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to send WhatsApp message');
    }
  }
  async deleteInstance(
    config: EvolutionApiConfig,
    instanceName: string,
  ): Promise<EvolutionApiResponse> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.delete(
          `${config.evolutionApiUrl}/instance/delete/${instanceName}`,
          {
            headers: {
              apikey: config.evolutionApiKey,
            },
          },
        ),
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error(
        'Error deleting instance:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to delete WhatsApp instance');
    }
  }
  async restartInstance(
    config: EvolutionApiConfig,
    instanceName: string,
  ): Promise<EvolutionApiResponse> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.put(
          `${config.evolutionApiUrl}/instance/restart/${instanceName}`,
          {},
          {
            headers: {
              apikey: config.evolutionApiKey,
            },
          },
        ),
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      this.logger.error(
        'Error restarting instance:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to restart WhatsApp instance');
    }
  }
  private formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.replace(/\D/g, '');
    if (!formatted.startsWith('57') && formatted.length === 10) {
      formatted = '57' + formatted;
    }
    return formatted;
  }
  async testConnection(config: EvolutionApiConfig): Promise<any> {
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.get(
          `${config.evolutionApiUrl}/instance/fetchInstances`,
          {
            headers: {
              apikey: config.evolutionApiKey,
            },
            timeout: 5000, // 5 second timeout
          },
        ),
      );
      return {
        status: response.status,
        data: response.data,
        message: 'Connection successful',
      };
    } catch (error) {
      this.logger.error('Evolution API connection test failed:');
      this.logger.error('URL:', config.evolutionApiUrl);
      this.logger.error('Status:', error.response?.status);
      this.logger.error('Error:', error.response?.data || error.message);
      throw new BadRequestException(
        `Evolution API connection failed: ${error.response?.data?.message || error.message}`,
      );
    }
  }
  formatDebtMessage(
    template: string,
    userData: any,
    debtAmount: number,
  ): string {
    return template
      .replace(/\{firstName\}/g, userData.firstName || '')
      .replace(/\{lastName\}/g, userData.lastName || '')
      .replace(/\{username\}/g, userData.username || '')
      .replace(
        /\{debtAmount\}/g,
        debtAmount.toLocaleString('es-CO', {
          style: 'currency',
          currency: 'COP',
        }),
      )
      .replace(/\{phone\}/g, userData.phone || '')
      .replace(/\{email\}/g, userData.email || '');
  }
}
