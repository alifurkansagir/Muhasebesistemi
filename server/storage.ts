import {
  type User, type InsertUser,
  type Customer, type InsertCustomer,
  type Supplier, type InsertSupplier,
  type Product, type InsertProduct,
  type Income, type InsertIncome,
  type Expense, type InsertExpense,
  type Invoice, type InsertInvoice,
  type InvoiceItem, type InsertInvoiceItem,
  type Tax, type InsertTax,
  type PaymentSchedule, type InsertPaymentSchedule,
  type BankAccount, type InsertBankAccount,
  type Settings, type InsertSettings
} from "@shared/schema";

// Define the storage interface with all required CRUD methods
export interface IStorage {
  // User Management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer Management
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<boolean>;

  // Supplier Management
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;

  // Product/Inventory Management
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getLowStockProducts(threshold?: number): Promise<Product[]>;

  // Income Management
  getIncomes(): Promise<Income[]>;
  getIncome(id: number): Promise<Income | undefined>;
  createIncome(income: InsertIncome): Promise<Income>;
  updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined>;
  deleteIncome(id: number): Promise<boolean>;
  getIncomesByPeriod(startDate: Date, endDate: Date): Promise<Income[]>;

  // Expense Management
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  getExpensesByPeriod(startDate: Date, endDate: Date): Promise<Expense[]>;

