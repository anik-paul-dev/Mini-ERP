import { Request, Response } from 'express';
import activityService from './activity.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';

class ActivityController {
  getAllActivities = catchAsync(async (req: Request, res: Response) => {
    const { activities, total } = await activityService.getAllActivities(req.query);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    res.status(200).json(
      ApiResponse.paginated(
        activities,
        { page, limit, total, totalPages: Math.ceil(total / limit) },
        'Activities fetched successfully'
      )
    );
  });
}

export default new ActivityController();
