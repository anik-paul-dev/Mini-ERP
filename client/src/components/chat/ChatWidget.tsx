import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search, Send, X } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage, ChatContact } from '../../types';
import { getInitials } from '../../utils/helpers';

interface ChatWidgetProps {
  onClose: () => void;
}

const usePolling = import.meta.env.VITE_USE_POLLING === 'true';
const pollingInterval = Number(import.meta.env.VITE_POLLING_INTERVAL_MS || 4000);

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { get, post } = useApi();

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [activeContact, setActiveContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [contactsLoading, setContactsLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredContacts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.roleName, contact.lastMessage]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search))
    );
  }, [contacts, searchTerm]);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.publicId);
    }
  }, [activeContact?.publicId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg: ChatMessage) => {
      if (activeContact && msg.senderPublicId === activeContact.publicId) {
        setMessages((prev) => (prev.some((item) => item.publicId === msg.publicId) ? prev : [...prev, msg]));
      }

      fetchContacts(false);
    };

    socket.on('chat:receive', handleReceive);

    return () => {
      socket.off('chat:receive', handleReceive);
    };
  }, [socket, activeContact?.publicId]);

  useEffect(() => {
    if (!usePolling && isConnected) return;

    const interval = window.setInterval(() => {
      fetchContacts(false);
      if (activeContact) {
        fetchMessages(activeContact.publicId, false);
      }
    }, pollingInterval);

    return () => window.clearInterval(interval);
  }, [isConnected, activeContact?.publicId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async (showLoading = true) => {
    if (showLoading) setContactsLoading(true);
    try {
      const data = await get<ChatContact[]>('/chat/contacts', { showErrorToast: false });
      if (data) setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    } finally {
      if (showLoading) setContactsLoading(false);
    }
  };

  const fetchMessages = async (contactPublicId: string, showLoading = true) => {
    if (showLoading) setMessagesLoading(true);
    try {
      const data = await get<ChatMessage[]>(`/chat/${contactPublicId}`, { showErrorToast: false });
      setMessages(data || []);
      fetchContacts(false);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      if (showLoading) setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = newMessage.trim();
    if (!message || !activeContact || sending) return;

    setSending(true);
    try {
      const msg = await post<ChatMessage>(
        '/chat',
        {
          receiverPublicId: activeContact.publicId,
          message,
        },
        { showErrorToast: true }
      );

      if (msg) {
        setMessages((prev) => [...prev, msg]);
        setNewMessage('');
        fetchContacts(false);
      }
    } catch (error) {
      console.error('Failed to send message', error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectContact = (contact: ChatContact) => {
    setActiveContact(contact);
    setSearchTerm('');
  };

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] max-w-96 bg-surface-800 rounded-xl shadow-glow border border-surface-700 overflow-hidden flex flex-col z-50">
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 text-white px-4 py-3 flex justify-between items-center shadow-md">
        <div className="min-w-0 flex items-center gap-2">
          {activeContact && (
            <button
              type="button"
              onClick={() => setActiveContact(null)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              title="Back to contacts"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div className="min-w-0">
            <h3 className="font-semibold truncate">{activeContact ? activeContact.name : 'Messages'}</h3>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-300' : 'bg-red-300'}`}></span>
              {isConnected ? 'Connected' : usePolling ? 'Polling' : 'Offline'}
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 transition-colors" title="Close chat">
          <X size={18} />
        </button>
      </div>

      {!activeContact ? (
        <>
          <div className="p-3 border-b border-surface-700 bg-surface-800/80">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search people"
                className="w-full rounded-lg border border-surface-600 bg-surface-900/50 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="h-96 bg-surface-900 overflow-y-auto">
            {contactsLoading ? (
              <div className="p-4 text-center text-sm text-surface-400">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-6 text-center text-sm text-surface-400">
                {searchTerm ? 'No matching people found.' : 'No active users are available for chat.'}
              </div>
            ) : (
              <div className="divide-y divide-surface-700/50">
                {filteredContacts.map((contact) => (
                  <button
                    type="button"
                    key={contact.publicId}
                    onClick={() => handleSelectContact(contact)}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-surface-800 transition-colors"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-sm font-semibold border border-brand-500/30">
                      {getInitials(contact.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-200 truncate">{contact.name}</p>
                        {!!contact.unreadCount && (
                          <span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm shadow-brand-500/50">
                            {contact.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-400 truncate">
                        {contact.lastMessage || contact.roleName || 'Start a conversation'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="h-96 bg-surface-900 overflow-y-auto p-4 custom-scrollbar">
            {messagesLoading ? (
              <div className="text-center text-sm text-surface-400 py-6">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-sm text-surface-400 py-6">No messages yet. Send the first one.</div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderPublicId === user?.publicId;
                  return (
                    <div key={msg.publicId} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white rounded-br-sm'
                            : 'bg-surface-800 border border-surface-700 text-slate-200 rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <p className={`mt-1 text-[10px] font-medium ${isMe ? 'text-white/70' : 'text-surface-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-surface-800/80 border-t border-surface-700 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message"
              className="flex-1 rounded-lg border border-surface-600 bg-surface-900/50 px-3 py-2 text-sm text-slate-200 placeholder-surface-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
              maxLength={1000}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white flex items-center justify-center hover:from-brand-500 hover:to-brand-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatWidget;