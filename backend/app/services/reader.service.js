const { ObjectId } = require("mongodb");
const { toDate, removeUndefined } = require("../utils/mongo.util");

class ReaderService {
  constructor(client) {
    this.Reader = client.db().collection("DocGia");
  }

  extractReaderData(payload) {
    return removeUndefined({
      HoLot: payload.HoLot?.trim(),
      Ten: payload.Ten?.trim(),
      NgaySinh: toDate(payload.NgaySinh),
      Phai: payload.Phai,
      DiaChi: payload.DiaChi,
      DienThoai: payload.DienThoai,
      Email: payload.Email?.trim().toLowerCase(),
      MatKhau: payload.MatKhau,
    });
  }

  async create(payload) {
    const reader = this.extractReaderData(payload);

    reader.MaDocGia = new ObjectId();

    const result = await this.Reader.insertOne(reader);

    return { _id: result.insertedId, ...reader };
  }

  async find(filter = {}) {
    return await this.Reader.find(filter).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Reader.findOne({ MaDocGia: new ObjectId(id) });
  }

  async findByEmail(Email) {
    if (!Email) return null;

    return await this.Reader.findOne({
      Email: Email.trim().toLowerCase(),
    });
  }

  async findByName(name) {
    return await this.Reader.find({
      $or: [
        { HoLot: { $regex: name, $options: "i" } },
        { Ten: { $regex: name, $options: "i" } },
      ],
    }).toArray();
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const update = this.extractReaderData(payload);

    delete update.MatKhau;

    if (Object.keys(update).length === 0) {
      return await this.findById(id);
    }

    return await this.Reader.findOneAndUpdate(
      { MaDocGia: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Reader.findOneAndDelete({
      MaDocGia: new ObjectId(id),
    });
  }

  async findAll() {
    return await this.Reader.find({}).toArray();
  }

  async deleteAll() {
    const result = await this.Reader.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = ReaderService;
