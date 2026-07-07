import { Request, Response } from 'express';
import saleService from './sale.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import dashboardService from '../dashboard/dashboard.service';

class SaleController {
  getAllSales = catchAsync(async (req: Request, res: Response) => {
    const { sales, total } = await saleService.getAllSales(req.query);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    res.status(200).json(
      ApiResponse.paginated(
        sales,
        { page, limit, total, totalPages: Math.ceil(total / limit) },
        'Sales fetched successfully'
      )
    );
  });

  getSale = catchAsync(async (req: Request, res: Response) => {
    const sale = await saleService.getSale(req.params.publicId);
    res.status(200).json(ApiResponse.success(sale));
  });

  createSale = catchAsync(async (req: Request, res: Response) => {
    const user = { _id: req.user!._id, name: (req.user as any).name || 'Unknown' };
    const sale = await saleService.createSale(req.body, user);
    
    await dashboardService.invalidateCache();
    
    res.status(201).json(ApiResponse.created(sale, 'Sale created successfully'));
  });
}

export default new SaleController();
