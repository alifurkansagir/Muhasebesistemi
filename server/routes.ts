import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertSupplierSchema, insertProductSchema, 
  insertIncomeSchema, insertExpenseSchema, insertInvoiceSchema, insertInvoiceItemSchema,
  insertTaxSchema, insertPaymentScheduleSchema, insertBankAccountSchema, insertSettingsSchema, 
  insertUserSchema, insertPaymentMethodSchema, insertPaymentPlanSchema, insertPaymentSchema } from "@shared/schema";
import { z } from 'zod';
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  
  // Helper function to handle zod validation
  function validateRequest<T extends z.ZodTypeAny>(
    schema: T,
    req: Request,
    res: Response
  ): z.infer<T> | null {
    try {
      return schema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(400).json({ message: "Geçersiz istek verisi" });
      }
      return null;
    }
  }

  // Dashboard & Analytics
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);
      const endDate = new Date();
      
      const summary = await storage.getFinancialSummary(startDate, endDate);
      const recentTransactions = await storage.getRecentTransactions(5);
      const recentInvoices = await storage.getRecentInvoices(3);
      const upcomingPayments = await storage.getUpcomingPayments(3);
      const lowStockItems = await storage.getLowStockProducts();
      
      res.json({
        summary,
        recentTransactions,
        recentInvoices,
        upcomingPayments,
        lowStockItems
      });
    } catch (error) {
      res.status(500).json({ message: "Pano verileri alınamadı" });
    }
  });

  // Customers
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Müşteriler alınamadı" });
    }
  });
  
  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ message: "Müşteri bulunamadı" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Müşteri alınamadı" });
    }
  });
  
  app.post("/api/customers", async (req, res) => {
    const data = validateRequest(insertCustomerSchema, req, res);
    if (!data) return;
    
    try {
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ message: "Müşteri oluşturulamadı" });
    }
  });
  
  app.put("/api/customers/:id", async (req, res) => {
    const data = validateRequest(insertCustomerSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const customer = await storage.updateCustomer(parseInt(req.params.id), data);
      if (!customer) {
        return res.status(404).json({ message: "Müşteri bulunamadı" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Müşteri güncellenemedi" });
    }
  });
  
  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomer(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Müşteri bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Müşteri silinemedi" });
    }
  });

  // Suppliers
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Tedarikçiler alınamadı" });
    }
  });
  
  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(parseInt(req.params.id));
      if (!supplier) {
        return res.status(404).json({ message: "Tedarikçi bulunamadı" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Tedarikçi alınamadı" });
    }
  });
  
  app.post("/api/suppliers", async (req, res) => {
    const data = validateRequest(insertSupplierSchema, req, res);
    if (!data) return;
    
    try {
      const supplier = await storage.createSupplier(data);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Tedarikçi oluşturulamadı" });
    }
  });
  
  app.put("/api/suppliers/:id", async (req, res) => {
    const data = validateRequest(insertSupplierSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const supplier = await storage.updateSupplier(parseInt(req.params.id), data);
      if (!supplier) {
        return res.status(404).json({ message: "Tedarikçi bulunamadı" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Tedarikçi güncellenemedi" });
    }
  });
  
  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const success = await storage.deleteSupplier(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Tedarikçi bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Tedarikçi silinemedi" });
    }
  });

  // Products/Inventory
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Ürünler alınamadı" });
    }
  });
  
  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : undefined;
      const products = await storage.getLowStockProducts(threshold);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Düşük stok ürünleri alınamadı" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Ürün alınamadı" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    const data = validateRequest(insertProductSchema, req, res);
    if (!data) return;
    
    try {
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: "Ürün oluşturulamadı" });
    }
  });
  
  app.put("/api/products/:id", async (req, res) => {
    const data = validateRequest(insertProductSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), data);
      if (!product) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Ürün güncellenemedi" });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const success = await storage.deleteProduct(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Ürün bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Ürün silinemedi" });
    }
  });

  // Incomes
  app.get("/api/incomes", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      let incomes;
      if (startDate && endDate) {
        incomes = await storage.getIncomesByPeriod(startDate, endDate);
      } else {
        incomes = await storage.getIncomes();
      }
      
      res.json(incomes);
    } catch (error) {
      res.status(500).json({ message: "Gelirler alınamadı" });
    }
  });
  
  app.get("/api/incomes/:id", async (req, res) => {
    try {
      const income = await storage.getIncome(parseInt(req.params.id));
      if (!income) {
        return res.status(404).json({ message: "Gelir bulunamadı" });
      }
      res.json(income);
    } catch (error) {
      res.status(500).json({ message: "Gelir alınamadı" });
    }
  });
  
  app.post("/api/incomes", async (req, res) => {
    const data = validateRequest(insertIncomeSchema, req, res);
    if (!data) return;
    
    try {
      const income = await storage.createIncome(data);
      res.status(201).json(income);
    } catch (error) {
      res.status(500).json({ message: "Gelir oluşturulamadı" });
    }
  });
  
  app.put("/api/incomes/:id", async (req, res) => {
    const data = validateRequest(insertIncomeSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const income = await storage.updateIncome(parseInt(req.params.id), data);
      if (!income) {
        return res.status(404).json({ message: "Gelir bulunamadı" });
      }
      res.json(income);
    } catch (error) {
      res.status(500).json({ message: "Gelir güncellenemedi" });
    }
  });
  
  app.delete("/api/incomes/:id", async (req, res) => {
    try {
      const success = await storage.deleteIncome(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Gelir bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Gelir silinemedi" });
    }
  });

  // Expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      let expenses;
      if (startDate && endDate) {
        expenses = await storage.getExpensesByPeriod(startDate, endDate);
      } else {
        expenses = await storage.getExpenses();
      }
      
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Giderler alınamadı" });
    }
  });
  
  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpense(parseInt(req.params.id));
      if (!expense) {
        return res.status(404).json({ message: "Gider bulunamadı" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Gider alınamadı" });
    }
  });
  
  app.post("/api/expenses", async (req, res) => {
    const data = validateRequest(insertExpenseSchema, req, res);
    if (!data) return;
    
    try {
      const expense = await storage.createExpense(data);
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ message: "Gider oluşturulamadı" });
    }
  });
  
  app.put("/api/expenses/:id", async (req, res) => {
    const data = validateRequest(insertExpenseSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const expense = await storage.updateExpense(parseInt(req.params.id), data);
      if (!expense) {
        return res.status(404).json({ message: "Gider bulunamadı" });
      }
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Gider güncellenemedi" });
    }
  });
  
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const success = await storage.deleteExpense(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Gider bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Gider silinemedi" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Faturalar alınamadı" });
    }
  });
  
  app.get("/api/invoices/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const invoices = await storage.getRecentInvoices(limit);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Son faturalar alınamadı" });
    }
  });
  
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoiceWithItems(parseInt(req.params.id));
      if (!invoice) {
        return res.status(404).json({ message: "Fatura bulunamadı" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Fatura alınamadı" });
    }
  });
  
  app.post("/api/invoices", async (req, res) => {
    // Validate complex invoice object with items
    const invoiceSchema = z.object({
      invoice: insertInvoiceSchema,
      items: z.array(insertInvoiceItemSchema)
    });
    
    const data = validateRequest(invoiceSchema, req, res);
    if (!data) return;
    
    try {
      const invoice = await storage.createInvoice(data.invoice, data.items);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Fatura oluşturulamadı" });
    }
  });
  
  app.put("/api/invoices/:id", async (req, res) => {
    const data = validateRequest(insertInvoiceSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const invoice = await storage.updateInvoice(parseInt(req.params.id), data);
      if (!invoice) {
        return res.status(404).json({ message: "Fatura bulunamadı" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Fatura güncellenemedi" });
    }
  });
  
  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const success = await storage.deleteInvoice(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Fatura bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Fatura silinemedi" });
    }
  });

  // Invoice Items
  app.get("/api/invoice-items/:invoiceId", async (req, res) => {
    try {
      const items = await storage.getInvoiceItems(parseInt(req.params.invoiceId));
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Fatura kalemleri alınamadı" });
    }
  });
  
  app.post("/api/invoice-items", async (req, res) => {
    const data = validateRequest(insertInvoiceItemSchema, req, res);
    if (!data) return;
    
    try {
      const item = await storage.createInvoiceItem(data);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ message: "Fatura kalemi oluşturulamadı" });
    }
  });
  
  app.put("/api/invoice-items/:id", async (req, res) => {
    const data = validateRequest(insertInvoiceItemSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const item = await storage.updateInvoiceItem(parseInt(req.params.id), data);
      if (!item) {
        return res.status(404).json({ message: "Fatura kalemi bulunamadı" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Fatura kalemi güncellenemedi" });
    }
  });
  
  app.delete("/api/invoice-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteInvoiceItem(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Fatura kalemi bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Fatura kalemi silinemedi" });
    }
  });

  // Taxes
  app.get("/api/taxes", async (req, res) => {
    try {
      const taxes = await storage.getTaxes();
      res.json(taxes);
    } catch (error) {
      res.status(500).json({ message: "Vergiler alınamadı" });
    }
  });
  
  app.get("/api/taxes/:id", async (req, res) => {
    try {
      const tax = await storage.getTax(parseInt(req.params.id));
      if (!tax) {
        return res.status(404).json({ message: "Vergi bulunamadı" });
      }
      res.json(tax);
    } catch (error) {
      res.status(500).json({ message: "Vergi alınamadı" });
    }
  });
  
  app.post("/api/taxes", async (req, res) => {
    const data = validateRequest(insertTaxSchema, req, res);
    if (!data) return;
    
    try {
      const tax = await storage.createTax(data);
      res.status(201).json(tax);
    } catch (error) {
      res.status(500).json({ message: "Vergi oluşturulamadı" });
    }
  });
  
  app.put("/api/taxes/:id", async (req, res) => {
    const data = validateRequest(insertTaxSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const tax = await storage.updateTax(parseInt(req.params.id), data);
      if (!tax) {
        return res.status(404).json({ message: "Vergi bulunamadı" });
      }
      res.json(tax);
    } catch (error) {
      res.status(500).json({ message: "Vergi güncellenemedi" });
    }
  });
  
  app.delete("/api/taxes/:id", async (req, res) => {
    try {
      const success = await storage.deleteTax(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Vergi bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Vergi silinemedi" });
    }
  });

  // Payment Schedules
  app.get("/api/payment-schedules", async (req, res) => {
    try {
      const schedules = await storage.getPaymentSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Ödeme planları alınamadı" });
    }
  });
  
  app.get("/api/payment-schedules/upcoming", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const schedules = await storage.getUpcomingPayments(limit);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Yaklaşan ödemeler alınamadı" });
    }
  });
  
  app.get("/api/payment-schedules/:id", async (req, res) => {
    try {
      const schedule = await storage.getPaymentSchedule(parseInt(req.params.id));
      if (!schedule) {
        return res.status(404).json({ message: "Ödeme planı bulunamadı" });
      }
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Ödeme planı alınamadı" });
    }
  });
  
  app.post("/api/payment-schedules", async (req, res) => {
    try {
      // String olarak gelen dueDate'i Date objesine çevirelim
      if (req.body.dueDate && typeof req.body.dueDate === 'string') {
        req.body.dueDate = new Date(req.body.dueDate);
      }
      
      const data = validateRequest(insertPaymentScheduleSchema, req, res);
      if (!data) return;
      
      const schedule = await storage.createPaymentSchedule(data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Payment schedule creation error:", error);
      res.status(500).json({ message: "Ödeme planı oluşturulamadı" });
    }
  });
  
  app.put("/api/payment-schedules/:id", async (req, res) => {
    try {
      // String olarak gelen dueDate'i Date objesine çevirelim
      if (req.body.dueDate && typeof req.body.dueDate === 'string') {
        req.body.dueDate = new Date(req.body.dueDate);
      }
      
      const data = validateRequest(insertPaymentScheduleSchema.partial(), req, res);
      if (!data) return;
      
      const schedule = await storage.updatePaymentSchedule(parseInt(req.params.id), data);
      if (!schedule) {
        return res.status(404).json({ message: "Ödeme planı bulunamadı" });
      }
      res.json(schedule);
    } catch (error) {
      console.error("Payment schedule update error:", error);
      res.status(500).json({ message: "Ödeme planı güncellenemedi" });
    }
  });
  
  app.delete("/api/payment-schedules/:id", async (req, res) => {
    try {
      const success = await storage.deletePaymentSchedule(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Ödeme planı bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Ödeme planı silinemedi" });
    }
  });

  // Bank Accounts
  app.get("/api/bank-accounts", async (req, res) => {
    try {
      const accounts = await storage.getBankAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Banka hesapları alınamadı" });
    }
  });
  
  app.get("/api/bank-accounts/:id", async (req, res) => {
    try {
      const account = await storage.getBankAccount(parseInt(req.params.id));
      if (!account) {
        return res.status(404).json({ message: "Banka hesabı bulunamadı" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Banka hesabı alınamadı" });
    }
  });
  
  app.post("/api/bank-accounts", async (req, res) => {
    const data = validateRequest(insertBankAccountSchema, req, res);
    if (!data) return;
    
    try {
      const account = await storage.createBankAccount(data);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ message: "Banka hesabı oluşturulamadı" });
    }
  });
  
  app.put("/api/bank-accounts/:id", async (req, res) => {
    const data = validateRequest(insertBankAccountSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const account = await storage.updateBankAccount(parseInt(req.params.id), data);
      if (!account) {
        return res.status(404).json({ message: "Banka hesabı bulunamadı" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Banka hesabı güncellenemedi" });
    }
  });
  
  app.delete("/api/bank-accounts/:id", async (req, res) => {
    try {
      const success = await storage.deleteBankAccount(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Banka hesabı bulunamadı" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Banka hesabı silinemedi" });
    }
  });

  // Settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings || {});
    } catch (error) {
      res.status(500).json({ message: "Ayarlar alınamadı" });
    }
  });
  
  app.put("/api/settings", async (req, res) => {
    const data = validateRequest(insertSettingsSchema.partial(), req, res);
    if (!data) return;
    
    try {
      const settings = await storage.updateSettings(data);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Ayarlar güncellenemedi" });
    }
  });

  // User Management
  app.post("/api/users", async (req, res) => {
    const data = validateRequest(insertUserSchema, req, res);
    if (!data) return;
    
    try {
      const user = await storage.createUser(data);
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Kullanıcı oluşturulamadı" });
    }
  });

  // Finansal Raporlar API
  app.get("/api/reports/financial", async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date(new Date().setFullYear(new Date().getFullYear() - 1));
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
      
      // Gelirleri al
      const incomes = await storage.getIncomesByPeriod(startDate, endDate);
      
      // Giderleri al
      const expenses = await storage.getExpensesByPeriod(startDate, endDate);
      
      // Aylara göre veri hazırla
      const monthlyData = new Map<string, { date: string, income: number, expense: number, netIncome: number }>();
      
      // Tarih aralığındaki tüm ayları ekle
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        monthlyData.set(monthKey, { 
          date: monthKey, 
          income: 0, 
          expense: 0, 
          netIncome: 0 
        });
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      // Gelirleri hesapla
      incomes.forEach(income => {
        const date = new Date(income.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.has(monthKey)) {
          const data = monthlyData.get(monthKey)!;
          data.income += income.amount;
          data.netIncome = data.income - data.expense;
          monthlyData.set(monthKey, data);
        }
      });
      
      // Giderleri hesapla
      expenses.forEach(expense => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData.has(monthKey)) {
          const data = monthlyData.get(monthKey)!;
          data.expense += expense.amount;
          data.netIncome = data.income - data.expense;
          monthlyData.set(monthKey, data);
        }
      });
      
      // Toplam değerleri hesapla
      const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
      const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const netIncome = totalIncome - totalExpense;
      
      // Kategori bazlı gelir ve giderler
      const incomeByCategory = new Map<string, number>();
      const expenseByCategory = new Map<string, number>();
      
      incomes.forEach(income => {
        const category = income.category || "Diğer";
        incomeByCategory.set(category, (incomeByCategory.get(category) || 0) + income.amount);
      });
      
      expenses.forEach(expense => {
        const category = expense.category || "Diğer";
        expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + expense.amount);
      });
      
      res.json({
        summary: {
          totalIncome,
          totalExpense,
          netIncome,
          period: {
            startDate,
            endDate
          }
        },
        monthlyData: Array.from(monthlyData.values()).sort((a, b) => a.date.localeCompare(b.date)),
        incomeByCategory: Array.from(incomeByCategory.entries()).map(([category, amount]) => ({ category, amount })),
        expenseByCategory: Array.from(expenseByCategory.entries()).map(([category, amount]) => ({ category, amount }))
      });
    } catch (error) {
      console.error("Financial report error:", error);
      res.status(500).json({ message: "Finansal rapor oluşturulamadı" });
    }
  });

  // Auth routes (simplified for demo)
  app.post("/api/auth/login", async (req, res) => {
    const loginSchema = z.object({
      username: z.string(),
      password: z.string()
    });
    
    const data = validateRequest(loginSchema, req, res);
    if (!data) return;
    
    try {
      const user = await storage.getUserByUsername(data.username);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "Geçersiz kullanıcı adı veya şifre" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Giriş işlemi başarısız" });
    }
  });
  
  // Bilanço raporu API endpoint'i
  app.get("/api/reports/balance-sheet", async (req, res) => {
    try {
      // Gerçek verileri almak için servisleri çağırabiliriz
      // Şu an için demo verileri döndürüyoruz
      
      const balanceSheet = {
        assets: [
          { type: "current", name: "Nakit ve Nakit Benzerleri", amount: 124500 },
          { type: "current", name: "Ticari Alacaklar", amount: 58700 },
          { type: "current", name: "Stoklar", amount: 32800 },
          { type: "non-current", name: "Maddi Duran Varlıklar", amount: 210000 },
          { type: "non-current", name: "Maddi Olmayan Duran Varlıklar", amount: 15000 }
        ],
        liabilities: [
          { type: "current", name: "Ticari Borçlar", amount: 45200 },
          { type: "current", name: "Kısa Vadeli Finansal Borçlar", amount: 30000 },
          { type: "non-current", name: "Uzun Vadeli Finansal Borçlar", amount: 120000 }
        ],
        equity: [
          { type: "equity", name: "Ödenmiş Sermaye", amount: 100000 },
          { type: "equity", name: "Geçmiş Yıllar Karları", amount: 85000 },
          { type: "equity", name: "Dönem Net Karı", amount: 60800 }
        ],
        assetTotal: 441000,
        liabilityTotal: 195200,
        equityTotal: 245800
      };
      
      res.json(balanceSheet);
    } catch (error) {
      console.error("Balance sheet error:", error);
      res.status(500).json({ message: "Bilanço raporu oluşturulamadı" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
