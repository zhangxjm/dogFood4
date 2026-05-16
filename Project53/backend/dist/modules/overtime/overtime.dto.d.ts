import { OvertimeType, OvertimeStatus } from './overtime.schema';
export declare class CreateOvertimeDto {
    userId: string;
    type: OvertimeType;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
}
export declare class ApproveOvertimeDto {
    approver: string;
    status: OvertimeStatus.APPROVED | OvertimeStatus.REJECTED;
    approveNote?: string;
}
export declare class OvertimeQueryDto {
    userId?: string;
    status?: OvertimeStatus;
    startDate?: string;
    endDate?: string;
}
