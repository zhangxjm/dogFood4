import { Module, OnModuleInit, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  ProcessDefinition,
  ProcessDefinitionSchema,
} from "./schemas/process-definition.schema";
import {
  ProcessInstance,
  ProcessInstanceSchema,
} from "./schemas/process-instance.schema";
import { ProcessService } from "./process.service";
import { ProcessController } from "./process.controller";
import { UserModule } from "../user/user.module";
import { AuditModule } from "../audit/audit.module";
import { MessageModule } from "../message/message.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProcessDefinition.name, schema: ProcessDefinitionSchema },
      { name: ProcessInstance.name, schema: ProcessInstanceSchema },
    ]),
    forwardRef(() => UserModule),
    AuditModule,
    MessageModule,
  ],
  controllers: [ProcessController],
  providers: [ProcessService],
  exports: [ProcessService],
})
export class ProcessModule implements OnModuleInit {
  constructor(private processService: ProcessService) {}

  async onModuleInit() {
    await this.processService.initDefaultProcesses();
  }
}
