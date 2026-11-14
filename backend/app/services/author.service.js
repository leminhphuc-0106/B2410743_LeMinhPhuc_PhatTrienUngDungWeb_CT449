const { ObjectId } = require("mongodb");

class AuthorService {
  constructor(client) {
    this.Author = client.db().collection("TacGia"); // Khởi tạo collection tác giả trong MongoDB
  }

  // Lọc và lấy các trường dữ liệu hợp lệ từ payload
  extractAuthorData(payload) {
    const author = {
      TenTG: payload.TenTG,
      QuocTich: payload.QuocTich,
    };

    // Xoá các trường undefined
    Object.keys(author).forEach(
      (key) => author[key] === undefined && delete author[key]
    );
    return author;
  }

  // Thêm tác giả mới hoặc cập nhật thông tin nếu tác giả đã tồn tại
  async create(payload) {
    const author = this.extractAuthorData(payload);
    const result = await this.Author.findOneAndUpdate(
      { TenTG: author.TenTG }, // Tìm theo tên tác giả
      { $set: author }, // Cập nhật các trường author
      { upsert: true, returnDocument: "after" } // Tạo mới nếu chưa có
    );
    return result;
  }

  // Tìm kiếm danh sách tác giả theo điều kiện lọc
  async find(filter) {
    const cursor = await this.Author.find(filter);
    return await cursor.toArray();
  }

  // Tìm kiếm tác giả theo tên, không phân biệt chữ hoa và chữ thường
  async findByName(name) {
    return await this.find({
      TenTG: { $regex: new RegExp(name, "i") },
    });
  }

  // Tìm tác giả theo mã định danh ObjectId
  async findById(id) {
    return await this.Author.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Cập nhật thông tin tác giả theo ID
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractAuthorData(payload);
    const result = await this.Author.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  // Xóa thông tin tác giả theo ID
  async delete(id) {
    const result = await this.Author.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // Xóa toàn bộ tác giả trong collection và trả về số lượng đã xóa
  async deleteAll() {
    const result = await this.Author.deleteMany({});
    return result.deletedCount;
  }

  // Lấy toàn bộ danh sách tác giả trong collection
  async findAll() {
    try {
      return await this.Author.find({}).toArray();
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }
}

module.exports = AuthorService;
