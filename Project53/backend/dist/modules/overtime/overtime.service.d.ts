import { Model } from 'mongoose';
import { Overtime, OvertimeDocument } from './overtime.schema';
import { CreateOvertimeDto, ApproveOvertimeDto, OvertimeQueryDto } from './overtime.dto';
export declare class OvertimeService {
    private overtimeModel;
    constructor(overtimeModel: Model<OvertimeDocument>);
    private calculateHours;
    create(createOvertimeDto: CreateOvertimeDto): Promise<Overtime>;
    findAll(query: OvertimeQueryDto): Promise<Overtime[]>;
    findOne(id: string): Promise<Overtime>;
    approve(id: string, approveOvertimeDto: ApproveOvertimeDto): Promise<Overtime>;
    remove(id: string): Promise<void>;
}
