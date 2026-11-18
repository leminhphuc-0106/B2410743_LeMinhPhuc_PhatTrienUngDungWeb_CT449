const ApiError = require("../api_error");
const FineService = require("../services/fine.service");
const MongoDB = require("../utils/mongodb.util");

const PAYMENT_STATUS = ["Chưa thanh toán", "Đã thanh toán"];

exports.create = async (req, res, next) => {
  try {
    const { MaNV, MaSach, MaDocGia, LyDoPhat, SoTienPhat, TrangThaiThanhToan } =
      req.body;

    if (!MaDocGia) {
      return next(new ApiError(400, "Mã độc giả là bắt buộc."));
    }

    if (
      TrangThaiThanhToan !== undefined &&
      !PAYMENT_STATUS.includes(TrangThaiThanhToan)
    ) {
      return next(
        new ApiError(
          400,
          `Trạng thái thanh toán phải là: ${PAYMENT_STATUS.join(", ")}`
        )
      );
    }

    const fineService = new FineService(MongoDB.client);
    const fine = await fineService.create({
      MaNV,
      MaSach,
      MaDocGia,
      LyDoPhat,
      SoTienPhat,
      TrangThaiThanhToan,
    });

    return res.status(201).send({
      message: "Lập phiếu phạt thành công.",
      data: fine,
    });
  } catch (error) {
    console.error("Create fine error:", error);
    return next(new ApiError(400, error.message || "Lỗi khi lập phiếu phạt."));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const fineService = new FineService(MongoDB.client);
    const fines = await fineService.findAll();

    return res.send(fines);
  } catch (error) {
    console.error("Find fines error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách phiếu phạt."));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const fineService = new FineService(MongoDB.client);
    const fine = await fineService.findById(req.params.id);

    if (!fine) {
      return next(new ApiError(404, "Không tìm thấy phiếu phạt."));
    }

    return res.send(fine);
  } catch (error) {
    console.error("Find fine error:", error);
    return next(new ApiError(500, "Lỗi khi lấy phiếu phạt."));
  }
};

exports.findByReader = async (req, res, next) => {
  try {
    const fineService = new FineService(MongoDB.client);
    const fines = await fineService.findByReaderId(req.params.MaDocGia);

    return res.send(fines);
  } catch (error) {
    if (error.message === "Mã độc giả không hợp lệ") {
      return next(new ApiError(400, error.message));
    }

    console.error("Find fines by reader error:", error);
    return next(new ApiError(500, "Lỗi khi lấy phiếu phạt của độc giả."));
  }
};

exports.update = async (req, res, next) => {
  try {
    const { TrangThaiThanhToan } = req.body;

    if (
      TrangThaiThanhToan !== undefined &&
      !PAYMENT_STATUS.includes(TrangThaiThanhToan)
    ) {
      return next(
        new ApiError(
          400,
          `Trạng thái thanh toán phải là: ${PAYMENT_STATUS.join(", ")}`
        )
      );
    }

    const fineService = new FineService(MongoDB.client);
    const fine = await fineService.update(req.params.id, req.body);

    if (!fine) {
      return next(new ApiError(404, "Không tìm thấy phiếu phạt."));
    }

    return res.send({
      message: "Cập nhật phiếu phạt thành công.",
      data: fine,
    });
  } catch (error) {
    console.error("Update fine error:", error);
    return next(new ApiError(400, error.message || "Lỗi khi cập nhật phiếu phạt."));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const fineService = new FineService(MongoDB.client);
    const fine = await fineService.delete(req.params.id);

    if (!fine) {
      return next(new ApiError(404, "Không tìm thấy phiếu phạt."));
    }

    return res.send({
      message: "Xóa phiếu phạt thành công.",
    });
  } catch (error) {
    console.error("Delete fine error:", error);
    return next(new ApiError(500, "Lỗi khi xóa phiếu phạt."));
  }
};
