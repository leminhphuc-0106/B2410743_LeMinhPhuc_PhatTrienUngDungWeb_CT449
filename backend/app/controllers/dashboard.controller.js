const ApiError = require("../api_error");
const DashboardService = require("../services/dashboard.service");
const MongoDB = require("../utils/mongodb.util");

exports.getOverview = async (req, res, next) => {
  try {
    const dashboardService = new DashboardService(MongoDB.client);
    const overview = await dashboardService.getOverview();

    return res.send(overview);
  } catch (error) {
    console.error("Get dashboard overview error:", error);
    return next(new ApiError(500, "Lỗi khi lấy dữ liệu thống kê."));
  }
};
