import { Request, Response } from 'express';
import productService from './product.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import dashboardService from '../dashboard/dashboard.service';

type PublicIdParams = { publicId: string };

class ProductController {
  getAllProducts = catchAsync(async (req: Request, res: Response) => {
    const { products, total } = await productService.getAllProducts(req.query);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    res.status(200).json(
      ApiResponse.paginated(
        products,
        { page, limit, total, totalPages: Math.ceil(total / limit) },
        'Products fetched successfully'
      )
    );
  });

  getProduct = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const product = await productService.getProduct(req.params.publicId);
    res.status(200).json(ApiResponse.success(product));
  });

  createProduct = catchAsync(async (req: Request, res: Response) => {
    const product = await productService.createProduct(req.body, req.file as Express.Multer.File, req.user!._id!);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(product, 'Product created successfully'));
  });

  updateProduct = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const product = await productService.updateProduct(
      req.params.publicId,
      req.body,
      req.file as Express.Multer.File
    );
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(product, 'Product updated successfully'));
  });

  deleteProduct = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    await productService.deleteProduct(req.params.publicId);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Product deleted successfully'));
  });
}

export default new ProductController();
