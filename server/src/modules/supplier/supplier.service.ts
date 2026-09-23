import mongoose from 'mongoose';
import Supplier from './supplier.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

class SupplierService {
  async getAll(query: any) {
    const builder = new QueryBuilder(Supplier.find(), query).search(['name', 'email', 'phone', 'category']).filter().sort().paginate();
    const suppliers = await builder.query;
    const total = await builder.countTotal();
    return { suppliers, total };
  }

  async getOne(publicId: string) {
    const supplier = await Supplier.findOne({ publicId });
    if (!supplier) throw ApiError.notFound('Supplier not found');
    return supplier;
  }

  async create(data: any, user: { _id?: string; name?: string }) {
    const supplier = await Supplier.create({ ...data, createdBy: new mongoose.Types.ObjectId(user._id) });
    await activityService.logActivity({
      action: 'create',
      entityType: 'supplier',
      entityId: supplier.publicId,
      entityName: supplier.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created supplier ${supplier.name}`,
    });
    return supplier;
  }

  async update(publicId: string, data: any, user: { _id?: string; name?: string }) {
    const supplier = await Supplier.findOneAndUpdate({ publicId }, data, { new: true, runValidators: true });
    if (!supplier) throw ApiError.notFound('Supplier not found');
    await activityService.logActivity({
      action: 'update',
      entityType: 'supplier',
      entityId: supplier.publicId,
      entityName: supplier.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Updated supplier ${supplier.name}`,
    });
    return supplier;
  }

  async delete(publicId: string, user: { _id?: string; name?: string }) {
    const supplier = await Supplier.findOneAndDelete({ publicId });
    if (!supplier) throw ApiError.notFound('Supplier not found');
    await activityService.logActivity({
      action: 'delete',
      entityType: 'supplier',
      entityId: supplier.publicId,
      entityName: supplier.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted supplier ${supplier.name}`,
    });
  }
}

export default new SupplierService();
