class DashboardService {
  constructor(client) {
    this.Reader = client.db().collection("DocGia");
    this.Book = client.db().collection("Sach");
    this.Borrow = client.db().collection("TheoDoiMuonSach");
    this.Comment = client.db().collection("DanhGiaSach");
    this.Fine = client.db().collection("PhieuPhat");
  }

  async getOverview() {
    const totalReaders = await this.Reader.countDocuments();
    const totalBooks = await this.Book.countDocuments();
    const totalBorrows = await this.Borrow.countDocuments();

    const totalFineResult = await this.Fine.aggregate([
      { $group: { _id: null, totalAmount: { $sum: "$SoTienPhat" } } },
    ]).toArray();
    const totalFines =
      totalFineResult.length > 0 ? totalFineResult[0].totalAmount : 0;

    const recentUsers = await this.Reader.find(
      {},
      { projection: { MatKhau: 0 } }
    )
      .sort({ _id: -1 })
      .limit(5)
      .toArray();

    const topBooks = await this.Comment.aggregate([
      {
        $group: {
          _id: "$MaSach",
          avgRating: { $avg: "$SoSao" },
          totalReviews: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, totalReviews: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "Sach",
          localField: "_id",
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
        $lookup: {
          from: "TacGia",
          localField: "sach.TacGia",
          foreignField: "MaTG",
          as: "tacGia",
        },
      },
      {
        $unwind: {
          path: "$tacGia",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          MaSach: "$sach.MaSach",
          TenSach: "$sach.TenSach",
          TenTG: "$tacGia.TenTG",
          avgRating: 1,
          totalReviews: 1,
        },
      },
    ]).toArray();

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const borrowStatsLast7Days = await this.Borrow.aggregate([
      {
        $match: {
          NgayMuon: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $project: {
          NgayMuon: {
            $dateToString: { format: "%Y-%m-%d", date: "$NgayMuon" },
          },
        },
      },
      {
        $group: {
          _id: "$NgayMuon",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    return {
      totalReaders,
      totalBooks,
      totalBorrows,
      totalFines,
      recentUsers,
      topBooks,
      borrowStatsLast7Days,
    };
  }
}

module.exports = DashboardService;
