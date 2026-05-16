"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OvertimeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dayjs = require("dayjs");
const overtime_schema_1 = require("./overtime.schema");
let OvertimeService = class OvertimeService {
    constructor(overtimeModel) {
        this.overtimeModel = overtimeModel;
    }
    calculateHours(startTime, endTime) {
        const start = dayjs(`2000-01-01 ${startTime}`);
        const end = dayjs(`2000-01-01 ${endTime}`);
        const hours = end.diff(start, 'hour', true);
        return Math.round(hours * 100) / 100;
    }
    async create(createOvertimeDto) {
        const { userId, startTime, endTime, ...rest } = createOvertimeDto;
        const hours = this.calculateHours(startTime, endTime);
        if (hours <= 0) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
        const overtime = new this.overtimeModel({
            userId: new mongoose_2.Types.ObjectId(userId),
            startTime,
            endTime,
            hours,
            ...rest,
        });
        return overtime.save();
    }
    async findAll(query) {
        const filter = {};
        if (query.userId) {
            filter.userId = new mongoose_2.Types.ObjectId(query.userId);
        }
        if (query.status) {
            filter.status = query.status;
        }
        if (query.startDate && query.endDate) {
            filter.date = { $gte: query.startDate, $lte: query.endDate };
        }
        return this.overtimeModel.find(filter).populate('userId').sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const overtime = await this.overtimeModel.findById(id).populate('userId').exec();
        if (!overtime) {
            throw new common_1.NotFoundException('Overtime record not found');
        }
        return overtime;
    }
    async approve(id, approveOvertimeDto) {
        const overtime = await this.overtimeModel.findById(id).exec();
        if (!overtime) {
            throw new common_1.NotFoundException('Overtime record not found');
        }
        if (overtime.status !== overtime_schema_1.OvertimeStatus.PENDING) {
            throw new common_1.BadRequestException('This overtime record has already been processed');
        }
        overtime.status = approveOvertimeDto.status;
        overtime.approver = approveOvertimeDto.approver;
        overtime.approveNote = approveOvertimeDto.approveNote;
        overtime.approveTime = new Date();
        return overtime.save();
    }
    async remove(id) {
        const result = await this.overtimeModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Overtime record not found');
        }
    }
};
exports.OvertimeService = OvertimeService;
exports.OvertimeService = OvertimeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(overtime_schema_1.Overtime.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], OvertimeService);
//# sourceMappingURL=overtime.service.js.map