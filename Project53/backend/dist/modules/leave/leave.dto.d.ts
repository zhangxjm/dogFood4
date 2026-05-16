import { LeaveType, LeaveStatus } from './leave.schema';
export declare class CreateLeaveDto {
    userId: string;
    type: LeaveType;
    startDate: string;
    endDate: string;
    reason?: string;
}
export declare class ApproveLeaveDto {
    approver: string;
    status: LeaveStatus.APPROVED | LeaveStatus.REJECTED;
    approveNote?: string;
}
export declare class LeaveQueryDto {
    userId?: string;
    status?: LeaveStatus;
    startDate?: string;
    endDate?: string;
}
