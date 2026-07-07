import mongoose from 'mongoose';
import Customer from './customer.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';

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

  async createCustomer(data: any, userId: string) {
    const customer = new Customer({
      ...data,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await customer.save();
    return customer;
  }

  async updateCustomer(publicId: string, data: any) {
    const customer = await Customer.findOneAndUpdate({ publicId }, data, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }

    return customer;
  }

  async deleteCustomer(publicId: string) {
    const customer = await Customer.findOneAndDelete({ publicId });
    if (!customer) {
      throw ApiError.notFound('Customer not found');
    }
  }
}

export default new CustomerService();
