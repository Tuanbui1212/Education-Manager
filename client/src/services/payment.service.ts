import axios from './axiosClient';
interface IPaymentUrlResponse {
  success: boolean;
  data: {
    paymentUrl: string;
  };
  message?: string;
}

export const paymentService = {
  createVnpayUrl: async (invoiceId: string, bankCode?: string): Promise<IPaymentUrlResponse> => {
    const response = await axios.post('/payments/create-url', {
      invoiceId,
      bankCode,
    });

    return response.data;
  },

  handleVnpayIpn: async (query: any) => {
    const response = await axios.get('/payments/vnpay-ipn', {
      params: query,
    });

    return response.data;
  },
};
