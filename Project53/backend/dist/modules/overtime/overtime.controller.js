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
exports.OvertimeController = void 0;
const common_1 = require("@nestjs/common");
const overtime_service_1 = require("./overtime.service");
const overtime_dto_1 = require("./overtime.dto");
let OvertimeController = class OvertimeController {
    constructor(overtimeService) {
        this.overtimeService = overtimeService;
    }
    create(createOvertimeDto) {
        return this.overtimeService.create(createOvertimeDto);
    }
    findAll(query) {
        return this.overtimeService.findAll(query);
    }
    findOne(id) {
        return this.overtimeService.findOne(id);
    }
    approve(id, approveOvertimeDto) {
        return this.overtimeService.approve(id, approveOvertimeDto);
    }
    remove(id) {
        return this.overtimeService.remove(id);
    }
};
exports.OvertimeController = OvertimeController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [overtime_dto_1.CreateOvertimeDto]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [overtime_dto_1.OvertimeQueryDto]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, overtime_dto_1.ApproveOvertimeDto]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "approve", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "remove", null);
exports.OvertimeController = OvertimeController = __decorate([
    (0, common_1.Controller)('overtime'),
    __metadata("design:paramtypes", [overtime_service_1.OvertimeService])
], OvertimeController);
//# sourceMappingURL=overtime.controller.js.map