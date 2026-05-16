import { Response } from 'express';
import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getMonthlyStatistics(userId: string, year: number, month: number): Promise<{
        totalDays: number;
        normalDays: number;
        lateDays: number;
        earlyLeaveDays: number;
        absentDays: number;
        totalWorkHours: number;
        leaveDays: number;
        overtimeHours: number;
        attendances: (import("mongoose").Document<unknown, {}, import("../attendance/attendance.schema").AttendanceDocument> & import("../attendance/attendance.schema").Attendance & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        leaves: (import("mongoose").Document<unknown, {}, import("../leave/leave.schema").LeaveDocument> & import("../leave/leave.schema").Leave & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        overtimes: (import("mongoose").Document<unknown, {}, import("../overtime/overtime.schema").OvertimeDocument> & import("../overtime/overtime.schema").Overtime & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    getExceptionAttendances(startDate?: string, endDate?: string): Promise<Omit<import("mongoose").Document<unknown, {}, import("../attendance/attendance.schema").AttendanceDocument> & import("../attendance/attendance.schema").Attendance & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    exportMonthlyReport(userId: string, year: number, month: number, res: Response): Promise<void>;
}
