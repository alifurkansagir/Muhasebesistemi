import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import NewInvoiceForm from "@/components/forms/new-invoice-form";
import { formatDate } from "@/lib/utils/date-utils";
import { formatCurrency } from "@/lib/utils/format-currency";
import { INVOICE_STATUS_OPTIONS } from "@/lib/constants";
import type { Invoice } from "@shared/schema";

const Invoices = () => {
  const { toast } = useToast();
  const [isNewInvoiceDialogOpen, setIsNewInvoiceDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: invoices, isLoading, error } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  // Filter and sort invoices
  const filteredInvoices = invoices 
    ? invoices
        .filter(invoice => 
          statusFilter === "all" || invoice.status === statusFilter
        )
        .filter(invoice => 
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formatDate(invoice.date).toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Paginate
  const paginatedInvoices = filteredInvoices
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return "bg-success bg-opacity-10 text-success";
      case 'sent':
        return "bg-primary bg-opacity-10 text-primary";
      case 'draft':
        return "bg-neutral-300 text-neutral-600";
      case 'overdue':
        return "bg-danger bg-opacity-10 text-danger";
      case 'cancelled':
        return "bg-neutral-500 bg-opacity-10 text-neutral-500";
      default:
        return "bg-neutral-300 text-neutral-600";
    }
  };

  // Get status display text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return "Ödendi";
      case 'sent':
        return "Gönderildi";
      case 'draft':
        return "Taslak";
      case 'overdue':
        return "Gecikmiş";
      case 'cancelled':
        return "İptal Edildi";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white shadow rounded-lg p-4 h-20"></div>
        <div className="bg-white shadow rounded-lg p-4 h-80"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="text-danger mb-4">
          <i className="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h3 className="text-lg font-medium mb-2">Faturalar yüklenirken bir hata oluştu</h3>
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
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <CardTitle className="text-lg">Fatura Yönetimi</CardTitle>
          <Dialog open={isNewInvoiceDialogOpen} onOpenChange={setIsNewInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                Yeni Fatura
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Yeni Fatura Oluştur</DialogTitle>
              </DialogHeader>
              <NewInvoiceForm onSuccess={() => {
                setIsNewInvoiceDialogOpen(false);
                toast({
                  title: "Başarılı",
                  description: "Fatura başarıyla oluşturuldu.",
                });
              }} />
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center gap-4 p-4">
          <Input
            placeholder="Fatura ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex items-center gap-2 ml-auto">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum Filtresi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Faturalar</SelectItem>
                {INVOICE_STATUS_OPTIONS.map(status => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}>
              <i className="fas fa-sync-alt mr-2"></i>
              Sıfırla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fatura No</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Müşteri/Tedarikçi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">Toplam</TableHead>
                  <TableHead className="text-center">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.length > 0 ? (
                  paginatedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.customerId ? `Müşteri #${invoice.customerId}` : `Tedarikçi #${invoice.supplierId}`}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 ${getStatusBadge(invoice.status)} text-xs rounded`}>
                          {getStatusText(invoice.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <i className="fas fa-eye text-primary"></i>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <i className="fas fa-edit text-primary"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              import('@/lib/utils/pdf-export').then(async ({ generateInvoicePdf, downloadPdf }) => {
                                try {
                                  // Fatura detaylarını ve öğelerini getir
                                  const invoiceResponse = await fetch(`/api/invoices/${invoice.id}`);
                                  if (!invoiceResponse.ok) throw new Error('Fatura detayları alınamadı');
                                  const invoiceDetails = await invoiceResponse.json();
                                  
                                  // Fatura öğelerini getir
                                  const itemsResponse = await fetch(`/api/invoices/${invoice.id}/items`);
                                  if (!itemsResponse.ok) throw new Error('Fatura kalemleri alınamadı');
                                  const invoiceItems = await itemsResponse.json();
                                  
                                  // Müşteri bilgilerini getir
                                  let customerData = {};
                                  if (invoice.customerId) {
                                    const customerResponse = await fetch(`/api/customers/${invoice.customerId}`);
                                    if (customerResponse.ok) {
                                      customerData = await customerResponse.json();
                                    }
                                  }
                                  
                                  // PDF oluştur
                                  const pdf = generateInvoicePdf(
                                    invoiceDetails, 
                                    invoiceItems,
                                    customerData,
                                    { companyName: 'Şirketinizin Adı', taxId: '1234567890' }
                                  );
                                  downloadPdf(pdf, `fatura-${invoice.invoiceNumber}.pdf`);
                                  
                                  toast({
                                    title: "Başarılı",
                                    description: "Fatura PDF olarak indirildi.",
                                  });
                                } catch (error) {
                                  console.error('PDF indirme hatası:', error);
                                  toast({
                                    title: "Hata",
                                    description: "Fatura PDF olarak indirilemedi.",
                                    variant: "destructive"
                                  });
                                }
                              });
                            }}
                          >
                            <i className="fas fa-download text-primary"></i>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Fatura bulunamadı.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Invoices;
