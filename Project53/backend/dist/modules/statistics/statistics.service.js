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
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const dayjs = require("dayjs");
const ExcelJS = require("exceljs");
const attendance_schema_1 = require("../attendance/attendance.schema");
const leave_schema_1 = require("../leave/leave.schema");
const overtime_schema_1 = require("../overtime/overtime.schema");
let StatisticsService = class StatisticsService {
    constructor(attendanceModel, leaveModel, overtimeModel) {
        this.attendanceModel = attendanceModel;
        this.leaveModel = leaveModel;
        this.overtimeModel = overtimeModel;
    }
    async getMonthlyStatistics(userId, year, month) {
        const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD');
        const endDate = dayjs(startDate).endOf('month').format('YYYY-MM-DD');
        const attendances = await this.attendanceModel
            .find({ userId, date: { $gte: startDate, $lte: endDate } })
            .exec();
        const leaves = await this.leaveModel
            .find({ userId, startDate: { $gte: startDate }, endDate: { $lte: endDate }, status: leave_schema_1.LeaveStatus.APPROVED })
            .exec();
        const overtimes = await this.overtimeModel
            .find({ userId, date: { $gte: startDate, $lte: endDate }, status: overtime_schema_1.OvertimeStatus.APPROVED })
            .exec();
        const statistics = {
            totalDays: attendances.length,
            normalDays: attendances.filter(a => a.status === attendance_schema_1.AttendanceStatus.NORMAL).length,
            lateDays: attendances.filter(a => a.status === attendance_schema_1.AttendanceStatus.LATE).length,
            earlyLeaveDays: attendances.filter(a => a.status === attendance_schema_1.AttendanceStatus.EARLY_LEAVE).length,
            absentDays: attendances.filter(a => a.status === attendance_schema_1.AttendanceStatus.ABSENT).length,
            totalWorkHours: attendances.reduce((sum, a) => sum + (a.workHours || 0), 0),
            leaveDays: leaves.reduce((sum, l) => sum + l.days, 0),
            overtimeHours: overtimes.reduce((sum, o) => sum + o.hours, 0),
            attendances,
            leaves,
            overtimes,
        };
        return statistics;
    }
    async getExceptionAttendances(startDate, endDate) {
        const filter = { hasException: true };
        if (startDate && endDate) {
            filter.date = { $gte: startDate, $lte: endDate };
        }
        return this.attendanceModel.find(filter).populate('userId').sort({ date: -1 }).exec();
    }
    async exportMonthlyReport(userId, year, month, res) {
        const statistics = await this.getMonthlyStatistics(userId, year, month);
        const user = await this.attendanceModel.findOne({ userId }).populate('userId').exec();
        const userName = user?.userId?.name || '员工';
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(`${year}年${month}月考勤报表`);
        worksheet.columns = [
            { header: '日期', key: 'date', width: 15 },
            { header: '签到时间', key: 'checkIn', width: 15 },
            { header: '签退时间', key: 'checkOut', width: 15 },
            { header: '工作时长', key: 'workHours', width: 12 },
            { header: '状态', key: 'status', width: 12 },
            { header: '备注', key: 'remark', width: 20 },
        ];
        const statusMap = {
            [attendance_schema_1.AttendanceStatus.NORMAL]: '正常',
            [attendance_schema_1.AttendanceStatus.LATE]: '迟到',
            [attendance_schema_1.AttendanceStatus.EARLY_LEAVE]: '早退',
            [attendance_schema_1.AttendanceStatus.ABSENT]: '缺勤',
            [attendance_schema_1.AttendanceStatus.HALF_DAY]: '半天',
        };
        statistics.attendances.forEach((attendance) => {
            worksheet.addRow({
                date: attendance.date,
                checkIn: attendance.checkInTime ? dayjs(attendance.checkInTime).format('HH:mm:ss') : '-',
                checkOut: attendance.checkOutTime ? dayjs(attendance.checkOutTime).format('HH:mm:ss') : '-',
                workHours: attendance.workHours || 0,
                status: statusMap[attendance.status] || attendance.status,
                remark: attendance.hasException ? '异常考勤' : '',
            });
        });
        worksheet.addRow([]);
        worksheet.addRow(['统计汇总']);
        worksheet.addRow(['总天数', statistics.totalDays]);
        worksheet.addRow(['正常出勤', statistics.normalDays]);
        worksheet.addRow(['迟到天数', statistics.lateDays]);
        worksheet.addRow(['早退天数', statistics.earlyLeaveDays]);
        worksheet.addRow(['缺勤天数', statistics.absentDays]);
        worksheet.addRow(['总工作时长(小时)', statistics.totalWorkHours.toFixed(2)]);
        worksheet.addRow(['请假天数', statistics.leaveDays]);
        worksheet.addRow(['加班时长(小时)', statistics.overtimeHours.toFixed(2)]);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(userName)}_${year}_${month}_考勤报表.xlsx`);
        await workbook.xlsx.write(res);
        res.end();
    }
};
exports.StatisticsService = StatisticsService;
exports.StatisticsService = StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(attendance_schema_1.Attendance.name)),
    __param(1, (0, mongoose_1.InjectModel)(leave_schema_1.Leave.name)),
    __param(2, (0, mongoose_1.InjectModel)(overtime_schema_1.Overtime.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], StatisticsService);
//# sourceMappingURL=statistics.service.js.map