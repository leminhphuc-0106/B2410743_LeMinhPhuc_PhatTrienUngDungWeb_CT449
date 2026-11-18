const { toObjectId, toDate, removeUndefined } = require("../utils/mongo.util");

class BorrowService {
  constructor(client) {
    this.Borrow = client.db().collection("TheoDoiMuonSach");
    this.Book = client.db().collection("Sach");
    this.Reader = client.db().collection("DocGia");
    this.Counter = client.db().collection("Counters");
  }

  requireObjectId(value, fieldName) {
    const objectId = toObjectId(value);

    if (!objectId) {
      throw new Error(`${fieldName} không hợp lệ`);
    }

    return objectId;
  }

  extractBorrowData(payload) {
    const ngayMuon = payload.NgayMuon ? toDate(payload.NgayMuon) : new Date();

    if (!ngayMuon) {
      throw new Error("Ngày mượn không hợp lệ");
    }

    let ngayTra = null;

    if (payload.NgayTra !== undefined && payload.NgayTra !== null && payload.NgayTra !== "") {
      ngayTra = toDate(payload.NgayTra);

      if (!ngayTra) {
        throw new Error("Ngày trả không hợp lệ");
      }
    }

    return removeUndefined({
      MaDocGia: this.requireObjectId(payload.MaDocGia, "Mã độc giả"),
      MaSach: this.requireObjectId(payload.MaSach, "Mã sách"),
      MaNV: payload.MaNV ? this.requireObjectId(payload.MaNV, "Mã nhân viên") : undefined,
      NgayMuon: ngayMuon,
      NgayTra: ngayTra,
    });
  }

  async getNextMaTheoDoi() {
    const result = await this.Counter.findOneAndUpdate(
      { _id: "MaTheoDoi" },
      { $inc: { sequence_value: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    return result.sequence_value;
  }

  async create(payload) {
    const borrow = this.extractBorrowData(payload);

    const reader = await this.Reader.findOne({ MaDocGia: borrow.MaDocGia });

    if (!reader) {
      throw new Error("Không tìm thấy độc giả");
    }

    const book = await this.Book.findOne({ MaSach: borrow.MaSach });

    if (!book) {
      throw new Error("Không tìm thấy sách");
    }

    if (!book.SoQuyenConLai || book.SoQuyenConLai < 1) {
      throw new Error("Sách hiện không còn bản để mượn");
    }

    borrow.MaTheoDoi = await this.getNextMaTheoDoi();

    const result = await this.Borrow.insertOne(borrow);

    await this.Book.updateOne(
      { MaSach: borrow.MaSach },
      { $inc: { SoQuyenConLai: -1 } }
    );

    return {
      acknowledged: result.acknowledged,
      insertId: result.insertedId,
      MaTheoDoi: borrow.MaTheoDoi,
    };
  }

  async find(filter = {}) {
    return await this.Borrow.find(filter).toArray();
  }

  toMaTheoDoi(id) {
    const maTheoDoi = Number(id);
    return Number.isInteger(maTheoDoi) ? maTheoDoi : null;
  }

  async findById(id) {
    const maTheoDoi = this.toMaTheoDoi(id);

    if (maTheoDoi === null) return null;

    return await this.Borrow.findOne({ MaTheoDoi: maTheoDoi });
  }

  detailPipeline(filter = {}) {
    return [
      { $match: filter },
      {
        $lookup: {
          from: "DocGia",
          localField: "MaDocGia",
          foreignField: "MaDocGia",
          as: "docGia",
        },
      },
      {
        $unwind: {
          path: "$docGia",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "Sach",
          localField: "MaSach",
          foreignField: "MaSach",
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
        $lookup: {
          from: "NhanVien",
          localField: "MaNV",
          foreignField: "MSNV",
          as: "nhanVien",
        },
      },
      {
        $unwind: {
          path: "$nhanVien",
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
          HoLot: "$docGia.HoLot",
          Ten: "$docGia.Ten",
          Email: "$docGia.Email",
          DienThoai: "$docGia.DienThoai",
          TenSach: "$sach.TenSach",
          DonGia: "$sach.DonGia",
          HoTenNV: "$nhanVien.HoTenNV",
        },
      },
      { $sort: { MaTheoDoi: -1 } },
    ];
  }

  async findWithDetails(filter = {}) {
    return await this.Borrow.aggregate(this.detailPipeline(filter)).toArray();
  }

  async findByReader(MaDocGia) {
    const maDocGia = toObjectId(MaDocGia);

    if (!maDocGia) {
      throw new Error("Mã độc giả không hợp lệ");
    }

    return await this.findWithDetails({ MaDocGia: maDocGia });
  }

  async returnBook(id, ngayTra = new Date()) {
    const maTheoDoi = this.toMaTheoDoi(id);

    if (maTheoDoi === null) return null;

    const borrow = await this.findById(maTheoDoi);

    if (!borrow) return null;

    if (borrow.NgayTra) return borrow;

    const returnDate = toDate(ngayTra);

    if (!returnDate) {
      throw new Error("Ngày trả không hợp lệ");
    }

    const result = await this.Borrow.findOneAndUpdate(
      { MaTheoDoi: maTheoDoi, NgayTra: null },
      { $set: { NgayTra: returnDate } },
      { returnDocument: "after" }
    );

    if (result) {
      await this.Book.updateOne(
        { MaSach: borrow.MaSach },
        { $inc: { SoQuyenConLai: 1 } }
      );
    }

    return result;
  }

  async update(id, payload) {
    const maTheoDoi = this.toMaTheoDoi(id);

    if (maTheoDoi === null) return null;

    const update = {};

    if (payload.MaDocGia !== undefined) {
      update.MaDocGia = this.requireObjectId(payload.MaDocGia, "Mã độc giả");
    }

    if (payload.MaSach !== undefined) {
      update.MaSach = this.requireObjectId(payload.MaSach, "Mã sách");
    }

    if (payload.MaNV !== undefined) {
      update.MaNV = this.requireObjectId(payload.MaNV, "Mã nhân viên");
    }

    if (payload.NgayMuon !== undefined) {
      update.NgayMuon = toDate(payload.NgayMuon);

      if (!update.NgayMuon) {
        throw new Error("Ngày mượn không hợp lệ");
      }
    }

    if (payload.NgayTra !== undefined) {
      update.NgayTra = payload.NgayTra ? toDate(payload.NgayTra) : null;

      if (payload.NgayTra && !update.NgayTra) {
        throw new Error("Ngày trả không hợp lệ");
      }
    }

    if (Object.keys(update).length === 0) {
      return await this.findById(maTheoDoi);
    }

    return await this.Borrow.findOneAndUpdate(
      { MaTheoDoi: maTheoDoi },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    const maTheoDoi = this.toMaTheoDoi(id);

    if (maTheoDoi === null) return null;

    const borrow = await this.findById(maTheoDoi);

    if (!borrow) return null;

    const result = await this.Borrow.findOneAndDelete({
      MaTheoDoi: maTheoDoi,
    });

    if (result && !borrow.NgayTra) {
      await this.Book.updateOne(
        { MaSach: borrow.MaSach },
        { $inc: { SoQuyenConLai: 1 } }
      );
    }

    return result;
  }

  async deleteAll() {
    const result = await this.Borrow.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Borrow.find({}).toArray();
  }
}

module.exports = BorrowService;
