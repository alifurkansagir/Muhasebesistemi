import { type Income, type Expense, type PaymentSchedule, type Invoice, type Product } from "@shared/schema";

// Dashboard data type
export interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netIncome: number;
    pendingInvoices: number;
    pendingPayments: number;
  };
  recentTransactions: (Income & { type: 'income' } | Expense & { type: 'expense' })[];
  recentInvoices: Invoice[];
  upcomingPayments: PaymentSchedule[];
  lowStockItems: Product[];
}

// Financial summary card type
export interface FinancialSummaryCardProps {
  title: string;
  amount: number;
  currency?: string;
  percentChange: number;
  icon: string;
  iconColorClass: string;
  amountColorClass: string;
}

// Chart data point
export interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
  netIncome: number;
}

// Transaction display type
export interface TransactionDisplayProps {
  id: number;
  reference: string;
  date: Date | string;
  description: string;
  category: string;
  status: string;
  amount: number;
  isIncome: boolean;
  currency?: string;
}

// Payment display type
export interface PaymentDisplayProps {
  id: number;
  description: string;
  dueDate: Date | string;
  amount: number;
  daysLeft: number;
  currency?: string;
}

// Invoice display type
export interface InvoiceDisplayProps {
  id: number;
  invoiceNumber: string;
  date: Date | string;
  totalAmount: number;
  currency?: string;
}

// Low stock item display type
export interface LowStockItemProps {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  alertLevel: string;
}

// Navigation item type
export interface NavigationItem {
  label: string;
  href: string;
  icon: string;
}

// Quick action type
export interface QuickActionProps {
  icon: string;
  label: string;
  colorClass: string;
  onClick: () => void;
}
