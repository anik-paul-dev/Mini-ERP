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
          
          {/* Root redirect based on role is handled in DashboardLayout or AuthContext, but let's default to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Common Dashboard Route - will redirect based on role in the component */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            
            {/* Admin Routes */}
            <Route element={<RoleGuard allowedRoles={['Admin']} />}>
              <Route path="admin">
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:id/edit" element={<AdminProductForm />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="customers/new" element={<AdminCustomerForm />} />
                <Route path="customers/:id/edit" element={<AdminCustomerForm />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="sales/new" element={<AdminSaleForm />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/new" element={<AdminUserForm />} />
                <Route path="users/:id/edit" element={<AdminUserForm />} />
                <Route path="roles" element={<AdminRoles />} />
              </Route>
            </Route>

            {/* Manager Routes */}
            <Route element={<RoleGuard allowedRoles={['Manager']} />}>
              <Route path="manager">
                <Route index element={<ManagerDashboard />} />
                <Route path="products" element={<ManagerProducts />} />
                <Route path="products/new" element={<ManagerProductForm />} />
                <Route path="products/:id/edit" element={<ManagerProductForm />} />
                <Route path="customers" element={<ManagerCustomers />} />
                <Route path="customers/new" element={<ManagerCustomerForm />} />
                <Route path="customers/:id/edit" element={<ManagerCustomerForm />} />
                <Route path="sales" element={<ManagerSales />} />
                <Route path="sales/new" element={<ManagerSaleForm />} />
              </Route>
            </Route>

            {/* Employee Routes */}
            <Route element={<RoleGuard allowedRoles={['Employee']} />}>
              <Route path="employee">
                <Route index element={<EmployeeDashboard />} />
                <Route path="products" element={<EmployeeProducts />} />
                <Route path="sales" element={<EmployeeSales />} />
                <Route path="sales/new" element={<EmployeeSaleForm />} />
              </Route>
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
