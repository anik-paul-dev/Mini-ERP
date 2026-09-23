import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IPurchaseItem {
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface IPurchase extends Document {
  publicId: string;
  orderNumber: string;
  supplierPublicId: string;
  supplierName: string;
  expectedDate: Date;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  items: IPurchaseItem[];
  totalAmount: number;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>(
  {
    itemName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseSchema = new Schema<IPurchase>(
  {
    publicId: { type: String, default: () => nanoid(12), unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    supplierPublicId: { type: String, required: true, index: true },
    supplierName: { type: String, required: true, trim: true },
    expectedDate: { type: Date, required: true },
    status: { type: String, enum: ['draft', 'ordered', 'received', 'cancelled'], default: 'draft' },
    items: { type: [purchaseItemSchema], validate: [(items: IPurchaseItem[]) => items.length > 0, 'At least one item is required'] },
    totalAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdByName: { type: String, required: true },
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

purchaseSchema.index({ orderNumber: 'text', supplierName: 'text', notes: 'text' });

export default mongoose.model<IPurchase>('Purchase', purchaseSchema);
