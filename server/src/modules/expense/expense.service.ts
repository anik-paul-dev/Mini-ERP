import mongoose from 'mongoose';
import Expense from './expense.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

class ExpenseService {
  async getAll(query: any) {
    const builder = new QueryBuilder(Expense.find(), query).search(['title', 'category', 'vendor', 'notes']).filter().sort().paginate();
    const expenses = await builder.query;
    const total = await builder.countTotal();
    return { expenses, total };
  }

  async getOne(publicId: string) {
    const expense = await Expense.findOne({ publicId });
    if (!expense) throw ApiError.notFound('Expense not found');
    return expense;
  }

  async create(data: any, user: { _id?: string; name?: string }) {
    const expense = await Expense.create({ ...data, createdBy: new mongoose.Types.ObjectId(user._id), createdByName: user.name || 'Unknown' });
    await activityService.logActivity({
      action: 'create',
      entityType: 'expense',
      entityId: expense.publicId,
      entityName: expense.title,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created expense ${expense.title}`,
    });
    return expense;
  }

  async update(publicId: string, data: any, user: { _id?: string; name?: string }) {
    const expense = await Expense.findOneAndUpdate({ publicId }, data, { new: true, runValidators: true });
    if (!expense) throw ApiError.notFound('Expense not found');
    await activityService.logActivity({
      action: 'update',
      entityType: 'expense',
      entityId: expense.publicId,
      entityName: expense.title,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Updated expense ${expense.title}`,
    });
    return expense;
  }

  async delete(publicId: string, user: { _id?: string; name?: string }) {
    const expense = await Expense.findOneAndDelete({ publicId });
    if (!expense) throw ApiError.notFound('Expense not found');
    await activityService.logActivity({
      action: 'delete',
      entityType: 'expense',
      entityId: expense.publicId,
      entityName: expense.title,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted expense ${expense.title}`,
    });
  }
}

export default new ExpenseService();
