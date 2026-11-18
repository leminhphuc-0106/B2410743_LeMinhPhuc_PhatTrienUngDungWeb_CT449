const { removeUndefined } = require("../utils/mongo.util");

class AuthorService {
  constructor(client) {
    this.Author = client.db().collection("TacGia");
    this.Counter = client.db().collection("Counters");
  }

  extractAuthorData(payload) {
    return removeUndefined({
      TenTG: payload.TenTG?.trim(),
      QuocTich: payload.QuocTich,
    });
  }

  async getNextMaTG() {
    const result = await this.Counter.findOneAndUpdate(
      { _id: "MaTG" },
      { $inc: { sequence_value: 1 } },
      { upsert: true, returnDocument: "after" }
    );

    return result.sequence_value;
  }

  async create(payload) {
    const author = this.extractAuthorData(payload);

    const existing = await this.Author.findOne({ TenTG: author.TenTG });

    if (existing) {
      return await this.update(existing.MaTG, author);
    }

    author.MaTG = await this.getNextMaTG();

    const result = await this.Author.insertOne(author);

    return { _id: result.insertedId, ...author };
  }

  async find(filter = {}) {
    return await this.Author.find(filter).toArray();
  }

  async findByName(name) {
    return await this.Author.find({
      TenTG: { $regex: new RegExp(name, "i") },
    }).toArray();
  }

  async findById(id) {
    const maTG = Number(id);

    if (!Number.isInteger(maTG)) return null;

    return await this.Author.findOne({ MaTG: maTG });
  }

  async update(id, payload) {
    const maTG = Number(id);

    if (!Number.isInteger(maTG)) return null;

    const update = this.extractAuthorData(payload);

    if (Object.keys(update).length === 0) {
      return await this.findById(maTG);
    }

    return await this.Author.findOneAndUpdate(
      { MaTG: maTG },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    const maTG = Number(id);

    if (!Number.isInteger(maTG)) return null;

    return await this.Author.findOneAndDelete({ MaTG: maTG });
  }

  async deleteAll() {
    const result = await this.Author.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Author.find({}).sort({ MaTG: 1 }).toArray();
  }
}

module.exports = AuthorService;
