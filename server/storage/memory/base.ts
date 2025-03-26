import {
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
  type User, type InsertUser,
  type Settings, type InsertSettings,
  type PaymentMethod, type InsertPaymentMethod,
  type PaymentPlan, type InsertPaymentPlan,
  type Payment, type InsertPayment
} from "@shared/schema";

import { IStorage } from "../interface";

export class MemStorage implements IStorage {
  protected users: Map<number, User>;
  protected customers: Map<number, Customer>;
  protected suppliers: Map<number, Supplier>;
  protected products: Map<number, Product>;
  protected incomes: Map<number, Income>;
  protected expenses: Map<number, Expense>;
  protected invoices: Map<number, Invoice>;
  protected invoiceItems: Map<number, InvoiceItem>;
  protected taxes: Map<number, Tax>;
  protected paymentSchedules: Map<number, PaymentSchedule>;
  protected bankAccounts: Map<number, BankAccount>;
  protected settings: Settings | undefined;
  protected paymentMethods: Map<number, PaymentMethod>;
  protected paymentPlans: Map<number, PaymentPlan>;
  protected payments: Map<number, Payment>;
  
  protected nextIds: {
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
    this.paymentMethods = new Map();
    this.paymentPlans = new Map();
    this.payments = new Map();
    
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
      settings: 1,
      paymentMethod: 1,
      paymentPlan: 1,
      payment: 1
    };
    
