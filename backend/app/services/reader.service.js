const { ObjectId } = require("mongodb");

class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("DocGia");
  }

  // Lọc dữ liệu được phép lưu
  extractReaderData(payload) {
    const reader = {
      HoLot: payload.HoLot,
      Ten: payload.Ten,
      NgaySinh: payload.NgaySinh
        ? new Date(payload.NgaySinh)
        : null,
      Phai: payload.Phai,
      DiaChi: payload.DiaChi,
      DienThoai: payload.DienThoai,
      Email: payload.Email?.trim().toLowerCase(),
      MatKhau: payload.MatKhau,
    };

    Object.keys(reader).forEach((key) => {
      if (reader[key] === undefined) {
        delete reader[key];
      }
    });

    return reader;
  }

  // Thêm độc giả
  async create(payload) {
    const reader = this.extractReaderData(payload);

    const result = await this.Reader.insertOne(reader);

    return {
      _id: result.insertedId,
      ...reader,
    };
  }

  // Tìm độc giả theo điều kiện
  async find(filter) {
    return await this.Reader.find(filter).toArray();
  }

  // Tìm độc giả theo ID
  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Reader.findOne({
      _id: new ObjectId(id),
    });
  }

  // Tìm độc giả theo email
  async findByEmail(Email) {
    if (!Email) return null;

    return await this.Reader.findOne({
      Email: Email.trim().toLowerCase(),
    });
  }

  // Tìm độc giả theo tên
  async findByName(name) {
    return await this.Reader.find({
      $or: [
        { HoLot: { $regex: name, $options: "i" } },
        { Ten: { $regex: name, $options: "i" } },
      ],
    }).toArray();
  }

  // Cập nhật thông tin độc giả
  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const updateData = this.extractReaderData(payload);

    // Không cho phép thay đổi mật khẩu thông qua API cập nhật thông tin
    delete updateData.MatKhau;

    return await this.Reader.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );
  }

  // Xóa một độc giả
  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Reader.findOneAndDelete({
      _id: new ObjectId(id),
    });
  }

  // Lấy toàn bộ độc giả
  async findAll() {
    return await this.Reader.find({}).toArray();
  }

  // Xóa toàn bộ độc giả
  async deleteAll() {
    const result = await this.Reader.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = ReaderService;
