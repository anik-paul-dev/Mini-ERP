import Product from '../product/product.model';
import Customer from '../customer/customer.model';
import Sale from '../sale/sale.model';
import { cache } from '../../config/redis';

class DashboardService {
  async getStatistics() {
    const cacheKey = 'dashboard:stats';

    // Try cache
    const cachedStats = await cache.get(cacheKey);
    if (cachedStats) {
      return JSON.parse(cachedStats);
    }

    // Calculate stats
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    const activeSalesResult = await Sale.aggregate([
      { $match: { status: { $ne: 'canceled' } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
    ]);

    const canceledSalesResult = await Sale.aggregate([
      { $match: { status: 'canceled' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSalesAmount = activeSalesResult.length > 0 ? activeSalesResult[0].totalAmount : 0;
    const totalSalesCount = activeSalesResult.length > 0 ? activeSalesResult[0].count : 0;
    const canceledSalesAmount = canceledSalesResult.length > 0 ? canceledSalesResult[0].totalAmount : 0;
    const canceledSalesCount = canceledSalesResult.length > 0 ? canceledSalesResult[0].count : 0;

    const lowStockProductsCount = await Product.countDocuments({ stockQuantity: { $lt: 5 } });

    // Get low stock products details
    const lowStockProducts = await Product.find({ stockQuantity: { $lt: 5 } })
      .select('name sku stockQuantity publicId image')
      .limit(10);

    // Get recent sales
    const recentSales = await Sale.find()
      .select('customerName grandTotal status createdAt publicId')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      totalProducts,
      totalCustomers,
      totalSalesCount,
      totalSalesAmount,
      canceledSalesCount,
      canceledSalesAmount,
      deductedSalesAmount: canceledSalesAmount,
      lowStockProductsCount,
      lowStockProducts,
      recentSales,
    };

    // Set cache (5 minutes)
    await cache.set(cacheKey, JSON.stringify(stats), 300);

    return stats;
  }

  async invalidateCache() {
    await cache.del('dashboard:stats');
  }
}

export default new DashboardService();
