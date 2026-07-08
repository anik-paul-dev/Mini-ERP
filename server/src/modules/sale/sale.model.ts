import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ISaleItem {
  product: mongoose.Types.ObjectId;
  productPublicId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ISale extends Document {
  publicId: string;
  customer: mongoose.Types.ObjectId;
  customerPublicId: string;
  customerName: string;
  items: ISaleItem[];
  grandTotal: number;
  status: 'active' | 'canceled';
  canceledAt?: Date;
  canceledBy?: mongoose.Types.ObjectId;
  canceledByName?: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productPublicId: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const saleSchema = new Schema<ISale>(
  {
    publicId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    customerPublicId: { type: String, required: true },
    customerName: { type: String, required: true },
    items: {
      type: [saleItemSchema],
      required: [true, 'Sale items are required'],
      validate: {
        validator: (items: ISaleItem[]) => items.length > 0,
        message: 'At least one item is required',
      },
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'canceled'],
      default: 'active',
      index: true,
    },
    canceledAt: Date,
    canceledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    canceledByName: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).customer;
        delete (ret as any).createdBy;
        delete (ret as any).canceledBy;
        ret.items?.forEach((item: any) => {
          delete item.product;
        });
        return ret;
      },
    },
  }
);

const Sale = mongoose.model<ISale>('Sale', saleSchema);
export default Sale;

