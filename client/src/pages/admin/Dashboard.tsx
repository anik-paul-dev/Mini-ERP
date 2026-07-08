import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import StatCard from '../../components/ui/StatCard';
import { Package, Users, ShoppingCart, DollarSign, AlertCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { DashboardStats } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';

const Dashboard = () => {
  const { get } = useApi();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminDashboardStats'],
    queryFn: () => get<DashboardStats>('/dashboard/stats'),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
    <div className="space-y-6 animate-in fade-in">
      <h1 className="text-2xl font-bold text-slate-100">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
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
          title="Canceled Sales" 
          value={stats?.canceledSalesCount || 0} 
          icon={<XCircle size={24} />} 
        />
        <StatCard 
          title="Deducted Amount" 
          value={formatCurrency(stats?.deductedSalesAmount || 0)} 
          icon={<DollarSign size={24} />} 
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
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-700/50 bg-surface-800/50">
            <h3 className="text-lg font-semibold text-slate-100">Recent Sales</h3>
          </div>
          <div className="divide-y divide-surface-700/50">
            {stats?.recentSales?.map((sale) => (
              <div key={sale.publicId} className="px-6 py-4 flex items-center justify-between hover:bg-surface-700/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-slate-200">{sale.customerName}</p>
                  <p className="text-xs text-surface-400">{formatDate(sale.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${sale.status === 'canceled' ? 'text-rose-400 line-through' : 'text-brand-400'}`}>{formatCurrency(sale.grandTotal)}</p>
                  <p className="text-xs text-surface-400">ID: {sale.publicId.substring(0, 8)}</p>
                  {sale.status === 'canceled' && <p className="text-xs font-medium text-rose-400">Canceled</p>}
                </div>
              </div>
            ))}
            {(!stats?.recentSales || stats.recentSales.length === 0) && (
              <div className="px-6 py-8 text-center text-surface-400">No recent sales found.</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card border-rose-500/20 overflow-hidden">
          <div className="px-6 py-4 border-b border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-rose-400 flex items-center">
              <AlertCircle size={20} className="mr-2" />
              Low Stock Alerts
            </h3>
            <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {stats?.lowStockProductsCount} items
            </span>
          </div>
          <div className="divide-y divide-surface-700/50 max-h-[400px] overflow-y-auto custom-scrollbar">
            {stats?.lowStockProducts?.map((product) => (
              <div key={product.publicId} className="px-6 py-4 flex items-center space-x-4 hover:bg-surface-700/30 transition-colors">
                <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-surface-700 overflow-hidden border border-surface-600">
                  {product.image ? (
                    <img src={product.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Package className="h-6 w-6 m-2 text-surface-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{product.name}</p>
                  <p className="text-xs text-surface-400 truncate">SKU: {product.sku}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-rose-400">{product.stockQuantity} in stock</p>
                </div>
              </div>
            ))}
            {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
              <div className="px-6 py-8 text-center text-surface-400">All products are adequately stocked.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
