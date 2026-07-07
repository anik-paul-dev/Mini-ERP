import { Request, Response } from 'express';
import userService from './user.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';

class UserController {
  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const { users, total } = await userService.getAllUsers(req.query);
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '10');
    
    res.status(200).json(
      ApiResponse.paginated(
        users,
        { page, limit, total, totalPages: Math.ceil(total / limit) },
        'Users fetched successfully'
      )
    );
  });

  getUser = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.getUser(req.params.publicId);
    res.status(200).json(ApiResponse.success(user));
  });

  createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(ApiResponse.created(user, 'User created successfully'));
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.updateUser(req.params.publicId, req.body);
    res.status(200).json(ApiResponse.success(user, 'User updated successfully'));
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    await userService.deleteUser(req.params.publicId);
    res.status(200).json(ApiResponse.success(null, 'User deleted successfully'));
  });
}

export default new UserController();
