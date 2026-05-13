import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  ProcessDefinition,
  ProcessDefinitionDocument,
  ProcessType,
  NodeType,
} from "./schemas/process-definition.schema";
import {
  ProcessInstance,
  ProcessInstanceDocument,
  ProcessStatus,
  ApproveAction,
  TaskItem,
} from "./schemas/process-instance.schema";
import {
  CreateProcessDefinitionDto,
  CreateProcessInstanceDto,
  ApproveTaskDto,
  QueryProcessDto,
} from "./dto/process.dto";
import { UserService } from "../user/user.service";
import { User, UserRole } from "../user/schemas/user.schema";
import { AuditService } from "../audit/audit.service";
import { MessageService } from "../message/message.service";
import { REDIS_CLIENT } from "../../common/redis/redis.module";
import Redis from "ioredis";

@Injectable()
export class ProcessService {
  constructor(
    @InjectModel(ProcessDefinition.name)
    private processDefModel: Model<ProcessDefinitionDocument>,
    @InjectModel(ProcessInstance.name)
    private processInstanceModel: Model<ProcessInstanceDocument>,
    private userService: UserService,
    private auditService: AuditService,
    private messageService: MessageService,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async initDefaultProcesses() {
    const count = await this.processDefModel.countDocuments();
    if (count > 0) return;

    const defaultProcesses = [
      {
        code: "LEAVE_APPLICATION",
        name: "请假申请",
        type: ProcessType.LEAVE,
        description: "员工请假审批流程",
        nodes: [
          {
            id: "start",
            name: "发起申请",
            type: NodeType.START,
            nextNodeId: "node1",
          },
          {
            id: "node1",
            name: "直属领导审批",
            type: NodeType.APPROVE,
            approveRule: { type: "manager", level: 1 },
            nextNodeId: "node2",
          },
          {
            id: "node2",
            name: "HR审批",
            type: NodeType.APPROVE,
            approveRule: { type: "role", value: UserRole.HR },
            nextNodeId: "end",
          },
          { id: "end", name: "流程结束", type: NodeType.END },
        ],
      },
      {
        code: "REIMBURSEMENT",
        name: "报销申请",
        type: ProcessType.REIMBURSEMENT,
        description: "费用报销审批流程",
        nodes: [
          {
            id: "start",
            name: "发起申请",
            type: NodeType.START,
            nextNodeId: "node1",
          },
          {
            id: "node1",
            name: "直属领导审批",
            type: NodeType.APPROVE,
            approveRule: { type: "manager", level: 1 },
            nextNodeId: "node2",
          },
          {
            id: "node2",
            name: "财务审批",
            type: NodeType.APPROVE,
            approveRule: { type: "role", value: UserRole.FINANCE },
            nextNodeId: "end",
          },
          { id: "end", name: "流程结束", type: NodeType.END },
        ],
      },
      {
        code: "BUSINESS_TRIP",
        name: "出差申请",
        type: ProcessType.BUSINESS_TRIP,
        description: "出差审批流程",
        nodes: [
          {
            id: "start",
            name: "发起申请",
            type: NodeType.START,
            nextNodeId: "node1",
          },
          {
            id: "node1",
            name: "直属领导审批",
            type: NodeType.APPROVE,
            approveRule: { type: "manager", level: 1 },
            nextNodeId: "node2",
          },
          {
            id: "node2",
            name: "部门经理审批",
            type: NodeType.APPROVE,
            approveRule: { type: "role", value: UserRole.MANAGER },
            nextNodeId: "end",
          },
          { id: "end", name: "流程结束", type: NodeType.END },
        ],
      },
    ];

    for (const proc of defaultProcesses) {
      await this.processDefModel.create(proc);
    }
    console.log("Default processes initialized");
  }

  async createProcessDefinition(dto: CreateProcessDefinitionDto) {
    const existing = await this.processDefModel.findOne({ code: dto.code });
    if (existing) {
      throw new BadRequestException("流程编码已存在");
    }
    return this.processDefModel.create(dto);
  }

  async getAllProcessDefinitions() {
    return this.processDefModel.find({ isActive: true });
  }

  async getProcessDefinitionById(id: string) {
    const def = await this.processDefModel.findById(id);
    if (!def) {
      throw new NotFoundException("流程定义不存在");
    }
    return def;
  }

  async startProcess(initiatorId: string, dto: CreateProcessInstanceDto) {
    const initiator = await this.userService.findById(initiatorId);
    const processDef = await this.getProcessDefinitionById(
      dto.processDefinitionId,
    );

    const instance = new this.processInstanceModel({
      processDefinitionId: new Types.ObjectId(dto.processDefinitionId),
      processDefinitionName: processDef.name,
      initiatorId: new Types.ObjectId(initiatorId),
      initiatorName: initiator.name,
      title: dto.title,
      formData: dto.formData,
      attachments: dto.attachments || [],
      status: ProcessStatus.RUNNING,
      taskHistory: [],
    });

    const startNode = processDef.nodes.find((n) => n.type === NodeType.START);
    const firstApproveNode = processDef.nodes.find(
      (n) => n.id === startNode.nextNodeId,
    );

    if (firstApproveNode) {
      instance.currentNodeId = firstApproveNode.id;
      const assignees = await this.resolveAssignees(
        firstApproveNode.approveRule,
        initiator,
      );
      instance.currentAssignees = assignees.map(
        (a) => new Types.ObjectId((a as any)._id),
      );

      for (const assignee of assignees) {
        const assigneeId = (assignee as any)._id;
        const task: TaskItem = {
          id: new Types.ObjectId().toString(),
          nodeId: firstApproveNode.id,
          nodeName: firstApproveNode.name,
          assigneeId: new Types.ObjectId(assigneeId),
          assigneeName: assignee.name,
          status: "pending",
          createdAt: new Date(),
        };
        instance.taskHistory.push(task);

        await this.messageService.createMessage({
          userId: assigneeId.toString(),
          type: "approval",
          title: `您有新的审批任务：${dto.title}`,
          content: `来自 ${initiator.name} 的审批申请，请及时处理。`,
          processInstanceId: instance._id.toString(),
        });
      }
    }

    await instance.save();

    await this.auditService.createAuditLog({
      userId: initiatorId,
      action: "create",
      module: "process",
      resourceId: instance._id.toString(),
      details: `发起审批流程：${dto.title}`,
    });

    return instance;
  }

  private async resolveAssignees(
    approveRule: {
      type: "role" | "user" | "manager" | "department";
      value?: string;
      level?: number;
    },
    initiator: User,
  ): Promise<User[]> {
    switch (approveRule.type) {
      case "role":
        return this.userService.findByRole(approveRule.value as UserRole);
      case "user":
        return [await this.userService.findById(approveRule.value)];
      case "manager":
        if (initiator.managerId) {
          return [
            await this.userService.findById(initiator.managerId.toString()),
          ];
        }
        const managers = await this.userService.findByRole(UserRole.MANAGER);
        return managers.length > 0
          ? managers.slice(0, 1)
          : await this.userService.findByRole(UserRole.ADMIN);
      default:
        return await this.userService.findByRole(UserRole.ADMIN);
    }
  }

  async approveTask(
    processInstanceId: string,
    userId: string,
    dto: ApproveTaskDto,
  ) {
    const instance =
      await this.processInstanceModel.findById(processInstanceId);
    if (!instance) {
      throw new NotFoundException("流程实例不存在");
    }

    if (instance.status !== ProcessStatus.RUNNING) {
      throw new BadRequestException("流程当前状态不可审批");
    }

    const currentTask = instance.taskHistory.find(
      (t) =>
        t.nodeId === instance.currentNodeId &&
        t.status === "pending" &&
        t.assigneeId.toString() === userId,
    );

    if (!currentTask) {
      throw new BadRequestException("您没有当前节点的审批权限");
    }

    const user = await this.userService.findById(userId);

    currentTask.status =
      dto.action === ApproveAction.APPROVE ? "approved" : "rejected";
    currentTask.action = dto.action;
    currentTask.comment = dto.comment;
    currentTask.completedAt = new Date();

    await this.auditService.createAuditLog({
      userId,
      action: dto.action,
      module: "process",
      resourceId: processInstanceId,
      details: `审批任务：${currentTask.nodeName} - ${dto.action === ApproveAction.APPROVE ? "通过" : "驳回"}，备注：${dto.comment || "无"}`,
    });

    if (dto.action === ApproveAction.REJECT) {
      instance.status = ProcessStatus.REJECTED;
      instance.rejectedReason = dto.comment || "审批驳回";
      instance.completedAt = new Date();
      await instance.save();

      await this.messageService.createMessage({
        userId: instance.initiatorId.toString(),
        type: "notification",
        title: `您的申请被驳回：${instance.title}`,
        content: `${user.name} 驳回了您的审批申请。备注：${dto.comment || "无"}`,
        processInstanceId,
      });

      return instance;
    }

    const processDef = await this.getProcessDefinitionById(
      instance.processDefinitionId.toString(),
    );
    const currentNode = processDef.nodes.find(
      (n) => n.id === instance.currentNodeId,
    );
    const nextNodeId = currentNode.nextNodeId;
    const nextNode = processDef.nodes.find((n) => n.id === nextNodeId);

    if (nextNode.type === NodeType.END) {
      instance.status = ProcessStatus.APPROVED;
      instance.currentNodeId = null;
      instance.currentAssignees = [];
      instance.completedAt = new Date();
      await instance.save();

      await this.messageService.createMessage({
        userId: instance.initiatorId.toString(),
        type: "notification",
        title: `您的申请已通过：${instance.title}`,
        content: `您的审批申请已全部通过。`,
        processInstanceId,
      });

      return instance;
    }

    instance.currentNodeId = nextNode.id;
    const assignees = await this.resolveAssignees(
      nextNode.approveRule,
      await this.userService.findById(instance.initiatorId.toString()),
    );
    instance.currentAssignees = assignees.map(
      (a) => new Types.ObjectId((a as any)._id),
    );

    for (const assignee of assignees) {
      const assigneeId = (assignee as any)._id;
      const task: TaskItem = {
        id: new Types.ObjectId().toString(),
        nodeId: nextNode.id,
        nodeName: nextNode.name,
        assigneeId: new Types.ObjectId(assigneeId),
        assigneeName: assignee.name,
        status: "pending",
        createdAt: new Date(),
      };
      instance.taskHistory.push(task);

      await this.messageService.createMessage({
        userId: assigneeId.toString(),
        type: "approval",
        title: `您有新的审批任务：${instance.title}`,
        content: `来自 ${instance.initiatorName} 的审批申请，请及时处理。`,
        processInstanceId,
      });
    }

    await instance.save();
    return instance;
  }

  async getMyPendingTasks(userId: string) {
    return this.processInstanceModel
      .find({
        status: ProcessStatus.RUNNING,
        currentAssignees: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 });
  }

  async getMyStartedProcesses(userId: string) {
    return this.processInstanceModel
      .find({
        initiatorId: new Types.ObjectId(userId),
      })
      .sort({ createdAt: -1 });
  }

  async getAllProcesses(query: QueryProcessDto) {
    const filter: any = {};
    if (query.status) {
      filter.status = query.status;
    }
    if (query.keyword) {
      filter.title = { $regex: query.keyword, $options: "i" };
    }
    return this.processInstanceModel.find(filter).sort({ createdAt: -1 });
  }

  async getProcessDetail(id: string) {
    const instance = await this.processInstanceModel.findById(id);
    if (!instance) {
      throw new NotFoundException("流程实例不存在");
    }
    const processDef = await this.getProcessDefinitionById(
      instance.processDefinitionId.toString(),
    );
    return {
      instance,
      definition: processDef,
    };
  }

  async getProcessFlowChart(processDefId: string) {
    const processDef = await this.getProcessDefinitionById(processDefId);
    const nodePositions: any = {};
    const connections = [];

    let x = 100;
    const y = 150;

    for (let i = 0; i < processDef.nodes.length; i++) {
      nodePositions[processDef.nodes[i].id] = {
        x: x + i * 200,
        y,
        name: processDef.nodes[i].name,
        type: processDef.nodes[i].type,
      };
    }

    for (const node of processDef.nodes) {
      if (node.nextNodeId) {
        connections.push({
          from: node.id,
          to: node.nextNodeId,
        });
      }
    }

    return {
      nodes: Object.values(nodePositions),
      connections,
      definition: processDef,
    };
  }
}
