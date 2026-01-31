import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

/**
 * Storage Service for MinIO/S3 operations
 * Handles file uploads, downloads, and URL generation
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('STORAGE_ENDPOINT', 'http://localhost:9000');
    const accessKeyId = this.configService.get<string>('STORAGE_ACCESS_KEY', 'minioadmin');
    const secretAccessKey = this.configService.get<string>('STORAGE_SECRET_KEY', 'minioadmin');
    const region = this.configService.get<string>('STORAGE_REGION', 'us-east-1');
    this.bucketName = this.configService.get<string>('STORAGE_BUCKET', 'toeic-files');

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    this.logger.log(`✅ Storage service initialized with bucket: ${this.bucketName}`);
  }

  /**
   * Upload a file to storage
   * @param file - Multer file object
   * @param folder - Folder path in bucket (e.g., 'audio', 'images')
   * @returns URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const fileExtension = path.extname(file.originalname);
      const fileName = `${folder}/${uuidv4()}${fileExtension}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);

      const fileUrl = `${this.bucketName}/${fileName}`;
      this.logger.log(`✅ File uploaded: ${fileUrl}`);
      
      return fileUrl;
    } catch (error) {
      this.logger.error(`❌ File upload failed: ${error.message}`);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete a file from storage
   * @param fileUrl - URL of the file to delete (format: bucket/path/to/file)
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract key from URL (remove bucket name)
      const key = fileUrl.replace(`${this.bucketName}/`, '');

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      this.logger.log(`✅ File deleted: ${fileUrl}`);
    } catch (error) {
      this.logger.error(`❌ File deletion failed: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get a temporary signed URL for accessing a file
   * @param fileUrl - URL of the file (format: bucket/path/to/file)
   * @param expiresIn - Expiration time in seconds (default: 3600)
   * @returns Signed URL
   */
  async getSignedUrl(fileUrl: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Extract key from URL (remove bucket name)
      const key = fileUrl.replace(`${this.bucketName}/`, '');

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`✅ Signed URL generated for: ${fileUrl}`);
      
      return signedUrl;
    } catch (error) {
      this.logger.error(`❌ Signed URL generation failed: ${error.message}`);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Get the full URL for a file (for public access)
   * @param fileUrl - URL of the file (format: bucket/path/to/file)
   * @returns Full URL
   */
  getPublicUrl(fileUrl: string): string {
    const endpoint = this.configService.get<string>('STORAGE_ENDPOINT', 'http://localhost:9000');
    return `${endpoint}/${fileUrl}`;
  }
}

