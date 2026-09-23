import {
  BriefcaseBusiness,
  ClipboardList,
  FileQuestion,
  HandCoins,
  Laptop,
  LifeBuoy,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { Asset, Expense, Inquiry, Project, Purchase, Supplier, Ticket } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

export type ErpResourceKey = 'suppliers' | 'purchases' | 'expenses' | 'projects' | 'inquiries' | 'assets' | 'tickets';

export type FieldType = 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'purchaseItems' | 'projectTasks';

export interface ErpField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

export interface ErpResourceConfig<T> {
  key: ErpResourceKey;
  title: string;
  singularTitle: string;
  description: string;
  endpoint: string;
  permission: string;
  icon: LucideIcon;
  searchable: string;
  allowCreate: boolean;
  allowEdit: boolean;
  allowDelete: boolean;
  fields: ErpField[];
  columns: Array<{
    header: string;
    cell: (item: T) => string;
    tone?: (item: T) => string;
  }>;
  preparePayload?: (values: Record<string, any>) => Record<string, any>;
}

const statusTone = (value: string) => {
  if (['active', 'ordered', 'approved', 'paid', 'completed', 'qualified'].includes(value)) return 'text-emerald-300';
  if (['pending', 'draft', 'planning', 'new'].includes(value)) return 'text-amber-300';
  if (['cancelled', 'rejected', 'blocked', 'inactive', 'closed'].includes(value)) return 'text-rose-300';
  return 'text-brand-300';
};

export const erpResources: Record<ErpResourceKey, ErpResourceConfig<any>> = {
  suppliers: {
    key: 'suppliers',
    title: 'Suppliers',
    singularTitle: 'Supplier',
    description: 'Manage vendors, ratings, status, categories, and purchasing contacts.',
    endpoint: '/suppliers',
    permission: 'suppliers',
    icon: Truck,
    searchable: 'Search suppliers by name, category, email, phone',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'name', label: 'Supplier Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'rating', label: 'Rating', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'on_hold', 'inactive'].map((value) => ({ label: value.replace('_', ' '), value })) },
    ],
    columns: [
      { header: 'Supplier', cell: (item: Supplier) => item.name },
      { header: 'Category', cell: (item: Supplier) => item.category },
      { header: 'Contact', cell: (item: Supplier) => item.email || item.phone || 'Not provided' },
      { header: 'Rating', cell: (item: Supplier) => `${item.rating}/5` },
      { header: 'Status', cell: (item: Supplier) => item.status.replace('_', ' '), tone: (item: Supplier) => statusTone(item.status) },
    ],
  },
  purchases: {
    key: 'purchases',
    title: 'Purchase Orders',
    singularTitle: 'Purchase Order',
    description: 'Create purchase orders, track supplier commitments, expected dates, and received/cancelled status.',
    endpoint: '/purchases',
    permission: 'purchases',
    icon: ClipboardList,
    searchable: 'Search purchase orders by number, supplier, notes',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'orderNumber', label: 'Order Number', type: 'text', required: true },
      { name: 'supplierPublicId', label: 'Supplier Public ID', type: 'text', required: true },
      { name: 'expectedDate', label: 'Expected Date', type: 'date', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'ordered', 'received', 'cancelled'].map((value) => ({ label: value, value })) },
      { name: 'items', label: 'Line Items', type: 'purchaseItems', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { header: 'PO Number', cell: (item: Purchase) => item.orderNumber },
      { header: 'Supplier', cell: (item: Purchase) => item.supplierName },
      { header: 'Expected', cell: (item: Purchase) => formatDate(item.expectedDate).split(',')[0] },
      { header: 'Total', cell: (item: Purchase) => formatCurrency(item.totalAmount) },
      { header: 'Status', cell: (item: Purchase) => item.status, tone: (item: Purchase) => statusTone(item.status) },
    ],
  },
  expenses: {
    key: 'expenses',
    title: 'Finance Expenses',
    singularTitle: 'Finance Expense',
    description: 'Track operating costs, vendors, payment method, approval status, and paid/rejected outcomes.',
    endpoint: '/expenses',
    permission: 'expenses',
    icon: HandCoins,
    searchable: 'Search expenses by title, category, vendor',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'title', label: 'Expense Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'expenseDate', label: 'Expense Date', type: 'date', required: true },
      { name: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['cash', 'bank', 'card', 'mobile'].map((value) => ({ label: value, value })) },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected', 'paid'].map((value) => ({ label: value, value })) },
      { name: 'vendor', label: 'Vendor', type: 'text' },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { header: 'Expense', cell: (item: Expense) => item.title },
      { header: 'Category', cell: (item: Expense) => item.category },
      { header: 'Amount', cell: (item: Expense) => formatCurrency(item.amount) },
      { header: 'Date', cell: (item: Expense) => formatDate(item.expenseDate).split(',')[0] },
      { header: 'Status', cell: (item: Expense) => item.status, tone: (item: Expense) => statusTone(item.status) },
    ],
  },
  projects: {
    key: 'projects',
    title: 'Projects & Tasks',
    singularTitle: 'Project',
    description: 'Run operational projects with budgets, priorities, due dates, and task lists employees can follow.',
    endpoint: '/projects',
    permission: 'projects',
    icon: BriefcaseBusiness,
    searchable: 'Search projects by name, client, description, task',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'name', label: 'Project Name', type: 'text', required: true },
      { name: 'clientName', label: 'Client / Department', type: 'text' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'].map((value) => ({ label: value, value })) },
      { name: 'status', label: 'Status', type: 'select', options: ['planning', 'active', 'completed', 'on_hold'].map((value) => ({ label: value.replace('_', ' '), value })) },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
      { name: 'budget', label: 'Budget', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'tasks', label: 'Tasks', type: 'projectTasks' },
    ],
    columns: [
      { header: 'Project', cell: (item: Project) => item.name },
      { header: 'Client', cell: (item: Project) => item.clientName || 'Internal' },
      { header: 'Budget', cell: (item: Project) => formatCurrency(item.budget || 0) },
      { header: 'Due', cell: (item: Project) => formatDate(item.dueDate).split(',')[0] },
      { header: 'Status', cell: (item: Project) => item.status.replace('_', ' '), tone: (item: Project) => statusTone(item.status) },
    ],
  },
  inquiries: {
    key: 'inquiries',
    title: 'Public Inquiries',
    singularTitle: 'Public Inquiry',
    description: 'Review and qualify demo requests and contact submissions from the public website.',
    endpoint: '/inquiries',
    permission: 'inquiries',
    icon: FileQuestion,
    searchable: 'Search inquiries by name, email, company, message',
    allowCreate: false,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'qualified', 'closed'].map((value) => ({ label: value, value })) },
    ],
    columns: [
      { header: 'Name', cell: (item: Inquiry) => item.name },
      { header: 'Company', cell: (item: Inquiry) => item.company || 'Not provided' },
      { header: 'Interest', cell: (item: Inquiry) => item.interest },
      { header: 'Email', cell: (item: Inquiry) => item.email },
      { header: 'Status', cell: (item: Inquiry) => item.status, tone: (item: Inquiry) => statusTone(item.status) },
    ],
  },
  assets: {
    key: 'assets',
    title: 'Assets',
    singularTitle: 'Asset',
    description: 'Track company equipment, assignment, location, condition, repair state, and asset value.',
    endpoint: '/assets',
    permission: 'assets',
    icon: Laptop,
    searchable: 'Search assets by tag, name, location, assignee',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'assetTag', label: 'Asset Tag', type: 'text', required: true },
      { name: 'name', label: 'Asset Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'assignedTo', label: 'Assigned To', type: 'text' },
      { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
      { name: 'value', label: 'Value', type: 'number' },
      { name: 'condition', label: 'Condition', type: 'select', options: ['new', 'good', 'maintenance', 'retired'].map((value) => ({ label: value, value })) },
      { name: 'status', label: 'Status', type: 'select', options: ['available', 'assigned', 'repair', 'disposed'].map((value) => ({ label: value, value })) },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { header: 'Asset', cell: (item: Asset) => `${item.assetTag} - ${item.name}` },
      { header: 'Category', cell: (item: Asset) => item.category },
      { header: 'Location', cell: (item: Asset) => item.location || 'Not set' },
      { header: 'Value', cell: (item: Asset) => formatCurrency(item.value || 0) },
      { header: 'Status', cell: (item: Asset) => item.status, tone: (item: Asset) => statusTone(item.status) },
    ],
  },
  tickets: {
    key: 'tickets',
    title: 'Service Tickets',
    singularTitle: 'Service Ticket',
    description: 'Handle customer, supplier, and internal support requests with priority, ownership, and resolution tracking.',
    endpoint: '/tickets',
    permission: 'tickets',
    icon: LifeBuoy,
    searchable: 'Search tickets by number, subject, requester, department',
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    fields: [
      { name: 'ticketNumber', label: 'Ticket Number', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'requesterName', label: 'Requester Name', type: 'text', required: true },
      { name: 'requesterEmail', label: 'Requester Email', type: 'email' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'urgent'].map((value) => ({ label: value, value })) },
      { name: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'resolved', 'closed'].map((value) => ({ label: value.replace('_', ' '), value })) },
      { name: 'source', label: 'Source', type: 'select', options: ['customer', 'internal', 'supplier'].map((value) => ({ label: value, value })) },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'resolution', label: 'Resolution', type: 'textarea' },
    ],
    columns: [
      { header: 'Ticket', cell: (item: Ticket) => `${item.ticketNumber} - ${item.subject}` },
      { header: 'Requester', cell: (item: Ticket) => item.requesterName },
      { header: 'Priority', cell: (item: Ticket) => item.priority, tone: (item: Ticket) => statusTone(item.priority === 'urgent' ? 'blocked' : item.priority) },
      { header: 'Department', cell: (item: Ticket) => item.department },
      { header: 'Status', cell: (item: Ticket) => item.status.replace('_', ' '), tone: (item: Ticket) => statusTone(item.status) },
    ],
  },
};
