
const { ObjectId } = require("mongodb");

class FineService {
  constructor(client) {
    this.Fine = client.db().collection("PhieuPhat");
    this.User = client.db().collection("Docgia");
    this.Book = client.db().collection("Sach");
    this.Employee = client.db().collection("NhanVien");
  }

  // Trích xuất và chuẩn hóa dữ liệu phiếu phạt theo schema
  extractFineData(payload) {
    const fine = {
      MaNV: payload.MaNV,
      MaSach: payload.MaSach,
      MaDocGia: payload.MaDocGia,
      NgayPhat: payload.NgayPhat,
      LyDoPhat: payload.LyDoPhat,
      SoTienPhat: payload.SoTienPhat,
      TrangThaiThanhToan: payload.TrangThaiThanhToan,
    };

    // Chuyển các mã liên kết sang ObjectId
    ["MaNV", "MaSach", "MaDocGia"].forEach((key) => {
      if (fine[key] !== undefined && ObjectId.isValid(fine[key])) {
        fine[key] = new ObjectId(fine[key]);
      }
    });

    // Chuyển ngày phạt sang kiểu Date
    if (fine.NgayPhat !== undefined) {
      fine.NgayPhat = new Date(fine.NgayPhat);
    }

    // Chuyển số tiền phạt sang kiểu Number
    if (fine.SoTienPhat !== undefined) {
      fine.SoTienPhat = Number(fine.SoTienPhat);
    }

    // Xóa các trường có giá trị undefined
    Object.keys(fine).forEach(
      (key) => fine[key] === undefined && delete fine[key]
    );

    return fine;
  }

  // Tạo phiếu phạt mới
  async create(payload) {
    const fine = this.extractFineData(payload);

    // Tạo mã phiếu phạt
    fine.MaPhat = new ObjectId();

    await this.Fine.insertOne(fine);

    return fine;
  }

  // Tìm kiếm phiếu phạt theo điều kiện
  async find(filter) {
    const cursor = await this.Fine.find(filter);
    return await cursor.toArray();
  }

  // Tìm phiếu phạt theo mã
  async findById(id) {
    return await this.Fine.findOne({
      MaPhat: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Tìm phiếu phạt theo mã độc giả
  async findByUserId(userId) {
    return await this.Fine.find({
      MaDocGia: ObjectId.isValid(userId)
        ? new ObjectId(userId)
        : null,
    }).toArray();
  }

  // Tìm phiếu phạt theo mã sách
  async findByBookId(bookId) {
    return await this.Fine.find({
      MaSach: ObjectId.isValid(bookId)
        ? new ObjectId(bookId)
        : null,
    }).toArray();
  }

  // Tìm phiếu phạt theo mã nhân viên
  async findByEmployeeId(employeeId) {
    return await this.Fine.find({
      MaNV: ObjectId.isValid(employeeId)
        ? new ObjectId(employeeId)
        : null,
    }).toArray();
  }

  // Cập nhật thông tin phiếu phạt
  async update(id, payload) {
    const filter = {
      MaPhat: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractFineData(payload);

    // Không cho phép thay đổi mã phiếu phạt
    delete update.MaPhat;

    const result = await this.Fine.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  // Xóa phiếu phạt theo mã
  async delete(id) {
    return await this.Fine.findOneAndDelete({
      MaPhat: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Xóa tất cả phiếu phạt
  async deleteAll() {
    const result = await this.Fine.deleteMany({});
    return result.deletedCount;
  }

  // Lấy tất cả phiếu phạt kèm thông tin độc giả, sách và nhân viên
  async findAll() {
    const pipeline = [
      // Nối với collection Docgia
      {
        $lookup: {
          from: "Docgia",
          localField: "MaDocGia",
          foreignField: "MaDocGia",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Nối với collection Sach
      {
        $lookup: {
          from: "Sach",
          localField: "MaSach",
          foreignField: "MaSach",
          as: "book",
        },
      },
      {
        $unwind: {
          path: "$book",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Nối với collection NhanVien
      {
        $lookup: {
          from: "NhanVien",
          localField: "MaNV",
          foreignField: "MSNV",
          as: "employee",
        },
      },
      {
        $unwind: {
          path: "$employee",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Chọn các trường cần trả về
      {
        $project: {
          MaPhat: 1,
          MaNV: 1,
          MaSach: 1,
          MaDocGia: 1,
          NgayPhat: 1,
          LyDoPhat: 1,
          SoTienPhat: 1,
          TrangThaiThanhToan: 1,

          "user.HoLot": 1,
          "user.Ten": 1,
          "user.Email": 1,
          "user.DienThoai": 1,

          "book.TenSach": 1,

          "employee.HoTenNV": 1,
        },
      },

      // Sắp xếp phiếu phạt mới nhất trước
      {
        $sort: {
          NgayPhat: -1,
        },
      },
    ];

    return await this.Fine.aggregate(pipeline).toArray();
  }

  // Thống kê tổng số tiền phạt
  async getTotalFineAmount() {
    const result = await this.Fine.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$SoTienPhat" },
        },
      },
    ]).toArray();

    return result.length > 0 ? result[0].totalAmount : 0;
  }

  // Thống kê số phiếu phạt chưa thanh toán
  async getUnpaidCount() {
    return await this.Fine.countDocuments({
      TrangThaiThanhToan: "Chưa thanh toán",
    });
  }
}

module.exports = FineService;
