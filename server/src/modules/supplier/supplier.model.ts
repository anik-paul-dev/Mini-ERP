import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ISupplier extends Document {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: 'active' | 'on_hold' | 'inactive';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    publicId: { type: String, default: () => nanoid(12), unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    category: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5, default: 4 },
    status: { type: String, enum: ['active', 'on_hold', 'inactive'], default: 'active' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).createdBy;
        return ret;
      },
    },
  }
);

supplierSchema.index({ name: 'text', email: 'text', phone: 'text', category: 'text' });

export default mongoose.model<ISupplier>('Supplier', supplierSchema);
