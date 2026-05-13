import { Controller, Get, UseGuards, Request, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuditService } from "./audit.service";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";

@ApiTags("操作记录")
@Controller("audit")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get("my")
  @ApiOperation({ summary: "获取我的操作记录" })
  async getMyLogs(@Request() req) {
    return this.auditService.getUserAuditLogs(req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: "查询操作记录" })
  async getLogs(
    @Query("userId") userId?: string,
    @Query("module") module?: string,
  ) {
    return this.auditService.getAuditLogs(userId, module);
  }
}
