const { ObjectId } = require("mongodb");
const { removeUndefined } = require("../utils/mongo.util");

class StaffService {
  constructor(client) {
    this.Staff = client.db().collection("NhanVien");
  }

  extractStaffData(payload) {
    return removeUndefined({
      HoTenNV: payload.HoTenNV?.trim(),
      Email: payload.Email?.trim().toLowerCase(),
      Password: payload.Password,
      ChucVu: payload.ChucVu,
      Diachi: payload.Diachi,
      SoDienThoai: payload.SoDienThoai,
    });
  }

  async create(payload) {
    const staff = this.extractStaffData(payload);

    staff.MSNV = new ObjectId();

    const result = await this.Staff.insertOne(staff);

    return { _id: result.insertedId, ...staff };
  }

  async find(filter = {}) {
    return await this.Staff.find(filter).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Staff.findOne({ MSNV: new ObjectId(id) });
  }

  async findByEmail(Email) {
    if (!Email) return null;

    return await this.Staff.findOne({
      Email: Email.trim().toLowerCase(),
    });
  }

  async findByName(name) {
    return await this.Staff.find({
      HoTenNV: { $regex: name, $options: "i" },
    }).toArray();
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const update = this.extractStaffData(payload);

    delete update.Password;

    if (Object.keys(update).length === 0) {
      return await this.findById(id);
    }

    return await this.Staff.findOneAndUpdate(
      { MSNV: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Staff.findOneAndDelete({
      MSNV: new ObjectId(id),
    });
  }

  async findAll() {
    return await this.Staff.find({}).toArray();
  }

  async deleteAll() {
    const result = await this.Staff.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = StaffService;
