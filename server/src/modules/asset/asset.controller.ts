import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import assetService from './asset.service';
import dashboardService from '../dashboard/dashboard.service';

class AssetController {
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { assets, total } = await assetService.getAll(req.query);
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    res.status(200).json(ApiResponse.paginated(assets, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  });

  getOne = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    res.status(200).json(ApiResponse.success(await assetService.getOne(req.params.publicId)));
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const asset = await assetService.create(req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(asset, 'Asset created successfully'));
  });

  update = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    const asset = await assetService.update(req.params.publicId, req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(asset, 'Asset updated successfully'));
  });

  delete = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    await assetService.delete(req.params.publicId, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Asset deleted successfully'));
  });
}

export default new AssetController();
