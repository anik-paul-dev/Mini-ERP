import mongoose from 'mongoose';
import Customer from './customer.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import activityService from '../activity/activity.service';

class CustomerService {
  async getAllCustomers(query: any) {
    const customerQuery = new QueryBuilder(Customer.find(), query)
      .search(['name', 'email', 'phone'])
      .filter()
      .sort()
      .paginate();

    const customers = await customerQuery.query;
    const total = await customerQuery.countTotal();

    return { customers, total };
  }

  async getCustomer(publicId: string) {
    const customer = await Customer.findOne({ publicId });
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }
    return customer;
  }

  async createCustomer(data: any, user: { _id?: string, name?: string }) {
    const customer = new Customer({
      ...data,
      createdBy: new mongoose.Types.ObjectId(user._id),
    });

    await customer.save();

    await activityService.logActivity({
      action: 'create',
      entityType: 'customer',
      entityId: customer.publicId,
      entityName: customer.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created customer ${customer.name} (Email: ${customer.email})`,
    });

    return customer;
  }

  async updateCustomer(publicId: string, data: any, user: { _id?: string, name?: string }) {
    const customer = await Customer.findOneAndUpdate({ publicId }, data, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    await activityService.logActivity({
      action: 'update',
      entityType: 'customer',
      entityId: customer.publicId,
      entityName: customer.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Updated customer ${customer.name}`,
    });

    return customer;
  }

  async deleteCustomer(publicId: string, user: { _id?: string, name?: string }) {
    const customer = await Customer.findOneAndDelete({ publicId });
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    await activityService.logActivity({
      action: 'delete',
      entityType: 'customer',
      entityId: customer.publicId,
      entityName: customer.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted customer ${customer.name} (Email: ${customer.email})`,
    });
  }
}

export default new CustomerService();
