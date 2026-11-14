const { ObjectId } = require("mongodb");

class BorrowService {
  constructor(client) {
    const db = client.db();

    this.Borrow = db.collection("TheoDoiMuonSach");
    this.Book = db.collection("Sach");
    this.User = db.collection("Docgia");
    this.Counter = db.collection("Counters");
  }

  // Kiểm tra và chuyển đổi sang ObjectId
  toObjectId(value, fieldName) {
    if (value instanceof ObjectId) return value;

    if (!ObjectId.isValid(value)) {
      throw new Error(`${fieldName} không hợp lệ`);
    }

    return new ObjectId(value);
  }

  // Trích xuất và chuẩn hóa dữ liệu theo schema TheoDoiMuonSach
  extractBorrowData(payload) {
    const borrow = {
      MaDocGia: this.toObjectId(payload.MaDocGia, "Mã độc giả"),
      MaSach: this.toObjectId(payload.MaSach, "Mã sách"),
      MaNV: this.toObjectId(payload.MaNV, "Mã nhân viên"),
      NgayMuon: payload.NgayMuon
        ? new Date(payload.NgayMuon)
        : new Date(),
      NgayTra: payload.NgayTra
        ? new Date(payload.NgayTra)
        : null,
    };

    if (Number.isNaN(borrow.NgayMuon.getTime())) {
      throw new Error("Ngày mượn không hợp lệ");
    }

    if (borrow.NgayTra && Number.isNaN(borrow.NgayTra.getTime())) {
      throw new Error("Ngày trả không hợp lệ");
    }

    return borrow;
  }

  // Tạo mã theo dõi mượn sách tự tăng
  async getNextBorrowId() {
    const result = await this.Counter.findOneAndUpdate(
      { _id: "MaTheoDoi" },
      { $inc: { sequence_value: 1 } },
      {
        upsert: true,
        returnDocument: "after",
      }
    );

    return result.sequence_value;
  }

  // Tạo phiếu mượn sách
  async create(payload) {
    const borrow = this.extractBorrowData(payload);

    // Kiểm tra độc giả tồn tại
    const user = await this.User.findOne({
      _id: borrow.MaDocGia,
    });

    if (!user) {
      throw new Error("Không tìm thấy độc giả");
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.bi_khoa) {
      throw new Error("Tài khoản độc giả đang bị khóa");
    }

    // Kiểm tra sách tồn tại
    const book = await this.Book.findOne({
      _id: borrow.MaSach,
    });

    if (!book) {
      throw new Error("Không tìm thấy sách");
    }

    // Kiểm tra số lượng sách
    if (typeof book.so_luong === "number" && book.so_luong < 1) {
      throw new Error("Sách hiện không còn bản để mượn");
    }

    // Sinh mã theo dõi
    borrow.MaTheoDoi = await this.getNextBorrowId();

    const result = await this.Borrow.insertOne(borrow);

    // Giảm số lượng sách trong kho
    if (typeof book.so_luong === "number") {
      await this.Book.updateOne(
        { _id: book._id },
        { $inc: { so_luong: -1 } }
      );
    }

    return {
      acknowledged: result.acknowledged,
      insertedId: result.insertedId,
      MaTheoDoi: borrow.MaTheoDoi,
    };
  }

  // Tìm kiếm danh sách phiếu mượn theo điều kiện
  async find(filter = {}) {
    return await this.Borrow.find(filter).toArray();
  }

  // Tìm phiếu mượn theo mã theo dõi
  async findById(id) {
    const borrowId = Number(id);

    if (!Number.isInteger(borrowId)) {
      return null;
    }

    return await this.Borrow.findOne({
      MaTheoDoi: borrowId,
    });
  }

