# Education Management System

Hệ thống quản lý đào tạo full-stack dành cho các trung tâm/cơ sở giáo dục. Bao gồm các nghiệp vụ đào tạo, tài chính, nhân sự, phân quyền và cổng thông tin học viên/giáo viên.

---

## Công nghệ sử dụng

**Frontend**
- React 19, TypeScript, Vite (rolldown-vite)
- Tailwind CSS 4, React Router 7, React Hook Form, Zod
- Axios, Socket.io-client, Recharts, lucide-react

**Backend**
- Node.js, Express 5, TypeScript
- MongoDB với Mongoose, JWT, bcrypt
- Socket.io, Nodemailer, node-cron, ExcelJS, VNPay SDK, Zod

**Hạ tầng**
- Docker (MongoDB)
- Vitest (unit + integration tests)

---

## Yêu cầu môi trường

- Node.js >= 20
- Docker Desktop (để chạy MongoDB)

---

## Cài đặt và khởi chạy

### 1. Khởi động MongoDB

```bash
docker-compose up -d
```

MongoDB sẽ chạy tại `localhost:27018`, database `education-manager`.

### 2. Cài đặt dependencies

```bash
# Root
npm install

# Server
cd server && npm install

# Client
cd client && npm install
```

### 3. Cấu hình biến môi trường

Tạo file `server/.env` dựa trên mẫu:

```env
PORT=5000
MONGO_URI=mongodb://root:password@localhost:27018/education-manager?authSource=admin
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email (Nodemailer)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USER=your@email.com
MAIL_PASS=your_password

# VNPay
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=
VNPAY_RETURN_URL=

CLIENT_URL=http://localhost:5173
```

### 4. Seed dữ liệu mẫu

```bash
cd server
npm run seed
```

### 5. Khởi chạy toàn bộ ứng dụng

```bash
# Từ thư mục root, chạy cả server và client cùng lúc
npm run dev
```

Hoặc chạy riêng:

```bash
npm run server   # Express tại :5000
npm run client   # Vite tại :5173
```

---

## Cấu trúc dự án

```
Education-Management-System/
├── client/                  # React frontend
│   └── src/
│       ├── pages/
│       │   ├── Private/     # Các module chính (phân quyền)
│       │   └── LoginPage, ForgotPasswordPage, ...
│       ├── components/
│       ├── services/        # Axios API calls
│       ├── hooks/
│       ├── layouts/
│       └── types/
├── server/                  # Express backend
│   └── src/
│       ├── controllers/
│       ├── services/
│       ├── models/          # Mongoose schemas
│       ├── routes/
│       ├── validations/     # Zod schemas
│       ├── middlewares/
│       ├── seed/
│       └── lib/             # Socket.io setup
├── docker-compose.yaml
└── package.json
```

---

## Các module chính

### Đào tạo
- Quản lý khóa học, lớp học, phòng học, ca học
- Xếp lịch tự động bằng thuật toán di truyền (Genetic Algorithm)
- Quản lý bài thi, nộp bài, kết quả
- Điểm danh học viên

### Tài chính
- Hóa đơn học phí, giao dịch thu/chi
- Thanh toán online qua VNPay
- Bảng lương, sổ quỹ, chi phí vận hành, chi phí cố định

### Nhân sự
- Hồ sơ giáo viên, nhân viên
- Hợp đồng, giải ngân lương

### Hệ thống
- Phân quyền theo vai trò: SUPER_ADMIN, MANAGER, ACCOUNTANT, HR, TEACHER, STUDENT, SALE, ...
- Thông báo real-time qua Socket.io
- Gửi email theo mẫu (Nodemailer)
- Cổng thông tin học viên và giáo viên

---

## API

Tất cả REST endpoint có prefix `/api/`.

Một số nhóm endpoint chính:

| Prefix | Mô tả |
|---|---|
| `/api/auth` | Đăng nhập, refresh token, đổi mật khẩu |
| `/api/users` | Quản lý người dùng |
| `/api/roles` | Phân quyền |
| `/api/courses` | Khóa học |
| `/api/classes` | Lớp học |
| `/api/schedules` | Lịch học, xếp lịch tự động |
| `/api/exams` | Bài thi |
| `/api/attendance` | Điểm danh |
| `/api/invoices` | Hóa đơn |
| `/api/transactions` | Giao dịch |
| `/api/payments` | VNPay |
| `/api/payrolls` | Bảng lương |
| `/api/rooms` | Phòng học |
| `/api/shifts` | Ca học |

---

## Kiểm thử

```bash
cd server

# Chạy toàn bộ test
npm test

# Unit test
npm run test:unit

# Integration test
npm run test:integration

# Coverage
npm run test:coverage
```

File `.env.test` cần được tạo riêng với MongoDB test database.

---

## Build production

```bash
# Server
cd server && npm run build

# Client
cd client && npm run build
```

Output server tại `server/dist/`, client tại `client/dist/`.
