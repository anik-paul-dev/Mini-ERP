import Inquiry from './inquiry.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';

class InquiryService {
  async getAll(query: any) {
    const builder = new QueryBuilder(Inquiry.find(), query).search(['name', 'email', 'company', 'interest', 'message']).filter().sort().paginate();
    const inquiries = await builder.query;
    const total = await builder.countTotal();
    return { inquiries, total };
  }

  async create(data: any) {
    return Inquiry.create(data);
  }

  async updateStatus(publicId: string, status: string) {
    const inquiry = await Inquiry.findOneAndUpdate({ publicId }, { status }, { new: true, runValidators: true });
    if (!inquiry) throw ApiError.notFound('Inquiry not found');
    return inquiry;
  }

  async delete(publicId: string) {
    const inquiry = await Inquiry.findOneAndDelete({ publicId });
    if (!inquiry) throw ApiError.notFound('Inquiry not found');
  }
}

export default new InquiryService();
