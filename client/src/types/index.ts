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
  totalSuppliers: number;
  openPurchases: number;
  pendingExpenses: number;
  activeProjects: number;
  newInquiries: number;
  assignedAssets: number;
  openTickets: number;
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

export interface Supplier {
  publicId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  status: 'active' | 'on_hold' | 'inactive';
  createdAt: string;
}

export interface PurchaseItem {
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface Purchase {
  publicId: string;
  orderNumber: string;
  supplierPublicId: string;
  supplierName: string;
  expectedDate: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  items: PurchaseItem[];
  totalAmount: number;
  notes: string;
  createdByName: string;
  createdAt: string;
}

export interface Expense {
  publicId: string;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: 'cash' | 'bank' | 'card' | 'mobile';
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  vendor: string;
  notes: string;
  createdByName: string;
  createdAt: string;
}

export interface ProjectTask {
  title: string;
  assigneeName: string;
  dueDate: string;
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
}

export interface Project {
  publicId: string;
  name: string;
  clientName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  startDate: string;
  dueDate: string;
  budget: number;
  description: string;
  tasks: ProjectTask[];
  createdByName: string;
  createdAt: string;
}

export interface Inquiry {
  publicId: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  interest: string;
  message: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  createdAt: string;
}

export interface Asset {
  publicId: string;
  assetTag: string;
  name: string;
  category: string;
  location: string;
  assignedTo: string;
  purchaseDate: string;
  value: number;
  condition: 'new' | 'good' | 'maintenance' | 'retired';
  status: 'available' | 'assigned' | 'repair' | 'disposed';
  notes: string;
  createdByName: string;
  createdAt: string;
}

export interface Ticket {
  publicId: string;
  ticketNumber: string;
  subject: string;
  requesterName: string;
  requesterEmail: string;
  department: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  source: 'customer' | 'internal' | 'supplier';
  description: string;
  resolution: string;
  createdByName: string;
  createdAt: string;
}


