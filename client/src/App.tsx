import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Invoices from "@/pages/invoices";
import IncomeExpense from "@/pages/income-expense";
import Customers from "@/pages/customers";
import Suppliers from "@/pages/suppliers";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";
import TaxReports from "@/pages/tax-reports";
import BalanceSheet from "@/pages/balance-sheet";
import UserSettings from "@/pages/user-settings";
import SystemSettings from "@/pages/system-settings";
import PaymentSchedules from "@/pages/payment-schedules";
import AppLayout from "@/components/layout/app-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/invoices" component={Invoices} />
      <Route path="/income-expense" component={IncomeExpense} />
      <Route path="/customers" component={Customers} />
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/payment-schedules" component={PaymentSchedules} />
      <Route path="/reports" component={Reports} />
      <Route path="/tax-reports" component={TaxReports} />
      <Route path="/balance-sheet" component={BalanceSheet} />
      <Route path="/user-settings" component={UserSettings} />
      <Route path="/system-settings" component={SystemSettings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
