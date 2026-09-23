import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import supplierService from './supplier.service';
import dashboardService from '../dashboard/dashboard.service';

class SupplierController {
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { suppliers, total } = await supplierService.getAll(req.query);
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    res.status(200).json(ApiResponse.paginated(suppliers, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  });

  getOne = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    res.status(200).json(ApiResponse.success(await supplierService.getOne(req.params.publicId)));
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const supplier = await supplierService.create(req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(supplier, 'Supplier created successfully'));
  });

  update = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    const supplier = await supplierService.update(req.params.publicId, req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(supplier, 'Supplier updated successfully'));
  });

  delete = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    await supplierService.delete(req.params.publicId, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Supplier deleted successfully'));
  });
}

export default new SupplierController();
