import { Module } from '@nestjs/common';
import { ShadowingController } from './shadowing.controller';
import { ShadowingService } from './shadowing.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ShadowingController],
  providers: [ShadowingService],
})
export class ShadowingModule {}