    // Initialize with sample data
    this.initializeData();
  }

  protected initializeData() {
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
    
    // Sample payment methods
    this.createPaymentMethod({
      name: "Nakit",
      description: "Nakit ödeme",
      isActive: true,
      processingFeePercentage: 0,
      defaultForInvoices: false,
      requiresVerification: false,
      integrationSettings: null
    });
    
    this.createPaymentMethod({
      name: "Banka Havalesi",
      description: "Banka havalesi ile ödeme",
      isActive: true,
      processingFeePercentage: 0,
      defaultForInvoices: true,
      requiresVerification: true,
      integrationSettings: null
    });
    
    this.createPaymentMethod({
      name: "Kredi Kartı",
      description: "Kredi kartı ile ödeme",
      isActive: true,
      processingFeePercentage: 1.5,
      defaultForInvoices: false,
      requiresVerification: true,
      integrationSettings: null
    });
    
    // Sample payment plans
    this.createPaymentPlan({
      name: "Tek Çekim",
      description: "Tek seferde ödeme",
      numberOfInstallments: 1,
      intervalDays: 0,
      processingFeePercentage: 0,
      isActive: true
    });
    
    this.createPaymentPlan({
      name: "3 Taksit",
      description: "3 ay taksitli ödeme",
      numberOfInstallments: 3,
      intervalDays: 30,
      processingFeePercentage: 2,
      isActive: true
    });
    
    this.createPaymentPlan({
      name: "6 Taksit",
      description: "6 ay taksitli ödeme",
      numberOfInstallments: 6,
      intervalDays: 30,
      processingFeePercentage: 4,
      isActive: true
    });
    
    // Sample payments
    this.createPayment({
      invoiceId: 1,
      amount: 4500,
      paymentDate: new Date("2023-05-10"),
      paymentMethodId: 2,
      reference: "ODM-2023-001",
      notes: "Fatura tam ödemesi",
      status: "completed",
      paymentPlanId: 1,
      installmentNumber: 1,
      transactionId: null
    });
    
    this.createPayment({
      invoiceId: 3,
      amount: 1850,
      paymentDate: new Date("2023-05-02"),
      paymentMethodId: 3,
      reference: "ODM-2023-002",
      notes: "Fatura tam ödemesi",
      status: "completed",
      paymentPlanId: 1,
      installmentNumber: 1,
      transactionId: null
    });
  }

  // The implementations of all required interface methods will be 
  // in the respective module files.
  // Placeholder methods to satisfy TypeScript
  async getUser(id: number): Promise<User | undefined> { return undefined; }
  async getUserByUsername(username: string): Promise<User | undefined> { return undefined; }
  async createUser(user: InsertUser): Promise<User> { throw new Error("Not implemented"); }
  
  async getCustomers(): Promise<Customer[]> { return []; }
  async getCustomer(id: number): Promise<Customer | undefined> { return undefined; }
  async createCustomer(customer: InsertCustomer): Promise<Customer> { throw new Error("Not implemented"); }
  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> { return undefined; }
  async deleteCustomer(id: number): Promise<boolean> { return false; }

  async getSuppliers(): Promise<Supplier[]> { return []; }
  async getSupplier(id: number): Promise<Supplier | undefined> { return undefined; }
  async createSupplier(supplier: InsertSupplier): Promise<Supplier> { throw new Error("Not implemented"); }
  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> { return undefined; }
  async deleteSupplier(id: number): Promise<boolean> { return false; }

  async getProducts(): Promise<Product[]> { return []; }
  async getProduct(id: number): Promise<Product | undefined> { return undefined; }
  async createProduct(product: InsertProduct): Promise<Product> { throw new Error("Not implemented"); }
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> { return undefined; }
  async deleteProduct(id: number): Promise<boolean> { return false; }
  async getLowStockProducts(threshold?: number): Promise<Product[]> { return []; }

  async getIncomes(): Promise<Income[]> { return []; }
  async getIncome(id: number): Promise<Income | undefined> { return undefined; }
  async createIncome(income: InsertIncome): Promise<Income> { throw new Error("Not implemented"); }
  async updateIncome(id: number, income: Partial<InsertIncome>): Promise<Income | undefined> { return undefined; }
  async deleteIncome(id: number): Promise<boolean> { return false; }
  async getIncomesByPeriod(startDate: Date, endDate: Date): Promise<Income[]> { return []; }

  async getExpenses(): Promise<Expense[]> { return []; }
  async getExpense(id: number): Promise<Expense | undefined> { return undefined; }
  async createExpense(expense: InsertExpense): Promise<Expense> { throw new Error("Not implemented"); }
  async updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined> { return undefined; }
  async deleteExpense(id: number): Promise<boolean> { return false; }
  async getExpensesByPeriod(startDate: Date, endDate: Date): Promise<Expense[]> { return []; }

  async getInvoices(): Promise<Invoice[]> { return []; }
  async getInvoice(id: number): Promise<Invoice | undefined> { return undefined; }
  async getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]} | undefined> { return undefined; }
  async createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> { throw new Error("Not implemented"); }
  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> { return undefined; }
  async deleteInvoice(id: number): Promise<boolean> { return false; }
  async getRecentInvoices(limit: number): Promise<Invoice[]> { return []; }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> { return []; }
  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> { throw new Error("Not implemented"); }
  async updateInvoiceItem(id: number, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> { return undefined; }
  async deleteInvoiceItem(id: number): Promise<boolean> { return false; }

  async getTaxes(): Promise<Tax[]> { return []; }
  async getTax(id: number): Promise<Tax | undefined> { return undefined; }
  async createTax(tax: InsertTax): Promise<Tax> { throw new Error("Not implemented"); }
  async updateTax(id: number, tax: Partial<InsertTax>): Promise<Tax | undefined> { return undefined; }
  async deleteTax(id: number): Promise<boolean> { return false; }

  async getPaymentSchedules(): Promise<PaymentSchedule[]> { return []; }
  async getPaymentSchedule(id: number): Promise<PaymentSchedule | undefined> { return undefined; }
  async createPaymentSchedule(schedule: InsertPaymentSchedule): Promise<PaymentSchedule> { throw new Error("Not implemented"); }
  async updatePaymentSchedule(id: number, schedule: Partial<InsertPaymentSchedule>): Promise<PaymentSchedule | undefined> { return undefined; }
  async deletePaymentSchedule(id: number): Promise<boolean> { return false; }
  async getUpcomingPayments(limit: number): Promise<PaymentSchedule[]> { return []; }
  
  async getBankAccounts(): Promise<BankAccount[]> { return []; }
  async getBankAccount(id: number): Promise<BankAccount | undefined> { return undefined; }
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> { throw new Error("Not implemented"); }
  async updateBankAccount(id: number, account: Partial<InsertBankAccount>): Promise<BankAccount | undefined> { return undefined; }
  async deleteBankAccount(id: number): Promise<boolean> { return false; }

  async getSettings(): Promise<Settings | undefined> { return undefined; }
  async updateSettings(settings: Partial<InsertSettings>): Promise<Settings | undefined> { return undefined; }
  
  async getPaymentMethods(): Promise<PaymentMethod[]> { return []; }
  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> { return undefined; }
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> { throw new Error("Not implemented"); }
  async updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> { return undefined; }
  async deletePaymentMethod(id: number): Promise<boolean> { return false; }
  
  async getPaymentPlans(): Promise<PaymentPlan[]> { return []; }
  async getPaymentPlan(id: number): Promise<PaymentPlan | undefined> { return undefined; }
  async createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan> { throw new Error("Not implemented"); }
  async updatePaymentPlan(id: number, plan: Partial<InsertPaymentPlan>): Promise<PaymentPlan | undefined> { return undefined; }
  async deletePaymentPlan(id: number): Promise<boolean> { return false; }
  
  async getPayments(): Promise<Payment[]> { return []; }
  async getInvoicePayments(invoiceId: number): Promise<Payment[]> { return []; }
  async getPayment(id: number): Promise<Payment | undefined> { return undefined; }
  async createPayment(payment: InsertPayment): Promise<Payment> { throw new Error("Not implemented"); }
  async updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined> { return undefined; }
  async deletePayment(id: number): Promise<boolean> { return false; }
  async createInstallmentPayments(invoiceId: number, paymentPlanId: number, initialAmount: number): Promise<Payment[]> { return []; }
  
  async getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    pendingInvoices: number;
    pendingPayments: number;
  }> { 
    return {
      totalIncome: 0,
      totalExpense: 0,
      netIncome: 0,
      pendingInvoices: 0,
      pendingPayments: 0
    }; 
  }
  
  async getRecentTransactions(limit: number): Promise<(Income | Expense)[]> { return []; }
}