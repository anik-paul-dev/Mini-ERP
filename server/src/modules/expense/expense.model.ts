import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IExpense extends Document {
  publicId: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: Date;
  paymentMethod: 'cash' | 'bank' | 'card' | 'mobile';
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  vendor: string;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    publicId: { type: String, default: () => nanoid(12), unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    expenseDate: { type: Date, required: true },
    paymentMethod: { type: String, enum: ['cash', 'bank', 'card', 'mobile'], default: 'cash' },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
    vendor: { type: String, default: '', trim: true },
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

expenseSchema.index({ title: 'text', category: 'text', vendor: 'text', notes: 'text' });

export default mongoose.model<IExpense>('Expense', expenseSchema);
