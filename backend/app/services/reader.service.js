const { ObjectId } = require("mongodb");

class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("docgia");
  }

  // Lọc dữ liệu được phép lưu
  extractReaderData(payload) {
    const reader = {
      ho_lot: payload.ho_lot,
      ten: payload.ten,
      ngay_sinh: payload.ngay_sinh
        ? new Date(payload.ngay_sinh)
        : null,
      phai: payload.phai,
      dia_chi: payload.dia_chi,
      dien_thoai: payload.dien_thoai,
      email: payload.email?.trim().toLowerCase(),
      mat_khau: payload.mat_khau,
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
  async findByEmail(email) {
    if (!email) return null;

    return await this.Reader.findOne({
      email: email.trim().toLowerCase(),
    });
  }

  // Tìm độc giả theo tên
  async findByName(name) {
    return await this.Reader.find({
      $or: [
        { ho_lot: { $regex: name, $options: "i" } },
        { ten: { $regex: name, $options: "i" } },
      ],
    }).toArray();
  }

  // Cập nhật thông tin độc giả
  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const updateData = this.extractReaderData(payload);

    // Không cho phép thay đổi mật khẩu thông qua API cập nhật thông tin
    delete updateData.mat_khau;

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
