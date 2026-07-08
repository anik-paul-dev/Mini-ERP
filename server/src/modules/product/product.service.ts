import mongoose from 'mongoose';
import Product from './product.model';
import ApiError from '../../utils/ApiError';
import QueryBuilder from '../../utils/QueryBuilder';
import { cloudinary } from '../../config/cloudinary';
import { getIO } from '../../config/socket';
import activityService from '../activity/activity.service';

class ProductService {
  async getAllProducts(query: any) {
    const productQuery = new QueryBuilder(Product.find(), query)
      .search(['name', 'sku', 'category'])
      .filter()
      .sort()
      .paginate();

    const products = await productQuery.query;
    const total = await productQuery.countTotal();

    return { products, total };
  }

  async getProduct(publicId: string) {
    const product = await Product.findOne({ publicId });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async createProduct(data: any, file: Express.Multer.File, user: { _id?: string, name?: string }) {
    if (!file) {
      throw ApiError.badRequest('Product image is required');
    }

    const existingSku = await Product.findOne({ sku: data.sku });
    if (existingSku) {
      throw ApiError.conflict('SKU already exists');
    }

    // Upload image to Cloudinary
    let imageInfo = { url: '', public_id: '' };
    try {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'mini-erp/products',
      });
      imageInfo = { url: result.secure_url, public_id: result.public_id };
    } catch (error) {
      throw ApiError.internal('Failed to upload image');
    }

    const product = new Product({
      ...data,
      image: imageInfo.url,
      imagePublicId: imageInfo.public_id,
      createdBy: new mongoose.Types.ObjectId(user._id),
    });

    await product.save();

    await activityService.logActivity({
      action: 'create',
      entityType: 'product',
      entityId: product.publicId,
      entityName: product.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Created product ${product.name} (SKU: ${product.sku})`,
    });

    return product;
  }

  async updateProduct(publicId: string, data: any, user: { _id?: string, name?: string }, file?: Express.Multer.File) {
    const product = await Product.findOne({ publicId });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (data.sku && data.sku !== product.sku) {
      const existingSku = await Product.findOne({ sku: data.sku });
      if (existingSku) {
        throw ApiError.conflict('SKU already exists');
      }
    }

    if (file) {
      try {
        // Delete old image
        if (product.imagePublicId) {
          await cloudinary.uploader.destroy(product.imagePublicId);
        }

        // Upload new image
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'mini-erp/products',
        });
        
        data.image = result.secure_url;
        data.imagePublicId = result.public_id;
      } catch (error) {
        throw ApiError.internal('Failed to upload new image');
      }
    }

    const updatedProduct = await Product.findOneAndUpdate({ publicId }, data, {
      new: true,
      runValidators: true,
    });

    // Notify if stock is updated and low
    if (updatedProduct && updatedProduct.stockQuantity < 5) {
      const io = getIO();
      io.to('role:Admin').to('role:Manager').emit('notification', {
        type: 'low_stock',
        message: `Product ${updatedProduct.name} is running low on stock (${updatedProduct.stockQuantity})`,
        data: updatedProduct,
      });
    }

    if (updatedProduct) {
      await activityService.logActivity({
        action: 'update',
        entityType: 'product',
        entityId: updatedProduct.publicId,
        entityName: updatedProduct.name,
        performedBy: new mongoose.Types.ObjectId(user._id),
        performerName: user.name || 'Unknown',
        details: `Updated product ${updatedProduct.name}`,
      });
    }

    return updatedProduct;
  }

  async deleteProduct(publicId: string, user: { _id?: string, name?: string }) {
    const product = await Product.findOne({ publicId });
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    if (product.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(product.imagePublicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary', error);
      }
    }

    await Product.findOneAndDelete({ publicId });

    await activityService.logActivity({
      action: 'delete',
      entityType: 'product',
      entityId: product.publicId,
      entityName: product.name,
      performedBy: new mongoose.Types.ObjectId(user._id),
      performerName: user.name || 'Unknown',
      details: `Deleted product ${product.name} (SKU: ${product.sku})`,
    });
  }
}

export default new ProductService();
