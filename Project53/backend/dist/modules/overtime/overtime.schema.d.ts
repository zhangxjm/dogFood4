import { Document, Types } from 'mongoose';
export type OvertimeDocument = Overtime & Document;
export declare enum OvertimeType {
    WEEKDAY = "weekday",
    WEEKEND = "weekend",
    HOLIDAY = "holiday"
}
export declare enum OvertimeStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Overtime {
    userId: Types.ObjectId;
    type: OvertimeType;
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    reason: string;
    status: OvertimeStatus;
    approver: string;
    approveNote: string;
    approveTime: Date;
}
export declare const OvertimeSchema: import("mongoose").Schema<Overtime, import("mongoose").Model<Overtime, any, any, any, Document<unknown, any, Overtime> & Overtime & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Overtime, Document<unknown, {}, import("mongoose").FlatRecord<Overtime>> & import("mongoose").FlatRecord<Overtime> & {
    _id: Types.ObjectId;
}>;
