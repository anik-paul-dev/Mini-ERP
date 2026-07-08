import mongoose from 'mongoose';
import Sale from './sale.model';
import Product from '../product/product.model';
import Customer from '../customer/customer.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import { getIO } from '../../config/socket';
import activityService from '../activity/activity.service';

class SaleService {
  async getAllSales(query: any) {
    const saleQuery = new QueryBuilder(Sale.find(), query)
      .search(['customerName', 'publicId'])
      .filter()
      .sort()
      .paginate();

    const sales = await saleQuery.query;
    const total = await saleQuery.countTotal();

    return { sales, total };
  }

  async getSale(publicId: string) {
    const sale = await Sale.findOne({ publicId });
    if (!sale) {
      throw ApiError.notFound('Sale not found');
    }
    return sale;
  }

  async createSale(data: any, user: any) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find customer
      const customer = await Customer.findOne({ publicId: data.customerPublicId });
      if (!customer) {
        throw ApiError.badRequest('Customer not found');
      }

      const saleItems = [];
      let grandTotal = 0;

      // Process items and reduce stock
      for (const item of data.items) {
        const product = await Product.findOne({ publicId: item.productPublicId }).session(session);
        
        if (!product) {
          throw ApiError.badRequest(`Product not found: ${item.productPublicId}`);
        }

        if (product.stockQuantity < item.quantity) {
          throw ApiError.conflict(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
        }

        const unitPrice = product.sellingPrice;
        const totalPrice = unitPrice * item.quantity;
        
        // Deduct stock
        product.stockQuantity -= item.quantity;
        await product.save({ session });

        saleItems.push({
          product: product._id,
          productPublicId: product.publicId,
          productName: product.name,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        });

        grandTotal += totalPrice;
      }

      // Create Sale
      const sale = new Sale({
        customer: customer._id,
        customerPublicId: customer.publicId,
        customerName: customer.name,
        items: saleItems,
        grandTotal,
        createdBy: new mongoose.Types.ObjectId(user._id),
        createdByName: user.name,
      });

      await sale.save({ session });
      await session.commitTransaction();

      // Emit real-time event for low stock and new sale
      const io = getIO();
      
      io.emit('sale-created', {
        saleId: sale.publicId,
        grandTotal: sale.grandTotal,
        customerName: sale.customerName,
      });

      for (const item of saleItems) {
        const p = await Product.findById(item.product);
        if (p && p.stockQuantity < 5) {
          io.to('role:Admin').to('role:Manager').emit('notification', {
            type: 'low_stock',
            message: `Product ${p.name} is running low on stock (${p.stockQuantity})`,
            data: p,
          });
        }
      }

      await activityService.logActivity({
        action: 'create',
        entityType: 'sale',
        entityId: sale.publicId,
        entityName: `Sale for ${sale.customerName}`,
        performedBy: new mongoose.Types.ObjectId(user._id),
        performerName: user.name || 'Unknown',
        details: `Created sale with ${sale.items.length} items for ${sale.customerName}. Grand Total: $${sale.grandTotal}`,
      });

      return sale;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async exportSalesCSV(query: any) {
    const saleQuery = new QueryBuilder(Sale.find().lean(), query)
      .search(['customerName', 'publicId'])
      .filter()
      .sort();

    // Do not paginate, get all matching results
    const sales = await saleQuery.query;

    if (!sales || sales.length === 0) {
      return '';
    }

    // Generate CSV
    let csv = 'Sale ID,Customer,Total Items,Grand Total,Created By,Date\n';
    
    for (const sale of sales) {
      const date = sale.createdAt ? new Date(sale.createdAt).toISOString() : '';
      const itemsCount = sale.items?.length || 0;
      csv += `${sale.publicId},"${sale.customerName}",${itemsCount},${sale.grandTotal},"${sale.createdByName}",${date}\n`;
    }

    return csv;
  }
}

export default new SaleService();
