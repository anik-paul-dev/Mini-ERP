import { Request, Response } from 'express';
import roleService from './role.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';

type PublicIdParams = { publicId: string };

class RoleController {
  getAllRoles = catchAsync(async (req: Request, res: Response) => {
    const { roles, total } = await roleService.getAllRoles(req.query);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    res.status(200).json(
      ApiResponse.paginated(
        roles,
        { page, limit, total, totalPages: Math.ceil(total / limit) },
        'Roles fetched successfully'
      )
    );
  });

  getRole = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const role = await roleService.getRole(req.params.publicId);
    res.status(200).json(ApiResponse.success(role));
  });

  createRole = catchAsync(async (req: Request, res: Response) => {
    const role = await roleService.createRole(req.body);
    res.status(201).json(ApiResponse.created(role, 'Role created successfully'));
  });

  updateRole = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    const role = await roleService.updateRole(req.params.publicId, req.body);
    res.status(200).json(ApiResponse.success(role, 'Role updated successfully'));
  });

  deleteRole = catchAsync(async (req: Request<PublicIdParams>, res: Response) => {
    await roleService.deleteRole(req.params.publicId);
    res.status(200).json(ApiResponse.success(null, 'Role deleted successfully'));
  });
}

export default new RoleController();
