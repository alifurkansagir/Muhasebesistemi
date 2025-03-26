import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@/lib/types";
import QuickActions from "@/components/dashboard/quick-actions";
import FinancialSummary from "@/components/dashboard/financial-summary";
import FinancialChart from "@/components/dashboard/financial-chart";
import UpcomingPayments from "@/components/dashboard/upcoming-payments";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import RecentInvoices from "@/components/dashboard/recent-invoices";
import TaxCalendar from "@/components/dashboard/tax-calendar";
import LowStockItems from "@/components/dashboard/low-stock-items";

const Dashboard = () => {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard/summary'],
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-4 h-24"></div>
          ))}
        </div>
        <div className="bg-white shadow rounded-lg p-4 h-80"></div>
        <div className="bg-white shadow rounded-lg p-4 h-64"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="text-danger mb-4">
          <i className="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium mb-2">Veriler yüklenirken bir hata oluştu</h3>
        <p className="text-neutral-500">{(error as Error).message}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          onClick={() => window.location.reload()}
        >
          Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Quick Action Cards */}
      <QuickActions />
      
      {/* Financial Summary */}
      {data && (
        <FinancialSummary 
          totalIncome={data.summary.totalIncome}
          totalExpense={data.summary.totalExpense}
          pendingInvoices={data.summary.pendingInvoices}
          pendingPayments={data.summary.pendingPayments}
        />
      )}
      
      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Financial Chart */}
        <FinancialChart />
        
        {/* Upcoming Payments */}
        {data && (
          <UpcomingPayments payments={data.upcomingPayments} />
        )}
      </div>
      
      {/* Recent Transactions */}
      {data && (
        <RecentTransactions transactions={data.recentTransactions} />
      )}
      
      {/* Bottom Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        {data && (
          <RecentInvoices invoices={data.recentInvoices} />
        )}
        
        {/* Tax Calendar */}
        <TaxCalendar />
        
        {/* Low Stock Items */}
        {data && (
          <LowStockItems products={data.lowStockItems} />
        )}
      </div>
    </>
  );
};

export default Dashboard;
