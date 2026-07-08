import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  UserCog,
  Shield,
  Activity,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const rolePath = user.roleName.toLowerCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: `/${rolePath}`,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      title: 'Products',
      icon: <Package size={20} />,
      path: `/${rolePath}/products`,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      title: 'Customers',
      icon: <Users size={20} />,
      path: `/${rolePath}/customers`,
      roles: ['Admin', 'Manager']
    },
    {
      title: 'Sales',
      icon: <ShoppingCart size={20} />,
      path: `/${rolePath}/sales`,
      roles: ['Admin', 'Manager', 'Employee']
    },
    {
      title: 'Users',
      icon: <UserCog size={20} />,
      path: `/${rolePath}/users`,
      roles: ['Admin']
    },
    {
      title: 'Roles & Permissions',
      icon: <Shield size={20} />,
      path: `/${rolePath}/roles`,
      roles: ['Admin']
    },
    {
      title: 'Activity Log',
      icon: <Activity size={20} />,
      path: `/${rolePath}/activities`,
      roles: ['Admin']
    },
    {
      title: 'Profile',
      icon: <User size={20} />,
      path: `/${rolePath}/profile`,
      roles: ['Admin', 'Manager', 'Employee']
    }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.roleName));

  return (
    <div className="flex flex-col w-64 bg-slate-900 h-full text-white transition-all duration-300 shadow-xl">
      <div className="flex items-center justify-center h-16 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">Mini ERP</h1>
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto mt-4 px-3 space-y-1">
        {allowedItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === `/${rolePath}`}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            <span className="font-medium text-sm">{item.title}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center font-bold shadow-inner">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-400">{user.roleName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-950 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut size={18} className="mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

