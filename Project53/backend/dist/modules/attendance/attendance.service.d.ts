import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from './attendance.schema';
import { CheckInDto, CheckOutDto, UpdateAttendanceDto, AttendanceQueryDto } from './attendance.dto';
export declare class AttendanceService {
    private attendanceModel;
    constructor(attendanceModel: Model<AttendanceDocument>);
    private parseTime;
    private isLate;
    private isEarlyLeave;
    private calculateWorkHours;
    private calculateStatus;
    checkIn(checkInDto: CheckInDto): Promise<Attendance>;
    checkOut(checkOutDto: CheckOutDto): Promise<Attendance>;
    findAll(query: AttendanceQueryDto): Promise<Attendance[]>;
    findOne(id: string): Promise<Attendance>;
    update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<Attendance>;
    getTodayAttendance(userId: string): Promise<Attendance>;
    getMonthlyAttendance(userId: string, year: number, month: number): Promise<Attendance[]>;
}
