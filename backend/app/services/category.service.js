const { ObjectId } = require("mongodb");

class CategoryService {
  constructor(client) {
    this.Category = client.db().collection("TheLoai");
  }

  // Trích xuất và chuẩn hóa dữ liệu thể loại theo schema
  extractCategoryData(payload) {
    const category = {
      TenTheLoai: payload.TenTheLoai,
      MoTa: payload.MoTa,
    };

    // Xóa các trường có giá trị undefined
    Object.keys(category).forEach(
      (key) => category[key] === undefined && delete category[key]
    );

    return category;
  }

  // Tạo mới hoặc cập nhật thể loại nếu tên đã tồn tại
  async create(payload) {
    const category = this.extractCategoryData(payload);

    const result = await this.Category.findOneAndUpdate(
      { TenTheLoai: category.TenTheLoai },
      {
        $set: category,
        $setOnInsert: {
          MaTheLoai: new ObjectId(),
        },
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    return result;
  }

  // Tìm kiếm thể loại theo điều kiện
  async find(filter) {
    const cursor = await this.Category.find(filter);
    return await cursor.toArray();
  }

  // Tìm thể loại theo tên
  async findByName(name) {
    return await this.find({
      TenTheLoai: { $regex: new RegExp(name, "i") },
    });
  }

  // Tìm thể loại theo mã
  async findById(id) {
    return await this.Category.findOne({
      MaTheLoai: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  // Cập nhật thông tin thể loại
  async update(id, payload) {
    const filter = {
      MaTheLoai: ObjectId.isValid(id) ? new ObjectId(id) : null,
    };

    const update = this.extractCategoryData(payload);

    const result = await this.Category.findOneAndUpdate(
      filter,
      { $set: update },
      { returnDocument: "after" }
    );

    return result;
  }

  // Xóa thể loại theo mã
  async delete(id) {
    const result = await this.Category.findOneAndDelete({
      MaTheLoai: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    return result;
  }

  // Xóa tất cả thể loại
  async deleteAll() {
    const result = await this.Category.deleteMany({});
    return result.deletedCount;
  }

  // Lấy danh sách tất cả thể loại
  async findAll() {
    try {
      return await this.Category.find({}).toArray();
    } catch (error) {
      console.error("Error in findAll:", error);
      throw error;
    }
  }
}

module.exports = CategoryService;