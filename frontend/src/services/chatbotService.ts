import axiosInstance from '@/config/axios';

interface ChatResponse {
  success: boolean;
  message: string;
  response: string;
}

export const chatbotService = {
  async chat(message: string): Promise<string> {
    try {
      const response = await axiosInstance.post<ChatResponse>('/chatbot/chat', { message });
      return response.data.response;
    } catch (error) {
      console.error('Chatbot API error:', error);
      return '⚠️ Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ Zalo 0937833154!';
    }
  }
};
