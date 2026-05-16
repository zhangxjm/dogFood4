import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Overtime, OvertimeSchema } from './overtime.schema';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Overtime.name, schema: OvertimeSchema }]),
  ],
  controllers: [OvertimeController],
  providers: [OvertimeService],
  exports: [OvertimeService],
})
export class OvertimeModule {}
