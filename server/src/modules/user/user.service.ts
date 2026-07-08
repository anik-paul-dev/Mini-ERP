import mongoose from 'mongoose';
import User from '../auth/auth.model';
import Role from '../role/role.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

class UserService {
  async getAllUsers(query: any) {
    const userQuery = new QueryBuilder(User.find().populate('role', 'name'), query)
      .search(['name', 'email', 'roleName'])
      .filter()
      .sort()
      .paginate();

    const users = await userQuery.query;
    const total = await userQuery.countTotal();

    return { users, total };
  }

  async getUser(publicId: string) {
    const user = await User.findOne({ publicId }).populate('role', 'name permissions');
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async createUser(data: any, performer: { _id?: string, name?: string }) {
    const role = await Role.findOne({ publicId: data.rolePublicId });
    if (!role) {
      throw ApiError.badRequest('Role not found');
    }

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw ApiError.conflict('Email already exists');
    }

    const user = new User({
      ...data,
      role: role._id,
      roleName: role.name,
    });

    await user.save();

    await activityService.logActivity({
      action: 'create',
      entityType: 'user',
      entityId: user.publicId,
      entityName: user.name,
      performedBy: new mongoose.Types.ObjectId(performer._id),
      performerName: performer.name || 'Unknown',
      details: `Created user ${user.name} (Role: ${user.roleName})`,
    });

    return user;
  }

  async updateUser(publicId: string, data: any, performer: { _id?: string, name?: string }) {
    const user = await User.findOne({ publicId });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        throw ApiError.conflict('Email already exists');
      }
    }

    if (data.rolePublicId) {
      const role = await Role.findOne({ publicId: data.rolePublicId });
      if (!role) {
        throw ApiError.badRequest('Role not found');
      }
      data.role = role._id;
      data.roleName = role.name;
    }

    const updatedUser = await User.findOneAndUpdate({ publicId }, data, {
      new: true,
      runValidators: true,
    }).populate('role', 'name');

    if (updatedUser) {
      await activityService.logActivity({
        action: 'update',
        entityType: 'user',
        entityId: updatedUser.publicId,
        entityName: updatedUser.name,
        performedBy: new mongoose.Types.ObjectId(performer._id),
        performerName: performer.name || 'Unknown',
        details: `Updated user ${updatedUser.name}`,
      });
    }

    return updatedUser;
  }

  async deleteUser(publicId: string, performer: { _id?: string, name?: string }) {
    const user = await User.findOne({ publicId });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    if (user.roleName === 'Admin') {
       throw ApiError.forbidden('Cannot delete Admin user');
    }

    await User.findOneAndDelete({ publicId });

    await activityService.logActivity({
      action: 'delete',
      entityType: 'user',
      entityId: user.publicId,
      entityName: user.name,
      performedBy: new mongoose.Types.ObjectId(performer._id),
      performerName: performer.name || 'Unknown',
      details: `Deleted user ${user.name} (Role: ${user.roleName})`,
    });
  }
}

export default new UserService();
