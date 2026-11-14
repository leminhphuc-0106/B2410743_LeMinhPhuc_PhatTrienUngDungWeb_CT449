const { ObjectId } = require("mongodb");

class BookService {
  constructor(client) {
    this.Borrow = client.db().collection("TheoDoiMuonSach");
    this.Book = client.db().collection("Sach");
  }

  // Trích xuất và chuẩn hóa dữ liệu sách theo schema
  extractBookData(payload) {
    const book = {
      TenSach: payload.TenSach,
      DonGia:
        payload.DonGia !== undefined
          ? Number(payload.DonGia)
          : undefined,
      SoQuyen:
        payload.SoQuyen !== undefined
          ? Number(payload.SoQuyen)
          : undefined,
      NamXuatBan:
        payload.NamXuatBan !== undefined
          ? Number(payload.NamXuatBan)
          : undefined,
      MaNXB: payload.MaNXB
        ? new ObjectId(payload.MaNXB)
        : undefined,
      TacGia:
        payload.TacGia !== undefined
          ? Number(payload.TacGia)
          : undefined,
      MaTheLoai: payload.MaTheLoai
        ? new ObjectId(payload.MaTheLoai)
        : undefined,
    };

    // Loại bỏ các trường undefined
    Object.keys(book).forEach(
      (key) => book[key] === undefined && delete book[key]
    );

    return book;
  }

  // Thêm sách mới hoặc cập nhật thông tin nếu sách đã tồn tại
  async create(payload) {
    const book = this.extractBookData(payload);

    if (book.DonGia === undefined) book.DonGia = 0;
    if (book.SoQuyen === undefined) book.SoQuyen = 1;

    const result = await this.Book.findOneAndUpdate(
      { TenSach: book.TenSach, MaNXB: book.MaNXB },
      { $set: book },
      { returnDocument: "after", upsert: true }
    );

    return result;
  }

  // Tìm kiếm danh sách sách theo điều kiện lọc
  async find(filter) {
    const cursor = await this.Book.find(filter);
    return await cursor.toArray();
  }

  // Tìm kiếm sách theo tên, không phân biệt chữ hoa và chữ thường
  async findByTitle(TenSach) {
    return await this.find({
      TenSach: { $regex: new RegExp(TenSach, "i") },
    });
  }

  // Tìm thông tin sách theo ID và kết hợp dữ liệu nhà xuất bản, thể loại
  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    const result = await this.Book.aggregate([
      {
        $match: { _id: new ObjectId(id) },
      },
      {
        $lookup: {
          from: "NhaXuatBan",
          localField: "MaNXB",
          foreignField: "_id",
          as: "nha_xuat_ban",
        },
      },
      {
        $unwind: {
          path: "$nha_xuat_ban",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "TheLoai",
          localField: "MaTheLoai",
          foreignField: "_id",
          as: "the_loai",
        },
      },
      {
        $unwind: {
          path: "$the_loai",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]).toArray();

    return result[0] || null;
  }

  // Cập nhật thông tin sách theo ID
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractBookData(payload);

    const result = await this.Book.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  // Xóa sách theo ID sau khi kiểm tra tình trạng mượn sách
  async delete(id) {
    const bookId = ObjectId.isValid(id) ? new ObjectId(id) : null;

    if (!bookId) {
      throw new Error("ID không hợp lệ.");
    }

    // Kiểm tra xem sách đã được mượn hay chưa
    const borrowed = await this.Borrow.findOne({ MaSach: bookId });

    if (borrowed) {
      throw new Error("Không thể xóa sách vì đã được mượn.");
    }

    // Nếu chưa được mượn, tiến hành xóa
    const result = await this.Book.findOneAndDelete({ _id: bookId });

    if (!result) {
      throw new Error("Không tìm thấy sách để xóa.");
    }

    return result;
  }

  // Xóa toàn bộ sách trong collection và trả về số lượng đã xóa
  async deleteAll() {
    const result = await this.Book.deleteMany({});
    return result.deletedCount;
  }

  // Lấy danh sách sách và lọc theo thể loại nếu có
  async findAll(MaTheLoai) {
    try {
      const matchStage = {};

      if (MaTheLoai) {
        matchStage.MaTheLoai = new ObjectId(MaTheLoai);
      }

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "NhaXuatBan",
            localField: "MaNXB",
            foreignField: "_id",
            as: "nha_xuat_ban",
          },
        },
        {
          $unwind: {
            path: "$nha_xuat_ban",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "TheLoai",
            localField: "MaTheLoai",
            foreignField: "_id",
            as: "the_loai",
          },
        },
        {
          $unwind: {
            path: "$the_loai",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            TenSach: 1,
            DonGia: 1,
            SoQuyen: 1,
            NamXuatBan: 1,
            MaNXB: 1,
            TacGia: 1,
            MaTheLoai: 1,
            TenNXB: "$nha_xuat_ban.TenNXB",
            TenTheLoai: "$the_loai.TenTheLoai",
          },
        },
      ];

      return await this.Book.aggregate(pipeline).toArray();
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }

  // Lấy danh sách sách kèm thông tin nhà xuất bản và thể loại
  async findWithDetails(filter = {}) {
    const pipeline = [
      {
        $match: filter,
      },
      {
        $lookup: {
          from: "NhaXuatBan",
          localField: "MaNXB",
          foreignField: "_id",
          as: "nha_xuat_ban",
        },
      },
      {
        $unwind: {
          path: "$nha_xuat_ban",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "TheLoai",
          localField: "MaTheLoai",
          foreignField: "_id",
          as: "the_loai",
        },
      },
      {
        $unwind: {
          path: "$the_loai",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          TenSach: 1,
          DonGia: 1,
          SoQuyen: 1,
          NamXuatBan: 1,
          MaNXB: 1,
          TacGia: 1,
          MaTheLoai: 1,
          TenNXB: "$nha_xuat_ban.TenNXB",
          TenTheLoai: "$the_loai.TenTheLoai",
        },
      },
    ];

    return await this.Book.aggregate(pipeline).toArray();
  }
}

module.exports = BookService;
