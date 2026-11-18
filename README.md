# Website Quản lý Mượn Sách

Website hỗ trợ quản lý hoạt động mượn và trả sách trong thư viện. Hệ thống được xây dựng theo mô hình client–server:

- **Frontend:** Vue.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB

> README này được xây dựng dựa trên schema hiện tại. Các chức năng và quy tắc nghiệp vụ chưa thể hiện trong schema được ghi rõ là định hướng triển khai, không xem là chức năng đã hoàn thiện.

## 1. Mục tiêu đồ án

Xây dựng website giúp thư viện quản lý thông tin độc giả, sách, tác giả, thể loại, nhà xuất bản và nhân viên; đồng thời hỗ trợ theo dõi quá trình mượn sách, đánh giá sách và xử lý phiếu phạt.

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | Vue.js |
| Backend | Node.js, Express.js |
| Cơ sở dữ liệu | MongoDB |
| Giao tiếp frontend/backend | RESTful API (định hướng triển khai) |

## 3. Cấu trúc dữ liệu

Cơ sở dữ liệu được thiết kế theo các collection tương ứng với những nhóm dữ liệu dưới đây. Các trường kiểu `objectId` được dùng để tham chiếu đến document ở collection khác.

### 3.1. `DocGia` – Độc giả

Lưu thông tin tài khoản và hồ sơ độc giả.

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaDocGia` | ObjectId | Mã định danh độc giả |
| `HoLot` | String | Họ lót |
| `Ten` | String | Tên |
| `NgaySinh` | Date | Ngày sinh |
| `Phai` | String | Giới tính |
| `DiaChi` | String | Địa chỉ |
| `DienThoai` | String | Số điện thoại |
| `Email` | String | Email |
| `MatKhau` | String | Mật khẩu |

### 3.2. `Sach` – Sách

Lưu thông tin các đầu sách trong thư viện.

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaSach` | ObjectId | Mã định danh sách |
| `TenSach` | String | Tên sách |
| `DonGia` | Decimal | Đơn giá |
| `SoQuyen` | Number | Số quyển |
| `SoQuyenConLai` | Number | Số quyển |
| `NamXuatBan` | Number | Năm xuất bản |
| `MaNXB` | ObjectId | Tham chiếu nhà xuất bản |
| `TacGia` | Number | Trường mã tác giả theo schema hiện tại |
| `MaTheLoai` | ObjectId | Tham chiếu thể loại |

### 3.3. `NhaXuatBan` – Nhà xuất bản

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaNXB` | ObjectId | Mã nhà xuất bản |
| `TenNXB` | String | Tên nhà xuất bản |
| `DiaChi` | String | Địa chỉ |

### 3.4. `TacGia` – Tác giả

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaTG` | Number | Mã tác giả |
| `TenTG` | String | Tên tác giả |
| `QuocTich` | String | Quốc tịch |

### 3.5. `TheLoai` – Thể loại

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaTheLoai` | ObjectId | Mã thể loại |
| `TenTheLoai` | String | Tên thể loại |
| `MoTa` | String | Mô tả thể loại |

### 3.6. `NhanVien` – Nhân viên

Lưu thông tin nhân viên quản lý hoạt động thư viện.

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MSNV` | ObjectId | Mã nhân viên |
| `HoTenNV` | String | Họ tên nhân viên |
| `Password` | String | Mật khẩu |
| `ChucVu` | String | Chức vụ |
| `Diachi` | String | Địa chỉ |
| `SoDienThoai` | String | Số điện thoại |

### 3.7. `TheoDoiMuonSach` – Theo dõi mượn sách

