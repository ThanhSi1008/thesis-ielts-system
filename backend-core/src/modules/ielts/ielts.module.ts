import { Module } from "@nestjs/common";
import { IeltsService } from "./ielts.service";
import { IeltsController } from "./ielts.controller";
import { PrismaModule } from "../../common/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [IeltsController],
  providers: [IeltsService],
  exports: [IeltsService],
})
export class IeltsModule {}
