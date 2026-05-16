import { Controller, Get, Post, Body, Param, Delete, Query, Patch } from '@nestjs/common';
import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto, ApproveOvertimeDto, OvertimeQueryDto } from './overtime.dto';

@Controller('overtime')
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Post()
  create(@Body() createOvertimeDto: CreateOvertimeDto) {
    return this.overtimeService.create(createOvertimeDto);
  }

  @Get()
  findAll(@Query() query: OvertimeQueryDto) {
    return this.overtimeService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.overtimeService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Body() approveOvertimeDto: ApproveOvertimeDto) {
    return this.overtimeService.approve(id, approveOvertimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.overtimeService.remove(id);
  }
}
