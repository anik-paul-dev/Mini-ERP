import { Request, Response } from 'express';
import saleService from './sale.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import dashboardService from '../dashboard/dashboard.service';
import { getIO } from '../../config/socket';

type PublicIdParams = { publicId: string };

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

  getSale = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const sale = await saleService.getSale(req.params.publicId);
    res.status(200).json(ApiResponse.success(sale));
  });

  createSale = catchAsync(async (req: Request, res: Response) => {
    const user = { _id: req.user!._id, name: req.user!.name || 'Unknown' };
    const sale = await saleService.createSale(req.body, user);
    
    await dashboardService.invalidateCache();
    getIO().emit('sale-created', { saleId: sale.publicId, grandTotal: sale.grandTotal, customerName: sale.customerName });
    
    res.status(201).json(ApiResponse.created(sale, 'Sale created successfully'));
  });

  exportSales = catchAsync(async (req: Request, res: Response) => {
    const csv = await saleService.exportSalesCSV(req.query);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_export.csv');
    res.status(200).send(csv);
  });
}

export default new SaleController();
