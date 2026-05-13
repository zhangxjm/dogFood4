import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MessageDocument = Message & Document;

export enum MessageType {
  APPROVAL = "approval",
  NOTIFICATION = "notification",
  SYSTEM = "system",
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: MessageType, default: MessageType.NOTIFICATION })
  type: MessageType;

  @Prop({ required: true })
  title: string;

  @Prop()
  content: string;

  @Prop()
  processInstanceId: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
