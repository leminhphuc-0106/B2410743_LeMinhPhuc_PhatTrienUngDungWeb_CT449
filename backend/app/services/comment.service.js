
const { ObjectId } = require("mongodb");

class CommentService {
  constructor(client) {
    this.Comment = client.db().collection("DanhGiaSach");
    this.User = client.db().collection("Docgia");
    this.Book = client.db().collection("Sach");
  }

  // Trích xuất và chuẩn hóa dữ liệu đánh giá theo schema
  extractCommentData(payload) {
    const comment = {
      MaDocGia: payload.MaDocGia,
      MaSach: payload.MaSach,
      SoSao: payload.SoSao ?? 5,
      NhanXet: payload.NhanXet,
      NgayDanhGia: payload.NgayDanhGia ?? new Date(),
    };

    // Chuyển mã độc giả và mã sách thành ObjectId
    if (comment.MaDocGia && ObjectId.isValid(comment.MaDocGia)) {
      comment.MaDocGia = new ObjectId(comment.MaDocGia);
    }

    if (comment.MaSach && ObjectId.isValid(comment.MaSach)) {
      comment.MaSach = new ObjectId(comment.MaSach);
    }

    // Xóa các trường có giá trị undefined
    Object.keys(comment).forEach(
      (key) => comment[key] === undefined && delete comment[key]
    );

    return comment;
  }

  // Tạo đánh giá sách mới
  async create(payload) {
    const comment = this.extractCommentData(payload);

    // Tạo mã đánh giá
    comment.MaDanhGia = new ObjectId();

    await this.Comment.insertOne(comment);

    return comment;
  }

  // Tìm kiếm đánh giá theo điều kiện
  async find(filter) {
    const cursor = await this.Comment.find(filter);
    return await cursor.toArray();
  }

  // Tìm đánh giá theo mã sách, kèm thông tin độc giả
  async findByBookId(bookId) {
    const comments = await this.Comment.aggregate([
      {
        $match: {
          MaSach: ObjectId.isValid(bookId)
            ? new ObjectId(bookId)
            : null,
        },
      },
      {
        $lookup: {
          from: "Docgia",
          localField: "MaDocGia",
          foreignField: "MaDocGia",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          MaDanhGia: 1,
          MaDocGia: 1,
          MaSach: 1,
          NhanXet: 1,
          SoSao: 1,
          NgayDanhGia: 1,
          "user.HoLot": 1,
          "user.Ten": 1,
          "user.Email": 1,
        },
      },
    ]).toArray();

    return comments;
  }

  // Tìm đánh giá theo mã độc giả, kèm thông tin sách
  async findByUserId(userId) {
    const comments = await this.Comment.aggregate([
      {
        $match: {
          MaDocGia: ObjectId.isValid(userId)
            ? new ObjectId(userId)
            : null,
        },
      },
      {
        $lookup: {
          from: "Sach",
          localField: "MaSach",
          foreignField: "MaSach",
          as: "book",
        },
      },
      {
        $unwind: "$book",
      },
      {
        $project: {
          MaDanhGia: 1,
          MaDocGia: 1,
          MaSach: 1,
          NhanXet: 1,
          SoSao: 1,
          NgayDanhGia: 1,
          "book.TenSach": 1,
        },
      },
    ]).toArray();

    return comments;
  }

  // Tìm đánh giá theo mã
  async findById(id) {
    return await this.Comment.findOne({
      MaDanhGia: ObjectId.isValid(id)
        ? new ObjectId(id)
        : null,
    });
  }

  // Cập nhật thông tin đánh giá
  async update(id, payload) {
    const filter = {
      MaDanhGia: ObjectId.isValid(id)
        ? new ObjectId(id)
        : null,
    };

    const update = this.extractCommentData(payload);

    // Không cập nhật mã đánh giá
    delete update.MaDanhGia;

    const result = await this.Comment.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  // Xóa đánh giá theo mã
  async delete(id) {
    return await this.Comment.findOneAndDelete({
      MaDanhGia: ObjectId.isValid(id)
        ? new ObjectId(id)
        : null,
    });
  }

  // Xóa tất cả đánh giá
  async deleteAll() {
    const result = await this.Comment.deleteMany({});
    return result.deletedCount;
  }

  // Lấy tất cả đánh giá, kèm thông tin độc giả và sách
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
        $unwind: "$user",
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
        $unwind: "$book",
      },

      // Chọn các trường cần trả về
      {
        $project: {
          MaDanhGia: 1,
          MaDocGia: 1,
          MaSach: 1,
          NhanXet: 1,
          SoSao: 1,
          NgayDanhGia: 1,
          "user.HoLot": 1,
          "user.Ten": 1,
          "user.Email": 1,
          "book.TenSach": 1,
        },
      },
    ];

    return await this.Comment.aggregate(pipeline).toArray();
  }
}

module.exports = CommentService;
