
export interface PagePricing {
  paperSize: string;          // 'A4', 'A3', 'A5'
  pricePerPage: number;       // Giá mỗi trang
  currency: string;           // 'VND'
  notes?: string;             // Ghi chú
}

export interface PricingMap {
  [key: string]: {            // key: "A4", "A3", "A5"
    pricePerPage: number;
    notes?: string;
  };
}
