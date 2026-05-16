import { Document, Types } from 'mongoose';
export type AttendanceDocument = Attendance & Document;
export declare enum AttendanceStatus {
    NORMAL = "normal",
    LATE = "late",
    EARLY_LEAVE = "early_leave",
    ABSENT = "absent",
    HALF_DAY = "half_day"
}
export declare class Attendance {
    userId: Types.ObjectId;
    date: string;
    checkInTime: Date;
    checkOutTime: Date;
    workHours: number;
    status: AttendanceStatus;
    checkInStatus: string;
    checkOutStatus: string;
    hasException: boolean;
    exceptionNote: string;
    isProcessed: boolean;
}
export declare const AttendanceSchema: import("mongoose").Schema<Attendance, import("mongoose").Model<Attendance, any, any, any, Document<unknown, any, Attendance> & Attendance & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Attendance, Document<unknown, {}, import("mongoose").FlatRecord<Attendance>> & import("mongoose").FlatRecord<Attendance> & {
    _id: Types.ObjectId;
}>;
