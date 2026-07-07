import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Bell, Menu } from 'lucide-react';
import ChatWidget from '../chat/ChatWidget';

const Navbar = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 z-10 sticky top-0 shadow-sm">
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-gray-500 hover:text-gray-700">
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">
          Welcome back, {user?.name.split(' ')[0]}
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-brand-600 transition-colors relative p-2 rounded-full hover:bg-gray-100">
          <Bell size={20} />
          {/* Unread dot simulation */}
          <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="text-gray-400 hover:text-brand-600 transition-colors relative p-2 rounded-full hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
        </button>
      </div>

      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}
    </nav>
  );
};

export default Navbar;