  // Tìm phiếu mượn kèm thông tin độc giả và sách
  async findWithDetails(filter = {}) {
    const pipeline = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "Docgia",
          localField: "MaDocGia",
          foreignField: "_id",
          as: "docgia",
        },
      },
      {
        $unwind: {
          path: "$docgia",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "Sach",
          localField: "MaSach",
          foreignField: "_id",
          as: "sach",
        },
      },
      {
        $unwind: {
          path: "$sach",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          MaTheoDoi: 1,
          MaDocGia: 1,
          MaSach: 1,
          MaNV: 1,
          NgayMuon: 1,
          NgayTra: 1,

          "docgia._id": 1,
          "docgia.ho_ten": 1,
          "docgia.email": 1,

          "sach._id": 1,
          "sach.ten_sach": 1,
          "sach.don_gia": 1,
        },
      },
    ];

    return await this.Borrow.aggregate(pipeline).toArray();
  }

  // Trả sách và cập nhật ngày trả
  async returnBook(id, ngayTra = new Date()) {
    const borrow = await this.findById(id);

    if (!borrow) {
      return null;
    }

    // Kiểm tra sách đã được trả chưa
    if (borrow.NgayTra) {
      return borrow;
    }

    const returnDate = new Date(ngayTra);

    if (Number.isNaN(returnDate.getTime())) {
      throw new Error("Ngày trả không hợp lệ");
    }

    const result = await this.Borrow.findOneAndUpdate(
      {
        MaTheoDoi: Number(id),
        NgayTra: null,
      },
      {
        $set: {
          NgayTra: returnDate,
        },
      },
      {
        returnDocument: "after",
      }
    );

    // Cập nhật lại số lượng sách trong kho
    if (result) {
      await this.Book.updateOne(
        { _id: borrow.MaSach },
        { $inc: { so_luong: 1 } }
      );
    }

    return result;
  }

  // Cập nhật thông tin phiếu mượn
  async update(id, payload) {
    const borrowId = Number(id);

    if (!Number.isInteger(borrowId)) {
      return null;
    }

    const updateData = {};

    if (payload.MaDocGia !== undefined) {
      updateData.MaDocGia = this.toObjectId(
        payload.MaDocGia,
        "Mã độc giả"
      );
    }

    if (payload.MaSach !== undefined) {
      updateData.MaSach = this.toObjectId(
        payload.MaSach,
        "Mã sách"
      );
    }

    if (payload.MaNV !== undefined) {
      updateData.MaNV = this.toObjectId(
        payload.MaNV,
        "Mã nhân viên"
      );
    }

    if (payload.NgayMuon !== undefined) {
      updateData.NgayMuon = new Date(payload.NgayMuon);

      if (Number.isNaN(updateData.NgayMuon.getTime())) {
        throw new Error("Ngày mượn không hợp lệ");
      }
    }

    if (payload.NgayTra !== undefined) {
      updateData.NgayTra = payload.NgayTra
        ? new Date(payload.NgayTra)
        : null;

      if (
        updateData.NgayTra &&
        Number.isNaN(updateData.NgayTra.getTime())
      ) {
        throw new Error("Ngày trả không hợp lệ");
      }
    }

    if (Object.keys(updateData).length === 0) {
      return await this.findById(borrowId);
    }

    return await this.Borrow.findOneAndUpdate(
      { MaTheoDoi: borrowId },
      { $set: updateData },
      { returnDocument: "after" }
    );
  }

  // Xóa phiếu mượn
  async delete(id) {
    const borrow = await this.findById(id);

    if (!borrow) {
      return null;
    }

    const result = await this.Borrow.findOneAndDelete({
      MaTheoDoi: Number(id),
    });

    // Nếu chưa trả sách thì hoàn lại số lượng trong kho
    if (result && !borrow.NgayTra) {
      await this.Book.updateOne(
        { _id: borrow.MaSach },
        { $inc: { so_luong: 1 } }
      );
    }

    return result;
  }

  // Xóa tất cả phiếu mượn
  async deleteAll() {
    const result = await this.Borrow.deleteMany({});
    return result.deletedCount;
  }

  // Lấy tất cả phiếu mượn
  async findAll() {
    return await this.Borrow.find({}).toArray();
  }
}

module.exports = BorrowService;