const { ObjectId } = require("mongodb");
const { toObjectId, toNumber, removeUndefined } = require("../utils/mongo.util");

class BookService {
  constructor(client) {
    this.Book = client.db().collection("Sach");
    this.Borrow = client.db().collection("TheoDoiMuonSach");
  }

  extractBookData(payload) {
    return removeUndefined({
      TenSach: payload.TenSach?.trim(),
      DonGia: toNumber(payload.DonGia),
      SoQuyen: toNumber(payload.SoQuyen),
      SoQuyenConLai: toNumber(payload.SoQuyenConLai),
      NamXuatBan: toNumber(payload.NamXuatBan),
      MaNXB: toObjectId(payload.MaNXB) ?? undefined,
      TacGia: toNumber(payload.TacGia),
      MaTheLoai: toObjectId(payload.MaTheLoai) ?? undefined,
    });
  }

  async create(payload) {
    const book = this.extractBookData(payload);

    if (book.DonGia === undefined) book.DonGia = 0;
    if (book.SoQuyen === undefined) book.SoQuyen = 1;
    if (book.SoQuyenConLai === undefined) {
      book.SoQuyenConLai = book.SoQuyen;
    }

    book.MaSach = new ObjectId();

    const result = await this.Book.insertOne(book);

    return { _id: result.insertedId, ...book };
  }

  async find(filter = {}) {
    return await this.Book.find(filter).toArray();
  }

  async findByTitle(TenSach) {
    return await this.find({
      TenSach: { $regex: new RegExp(TenSach, "i") },
    });
  }

  detailPipeline(filter = {}) {
    return [
      { $match: filter },
      {
        $lookup: {
          from: "NhaXuatBan",
          localField: "MaNXB",
          foreignField: "MaNXB",
          as: "nhaXuatBan",
        },
      },
      {
        $unwind: {
          path: "$nhaXuatBan",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "TheLoai",
          localField: "MaTheLoai",
          foreignField: "MaTheLoai",
          as: "theLoai",
        },
      },
      {
        $unwind: {
          path: "$theLoai",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "TacGia",
          localField: "TacGia",
          foreignField: "MaTG",
          as: "tacGia",
        },
      },
      {
        $unwind: {
          path: "$tacGia",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          MaSach: 1,
          TenSach: 1,
          DonGia: 1,
          SoQuyen: 1,
          SoQuyenConLai: 1,
          NamXuatBan: 1,
          MaNXB: 1,
          TacGia: 1,
          MaTheLoai: 1,
          TenNXB: "$nhaXuatBan.TenNXB",
          TenTheLoai: "$theLoai.TenTheLoai",
          TenTG: "$tacGia.TenTG",
        },
      },
    ];
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    const result = await this.Book.aggregate(
      this.detailPipeline({ MaSach: new ObjectId(id) })
    ).toArray();

    return result[0] || null;
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const update = this.extractBookData(payload);

    if (Object.keys(update).length === 0) {
      return await this.findById(id);
    }

    return await this.Book.findOneAndUpdate(
      { MaSach: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ.");
    }

    const maSach = new ObjectId(id);

    const borrowed = await this.Borrow.findOne({ MaSach: maSach });

    if (borrowed) {
      throw new Error("Không thể xóa sách vì đã được mượn.");
    }

    const result = await this.Book.findOneAndDelete({ MaSach: maSach });

    if (!result) {
      throw new Error("Không tìm thấy sách để xóa.");
    }

    return result;
  }

  async deleteAll() {
    const result = await this.Book.deleteMany({});
    return result.deletedCount;
  }

  async findAll(MaTheLoai) {
    const filter = {};

    if (MaTheLoai) {
      const maTheLoai = toObjectId(MaTheLoai);

      if (!maTheLoai) {
        throw new Error("Mã thể loại không hợp lệ.");
      }

      filter.MaTheLoai = maTheLoai;
    }

    return await this.Book.aggregate(this.detailPipeline(filter)).toArray();
  }

  async findWithDetails(filter = {}) {
    return await this.Book.aggregate(this.detailPipeline(filter)).toArray();
  }
}

module.exports = BookService;
