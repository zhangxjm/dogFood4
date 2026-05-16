import { Model } from 'mongoose';
import { Attendance, AttendanceDocument } from '../attendance/attendance.schema';
import { Leave, LeaveDocument } from '../leave/leave.schema';
import { Overtime, OvertimeDocument } from '../overtime/overtime.schema';
import { Response } from 'express';
export declare class StatisticsService {
    private attendanceModel;
    private leaveModel;
    private overtimeModel;
    constructor(attendanceModel: Model<AttendanceDocument>, leaveModel: Model<LeaveDocument>, overtimeModel: Model<OvertimeDocument>);
    getMonthlyStatistics(userId: string, year: number, month: number): Promise<{
        totalDays: number;
        normalDays: number;
        lateDays: number;
        earlyLeaveDays: number;
        absentDays: number;
        totalWorkHours: number;
        leaveDays: number;
        overtimeHours: number;
        attendances: (import("mongoose").Document<unknown, {}, AttendanceDocument> & Attendance & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        leaves: (import("mongoose").Document<unknown, {}, LeaveDocument> & Leave & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
        overtimes: (import("mongoose").Document<unknown, {}, OvertimeDocument> & Overtime & import("mongoose").Document<any, any, any> & {
            _id: import("mongoose").Types.ObjectId;
        })[];
    }>;
    getExceptionAttendances(startDate?: string, endDate?: string): Promise<Omit<import("mongoose").Document<unknown, {}, AttendanceDocument> & Attendance & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }, never>[]>;
    exportMonthlyReport(userId: string, year: number, month: number, res: Response): Promise<void>;
}
