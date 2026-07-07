import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';

// Guards
import ProtectedRoute from './components/guards/ProtectedRoute';
import RoleGuard from './components/guards/RoleGuard';

// Public Pages
import Login from './pages/public/Login';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminProductForm from './pages/admin/ProductForm';
import AdminCustomers from './pages/admin/Customers';
import AdminCustomerForm from './pages/admin/CustomerForm';
import AdminSales from './pages/admin/Sales';
import AdminSaleForm from './pages/admin/SaleForm';
import AdminUsers from './pages/admin/Users';
import AdminUserForm from './pages/admin/UserForm';
import AdminRoles from './pages/admin/Roles';

// Manager Pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerProducts from './pages/manager/Products';
import ManagerProductForm from './pages/manager/ProductForm';
import ManagerCustomers from './pages/manager/Customers';
import ManagerCustomerForm from './pages/manager/CustomerForm';
import ManagerSales from './pages/manager/Sales';
import ManagerSaleForm from './pages/manager/SaleForm';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProducts from './pages/employee/Products';
import EmployeeSales from './pages/employee/Sales';
import EmployeeSaleForm from './pages/employee/SaleForm';

// Role-based redirect component
import RoleRedirect from './components/guards/RoleRedirect';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          
          {/* Root redirect based on role */}
          <Route path="/" element={<RoleRedirect />} />

          {/* Admin Routes */}
          <Route element={<RoleGuard allowedRoles={['Admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/products/new" element={<AdminProductForm />} />
              <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
              <Route path="/admin/customers" element={<AdminCustomers />} />
              <Route path="/admin/customers/new" element={<AdminCustomerForm />} />
              <Route path="/admin/customers/:id/edit" element={<AdminCustomerForm />} />
              <Route path="/admin/sales" element={<AdminSales />} />
              <Route path="/admin/sales/new" element={<AdminSaleForm />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/new" element={<AdminUserForm />} />
              <Route path="/admin/users/:id/edit" element={<AdminUserForm />} />
              <Route path="/admin/roles" element={<AdminRoles />} />
            </Route>
          </Route>

          {/* Manager Routes */}
          <Route element={<RoleGuard allowedRoles={['Manager']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/products" element={<ManagerProducts />} />
              <Route path="/manager/products/new" element={<ManagerProductForm />} />
              <Route path="/manager/products/:id/edit" element={<ManagerProductForm />} />
              <Route path="/manager/customers" element={<ManagerCustomers />} />
              <Route path="/manager/customers/new" element={<ManagerCustomerForm />} />
              <Route path="/manager/customers/:id/edit" element={<ManagerCustomerForm />} />
              <Route path="/manager/sales" element={<ManagerSales />} />
              <Route path="/manager/sales/new" element={<ManagerSaleForm />} />
            </Route>
          </Route>

          {/* Employee Routes */}
          <Route element={<RoleGuard allowedRoles={['Employee']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/products" element={<EmployeeProducts />} />
              <Route path="/employee/sales" element={<EmployeeSales />} />
              <Route path="/employee/sales/new" element={<EmployeeSaleForm />} />
            </Route>
          </Route>

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
