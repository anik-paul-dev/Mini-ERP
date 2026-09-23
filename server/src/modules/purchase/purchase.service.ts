import mongoose from 'mongoose';
import Purchase from './purchase.model';
import Supplier from '../supplier/supplier.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

const preparePurchase = async (data: any) => {
  const supplier = await Supplier.findOne({ publicId: data.supplierPublicId });
  if (!supplier) throw ApiError.badRequest('Supplier not found');
  const items = data.items.map((item: any) => ({
    ...item,
    totalCost: Number(item.quantity) * Number(item.unitCost),
  }));
  const totalAmount = items.reduce((sum: number, item: any) => sum + item.totalCost, 0);
  return { ...data, supplierName: supplier.name, items, totalAmount };
};

class PurchaseService {
  async getAll(query: any) {
    const builder = new QueryBuilder(Purchase.find(), query).search(['orderNumber', 'supplierName', 'notes']).filter().sort().paginate();
    const purchases = await builder.query;
    const total = await builder.countTotal();
    return { purchases, total };
  }

  async getOne(publicId: string) {
    const purchase = await Purchase.findOne({ publicId });
    if (!purchase) throw ApiError.notFound('Purchase order not found');
    return purchase;
  }

  async create(data: any, user: { _id?: string; name?: string }) {
    const existing = await Purchase.findOne({ orderNumber: data.orderNumber.toUpperCase() });
    if (existing) throw ApiError.conflict('Purchase order number already exists');
    const prepared = await preparePurchase(data);
    const purchase = await Purchase.create({
      ...prepared,
      createdBy: new mongoose.Types.ObjectId(user._id),
      createdByName: user.name || 'Unknown',
    });
    await activityService.logActivity({
      action: 'create',
      entityType: 'purchase',
      entityId: purchase.publicId,
      entityName: purchase.orderNumber,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created purchase order ${purchase.orderNumber}`,
    });
    return purchase;
  }

  async update(publicId: string, data: any, user: { _id?: string; name?: string }) {
    if (data.orderNumber) {
      const existing = await Purchase.findOne({ orderNumber: data.orderNumber.toUpperCase(), publicId: { $ne: publicId } });
      if (existing) throw ApiError.conflict('Purchase order number already exists');
    }
    const prepared = data.supplierPublicId || data.items ? await preparePurchase({ ...(await this.getOne(publicId)).toObject(), ...data }) : data;
    const purchase = await Purchase.findOneAndUpdate({ publicId }, prepared, { new: true, runValidators: true });
    if (!purchase) throw ApiError.notFound('Purchase order not found');
    await activityService.logActivity({
      action: 'update',
      entityType: 'purchase',
      entityId: purchase.publicId,
      entityName: purchase.orderNumber,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Updated purchase order ${purchase.orderNumber}`,
    });
    return purchase;
  }

  async delete(publicId: string, user: { _id?: string; name?: string }) {
    const purchase = await Purchase.findOneAndDelete({ publicId });
    if (!purchase) throw ApiError.notFound('Purchase order not found');
    await activityService.logActivity({
      action: 'delete',
      entityType: 'purchase',
      entityId: purchase.publicId,
      entityName: purchase.orderNumber,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted purchase order ${purchase.orderNumber}`,
    });
  }
}

export default new PurchaseService();
