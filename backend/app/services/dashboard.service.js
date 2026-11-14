
class DashboardService {
  constructor(client) {
    this.User = client.db().collection("Docgia");
    this.Book = client.db().collection("Sach");
    this.Borrow = client.db().collection("TheoDoiMuonSach");
    this.Author = client.db().collection("TacGia");
    this.Category = client.db().collection("TheLoai");
    this.Comment = client.db().collection("DanhGiaSach");
  }

  // Lấy các số liệu tổng quan cho Dashboard
  async getOverview() {
    // 1. Thống kê tổng quan
    const totalReaders = await this.User.countDocuments();
    const totalBooks = await this.Book.countDocuments();
    const totalBorrows = await this.Borrow.countDocuments();

    // 2. Lấy 5 độc giả mới nhất
    // Sắp xếp theo MaDocGia vì schema không có NgayTao
    const recentUsers = await this.User.find({})
      .sort({ MaDocGia: -1 })
      .limit(5)
      .toArray();

    // 3. Lấy 5 sách có đánh giá cao nhất
    const topBooks = await this.Comment.aggregate([
      // Nhóm đánh giá theo mã sách và tính điểm trung bình
      {
        $group: {
          _id: "$MaSach",
          avgRating: { $avg: "$SoSao" },
          totalReviews: { $sum: 1 },
        },
      },

      // Sắp xếp theo điểm trung bình và số lượt đánh giá
      {
        $sort: {
          avgRating: -1,
          totalReviews: -1,
        },
      },

      // Lấy 5 sách đầu tiên
      {
        $limit: 5,
      },

      // Nối với collection Sach
      {
        $lookup: {
          from: "Sach",
          localField: "_id",
          foreignField: "MaSach",
          as: "bookInfo",
        },
      },
      {
        $unwind: "$bookInfo",
      },

      // Nối với collection TacGia
      // Sach.TacGia là int, TacGia.MaTG cũng là int
      {
        $lookup: {
          from: "TacGia",
          localField: "bookInfo.TacGia",
          foreignField: "MaTG",
          as: "authorInfo",
        },
      },
      {
        $unwind: {
          path: "$authorInfo",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Chọn các trường cần hiển thị
      {
        $project: {
          MaSach: "$bookInfo.MaSach",
          TenSach: "$bookInfo.TenSach",
          avgRating: 1,
          totalReviews: 1,
          TenTG: "$authorInfo.TenTG",
        },
      },
    ]).toArray();

    // 4. Thống kê lượt mượn trong 7 ngày gần nhất
    const today = new Date();

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const borrowStatsLast7Days = await this.Borrow.aggregate([
      // Lọc phiếu mượn trong 7 ngày gần nhất
      {
        $match: {
          NgayMuon: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      // Định dạng ngày mượn
      {
        $project: {
          NgayMuon: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$NgayMuon",
            },
          },
        },
      },

      // Nhóm theo ngày và đếm số lượt mượn
      {
        $group: {
          _id: "$NgayMuon",
          count: { $sum: 1 },
        },
      },

      // Sắp xếp theo ngày tăng dần
      {
        $sort: {
          _id: 1,
        },
      },
    ]).toArray();

    // 5. Trả về dữ liệu Dashboard
    return {
      totalReaders,
      totalBooks,
      totalBorrows,
      totalFines: 0,
      recentUsers,
      topBooks,
      borrowStatsLast7Days,
    };
  }
}

module.exports = DashboardService;