Lưu thông tin mượn và trả sách của độc giả.

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaTheoDoi` | Number | Mã theo dõi mượn sách |
| `MaDocGia` | ObjectId | Tham chiếu độc giả |
| `MaSach` | ObjectId | Tham chiếu sách |
| `NgayMuon` | DateTime | Ngày mượn |
| `NgayTra` | DateTime | Ngày trả |
| `MaNV` | ObjectId | Tham chiếu nhân viên |

### 3.8. `DanhGiaSach` – Đánh giá sách

Lưu đánh giá và nhận xét của độc giả đối với sách.

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaDanhGia` | ObjectId | Mã đánh giá |
| `MaDocGia` | ObjectId | Tham chiếu độc giả |
| `MaSach` | ObjectId | Tham chiếu sách |
| `SoSao` | Number | Số sao đánh giá |
| `NhanXet` | Text | Nội dung nhận xét |
| `NgayDanhGia` | DateTime | Thời điểm đánh giá |

### 3.9. `PhieuPhat` – Phiếu phạt

Lưu thông tin xử lý vi phạm liên quan đến việc mượn sách.

| Trường | Kiểu dữ liệu | Mô tả |
|---|---|---|
| `MaPhat` | ObjectId | Mã phiếu phạt |
| `MaNV` | ObjectId | Tham chiếu nhân viên |
| `MaSach` | ObjectId | Tham chiếu sách |
| `MaDocGia` | ObjectId | Tham chiếu độc giả |
| `NgayPhat` | DateTime | Ngày lập phiếu phạt |
| `LyDoPhat` | String | Lý do phạt |
| `SoTienPhat` | Decimal | Số tiền phạt |
| `TrangThaiThanhToan` | String | Trạng thái thanh toán |

## 4. Quan hệ giữa các collection

Theo sơ đồ hiện tại:

- Một độc giả có thể có nhiều bản ghi theo dõi mượn sách.
- Một sách có thể xuất hiện trong nhiều bản ghi theo dõi mượn sách.
- Nhân viên được tham chiếu trong bản ghi mượn sách và phiếu phạt.
- Sách tham chiếu nhà xuất bản và thể loại.
- Độc giả có thể tạo nhiều đánh giá; mỗi đánh giá tham chiếu một sách.
- Phiếu phạt tham chiếu độc giả, sách và nhân viên.

Các quan hệ trên được biểu diễn bằng những trường `ObjectId` tham chiếu giữa các collection.

## 5. Chức năng dự kiến

Các nhóm chức năng dưới đây được suy ra từ dữ liệu trong schema và là phạm vi chức năng có thể triển khai:

### Độc giả
- Đăng ký, đăng nhập.
- Xem và cập nhật thông tin cá nhân.
- Tra cứu danh sách sách.
- Theo dõi lịch sử mượn và trả sách.
- Đánh giá và nhận xét sách.

### Quản lý sách
- Thêm, sửa, xóa và xem thông tin sách.
- Quản lý thể loại, tác giả và nhà xuất bản.
- Tra cứu sách theo tên hoặc thông tin phân loại.

### Quản lý mượn – trả
- Ghi nhận lượt mượn sách.
- Theo dõi ngày mượn, ngày trả.
- Ghi nhận nhân viên phụ trách giao dịch.

### Quản lý nhân viên
- Quản lý hồ sơ nhân viên.
- Lưu thông tin nhân viên phụ trách nghiệp vụ.

### Quản lý phiếu phạt
- Lập phiếu phạt và ghi nhận lý do.
- Theo dõi số tiền phạt.
- Cập nhật trạng thái thanh toán.

### Đánh giá sách
- Ghi nhận số sao và nhận xét của độc giả.
- Xem các đánh giá gắn với từng sách.

## 6. Cấu trúc thư mục đề xuất

```text
book-borrowing-website/
├── backend/
│   ├── src/
│   │   ├── config/          # Cấu hình và kết nối MongoDB
│   │   ├── models/          # Mongoose models
│   │   ├── controllers/     # Xử lý nghiệp vụ
│   │   ├── routes/          # Định nghĩa API
│   │   ├── middlewares/     # Xác thực và xử lý lỗi
│   │   ├── services/        # Logic nghiệp vụ dùng chung
│   │   ├── utils/           # Hàm tiện ích
│   │   └── app.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── views/
│   │   ├── router/
│   │   ├── stores/
│   │   ├── services/        # Gọi REST API
│   │   ├── composables/
│   │   └── App.vue
│   ├── .env.example
│   └── package.json
│
└── README.md
```

