import { Request, Response } from 'express';
import customerService from './customer.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import dashboardService from '../dashboard/dashboard.service';

type PublicIdParams = { publicId: string };

class CustomerController {
  getAllCustomers = catchAsync(async (req: Request, res: Response) => {
    const { customers, total } = await customerService.getAllCustomers(req.query);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    res.status(200).json(
      ApiResponse.paginated(
        customers,
        { page, limit, total, totalPages: Math.ceil(total / limit) },
        'Customers fetched successfully'
      )
    );
  });

  getCustomer = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const customer = await customerService.getCustomer(req.params.publicId);
    res.status(200).json(ApiResponse.success(customer));
  });

  createCustomer = catchAsync(async (req: Request, res: Response) => {
    const customer = await customerService.createCustomer(req.body, req.user!._id!);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(customer, 'Customer created successfully'));
  });

  updateCustomer = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const customer = await customerService.updateCustomer(req.params.publicId, req.body);
    res.status(200).json(ApiResponse.success(customer, 'Customer updated successfully'));
  });

  deleteCustomer = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    await customerService.deleteCustomer(req.params.publicId);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Customer deleted successfully'));
  });
}

export default new CustomerController();
