import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./modules/user/user.module";
import { ProcessModule } from "./modules/process/process.module";
import { MessageModule } from "./modules/message/message.module";
import { UploadModule } from "./modules/upload/upload.module";
import { AuditModule } from "./modules/audit/audit.module";
import { RedisModule } from "./common/redis/redis.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>("MONGO_URI"),
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    UserModule,
    ProcessModule,
    MessageModule,
    UploadModule,
    AuditModule,
  ],
})
export class AppModule {}
