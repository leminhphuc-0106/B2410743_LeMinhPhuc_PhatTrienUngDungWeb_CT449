const { ObjectId } = require("mongodb");
const { toObjectId, toDate, toNumber, removeUndefined } = require("../utils/mongo.util");

const DEFAULT_STATUS = "Chưa thanh toán";

class FineService {
  constructor(client) {
    this.Fine = client.db().collection("PhieuPhat");
  }

  extractFineData(payload) {
    return removeUndefined({
      MaNV: toObjectId(payload.MaNV) ?? undefined,
      MaSach: toObjectId(payload.MaSach) ?? undefined,
      MaDocGia: toObjectId(payload.MaDocGia) ?? undefined,
      NgayPhat: toDate(payload.NgayPhat),
      LyDoPhat: payload.LyDoPhat,
      SoTienPhat: toNumber(payload.SoTienPhat),
      TrangThaiThanhToan: payload.TrangThaiThanhToan,
    });
  }

  async create(payload) {
    const fine = this.extractFineData(payload);

    fine.MaPhat = new ObjectId();

    if (fine.NgayPhat === undefined) fine.NgayPhat = new Date();
    if (fine.SoTienPhat === undefined) fine.SoTienPhat = 0;
    if (fine.TrangThaiThanhToan === undefined) {
      fine.TrangThaiThanhToan = DEFAULT_STATUS;
    }

    const result = await this.Fine.insertOne(fine);

    return { _id: result.insertedId, ...fine };
  }

  async find(filter = {}) {
    return await this.Fine.find(filter).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Fine.findOne({ MaPhat: new ObjectId(id) });
  }

  async findByReaderId(MaDocGia) {
    const maDocGia = toObjectId(MaDocGia);

    if (!maDocGia) {
      throw new Error("Mã độc giả không hợp lệ");
    }

    return await this.find({ MaDocGia: maDocGia });
  }

  async findByBookId(MaSach) {
    const maSach = toObjectId(MaSach);

    if (!maSach) {
      throw new Error("Mã sách không hợp lệ");
    }

    return await this.find({ MaSach: maSach });
  }

  async findByEmployeeId(MaNV) {
    const maNV = toObjectId(MaNV);

    if (!maNV) {
      throw new Error("Mã nhân viên không hợp lệ");
    }

    return await this.find({ MaNV: maNV });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const update = this.extractFineData(payload);

    delete update.MaPhat;

    if (Object.keys(update).length === 0) {
      return await this.findById(id);
    }

    return await this.Fine.findOneAndUpdate(
      { MaPhat: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Fine.findOneAndDelete({
      MaPhat: new ObjectId(id),
    });
  }

  async deleteAll() {
    const result = await this.Fine.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Fine.aggregate([
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
          MaPhat: 1,
          MaNV: 1,
          MaSach: 1,
          MaDocGia: 1,
          NgayPhat: 1,
          LyDoPhat: 1,
          SoTienPhat: 1,
          TrangThaiThanhToan: 1,
          HoLot: "$docGia.HoLot",
          Ten: "$docGia.Ten",
          Email: "$docGia.Email",
          DienThoai: "$docGia.DienThoai",
          TenSach: "$sach.TenSach",
          HoTenNV: "$nhanVien.HoTenNV",
        },
      },
      { $sort: { NgayPhat: -1 } },
    ]).toArray();
  }

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

  async getUnpaidCount() {
    return await this.Fine.countDocuments({
      TrangThaiThanhToan: DEFAULT_STATUS,
    });
  }
}

module.exports = FineService;
