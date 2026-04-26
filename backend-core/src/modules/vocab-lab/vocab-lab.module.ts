import { Module } from "@nestjs/common";
import { VocabLabController } from "./vocab-lab.controller";
import { VocabLabService } from "./vocab-lab.service";
import { StorageModule } from "../../common/storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [VocabLabController],
  providers: [VocabLabService],
  exports: [VocabLabService],
})
export class VocabLabModule {}
