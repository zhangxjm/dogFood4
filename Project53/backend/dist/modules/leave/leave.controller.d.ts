import { LeaveService } from './leave.service';
import { CreateLeaveDto, ApproveLeaveDto, LeaveQueryDto } from './leave.dto';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    create(createLeaveDto: CreateLeaveDto): Promise<import("./leave.schema").Leave>;
    findAll(query: LeaveQueryDto): Promise<import("./leave.schema").Leave[]>;
    findOne(id: string): Promise<import("./leave.schema").Leave>;
    approve(id: string, approveLeaveDto: ApproveLeaveDto): Promise<import("./leave.schema").Leave>;
    remove(id: string): Promise<void>;
}
