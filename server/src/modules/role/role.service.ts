import Role from './role.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import User from '../auth/auth.model';

class RoleService {
  async getAllRoles(query: any) {
    const roleQuery = new QueryBuilder(Role.find(), query)
      .search(['name', 'description'])
      .filter()
      .sort()
      .paginate();

    const roles = await roleQuery.query;
    const total = await roleQuery.countTotal();

    return { roles, total };
  }

  async getRole(publicId: string) {
    const role = await Role.findOne({ publicId });
    if (!role) {
      throw ApiError.notFound('Role not found');
    }
    return role;
  }

  async createRole(data: any) {
    const existingRole = await Role.findOne({ name: data.name });
    if (existingRole) {
      throw ApiError.conflict('Role name already exists');
    }

    const role = await Role.create(data);
    return role;
  }

  async updateRole(publicId: string, data: any) {
    const role = await Role.findOne({ publicId });
    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    if (role.isSystem) {
      throw ApiError.forbidden('Cannot update system role');
    }

    if (data.name && data.name !== role.name) {
      const existingRole = await Role.findOne({ name: data.name });
      if (existingRole) {
        throw ApiError.conflict('Role name already exists');
      }
    }

    const updatedRole = await Role.findOneAndUpdate({ publicId }, data, {
      new: true,
      runValidators: true,
    });

    return updatedRole;
  }

  async deleteRole(publicId: string) {
    const role = await Role.findOne({ publicId });
    if (!role) {
      throw ApiError.notFound('Role not found');
    }

    if (role.isSystem) {
      throw ApiError.forbidden('Cannot delete system role');
    }

    // Check if role is assigned to any user
    const usersWithRole = await User.countDocuments({ role: role._id });
    if (usersWithRole > 0) {
      throw ApiError.conflict(`Cannot delete role. It is assigned to ${usersWithRole} users`);
    }

    await Role.findOneAndDelete({ publicId });
  }
}

export default new RoleService();
