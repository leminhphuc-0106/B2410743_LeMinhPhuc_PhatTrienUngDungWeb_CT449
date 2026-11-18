const { ObjectId } = require("mongodb");
const { removeUndefined } = require("../utils/mongo.util");

class PublisherService {
  constructor(client) {
    this.Publisher = client.db().collection("NhaXuatBan");
  }

  extractPublisherData(payload) {
    return removeUndefined({
      TenNXB: payload.TenNXB?.trim(),
      DiaChi: payload.DiaChi,
    });
  }

  async create(payload) {
    const publisher = this.extractPublisherData(payload);

    const existing = await this.Publisher.findOne({
      TenNXB: publisher.TenNXB,
    });

    if (existing) {
      return await this.update(existing.MaNXB, publisher);
    }

    publisher.MaNXB = new ObjectId();

    const result = await this.Publisher.insertOne(publisher);

    return { _id: result.insertedId, ...publisher };
  }

  async find(filter = {}) {
    return await this.Publisher.find(filter).toArray();
  }

  async findByName(name) {
    return await this.Publisher.find({
      TenNXB: { $regex: new RegExp(name, "i") },
    }).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Publisher.findOne({ MaNXB: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const update = this.extractPublisherData(payload);

    if (Object.keys(update).length === 0) {
      return await this.findById(id);
    }

    return await this.Publisher.findOneAndUpdate(
      { MaNXB: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Publisher.findOneAndDelete({
      MaNXB: new ObjectId(id),
    });
  }

  async deleteAll() {
    const result = await this.Publisher.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Publisher.find({}).toArray();
  }
}

module.exports = PublisherService;
