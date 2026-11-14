const { ObjectId } = require("mongodb");

class PublisherService {
  constructor(client) {
    this.Publisher = client.db().collection("NhaXuatBan"); // Khởi tạo collection nhà xuất bản
  }

  // Lọc và lấy các trường dữ liệu hợp lệ từ payload
  extractPublisherData(payload) {
    const publisher = {
      TenNXB: payload.TenNXB,
      DiaChi: payload.DiaChi,
    };

    // Xoá các trường undefined
    Object.keys(publisher).forEach(
      (key) => publisher[key] === undefined && delete publisher[key]
    );
    return publisher;
  }

  // Thêm nhà xuất bản mới hoặc cập nhật nếu nhà xuất bản đã tồn tại
  async create(payload) {
    const publisher = this.extractPublisherData(payload);
    const result = await this.Publisher.findOneAndUpdate(
      { TenNXB: publisher.TenNXB },
      { $set: publisher },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  // Tìm kiếm danh sách nhà xuất bản theo điều kiện lọc
  async find(filter) {
    const cursor = await this.Publisher.find(filter);
    return await cursor.toArray();
  }

  // Tìm kiếm nhà xuất bản theo tên (không phân biệt chữ hoa, chữ thường)
  async findByName(name) {
    return await this.find({
      TenNXB: { $regex: new RegExp(name, "i") },
    });
  }

  // Tìm nhà xuất bản theo ID
  async findById(id) {
    return await this.Publisher.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Cập nhật thông tin nhà xuất bản theo ID
  async update(id, payload) {
    const filter = {
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };
    const update = this.extractPublisherData(payload);
    const result = await this.Publisher.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );
    return result;
  }

  // Xóa một nhà xuất bản theo ID
  async delete(id) {
    const result = await this.Publisher.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  // Xóa toàn bộ nhà xuất bản trong collection
  async deleteAll() {
    const result = await this.Publisher.deleteMany({});
    return result.deletedCount;
  }

  // Lấy toàn bộ danh sách nhà xuất bản
  async findAll() {
    try {
      return await this.Publisher.find({}).toArray();
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }
}

module.exports = PublisherService;
