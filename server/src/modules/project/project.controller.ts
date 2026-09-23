import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import projectService from './project.service';
import dashboardService from '../dashboard/dashboard.service';

class ProjectController {
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { projects, total } = await projectService.getAll(req.query);
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    res.status(200).json(ApiResponse.paginated(projects, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  });

  getOne = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    res.status(200).json(ApiResponse.success(await projectService.getOne(req.params.publicId)));
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const project = await projectService.create(req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(project, 'Project created successfully'));
  });

  update = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    const project = await projectService.update(req.params.publicId, req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(project, 'Project updated successfully'));
  });

  delete = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    await projectService.delete(req.params.publicId, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Project deleted successfully'));
  });
}

export default new ProjectController();
