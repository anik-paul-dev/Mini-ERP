import mongoose from 'mongoose';
import Asset from './asset.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

class AssetService {
  async getAll(query: any) {
    const builder = new QueryBuilder(Asset.find(), query).search(['assetTag', 'name', 'category', 'location', 'assignedTo']).filter().sort().paginate();
    const assets = await builder.query;
    const total = await builder.countTotal();
    return { assets, total };
  }

  async getOne(publicId: string) {
    const asset = await Asset.findOne({ publicId });
    if (!asset) throw ApiError.notFound('Asset not found');
    return asset;
  }

  async create(data: any, user: { _id?: string; name?: string }) {
    const existing = await Asset.findOne({ assetTag: data.assetTag.toUpperCase() });
    if (existing) throw ApiError.conflict('Asset tag already exists');
    const asset = await Asset.create({ ...data, createdBy: new mongoose.Types.ObjectId(user._id), createdByName: user.name || 'Unknown' });
    await activityService.logActivity({
      action: 'create',
      entityType: 'asset',
      entityId: asset.publicId,
      entityName: asset.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created asset ${asset.assetTag}`,
    });
    return asset;
  }

  async update(publicId: string, data: any, user: { _id?: string; name?: string }) {
    if (data.assetTag) {
      const existing = await Asset.findOne({ assetTag: data.assetTag.toUpperCase(), publicId: { $ne: publicId } });
      if (existing) throw ApiError.conflict('Asset tag already exists');
    }
    const asset = await Asset.findOneAndUpdate({ publicId }, data, { new: true, runValidators: true });
    if (!asset) throw ApiError.notFound('Asset not found');
    await activityService.logActivity({
      action: 'update',
      entityType: 'asset',
      entityId: asset.publicId,
      entityName: asset.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Updated asset ${asset.assetTag}`,
    });
    return asset;
  }

  async delete(publicId: string, user: { _id?: string; name?: string }) {
    const asset = await Asset.findOneAndDelete({ publicId });
    if (!asset) throw ApiError.notFound('Asset not found');
    await activityService.logActivity({
      action: 'delete',
      entityType: 'asset',
      entityId: asset.publicId,
      entityName: asset.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted asset ${asset.assetTag}`,
    });
  }
}

export default new AssetService();
