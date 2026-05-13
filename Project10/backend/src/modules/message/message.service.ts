import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema";

export interface CreateMessageDto {
  userId: string;
  type: "approval" | "notification" | "system";
  title: string;
  content?: string;
  processInstanceId?: string;
}

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(dto: CreateMessageDto) {
    const message = new this.messageModel({
      userId: new Types.ObjectId(dto.userId),
      type: dto.type,
      title: dto.title,
      content: dto.content,
      processInstanceId: dto.processInstanceId,
    });
    return message.save();
  }

  async getMessagesByUser(userId: string, isRead?: boolean) {
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (isRead !== undefined) {
      filter.isRead = isRead;
    }
    return this.messageModel.find(filter).sort({ createdAt: -1 });
  }

  async markAsRead(messageId: string) {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException("消息不存在");
    }
    message.isRead = true;
    message.readAt = new Date();
    return message.save();
  }

  async markAllAsRead(userId: string) {
    return this.messageModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true, readAt: new Date() } },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async deleteMessage(messageId: string) {
    const result = await this.messageModel.findByIdAndDelete(messageId);
    if (!result) {
      throw new NotFoundException("消息不存在");
    }
    return result;
  }
}
