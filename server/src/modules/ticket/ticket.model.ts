import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ITicket extends Document {
  publicId: string;
  ticketNumber: string;
  subject: string;
  requesterName: string;
  requesterEmail: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  source: 'customer' | 'internal' | 'supplier';
  description: string;
  resolution: string;
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    publicId: { type: String, default: () => nanoid(12), unique: true, index: true },
    ticketNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    subject: { type: String, required: true, trim: true, maxlength: 180 },
    requesterName: { type: String, required: true, trim: true },
    requesterEmail: { type: String, default: '', trim: true, lowercase: true },
    department: { type: String, default: 'Operations', trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    source: { type: String, enum: ['customer', 'internal', 'supplier'], default: 'customer' },
    description: { type: String, required: true, trim: true, maxlength: 1200 },
    resolution: { type: String, default: '' },
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

ticketSchema.index({ ticketNumber: 'text', subject: 'text', requesterName: 'text', department: 'text', description: 'text' });

export default mongoose.model<ITicket>('Ticket', ticketSchema);