  // Invoice Management
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]} | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  getRecentInvoices(limit: number): Promise<Invoice[]>;

  // Invoice Items Management
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;

  // Tax Management
  getTaxes(): Promise<Tax[]>;
  getTax(id: number): Promise<Tax | undefined>;
  createTax(tax: InsertTax): Promise<Tax>;
  updateTax(id: number, tax: Partial<InsertTax>): Promise<Tax | undefined>;
  deleteTax(id: number): Promise<boolean>;

  // Payment Schedules
  getPaymentSchedules(): Promise<PaymentSchedule[]>;
  getPaymentSchedule(id: number): Promise<PaymentSchedule | undefined>;
  createPaymentSchedule(schedule: InsertPaymentSchedule): Promise<PaymentSchedule>;
  updatePaymentSchedule(id: number, schedule: Partial<InsertPaymentSchedule>): Promise<PaymentSchedule | undefined>;
  deletePaymentSchedule(id: number): Promise<boolean>;
  getUpcomingPayments(limit: number): Promise<PaymentSchedule[]>;
  
  // Bank Account Management
  getBankAccounts(): Promise<BankAccount[]>;
  getBankAccount(id: number): Promise<BankAccount | undefined>;
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined>;
  deleteBankAccount(id: number): Promise<boolean>;

  // Settings Management
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings | undefined>;
  
  // Payment Methods Management
  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;
  
  // Payment Plans Management
  getPaymentPlans(): Promise<PaymentPlan[]>;
  getPaymentPlan(id: number): Promise<PaymentPlan | undefined>;
  createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan>;
  updatePaymentPlan(id: number, plan: Partial<InsertPaymentPlan>): Promise<PaymentPlan | undefined>;
  deletePaymentPlan(id: number): Promise<boolean>;
  
  // Payments Management
  getPayments(): Promise<Payment[]>;
  getInvoicePayments(invoiceId: number): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: number): Promise<boolean>;
  createInstallmentPayments(invoiceId: number, paymentPlanId: number, initialAmount: number): Promise<Payment[]>;
  
  // Reporting
  getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    pendingInvoices: number;
    pendingPayments: number;
  }>;
  getRecentTransactions(limit: number): Promise<(Income | Expense)[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private customers: Map<number, Customer>;
  private suppliers: Map<number, Supplier>;
  private products: Map<number, Product>;
  private incomes: Map<number, Income>;
  private expenses: Map<number, Expense>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private taxes: Map<number, Tax>;
  private paymentSchedules: Map<number, PaymentSchedule>;
  private bankAccounts: Map<number, BankAccount>;
  private settings: Settings | undefined;
  
  private nextIds: {
    user: number;
    customer: number;
    supplier: number;
    product: number;
    income: number;
    expense: number;
    invoice: number;
    invoiceItem: number;
    tax: number;
    paymentSchedule: number;
    bankAccount: number;
    settings: number;
    paymentMethod: number;
    paymentPlan: number;
    payment: number;
  };

  constructor() {
    this.users = new Map();
    this.customers = new Map();
    this.suppliers = new Map();
    this.products = new Map();
    this.incomes = new Map();
    this.expenses = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.taxes = new Map();
    this.paymentSchedules = new Map();
    this.bankAccounts = new Map();
    
    this.nextIds = {
      user: 1,
      customer: 1,
      supplier: 1,
      product: 1,
      income: 1,
      expense: 1,
      invoice: 1,
      invoiceItem: 1,
      tax: 1,
      paymentSchedule: 1,
      bankAccount: 1,
      settings: 1
    };
    
    // Initialize with sample data
    this.initializeData();
  }

  private initializeData() {
    // Create default admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      name: "Sistem Yöneticisi",
      email: "admin@muhaseb.com",
      role: "admin",
      isActive: true
    });
    
    // Sample settings
    this.settings = {
      id: this.nextIds.settings++,
      companyName: "Şirket Adı",
      taxId: "1234567890",
      address: "İstanbul, Türkiye",
      phone: "+90 (212) 123 4567",
      email: "info@sirket.com",
      logo: "", // Logo yolu
      defaultCurrency: "TRY",
      fiscalYear: "01-01", // Fiscal year start MM-DD
      invoicePrefix: "INV",
      expensePrefix: "EXP"
    };
    
    // Sample taxes
    this.createTax({
      name: "KDV-18",
      description: "Katma Değer Vergisi %18",
      rate: 18,
      type: "KDV",
      isActive: true
    });
    
    this.createTax({
      name: "KDV-8",
      description: "Katma Değer Vergisi %8",
      rate: 8,
      type: "KDV",
      isActive: true
    });
    
    // Sample bank account
    this.createBankAccount({
      name: "Ana İş Hesabı",
      accountNumber: "123456789",
      bankName: "ABC Bank",
      branchCode: "001",
      iban: "TR123456789012345678901234",
      currency: "TRY",
      currentBalance: 25000,
      notes: "Ana işletme hesabı"
    });
    
    // Sample products
    this.createProduct({
      name: "Yazıcı Kartuşu",
      sku: "PRD-001",
      description: "HP Yazıcı Kartuşu",
      purchasePrice: 180,
      sellingPrice: 220,
      stockQuantity: 2,
      unit: "Adet",
      category: "Ofis Malzemeleri",
      alertThreshold: 3
    });
    
    this.createProduct({
      name: "A4 Kağıt",
      sku: "PRD-002",
      description: "A4 Kağıt Paketi (500 sayfa)",
      purchasePrice: 60,
      sellingPrice: 75,
      stockQuantity: 1,
      unit: "Paket",
      category: "Ofis Malzemeleri",
      alertThreshold: 3
    });
    
    this.createProduct({
      name: "USB Bellek",
      sku: "PRD-003",
      description: "32GB USB Bellek",
      purchasePrice: 120,
      sellingPrice: 150,
      stockQuantity: 5,
      unit: "Adet",
      category: "Elektronik",
      alertThreshold: 5
    });
    
    // Sample customers
    this.createCustomer({
      name: "ABC Teknoloji Ltd. Şti.",
      taxId: "9876543210",
      phone: "+90 (212) 987 6543",
      email: "info@abcteknoloji.com",
      address: "İstanbul, Türkiye",
      city: "İstanbul",
      notes: "Teknoloji şirketi müşterisi"
    });
    
    this.createCustomer({
      name: "XYZ Market A.Ş.",
      taxId: "1357924680",
      phone: "+90 (216) 123 4567",
      email: "info@xyzmarket.com",
      address: "Ankara, Türkiye",
      city: "Ankara",
      notes: "Market zinciri müşterisi"
    });
    
    // Sample suppliers
    this.createSupplier({
      name: "Ofis Dünyası Ltd. Şti.",
      taxId: "2468013579",
      phone: "+90 (312) 987 6543",
      email: "info@ofisdunyasi.com",
      address: "İzmir, Türkiye",
      city: "İzmir",
      notes: "Ofis malzemeleri tedarikçisi"
    });
    
    this.createSupplier({
      name: "Tekno Bilişim A.Ş.",
      taxId: "1324354657",
      phone: "+90 (232) 123 4567",
      email: "info@teknobilisim.com",
      address: "Bursa, Türkiye",
      city: "Bursa",
      notes: "Bilişim ürünleri tedarikçisi"
    });
    
    // Sample invoices
    const invoice1 = this.createInvoice({
      invoiceNumber: "INV-2023-1584",
      date: new Date("2023-05-10"),
      dueDate: new Date("2023-06-10"),
      customerId: 1,
      supplierId: null,
      totalAmount: 4500,
      taxAmount: 810,
      status: "paid",
      type: "income",
      currency: "TRY",
      notes: "Yazılım Danışmanlık"
    }, []);
    
    const invoice2 = this.createInvoice({
      invoiceNumber: "INV-2023-1583",
      date: new Date("2023-05-07"),
      dueDate: new Date("2023-06-07"),
      customerId: 2,
      supplierId: null,
      totalAmount: 3200,
      taxAmount: 576,
      status: "pending",
      type: "income",
      currency: "TRY",
      notes: "E-ticaret Entegrasyonu"
    }, []);
    
    const invoice3 = this.createInvoice({
      invoiceNumber: "INV-2023-1582",
      date: new Date("2023-05-02"),
      dueDate: new Date("2023-06-02"),
      customerId: 1,
      supplierId: null,
      totalAmount: 1850,
      taxAmount: 333,
      status: "paid",
      type: "income",
      currency: "TRY",
      notes: "Web Tasarım"
    }, []);
    
    // Sample expenses
    this.createExpense({
      date: new Date("2023-05-08"),
      amount: 750,
      description: "Ofis Malzemeleri",
      category: "Malzeme",
      supplierId: 1,
      invoiceId: null,
      currency: "TRY",
      paymentMethod: "Banka Havalesi",
      reference: "EXP-2023-0285",
      notes: "Ofis için kırtasiye malzemeleri"
    });
    
    this.createExpense({
      date: new Date("2023-05-05"),
      amount: 349,
      description: "İnternet Faturası",
      category: "Fatura",
      supplierId: null,
      invoiceId: null,
      currency: "TRY",
      paymentMethod: "Otomatik Ödeme",
      reference: "EXP-2023-0284",
      notes: "Mayıs ayı internet faturası"
    });
    
    this.createExpense({
      date: new Date("2023-05-03"),
      amount: 12500,
      description: "Personel Maaşları",
      category: "Maaş",
      supplierId: null,
      invoiceId: null,
      currency: "TRY",
      paymentMethod: "Banka Havalesi",
      reference: "EXP-2023-0283",
      notes: "Mayıs ayı personel maaşları"
    });
    
    // Sample incomes
    this.createIncome({
      date: new Date("2023-05-10"),
      amount: 4500,
      description: "Yazılım Danışmanlık",
      category: "Hizmet",
      customerId: 1,
      invoiceId: 1,
      currency: "TRY",
      paymentMethod: "Banka Havalesi",
      reference: "INC-2023-0412",
      notes: "ABC Teknoloji Ltd. için danışmanlık"
    });
    
    this.createIncome({
      date: new Date("2023-05-02"),
      amount: 1850,
      description: "Web Tasarım",
      category: "Hizmet",
      customerId: 1,
      invoiceId: 3,
      currency: "TRY",
      paymentMethod: "Kredi Kartı",
      reference: "INC-2023-0411",
      notes: "ABC Teknoloji Ltd. için web tasarım"
    });
    
    // Sample payment schedules
    this.createPaymentSchedule({
      description: "Kira Ödemesi",
      amount: 3750,
      dueDate: new Date("2023-05-15"),
      isPaid: false,
      paymentDate: null,
      invoiceId: null,
      category: "Kira",
      currency: "TRY",
      recurring: true,
      recurringPeriod: "monthly",
      notes: "Ofis kirası aylık ödeme"
    });
    
    this.createPaymentSchedule({
      description: "Elektrik Faturası",
      amount: 680.50,
      dueDate: new Date("2023-05-20"),
      isPaid: false,
      paymentDate: null,
      invoiceId: null,
      category: "Fatura",
      currency: "TRY",
      recurring: true,
      recurringPeriod: "monthly",
      notes: "Mayıs ayı elektrik faturası"
    });
    
    this.createPaymentSchedule({
      description: "Telefon Aboneliği",
      amount: 249,
      dueDate: new Date("2023-05-25"),
      isPaid: false,
      paymentDate: null,
      invoiceId: null,
      category: "Fatura",
      currency: "TRY",
      recurring: true,
      recurringPeriod: "monthly",
      notes: "Mayıs ayı telefon faturası"
    });
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.nextIds.user++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Customer Management
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values());
  }
  
  async getCustomer(id: number): Promise<Customer | undefined> {
    return this.customers.get(id);
  }
  
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = this.nextIds.customer++;
    const newCustomer: Customer = { ...customer, id };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }
  
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const existingCustomer = this.customers.get(id);
    if (!existingCustomer) return undefined;
    
    const updatedCustomer = { ...existingCustomer, ...customer };
    this.customers.set(id, updatedCustomer);
    return updatedCustomer;
  }
  
  async deleteCustomer(id: number): Promise<boolean> {
    return this.customers.delete(id);
  }
  
  // Supplier Management
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }
  
  async getSupplier(id: number): Promise<Supplier | undefined> {
    return this.suppliers.get(id);
  }
  
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const id = this.nextIds.supplier++;
    const newSupplier: Supplier = { ...supplier, id };
    this.suppliers.set(id, newSupplier);
    return newSupplier;
  }
  
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const existingSupplier = this.suppliers.get(id);
    if (!existingSupplier) return undefined;
    
    const updatedSupplier = { ...existingSupplier, ...supplier };
    this.suppliers.set(id, updatedSupplier);
    return updatedSupplier;
  }
  
  async deleteSupplier(id: number): Promise<boolean> {
    return this.suppliers.delete(id);
  }
  
  // Product/Inventory Management
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.nextIds.product++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  async getLowStockProducts(threshold?: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.stockQuantity <= (threshold ?? product.alertThreshold)
    );
  }
  
  // Income Management
  async getIncomes(): Promise<Income[]> {
    return Array.from(this.incomes.values());
  }
  
  async getIncome(id: number): Promise<Income | undefined> {
    return this.incomes.get(id);
  }
  
  async createIncome(income: InsertIncome): Promise<Income> {
    const id = this.nextIds.income++;
    const newIncome: Income = { ...income, id };
    this.incomes.set(id, newIncome);
    return newIncome;
  }
  
  async updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined> {
    const existingIncome = this.incomes.get(id);
    if (!existingIncome) return undefined;
    
    const updatedIncome = { ...existingIncome, ...income };
    this.incomes.set(id, updatedIncome);
    return updatedIncome;
  }
  
  async deleteIncome(id: number): Promise<boolean> {
    return this.incomes.delete(id);
  }
  
  async getIncomesByPeriod(startDate: Date, endDate: Date): Promise<Income[]> {
    return Array.from(this.incomes.values()).filter(
      income => {
        const incomeDate = new Date(income.date);
        return incomeDate >= startDate && incomeDate <= endDate;
      }
    );
  }
  
  // Expense Management
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values());
  }
  
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }
  
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.nextIds.expense++;
    const newExpense: Expense = { ...expense, id };
    this.expenses.set(id, newExpense);
    return newExpense;
  }
  
  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existingExpense = this.expenses.get(id);
    if (!existingExpense) return undefined;
    
    const updatedExpense = { ...existingExpense, ...expense };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  async getExpensesByPeriod(startDate: Date, endDate: Date): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      }
    );
  }
  
  // Invoice Management
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }
  
  async getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]} | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;
    
    const items = Array.from(this.invoiceItems.values()).filter(
      item => item.invoiceId === id
    );
    
    return { invoice, items };
  }
  
  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    const id = this.nextIds.invoice++;
    const newInvoice: Invoice = { ...invoice, id };
    this.invoices.set(id, newInvoice);
    
    // Create invoice items with the new invoice ID
    for (const item of items) {
      await this.createInvoiceItem({ ...item, invoiceId: id });
    }
    
    return newInvoice;
  }
  
  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice = { ...existingInvoice, ...invoice };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    // Delete associated invoice items
    const invoiceItems = Array.from(this.invoiceItems.values()).filter(
      item => item.invoiceId === id
    );
    
    for (const item of invoiceItems) {
      this.invoiceItems.delete(item.id);
    }
    
    return this.invoices.delete(id);
  }
  
  async getRecentInvoices(limit: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
  
  // Invoice Items Management
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(
      item => item.invoiceId === invoiceId
    );
  }
  
  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.nextIds.invoiceItem++;
    const newItem: InvoiceItem = { ...item, id };
    this.invoiceItems.set(id, newItem);
    return newItem;
  }
  
  async updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const existingItem = this.invoiceItems.get(id);
    if (!existingItem) return undefined;
    
    const updatedItem = { ...existingItem, ...item };
    this.invoiceItems.set(id, updatedItem);
    return updatedItem;
  }
  
  async deleteInvoiceItem(id: number): Promise<boolean> {
    return this.invoiceItems.delete(id);
  }
  
  // Tax Management
  async getTaxes(): Promise<Tax[]> {
    return Array.from(this.taxes.values());
  }
  
  async getTax(id: number): Promise<Tax | undefined> {
    return this.taxes.get(id);
  }
  
  async createTax(tax: InsertTax): Promise<Tax> {
    const id = this.nextIds.tax++;
    const newTax: Tax = { ...tax, id };
    this.taxes.set(id, newTax);
    return newTax;
  }
  
  async updateTax(id: number, tax: Partial<InsertTax>): Promise<Tax | undefined> {
    const existingTax = this.taxes.get(id);
    if (!existingTax) return undefined;
    
    const updatedTax = { ...existingTax, ...tax };
    this.taxes.set(id, updatedTax);
    return updatedTax;
  }
  
  async deleteTax(id: number): Promise<boolean> {
    return this.taxes.delete(id);
  }
  
  // Payment Schedules
  async getPaymentSchedules(): Promise<PaymentSchedule[]> {
    return Array.from(this.paymentSchedules.values());
  }
  
  async getPaymentSchedule(id: number): Promise<PaymentSchedule | undefined> {
    return this.paymentSchedules.get(id);
  }
  
  async createPaymentSchedule(schedule: InsertPaymentSchedule): Promise<PaymentSchedule> {
    const id = this.nextIds.paymentSchedule++;
    const newSchedule: PaymentSchedule = { ...schedule, id };
    this.paymentSchedules.set(id, newSchedule);
    return newSchedule;
  }
  
  async updatePaymentSchedule(id: number, schedule: Partial<InsertPaymentSchedule>): Promise<PaymentSchedule | undefined> {
    const existingSchedule = this.paymentSchedules.get(id);
    if (!existingSchedule) return undefined;
    
    const updatedSchedule = { ...existingSchedule, ...schedule };
    this.paymentSchedules.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async deletePaymentSchedule(id: number): Promise<boolean> {
    return this.paymentSchedules.delete(id);
  }
  
  async getUpcomingPayments(limit: number): Promise<PaymentSchedule[]> {
    const now = new Date();
    
    return Array.from(this.paymentSchedules.values())
      .filter(schedule => !schedule.isPaid && new Date(schedule.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, limit);
  }
  
  // Bank Account Management
  async getBankAccounts(): Promise<BankAccount[]> {
    return Array.from(this.bankAccounts.values());
  }
  
  async getBankAccount(id: number): Promise<BankAccount | undefined> {
    return this.bankAccounts.get(id);
  }
  
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const id = this.nextIds.bankAccount++;
    const newAccount: BankAccount = { ...account, id };
    this.bankAccounts.set(id, newAccount);
    return newAccount;
  }
  
  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> {
    const existingAccount = this.bankAccounts.get(id);
    if (!existingAccount) return undefined;
    
    const updatedAccount = { ...existingAccount, ...account };
    this.bankAccounts.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteBankAccount(id: number): Promise<boolean> {
    return this.bankAccounts.delete(id);
  }
  
  // Settings Management
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }
  
  async updateSettings(settings: Partial<InsertSettings>): Promise<Settings | undefined> {
    if (!this.settings) {
      const id = this.nextIds.settings++;
      this.settings = { ...settings, id } as Settings;
    } else {
      this.settings = { ...this.settings, ...settings };
    }
    
    return this.settings;
  }
  
  // Reporting
  async getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    pendingInvoices: number;
    pendingPayments: number;
  }> {
    const incomes = await this.getIncomesByPeriod(startDate, endDate);
    const expenses = await this.getExpensesByPeriod(startDate, endDate);
    
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const pendingInvoices = Array.from(this.invoices.values())
      .filter(invoice => invoice.status === 'pending' || invoice.status === 'sent')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    const pendingPayments = Array.from(this.paymentSchedules.values())
      .filter(schedule => !schedule.isPaid && new Date(schedule.dueDate) >= startDate && new Date(schedule.dueDate) <= endDate)
      .reduce((sum, schedule) => sum + schedule.amount, 0);
    
    return {
      totalIncome,
      totalExpense,
      netIncome: totalIncome - totalExpense,
      pendingInvoices,
      pendingPayments
    };
  }
  
  async getRecentTransactions(limit: number): Promise<(Income | Expense)[]> {
    const incomes = Array.from(this.incomes.values()).map(income => ({
      ...income,
      type: 'income' as const
    }));
    
    const expenses = Array.from(this.expenses.values()).map(expense => ({
      ...expense,
      type: 'expense' as const
    }));
    
    return [...incomes, ...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
