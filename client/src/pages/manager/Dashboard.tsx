import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/ui/StatCard';
import { Package, Users, ShoppingCart, DollarSign, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { DashboardStats } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';

const Dashboard = () => {
  const { get } = useApi();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['managerDashboardStats'],
    queryFn: () => get<DashboardStats>('/dashboard/stats'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(stats?.totalSalesAmount || 0)} 
          icon={<DollarSign size={24} />} 
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalSalesCount || 0} 
          icon={<ShoppingCart size={24} />} 
        />
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts || 0} 
          icon={<Package size={24} />} 
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.totalCustomers || 0} 
          icon={<Users size={24} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {stats?.recentSales?.map((sale) => (
              <div key={sale.publicId} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{sale.customerName}</p>
                  <p className="text-xs text-gray-500">{formatDate(sale.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-600">{formatCurrency(sale.grandTotal)}</p>
                  <p className="text-xs text-gray-500">ID: {sale.publicId.substring(0, 8)}</p>
                </div>
              </div>
            ))}
            {(!stats?.recentSales || stats.recentSales.length === 0) && (
              <div className="px-6 py-8 text-center text-gray-500">No recent sales found.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-red-800 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              Low Stock Alerts
            </h3>
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {stats?.lowStockProductsCount} items
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {stats?.lowStockProducts?.map((product) => (
              <div key={product.publicId} className="px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-100 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 m-2 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500 truncate">SKU: {product.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-red-600">{product.stockQuantity} in stock</p>
                </div>
              </div>
            ))}
            {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
              <div className="px-6 py-8 text-center text-gray-500">All products are adequately stocked.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
