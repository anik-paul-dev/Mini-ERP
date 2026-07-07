import mongoose, { Document, Schema } from 'mongoose';
import { nanoid } from 'nanoid';

export interface IChat extends Document {
  publicId: string;
  sender: mongoose.Types.ObjectId;
  senderPublicId: string;
  senderName: string;
  receiver: mongoose.Types.ObjectId;
  receiverPublicId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    publicId: {
      type: String,
      default: () => nanoid(12),
      unique: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderPublicId: { type: String, required: true },
    senderName: { type: String, required: true },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiverPublicId: { type: String, required: true },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    read: {
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
        delete ret.sender;
        delete ret.receiver;
        return ret;
      },
    },
  }
);

chatSchema.index({ senderPublicId: 1, receiverPublicId: 1, createdAt: -1 });

const Chat = mongoose.model<IChat>('Chat', chatSchema);
export default Chat;
