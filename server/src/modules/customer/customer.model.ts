import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ICustomer extends Document {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    publicId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        delete ret.createdBy;
        return ret;
      },
    },
  }
);

customerSchema.index({ name: 'text', email: 'text', phone: 'text' });

const Customer = mongoose.model<ICustomer>('Customer', customerSchema);
export default Customer;
