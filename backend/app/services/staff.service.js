const { ObjectId } = require("mongodb");

class StaffService {
  constructor(client) {
    this.Staff = client.db().collection("nhanvien");
  }

  // Lọc dữ liệu được phép lưu
  extractStaffData(payload) {
    const staff = {
      ho_ten_nv: payload.ho_ten_nv,
      email: payload.email?.trim().toLowerCase(),
      mat_khau: payload.mat_khau,
      chuc_vu: payload.chuc_vu,
      dia_chi: payload.dia_chi,
      so_dien_thoai: payload.so_dien_thoai,
    };

    Object.keys(staff).forEach((key) => {
      if (staff[key] === undefined) {
        delete staff[key];
      }
    });

    return staff;
  }

  // Thêm nhân viên
  async create(payload) {
    const staff = this.extractStaffData(payload);

    const result = await this.Staff.insertOne(staff);

    return {
      _id: result.insertedId,
      ...staff,
    };
  }

  // Tìm nhân viên theo điều kiện
  async find(filter) {
    return await this.Staff.find(filter).toArray();
  }

  // Tìm nhân viên theo ID
  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Staff.findOne({
      _id: new ObjectId(id),
    });
  }

  // Tìm nhân viên theo email
  async findByEmail(email) {
    if (!email) return null;

    return await this.Staff.findOne({
      email: email.trim().toLowerCase(),
    });
  }

  // Tìm nhân viên theo tên
  async findByName(name) {
    return await this.Staff.find({
      ho_ten_nv: { $regex: name, $options: "i" },
    }).toArray();
  }

  // Cập nhật thông tin nhân viên
  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const updateData = this.extractStaffData(payload);

    // Không cho phép thay đổi mật khẩu qua API cập nhật thông tin
    delete updateData.mat_khau;

    return await this.Staff.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );
  }

  // Xóa một nhân viên
  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Staff.findOneAndDelete({
      _id: new ObjectId(id),
    });
  }

  // Lấy toàn bộ nhân viên
  async findAll() {
    return await this.Staff.find({}).toArray();
  }

  // Xóa toàn bộ nhân viên
  async deleteAll() {
    const result = await this.Staff.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = StaffService;
