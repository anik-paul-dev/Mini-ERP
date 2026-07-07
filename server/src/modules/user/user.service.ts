import mongoose from 'mongoose';
import User from '../auth/auth.model';
import Role from '../role/role.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';

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

  async createUser(data: any) {
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
    return user;
  }

  async updateUser(publicId: string, data: any) {
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

    return updatedUser;
  }

  async deleteUser(publicId: string) {
    const user = await User.findOne({ publicId });
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    
    if (user.roleName === 'Admin') {
       throw ApiError.forbidden('Cannot delete Admin user');
    }

    await User.findOneAndDelete({ publicId });
  }
}

export default new UserService();
