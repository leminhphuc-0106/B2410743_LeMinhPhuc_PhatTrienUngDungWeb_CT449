const { ObjectId } = require("mongodb");
const { toObjectId, toDate, toNumber, removeUndefined } = require("../utils/mongo.util");

class CommentService {
  constructor(client) {
    this.Comment = client.db().collection("DanhGiaSach");
  }

  extractCommentData(payload) {
    return removeUndefined({
      MaDocGia: toObjectId(payload.MaDocGia) ?? undefined,
      MaSach: toObjectId(payload.MaSach) ?? undefined,
      SoSao: toNumber(payload.SoSao),
      NhanXet: payload.NhanXet,
      NgayDanhGia: toDate(payload.NgayDanhGia),
    });
  }

  async create(payload) {
    const comment = this.extractCommentData(payload);

    if (!comment.MaDocGia) {
      throw new Error("Mã độc giả không hợp lệ");
    }

    if (!comment.MaSach) {
      throw new Error("Mã sách không hợp lệ");
    }

    if (comment.SoSao === undefined) comment.SoSao = 5;
    if (comment.NgayDanhGia === undefined) comment.NgayDanhGia = new Date();

    comment.MaDanhGia = new ObjectId();

    const result = await this.Comment.insertOne(comment);

    return { _id: result.insertedId, ...comment };
  }

  async find(filter = {}) {
    return await this.Comment.find(filter).toArray();
  }

  detailPipeline(filter = {}) {
    return [
      { $match: filter },
      {
        $lookup: {
          from: "DocGia",
          localField: "MaDocGia",
          foreignField: "MaDocGia",
          as: "docGia",
        },
      },
      {
        $unwind: {
          path: "$docGia",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "Sach",
          localField: "MaSach",
          foreignField: "MaSach",
          as: "sach",
        },
      },
      {
        $unwind: {
          path: "$sach",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          MaDanhGia: 1,
          MaDocGia: 1,
          MaSach: 1,
          SoSao: 1,
          NhanXet: 1,
          NgayDanhGia: 1,
          HoLot: "$docGia.HoLot",
          Ten: "$docGia.Ten",
          Email: "$docGia.Email",
          TenSach: "$sach.TenSach",
        },
      },
      { $sort: { NgayDanhGia: -1 } },
    ];
  }

  async findByBookId(MaSach) {
    const maSach = toObjectId(MaSach);

    if (!maSach) {
      throw new Error("Mã sách không hợp lệ");
    }

    return await this.Comment.aggregate(
      this.detailPipeline({ MaSach: maSach })
    ).toArray();
  }

  async findByReaderId(MaDocGia) {
    const maDocGia = toObjectId(MaDocGia);

    if (!maDocGia) {
      throw new Error("Mã độc giả không hợp lệ");
    }

    return await this.Comment.aggregate(
      this.detailPipeline({ MaDocGia: maDocGia })
    ).toArray();
  }

  async findById(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Comment.findOne({ MaDanhGia: new ObjectId(id) });
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) return null;

    const update = this.extractCommentData(payload);

    delete update.MaDanhGia;

    if (Object.keys(update).length === 0) {
      return await this.findById(id);
    }

    return await this.Comment.findOneAndUpdate(
      { MaDanhGia: new ObjectId(id) },
      { $set: update },
      { returnDocument: "after" }
    );
  }

  async delete(id) {
    if (!ObjectId.isValid(id)) return null;

    return await this.Comment.findOneAndDelete({
      MaDanhGia: new ObjectId(id),
    });
  }

  async deleteAll() {
    const result = await this.Comment.deleteMany({});
    return result.deletedCount;
  }

  async findAll() {
    return await this.Comment.aggregate(this.detailPipeline()).toArray();
  }
}

module.exports = CommentService;
