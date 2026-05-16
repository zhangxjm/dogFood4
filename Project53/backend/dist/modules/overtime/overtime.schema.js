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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OvertimeSchema = exports.Overtime = exports.OvertimeStatus = exports.OvertimeType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var OvertimeType;
(function (OvertimeType) {
    OvertimeType["WEEKDAY"] = "weekday";
    OvertimeType["WEEKEND"] = "weekend";
    OvertimeType["HOLIDAY"] = "holiday";
})(OvertimeType || (exports.OvertimeType = OvertimeType = {}));
var OvertimeStatus;
(function (OvertimeStatus) {
    OvertimeStatus["PENDING"] = "pending";
    OvertimeStatus["APPROVED"] = "approved";
    OvertimeStatus["REJECTED"] = "rejected";
})(OvertimeStatus || (exports.OvertimeStatus = OvertimeStatus = {}));
let Overtime = class Overtime {
};
exports.Overtime = Overtime;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Overtime.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: OvertimeType, required: true }),
    __metadata("design:type", String)
], Overtime.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Overtime.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Overtime.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Overtime.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Overtime.prototype, "hours", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Overtime.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: OvertimeStatus, default: OvertimeStatus.PENDING }),
    __metadata("design:type", String)
], Overtime.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Overtime.prototype, "approver", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Overtime.prototype, "approveNote", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Overtime.prototype, "approveTime", void 0);
exports.Overtime = Overtime = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Overtime);
exports.OvertimeSchema = mongoose_1.SchemaFactory.createForClass(Overtime);
//# sourceMappingURL=overtime.schema.js.map