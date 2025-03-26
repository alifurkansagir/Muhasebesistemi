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