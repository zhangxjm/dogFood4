import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto, ApproveOvertimeDto, OvertimeQueryDto } from './overtime.dto';
export declare class OvertimeController {
    private readonly overtimeService;
    constructor(overtimeService: OvertimeService);
    create(createOvertimeDto: CreateOvertimeDto): Promise<import("./overtime.schema").Overtime>;
    findAll(query: OvertimeQueryDto): Promise<import("./overtime.schema").Overtime[]>;
    findOne(id: string): Promise<import("./overtime.schema").Overtime>;
    approve(id: string, approveOvertimeDto: ApproveOvertimeDto): Promise<import("./overtime.schema").Overtime>;
    remove(id: string): Promise<void>;
}
