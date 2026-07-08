export interface User {
  publicId: string;
  name: string;
  email: string;
  roleName: string;
  avatar: string;
  permissions: string[];
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Product {
  publicId: string;
  name: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  image: string;
  createdAt: string;
}

export interface Customer {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface SaleItem {
  productPublicId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Sale {
  publicId: string;
  customerPublicId: string;
  customerName: string;
  items: SaleItem[];
  grandTotal: number;
  createdByName: string;
  status: 'active' | 'canceled';
  canceledAt?: string;
  canceledByName?: string;
  createdAt: string;
}

export interface Role {
  publicId: string;
  name: string;
  permissions: string[];
  description: string;
  isSystem: boolean;
}

export interface DashboardStats {
  totalProducts: number;
  totalCustomers: number;
  totalSalesCount: number;
  totalSalesAmount: number;
  canceledSalesCount: number;
  canceledSalesAmount: number;
  deductedSalesAmount: number;
  lowStockProductsCount: number;
  lowStockProducts: Pick<Product, 'publicId' | 'name' | 'sku' | 'stockQuantity' | 'image'>[];
  recentSales: Pick<Sale, 'publicId' | 'customerName' | 'grandTotal' | 'status' | 'createdAt'>[];
}

export interface ChatMessage {
  publicId: string;
  senderPublicId: string;
  senderName: string;
  receiverPublicId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ChatContact {
  publicId: string;
  name: string;
  avatar: string;
  roleName?: string;
  lastMessage?: string;
  lastMessageAt?: string | null;
  unreadCount?: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}


