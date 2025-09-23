import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileUploadService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary.cloudName'),
      api_key: this.configService.get<string>('cloudinary.apiKey'),
      api_secret: this.configService.get<string>('cloudinary.apiSecret'),
    });
  }

  async saveEvidenceImage(
    file: Express.Multer.File,
    paymentId: number,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed');
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    try {
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(base64String, {
        folder: 'payment-evidence',
        public_id: `payment_${paymentId}_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' },
        ],
      });

      return result.secure_url;
    } catch (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }
  }

  async saveMultipleEvidenceImages(
    files: Express.Multer.File[],
    paymentId: number,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      return [];
    }

    const savedFiles: string[] = [];

    for (const file of files) {
      const savedPath = await this.saveEvidenceImage(file, paymentId);
      savedFiles.push(savedPath);
    }

    return savedFiles;
  }

  async saveProductImage(
    file: Express.Multer.File,
    productId?: number,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    try {
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      const result = await cloudinary.uploader.upload(base64String, {
        folder: 'products',
        public_id: productId
          ? `product_${productId}_${Date.now()}`
          : `product_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' },
        ],
      });

      return result.secure_url;
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload product image: ${error.message}`,
      );
    }
  }

  async saveUserProfileImage(
    file: Express.Multer.File,
    userId: number,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      const cloudName = this.configService.get<string>('cloudinary.cloudName');

      if (cloudName) {
        return await this.uploadToCloudinary(file, userId);
      } else {
        return await this.saveLocalProfileImage(file, userId);
      }
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload profile image: ${error.message}`,
      );
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    userId: number,
  ): Promise<string> {
    const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'user-profiles',
      public_id: `user_${userId}_${Date.now()}`,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { format: 'auto' },
      ],
    });

    return result.secure_url;
  }

  private async saveLocalProfileImage(
    file: Express.Multer.File,
    userId: number,
  ): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads', 'profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `user_${userId}_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    return `uploads/profiles/${fileName}`;
  }

  getFileUrl(filename: string): string {
    if (filename.startsWith('https://res.cloudinary.com/')) {
      return filename;
    }

    return `/uploads/${filename}`;
  }
}
