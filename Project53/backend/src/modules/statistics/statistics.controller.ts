import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('monthly/:userId')
  getMonthlyStatistics(
    @Param('userId') userId: string,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    return this.statisticsService.getMonthlyStatistics(userId, year, month);
  }

  @Get('exceptions')
  getExceptionAttendances(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.statisticsService.getExceptionAttendances(startDate, endDate);
  }

  @Get('export/:userId')
  async exportMonthlyReport(
    @Param('userId') userId: string,
    @Query('year') year: number,
    @Query('month') month: number,
    @Res() res: Response,
  ) {
    await this.statisticsService.exportMonthlyReport(userId, year, month, res);
  }
}
