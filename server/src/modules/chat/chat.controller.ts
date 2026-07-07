import { Request, Response } from 'express';
import chatService from './chat.service';
import catchAsync from '../../utils/catchAsync';
import ApiResponse from '../../utils/ApiResponse';

class ChatController {
  getHistory = catchAsync(async (req: Request, res: Response) => {
    const history = await chatService.getChatHistory(req.user!._id!, req.params.contactPublicId);
    res.status(200).json(ApiResponse.success(history, 'Chat history fetched'));
  });

  getContacts = catchAsync(async (req: Request, res: Response) => {
    const contacts = await chatService.getContacts(req.user!._id!);
    res.status(200).json(ApiResponse.success(contacts, 'Contacts fetched'));
  });

  sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { receiverPublicId, message } = req.body;
    const senderName = (req.user as any).name || 'Unknown';
    
    const chat = await chatService.sendMessage(
      req.user!._id!,
      senderName,
      req.user!.publicId,
      receiverPublicId,
      message
    );
    
    res.status(201).json(ApiResponse.created(chat, 'Message sent'));
  });
}

export default new ChatController();