Đây là cấu trúc gợi ý; có thể điều chỉnh theo cách tổ chức mã nguồn thực tế.

## 7. Cài đặt và chạy dự án

### Yêu cầu môi trường

- Node.js và npm.
- MongoDB cài đặt local hoặc MongoDB Atlas.
- Git.

### 7.1. Backend

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend`:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/book_borrowing
JWT_SECRET=your_secret_key
```

Chạy backend (tùy theo script được khai báo trong `package.json`):

```bash
npm run dev
```

### 7.2. Frontend

Mở terminal khác:

```bash
cd frontend
npm install
```

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Chạy frontend:

```bash
npm run dev
```

> Các lệnh trên là hướng dẫn khởi tạo dự kiến. Tên script, endpoint và biến môi trường cần khớp với cấu hình thực tế của dự án.

## 8. Định hướng API

Có thể tổ chức REST API theo các nhóm tài nguyên sau:

| Nhóm | Endpoint tham khảo | Mục đích |
|---|---|---|
| Độc giả | `/api/readers` | Quản lý độc giả |
| Sách | `/api/books` | Quản lý và tra cứu sách |
| Tác giả | `/api/authors` | Quản lý tác giả |
| Thể loại | `/api/categories` | Quản lý thể loại |
| Nhà xuất bản | `/api/publishers` | Quản lý nhà xuất bản |
| Nhân viên | `/api/employees` | Quản lý nhân viên |
| Mượn sách | `/api/borrowings` | Theo dõi mượn và trả |
| Đánh giá | `/api/reviews` | Quản lý đánh giá sách |
| Phiếu phạt | `/api/fines` | Quản lý phiếu phạt |

Đây là endpoint đề xuất, chưa khẳng định đã được triển khai.

## 9. Lưu ý khi hoàn thiện schema

1. **Tác giả:** Trong sơ đồ, `Sach.TacGia` có kiểu `int`, còn `TacGia.MaTG` cũng là `int`. Cần thống nhất tên trường tham chiếu, ví dụ `MaTG`, và xác định một sách chỉ có một tác giả hay có thể có nhiều tác giả.
2. **Số quyển:** Cần làm rõ `Sach.SoQuyen` là tổng số quyển hay số quyển hiện có để có thể kiểm tra khả năng cho mượn.
3. **Mượn – trả:** Cần xác định cách biểu diễn sách chưa trả. Có thể bổ sung trạng thái mượn hoặc quy ước `NgayTra` chưa có giá trị là chưa trả.
4. **Phiếu phạt:** Cần quy định các giá trị hợp lệ cho `TrangThaiThanhToan`.
5. **Tài khoản:** Không lưu mật khẩu dạng văn bản thuần. Backend nên băm mật khẩu trước khi lưu và kiểm tra quyền truy cập ở các API cần bảo vệ.
6. **Kiểu dữ liệu:** Khi triển khai MongoDB/Mongoose, cần ánh xạ rõ `ObjectId`, `Date`, `Number` và kiểu tiền tệ. Với tiền, nên thống nhất cách lưu và làm tròn để tránh sai lệch.
7. **Tên trường:** Nên thống nhất quy tắc đặt tên (ví dụ camelCase hoặc PascalCase) giữa schema, model, API và frontend.

## 10. Trạng thái dự án

Đồ án hướng đến xây dựng website quản lý mượn sách với frontend Vue.js, backend Express.js trên Node.js và cơ sở dữ liệu MongoDB. Các chức năng cụ thể sẽ được triển khai và cập nhật theo tiến độ thực hiện đồ án.
