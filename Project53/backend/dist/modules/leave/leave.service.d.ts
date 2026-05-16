import { Model } from 'mongoose';
import { Leave, LeaveDocument } from './leave.schema';
import { CreateLeaveDto, ApproveLeaveDto, LeaveQueryDto } from './leave.dto';
export declare class LeaveService {
    private leaveModel;
    constructor(leaveModel: Model<LeaveDocument>);
    private calculateDays;
    create(createLeaveDto: CreateLeaveDto): Promise<Leave>;
    findAll(query: LeaveQueryDto): Promise<Leave[]>;
    findOne(id: string): Promise<Leave>;
    approve(id: string, approveLeaveDto: ApproveLeaveDto): Promise<Leave>;
    remove(id: string): Promise<void>;
}
