import { pgTable, text, serial, integer, boolean, timestamp, real, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Müşteri tablosu
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  taxId: text("tax_id"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  notes: text("notes"),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true });
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// Tedarikçi tablosu
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  taxId: text("tax_id"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  notes: text("notes"),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Ürün/Stok tablosu
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku"),
  description: text("description"),
  purchasePrice: real("purchase_price"),
  sellingPrice: real("selling_price"),
  stockQuantity: integer("stock_quantity").default(0),
  unit: text("unit"),
  category: text("category"),
  alertThreshold: integer("alert_threshold").default(5),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Gelir tablosu
export const incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  customerId: integer("customer_id"),
  invoiceId: integer("invoice_id"),
  currency: text("currency").default("TRY"),
  paymentMethod: text("payment_method"),
  reference: text("reference"),
  notes: text("notes"),
});

export const insertIncomeSchema = createInsertSchema(incomes).omit({ id: true });
export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof incomes.$inferSelect;

// Gider tablosu
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  supplierId: integer("supplier_id"),
  invoiceId: integer("invoice_id"),
  currency: text("currency").default("TRY"),
  paymentMethod: text("payment_method"),
  reference: text("reference"),
  notes: text("notes"),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Fatura tablosu
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  customerId: integer("customer_id"),
  supplierId: integer("supplier_id"),
  totalAmount: real("total_amount").notNull(),
  taxAmount: real("tax_amount"),
  status: text("status").default("draft"), // draft, sent, paid, overdue, cancelled
  type: text("type").notNull(), // income, expense
  currency: text("currency").default("TRY"),
  notes: text("notes"),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Fatura detayları tablosu
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  productId: integer("product_id"),
  description: text("description").notNull(),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  taxRate: real("tax_rate"),
  totalPrice: real("total_price").notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true });
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Vergi tablosu
export const taxes = pgTable("taxes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  rate: real("rate").notNull(),
  type: text("type").notNull(), // KDV, ÖTV, etc.
  isActive: boolean("is_active").default(true),
});

export const insertTaxSchema = createInsertSchema(taxes).omit({ id: true });
export type InsertTax = z.infer<typeof insertTaxSchema>;
export type Tax = typeof taxes.$inferSelect;

// Ödeme planları tablosu
export const paymentSchedules = pgTable("payment_schedules", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  amount: real("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  isPaid: boolean("is_paid").default(false),
  paymentDate: timestamp("payment_date"),
  invoiceId: integer("invoice_id"),
  category: text("category"),
  currency: text("currency").default("TRY"),
  recurring: boolean("recurring").default(false),
  recurringPeriod: text("recurring_period"), // monthly, quarterly, yearly
  notes: text("notes"),
});

export const insertPaymentScheduleSchema = createInsertSchema(paymentSchedules).omit({ id: true });
export type InsertPaymentSchedule = z.infer<typeof insertPaymentScheduleSchema>;
export type PaymentSchedule = typeof paymentSchedules.$inferSelect;

// Kullanıcılar tablosu
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role").default("user"), // admin, user, accountant
  isActive: boolean("is_active").default(true),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Banka hesapları tablosu
export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  accountNumber: text("account_number"),
  bankName: text("bank_name"),
  branchCode: text("branch_code"),
  iban: text("iban"),
  currency: text("currency").default("TRY"),
  currentBalance: real("current_balance").default(0),
  notes: text("notes"),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({ id: true });
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;
export type BankAccount = typeof bankAccounts.$inferSelect;

// Sistem ayarları tablosu
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  companyName: text("company_name"),
  taxId: text("tax_id"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo"),
  defaultCurrency: text("default_currency").default("TRY"),
  fiscalYear: text("fiscal_year"),
  invoicePrefix: text("invoice_prefix").default("INV"),
  expensePrefix: text("expense_prefix").default("EXP"),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Ödeme yöntemleri tablosu
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  processingFeePercentage: real("processing_fee_percentage").default(0),
  defaultForInvoices: boolean("default_for_invoices").default(false),
  requiresVerification: boolean("requires_verification").default(false),
  integrationSettings: text("integration_settings")
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true });
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

// Ödeme planları tablosu
export const paymentPlans = pgTable("payment_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  numberOfInstallments: integer("number_of_installments").notNull(),
  intervalDays: integer("interval_days").notNull(), // Taksitler arası gün sayısı
  processingFeePercentage: real("processing_fee_percentage").default(0),
  isActive: boolean("is_active").default(true)
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({ id: true });
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;

// Ödemeler tablosu
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id),
  amount: real("amount").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  paymentMethodId: integer("payment_method_id").references(() => paymentMethods.id),
  reference: text("reference"), // Ödeme referans numarası
  notes: text("notes"),
  status: text("status").default("completed"), // completed, pending, failed
  paymentPlanId: integer("payment_plan_id").references(() => paymentPlans.id),
  installmentNumber: integer("installment_number"), // Taksit numarası
  transactionId: text("transaction_id") // Dış sistemlerden gelen işlem ID'si
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
