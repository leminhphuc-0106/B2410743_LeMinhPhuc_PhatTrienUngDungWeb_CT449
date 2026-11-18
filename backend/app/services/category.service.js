const { ObjectId } = require("mongodb");
const { removeUndefined } = require("../utils/mongo.util");

class CategoryService {
  constructor(client) {
    this.Category = client.db().collection("TheLoai");
  }

  extractCategoryData(payload) {
    return removeUndefined({
      TenTheLoai: payload.TenTheLoai?.trim(),
      MoTa: payload.MoTa,
    });
  }

  async create(payload) {
    const category = this.extractCategoryData(payload);

    const existing = await this.Category.findOne({
      TenTheLoai: category.TenTheLoai,
    });

    if (existing) {
      return await this.update(existing.MaTheLoai, category);
    }

    category.MaTheLoai = new ObjectId();

    const result = await this.Category.insertOne(category);

    return { _id: result.insertedId, ...category };
  }

  async find(filter = {}) {
    return await this.Category.find(filter).toArray();
  }

  async findByName(name) {
    return await this.Category.find({
      TenTheLoai: { $regex: new RegExp(name, "i") },
    }).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Category.findOne({ MaTheLoai: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const update = this.extractCategoryData(payload);

    if (Object.keys(update).length === 0) {
      return await this.findById(id);
    }

    return await this.Category.findOneAndUpdate(
      { MaTheLoai: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Category.findOneAndDelete({
      MaTheLoai: new ObjectId(id),
    });
  }

  async deleteAll() {
    const result = await this.Category.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Category.find({}).toArray();
  }
}

module.exports = CategoryService;
