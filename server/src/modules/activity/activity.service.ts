import mongoose from 'mongoose';
import Activity from './activity.model';
import QueryBuilder from '../../utils/QueryBuilder';

class ActivityService {
  async logActivity(data: {
    action: 'create' | 'update' | 'delete';
    entityType: 'product' | 'sale' | 'customer' | 'user' | 'role';
    entityId: string;
    entityName: string;
    performedBy: mongoose.Types.ObjectId;
    performerName: string;
    details?: string;
  }) {
    try {
      const activity = new Activity(data);
      await activity.save();
    } catch (error) {
      console.error('Failed to log activity:', error);
      // We don't want to throw an error here because activity logging shouldn't break the main operation
    }
  }

  async getAllActivities(query: any) {
    const activityQuery = new QueryBuilder(Activity.find(), query)
      .search(['entityName', 'performerName', 'action', 'entityType'])
      .filter()
      .sort()
      .paginate();

    const activities = await activityQuery.query;
    const total = await activityQuery.countTotal();

    return { activities, total };
  }
}

export default new ActivityService();
