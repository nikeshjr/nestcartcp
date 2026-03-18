import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard, RolesGuard } from '../auth/auth.guard';
import { Roles } from '../auth/auth.decorator';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getStats() {
    return this.analyticsService.getDashboardStats();
  }
}
