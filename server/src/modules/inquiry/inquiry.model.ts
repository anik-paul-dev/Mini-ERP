import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IInquiry extends Document {
  publicId: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  interest: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiry>(
  {
    publicId: { type: String, default: () => nanoid(12), unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    interest: { type: String, default: 'ERP demo', trim: true },
    message: { type: String, required: true, trim: true, maxlength: 1200 },
    status: { type: String, enum: ['new', 'contacted', 'qualified', 'closed'], default: 'new' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

inquirySchema.index({ name: 'text', email: 'text', company: 'text', interest: 'text', message: 'text' });

export default mongoose.model<IInquiry>('Inquiry', inquirySchema);
