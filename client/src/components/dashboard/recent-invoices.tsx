import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/date-utils";
import { Invoice } from "@shared/schema";

interface RecentInvoicesProps {
  invoices: Invoice[];
}

const RecentInvoices = ({ invoices }: RecentInvoicesProps) => {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">Son Faturalar</h2>
        <Link href="/invoices">
          <Button variant="link" className="text-primary text-sm p-0 h-auto">
            Tümünü Gör
          </Button>
        </Link>
      </div>
      
      <div className="space-y-4">
        {invoices && invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div key={invoice.id} className="flex justify-between items-center border-b border-neutral-200 pb-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mr-3">
                  <i className="fas fa-file-invoice text-primary"></i>
                </div>
                <div>
                  <p className="font-medium">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-neutral-500">{formatDate(invoice.date)}</p>
                </div>
              </div>
              <span className="font-medium">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-neutral-500">
            <i className="fas fa-file-invoice text-2xl mb-2"></i>
            <p>Fatura bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentInvoices;
