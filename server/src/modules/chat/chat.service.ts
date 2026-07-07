import mongoose from 'mongoose';
import Chat from './chat.model';
import User from '../auth/auth.model';
import ApiError from '../../utils/ApiError';
import { getIO } from '../../config/socket';

class ChatService {
  async getChatHistory(userId: string, contactPublicId: string) {
    const contact = await User.findOne({ publicId: contactPublicId });
    if (!contact) {
      throw ApiError.notFound('User not found');
    }

    const chats = await Chat.find({
      $or: [
        { sender: userId, receiver: contact._id },
        { sender: contact._id, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    // Mark as read
    await Chat.updateMany(
      { sender: contact._id, receiver: userId, read: false },
      { $set: { read: true } }
    );

    return chats;
  }

  async getContacts(userId: string) {
    // Get users that current user has chatted with
    const activeChats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const contactIds = new Set<string>();
    activeChats.forEach((chat) => {
      if (chat.sender.toString() !== userId) contactIds.add(chat.sender.toString());
      if (chat.receiver.toString() !== userId) contactIds.add(chat.receiver.toString());
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
      .select('publicId name avatar')
      .lean();

    return contacts;
  }

  async sendMessage(senderId: string, senderName: string, senderPublicId: string, receiverPublicId: string, message: string) {
    const receiver = await User.findOne({ publicId: receiverPublicId });
    if (!receiver) {
      throw ApiError.notFound('Receiver not found');
    }

    const chat = new Chat({
      sender: new mongoose.Types.ObjectId(senderId),
      senderPublicId,
      senderName,
      receiver: receiver._id,
      receiverPublicId: receiver.publicId,
      message,
    });

    await chat.save();

    // Emit via socket
    const io = getIO();
    io.to(`user:${receiverPublicId}`).emit('chat:receive', chat);

    return chat;
  }
}

export default new ChatService();
