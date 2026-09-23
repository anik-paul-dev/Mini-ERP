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
  LogOut,
  X,
  Truck,
  ClipboardList,
  HandCoins,
  BriefcaseBusiness,
  FileQuestion,
  Laptop,
  LifeBuoy
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const rolePath = user.roleName === 'Admin' ? 'admin' : user.roleName === 'Employee' ? 'employee' : 'manager';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: `/${rolePath}`,
      roles: ['Admin', 'Manager', 'Employee'],
      permission: 'dashboard:read'
    },
    {
      title: 'Products',
      icon: <Package size={20} />,
      path: `/${rolePath}/products`,
      roles: ['Admin', 'Manager', 'Employee'],
      permission: 'products:read'
    },
    {
      title: 'Customers',
      icon: <Users size={20} />,
      path: `/${rolePath}/customers`,
      roles: ['Admin', 'Manager'],
      permission: 'customers:read'
    },
    {
      title: 'Sales',
      icon: <ShoppingCart size={20} />,
      path: `/${rolePath}/sales`,
      roles: ['Admin', 'Manager', 'Employee'],
      permission: 'sales:read'
    },
    {
      title: 'Users',
      icon: <UserCog size={20} />,
      path: `/${rolePath}/users`,
      roles: ['Admin'],
      permission: 'users:read'
    },
    {
      title: 'Roles & Permissions',
      icon: <Shield size={20} />,
      path: `/${rolePath}/roles`,
      roles: ['Admin'],
      permission: 'roles:read'
    },
    {
      title: 'Activity Log',
      icon: <Activity size={20} />,
      path: `/${rolePath}/activities`,
      roles: ['Admin'],
      permission: 'activities:read'
    },
    {
      title: 'Suppliers',
      icon: <Truck size={20} />,
      path: `/${rolePath}/suppliers`,
      roles: ['Admin', 'Manager'],
      permission: 'suppliers:read'
    },
    {
      title: 'Purchase Orders',
      icon: <ClipboardList size={20} />,
      path: `/${rolePath}/purchases`,
      roles: ['Admin', 'Manager'],
      permission: 'purchases:read'
    },
    {
      title: 'Expenses',
      icon: <HandCoins size={20} />,
      path: `/${rolePath}/expenses`,
      roles: ['Admin', 'Manager', 'Employee'],
      permission: 'expenses:read'
    },
    {
      title: 'Projects & Tasks',
      icon: <BriefcaseBusiness size={20} />,
      path: `/${rolePath}/projects`,
      roles: ['Admin', 'Manager', 'Employee'],
      permission: 'projects:read'
    },
    {
      title: 'Assets',
      icon: <Laptop size={20} />,
      path: `/${rolePath}/assets`,
      roles: ['Admin', 'Manager', 'Employee'],
      permission: 'assets:read'
    },
    {
      title: 'Service Tickets',
      icon: <LifeBuoy size={20} />,
      path: `/${rolePath}/tickets`,
      roles: ['Admin', 'Manager', 'Employee'],
      permission: 'tickets:read'
    },
    {
      title: 'Public Inquiries',
      icon: <FileQuestion size={20} />,
      path: `/${rolePath}/inquiries`,
      roles: ['Admin'],
      permission: 'inquiries:read'
    },
    {
      title: 'Profile',
      icon: <User size={20} />,
      path: `/${rolePath}/profile`,
      roles: ['Admin', 'Manager', 'Employee']
    }
  ];

  const allowedItems = menuItems.filter(item => item.roles.includes(user.roleName) || (item.permission && hasPermission(item.permission)));

  return (
    <div className="flex flex-col w-64 bg-slate-900 h-full text-white transition-all duration-300 shadow-xl print:hidden">
      <div className="flex items-center justify-between h-16 border-b border-slate-800 px-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">NexoraOps</h1>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>
      
      <div className="flex flex-col flex-1 overflow-y-auto mt-4 px-3 space-y-1">
        {allowedItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            end={item.path === `/${rolePath}`}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
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
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center font-bold shadow-inner text-white">
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
