import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { Public } from '../decorators/public.decorator';

@Controller('uploads')
export class FilesController {
  @Public()
  @Get(':folder/:filename')
  serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = path.join(process.cwd(), 'uploads', folder, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filePath}`);
        throw new NotFoundException('File not found');
      }

      // Configurar headers para imágenes
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
      };

      if (mimeTypes[ext]) {
        res.setHeader('Content-Type', mimeTypes[ext]);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 año
      }

      console.log(`Serving file: ${filePath}`);
      return res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving file:', error);
      throw new NotFoundException('File not found');
    }
  }
}
