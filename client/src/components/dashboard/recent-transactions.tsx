import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils/format-currency";
import { formatDate } from "@/lib/utils/date-utils";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  date: string | Date;
  description: string;
  category: string;
  status: string;
  amount: number;
  type: 'income' | 'expense';
  reference?: string;
  currency?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter transactions based on selected filter
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  // Paginate transactions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Get category badge color
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Hizmet':
        return "bg-primary bg-opacity-10 text-primary";
      case 'Malzeme':
        return "bg-accent bg-opacity-10 text-accent";
      case 'Fatura':
        return "bg-danger bg-opacity-10 text-danger";
      case 'Maaş':
        return "bg-secondary bg-opacity-10 text-secondary";
      default:
        return "bg-primary bg-opacity-10 text-primary";
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Tamamlandı':
        return "bg-success bg-opacity-10 text-success";
      case 'Beklemede':
        return "bg-neutral-300 text-neutral-600";
      case 'İptal Edildi':
        return "bg-danger bg-opacity-10 text-danger";
      default:
        return "bg-neutral-300 text-neutral-600";
    }
  };

  // Handle transaction actions
  const handleViewDetails = (id: number) => {
    toast({
      title: "İşlem Detayları",
      description: `${id} numaralı işlem detayları görüntüleniyor.`,
    });
  };

  const handleEditTransaction = (id: number) => {
    toast({
      title: "İşlem Düzenleme",
      description: `${id} numaralı işlem düzenleniyor.`,
    });
  };

  const handlePrintTransaction = (id: number) => {
    toast({
      title: "İşlem Yazdırma",
      description: `${id} numaralı işlem yazdırılıyor.`,
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-lg">Son İşlemler</h2>
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="text-sm border border-neutral-300 rounded px-2 py-1 w-[150px]">
              <SelectValue placeholder="Tüm İşlemler" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm İşlemler</SelectItem>
              <SelectItem value="income">Gelirler</SelectItem>
              <SelectItem value="expense">Giderler</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon">
            <i className="fas fa-filter text-neutral-400 hover:text-primary"></i>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-100">
              <TableHead className="text-xs font-semibold text-neutral-500">İşlem No</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500">Tarih</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500">Açıklama</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500">Kategori</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500">Durum</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500 text-right">Tutar</TableHead>
              <TableHead className="text-xs font-semibold text-neutral-500 text-center">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-neutral-200">
            {currentItems.length > 0 ? (
              currentItems.map((transaction) => (
                <TableRow key={transaction.id} className="hover:bg-neutral-50">
                  <TableCell className="text-sm">
                    {transaction.reference || (transaction.type === 'income' ? `#INV-${transaction.id}` : `#EXP-${transaction.id}`)}
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(transaction.date)}</TableCell>
                  <TableCell className="text-sm">{transaction.description}</TableCell>
                  <TableCell className="text-sm">
                    <span className={`px-2 py-1 ${getCategoryBadge(transaction.category)} text-xs rounded`}>
                      {transaction.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    <span className={`px-2 py-1 ${getStatusBadge(transaction.status)} text-xs rounded`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className={`text-sm ${transaction.type === 'income' ? 'text-success' : 'text-danger'} text-right font-medium`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <i className="fas fa-ellipsis-h text-neutral-500"></i>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(transaction.id)}>
                          <i className="fas fa-eye mr-2 text-primary"></i> Detayları Görüntüle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTransaction(transaction.id)}>
                          <i className="fas fa-edit mr-2 text-primary"></i> Düzenle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePrintTransaction(transaction.id)}>
                          <i className="fas fa-print mr-2 text-primary"></i> Yazdır
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-neutral-500">
                  İşlem bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-neutral-500">
          Toplam {filteredTransactions.length} işlemden {Math.min(currentItems.length, itemsPerPage)} gösteriliyor
        </div>
        
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}
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
                  className={currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
