import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { parseISO } from 'date-fns';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('daily-sales')
  getDailySales(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ) {
    const now = new Date();
    const startDate = startDateStr
      ? parseISO(startDateStr)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr ? parseISO(endDateStr) : now;

    return this.statisticsService.getDailySales(startDate, endDate);
  }

  @Get('product-ranking')
  getProductRanking(
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
    @Query('limit') limitStr: string,
  ) {
    const now = new Date();
    const startDate = startDateStr
      ? parseISO(startDateStr)
      : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr ? parseISO(endDateStr) : now;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;

    return this.statisticsService.getProductRanking(startDate, endDate, limit);
  }

  @Get('overview')
  getSalesOverview() {
    return this.statisticsService.getSalesStatistics();
  }
}
