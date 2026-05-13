import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ProcessDefinitionDocument = ProcessDefinition & Document;

export enum ProcessType {
  LEAVE = "leave",
  REIMBURSEMENT = "reimbursement",
  BUSINESS_TRIP = "business_trip",
}

export enum NodeType {
  START = "start",
  APPROVE = "approve",
  CONDITION = "condition",
  END = "end",
}

export interface ApproveRule {
  type: "role" | "user" | "manager" | "department";
  value?: string;
  level?: number;
}

export interface ProcessNode {
  id: string;
  name: string;
  type: NodeType;
  x?: number;
  y?: number;
  approveRule?: ApproveRule;
  nextNodeId?: string;
  conditionExpression?: string;
}

@Schema({ timestamps: true })
export class ProcessDefinition {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: ProcessType, required: true })
  type: ProcessType;

  @Prop({ type: [{ type: Object }] })
  nodes: ProcessNode[];

  @Prop()
  description: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 1 })
  version: number;
}

export const ProcessDefinitionSchema =
  SchemaFactory.createForClass(ProcessDefinition);
