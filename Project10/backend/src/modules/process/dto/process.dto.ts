import {
  IsString,
  IsEnum,
  IsArray,
  IsObject,
  IsOptional,
  IsMongoId,
} from "class-validator";
import { ProcessType, NodeType } from "../schemas/process-definition.schema";
import { ApproveAction } from "../schemas/process-instance.schema";

export interface ProcessNodeDto {
  id: string;
  name: string;
  type: NodeType;
  x?: number;
  y?: number;
  approveRule?: {
    type: "role" | "user" | "manager" | "department";
    value?: string;
    level?: number;
  };
  nextNodeId?: string;
}

export class CreateProcessDefinitionDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(ProcessType)
  type: ProcessType;

  @IsArray()
  nodes: ProcessNodeDto[];

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateProcessInstanceDto {
  @IsMongoId()
  processDefinitionId: string;

  @IsString()
  title: string;

  @IsObject()
  formData: any;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}

export class ApproveTaskDto {
  @IsEnum(ApproveAction)
  action: ApproveAction;

  @IsOptional()
  @IsString()
  comment?: string;
}

export class QueryProcessDto {
  @IsOptional()
  @IsEnum(["pending", "running", "approved", "rejected", "canceled"])
  status?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  keyword?: string;
}
