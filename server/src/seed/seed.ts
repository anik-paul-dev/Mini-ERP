import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role, { ALL_PERMISSIONS } from '../modules/role/role.model';
import User from '../modules/auth/auth.model';
import Supplier from '../modules/supplier/supplier.model';
import Purchase from '../modules/purchase/purchase.model';
import Expense from '../modules/expense/expense.model';
import Project from '../modules/project/project.model';
import Inquiry from '../modules/inquiry/inquiry.model';
import Asset from '../modules/asset/asset.model';
import Ticket from '../modules/ticket/ticket.model';
import Product from '../modules/product/product.model';
import Customer from '../modules/customer/customer.model';
import Sale from '../modules/sale/sale.model';

dotenv.config();

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mini-erp';
    await mongoose.connect(uri);
    console.log('Connected to DB for seeding');

    // 1. Seed Roles
    const roles = [
      {
        name: 'Admin',
        permissions: ALL_PERMISSIONS,
        description: 'Full access to the system',
        isSystem: true,
      },
      {
        name: 'Manager',
        permissions: [
          'products:create', 'products:read', 'products:update', 'products:delete',
          'customers:create', 'customers:read', 'customers:update', 'customers:delete',
          'sales:create', 'sales:read', 'sales:update', 'sales:delete', 'sales:cancel', 'sales:export',
          'dashboard:read', 'activities:read',
          'suppliers:create', 'suppliers:read', 'suppliers:update', 'suppliers:delete',
          'purchases:create', 'purchases:read', 'purchases:update', 'purchases:delete',
          'expenses:create', 'expenses:read', 'expenses:update', 'expenses:delete',
          'projects:create', 'projects:read', 'projects:update', 'projects:delete',
          'inquiries:read', 'inquiries:update',
          'assets:create', 'assets:read', 'assets:update', 'assets:delete',
          'tickets:create', 'tickets:read', 'tickets:update', 'tickets:delete'
        ],
        description: 'Can manage products, customers and sales',
        isSystem: true,
      },
      {
        name: 'Employee',
        permissions: [
          'products:read', 'customers:read',
          'sales:create', 'sales:read', 'sales:update', 'sales:delete', 'sales:cancel', 'sales:export',
          'dashboard:read', 'projects:read', 'expenses:create', 'expenses:read',
          'assets:read', 'tickets:create', 'tickets:read', 'tickets:update'
        ],
        description: 'Can view products and create sales',
        isSystem: true,
      },
      {
        name: 'Procurement Officer',
        permissions: [
          'dashboard:read',
          'products:read',
          'suppliers:create', 'suppliers:read', 'suppliers:update', 'suppliers:delete',
          'purchases:create', 'purchases:read', 'purchases:update', 'purchases:delete',
          'tickets:create', 'tickets:read', 'tickets:update'
        ],
        description: 'Handles suppliers, purchase orders, and procurement issues',
        isSystem: false,
      },
      {
        name: 'Finance Officer',
        permissions: [
          'dashboard:read',
          'sales:read', 'sales:export',
          'purchases:read',
          'expenses:create', 'expenses:read', 'expenses:update', 'expenses:delete',
          'projects:read',
          'assets:read'
        ],
        description: 'Handles expenses, finance review, purchase visibility, and exports',
        isSystem: false,
      },
      {
        name: 'Project Lead',
        permissions: [
          'dashboard:read',
          'customers:read',
          'projects:create', 'projects:read', 'projects:update', 'projects:delete',
          'expenses:create', 'expenses:read',
          'assets:read',
          'tickets:create', 'tickets:read', 'tickets:update'
        ],
        description: 'Owns operational projects, task tracking, and project support tickets',
        isSystem: false,
      },
      {
        name: 'Asset Manager',
        permissions: [
          'dashboard:read',
          'assets:create', 'assets:read', 'assets:update', 'assets:delete',
          'expenses:create', 'expenses:read',
          'tickets:create', 'tickets:read', 'tickets:update'
        ],
        description: 'Manages company assets, repairs, assignments, and related tickets',
        isSystem: false,
      },
      {
        name: 'Support Agent',
        permissions: [
          'dashboard:read',
          'customers:read',
          'sales:read',
          'projects:read',
          'assets:read',
          'tickets:create', 'tickets:read', 'tickets:update', 'tickets:delete',
          'inquiries:read', 'inquiries:update'
        ],
        description: 'Handles customer, supplier, and internal support requests',
        isSystem: false,
      }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.name}`);
      } else {
        existingRole.permissions = roleData.permissions as string[];
        existingRole.description = roleData.description;
        existingRole.isSystem = roleData.isSystem;
        await existingRole.save();
        console.log(`Updated permissions for role: ${roleData.name}`);
      }
    }

    // 2. Seed Users
    const adminRole = await Role.findOne({ name: 'Admin' });
    const managerRole = await Role.findOne({ name: 'Manager' });
    const employeeRole = await Role.findOne({ name: 'Employee' });
    let adminUser = null;
    if (adminRole) {
      const existingAdmin = await User.findOne({ email: 'admin@minierp.com' });
      if (!existingAdmin) {
        adminUser = new User({
          name: 'Super Admin',
          email: 'admin@minierp.com',
          password: 'password123', // Will be hashed by pre-save hook
          role: adminRole._id,
          roleName: adminRole.name,
        });
        await adminUser.save();
        console.log('Created default admin user (admin@minierp.com / password123)');
      } else {
        adminUser = existingAdmin;
      }
    }

    if (managerRole) {
      const existingManager = await User.findOne({ email: 'manager@nexoraops.com' });
      if (!existingManager) {
        const managerUser = new User({
          name: 'Operations Manager',
          email: 'manager@nexoraops.com',
          password: 'password123',
          role: managerRole._id,
          roleName: managerRole.name,
        });
        await managerUser.save();
        console.log('Created default manager user (manager@nexoraops.com / password123)');
      }
    }

    if (employeeRole) {
      const existingEmployee = await User.findOne({ email: 'employee@nexoraops.com' });
      if (!existingEmployee) {
        const employeeUser = new User({
          name: 'Sales Employee',
          email: 'employee@nexoraops.com',
          password: 'password123',
          role: employeeRole._id,
          roleName: employeeRole.name,
        });
        await employeeUser.save();
        console.log('Created default employee user (employee@nexoraops.com / password123)');
      }
    }

    const specialistUsers = [
      { roleName: 'Procurement Officer', name: 'Procurement Officer', email: 'procurement@nexoraops.com' },
      { roleName: 'Finance Officer', name: 'Finance Officer', email: 'finance@nexoraops.com' },
      { roleName: 'Project Lead', name: 'Project Lead', email: 'projectlead@nexoraops.com' },
      { roleName: 'Asset Manager', name: 'Asset Manager', email: 'assets@nexoraops.com' },
      { roleName: 'Support Agent', name: 'Support Agent', email: 'support@nexoraops.com' },
    ];

    for (const userSeed of specialistUsers) {
      const role = await Role.findOne({ name: userSeed.roleName });
      if (!role) continue;
      const existingUser = await User.findOne({ email: userSeed.email });
      if (!existingUser) {
        const user = new User({
          name: userSeed.name,
          email: userSeed.email,
          password: 'password123',
          role: role._id,
          roleName: role.name,
        });
        await user.save();
        console.log(`Created ${userSeed.roleName} user (${userSeed.email} / password123)`);
      }
    }

    if (adminUser) {
      const productSeeds = [
        { name: 'Wireless Barcode Scanner', sku: 'WBS-1001', category: 'Retail Hardware', purchasePrice: 85, sellingPrice: 129, stockQuantity: 42, image: 'https://placehold.co/600x400/0f172a/38bdf8?text=Barcode+Scanner', imagePublicId: '' },
        { name: 'Thermal POS Printer', sku: 'TPP-220', category: 'Retail Hardware', purchasePrice: 140, sellingPrice: 215, stockQuantity: 18, image: 'https://placehold.co/600x400/0f172a/38bdf8?text=POS+Printer', imagePublicId: '' },
        { name: 'Inventory Label Roll', sku: 'ILR-500', category: 'Packaging', purchasePrice: 4, sellingPrice: 9, stockQuantity: 160, image: 'https://placehold.co/600x400/0f172a/38bdf8?text=Label+Roll', imagePublicId: '' },
        { name: 'Counter Cash Drawer', sku: 'CCD-410', category: 'Store Equipment', purchasePrice: 95, sellingPrice: 149, stockQuantity: 7, image: 'https://placehold.co/600x400/0f172a/38bdf8?text=Cash+Drawer', imagePublicId: '' },
        { name: 'Mobile Payment Terminal', sku: 'MPT-330', category: 'Payment Device', purchasePrice: 110, sellingPrice: 185, stockQuantity: 3, image: 'https://placehold.co/600x400/0f172a/38bdf8?text=Payment+Terminal', imagePublicId: '' },
      ];

      for (const productData of productSeeds) {
        await Product.updateOne(
          { sku: productData.sku },
          { $setOnInsert: { ...productData, createdBy: adminUser._id } },
          { upsert: true }
        );
      }

      const customerSeeds = [
        { name: 'Bright Retail Ltd', email: 'accounts@brightretail.com', phone: '+8801810000001', address: 'Gulshan, Dhaka' },
        { name: 'Hasan Distribution', email: 'purchase@hasandist.com', phone: '+8801810000002', address: 'Chattogram Port Area' },
        { name: 'North Star Mart', email: 'owner@northstarmart.com', phone: '+8801810000003', address: 'Uttara, Dhaka' },
        { name: 'Green Basket Shop', email: 'hello@greenbasket.com', phone: '+8801810000004', address: 'Dhanmondi, Dhaka' },
      ];

      for (const customerData of customerSeeds) {
        await Customer.updateOne(
          { email: customerData.email },
          { $setOnInsert: { ...customerData, createdBy: adminUser._id } },
          { upsert: true }
        );
      }

      const supplierSeeds = [
        { name: 'Araf Trade International', email: 'sales@araftrade.com', phone: '+880170000001', address: 'Motijheel, Dhaka', category: 'Electronics', rating: 5, status: 'active' },
        { name: 'Nova Packaging Ltd', email: 'hello@novapack.com', phone: '+880170000002', address: 'Tongi Industrial Area', category: 'Packaging', rating: 4, status: 'active' },
        { name: 'Metro Office Supply', email: 'support@metrooffice.com', phone: '+880170000003', address: 'Banani, Dhaka', category: 'Office Supplies', rating: 4, status: 'on_hold' },
      ];

      for (const supplierData of supplierSeeds) {
        await Supplier.updateOne(
          { name: supplierData.name },
          { $setOnInsert: { ...supplierData, createdBy: adminUser._id } },
          { upsert: true }
        );
      }

      const suppliers = await Supplier.find();
      const supplierByName = (name: string) => suppliers.find((supplier) => supplier.name === name) || suppliers[0];

      const purchaseSeeds = [
        {
          orderNumber: 'PO-1001',
          supplier: supplierByName('Araf Trade International'),
          expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'ordered',
          items: [
            { itemName: 'Barcode Scanner', quantity: 12, unitCost: 85 },
            { itemName: 'POS Printer', quantity: 6, unitCost: 140 },
          ],
          notes: 'Priority replenishment for retail sales counter.',
        },
        {
          orderNumber: 'PO-1002',
          supplier: supplierByName('Nova Packaging Ltd'),
          expectedDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
          status: 'draft',
          items: [{ itemName: 'Branded Shipping Box', quantity: 500, unitCost: 1.2 }],
          notes: 'For ecommerce shipping workflow.',
        },
      ];

      for (const seedPurchase of purchaseSeeds) {
        const items = seedPurchase.items.map((item) => ({ ...item, totalCost: item.quantity * item.unitCost }));
        await Purchase.updateOne(
          { orderNumber: seedPurchase.orderNumber },
          {
            $setOnInsert: {
              orderNumber: seedPurchase.orderNumber,
              supplierPublicId: seedPurchase.supplier.publicId,
              supplierName: seedPurchase.supplier.name,
              expectedDate: seedPurchase.expectedDate,
              status: seedPurchase.status,
              items,
              totalAmount: items.reduce((sum, item) => sum + item.totalCost, 0),
              notes: seedPurchase.notes,
              createdBy: adminUser._id,
              createdByName: adminUser.name,
            },
          },
          { upsert: true }
        );
      }

      const expenseSeeds = [
        { title: 'Warehouse rent', category: 'Facilities', amount: 1800, expenseDate: new Date(), paymentMethod: 'bank', status: 'approved', vendor: 'Dhaka Properties', notes: 'Monthly warehouse lease.' },
        { title: 'Delivery fuel allowance', category: 'Logistics', amount: 420, expenseDate: new Date(), paymentMethod: 'cash', status: 'paid', vendor: 'Operations Team', notes: 'Weekly delivery fuel reimbursement.' },
        { title: 'CRM onboarding workshop', category: 'Training', amount: 650, expenseDate: new Date(), paymentMethod: 'card', status: 'pending', vendor: 'GrowthOps Academy', notes: 'Manager training for advanced CRM usage.' },
      ];

      for (const expenseData of expenseSeeds) {
        await Expense.updateOne(
          { title: expenseData.title },
          { $setOnInsert: { ...expenseData, createdBy: adminUser._id, createdByName: adminUser.name } },
          { upsert: true }
        );
      }

      const projectSeeds = [
        {
          name: 'Uttara Branch Launch',
          clientName: 'Internal Expansion',
          priority: 'critical',
          status: 'active',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          budget: 25000,
          description: 'Open a new branch with stock setup, staff onboarding, POS readiness, and launch campaign.',
          tasks: [
            { title: 'Finalize branch stock transfer', assigneeName: 'Inventory Team', dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'in_progress' },
            { title: 'Train sales employees', assigneeName: 'Store Manager', dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), status: 'todo' },
          ],
        },
        {
          name: 'Finance Close Automation',
          clientName: 'Internal Finance',
          priority: 'high',
          status: 'planning',
          startDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          budget: 8000,
          description: 'Standardize expense approvals, purchase matching, and monthly close reporting.',
          tasks: [
            { title: 'Map expense approval statuses', assigneeName: 'Finance Manager', dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), status: 'todo' },
            { title: 'Review purchase order lifecycle', assigneeName: 'Procurement Lead', dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), status: 'todo' },
          ],
        },
      ];

      for (const projectData of projectSeeds) {
        await Project.updateOne(
          { name: projectData.name },
          { $setOnInsert: { ...projectData, createdBy: adminUser._id, createdByName: adminUser.name } },
          { upsert: true }
        );
      }

      const inquirySeeds = [
        { name: 'Nadia Rahman', email: 'nadia@example.com', company: 'Bright Retail', phone: '+880171111111', interest: 'Retail ERP demo', message: 'We need inventory, sales, branch reporting, and purchase workflows for three stores.', status: 'new' },
        { name: 'Sajib Hasan', email: 'sajib@example.com', company: 'Hasan Distribution', phone: '+880172222222', interest: 'Distribution ERP', message: 'Please contact us about supplier management and purchase order tracking.', status: 'contacted' },
      ];

      for (const inquiryData of inquirySeeds) {
        await Inquiry.updateOne({ email: inquiryData.email }, { $setOnInsert: inquiryData }, { upsert: true });
      }

      const assetSeeds = [
        { assetTag: 'AST-1001', name: 'Warehouse Barcode Scanner', category: 'Operations Hardware', location: 'Main Warehouse', assignedTo: 'Inventory Team', purchaseDate: new Date(), value: 450, condition: 'good', status: 'assigned', notes: 'Used for daily receiving and cycle count.' },
        { assetTag: 'AST-1002', name: 'Finance Laptop', category: 'IT Equipment', location: 'Head Office', assignedTo: 'Finance Manager', purchaseDate: new Date(), value: 1250, condition: 'new', status: 'assigned', notes: 'Configured with accounting exports.' },
        { assetTag: 'AST-1003', name: 'Backup POS Terminal', category: 'Retail Equipment', location: 'Uttara Branch', assignedTo: '', purchaseDate: new Date(), value: 780, condition: 'good', status: 'available', notes: 'Reserved for branch launch.' },
      ];

      for (const assetData of assetSeeds) {
        await Asset.updateOne(
          { assetTag: assetData.assetTag },
          { $setOnInsert: { ...assetData, createdBy: adminUser._id, createdByName: adminUser.name } },
          { upsert: true }
        );
      }

      const ticketSeeds = [
        { ticketNumber: 'TCK-1001', subject: 'Customer invoice correction request', requesterName: 'Nadia Rahman', requesterEmail: 'nadia@example.com', department: 'Customer Success', priority: 'high', status: 'open', source: 'customer', description: 'Customer requested correction on billing address and tax note before payment.', resolution: '' },
        { ticketNumber: 'TCK-1002', subject: 'POS printer intermittent disconnect', requesterName: 'Store Manager', requesterEmail: 'store@example.com', department: 'Operations', priority: 'medium', status: 'in_progress', source: 'internal', description: 'Printer disconnects during evening checkout rush and needs hardware inspection.', resolution: 'IT team assigned initial diagnostic.' },
      ];

      for (const ticketData of ticketSeeds) {
        await Ticket.updateOne(
          { ticketNumber: ticketData.ticketNumber },
          { $setOnInsert: { ...ticketData, createdBy: adminUser._id, createdByName: adminUser.name } },
          { upsert: true }
        );
      }

      const products = await Product.find();
      const customers = await Customer.find();
      const productBySku = (sku: string) => products.find((product) => product.sku === sku) || products[0];
      const customerByEmail = (email: string) => customers.find((customer) => customer.email === email) || customers[0];

      const saleSeeds = [
        {
          key: 'Bright Retail initial hardware rollout',
          customer: customerByEmail('accounts@brightretail.com'),
          items: [
            { product: productBySku('WBS-1001'), quantity: 2 },
            { product: productBySku('TPP-220'), quantity: 1 },
          ],
          status: 'active',
        },
        {
          key: 'North Star store counter package',
          customer: customerByEmail('owner@northstarmart.com'),
          items: [
            { product: productBySku('CCD-410'), quantity: 1 },
            { product: productBySku('MPT-330'), quantity: 1 },
          ],
          status: 'active',
        },
        {
          key: 'Green Basket canceled label order',
          customer: customerByEmail('hello@greenbasket.com'),
          items: [
            { product: productBySku('ILR-500'), quantity: 10 },
          ],
          status: 'canceled',
        },
      ];

      for (const saleSeed of saleSeeds) {
        if (!saleSeed.customer || saleSeed.items.some((item) => !item.product)) continue;
        const items = saleSeed.items.map((item) => ({
          product: item.product._id,
          productPublicId: item.product.publicId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice,
          totalPrice: item.quantity * item.product.sellingPrice,
        }));
        const grandTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

        await Sale.updateOne(
          { customerPublicId: saleSeed.customer.publicId, grandTotal, createdByName: adminUser.name },
          {
            $setOnInsert: {
              customer: saleSeed.customer._id,
              customerPublicId: saleSeed.customer.publicId,
              customerName: saleSeed.customer.name,
              items,
              grandTotal,
              status: saleSeed.status,
              canceledAt: saleSeed.status === 'canceled' ? new Date() : undefined,
              canceledBy: saleSeed.status === 'canceled' ? adminUser._id : undefined,
              canceledByName: saleSeed.status === 'canceled' ? adminUser.name : undefined,
              createdBy: adminUser._id,
              createdByName: adminUser.name,
            },
          },
          { upsert: true }
        );
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
