import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IProjectTask {
  title: string;
  assigneeName: string;
  dueDate: Date;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
}

export interface IProject extends Document {
  publicId: string;
  name: string;
  clientName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  startDate: Date;
  dueDate: Date;
  budget: number;
  description: string;
  tasks: IProjectTask[];
  createdBy: mongoose.Types.ObjectId;
  createdByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const projectTaskSchema = new Schema<IProjectTask>(
  {
    title: { type: String, required: true, trim: true },
    assigneeName: { type: String, default: '', trim: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['todo', 'in_progress', 'done', 'blocked'], default: 'todo' },
  },
  { _id: false }
);

const projectSchema = new Schema<IProject>(
  {
    publicId: { type: String, default: () => nanoid(12), unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 180 },
    clientName: { type: String, default: '', trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    status: { type: String, enum: ['planning', 'active', 'completed', 'on_hold'], default: 'planning' },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    budget: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '' },
    tasks: { type: [projectTaskSchema], default: [] },
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

projectSchema.index({ name: 'text', clientName: 'text', description: 'text', 'tasks.title': 'text' });

export default mongoose.model<IProject>('Project', projectSchema);
