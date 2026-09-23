import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import inquiryService from './inquiry.service';
import dashboardService from '../dashboard/dashboard.service';

class InquiryController {
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { inquiries, total } = await inquiryService.getAll(req.query);
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    res.status(200).json(ApiResponse.paginated(inquiries, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  });

  createPublic = catchAsync(async (req: Request, res: Response) => {
    const inquiry = await inquiryService.create(req.body);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(inquiry, 'Inquiry submitted successfully'));
  });

  updateStatus = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    const inquiry = await inquiryService.updateStatus(req.params.publicId, req.body.status);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(inquiry, 'Inquiry updated successfully'));
  });

  delete = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    await inquiryService.delete(req.params.publicId);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Inquiry deleted successfully'));
  });
}

export default new InquiryController();
