import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { OvertimeModule } from './modules/overtime/overtime.module';
import { StatisticsModule } from './modules/statistics/statistics.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/attendance'),
    UserModule,
    AttendanceModule,
    LeaveModule,
    OvertimeModule,
    StatisticsModule,
  ],
})
export class AppModule {}
