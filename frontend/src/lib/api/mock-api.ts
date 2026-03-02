import { Product, Supplier, Customer, Warehouse, Sales, Transaction, DashboardStats, RecentTransaction, LowStockItem, ProductFormData, SupplierFormData, CustomerFormData, WarehouseFormData, SalesFormData, TransactionFormData, ApiResponse, DailyReport, StockReportItem, BalanceReportItem } from '@/types';
import { mockProducts, mockSuppliers, mockCustomers, mockWarehouses, mockSales, mockTransactions } from '@/lib/mock-data';
import { generateInvoiceNumber, generateId } from '@/lib/utils';

// Delay simulasi API response
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Products API
export const productsApi = {
  getAll: async (params?: { search?: string; category?: string }): Promise<Product[]> => {
    await delay(300);
    let data = [...mockProducts];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      data = data.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.code.toLowerCase().includes(search)
      );
    }
    
    if (params?.category && params.category !== 'all') {
      data = data.filter(p => p.category === params.category);
    }
    
    return data;
  },

  getById: async (id: string): Promise<Product | null> => {
    await delay(200);
    return mockProducts.find(p => p.id === id) || null;
  },

  create: async (data: ProductFormData): Promise<Product> => {
    await delay(500);
    const newProduct: Product = {
      ...data,
      id: generateId(),
      code: `PRD${String(mockProducts.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  update: async (id: string, data: Partial<ProductFormData>): Promise<Product> => {
    await delay(400);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts[index] = {
        ...mockProducts[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockProducts[index];
    }
    throw new Error('Product not found');
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) {
      mockProducts.splice(index, 1);
    } else {
      throw new Error('Product not found');
    }
  },
};

// Suppliers API
export const suppliersApi = {
  getAll: async (params?: { search?: string }): Promise<Supplier[]> => {
    await delay(300);
    let data = [...mockSuppliers];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      data = data.filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.id.toLowerCase().includes(search)
      );
    }
    
    return data;
  },

  getById: async (id: string): Promise<Supplier | null> => {
    await delay(200);
    return mockSuppliers.find(s => s.id === id) || null;
  },

  create: async (data: SupplierFormData): Promise<Supplier> => {
    await delay(500);
    const newSupplier: Supplier = {
      ...data,
      id: generateId(),
      code: `SUP${String(mockSuppliers.length + 1).padStart(3, '0')}`,
      balance: 0,
      totalTransactions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  },

  update: async (id: string, data: Partial<SupplierFormData>): Promise<Supplier> => {
    await delay(400);
    const index = mockSuppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSuppliers[index] = {
        ...mockSuppliers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockSuppliers[index];
    }
    throw new Error('Supplier not found');
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockSuppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSuppliers.splice(index, 1);
    } else {
      throw new Error('Supplier not found');
    }
  },
};

// Customers API
export const customersApi = {
  getAll: async (params?: { search?: string; withBalance?: boolean }): Promise<Customer[]> => {
    await delay(300);
    let data = [...mockCustomers];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      data = data.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.id.toLowerCase().includes(search)
      );
    }
    
    if (params?.withBalance) {
      data = data.filter(c => c.balance > 0);
    }
    
    return data;
  },

  getById: async (id: string): Promise<Customer | null> => {
    await delay(200);
    return mockCustomers.find(c => c.id === id) || null;
  },

  create: async (data: CustomerFormData): Promise<Customer> => {
    await delay(500);
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      code: `CUS${String(mockCustomers.length + 1).padStart(3, '0')}`,
      balance: 0,
      totalTransactions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCustomers.push(newCustomer);
    return newCustomer;
  },

  update: async (id: string, data: Partial<CustomerFormData>): Promise<Customer> => {
    await delay(400);
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCustomers[index] = {
        ...mockCustomers[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockCustomers[index];
    }
    throw new Error('Customer not found');
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockCustomers.findIndex(c => c.id === id);
    if (index !== -1) {
      mockCustomers.splice(index, 1);
    } else {
      throw new Error('Customer not found');
    }
  },
};

// Warehouses API
export const warehousesApi = {
  getAll: async (): Promise<Warehouse[]> => {
    await delay(200);
    return [...mockWarehouses];
  },

  getById: async (id: string): Promise<Warehouse | null> => {
    await delay(150);
    return mockWarehouses.find(w => w.id === id) || null;
  },

  create: async (data: WarehouseFormData): Promise<Warehouse> => {
    await delay(400);
    const newWarehouse: Warehouse = {
      ...data,
      id: generateId(),
      code: `WH${String(mockWarehouses.length + 1).padStart(3, '0')}`,
      totalProducts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockWarehouses.push(newWarehouse);
    return newWarehouse;
  },

  update: async (id: string, data: Partial<WarehouseFormData>): Promise<Warehouse> => {
    await delay(300);
    const index = mockWarehouses.findIndex(w => w.id === id);
    if (index !== -1) {
      mockWarehouses[index] = {
        ...mockWarehouses[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockWarehouses[index];
    }
    throw new Error('Warehouse not found');
  },

  delete: async (id: string): Promise<void> => {
    await delay(200);
    const index = mockWarehouses.findIndex(w => w.id === id);
    if (index !== -1) {
      mockWarehouses.splice(index, 1);
    } else {
      throw new Error('Warehouse not found');
    }
  },
};

// Sales API
export const salesApi = {
  getAll: async (params?: { search?: string }): Promise<Sales[]> => {
    await delay(200);
    let data = [...mockSales];
    
    if (params?.search) {
      const search = params.search.toLowerCase();
      data = data.filter(s => 
        s.name.toLowerCase().includes(search) || 
        s.id.toLowerCase().includes(search)
      );
    }
    
    return data;
  },

  getById: async (id: string): Promise<Sales | null> => {
    await delay(150);
    return mockSales.find(s => s.id === id) || null;
  },

  create: async (data: SalesFormData): Promise<Sales> => {
    await delay(400);
    const newSales: Sales = {
      ...data,
      id: generateId(),
      code: `SLS${String(mockSales.length + 1).padStart(3, '0')}`,
      totalSales: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSales.push(newSales);
    return newSales;
  },

  update: async (id: string, data: Partial<SalesFormData>): Promise<Sales> => {
    await delay(300);
    const index = mockSales.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSales[index] = {
        ...mockSales[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockSales[index];
    }
    throw new Error('Sales not found');
  },

  delete: async (id: string): Promise<void> => {
    await delay(200);
    const index = mockSales.findIndex(s => s.id === id);
    if (index !== -1) {
      mockSales.splice(index, 1);
    } else {
      throw new Error('Sales not found');
    }
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (params?: {
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Transaction[]> => {
    await delay(300);
    let data = [...mockTransactions];
    
    if (params?.type && params.type !== 'all') {
      data = data.filter(t => t.type === params.type);
    }
    
    return data;
  },

  getById: async (id: string): Promise<Transaction | null> => {
    await delay(200);
    return mockTransactions.find(t => t.id === id) || null;
  },

  create: async (data: TransactionFormData): Promise<Transaction> => {
    await delay(600);
    const newTransaction: Transaction = {
      ...data,
      id: generateId(),
      invoiceNumber: data.invoiceNumber || generateInvoiceNumber(data.type),
      items: data.items.map(item => ({
        ...item,
        id: generateId(),
        subtotal: item.quantity * item.price * (1 - item.discount / 100),
      })),
      subtotal: data.items.reduce((sum, item) => 
        sum + (item.quantity * item.price * (1 - item.discount / 100)), 0),
      total: 0,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newTransaction.total = newTransaction.subtotal - data.discount + data.tax;
    mockTransactions.unshift(newTransaction);
    return newTransaction;
  },

  update: async (id: string, data: Partial<TransactionFormData>): Promise<Transaction> => {
    await delay(400);
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTransactions[index] = {
        ...mockTransactions[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return mockTransactions[index];
    }
    throw new Error('Transaction not found');
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index !== -1) {
      mockTransactions.splice(index, 1);
    } else {
      throw new Error('Transaction not found');
    }
  },
};

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    await delay(250);
    return {
      totalSalesToday: 12450000,
      salesGrowth: 12.5,
      totalPurchasesToday: 8200000,
      purchasesGrowth: 5.2,
      totalProducts: mockProducts.length,
      stockChange: -2.1,
      activeCustomers: mockCustomers.length,
      customersGrowth: 8.3,
    };
  },

  getRecentTransactions: async (limit: number = 5): Promise<RecentTransaction[]> => {
    await delay(200);
    return mockTransactions.slice(0, limit).map(t => ({
      id: t.id,
      invoiceNumber: t.invoiceNumber,
      customer: t.customerName || t.supplierName || '-',
      type: t.type,
      amount: t.total,
      status: t.status,
      date: t.createdAt,
    }));
  },

  getLowStock: async (): Promise<LowStockItem[]> => {
    await delay(200);
    return mockProducts
      .filter(p => p.stock <= p.minStock)
      .map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
      }));
  },
};

// Reports API
export const reportsApi = {
  getDailyReport: async (date: string): Promise<DailyReport> => {
    await delay(300);
    return {
      date,
      totalSales: 15000000,
      totalPurchases: 8000000,
      totalReceipts: 17000000,
      totalTransactions: 15,
      transactions: mockTransactions,
    };
  },

  getStockReport: async (): Promise<StockReportItem[]> => {
    await delay(250);
    return mockProducts.map(p => ({
      productId: p.id,
      productName: p.name,
      category: p.category,
      stock: p.stock,
      minStock: p.minStock,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      stockValue: p.stock * p.buyPrice,
    }));
  },

  getBalanceReport: async (): Promise<BalanceReportItem[]> => {
    await delay(250);
    return [
      ...mockCustomers.filter(c => c.balance > 0).map(c => ({
        id: c.id,
        name: c.name,
        type: 'customer',
        balance: c.balance,
        transactions: c.totalTransactions,
      })),
      ...mockSuppliers.filter(s => s.balance > 0).map(s => ({
        id: s.id,
        name: s.name,
        type: 'supplier',
        balance: s.balance,
        transactions: s.totalTransactions,
      })),
    ];
  },
};
