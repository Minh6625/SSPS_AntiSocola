
import axios from '@/config/axios';
import { PagePricing } from '@/types/pagePricing';

/**
 * PAGE PRICING SERVICE
 * Quản lý API cho bảng giá trang in
 */
export const pagePricingService = {
  /**
   * Lấy tất cả giá đang active
   */
  async getAllPricing(): Promise<PagePricing[]> {
    const response = await axios.get<PagePricing[]>('/api/page-pricing');
    return response.data;
  },

  /**
   * Lấy giá theo paper size
   */
  async getPricing(paperSize: string): Promise<PagePricing> {
    const response = await axios.get<PagePricing>(`/api/page-pricing/${paperSize}`);
    return response.data;
  },

  /**
   * Tính tổng giá tiền cho việc mua trang
   */
  calculatePrice(
    paperSize: string,
    numPages: number,
    pricing: PagePricing[]
  ): number {
    const matchedPrice = pricing.find(p => p.paperSize === paperSize);
    
    if (!matchedPrice) {
      console.warn(`No pricing found for ${paperSize}`);
      return 0;
    }
    
    return matchedPrice.pricePerPage * numPages;
  }
};
