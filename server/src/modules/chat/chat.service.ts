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

    await Chat.updateMany(
      { sender: contact._id, receiver: userId, read: false },
      { $set: { read: true } }
    );

    return chats;
  }

  async getContacts(userId: string) {
    const users = await User.find({ _id: { $ne: userId }, isActive: true })
      .select('publicId name avatar roleName')
      .lean();

    const chats = await Chat.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const latestByContact = new Map<string, any>();
    const unreadByContact = new Map<string, number>();

    chats.forEach((chat) => {
      const contactId = chat.sender.toString() === userId ? chat.receiver.toString() : chat.sender.toString();

      if (!latestByContact.has(contactId)) {
        latestByContact.set(contactId, chat);
      }

      if (chat.receiver.toString() === userId && !chat.read) {
        unreadByContact.set(contactId, (unreadByContact.get(contactId) || 0) + 1);
      }
    });

    return users
      .map((user) => {
        const id = user._id.toString();
        const latest = latestByContact.get(id);

        return {
          publicId: user.publicId,
          name: user.name,
          avatar: user.avatar,
          roleName: user.roleName,
          lastMessage: latest?.message || '',
          lastMessageAt: latest?.createdAt || null,
          unreadCount: unreadByContact.get(id) || 0,
        };
      })
      .sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return a.name.localeCompare(b.name);
        if (!a.lastMessageAt) return 1;
        if (!b.lastMessageAt) return -1;
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      });
  }

  async sendMessage(senderId: string, senderName: string, senderPublicId: string, receiverPublicId: string, message: string) {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw ApiError.badRequest('Message is required');
    }

    if (senderPublicId === receiverPublicId) {
      throw ApiError.badRequest('Cannot send a message to yourself');
    }

    const receiver = await User.findOne({ publicId: receiverPublicId, isActive: true });
    if (!receiver) {
      throw ApiError.notFound('Receiver not found');
    }

    const chat = new Chat({
      sender: new mongoose.Types.ObjectId(senderId),
      senderPublicId,
      senderName,
      receiver: receiver._id,
      receiverPublicId: receiver.publicId,
      message: trimmedMessage,
    });

    await chat.save();

    const payload = chat.toJSON();
    const io = getIO();
    io.to(`user:${receiverPublicId}`).emit('chat:receive', payload);

    return payload;
  }
}

export default new ChatService();
