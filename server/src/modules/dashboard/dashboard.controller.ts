import { Request, Response } from 'express';
import dashboardService from './dashboard.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';

class DashboardController {
  getStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await dashboardService.getStatistics();
    res.status(200).json(ApiResponse.success(stats, 'Dashboard statistics fetched successfully'));
  });
}

export default new DashboardController();
