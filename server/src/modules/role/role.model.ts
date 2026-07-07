import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IRole extends Document {
  publicId: string;
  name: string;
  permissions: string[];
  description: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// All available permissions
export const ALL_PERMISSIONS = [
  'products:create',
  'products:read',
  'products:update',
  'products:delete',
  'customers:create',
  'customers:read',
  'customers:update',
  'customers:delete',
  'sales:create',
  'sales:read',
  'users:create',
  'users:read',
  'users:update',
  'users:delete',
  'roles:create',
  'roles:read',
  'roles:update',
  'roles:delete',
  'dashboard:read',
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

const roleSchema = new Schema<IRole>(
  {
    publicId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
    },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (perms: string[]) => perms.every((p) => ALL_PERMISSIONS.includes(p as any)),
        message: 'Invalid permission found',
      },
    },
    description: {
      type: String,
      default: '',
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const Role = mongoose.model<IRole>('Role', roleSchema);
export default Role;
