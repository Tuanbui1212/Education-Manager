export type ICashbookItem = {
  _id: string;
  createdAt: string;
  code: string;
  type: 'IN' | 'OUT' | 'REFUND';
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  creatorName: string;
  processedBy?: any;
  note?: string;
  paidBy?: any;
};
