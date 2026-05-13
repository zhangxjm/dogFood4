import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  UseGuards,
  Request,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ProcessService } from "./process.service";
import {
  CreateProcessDefinitionDto,
  CreateProcessInstanceDto,
  ApproveTaskDto,
  QueryProcessDto,
} from "./dto/process.dto";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";

@ApiTags("流程管理")
@Controller("process")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class ProcessController {
  constructor(private readonly processService: ProcessService) {}

  @Post("definitions")
  @ApiOperation({ summary: "创建流程定义" })
  @UsePipes(new ValidationPipe())
  async createProcessDefinition(@Body() dto: CreateProcessDefinitionDto) {
    return this.processService.createProcessDefinition(dto);
  }

  @Get("definitions")
  @ApiOperation({ summary: "获取所有流程定义" })
  async getAllProcessDefinitions() {
    return this.processService.getAllProcessDefinitions();
  }

  @Get("definitions/:id")
  @ApiOperation({ summary: "获取流程定义详情" })
  async getProcessDefinition(@Param("id") id: string) {
    return this.processService.getProcessDefinitionById(id);
  }

  @Get("definitions/:id/flow-chart")
  @ApiOperation({ summary: "获取流程图数据" })
  async getFlowChart(@Param("id") id: string) {
    return this.processService.getProcessFlowChart(id);
  }

  @Post("start")
  @ApiOperation({ summary: "发起审批流程" })
  @UsePipes(new ValidationPipe())
  async startProcess(@Request() req, @Body() dto: CreateProcessInstanceDto) {
    return this.processService.startProcess(req.user.sub, dto);
  }

  @Put("instances/:id/approve")
  @ApiOperation({ summary: "审批任务" })
  @UsePipes(new ValidationPipe())
  async approveTask(
    @Param("id") id: string,
    @Request() req,
    @Body() dto: ApproveTaskDto,
  ) {
    return this.processService.approveTask(id, req.user.sub, dto);
  }

  @Get("instances/pending")
  @ApiOperation({ summary: "获取我的待办任务" })
  async getMyPendingTasks(@Request() req) {
    return this.processService.getMyPendingTasks(req.user.sub);
  }

  @Get("instances/my")
  @ApiOperation({ summary: "获取我发起的流程" })
  async getMyStartedProcesses(@Request() req) {
    return this.processService.getMyStartedProcesses(req.user.sub);
  }

  @Get("instances")
  @ApiOperation({ summary: "获取所有流程实例" })
  async getAllProcesses(@Query() query: QueryProcessDto) {
    return this.processService.getAllProcesses(query);
  }

  @Get("instances/:id")
  @ApiOperation({ summary: "获取流程详情" })
  async getProcessDetail(@Param("id") id: string) {
    return this.processService.getProcessDetail(id);
  }
}
