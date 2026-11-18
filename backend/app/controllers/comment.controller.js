const ApiError = require("../api_error");
const CommentService = require("../services/comment.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  try {
    const { MaDocGia, MaSach, SoSao, NhanXet } = req.body;

    if (!MaDocGia || !MaSach) {
      return next(new ApiError(400, "Mã độc giả và mã sách là bắt buộc."));
    }

    if (SoSao !== undefined && (Number(SoSao) < 1 || Number(SoSao) > 5)) {
      return next(new ApiError(400, "Số sao phải từ 1 đến 5."));
    }

    const commentService = new CommentService(MongoDB.client);
    const comment = await commentService.create({
      MaDocGia,
      MaSach,
      SoSao,
      NhanXet,
    });

    return res.status(201).send({
      message: "Thêm đánh giá thành công.",
      data: comment,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return next(new ApiError(400, error.message || "Lỗi khi thêm đánh giá."));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);
    const comments = await commentService.findAll();

    return res.send(comments);
  } catch (error) {
    console.error("Find reviews error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách đánh giá."));
  }
};

exports.findByBook = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);
    const comments = await commentService.findByBookId(req.params.MaSach);

    return res.send(comments);
  } catch (error) {
    if (error.message === "Mã sách không hợp lệ") {
      return next(new ApiError(400, error.message));
    }

    console.error("Find reviews by book error:", error);
    return next(new ApiError(500, "Lỗi khi lấy đánh giá của sách."));
  }
};

exports.findByReader = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);
    const comments = await commentService.findByReaderId(req.params.MaDocGia);

    return res.send(comments);
  } catch (error) {
    if (error.message === "Mã độc giả không hợp lệ") {
      return next(new ApiError(400, error.message));
    }

    console.error("Find reviews by reader error:", error);
    return next(new ApiError(500, "Lỗi khi lấy đánh giá của độc giả."));
  }
};

exports.findOne = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);
    const comment = await commentService.findById(req.params.id);

    if (!comment) {
      return next(new ApiError(404, "Không tìm thấy đánh giá."));
    }

    return res.send(comment);
  } catch (error) {
    console.error("Find review error:", error);
    return next(new ApiError(500, "Lỗi khi lấy đánh giá."));
  }
};

exports.update = async (req, res, next) => {
  try {
    const { SoSao } = req.body;

    if (SoSao !== undefined && (Number(SoSao) < 1 || Number(SoSao) > 5)) {
      return next(new ApiError(400, "Số sao phải từ 1 đến 5."));
    }

    const commentService = new CommentService(MongoDB.client);
    const comment = await commentService.update(req.params.id, req.body);

    if (!comment) {
      return next(new ApiError(404, "Không tìm thấy đánh giá."));
    }

    return res.send({
      message: "Cập nhật đánh giá thành công.",
      data: comment,
    });
  } catch (error) {
    console.error("Update review error:", error);
    return next(new ApiError(400, error.message || "Lỗi khi cập nhật đánh giá."));
  }
};

exports.delete = async (req, res, next) => {
  try {
    const commentService = new CommentService(MongoDB.client);
    const comment = await commentService.delete(req.params.id);

    if (!comment) {
      return next(new ApiError(404, "Không tìm thấy đánh giá."));
    }

    return res.send({
      message: "Xóa đánh giá thành công.",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    return next(new ApiError(500, "Lỗi khi xóa đánh giá."));
  }
};
