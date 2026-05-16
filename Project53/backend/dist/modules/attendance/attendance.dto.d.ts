import { AttendanceStatus } from './attendance.schema';
export declare class CheckInDto {
    userId: string;
    time?: Date;
}
export declare class CheckOutDto {
    userId: string;
    time?: Date;
}
export declare class UpdateAttendanceDto {
    checkInTime?: Date;
    checkOutTime?: Date;
    status?: AttendanceStatus;
    hasException?: boolean;
    exceptionNote?: string;
    isProcessed?: boolean;
}
export declare class AttendanceQueryDto {
    userId?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
}
