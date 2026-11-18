const ApiError = require("../api_error");
const BorrowService = require("../services/borrow.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.create(req.body);

    return res.status(201).send({
      message: "Lập phiếu mượn sách thành công.",
      data: result,
    });
  } catch (error) {
    console.error("Create borrow error:", error);
    return next(new ApiError(400, error.message || "Lỗi khi lập phiếu mượn sách."));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.findWithDetails();

    return res.send(result);
  } catch (error) {
    console.error("Find borrows error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách phiếu mượn."));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.findById(req.params.id);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }

    return res.send(result);
  } catch (error) {
    console.error("Find borrow error:", error);
    return next(new ApiError(500, "Lỗi khi lấy phiếu mượn."));
  }
};

exports.findByReader = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.findByReader(req.params.MaDocGia);

    return res.send(result);
  } catch (error) {
    if (error.message === "Mã độc giả không hợp lệ") {
      return next(new ApiError(400, error.message));
    }

    console.error("Find borrows by reader error:", error);
    return next(new ApiError(500, "Lỗi khi lấy lịch sử mượn sách."));
  }
};

exports.update = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.update(req.params.id, req.body);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }

    return res.send({
      message: "Cập nhật phiếu mượn thành công.",
      data: result,
    });
  } catch (error) {
    console.error("Update borrow error:", error);
    return next(new ApiError(400, error.message || "Lỗi khi cập nhật phiếu mượn."));
  }
};

exports.returnBook = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.returnBook(
      req.params.id,
      req.body.NgayTra || new Date()
    );

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }

    return res.send({
      message: "Trả sách thành công.",
      data: result,
    });
  } catch (error) {
    console.error("Return book error:", error);
    return next(new ApiError(400, error.message || "Lỗi khi trả sách."));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const borrowService = new BorrowService(MongoDB.client);
    const result = await borrowService.delete(req.params.id);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn."));
    }

    return res.send({
      message: "Xóa phiếu mượn thành công.",
    });
  } catch (error) {
    console.error("Delete borrow error:", error);
    return next(new ApiError(500, "Lỗi khi xóa phiếu mượn."));
  }
};
