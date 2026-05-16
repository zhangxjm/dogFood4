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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dayjs = require("dayjs");
const attendance_schema_1 = require("./attendance.schema");
const WORK_START_TIME = '09:00';
const WORK_END_TIME = '18:00';
const LATE_THRESHOLD_MINUTES = 30;
const EARLY_LEAVE_THRESHOLD_MINUTES = 30;
let AttendanceService = class AttendanceService {
    constructor(attendanceModel) {
        this.attendanceModel = attendanceModel;
    }
    parseTime(timeStr) {
        const [hour, minute] = timeStr.split(':').map(Number);
        return { hour, minute };
    }
    isLate(checkInTime) {
        const now = dayjs(checkInTime);
        const { hour, minute } = this.parseTime(WORK_START_TIME);
        const workStart = now.hour(hour).minute(minute).second(0);
        return now.isAfter(workStart.add(LATE_THRESHOLD_MINUTES, 'minute'));
    }
    isEarlyLeave(checkOutTime) {
        const now = dayjs(checkOutTime);
        const { hour, minute } = this.parseTime(WORK_END_TIME);
        const workEnd = now.hour(hour).minute(minute).second(0);
        return now.isBefore(workEnd.subtract(EARLY_LEAVE_THRESHOLD_MINUTES, 'minute'));
    }
    calculateWorkHours(checkInTime, checkOutTime) {
        const start = dayjs(checkInTime);
        const end = dayjs(checkOutTime);
        const hours = end.diff(start, 'hour', true);
        return Math.round(hours * 100) / 100;
    }
    calculateStatus(attendance) {
        let status = attendance_schema_1.AttendanceStatus.NORMAL;
        if (!attendance.checkInTime) {
            return attendance_schema_1.AttendanceStatus.ABSENT;
        }
        if (attendance.checkInTime && this.isLate(attendance.checkInTime)) {
            status = attendance_schema_1.AttendanceStatus.LATE;
        }
        if (attendance.checkOutTime && this.isEarlyLeave(attendance.checkOutTime)) {
            status = attendance.checkInTime && this.isLate(attendance.checkInTime)
                ? attendance_schema_1.AttendanceStatus.ABSENT
                : attendance_schema_1.AttendanceStatus.EARLY_LEAVE;
        }
        return status;
    }
    async checkIn(checkInDto) {
        const { userId, time } = checkInDto;
        const now = time || new Date();
        const dateStr = dayjs(now).format('YYYY-MM-DD');
        const existingAttendance = await this.attendanceModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            date: dateStr,
        });
        if (existingAttendance && existingAttendance.checkInTime) {
            throw new common_1.BadRequestException('Already checked in today');
        }
        const checkInStatus = this.isLate(now) ? 'late' : 'on_time';
        if (existingAttendance) {
            existingAttendance.checkInTime = now;
            existingAttendance.checkInStatus = checkInStatus;
            existingAttendance.hasException = checkInStatus === 'late';
            existingAttendance.status = this.calculateStatus(existingAttendance);
            return existingAttendance.save();
        }
        else {
            const attendance = new this.attendanceModel({
                userId: new mongoose_2.Types.ObjectId(userId),
                date: dateStr,
                checkInTime: now,
                checkInStatus,
                hasException: checkInStatus === 'late',
            });
            attendance.status = this.calculateStatus(attendance);
            return attendance.save();
        }
    }
    async checkOut(checkOutDto) {
        const { userId, time } = checkOutDto;
        const now = time || new Date();
        const dateStr = dayjs(now).format('YYYY-MM-DD');
        const attendance = await this.attendanceModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            date: dateStr,
        });
        if (!attendance) {
            throw new common_1.BadRequestException('No check-in record found for today');
        }
        if (attendance.checkOutTime) {
            throw new common_1.BadRequestException('Already checked out today');
        }
        const checkOutStatus = this.isEarlyLeave(now) ? 'early' : 'on_time';
        attendance.checkOutTime = now;
        attendance.checkOutStatus = checkOutStatus;
        attendance.workHours = this.calculateWorkHours(attendance.checkInTime, now);
        attendance.hasException = attendance.hasException || checkOutStatus === 'early';
        attendance.status = this.calculateStatus(attendance);
        return attendance.save();
    }
    async findAll(query) {
        const filter = {};
        if (query.userId) {
            filter.userId = new mongoose_2.Types.ObjectId(query.userId);
        }
        if (query.startDate && query.endDate) {
            filter.date = { $gte: query.startDate, $lte: query.endDate };
        }
        if (query.status) {
            filter.status = query.status;
        }
        return this.attendanceModel.find(filter).populate('userId').sort({ date: -1 }).exec();
    }
    async findOne(id) {
        const attendance = await this.attendanceModel.findById(id).populate('userId').exec();
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        return attendance;
    }
    async update(id, updateAttendanceDto) {
        const attendance = await this.attendanceModel
            .findByIdAndUpdate(id, updateAttendanceDto, { new: true })
            .exec();
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        return attendance;
    }
    async getTodayAttendance(userId) {
        const dateStr = dayjs().format('YYYY-MM-DD');
        return this.attendanceModel
            .findOne({ userId: new mongoose_2.Types.ObjectId(userId), date: dateStr })
            .exec();
    }
    async getMonthlyAttendance(userId, year, month) {
        const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
        const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
        return this.attendanceModel
            .find({
            userId: new mongoose_2.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
        })
            .sort({ date: 1 })
            .exec();
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map