const ApiError = require("../api_error");
const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    if (!req.body.TenSach || !req.body.TenSach.trim()) {
      return next(new ApiError(400, "Tên sách là bắt buộc."));
    }

    const bookService = new BookService(MongoDB.client);
    const result = await bookService.create(req.body);

    return res.status(201).send({
      message: "Thêm sách thành công.",
      data: result,
    });
  } catch (error) {
    console.error("Create book error:", error);
    return next(new ApiError(500, "Lỗi khi thêm sách."));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const result = await bookService.findAll(req.query.MaTheLoai);

    return res.send(result);
  } catch (error) {
    if (error.message === "Mã thể loại không hợp lệ.") {
      return next(new ApiError(400, error.message));
    }

    console.error("Find books error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách sách."));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const result = await bookService.findById(req.params.id);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy sách."));
    }

    return res.send(result);
  } catch (error) {
    console.error("Find book error:", error);
    return next(new ApiError(500, "Lỗi khi tìm sách."));
  }
};

exports.findByTitle = async (req, res, next) => {
  try {
    const { TenSach } = req.query;

    if (!TenSach) {
      return next(new ApiError(400, "Vui lòng nhập tên sách cần tìm."));
    }

    const bookService = new BookService(MongoDB.client);
    const result = await bookService.findByTitle(TenSach);

    return res.send(result);
  } catch (error) {
    console.error("Find book by title error:", error);
    return next(new ApiError(500, "Lỗi khi tìm kiếm sách."));
  }
};

exports.update = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const result = await bookService.update(req.params.id, req.body);

    if (!result) {
      return next(new ApiError(404, "Không tìm thấy sách để cập nhật."));
    }

    return res.send({
      message: "Cập nhật sách thành công.",
      data: result,
    });
  } catch (error) {
    console.error("Update book error:", error);
    return next(new ApiError(500, "Lỗi khi cập nhật sách."));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const result = await bookService.delete(req.params.id);

    return res.send({
      message: "Xóa sách thành công.",
      data: result,
    });
  } catch (error) {
    if (error.message === "ID không hợp lệ.") {
      return next(new ApiError(400, error.message));
    }

    if (error.message === "Không thể xóa sách vì đã được mượn.") {
      return next(new ApiError(400, error.message));
    }

    if (error.message === "Không tìm thấy sách để xóa.") {
      return next(new ApiError(404, error.message));
    }

    console.error("Delete book error:", error);
    return next(new ApiError(500, "Lỗi khi xóa sách."));
  }
};

exports.deleteAll = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const deletedCount = await bookService.deleteAll();

    return res.send({
      message: `Đã xóa ${deletedCount} sách.`,
    });
  } catch (error) {
    console.error("Delete all books error:", error);
    return next(new ApiError(500, "Lỗi khi xóa danh sách sách."));
  }
};

exports.findWithDetails = async (req, res, next) => {
  try {
    const bookService = new BookService(MongoDB.client);
    const result = await bookService.findWithDetails();

    return res.send(result);
  } catch (error) {
    console.error("Find book details error:", error);
    return next(new ApiError(500, "Lỗi khi lấy thông tin chi tiết sách."));
  }
};
