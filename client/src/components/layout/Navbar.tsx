import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, Menu, MessageCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import ChatWidget from '../chat/ChatWidget';

const Navbar = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadNotifications,
    markAllNotificationsRead,
    clearNotifications,
  } = useSocket();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    if (!isNotificationsOpen) {
      markAllNotificationsRead();
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 z-10 sticky top-0 shadow-sm print:hidden">
      <div className="flex items-center min-w-0">
        <button type="button" className="md:hidden mr-4 text-gray-500 hover:text-gray-700" title="Open menu">
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block truncate">
          Welcome back, {user?.name.split(' ')[0]}
        </h2>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className="text-gray-500 hover:text-brand-600 transition-colors relative p-2 rounded-full hover:bg-gray-100"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white flex items-center justify-center border-2 border-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <p className="text-xs text-gray-500">{notifications.length} recent alert{notifications.length === 1 ? '' : 's'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="p-2 rounded-md text-gray-500 hover:text-brand-600 hover:bg-gray-100"
                    title="Mark all read"
                  >
                    <CheckCheck size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={clearNotifications}
                    className="p-2 rounded-md text-gray-500 hover:text-red-600 hover:bg-gray-100"
                    title="Clear notifications"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto bg-gray-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div key={notification.id} className="px-4 py-3 bg-white">
                        <div className="flex gap-3">
                          <span
                            className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                              notification.read ? 'bg-gray-300' : 'bg-brand-600'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{notification.title}</p>
                            <p className="mt-1 text-sm text-gray-600 break-words">{notification.message}</p>
                            <p className="mt-1 text-xs text-gray-400">
                              {new Date(notification.createdAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="text-gray-500 hover:text-brand-600 transition-colors relative p-2 rounded-full hover:bg-gray-100"
          title="Messages"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
    </nav>
  );
};

export default Navbar;
