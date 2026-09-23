import mongoose from 'mongoose';
import Ticket from './ticket.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

class TicketService {
  async getAll(query: any) {
    const builder = new QueryBuilder(Ticket.find(), query).search(['ticketNumber', 'subject', 'requesterName', 'department', 'description']).filter().sort().paginate();
    const tickets = await builder.query;
    const total = await builder.countTotal();
    return { tickets, total };
  }

  async getOne(publicId: string) {
    const ticket = await Ticket.findOne({ publicId });
    if (!ticket) throw ApiError.notFound('Ticket not found');
    return ticket;
  }

  async create(data: any, user: { _id?: string; name?: string }) {
    const existing = await Ticket.findOne({ ticketNumber: data.ticketNumber.toUpperCase() });
    if (existing) throw ApiError.conflict('Ticket number already exists');
    const ticket = await Ticket.create({ ...data, createdBy: new mongoose.Types.ObjectId(user._id), createdByName: user.name || 'Unknown' });
    await activityService.logActivity({
      action: 'create',
      entityType: 'ticket',
      entityId: ticket.publicId,
      entityName: ticket.subject,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created ticket ${ticket.ticketNumber}`,
    });
    return ticket;
  }

  async update(publicId: string, data: any, user: { _id?: string; name?: string }) {
    if (data.ticketNumber) {
      const existing = await Ticket.findOne({ ticketNumber: data.ticketNumber.toUpperCase(), publicId: { $ne: publicId } });
      if (existing) throw ApiError.conflict('Ticket number already exists');
    }
    const ticket = await Ticket.findOneAndUpdate({ publicId }, data, { new: true, runValidators: true });
    if (!ticket) throw ApiError.notFound('Ticket not found');
    await activityService.logActivity({
      action: 'update',
      entityType: 'ticket',
      entityId: ticket.publicId,
      entityName: ticket.subject,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Updated ticket ${ticket.ticketNumber}`,
    });
    return ticket;
  }

  async delete(publicId: string, user: { _id?: string; name?: string }) {
    const ticket = await Ticket.findOneAndDelete({ publicId });
    if (!ticket) throw ApiError.notFound('Ticket not found');
    await activityService.logActivity({
      action: 'delete',
      entityType: 'ticket',
      entityId: ticket.publicId,
      entityName: ticket.subject,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted ticket ${ticket.ticketNumber}`,
    });
  }
}

export default new TicketService();
