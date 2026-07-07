import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IProduct extends Document {
  publicId: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image: string;
  imagePublicId: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    publicId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, 'Purchase price is required'],
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
    },
    imagePublicId: {
      type: String,
      default: '',
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

// Index for search
productSchema.index({ name: 'text', sku: 'text', category: 'text' });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
