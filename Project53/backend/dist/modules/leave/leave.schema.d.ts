import { Document, Types } from 'mongoose';
export type LeaveDocument = Leave & Document;
export declare enum LeaveType {
    ANNUAL = "annual",
    SICK = "sick",
    PERSONAL = "personal",
    MARRIAGE = "marriage",
    MATERNITY = "maternity",
    OTHER = "other"
}
export declare enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Leave {
    userId: Types.ObjectId;
    type: LeaveType;
    startDate: string;
    endDate: string;
    days: number;
    reason: string;
    status: LeaveStatus;
    approver: string;
    approveNote: string;
    approveTime: Date;
}
export declare const LeaveSchema: import("mongoose").Schema<Leave, import("mongoose").Model<Leave, any, any, any, Document<unknown, any, Leave> & Leave & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Leave, Document<unknown, {}, import("mongoose").FlatRecord<Leave>> & import("mongoose").FlatRecord<Leave> & {
    _id: Types.ObjectId;
}>;
