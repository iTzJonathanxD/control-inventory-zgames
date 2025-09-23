import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from './../../common/guards/jwt-auth.guard';
import { WhatsAppService } from './whatsapp.service';
import {
  CreateInstanceDto,
  UpdateInstanceDto,
} from './dto/create-instance.dto';
import {
  CreateWhatsAppConfigDto,
  UpdateWhatsAppConfigDto,
  SendDebtMessageDto,
} from './dto/whatsapp-config.dto';
import { ResponseService } from './../../common/services/response.service';
import { ParseInstanceIdPipe } from './pipes/parse-instance-id.pipe';
@Controller('whatsapp')
@UseGuards(JwtAuthGuard)
export class WhatsAppController {
  constructor(
    private readonly whatsappService: WhatsAppService,
    private readonly responseService: ResponseService,
  ) {}
  @Post('config')
  async createConfig(
    @Request() req,
    @Body() createConfigDto: CreateWhatsAppConfigDto,
  ) {
    const config = await this.whatsappService.createConfig(
      req.user.companyId,
      createConfigDto,
    );
    return this.responseService.success(
      'WhatsApp configuration created successfully',
      config,
    );
  }
  @Put('config')
  async updateConfig(
    @Request() req,
    @Body() updateConfigDto: UpdateWhatsAppConfigDto,
  ) {
    const config = await this.whatsappService.updateConfig(
      req.user.companyId,
      updateConfigDto,
    );
    return this.responseService.success(
      'WhatsApp configuration updated successfully',
      config,
    );
  }
  @Get('config')
  async getConfig(@Request() req) {
    try {
      const config = await this.whatsappService.getConfig(req.user.companyId);
      return this.responseService.success(
        'WhatsApp configuration retrieved successfully',
        config,
      );
    } catch (error) {
      return this.responseService.error(
        'Failed to get WhatsApp configuration',
        error.message,
      );
    }
  }
  @Post('instances')
  async createInstance(
    @Request() req,
    @Body() createInstanceDto: CreateInstanceDto,
  ) {
    const instance = await this.whatsappService.createInstance(
      req.user.companyId,
      createInstanceDto,
    );
    return this.responseService.success(
      'WhatsApp instance created successfully',
      instance,
    );
  }
  @Get('instances')
  async getInstances(@Request() req) {
    const instances = await this.whatsappService.getInstances(
      req.user.companyId,
    );
    console.log(
      `📤 Returning ${instances.length} instances to frontend:`,
      instances.map((inst) => ({
        id: inst.id,
        name: inst.instanceName,
        status: inst.status,
        hasQR: !!inst.qrCode,
      })),
    );
    return this.responseService.success(
      'WhatsApp instances retrieved successfully',
      instances,
    );
  }
  @Get('instances/:id')
  async getInstance(
    @Request() req,
    @Param('id', ParseInstanceIdPipe) id: number,
  ) {
    try {
      const instance = await this.whatsappService.getInstance(
        req.user.companyId,
        id,
      );
      return this.responseService.success(
        'WhatsApp instance retrieved successfully',
        instance,
      );
    } catch (error) {
      return this.responseService.error(
        'Failed to get WhatsApp instance',
        error.message,
      );
    }
  }
  @Put('instances/:id')
  async updateInstance(
    @Request() req,
    @Param('id', ParseInstanceIdPipe) id: number,
    @Body() updateInstanceDto: UpdateInstanceDto,
  ) {
    const instance = await this.whatsappService.updateInstance(
      req.user.companyId,
      id,
      updateInstanceDto,
    );
    return this.responseService.success(
      'WhatsApp instance updated successfully',
      instance,
    );
  }
  @Delete('instances/:id')
  async deleteInstance(
    @Request() req,
    @Param('id', ParseInstanceIdPipe) id: number,
  ) {
    try {
      await this.whatsappService.deleteInstance(req.user.companyId, id);
      return this.responseService.success(
        'WhatsApp instance deleted successfully',
        null,
      );
    } catch (error) {
      return this.responseService.error(
        'Failed to delete WhatsApp instance',
        error.message,
      );
    }
  }
  @Get('instances/:id/qr')
  async getQRCode(@Request() req, @Param('id', ParseIntPipe) id: number) {
    try {
      const qrCode = await this.whatsappService.getQRCode(
        req.user.companyId,
        id,
      );
      return this.responseService.success('QR code retrieved successfully', {
        qrCode,
      });
    } catch (error) {
      return this.responseService.error('Failed to get QR code', error.message);
    }
  }
  @Put('instances/:id/primary')
  async setPrimaryInstance(
    @Request() req,
    @Param('id', ParseInstanceIdPipe) id: number,
  ) {
    try {
      const instance = await this.whatsappService.setPrimaryInstance(
        req.user.companyId,
        id,
      );
      return this.responseService.success(
        'Primary instance set successfully',
        instance,
      );
    } catch (error) {
      return this.responseService.error(
        'Failed to set primary instance',
        error.message,
      );
    }
  }
  @Delete('instances/:id/primary')
  async removePrimaryInstance(
    @Request() req,
    @Param('id', ParseInstanceIdPipe) id: number,
  ) {
    try {
      const instance = await this.whatsappService.removePrimaryInstance(
        req.user.companyId,
        id,
      );
      return this.responseService.success(
        'Primary instance removed successfully',
        instance,
      );
    } catch (error) {
      return this.responseService.error(
        'Failed to remove primary instance',
        error.message,
      );
    }
  }
  @Post('send-debt-message')
  async sendDebtMessage(
    @Request() req,
    @Body() sendDebtMessageDto: SendDebtMessageDto,
  ) {
    try {
      const result = await this.whatsappService.sendDebtMessage(
        req.user.companyId,
        sendDebtMessageDto,
      );
      return this.responseService.success(
        'Debt message sent successfully',
        result,
      );
    } catch (error) {
      return this.responseService.error(
        'Failed to send debt message',
        error.message,
      );
    }
  }
  @Post('send-message')
  async sendCustomMessage(
    @Request() req,
    @Body() body: { phoneNumber: string; message: string },
  ) {
    const result = await this.whatsappService.sendCustomMessage(
      req.user.companyId,
      body.phoneNumber,
      body.message,
    );
    return this.responseService.success('Message sent successfully', result);
  }
  @Get('test-connection')
  async testConnection(@Request() req) {
    const result = await this.whatsappService.testEvolutionApiConnection();
    return this.responseService.success(
      'Evolution API connection test',
      result,
    );
  }
  @Post('refresh-status')
  @Put('instances/refresh-status')
  async refreshInstanceStatuses(@Request() req) {
    const result = await this.whatsappService.refreshInstanceStatuses(
      req.user.companyId,
    );
    return this.responseService.success('Instance statuses refreshed', result);
  }
  @Post('webhook/:instanceName')
  async handleWebhook(
    @Param('instanceName') instanceName: string,
    @Body() data: any,
  ) {
    await this.whatsappService.handleWebhook(instanceName, data);
    return { success: true };
  }
}
