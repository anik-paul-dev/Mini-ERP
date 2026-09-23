import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';
import ticketService from './ticket.service';
import dashboardService from '../dashboard/dashboard.service';

class TicketController {
  getAll = catchAsync(async (req: Request, res: Response) => {
    const { tickets, total } = await ticketService.getAll(req.query);
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '10');
    res.status(200).json(ApiResponse.paginated(tickets, { page, limit, total, totalPages: Math.ceil(total / limit) }));
  });

  getOne = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    res.status(200).json(ApiResponse.success(await ticketService.getOne(req.params.publicId)));
  });

  create = catchAsync(async (req: Request, res: Response) => {
    const ticket = await ticketService.create(req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(201).json(ApiResponse.created(ticket, 'Ticket created successfully'));
  });

  update = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    const ticket = await ticketService.update(req.params.publicId, req.body, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(ticket, 'Ticket updated successfully'));
  });

  delete = catchAsync(async (req: Request<{ publicId: string }>, res: Response) => {
    await ticketService.delete(req.params.publicId, req.user!);
    await dashboardService.invalidateCache();
    res.status(200).json(ApiResponse.success(null, 'Ticket deleted successfully'));
  });
}

export default new TicketController();
