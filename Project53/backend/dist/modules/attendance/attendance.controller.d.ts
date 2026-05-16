import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto, UpdateAttendanceDto, AttendanceQueryDto } from './attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    checkIn(checkInDto: CheckInDto): Promise<import("./attendance.schema").Attendance>;
    checkOut(checkOutDto: CheckOutDto): Promise<import("./attendance.schema").Attendance>;
    findAll(query: AttendanceQueryDto): Promise<import("./attendance.schema").Attendance[]>;
    findOne(id: string): Promise<import("./attendance.schema").Attendance>;
    update(id: string, updateAttendanceDto: UpdateAttendanceDto): Promise<import("./attendance.schema").Attendance>;
    getTodayAttendance(userId: string): Promise<import("./attendance.schema").Attendance>;
    getMonthlyAttendance(userId: string, year: number, month: number): Promise<import("./attendance.schema").Attendance[]>;
}
