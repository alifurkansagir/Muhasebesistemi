// Currency options
export const CURRENCY_OPTIONS = [
  { label: "TRY", value: "TRY", symbol: "₺" },
  { label: "USD", value: "USD", symbol: "$" },
  { label: "EUR", value: "EUR", symbol: "€" },
  { label: "GBP", value: "GBP", symbol: "£" },
];

// Category options for expenses
export const EXPENSE_CATEGORIES = [
  { label: "Fatura", value: "Fatura" },
  { label: "Maaş", value: "Maaş" },
  { label: "Kira", value: "Kira" },
  { label: "Malzeme", value: "Malzeme" },
  { label: "Ulaşım", value: "Ulaşım" },
  { label: "Pazarlama", value: "Pazarlama" },
  { label: "Yazılım/Donanım", value: "Yazılım/Donanım" },
  { label: "Vergiler", value: "Vergiler" },
  { label: "Diğer", value: "Diğer" },
];

// Category options for income
export const INCOME_CATEGORIES = [
  { label: "Hizmet", value: "Hizmet" },
  { label: "Ürün Satışı", value: "Ürün Satışı" },
  { label: "Danışmanlık", value: "Danışmanlık" },
  { label: "Abonelik", value: "Abonelik" },
  { label: "Diğer", value: "Diğer" },
];

// Payment methods
export const PAYMENT_METHODS = [
  { label: "Nakit", value: "Nakit" },
  { label: "Banka Havalesi", value: "Banka Havalesi" },
  { label: "Kredi Kartı", value: "Kredi Kartı" },
  { label: "Çek", value: "Çek" },
  { label: "Senet", value: "Senet" },
  { label: "Otomatik Ödeme", value: "Otomatik Ödeme" },
];

// Invoice status options
export const INVOICE_STATUS_OPTIONS = [
  { label: "Taslak", value: "draft" },
  { label: "Gönderildi", value: "sent" },
  { label: "Ödendi", value: "paid" },
  { label: "Gecikmiş", value: "overdue" },
  { label: "İptal Edildi", value: "cancelled" },
];

// Product categories
export const PRODUCT_CATEGORIES = [
  { label: "Ofis Malzemeleri", value: "Ofis Malzemeleri" },
  { label: "Elektronik", value: "Elektronik" },
  { label: "Yazılım", value: "Yazılım" },
  { label: "Hizmetler", value: "Hizmetler" },
  { label: "Diğer", value: "Diğer" },
];

// Product units
export const PRODUCT_UNITS = [
  { label: "Adet", value: "Adet" },
  { label: "Paket", value: "Paket" },
  { label: "Kg", value: "Kg" },
  { label: "Lt", value: "Lt" },
  { label: "Metre", value: "Metre" },
  { label: "Saat", value: "Saat" },
];

// Tax types
export const TAX_TYPES = [
  { label: "KDV", value: "KDV" },
  { label: "ÖTV", value: "ÖTV" },
  { label: "Stopaj", value: "Stopaj" },
  { label: "Diğer", value: "Diğer" },
];

// Recurring payment periods
export const RECURRING_PERIODS = [
  { label: "Günlük", value: "daily" },
  { label: "Haftalık", value: "weekly" },
  { label: "Aylık", value: "monthly" },
  { label: "Üç Aylık", value: "quarterly" },
  { label: "Yıllık", value: "yearly" },
];

// User roles
export const USER_ROLES = [
  { label: "Yönetici", value: "admin" },
  { label: "Kullanıcı", value: "user" },
  { label: "Muhasebeci", value: "accountant" },
];

// Chart time periods
export const CHART_PERIODS = [
  { label: "Son 7 Gün", value: "7days" },
  { label: "Son 30 Gün", value: "30days" },
  { label: "Son 3 Ay", value: "3months" },
  { label: "Son 6 Ay", value: "6months" },
  { label: "Son 12 Ay", value: "12months" },
  { label: "Bu Yıl", value: "thisYear" },
];

// Date formatting options
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

export const DATE_FORMAT_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
};

// Navigation items
export const MAIN_NAVIGATION_ITEMS = [
  { label: "Pano", href: "/", icon: "tachometer-alt" },
  { label: "Faturalar", href: "/invoices", icon: "receipt" },
  { label: "Gelir/Gider", href: "/income-expense", icon: "exchange-alt" },
  { label: "Müşteriler", href: "/customers", icon: "users" },
  { label: "Tedarikçiler", href: "/suppliers", icon: "truck" },
  { label: "Stok Yönetimi", href: "/inventory", icon: "boxes" },
];

export const REPORT_NAVIGATION_ITEMS = [
  { label: "Finansal Raporlar", href: "/reports", icon: "chart-line" },
  { label: "Vergi Raporları", href: "/tax-reports", icon: "file-invoice-dollar" },
  { label: "Bilanço", href: "/balance-sheet", icon: "balance-scale" },
];

export const SETTINGS_NAVIGATION_ITEMS = [
  { label: "Kullanıcılar", href: "/user-settings", icon: "user-cog" },
  { label: "Sistem Ayarları", href: "/system-settings", icon: "cog" },
];
