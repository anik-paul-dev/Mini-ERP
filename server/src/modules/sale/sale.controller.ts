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
    getIO().emit('sale-changed', { action: 'created', saleId: sale.publicId });

    res.status(201).json(ApiResponse.created(sale, 'Sale created successfully'));
  });

  updateSale = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const user = { _id: req.user!._id, name: req.user!.name || 'Unknown' };
    const sale = await saleService.updateSale(req.params.publicId, req.body, user);

    await dashboardService.invalidateCache();
    getIO().emit('sale-updated', { saleId: sale.publicId, grandTotal: sale.grandTotal, customerName: sale.customerName });
    getIO().emit('sale-changed', { action: 'updated', saleId: sale.publicId });

    res.status(200).json(ApiResponse.success(sale, 'Sale updated successfully'));
  });

  cancelSale = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const user = { _id: req.user!._id, name: req.user!.name || 'Unknown' };
    const sale = await saleService.cancelSale(req.params.publicId, user);

    await dashboardService.invalidateCache();
    getIO().emit('sale-canceled', { saleId: sale.publicId, grandTotal: sale.grandTotal, customerName: sale.customerName });
    getIO().emit('sale-changed', { action: 'canceled', saleId: sale.publicId });

    res.status(200).json(ApiResponse.success(sale, 'Sale canceled successfully'));
  });

  deleteSale = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    await saleService.deleteSale(req.params.publicId, { _id: req.user!._id, name: req.user!.name || 'Unknown' });

    await dashboardService.invalidateCache();
    getIO().emit('sale-deleted', { saleId: req.params.publicId });
    getIO().emit('sale-changed', { action: 'deleted', saleId: req.params.publicId });

    res.status(200).json(ApiResponse.success(null, 'Sale deleted successfully'));
  });

  exportSales = catchAsync(async (req: Request, res: Response) => {
    const csv = await saleService.exportSalesCSV(req.query);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_export.csv');
    res.status(200).send(csv);
  });
}

export default new SaleController();

