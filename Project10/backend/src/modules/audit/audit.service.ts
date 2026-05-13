import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AuditLog, AuditLogDocument } from "./schemas/audit-log.schema";

export interface CreateAuditLogDto {
  userId: string;
  action: string;
  module: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async createAuditLog(dto: CreateAuditLogDto) {
    const auditLog = new this.auditLogModel({
      userId: new Types.ObjectId(dto.userId),
      action: dto.action,
      module: dto.module,
      resourceId: dto.resourceId,
      details: dto.details,
      ip: dto.ip,
      userAgent: dto.userAgent,
    });
    return auditLog.save();
  }

  async getAuditLogs(
    userId?: string,
    module?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const filter: any = {};
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }
    if (module) {
      filter.module = module;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }
    return this.auditLogModel.find(filter).sort({ createdAt: -1 });
  }

  async getUserAuditLogs(userId: string) {
    return this.auditLogModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(100);
  }
}
