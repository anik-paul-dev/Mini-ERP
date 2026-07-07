import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage, ChatContact } from '../../types';
import { X, Send, User as UserIcon } from 'lucide-react';
import { getInitials } from '../../utils/helpers';

interface ChatWidgetProps {
  onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { get, post } = useApi();
  
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.publicId);
    }
  }, [activeContact]);

  useEffect(() => {
    if (socket) {
      socket.on('chat:receive', (msg: ChatMessage) => {
        // If message is from active contact or we sent it, add to current list
        if (
          activeContact && 
          (msg.senderPublicId === activeContact.publicId || msg.senderPublicId === user?.publicId)
        ) {
          setMessages(prev => [...prev, msg]);
        } else {
          // Refresh contacts if message from someone else to show unread (simplified)
          fetchContacts();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('chat:receive');
      }
    };
  }, [socket, activeContact, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const data = await get<ChatContact[]>('/chat/contacts');
      if (data) setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts');
    }
  };

  const fetchMessages = async (contactId: string) => {
    setLoading(true);
    try {
      const data = await get<ChatMessage[]>(`/chat/${contactId}`);
      if (data) setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    try {
      const msg = await post<ChatMessage>('/chat', {
        receiverPublicId: activeContact.publicId,
        message: newMessage,
      }, { showErrorToast: false });
      
      if (msg) {
        // Optimistically add message
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-50 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-brand-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          {activeContact ? (
            <>
              <button 
                onClick={() => setActiveContact(null)} 
                className="mr-2 hover:bg-brand-700 p-1 rounded transition-colors"
              >
                &larr;
              </button>
              {activeContact.name}
            </>
          ) : (
            'Messages'
          )}
        </h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} title={isConnected ? 'Connected' : 'Disconnected'} />
          <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 h-96 bg-gray-50 overflow-y-auto">
        {!activeContact ? (
          // Contacts List
          <div className="divide-y divide-gray-100">
            {contacts.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm mt-10">
                No recent conversations.
              </div>
            ) : (
              contacts.map(contact => (
                <div 
                  key={contact.publicId}
                  onClick={() => setActiveContact(contact)}
                  className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-medium mr-3">
                    {getInitials(contact.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Chat View
          <div className="p-4 space-y-3 flex flex-col min-h-full justify-end">
            {loading ? (
              <div className="text-center text-gray-400 py-4">Loading...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No messages yet. Say hi!</div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderPublicId === user?.publicId;
                return (
                  <div key={msg.publicId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                        isMe 
                          ? 'bg-brand-600 text-white rounded-br-sm' 
                          : 'bg-gray-200 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Footer / Input */}
      {activeContact && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input-field py-1.5"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="bg-brand-600 text-white p-2 rounded-md hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatWidget;
