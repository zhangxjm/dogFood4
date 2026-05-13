import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ProcessInstanceDocument = ProcessInstance & Document;

export enum ProcessStatus {
  PENDING = "pending",
  RUNNING = "running",
  APPROVED = "approved",
  REJECTED = "rejected",
  CANCELED = "canceled",
}

export enum ApproveAction {
  APPROVE = "approve",
  REJECT = "reject",
  REASSIGN = "reassign",
  COMMENT = "comment",
}

export interface TaskItem {
  id: string;
  nodeId: string;
  nodeName: string;
  assigneeId: Types.ObjectId;
  assigneeName: string;
  status: "pending" | "approved" | "rejected" | "completed";
  action?: ApproveAction;
  comment?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface FormData {
  [key: string]: any;
}

@Schema({ timestamps: true })
export class ProcessInstance {
  @Prop({ type: Types.ObjectId, ref: "ProcessDefinition", required: true })
  processDefinitionId: Types.ObjectId;

  @Prop({ required: true })
  processDefinitionName: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  initiatorId: Types.ObjectId;

  @Prop({ required: true })
  initiatorName: string;

  @Prop()
  title: string;

  @Prop({ type: Object })
  formData: FormData;

  @Prop({ type: [String], default: [] })
  attachments: string[];

  @Prop({ type: String, enum: ProcessStatus, default: ProcessStatus.PENDING })
  status: ProcessStatus;

  @Prop()
  currentNodeId: string;

  @Prop({ type: [{ type: Object }], default: [] })
  taskHistory: TaskItem[];

  @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
  currentAssignees: Types.ObjectId[];

  @Prop()
  rejectedReason: string;

  @Prop()
  completedAt: Date;
}

export const ProcessInstanceSchema =
  SchemaFactory.createForClass(ProcessInstance);
