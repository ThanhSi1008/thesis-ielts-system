import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";

/**
 * Storage Service for Cloudinary operations
 * Handles file uploads, downloads, and URL generation
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
    });

    this.logger.log(
      `✅ Storage service initialized with Cloudinary: ${this.configService.get<string>("CLOUDINARY_CLOUD_NAME")}`,
    );
  }

  /**
   * Upload a file to storage
   * @param file - Multer file object
   * @param folder - Folder path in bucket (e.g., 'audio', 'images')
   * @returns URL of the uploaded file
   */
  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: "auto",
        },
        (error, ieltsIntensiveResult) => {
          if (error) {
            this.logger.error(`❌ File upload failed: ${error.message}`);
            return reject(error);
          }
          this.logger.log(`✅ File uploaded: ${ieltsIntensiveResult.secure_url}`);
          resolve(ieltsIntensiveResult.secure_url);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }

  /**
   * Delete a file from storage
   * @param fileUrl - URL of the file to delete
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract public_id from URL
      // Example: https://res.cloudinary.com/demo/image/upload/v1/folder/filename.jpg
      // public_id: folder/filename (without extension)

      const urlParts = fileUrl.split("/");
      const versionIndex = urlParts.findIndex(
        (part) => part.startsWith("v") && !isNaN(Number(part.substring(1))),
      );
      // If version is present, public_id starts after it. If not, it's safer to rely on regex or assumption.
      // A common strategy is to store public_id in DB, but if we only have URL:
      // Last segment is filename.ext
      const filenameWithExt = urlParts[urlParts.length - 1];
      const filename = filenameWithExt.split(".")[0];
      const folder = urlParts[urlParts.length - 2];
      // This parsing is brittle. Ideally we store public_id.
      // For now, let's assume 'folder/filename' structure from the upload.

      // Better approach: Cloudinary public_id extraction from URL is complex.
      // For this specific app, we are uploading to `folder/uuid`.
      // So public_id is `folder/uuid`.

      const publicId = `${folder}/${filename}`;

      await cloudinary.uploader.destroy(publicId);
      this.logger.log(`✅ File deleted: ${fileUrl}`);
    } catch (error) {
      this.logger.error(`❌ File deletion failed: ${error.message}`);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get a temporary signed URL for accessing a file.
   * Cloudinary URLs are public by default, but we can sign them for private assets.
   * For this implementation, we return the public URL as most assets are public.
   */
  async getSignedUrl(
    fileUrl: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    // For Cloudinary, just return the URL if it's already a full URL
    return fileUrl;
  }

  /**
   * Get the full URL for a file (for public access)
   * @param fileUrl - URL of the file
   * @returns Full URL
   */
  getPublicUrl(fileUrl: string): string {
    return fileUrl;
  }
}
