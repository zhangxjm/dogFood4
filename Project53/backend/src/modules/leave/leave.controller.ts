import { Controller, Get, Post, Body, Param, Delete, Query, Patch } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { CreateLeaveDto, ApproveLeaveDto, LeaveQueryDto } from './leave.dto';

@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  create(@Body() createLeaveDto: CreateLeaveDto) {
    return this.leaveService.create(createLeaveDto);
  }

  @Get()
  findAll(@Query() query: LeaveQueryDto) {
    return this.leaveService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() approveLeaveDto: ApproveLeaveDto) {
    return this.leaveService.approve(id, approveLeaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leaveService.remove(id);
  }
}
