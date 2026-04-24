// services/report.service.ts
// Tạm thời dùng mock data — sau này chỉ cần thay bằng API call thật, không sửa component

export interface IKpiSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  totalDebt: number;
  revenueGrowth: number;
  expenseGrowth: number;
}

export interface IChartDataPoint {
  month: string;
  revenue: number;
  expense: number;
  profit: number;
}

export interface ITransaction {
  _id: string;
  code: string;
  date: string;
  studentName: string;
  className: string;
  amount: number;
  paymentMethod: string;
  type: 'INCOME';
}

export interface IExpenditure {
  _id: string;
  date: string;
  type: 'SALARY_TEACHER' | 'SALARY_SALE' | 'OPERATION';
  receiverName: string;
  description: string;
  amount: number;
}

// ---- Shape chuẩn mà useFetch expect ----
interface IServiceResponse<T> {
  success: boolean;
  data: T;
  message: string;
  totalCount?: number;
}

// ---- MOCK DATA ----

const mockKpi: IKpiSummary = {
  totalRevenue: 285_000_000,
  totalExpense: 162_500_000,
  netProfit: 122_500_000,
  totalDebt: 47_300_000,
  revenueGrowth: 12.4,
  expenseGrowth: 5.1,
};

const mockChartData: IChartDataPoint[] = [
  { month: 'T1', revenue: 210_000_000, expense: 140_000_000, profit: 70_000_000 },
  { month: 'T2', revenue: 195_000_000, expense: 135_000_000, profit: 60_000_000 },
  { month: 'T3', revenue: 230_000_000, expense: 148_000_000, profit: 82_000_000 },
  { month: 'T4', revenue: 255_000_000, expense: 155_000_000, profit: 100_000_000 },
  { month: 'T5', revenue: 242_000_000, expense: 150_000_000, profit: 92_000_000 },
  { month: 'T6', revenue: 270_000_000, expense: 158_000_000, profit: 112_000_000 },
  { month: 'T7', revenue: 260_000_000, expense: 152_000_000, profit: 108_000_000 },
  { month: 'T8', revenue: 285_000_000, expense: 162_500_000, profit: 122_500_000 },
];

const mockTransactions: ITransaction[] = [
  {
    _id: '1',
    code: 'TXN-001',
    date: '2026-08-15',
    studentName: 'Nguyễn Văn An',
    className: 'IELTS Advanced 01',
    amount: 8_500_000,
    paymentMethod: 'Chuyển khoản',
    type: 'INCOME',
  },
  {
    _id: '2',
    code: 'TXN-002',
    date: '2026-08-14',
    studentName: 'Trần Thị Bình',
    className: 'TOEIC 600+ B2',
    amount: 6_200_000,
    paymentMethod: 'Tiền mặt',
    type: 'INCOME',
  },
  {
    _id: '3',
    code: 'TXN-003',
    date: '2026-08-13',
    studentName: 'Lê Minh Cường',
    className: 'Communication Pro',
    amount: 5_000_000,
    paymentMethod: 'Chuyển khoản',
    type: 'INCOME',
  },
  {
    _id: '4',
    code: 'TXN-004',
    date: '2026-08-12',
    studentName: 'Phạm Thị Dung',
    className: 'IELTS Starter 03',
    amount: 7_800_000,
    paymentMethod: 'Chuyển khoản',
    type: 'INCOME',
  },
  {
    _id: '5',
    code: 'TXN-005',
    date: '2026-08-11',
    studentName: 'Hoàng Văn Em',
    className: 'TOEIC 600+ A1',
    amount: 6_200_000,
    paymentMethod: 'Tiền mặt',
    type: 'INCOME',
  },
];

const mockExpenditures: IExpenditure[] = [
  {
    _id: 'e1',
    date: '2026-08-15',
    type: 'SALARY_TEACHER',
    receiverName: 'GV. Nguyễn Hữu Phúc',
    description: 'Lương giảng dạy T8/2026',
    amount: 22_000_000,
  },
  {
    _id: 'e2',
    date: '2026-08-15',
    type: 'SALARY_TEACHER',
    receiverName: 'GV. Trần Thị Lan',
    description: 'Lương giảng dạy T8/2026',
    amount: 18_500_000,
  },
  {
    _id: 'e3',
    date: '2026-08-10',
    type: 'SALARY_SALE',
    receiverName: 'TV. Lê Văn Hùng',
    description: 'Lương + hoa hồng T8/2026',
    amount: 12_000_000,
  },
  {
    _id: 'e4',
    date: '2026-08-01',
    type: 'OPERATION',
    receiverName: 'Công ty TNHH Điện lực',
    description: 'Tiền điện tháng 8',
    amount: 3_200_000,
  },
  {
    _id: 'e5',
    date: '2026-08-01',
    type: 'OPERATION',
    receiverName: 'Viettel Business',
    description: 'Tiền internet + điện thoại',
    amount: 850_000,
  },
];

// ---- SERVICE ----

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const reportService = {
  getSummary: async (params?: {
    month?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<IServiceResponse<IKpiSummary>> => {
    await delay(400);
    return { success: true, data: mockKpi, message: 'OK' };
  },

  getChartData: async (params?: { year?: string }): Promise<IServiceResponse<IChartDataPoint[]>> => {
    await delay(300);
    return { success: true, data: mockChartData, message: 'OK' };
  },

  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    month?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<IServiceResponse<ITransaction[]>> => {
    await delay(350);
    return { success: true, data: mockTransactions, message: 'OK', totalCount: mockTransactions.length };
  },

  getExpenditures: async (params?: {
    page?: number;
    limit?: number;
    month?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<IServiceResponse<IExpenditure[]>> => {
    await delay(350);
    return { success: true, data: mockExpenditures, message: 'OK', totalCount: mockExpenditures.length };
  },
};
