import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IAsset extends Document {
  publicId: string;
  assetTag: string;
  name: string;
  category: string;
  location: string;
  assignedTo: string;
  purchaseDate: Date;
  value: number;
  condition: 'new' | 'good' | 'maintenance' | 'retired';
  status: 'available' | 'assigned' | 'repair' | 'disposed';
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    publicId: { type: String, default: () => nanoid(12), unique: true, index: true },
    assetTag: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, required: true, trim: true },
    location: { type: String, default: '', trim: true },
    assignedTo: { type: String, default: '', trim: true },
    purchaseDate: { type: Date, required: true },
    value: { type: Number, default: 0, min: 0 },
    condition: { type: String, enum: ['new', 'good', 'maintenance', 'retired'], default: 'good' },
    status: { type: String, enum: ['available', 'assigned', 'repair', 'disposed'], default: 'available' },
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

assetSchema.index({ assetTag: 'text', name: 'text', category: 'text', location: 'text', assignedTo: 'text' });

export default mongoose.model<IAsset>('Asset', assetSchema);
