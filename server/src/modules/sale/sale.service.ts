import mongoose from 'mongoose';
import Sale, { ISaleItem } from './sale.model';
import Product from '../product/product.model';
import Customer from '../customer/customer.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import { getIO } from '../../config/socket';
import activityService from '../activity/activity.service';

type SaleUser = { _id?: string; name?: string };

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

  private async restoreStock(items: ISaleItem[], session: mongoose.ClientSession) {
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stockQuantity: item.quantity } },
        { session, runValidators: true }
      );
    }
  }

  private async buildSaleItems(data: any, session: mongoose.ClientSession) {
    const saleItems = [];
    let grandTotal = 0;

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

    return { saleItems, grandTotal };
  }

  private emitLowStockNotifications = async (items: ISaleItem[]) => {
    const io = getIO();

    for (const item of items) {
      const p = await Product.findById(item.product);
      if (p && p.stockQuantity < 5) {
        io.to('role:Admin').to('role:Manager').emit('notification', {
          type: 'low_stock',
          message: `Product ${p.name} is running low on stock (${p.stockQuantity})`,
          data: p,
        });
      }
    }
  };

  async createSale(data: any, user: SaleUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const customer = await Customer.findOne({ publicId: data.customerPublicId }).session(session);
      if (!customer) {
        throw ApiError.badRequest('Customer not found');
      }

      const { saleItems, grandTotal } = await this.buildSaleItems(data, session);

      const sale = new Sale({
        customer: customer._id,
        customerPublicId: customer.publicId,
        customerName: customer.name,
        items: saleItems,
        grandTotal,
        status: 'active',
        createdBy: new mongoose.Types.ObjectId(user._id),
        createdByName: user.name,
      });

      await sale.save({ session });
      await session.commitTransaction();

      getIO().emit('sale-created', {
        saleId: sale.publicId,
        grandTotal: sale.grandTotal,
        customerName: sale.customerName,
      });

      await this.emitLowStockNotifications(saleItems);

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

  async updateSale(publicId: string, data: any, user: SaleUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findOne({ publicId }).session(session);
      if (!sale) {
        throw ApiError.notFound('Sale not found');
      }

      if (sale.status === 'canceled') {
        throw ApiError.conflict('Canceled sales cannot be edited');
      }

      const customer = await Customer.findOne({ publicId: data.customerPublicId }).session(session);
      if (!customer) {
        throw ApiError.badRequest('Customer not found');
      }

      await this.restoreStock(sale.items, session);
      const { saleItems, grandTotal } = await this.buildSaleItems(data, session);

      sale.customer = customer._id;
      sale.customerPublicId = customer.publicId;
      sale.customerName = customer.name;
      sale.items = saleItems;
      sale.grandTotal = grandTotal;
      await sale.save({ session });

      await session.commitTransaction();

      await this.emitLowStockNotifications(saleItems);

      await activityService.logActivity({
        action: 'update',
        entityType: 'sale',
        entityId: sale.publicId,
        entityName: `Sale for ${sale.customerName}`,
        performedBy: new mongoose.Types.ObjectId(user._id),
        performerName: user.name || 'Unknown',
        details: `Updated sale for ${sale.customerName}. Grand Total: $${sale.grandTotal}`,
      });

      return sale;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cancelSale(publicId: string, user: SaleUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findOne({ publicId }).session(session);
      if (!sale) {
        throw ApiError.notFound('Sale not found');
      }

      if (sale.status === 'canceled') {
        throw ApiError.conflict('Sale is already canceled');
      }

      await this.restoreStock(sale.items, session);
      sale.status = 'canceled';
      sale.canceledAt = new Date();
      sale.canceledBy = new mongoose.Types.ObjectId(user._id);
      sale.canceledByName = user.name || 'Unknown';
      await sale.save({ session });

      await session.commitTransaction();

      await activityService.logActivity({
        action: 'update',
        entityType: 'sale',
        entityId: sale.publicId,
        entityName: `Sale for ${sale.customerName}`,
        performedBy: new mongoose.Types.ObjectId(user._id),
        performerName: user.name || 'Unknown',
        details: `Canceled sale for ${sale.customerName}. Deducted Amount: $${sale.grandTotal}`,
      });

      return sale;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async deleteSale(publicId: string, user: SaleUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sale = await Sale.findOne({ publicId }).session(session);
      if (!sale) {
        throw ApiError.notFound('Sale not found');
      }

      if (sale.status !== 'canceled') {
        await this.restoreStock(sale.items, session);
      }

      await Sale.findOneAndDelete({ publicId }).session(session);
      await session.commitTransaction();

      await activityService.logActivity({
        action: 'delete',
        entityType: 'sale',
        entityId: sale.publicId,
        entityName: `Sale for ${sale.customerName}`,
        performedBy: new mongoose.Types.ObjectId(user._id),
        performerName: user.name || 'Unknown',
        details: `Deleted sale for ${sale.customerName}. Amount: $${sale.grandTotal}`,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async exportSalesCSV(query: any) {
    const saleQuery = new QueryBuilder(Sale.find(), query)
      .search(['customerName', 'publicId'])
      .filter()
      .sort();

    const sales = await saleQuery.query;

    if (!sales || sales.length === 0) {
      return '';
    }

    let csv = 'Sale ID,Customer,Status,Total Items,Grand Total,Created By,Date\n';

    for (const sale of sales) {
      const date = sale.createdAt ? new Date(sale.createdAt).toISOString() : '';
      const itemsCount = sale.items?.length || 0;
      csv += `${sale.publicId},"${sale.customerName}",${sale.status || 'active'},${itemsCount},${sale.grandTotal},"${sale.createdByName}",${date}\n`;
    }

    return csv;
  }
}

export default new SaleService();

