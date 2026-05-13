import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { MessageService } from "./message.service";
import { JwtAuthGuard } from "../user/guards/jwt-auth.guard";

@ApiTags("消息管理")
@Controller("messages")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  @ApiOperation({ summary: "获取消息列表" })
  async getMessages(@Request() req, @Query("isRead") isRead?: string) {
    return this.messageService.getMessagesByUser(
      req.user.sub,
      isRead === "true",
    );
  }

  @Get("unread-count")
  @ApiOperation({ summary: "获取未读消息数" })
  async getUnreadCount(@Request() req) {
    const count = await this.messageService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Put(":id/read")
  @ApiOperation({ summary: "标记消息为已读" })
  async markAsRead(@Param("id") id: string) {
    return this.messageService.markAsRead(id);
  }

  @Put("read-all")
  @ApiOperation({ summary: "标记所有消息为已读" })
  async markAllAsRead(@Request() req) {
    return this.messageService.markAllAsRead(req.user.sub);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除消息" })
  async deleteMessage(@Param("id") id: string) {
    return this.messageService.deleteMessage(id);
  }
}
