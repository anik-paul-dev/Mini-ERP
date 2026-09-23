import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import purchaseService from './purchase.service';
import dashboardService from '../dashboard/dashboard.service';

class PurchaseController {
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { purchases, total } = await purchaseService.getAll(req.query);
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    res.status(200).json(ApiResponse.paginated(purchases, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  });

  getOne = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    res.status(200).json(ApiResponse.success(await purchaseService.getOne(req.params.publicId)));
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const purchase = await purchaseService.create(req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(purchase, 'Purchase order created successfully'));
  });

  update = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    const purchase = await purchaseService.update(req.params.publicId, req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(purchase, 'Purchase order updated successfully'));
  });

  delete = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    await purchaseService.delete(req.params.publicId, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Purchase order deleted successfully'));
  });
}

export default new PurchaseController();
