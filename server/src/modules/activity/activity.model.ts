import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IActivity extends Document {
  publicId: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'product' | 'sale' | 'customer' | 'user' | 'role';
  entityId: string;
  entityName: string;
  performedBy: mongoose.Types.ObjectId;
  performerName: string;
  details?: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    publicId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['product', 'sale', 'customer', 'user', 'role'],
      required: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    entityName: {
      type: String,
      required: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performerName: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
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

const Activity = mongoose.model<IActivity>('Activity', activitySchema);
export default Activity;
