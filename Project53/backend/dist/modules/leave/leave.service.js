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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dayjs = require("dayjs");
const leave_schema_1 = require("./leave.schema");
let LeaveService = class LeaveService {
    constructor(leaveModel) {
        this.leaveModel = leaveModel;
    }
    calculateDays(startDate, endDate) {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        return end.diff(start, 'day') + 1;
    }
    async create(createLeaveDto) {
        const { userId, startDate, endDate, ...rest } = createLeaveDto;
        const days = this.calculateDays(startDate, endDate);
        if (days < 1) {
            throw new common_1.BadRequestException('End date must be after start date');
        }
        const leave = new this.leaveModel({
            userId: new mongoose_2.Types.ObjectId(userId),
            startDate,
            endDate,
            days,
            ...rest,
        });
        return leave.save();
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
            filter.startDate = { $gte: query.startDate };
            filter.endDate = { $lte: query.endDate };
        }
        return this.leaveModel.find(filter).populate('userId').sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const leave = await this.leaveModel.findById(id).populate('userId').exec();
        if (!leave) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        return leave;
    }
    async approve(id, approveLeaveDto) {
        const leave = await this.leaveModel.findById(id).exec();
        if (!leave) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        if (leave.status !== leave_schema_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('This leave request has already been processed');
        }
        leave.status = approveLeaveDto.status;
        leave.approver = approveLeaveDto.approver;
        leave.approveNote = approveLeaveDto.approveNote;
        leave.approveTime = new Date();
        return leave.save();
    }
    async remove(id) {
        const result = await this.leaveModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException('Leave request not found');
        }
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(leave_schema_1.Leave.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], LeaveService);
//# sourceMappingURL=leave.service.js.map