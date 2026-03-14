import { Module } from '@nestjs/common';
import { VocabLabController } from './vocab-lab.controller';
import { VocabLabService } from './vocab-lab.service';

@Module({
  controllers: [VocabLabController],
  providers: [VocabLabService],
  exports: [VocabLabService],
})
export class VocabLabModule {}
