import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';

/**
 * Storage Module
 * Provides storage service for file operations
 */
@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}

